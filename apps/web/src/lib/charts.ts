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

/** Odds-ratio axis ticks: 1, 2 and 5 in each decade the domain covers, e.g. 0.5, 1, 2, 5. */
export function oddsRatioTicks(min: number, max: number): number[] {
  const ticks: number[] = [];
  const first = Math.floor(Math.log10(min));
  const last = Math.ceil(Math.log10(max));
  for (let decade = first; decade <= last; decade++) {
    for (const step of [1, 2, 5]) {
      // Rounded so 2 × 0.1 prints as 0.2, not 0.20000000000000001.
      const tick = Number((step * 10 ** decade).toPrecision(1));
      if (tick >= min && tick <= max) ticks.push(tick);
    }
  }
  return ticks;
}
