"use client";

import { useState } from "react";

import { CoefficientTable } from "@/components/report/model/CoefficientTable";
import { ForestPlot } from "@/components/report/model/ForestPlot";
import {
  ScaleToggle,
  type OddsScale,
} from "@/components/report/model/ScaleToggle";
import { formatOddsRatio } from "@/lib/format";
import type { Coefficient, Term } from "@/lib/report/types";

/** One term, ready to draw in whichever unit is chosen. */
export type OddsRow = {
  term: string;
  label: string;
  step: string | null; // e.g. "per SD (8.6 years)"; null for binary and level terms
  or: number;
  lo: number;
  hi: number;
  /** The same odds ratio in the other unit, for hover. Null when the toggle changes nothing. */
  alternate: string | null;
  significant: boolean;
  group: string | null; // letter of a related group from section 04
  fragile: boolean; // the evidence changes with complete rows only
};

/**
 * Holds the unit choice so the forest plot and the table can never disagree.
 * The only stateful piece of the section; everything around it is static.
 */
export function OddsRatioView({
  terms,
  coefficients,
  intercept,
  groupOf,
  fragile,
}: {
  terms: Term[];
  coefficients: Coefficient[];
  intercept: number;
  groupOf: Record<string, string>;
  fragile: string[];
}) {
  const [scale, setScale] = useState<OddsScale>("std");

  const rows: OddsRow[] = coefficients.map((c) => {
    const term = terms.find((t) => t.name === c.term);
    const continuous = term?.kind === "continuous";
    const std = scale === "std";
    const other = std
      ? { step: term?.perUnit, or: c.orRaw, lo: c.orRawLo, hi: c.orRawHi }
      : { step: term?.perSd, or: c.orStd, lo: c.orStdLo, hi: c.orStdHi };

    return {
      term: c.term,
      label: c.label,
      step: continuous ? ((std ? term?.perSd : term?.perUnit) ?? null) : null,
      or: std ? c.orStd : c.orRaw,
      lo: std ? c.orStdLo : c.orRawLo,
      hi: std ? c.orStdHi : c.orRawHi,
      alternate: continuous
        ? `${other.step}: OR ${formatOddsRatio(other.or)} (${formatOddsRatio(other.lo)} to ${formatOddsRatio(other.hi)})`
        : null,
      significant: c.significant,
      group: term ? (groupOf[term.column] ?? null) : null,
      fragile: fragile.includes(c.term),
    };
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Odds ratios</h3>
          <p className="text-ink-muted mt-1 max-w-xl text-sm">
            Above 1, higher odds of the outcome; below 1, lower. Per 1 SD puts
            measurements on one footing; per unit uses their own scale. Groups
            are always against their reference.
          </p>
        </div>
        <ScaleToggle value={scale} onChange={setScale} />
      </div>

      <div className="mt-4 space-y-6">
        <ForestPlot rows={rows} />
        <CoefficientTable
          rows={rows}
          coefficients={coefficients}
          intercept={intercept}
        />
      </div>
    </div>
  );
}
