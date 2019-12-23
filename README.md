# @leeboyin/sku-calculator

[![npm (scoped)](https://img.shields.io/npm/v/@leeboyin/sku-calculator.svg)](https://www.npmjs.com/package/@leeboyin/sku-calculator)

Calculate valid sku, amount, price and detail status of each spec according to selected specs.

## Install

```
$ npm install @leeboyin/sku-calculator
```

## Usage
```js
// load SkuCalculator into project
import { SkuCalculator } from '@kkday/js-lib';

// specs
const specs = {
	depart: [
		'Taipei',
		'Kaohsiung',
	],
	arrive: [
		'Taipei',
		'Kaohsiung',
	],
	age: [
		'adult',
		'child',
	],
};

// skus composed with spec combination, amount and price
const skus = [
	{
		spec: {
			age: 'adult',
			depart: 'Taipei',
			arrive: 'Kaohsiung'
		},
		amount: 5,
		price: 1000,
	},
	{
		spec: {
			age: 'child',
			depart: 'Taipei',
			arrive: 'Kaohsiung'
		},
		amount: 3,
		price: 500,
	},
	{
        spec: {
            age: 'adult',
            depart: 'Kaohsiung',
            arrive: 'Taipei'
        },
        amount: 4,
        price: 800,
    },
    {
        spec: {
            age: 'child',
            depart: 'Kaohsiung',
            arrive: 'Taipei'
        },
        amount: 2,
        price: 400,
    },
];

// define which spec(s) make sku(s) primary
const primarySpecs = {
	age: 'adult'
};

// skus data contain amount or not
const hasAmount = true;

// define which spec(s) can be selected with multiple values
const multiSpecs = ['age'];

// create SkuCalculator instance
const skuCalculator = new SkuCalculator({
    specs,
    skus,
    primarySpecs,
    hasAmount,
    multiSpecs
});

// set selected specs
const selectionArray = [
	{
		amount: 2,
		spec: {
			age: 'adult',
			depart: 'Taipei',
			arrive: 'Kaohsiung',
		},
	},
	{
		amount: 3,
        spec: {
            age: 'child',
            depart: 'Taipei',
            arrive: 'Kaohsiung',
        },
	}
];
skuCalculator.setSelectionArray(selectionArray);

// print calculation result
console.log(skuCalculator.specStatus);
console.log(skuCalculator.statistics);
console.log(skuCalculator.selectionSpecStatus);
```
