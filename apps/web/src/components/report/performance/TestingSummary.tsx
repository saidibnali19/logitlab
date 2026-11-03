import { formatDecimal, formatInt, formatPercent } from "@/lib/format";
import type { Performance } from "@/lib/report/types";

const FLOOR = 0.5; // a coin flip
const at = (auc: number) =>
  `${((Math.max(auc, FLOOR) - FLOOR) / (1 - FLOOR)) * 100}%`;

/** How the model was tested, and its AUC on a scale from coin flip to perfect. */
export function TestingSummary({
  split,
  auc,
}: {
  split: Performance["split"];
  auc: Performance["auc"];
}) {
  return (
    <div className="card">
      <h3 className="text-lg font-semibold">How it was tested</h3>
      <p className="text-ink-muted mt-1 text-sm">
        Trained on {formatInt(split.trainRows)} rows, then tested once on{" "}
        {formatInt(split.testRows)} rows it never saw (
        {formatPercent(split.testFraction, 0)}, {formatInt(split.testEvents)}{" "}
        cases). Nothing was tuned on the test rows.
      </p>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-ink-faint text-xs">AUC on the test rows</dt>
          <dd className="text-2xl font-semibold tabular-nums">
            {formatDecimal(auc.test)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint text-xs">
            AUC by {auc.folds}-fold cross-validation
          </dt>
          <dd className="text-2xl font-semibold tabular-nums">
            {formatDecimal(auc.cvMean)}{" "}
            <span className="text-ink-muted text-sm font-normal">
              95% CI {formatDecimal(auc.cvLo)} to {formatDecimal(auc.cvHi)}
            </span>
          </dd>
        </div>
      </dl>

      <div
        role="img"
        aria-label={`AUC ${formatDecimal(auc.test)} on the test rows and ${formatDecimal(auc.cvMean)} by cross-validation, on a scale from 0.5, a coin flip, to 1, perfect.`}
        className="relative mt-6 h-6"
      >
        <div className="bg-surface-sunken absolute inset-x-0 top-2.5 h-1 rounded-full" />
        <div
          className="bg-chart-band absolute top-1.5 h-3 rounded-full"
          style={{
            left: at(auc.cvLo),
            width: `calc(${at(auc.cvHi)} - ${at(auc.cvLo)})`,
          }}
        />
        <div
          className="bg-chart-2 absolute top-1 h-4 w-0.5 -translate-x-1/2"
          style={{ left: at(auc.cvMean) }}
        />
        <div
          className="bg-chart-1 border-surface absolute top-0.5 size-5 -translate-x-1/2 rounded-full border-2"
          style={{ left: at(auc.test) }}
        />
      </div>
      <div className="text-ink-faint mt-1 flex justify-between text-xs">
        <span>0.5, a coin flip</span>
        <span>1, perfect</span>
      </div>
      <div className="text-ink-muted mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs">
        <span className="flex items-center gap-2">
          <span
            className="bg-chart-1 size-2.5 rounded-full"
            aria-hidden="true"
          />
          Test rows
        </span>
        <span className="flex items-center gap-2">
          <span
            className="bg-chart-band h-2.5 w-4 rounded-full"
            aria-hidden="true"
          />
          Cross-validation, 95% interval
        </span>
      </div>
    </div>
  );
}
