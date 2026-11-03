import { ChartFigure } from "@/components/charts/ChartFigure";
import { formatDecimal } from "@/lib/format";
import type { Assumptions } from "@/lib/report/types";

/** How much each estimate is blurred by overlap with the other predictors. */
export function VifChart({
  vif,
  limit,
}: {
  vif: Assumptions["vif"];
  limit: number;
}) {
  if (vif.length === 0) return null;

  const highest = Math.max(...vif.map((row) => row.value));
  // One shared scale that always shows the limit, with a little room past it.
  const axisMax = Math.ceil(Math.max(limit, highest) * 1.1);
  const at = (value: number) => `${(value / axisMax) * 100}%`;

  return (
    <div>
      <h3 className="text-lg font-semibold">Overlap between predictors</h3>
      <p className="text-ink-muted mt-1 text-sm">
        The variance inflation factor (VIF) shows how much overlap with the
        other predictors widens each estimate. The dashed line is the limit,{" "}
        {limit}.
      </p>

      <div className="mt-4">
        <ChartFigure
          title="VIF by model term"
          table={
            <table className="w-full text-left text-xs tabular-nums">
              <caption className="sr-only">
                Variance inflation factor for every model term.
              </caption>
              <thead className="text-ink-muted">
                <tr>
                  <th scope="col" className="py-1 pr-3 font-medium">
                    Term
                  </th>
                  <th scope="col" className="py-1 text-right font-medium">
                    VIF
                  </th>
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {vif.map((row) => (
                  <tr key={row.term}>
                    <th scope="row" className="py-1 pr-3 font-normal">
                      {row.label}
                    </th>
                    <td className="py-1 text-right">
                      {formatDecimal(row.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        >
          <ul className="space-y-1.5">
            {vif.map((row) => (
              <li
                key={row.term}
                className="grid grid-cols-[7rem_1fr_2.5rem] items-center gap-3 text-sm sm:grid-cols-[12rem_1fr_3rem]"
              >
                <span className="truncate" title={row.label}>
                  {row.label}
                </span>
                <div
                  className="bg-surface-sunken relative h-2.5 rounded-full"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full rounded-full ${row.value >= limit ? "bg-warn" : "bg-chart-1"}`}
                    style={{ width: at(row.value) }}
                  />
                  <div
                    className="border-chart-ref absolute -inset-y-1 border-l border-dashed"
                    style={{ left: at(limit) }}
                  />
                </div>
                <span className="text-right tabular-nums">
                  {formatDecimal(row.value)}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-ink-faint mt-3 text-xs">
            A full bar is {axisMax}. 1 means no overlap at all.
          </p>
        </ChartFigure>
      </div>
    </div>
  );
}
