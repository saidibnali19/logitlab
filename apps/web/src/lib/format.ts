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

/** A signed change as a percentage, e.g. -0.233 becomes "−23.3%" and 0.048 becomes "+4.8%". */
export function formatChange(fraction: number, digits = 1): string {
  const sign = fraction < 0 ? "−" : "+";
  return `${sign}${formatPercent(Math.abs(fraction), digits)}`;
}

/** An odds ratio, with a third decimal near 1 so 1.002 never shows as a flat "1.00". */
export function formatOddsRatio(value: number): string {
  return value.toFixed(Math.abs(value - 1) < 0.01 ? 3 : 2);
}

/** A p-value on its own, e.g. "0.022", or "< 0.001" once it is tiny. */
export function formatPValue(p: number): string {
  return p < 0.001 ? "< 0.001" : p.toFixed(3);
}

/** A p-value in a sentence, e.g. "p = 0.022" or "p < 0.001". */
export function formatP(p: number): string {
  return p < 0.001 ? "p < 0.001" : `p = ${formatPValue(p)}`;
}

/** Whole numbers stay whole; everything else gets two decimals. */
export function formatValue(value: number | string): string {
  if (typeof value === "string") return value;
  return Number.isInteger(value) ? formatInt(value) : value.toFixed(2);
}
