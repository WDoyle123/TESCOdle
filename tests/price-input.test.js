const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalisePriceInput,
  filterPriceInput,
} = require("../scripts/price-input.js");

test("normalisePriceInput handles empty input", () => {
  assert.equal(normalisePriceInput(""), "");
  assert.equal(normalisePriceInput("   "), "");
});

test("normalisePriceInput converts comma decimal to dot", () => {
  assert.equal(normalisePriceInput("1,99"), "1.99");
});

test("normalisePriceInput preserves dot decimals", () => {
  assert.equal(normalisePriceInput("2.50"), "2.50");
});

test("filterPriceInput strips non-numeric characters except dot and comma", () => {
  assert.equal(filterPriceInput(" 1a,2b.3 "), "1,2.3");
});
