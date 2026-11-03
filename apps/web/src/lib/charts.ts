/** Small helpers shared by the SVG charts. */

import { formatDecimal } from "@/lib/format";

/** A bin edge without floating-point noise, e.g. 33.900000000000006 becomes "33.9". */
export function formatEdge(value: number): string {
  return String(Math.round(value * 100) / 100).replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ",",
  );
}

/** A correlation with a proper minus sign, e.g. -0.3 becomes "−0.30". */
export function formatR(value: number): string {
  return formatDecimal(value);
}
