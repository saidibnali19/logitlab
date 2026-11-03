import { formatInt, formatPercent } from "@/lib/format";
import type { Hygiene } from "@/lib/report/types";

/** How many rows have gaps, and which columns they are in. */
export function GapsOverview({ data }: { data: Hygiene }) {
  const total = data.rowsWithMissing + data.completeCases;
  const longest = Math.max(0, ...data.missingness.map((item) => item.fraction));
  // Bars share one honest scale: a full bar is at least 10% of rows, never "the biggest one".
  const axisMax = Math.max(0.1, Math.ceil(longest * 20) / 20);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold">Where the gaps are</h3>

      <div
        role="img"
        aria-label={`${formatInt(data.rowsWithMissing)} of ${formatInt(total)} rows have at least one gap.`}
        className="bg-surface-sunken mt-4 flex h-3 overflow-hidden rounded-full"
      >
        <div
          className="bg-chart-1"
          style={{ width: `${(data.completeCases / total) * 100}%` }}
        />
        <div
          className="bg-warn"
          style={{ width: `${(data.rowsWithMissing / total) * 100}%` }}
        />
      </div>
      <dl className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="flex items-center gap-2 text-sm">
            <span
              className="bg-chart-1 size-2.5 rounded-full"
              aria-hidden="true"
            />
            Complete rows
          </dt>
          <dd className="font-medium tabular-nums">
            {formatInt(data.completeCases)} ·{" "}
            {formatPercent(data.completeCases / total)}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-2 text-sm">
            <span
              className="bg-warn size-2.5 rounded-full"
              aria-hidden="true"
            />
            Rows with at least one gap
          </dt>
          <dd className="font-medium tabular-nums">
            {formatInt(data.rowsWithMissing)} ·{" "}
            {formatPercent(data.rowsWithMissing / total)}
          </dd>
        </div>
      </dl>

      {data.missingness.length > 0 ? (
        <div className="mt-6">
          <p className="text-ink-faint text-xs font-medium tracking-wide uppercase">
            Missing values by column
          </p>
          <ul className="mt-3 space-y-2">
            {data.missingness.map((item) => (
              <li
                key={item.column}
                className="grid grid-cols-[6.5rem_1fr_6rem] items-center gap-3 text-sm sm:grid-cols-[10rem_1fr_7rem]"
              >
                <span className="truncate">{item.label}</span>
                <div
                  className="bg-surface-sunken h-2.5 overflow-hidden rounded-full"
                  aria-hidden="true"
                >
                  <div
                    className="bg-warn h-full rounded-full"
                    style={{ width: `${(item.fraction / axisMax) * 100}%` }}
                  />
                </div>
                <span className="text-right tabular-nums">
                  {formatInt(item.count)} · {formatPercent(item.fraction)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-ink-faint mt-2 text-xs">
            A full bar is {formatPercent(axisMax, 0)} of rows.
          </p>
        </div>
      ) : null}
    </div>
  );
}
