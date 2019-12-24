# @leeboyin/sku-calculator

[![npm (scoped)](https://img.shields.io/npm/v/@leeboyin/sku-calculator.svg)](https://www.npmjs.com/package/@leeboyin/sku-calculator)

Calculate valid sku, amount, price and detail status of each spec according to selected specs. A front-end JS algorithm for E-commerce product websites.

## Demo
A demo is worth a thousand words.
[sku calculator demo, iPhone specs as example](https://sku-calculator-demo.firebaseapp.com/)

## Install

```
$ npm install @leeboyin/sku-calculator
```
## Input Data
### specs
Define specs that make stock keeping units, such as color, capacity of mobile phone, or departure and arrival stations of train tickets.
 - type: Object
 - set spec names as object keys
 - set spec options in arrays as object values

### skus
Stock keeping units, an array of selling units of your products. SKUs are made with combinations of each spec, amount and corresponding price.

 - type: Array of sku Objects


### primarySpecs
Define which spec option(s) are regarded as primary, those SKUs with primary specs are seens as primary SKUs. For example, adult is usually a primary spec if there are several types of ticket for different ages.
There are statistics and status for primary SKUs in the calculation result, which exclude non-primary SKUs in the equations.

 - type: Object

### hasAmount
Define if **amount** is set in **skus**. If amount is set, insufficient SKUs are filtered from the equation when the **amount** in **selectionArray**  is larger than the amounts of skus.

 - type: Boolean
 - default: false

### multiSpecs
Define which spec(s) can be selected with multiple values, useful when your users need to order several SKUs at one time. For example, buy two phones of same model in different colors in one order. The  statistics and status in the calculation result is the intersection of all selections in **selectionArray**.

 - type: Array

## Method
### setSelectionArray
Set selection(s) to the skuCalculator instance, then the output data **specStatus**, **statistics** and **selectionSpecStatus** will be updated.
Set spec options and amount selected by your customers in each selection object. Spec options can be partial or complete. Set null to unselected specs. Amount is required if **hasAmount** is true.

## Output Data
### specStatus
Status of each spec option, changes according to **selectionArray** dynamically.
Status includes:
 - selectable
 - maxAmount
 - insufficient
 - lowestPrice
 - lowestPricePrimary
 - lowestPriceTotal
 - highestPrice
 - highestPricePrimary
 - highestPriceTotal
 - cheapestSkusIdx


### statistics
Statistics contains calculation result of all specs, changes according to **selectionArray** dynamically.
Statistics includes:
 - maxAmount
 - lowestPrice
 - lowestPricePrimary
 - lowestPriceTotal
 - highestPrice
 - highestPricePrimary
 - highestPriceTotal
 - determinedAmount
 - validSkusIdx
 - cheapestSkusIdx

### selectionSpecStatus
  **specStatus** of each selection in **selectionArray**. You can get status of specs of each selection, result without intersection.

## Usage Example
```js
// load SkuCalculator into project
import SkuCalculator from '@leeboyin/sku-calculator';

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

// sku objects made with spec combination, amount and price
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

// set selected specs and amount (selected by your customers)
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
