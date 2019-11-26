# @leeboyin/sku-calculator

[![npm (scoped)](https://img.shields.io/npm/v/@leeboyin/sku-calculator.svg)](https://www.npmjs.com/package/@leeboyin/sku-calculator)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/@leeboyin/sku-calculator.svg)](https://www.npmjs.com/package/@leeboyin/sku-calculator)

Calculate valid sku, amount and price by selected specs.

## Install

```
$ npm install @leeboyin/sku-calculator
```

## Usage

```js
const skuCalculator = require("@leeboyin/sku-calculator");
new skuCalculator({
    specs,
    skus,
    primarySpecs,
    hasAmount,
    multiSpecs
});

skuCalculator.setSelectionArray(selectionArray);
console.log(skuCalculator.specStatus);
console.log(skuCalculator.statistics);
console.log(skuCalculator.selectionSpecStatus);
```
