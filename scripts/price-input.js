function normalisePriceInput(rawValue) {
  const trimmed = rawValue.trim();
  if (trimmed === "") return "";
  return trimmed.replace(/,/g, ".");
}

function filterPriceInput(rawValue) {
  return rawValue.replace(/[^0-9.,]/g, "");
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { normalisePriceInput, filterPriceInput };
} else if (typeof window !== "undefined") {
  window.normalisePriceInput = normalisePriceInput;
  window.filterPriceInput = filterPriceInput;
}
