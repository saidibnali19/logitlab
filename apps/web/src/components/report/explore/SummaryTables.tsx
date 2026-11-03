import {
  formatDecimal,
  formatInt,
  formatPercent,
  formatValue,
} from "@/lib/format";
import type { CategoricalSummary, ContinuousSummary } from "@/lib/report/types";

/** The numbers behind every predictor: centre and spread, or counts per level. */
export function SummaryTables({
  continuous,
  categorical,
}: {
  continuous: ContinuousSummary[];
  categorical: CategoricalSummary[];
}) {
  return (
    <div className="space-y-6">
      {continuous.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold">Measurements</h3>
          <div className="border-line bg-surface rounded-card mt-3 overflow-x-auto border">
            <table className="w-full min-w-152 text-left text-sm">
              <caption className="sr-only">
                For each continuous predictor: mean, median, standard deviation,
                range and skewness, after gaps were filled.
              </caption>
              <thead className="bg-surface-sunken text-ink-muted text-xs tracking-wide uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Predictor
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Mean
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Median
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    SD
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Range
                  </th>
                  <th scope="col" className="px-4 py-3 text-right font-medium">
                    Skewness
                  </th>
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {continuous.map((item) => (
                  <tr key={item.column}>
                    <th scope="row" className="px-4 py-3 text-left font-normal">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-ink-faint ml-2 font-mono text-xs">
                        {item.column}
                      </span>
                    </th>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatDecimal(item.mean)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatValue(item.median)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatDecimal(item.sd)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatValue(item.min)} to {formatValue(item.max)}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      {formatDecimal(item.skewness)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {categorical.length > 0 ? (
        <div>
          <h3 className="text-lg font-semibold">Groups</h3>
          <div className="border-line bg-surface rounded-card mt-3 overflow-x-auto border">
            <table className="w-full min-w-120 text-left text-sm">
              <caption className="sr-only">
                For each categorical predictor: how many rows fall in each
                level, and what share of all rows that is.
              </caption>
              <thead className="bg-surface-sunken text-ink-muted text-xs tracking-wide uppercase">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Predictor
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Rows per level
                  </th>
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {categorical.map((item) => (
                  <tr key={item.column}>
                    <th scope="row" className="px-4 py-3 text-left font-normal">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-ink-faint ml-2 font-mono text-xs">
                        {item.column}
                      </span>
                    </th>
                    <td className="px-4 py-3">
                      <ul className="flex flex-wrap gap-x-5 gap-y-1">
                        {item.levels.map((level) => (
                          <li key={level.level} className="tabular-nums">
                            <span className="font-medium">{level.label}</span>{" "}
                            <span className="text-ink-muted">
                              {formatInt(level.n)} ·{" "}
                              {formatPercent(level.fraction)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </div>
  );
}
