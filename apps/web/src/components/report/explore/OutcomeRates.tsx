import { ChartFigure } from "@/components/charts/ChartFigure";
import { formatInt, formatPercent } from "@/lib/format";
import type { OutcomeRate } from "@/lib/report/types";

/** For each group, how often the outcome happens, against the overall rate. */
export function OutcomeRates({
  rates,
  prevalence,
  positiveLabel,
}: {
  rates: OutcomeRate[];
  prevalence: number;
  positiveLabel: string;
}) {
  if (rates.length === 0) return null;

  const highest = Math.max(
    prevalence,
    ...rates.flatMap((item) => item.levels.map((level) => level.rate)),
  );
  // One shared scale, rounded up to the next 5%, so every bar is comparable.
  const axisMax = Math.ceil(highest * 20) / 20;
  const at = (rate: number) => `${(rate / axisMax) * 100}%`;

  return (
    <div>
      <h3 className="text-lg font-semibold">Outcome rate by group</h3>
      <p className="text-ink-muted mt-1 text-sm">
        Share of each group with {positiveLabel.toLowerCase()}. The dashed line
        is the overall rate, {formatPercent(prevalence)}.
      </p>

      <div className="mt-4">
        <ChartFigure
          title={`Rate of ${positiveLabel.toLowerCase()}, by group`}
          table={
            <table className="w-full text-left text-xs tabular-nums">
              <caption className="sr-only">
                Rows and outcome rate for every level of every categorical
                predictor.
              </caption>
              <thead className="text-ink-muted">
                <tr>
                  <th scope="col" className="py-1 pr-3 font-medium">
                    Predictor
                  </th>
                  <th scope="col" className="py-1 pr-3 font-medium">
                    Level
                  </th>
                  <th scope="col" className="py-1 pr-3 text-right font-medium">
                    Rows
                  </th>
                  <th scope="col" className="py-1 text-right font-medium">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {rates.flatMap((item) =>
                  item.levels.map((level) => (
                    <tr key={`${item.column}-${level.level}`}>
                      <th scope="row" className="py-1 pr-3 font-normal">
                        {item.label}
                      </th>
                      <td className="py-1 pr-3">{level.label}</td>
                      <td className="py-1 pr-3 text-right">
                        {formatInt(level.n)}
                      </td>
                      <td className="py-1 text-right">
                        {formatPercent(level.rate)}
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          }
        >
          <div className="space-y-5">
            {rates.map((item) => (
              <section
                key={item.column}
                aria-labelledby={`rate-${item.column}`}
              >
                <h4
                  id={`rate-${item.column}`}
                  className="text-ink-faint text-xs font-medium tracking-wide uppercase"
                >
                  {item.label}
                </h4>
                <ul className="mt-2 space-y-1.5">
                  {item.levels.map((level) => (
                    <li
                      key={level.level}
                      className="grid grid-cols-[3rem_1fr_8.5rem] items-center gap-3 text-sm"
                    >
                      <span className="truncate">{level.label}</span>
                      <div
                        className="bg-surface-sunken relative h-2.5 rounded-full"
                        aria-hidden="true"
                      >
                        <div
                          className="bg-chart-1 h-full rounded-full"
                          style={{ width: at(level.rate) }}
                        />
                        <div
                          className="border-chart-ref absolute -inset-y-1 border-l border-dashed"
                          style={{ left: at(prevalence) }}
                        />
                      </div>
                      <span className="text-right tabular-nums">
                        {formatPercent(level.rate)}
                        <span className="text-ink-faint ml-1.5 text-xs">
                          n = {formatInt(level.n)}
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            <p className="text-ink-faint text-xs">
              A full bar is {formatPercent(axisMax, 0)}. Small groups give
              unsteady rates, so read them with their n.
            </p>
          </div>
        </ChartFigure>
      </div>
    </div>
  );
}
