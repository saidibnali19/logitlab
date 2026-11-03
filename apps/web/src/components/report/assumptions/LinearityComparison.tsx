import { scaleLinear } from "d3-scale";

import { ChartFigure } from "@/components/charts/ChartFigure";
import { formatEdge } from "@/lib/charts";
import { formatDecimal, formatInt } from "@/lib/format";
import { VERDICT_BADGE } from "@/lib/verdict";
import type {
  Level,
  LinearityComparison as Comparison,
  Point,
} from "@/lib/report/types";

const W = 320;
const H = 200;
const LEFT = 34;
const RIGHT = 8;
const TOP = 10;
const BOTTOM = 24;

const RESULT: Record<Level, string> = {
  pass: "Straight line is fine",
  info: "Straight line is fine",
  warn: "The curve matters",
  refuse: "Refused",
};

/** One measurement fitted two ways: as a straight line and as a smooth curve. */
export function LinearityComparison({
  comparison,
}: {
  comparison: Comparison;
}) {
  const { binned, linearCurve, splineCurve } = comparison;
  const xs = [...linearCurve, ...splineCurve].map((p) => p.x);
  const ys = [
    ...linearCurve.map((p) => p.y),
    ...splineCurve.map((p) => p.y),
    ...binned.map((b) => b.logit),
  ];

  const x = scaleLinear()
    .domain([
      Math.min(...xs, ...binned.map((b) => b.x)),
      Math.max(...xs, ...binned.map((b) => b.x)),
    ])
    .range([LEFT, W - RIGHT]);
  const y = scaleLinear()
    .domain([Math.min(...ys), Math.max(...ys)])
    .nice()
    .range([H - BOTTOM, TOP]);
  const largest = Math.max(...binned.map((b) => b.n));
  // Dot area grows with the rows behind it.
  const radius = (n: number) => 2 + 4 * Math.sqrt(n / largest);
  const path = (points: Point[]) =>
    points.map((p, i) => `${i ? "L" : "M"}${x(p.x)},${y(p.y)}`).join(" ");

  return (
    <ChartFigure
      title={comparison.label}
      table={
        <table className="w-full text-left text-xs tabular-nums">
          <caption className="sr-only">
            Observed log-odds of the outcome in each group of {comparison.label}
            , with the rows behind each group.
          </caption>
          <thead className="text-ink-muted">
            <tr>
              <th scope="col" className="py-1 pr-3 font-medium">
                Group centre
              </th>
              <th scope="col" className="py-1 pr-3 text-right font-medium">
                Log-odds
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                Rows
              </th>
            </tr>
          </thead>
          <tbody className="divide-line divide-y">
            {binned.map((b) => (
              <tr key={b.x}>
                <th scope="row" className="py-1 pr-3 font-normal">
                  {formatEdge(b.x)}
                </th>
                <td className="py-1 pr-3 text-right">
                  {formatDecimal(b.logit)}
                </td>
                <td className="py-1 text-right">{formatInt(b.n)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`${comparison.label}: observed log-odds in ${binned.length} groups, with a straight line and a smooth curve fitted through them. ${comparison.verdict.text}`}
        className="h-auto w-full"
      >
        {y.ticks(4).map((t) => (
          <g key={t}>
            <line
              x1={LEFT}
              x2={W - RIGHT}
              y1={y(t)}
              y2={y(t)}
              className="stroke-chart-grid"
            />
            <text
              x={LEFT - 6}
              y={y(t) + 3}
              textAnchor="end"
              className="fill-ink-muted text-[9px]"
            >
              {formatDecimal(t, 1)}
            </text>
          </g>
        ))}
        {x.ticks(5).map((t) => (
          <text
            key={t}
            x={x(t)}
            y={H - 8}
            textAnchor="middle"
            className="fill-ink-muted text-[9px]"
          >
            {formatEdge(t)}
          </text>
        ))}

        {binned.map((b) => (
          <circle
            key={b.x}
            cx={x(b.x)}
            cy={y(b.logit)}
            r={radius(b.n)}
            className="fill-chart-2/60"
          />
        ))}
        <path
          d={path(linearCurve)}
          className="stroke-chart-ref"
          fill="none"
          strokeWidth={1.5}
          strokeDasharray="5 4"
        />
        <path
          d={path(splineCurve)}
          className="stroke-chart-1"
          fill="none"
          strokeWidth={2}
          strokeLinejoin="round"
        />
      </svg>

      <p className="text-ink-faint mt-1 text-xs">Vertical axis: log-odds.</p>
      <div className="mt-3 space-y-1 text-sm">
        <span className={`badge ${VERDICT_BADGE[comparison.verdict.level]}`}>
          {RESULT[comparison.verdict.level]}
        </span>
        <p>{comparison.verdict.text}</p>
      </div>
    </ChartFigure>
  );
}
