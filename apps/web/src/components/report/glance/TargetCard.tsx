import { formatInt, formatPercent } from "@/lib/format";
import type { DataGlance } from "@/lib/report/types";

/** The outcome the model predicts, why it was chosen, and how the two classes split. */
export function TargetCard({
  target,
  label,
}: {
  target: DataGlance["target"];
  label: string;
}) {
  const { negative, positive } = target.counts;
  const total = negative + positive;

  return (
    <div className="card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-ink-faint text-xs font-medium tracking-wide uppercase">
            Outcome to predict
          </p>
          <h3 className="mt-1 text-lg font-semibold">
            {label}
            <span className="text-ink-faint ml-2 font-mono text-xs font-normal">
              {target.name}
            </span>
          </h3>
        </div>
        {/* Shown now so the override has a place; it needs the live engine to work. */}
        <button type="button" className="btn btn-outline btn-sm" disabled>
          Change outcome
        </button>
      </div>
      <p className="text-ink-muted mt-1 text-sm">{target.reason}</p>

      <div
        role="img"
        aria-label={`${formatInt(positive)} of ${formatInt(total)} rows are ${target.positiveLabel}.`}
        className="bg-surface-sunken mt-5 flex h-3 overflow-hidden rounded-full"
      >
        <div
          className="bg-chart-ref"
          style={{ width: `${(negative / total) * 100}%` }}
        />
        <div
          className="bg-chart-1"
          style={{ width: `${(positive / total) * 100}%` }}
        />
      </div>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="flex items-center gap-2 text-sm">
            <span
              className="bg-chart-ref size-2.5 rounded-full"
              aria-hidden="true"
            />
            {target.negativeLabel}
          </dt>
          <dd className="font-medium tabular-nums">
            {formatInt(negative)} rows · {formatPercent(negative / total)}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-sm">
            <span
              className="bg-chart-1 size-2.5 rounded-full"
              aria-hidden="true"
            />
            {target.positiveLabel}
          </dt>
          <dd className="font-medium tabular-nums">
            {formatInt(positive)} rows · {formatPercent(positive / total)}
          </dd>
        </div>
      </dl>

      <p className="text-ink-faint mt-4 text-xs">
        Choosing a different outcome needs the live engine, which is not
        connected in this version.
      </p>
    </div>
  );
}
