/** Number formatting shared by the report sections. */

export function formatInt(value: number): string {
  return value.toLocaleString("en-US");
}

/** A fraction between 0 and 1 as a percentage, e.g. 0.0915 becomes "9.2%". */
export function formatPercent(fraction: number, digits = 1): string {
  return `${(fraction * 100).toFixed(digits)}%`;
}

/** A fixed number of decimals with a proper minus sign, e.g. -0.5 becomes "−0.50". */
export function formatDecimal(value: number, digits = 2): string {
  return value.toFixed(digits).replace("-", "−");
}

/** Whole numbers stay whole; everything else gets two decimals. */
export function formatValue(value: number | string): string {
  if (typeof value === "string") return value;
  return Number.isInteger(value) ? formatInt(value) : value.toFixed(2);
}
