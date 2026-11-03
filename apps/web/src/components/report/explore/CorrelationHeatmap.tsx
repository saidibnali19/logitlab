import { ChartFigure } from "@/components/charts/ChartFigure";
import { formatR } from "@/lib/charts";
import type { Correlation } from "@/lib/report/types";

const CELL = 30;
const LEFT = 132;
const TOP = 112;
const RIGHT = 56; // room for the last slanted column label

/** How strongly every pair of predictors moves together. */
export function CorrelationHeatmap({
  correlation,
}: {
  correlation: Correlation;
}) {
  const { labels, matrix } = correlation;
  const n = labels.length;
  const W = LEFT + n * CELL + RIGHT;
  const H = TOP + n * CELL;

  return (
    <ChartFigure
      title="Correlations between predictors"
      table={
        <table className="text-left text-xs tabular-nums">
          <caption className="sr-only">
            Correlation between every pair of predictors.
          </caption>
          <thead className="text-ink-muted">
            <tr>
              <td />
              {labels.map((label) => (
                <th
                  key={label}
                  scope="col"
                  className="px-1.5 py-1 text-right font-medium"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-line divide-y">
            {matrix.map((row, i) => (
              <tr key={labels[i]}>
                <th
                  scope="row"
                  className="py-1 pr-3 font-normal whitespace-nowrap"
                >
                  {labels[i]}
                </th>
                {row.map((r, j) => (
                  <td key={labels[j]} className="px-1.5 py-1 text-right">
                    {formatR(r)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
        <span className="flex items-center gap-2">
          <span className="bg-chart-1 size-2.5 rounded-sm" aria-hidden="true" />
          Rise together
        </span>
        <span className="flex items-center gap-2">
          <span className="bg-chart-2 size-2.5 rounded-sm" aria-hidden="true" />
          One rises as the other falls
        </span>
        <span className="text-ink-faint">Deeper colour, stronger link</span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Correlation heatmap of ${n} predictors. The strongest pairs are listed beside it, and every value is in the table below.`}
          className="h-auto w-full min-w-136"
        >
          {labels.map((label, i) => (
            <g key={label}>
              <text
                x={LEFT - 8}
                y={TOP + i * CELL + CELL / 2 + 4}
                textAnchor="end"
                className="fill-ink text-[11px]"
              >
                {label}
              </text>
              <text
                transform={`translate(${LEFT + i * CELL + CELL / 2 + 4}, ${TOP - 8}) rotate(-60)`}
                className="fill-ink text-[11px]"
              >
                {label}
              </text>
            </g>
          ))}

          {matrix.map((row, i) =>
            row.map((r, j) => {
              const cx = LEFT + j * CELL;
              const cy = TOP + i * CELL;
              if (i === j) {
                return (
                  <rect
                    key={`${i}-${j}`}
                    x={cx + 1}
                    y={cy + 1}
                    width={CELL - 2}
                    height={CELL - 2}
                    rx={3}
                    className="fill-surface-sunken"
                  />
                );
              }
              return (
                <g key={`${i}-${j}`}>
                  <title>{`${labels[i]} and ${labels[j]}: r = ${formatR(r)}`}</title>
                  <rect
                    x={cx + 1}
                    y={cy + 1}
                    width={CELL - 2}
                    height={CELL - 2}
                    rx={3}
                    className={r >= 0 ? "fill-chart-1" : "fill-chart-2"}
                    fillOpacity={Math.max(Math.abs(r), 0.04)}
                  />
                  <text
                    x={cx + CELL / 2}
                    y={cy + CELL / 2 + 3}
                    textAnchor="middle"
                    className={`text-[8px] tabular-nums ${
                      Math.abs(r) >= 0.5 ? "fill-surface" : "fill-ink-muted"
                    }`}
                  >
                    {formatR(r)}
                  </text>
                </g>
              );
            }),
          )}
        </svg>
      </div>

      <p className="text-ink-faint mt-2 text-xs">
        Categorical predictors are correlated by their level codes, so read
        their values as a rough guide.
      </p>
    </ChartFigure>
  );
}
