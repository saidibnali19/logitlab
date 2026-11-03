import { scaleLog } from "d3-scale";

import { ChartFigure } from "@/components/charts/ChartFigure";
import { oddsRatioTicks } from "@/lib/charts";
import { formatChange, formatDecimal, formatInt } from "@/lib/format";
import type { CompleteCaseComparison } from "@/lib/report/types";

const W = 560;
const LEFT = 170;
const RIGHT = 64;
const TOP = 8;
const ROW_H = 24;
const AXIS = 26;

/** Each odds ratio from all rows (gaps filled) against complete rows only. */
export function CompleteCaseChart({
  comparison,
}: {
  comparison: CompleteCaseComparison;
}) {
  // The biggest movers first.
  const rows = [...comparison.rows].sort(
    (a, b) => Math.abs(b.change) - Math.abs(a.change),
  );
  const values = rows.flatMap((r) => [r.orPrimary, r.orCompleteCase]);
  const min = Math.min(1, ...values) * 0.9;
  const max = Math.max(1, ...values) * 1.1;

  // Log scale: equal distances mean equal ratios.
  const x = scaleLog()
    .domain([min, max])
    .range([LEFT, W - RIGHT]);
  const H = TOP + rows.length * ROW_H + AXIS;
  const axisY = TOP + rows.length * ROW_H;

  return (
    <ChartFigure
      title="Odds ratios: all rows against complete rows only"
      table={
        <table className="w-full text-left text-xs tabular-nums">
          <caption className="sr-only">
            Odds ratio for each term from all rows and from complete rows only,
            the change between them, and whether the evidence agrees.
          </caption>
          <thead className="text-ink-muted">
            <tr>
              <th scope="col" className="py-1 pr-3 font-medium">
                Term
              </th>
              <th scope="col" className="py-1 pr-3 text-right font-medium">
                All rows
              </th>
              <th scope="col" className="py-1 pr-3 text-right font-medium">
                Complete rows
              </th>
              <th scope="col" className="py-1 pr-3 text-right font-medium">
                Change
              </th>
              <th scope="col" className="py-1 font-medium">
                Same evidence
              </th>
            </tr>
          </thead>
          <tbody className="divide-line divide-y">
            {rows.map((row) => (
              <tr key={row.term}>
                <th scope="row" className="py-1 pr-3 font-normal">
                  {row.label}
                </th>
                <td className="py-1 pr-3 text-right">
                  {formatDecimal(row.orPrimary)}
                </td>
                <td className="py-1 pr-3 text-right">
                  {formatDecimal(row.orCompleteCase)}
                </td>
                <td className="py-1 pr-3 text-right">
                  {formatChange(row.change)}
                </td>
                <td className="py-1">{row.sameSignificance ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <div className="text-ink-muted flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
        <span className="flex items-center gap-2">
          <span
            className="bg-chart-1 size-2.5 rounded-full"
            aria-hidden="true"
          />
          All {formatInt(comparison.primaryN)} rows, gaps filled
        </span>
        <span className="flex items-center gap-2">
          <span
            className="border-chart-1 bg-surface size-2.5 rounded-full border-2"
            aria-hidden="true"
          />
          {formatInt(comparison.completeCaseN)} complete rows only
        </span>
        <span className="flex items-center gap-2">
          <span
            className="bg-warn-soft border-warn-line size-2.5 rounded-sm border"
            aria-hidden="true"
          />
          The evidence changes
        </span>
      </div>

      <div className="mt-3 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-label={`Odds ratios for ${rows.length} terms, from all rows and from complete rows only, on a log scale. ${comparison.verdict.text}`}
          className="h-auto w-full min-w-120"
        >
          {rows.map((row, i) =>
            row.sameSignificance ? null : (
              <rect
                key={row.term}
                x={0}
                y={TOP + i * ROW_H}
                width={W}
                height={ROW_H}
                rx={4}
                className="fill-warn-soft"
              />
            ),
          )}

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
            return (
              <g key={row.term}>
                <text x={8} y={y + 4} className="fill-ink text-[11px]">
                  {row.label}
                </text>
                <line
                  x1={x(row.orPrimary)}
                  x2={x(row.orCompleteCase)}
                  y1={y}
                  y2={y}
                  className="stroke-chart-1"
                  strokeWidth={2}
                />
                <circle
                  cx={x(row.orPrimary)}
                  cy={y}
                  r={4}
                  className="fill-chart-1"
                />
                <circle
                  cx={x(row.orCompleteCase)}
                  cy={y}
                  r={3.5}
                  strokeWidth={2}
                  className="fill-surface stroke-chart-1"
                />
                <text
                  x={W - 8}
                  y={y + 4}
                  textAnchor="end"
                  className={`text-[11px] tabular-nums ${row.sameSignificance ? "fill-ink-muted" : "fill-warn-ink font-semibold"}`}
                >
                  {formatChange(row.change)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-ink-faint mt-2 text-xs">
        Odds ratios per 1 SD for measurements, and against the reference for
        groups, on a log scale. Sorted by how far they move.
      </p>
    </ChartFigure>
  );
}
