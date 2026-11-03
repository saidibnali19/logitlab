import { formatDecimal, formatInt } from "@/lib/format";
import type { Assumptions } from "@/lib/report/types";

/** Whether any single row pulls the model around, measured by Cook's distance. */
export function InfluenceSummary({
  influence,
}: {
  influence: Assumptions["influence"];
}) {
  // A fitted model always lists its most influential rows; none means no model was fitted.
  if (influence.flagged.length === 0) return null;

  const share = Math.min(influence.maxCooksD / influence.limit, 1);

  return (
    <div className="card">
      <h3 className="text-lg font-semibold">Influential rows</h3>
      <p className="mt-1">
        <span className="text-2xl font-semibold tabular-nums">
          {formatDecimal(influence.maxCooksD, 3)}
        </span>{" "}
        <span className="text-ink-muted text-sm">
          largest Cook&apos;s distance, against a concern level of{" "}
          {influence.limit}
        </span>
      </p>

      <div
        role="img"
        aria-label={`The largest Cook's distance is ${formatDecimal(influence.maxCooksD, 3)}, ${(share * 100).toFixed(1)}% of the way to the concern level of ${influence.limit}.`}
        className="bg-surface-sunken mt-4 h-3 overflow-hidden rounded-full"
      >
        <div
          className={`h-full min-w-1 rounded-full ${influence.maxCooksD > influence.limit ? "bg-warn" : "bg-chart-1"}`}
          style={{ width: `${share * 100}%` }}
        />
      </div>
      <div className="text-ink-faint mt-1 flex justify-between text-xs">
        <span>0</span>
        <span>{influence.limit}</span>
      </div>

      <p className="text-ink-muted mt-3 text-sm">
        {formatInt(influence.count)} rows exceed the stricter 4/n guideline (
        {formatDecimal(influence.threshold, 5)}), which is normal in a large
        sample. No row was removed.
      </p>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-medium">
          Most influential rows
        </summary>
        <table className="mt-2 text-xs tabular-nums">
          <caption className="sr-only">
            The rows with the largest Cook&apos;s distance.
          </caption>
          <thead className="text-ink-muted">
            <tr>
              <th scope="col" className="py-1 pr-6 text-left font-medium">
                Row
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                Cook&apos;s distance
              </th>
            </tr>
          </thead>
          <tbody className="divide-line divide-y">
            {influence.flagged.map((item) => (
              <tr key={item.row}>
                <th scope="row" className="py-1 pr-6 text-left font-normal">
                  {formatInt(item.row)}
                </th>
                <td className="py-1 text-right">
                  {formatDecimal(item.cooksD, 4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
