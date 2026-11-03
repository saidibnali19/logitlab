import { scaleLog } from "d3-scale";

import { ChartFigure } from "@/components/charts/ChartFigure";
import type { OddsRow } from "@/components/report/model/OddsRatioView";
import { oddsRatioTicks } from "@/lib/charts";
import { formatOddsRatio } from "@/lib/format";

const W = 640;
const LEFT = 210;
const RIGHT = 128;
const TOP = 8;
const ROW_H = 34;
const AXIS = 26;

/** Every odds ratio with its 95% interval, on a log axis. */
export function ForestPlot({ rows }: { rows: OddsRow[] }) {
  const values = rows.flatMap((row) => [row.lo, row.hi]);
  const min = Math.min(1, ...values) * 0.9;
  const max = Math.max(1, ...values) * 1.1;

  // Log scale: equal distances mean equal ratios.
  const x = scaleLog()
    .domain([min, max])
    .range([LEFT, W - RIGHT]);
  const axisY = TOP + rows.length * ROW_H;
  const H = axisY + AXIS;
  const marked = rows.some((row) => row.group || row.fragile);

  // No table fallback here: the coefficient table right below holds the same numbers.
  return (
    <ChartFigure title="Forest plot">
      <div className="text-ink-muted flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
        <span className="flex items-center gap-2">
          <span
            className="bg-chart-1 size-2.5 rounded-full"
            aria-hidden="true"
          />
          Clear evidence
        </span>
        <span className="flex items-center gap-2">
          <span
            className="border-chart-ref bg-surface size-2.5 rounded-full border-2"
            aria-hidden="true"
          />
          No clear evidence
        </span>
        <span className="text-ink-faint">Lines are 95% intervals</span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Odds ratios for ${rows.length} terms on a log scale. ${rows
            .filter((row) => row.significant)
            .map((row) => `${row.label} ${formatOddsRatio(row.or)}`)
            .join(
              ", ",
            )} show clear evidence. Every value is in the table below.`}
          className="h-auto w-full min-w-136"
        >
          {oddsRatioTicks(min, max).map((t) => (
            <g key={t}>
              <line
                x1={x(t)}
                x2={x(t)}
                y1={TOP}
                y2={axisY}
                className={t === 1 ? "stroke-chart-ref" : "stroke-chart-grid"}
                strokeDasharray={t === 1 ? "4 3" : undefined}
              />
              <text
                x={x(t)}
                y={axisY + 16}
                textAnchor="middle"
                className="fill-ink-muted text-[10px]"
              >
                {t}
              </text>
            </g>
          ))}

          {rows.map((row, i) => {
            const y = TOP + i * ROW_H + ROW_H / 2;
            const note = [row.step, row.fragile ? "fragile" : null]
              .filter(Boolean)
              .join(" · ");
            return (
              <g key={row.term}>
                {row.alternate ? <title>{row.alternate}</title> : null}
                {row.group ? (
                  <g>
                    <circle
                      cx={10}
                      cy={y}
                      r={7}
                      className="fill-surface-sunken stroke-line-strong"
                    />
                    <text
                      x={10}
                      y={y + 3}
                      textAnchor="middle"
                      className="fill-ink-muted text-[9px] font-semibold"
                    >
                      {row.group}
                    </text>
                  </g>
                ) : null}
                <text
                  x={24}
                  y={note ? y - 2 : y + 4}
                  className="fill-ink text-[11px]"
                >
                  {row.label}
                </text>
                {note ? (
                  <text
                    x={24}
                    y={y + 10}
                    className={`text-[9px] ${row.fragile ? "fill-warn-ink" : "fill-ink-faint"}`}
                  >
                    {note}
                  </text>
                ) : null}

                <line
                  x1={x(row.lo)}
                  x2={x(row.hi)}
                  y1={y}
                  y2={y}
                  className={
                    row.significant ? "stroke-chart-1" : "stroke-chart-ref"
                  }
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                {row.significant ? (
                  <circle
                    cx={x(row.or)}
                    cy={y}
                    r={4.5}
                    className="fill-chart-1"
                  />
                ) : (
                  <circle
                    cx={x(row.or)}
                    cy={y}
                    r={4}
                    strokeWidth={2}
                    className="fill-surface stroke-chart-ref"
                  />
                )}
                <text
                  x={W - 4}
                  y={y + 4}
                  textAnchor="end"
                  className={`font-mono text-[10px] tabular-nums ${row.significant ? "fill-ink" : "fill-ink-muted"}`}
                >
                  {formatOddsRatio(row.or)} ({formatOddsRatio(row.lo)}–
                  {formatOddsRatio(row.hi)})
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {marked ? (
        <p className="text-ink-faint mt-2 text-xs">
          Lettered terms overlap and were tested together in{" "}
          <a href="#assumptions" className="underline underline-offset-2">
            section 04
          </a>
          , so read each lettered set as one. &ldquo;Fragile&rdquo; marks
          estimates whose evidence changes when only complete rows are used.
        </p>
      ) : null}
    </ChartFigure>
  );
}
