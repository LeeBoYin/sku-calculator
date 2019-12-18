module.exports = function(options) {
	const specs = options.specs || {};
	const skus = options.skus || [];
	const primarySpecs = options.primarySpecs || null;
	const hasAmount = options.hasAmount || false;
	const multiSpecs = options.multiSpecs || [];

	let selectionArray = [];
	const specStatus = {};
	const statistics = {};

	const statisticsOfAll = {
		maxAmount: hasAmount ? 0 : null,
		lowestPrice: null,
		lowestPricePrimary: null,
		highestPrice: null,
		highestPricePrimary: null,
		validSkusIdx: _.keys(skus),
		cheapestSkusIdx: [],
	};

	const statisticsOfSpecDefault = {
		selectable: false,
		maxAmount: hasAmount ? 0 : null,
		insufficient: hasAmount ? true : null,
		lowestPrice: null,
		lowestPricePrimary: null,
		highestPrice: null,
		highestPricePrimary: null,
		cheapestSkusIdx: [],
	};

	const statisticsOfSpec = {};
	_.forEach(skus, (sku, skuIdx) => {
		sku.isPrimary = checkIsSkuPrimary(sku);

		// 計算每個 spec value 的初始統計
		_.forEach(sku.spec, (specValue, specName) => {
			// init data structure
			if(_.isNil(statisticsOfSpec[specName])) {
				statisticsOfSpec[specName] = {};
			}
			if(_.isNil(statisticsOfSpec[specName][specValue])) {
				statisticsOfSpec[specName][specValue] = _.clone(statisticsOfSpecDefault);
			}

			const statisticsOfThisSpec = statisticsOfSpec[specName][specValue];

			if(hasAmount) {
				if(sku.amount) {
					statisticsOfThisSpec.selectable = true;
					statisticsOfThisSpec.insufficient = false;
				}
				if(sku.amount > statisticsOfThisSpec.maxAmount) {
					statisticsOfThisSpec.maxAmount = sku.amount;
				}
				if(sku.amount > statisticsOfAll.maxAmount) {
					statisticsOfAll.maxAmount = sku.amount;
				}
			} else {
				statisticsOfThisSpec.selectable = true;
			}

			if(_.isNil(statisticsOfThisSpec.lowestPrice) || sku.price < statisticsOfThisSpec.lowestPrice) {
				statisticsOfThisSpec.lowestPrice = sku.price;
				statisticsOfThisSpec.cheapestSkusIdx = [skuIdx];
			} else if(_.isNil(statisticsOfThisSpec.lowestPrice) || sku.price === statisticsOfThisSpec.lowestPrice) {
				statisticsOfThisSpec.cheapestSkusIdx.push(skuIdx);
				statisticsOfThisSpec.cheapestSkusIdx = _.uniq(statisticsOfThisSpec.cheapestSkusIdx);
			}
			if(_.isNil(statisticsOfAll.lowestPrice) || sku.price < statisticsOfAll.lowestPrice) {
				statisticsOfAll.lowestPrice = sku.price;
				statisticsOfAll.cheapestSkusIdx = [skuIdx];
			} else if(_.isNil(statisticsOfAll.lowestPrice) || sku.price === statisticsOfAll.lowestPrice) {
				statisticsOfAll.cheapestSkusIdx.push(skuIdx);
				statisticsOfAll.cheapestSkusIdx = _.uniq(statisticsOfAll.cheapestSkusIdx);
			}
			if(_.isNil(statisticsOfThisSpec.highestPrice) || sku.price > statisticsOfThisSpec.highestPrice) {
				statisticsOfThisSpec.highestPrice = sku.price;
			}
			if(_.isNil(statisticsOfAll.highestPrice) || sku.price > statisticsOfAll.highestPrice) {
				statisticsOfAll.highestPrice = sku.price;
			}

			// primary price
			if(sku.isPrimary) {
				// lowest price primary
				if(_.isNil(statisticsOfThisSpec.lowestPricePrimary) || sku.price < statisticsOfThisSpec.lowestPricePrimary) {
					statisticsOfThisSpec.lowestPricePrimary = sku.price;
				}
				if(_.isNil(statisticsOfAll.lowestPricePrimary) || sku.price < statisticsOfAll.lowestPricePrimary) {
					statisticsOfAll.lowestPricePrimary = sku.price;
				}
				// highest price primary
				if(_.isNil(statisticsOfThisSpec.highestPricePrimary) || sku.price > statisticsOfThisSpec.highestPricePrimary) {
					statisticsOfThisSpec.highestPricePrimary = sku.price;
				}
				if(_.isNil(statisticsOfAll.highestPricePrimary) || sku.price > statisticsOfAll.highestPricePrimary) {
					statisticsOfAll.highestPricePrimary = sku.price;
				}
			}
		});
	});

	const statisticsDefault = {
		maxAmount: null,
		lowestPrice: null,
		lowestPricePrimary: null,
		highestPrice: null,
		highestPricePrimary: null,
		determinedAmount: null,
		validSkusIdx: statisticsOfAll.validSkusIdx,
		cheapestSkusIdx: statisticsOfAll.cheapestSkusIdx,
	};

	function checkIsSkuPrimary(sku) {
		return primarySpecs ? _.every(primarySpecs, (specValue, specName) => {
			return sku.spec[specName] === specValue;
		}) : false;
	}

	function refresh() {
		// 每個 selection 建立一套 spec status 的統計結果
		const selectionStatus = {};
		// 每個 selection 建立一套 valid sku idx
		const validSkusIdx = {};
		// 記錄完全符合 selection 的 sku
		const determinedAmount = {};
		_.forEach(selectionArray, (selection, selectionIdx) => {
			selectionStatus[selectionIdx] = {};
			validSkusIdx[selectionIdx] = [];
			_.forEach(specs, (values, specName) => {
				selectionStatus[selectionIdx][specName] = {};
				_.forEach(values, (specValue) => {
					selectionStatus[selectionIdx][specName][specValue] = _.clone(statisticsOfSpecDefault);
				});
			});
		});

		// 比對每個 sku
		// scan all possible sku
		_.forEach(skus, (sku, skuIdx) => {
			// scan all selection sku combinations
			_.forEach(selectionArray, (selection, selectionIdx) => {
				const isAllMatch = _.every(selection.spec, (specValue, specName) => {
					return !_.isNil(specValue) && specValue === sku.spec[specName];
				});
				if(isAllMatch) {
					determinedAmount[skuIdx] = selection.amount;
				}

				let isSkuSufficient = true;
				if(hasAmount) {
					// 跳過數量不足的 sku
					if(!sku.amount) {
						isSkuSufficient = false;
					} else {
						let isNeedCheckAmount = false;
						if(_.isEmpty(multiSpecs)) {
							isNeedCheckAmount = true;
						} else {
							// multiSpecs 必須吻合才做數量判斷
							isNeedCheckAmount = _.every(multiSpecs, (specName) => {
								return _.isNil(selection.spec[specName]) || selection.spec[specName] === sku.spec[specName];
							});
						}

						// 如果 selection 已經有決定數量，要看此 sku 是否有足夠數量
						if(isNeedCheckAmount && sku.amount < selection.amount) {
							// 此 sku 符合目前這個 selection 的 spec 條件，但是數量不足
							isSkuSufficient = false;
						}
					}
				}

				let isSkuValidByThisSelection = false;
				_.forEach(_.keys(specs), (specName) => {
					const specValue = sku.spec[specName];

					// 符合其他 spec 的 sku 就算是 valid
					// 這個 spec 其他選項能不能選，由其他 spec 來決定
					const otherSpecs = _.reduce(selection.spec, (result, value, key) => {
						if(key !== specName && !_.isNil(value)) {
							result[key] = value;
						}
						return result;
					}, {});

					// check if other specs match current selection
					const isOtherSpecsValid = _.isEmpty(otherSpecs) || _.every(otherSpecs, (otherSpecValue, otherSpecName) => {
						return otherSpecValue === sku.spec[otherSpecName];
					});

					if(!isOtherSpecsValid) {
						return;
					}

					// 只要有一個 spec 被排除後，其他 spec 符合 selection 條件，就算是這個 sku 可以被選取
					isSkuValidByThisSelection = true;

					const statusOfThisSelection = selectionStatus[selectionIdx][specName][specValue];
					statusOfThisSelection.selectable = true;

					// is insufficient
					if(hasAmount) {
						if(!isSkuSufficient) {
							// 數量不足時，不計算其他統計
							return;
						}

						// 只要有一個 sku 數量足夠，這個 spec 就是 sufficient
						statusOfThisSelection.insufficient = false;
					}

					// max amount
					if(hasAmount && sku.amount > statusOfThisSelection.maxAmount) {
						statusOfThisSelection.maxAmount = sku.amount;
					}

					// lowest price
					if(_.isNil(statusOfThisSelection.lowestPrice) || sku.price < statusOfThisSelection.lowestPrice) {
						statusOfThisSelection.lowestPrice = sku.price;
						statusOfThisSelection.cheapestSkusIdx = [skuIdx];
					} else if(sku.price === statusOfThisSelection.lowestPrice) {
						statusOfThisSelection.cheapestSkusIdx.push(skuIdx);
						statusOfThisSelection.cheapestSkusIdx = _.uniq(statusOfThisSelection.cheapestSkusIdx);
					}

					// highest price
					if(_.isNil(statusOfThisSelection.highestPrice) || sku.price > statusOfThisSelection.highestPrice) {
						statusOfThisSelection.highestPrice = sku.price;
					}

					if(sku.isPrimary) {
						// lowest price
						if(_.isNil(statusOfThisSelection.lowestPricePrimary) || sku.price < statusOfThisSelection.lowestPricePrimary) {
							statusOfThisSelection.lowestPricePrimary = sku.price;
						}

						// highest price
						if(_.isNil(statusOfThisSelection.highestPricePrimary) || sku.price > statusOfThisSelection.highestPricePrimary) {
							statusOfThisSelection.highestPricePrimary = sku.price;
						}
					}
				});

				if(!isSkuValidByThisSelection) {
					return;
				}

				validSkusIdx[selectionIdx].push(skuIdx);
			});
		});

		// compute specStatus
		_.forEach(specs, (values, specName) => {
			specStatus[specName] = {};
			_.forEach(values, (specValue) => {
				// reset sku status
				const statusOfThisSpec = specStatus[specName][specValue] = _.clone(_.get(statisticsOfSpec, [specName, specValue], statisticsOfSpecDefault));

				if(_.isEmpty(selectionStatus)) {
					return;
				}

				// selectable: spec is selectable if all spec is valid for all selection conditions
				statusOfThisSpec.selectable = _.every(selectionStatus, (status) => {
					return status[specName][specValue].selectable;
				});

				// 組合不存在
				if(!statusOfThisSpec.selectable) {
					_.forEach(statusOfThisSpec, (value, key) => {
						if(key !== 'selectable') {
							statusOfThisSpec[key] = null;
						}
					});
					return;
				}

				if(hasAmount) {
					// is insufficient
					statusOfThisSpec.insufficient = _.some(selectionStatus, (status) => {
						return status[specName][specValue].insufficient;
					});

					// max amount
					statusOfThisSpec.maxAmount = _.get(_.minBy(_.values(selectionStatus), (status) => {
						return status[specName][specValue].maxAmount;
					}), [specName, specValue, 'maxAmount'], 0);
				}

				// lowest price
				statusOfThisSpec.lowestPrice = _.min(_.map(selectionStatus, (status) => {
					return status[specName][specValue].lowestPrice;
				})) || statusOfThisSpec.lowestPrice;

				// highest price
				statusOfThisSpec.highestPrice = _.max(_.map(selectionStatus, (status) => {
					return status[specName][specValue].highestPrice;
				})) || statusOfThisSpec.highestPrice;

				// lowest price primary
				statusOfThisSpec.lowestPricePrimary = _.min(_.map(selectionStatus, (status) => {
					return status[specName][specValue].lowestPricePrimary;
				})) || statusOfThisSpec.lowestPricePrimary;

				// highest price primary
				statusOfThisSpec.highestPricePrimary = _.max(_.map(selectionStatus, (status) => {
					return status[specName][specValue].highestPricePrimary;
				})) || statusOfThisSpec.highestPricePrimary;

				// cheapest skus idx
				statusOfThisSpec.cheapestSkusIdx = _.union(..._.map(_.filter(_.values(selectionStatus), (status) => {
					return status[specName][specValue].lowestPrice === statusOfThisSpec.lowestPrice;
				}), (status) => {
					return _.get(status, [specName, specValue, 'cheapestSkusIdx'], []);
				}));
			});
		});

		// compute statistics
		// reset default
		_.assign(statistics, statisticsDefault);
		if(_.isEmpty(selectionArray)) {
			_.assign(statistics, statisticsOfAll);
		} else {
			_.forEach(selectionArray, (selection, selectionIdx) => {
				// 所有 selection spec max amount 的最小值
				if(hasAmount) {
					// maxAmount: 一個 selection 的 selection specs 取 min，每個 selection 之中取 max
					const maxAmountOfSelection = _.min([statisticsOfAll.maxAmount, ..._.map(selection.spec, (specValue, specName) => {
						return _.get(specStatus, [specName, specValue, 'maxAmount'], null);
					})]);
					statistics.maxAmount = _.max([maxAmountOfSelection, statistics.maxAmount]);
				}

				// lowestPrice: 一個 selection 的 selection specs 取 max，每個 selection 之中取 min
				const lowestPriceOfSelection = _.max([statisticsOfAll.lowestPrice, ..._.map(selection.spec, (specValue, specName) => {
					return _.get(specStatus, [specName, specValue, 'lowestPrice'], null);
				})]);
				if(!_.every(selection.spec, _.isNil) && !_.isNil(lowestPriceOfSelection)) {
					// cheapest skus idx
					const cheapestSkusIdx = _.reduce(selection.spec, (result, specValue, specName) => {
						if(_.get(specStatus, [specName, specValue, 'lowestPrice']) === lowestPriceOfSelection) {
							result = _.uniq(result.concat(_.get(specStatus, [specName, specValue, 'cheapestSkusIdx'])));
						}
						return result;
					}, []);

					if(_.isNil(statistics.lowestPrice) || lowestPriceOfSelection < statistics.lowestPrice) {
						statistics.cheapestSkusIdx = cheapestSkusIdx;
					} else if(lowestPriceOfSelection === statistics.lowestPrice) {
						statistics.cheapestSkusIdx = _.uniq(statistics.cheapestSkusIdx.concat(cheapestSkusIdx));
					}
				}
				statistics.lowestPrice = _.min([lowestPriceOfSelection, statistics.lowestPrice]);

				// highestPrice: 一個 selection 的 selection specs 取 min，每個 selection 之中取 max
				const highestPriceOfSelection = _.min([statisticsOfAll.highestPrice, ..._.map(selection.spec, (specValue, specName) => {
					return _.get(specStatus, [specName, specValue, 'highestPrice'], null);
				})]);
				statistics.highestPrice = _.max([highestPriceOfSelection, statistics.highestPrice]);

				const isSelectionPrimary = primarySpecs && _.every(selection.spec, (specValue, specName) => {
					return _.isNil(specValue) || _.isNil(primarySpecs[specName]) || primarySpecs[specName] === specValue;
				});
				if(isSelectionPrimary) {
					// lowestPricePrimary: 一個 selection 的 selection specs 取 max，每個 selection 之中取 min
					const lowestPricePrimaryOfSelection = _.max(_.map(selection.spec, (specValue, specName) => {
						return _.get(specStatus, [specName, specValue, 'lowestPricePrimary']);
					}));
					statistics.lowestPricePrimary = _.min([lowestPricePrimaryOfSelection, statistics.lowestPricePrimary]);

					// highestPricePrimary: 一個 selection 的 selection specs 取 min，每個 selection 之中取 max
					const highestPricePrimaryOfSelection = _.min(_.map(selection.spec, (specValue, specName) => {
						return _.get(specStatus, [specName, specValue, 'highestPricePrimary']);
					}));
					statistics.highestPricePrimary = _.max([highestPricePrimaryOfSelection, statistics.highestPricePrimary]);
				}
			});
		}

		// validSkusIdx: 所有 selection valid sku 的交集
		statistics.validSkusIdx = _.intersection(..._.values(validSkusIdx));
		statistics.determinedAmount = determinedAmount;
	}

	// init
	refresh();

	// public properties
	this.setSelectionArray = function(_selectionArray) {
		selectionArray = _selectionArray;
		refresh();
	};
	this.specStatus = specStatus;
	this.statistics = statistics;
};
