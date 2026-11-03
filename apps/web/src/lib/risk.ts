/**
 * The what-if maths, kept apart from React so it can be read and checked on
 * its own. Everything comes from the result's ingredients; nothing is fitted here.
 */

import type { WhatIf, WhatIfControl } from "@/lib/report/types";

const Z_95 = 1.959964;

/** Each control's value: the slider position, or the index of the chosen option. */
export type Values = Record<string, number>;

export function typicalValues(whatIf: WhatIf): Values {
  return Object.fromEntries(whatIf.controls.map((c) => [c.column, c.default]));
}

/** The term a control switches on, or null for the reference option. */
function chosenTerm(control: WhatIfControl, value: number): string | null {
  return control.options?.[value]?.term ?? null;
}

/** One row of the design matrix, in the covariance's term order ("const" first). */
function designRow(whatIf: WhatIf, values: Values): number[] {
  const x = new Map<string, number>();
  for (const control of whatIf.controls) {
    const value = values[control.column];
    if (control.kind === "slider") {
      // A continuous term is named after its column.
      x.set(control.column, value);
    } else {
      const term = chosenTerm(control, value);
      if (term) x.set(term, 1);
    }
  }
  return whatIf.covariance.terms.map((t) =>
    t === "const" ? 1 : (x.get(t) ?? 0),
  );
}

const toRisk = (logOdds: number) => 1 / (1 + Math.exp(-logOdds));

export type Prediction = {
  logOdds: number;
  risk: number;
  lo: number; // 95% interval for the model's estimate, not for one person's outcome
  hi: number;
};

export function predict(whatIf: WhatIf, values: Values): Prediction {
  const row = designRow(whatIf, values);
  const { terms, matrix } = whatIf.covariance;

  const logOdds = terms.reduce(
    (sum, t, i) =>
      sum + row[i] * (t === "const" ? whatIf.intercept : whatIf.betas[t]),
    0,
  );
  // Delta method: the variance of x·β is xᵀΣx. The interval is built on the
  // log-odds scale and converted afterwards, so it always stays within 0 to 1.
  let variance = 0;
  for (let i = 0; i < row.length; i++) {
    if (row[i] === 0) continue;
    for (let j = 0; j < row.length; j++) {
      variance += row[i] * matrix[i][j] * row[j];
    }
  }
  const half = Z_95 * Math.sqrt(Math.max(variance, 0));
  return {
    logOdds,
    risk: toRisk(logOdds),
    lo: toRisk(logOdds - half),
    hi: toRisk(logOdds + half),
  };
}

export type Change = {
  control: WhatIfControl;
  from: number;
  to: number;
  multiplier: number; // how many times the odds change because of this control alone
};

/** Every control moved away from typical, with what it does to the odds on its own. */
export function changesFromTypical(whatIf: WhatIf, values: Values): Change[] {
  const beta = (term: string | null) => (term ? whatIf.betas[term] : 0);

  return whatIf.controls
    .filter((c) => values[c.column] !== c.default)
    .map((c) => {
      const from = c.default;
      const to = values[c.column];
      const shift =
        c.kind === "slider"
          ? whatIf.betas[c.column] * (to - from)
          : beta(chosenTerm(c, to)) - beta(chosenTerm(c, from));
      return { control: c, from, to, multiplier: Math.exp(shift) };
    })
    .sort(
      (a, b) =>
        Math.abs(Math.log(b.multiplier)) - Math.abs(Math.log(a.multiplier)),
    );
}
