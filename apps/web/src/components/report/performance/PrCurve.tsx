import { ChartFigure } from "@/components/charts/ChartFigure";
import { SquarePlot } from "@/components/charts/SquarePlot";
import { formatPercent } from "@/lib/format";
import type { Point } from "@/lib/report/types";

/** How many flagged people are real cases at each level of catching them. */
export function PrCurve({
  pr,
  baseline,
  point,
}: {
  pr: Point[];
  baseline: number;
  point: Point | null; // x = share of cases caught, y = share of flagged who are cases; null when nobody is flagged
}) {
  const path = (x: (v: number) => number, y: (v: number) => number) =>
    pr.map((p, i) => `${i ? "L" : "M"}${x(p.x)},${y(p.y)}`).join(" ");

  return (
    <ChartFigure title="Precision-recall curve">
      <SquarePlot
        xTitle="Cases caught"
        yTitle="Flagged who are cases"
        label={`Precision-recall curve. Guessing would give ${formatPercent(baseline, 0)}.${point ? ` At the current cut-off, ${formatPercent(point.y, 0)} of flagged people are cases.` : " At the current cut-off nobody is flagged."}`}
      >
        {(x, y) => (
          <>
            <line
              x1={x(0)}
              y1={y(baseline)}
              x2={x(1)}
              y2={y(baseline)}
              className="stroke-chart-ref"
              strokeDasharray="4 3"
            />
            <path
              d={path(x, y)}
              className="stroke-chart-1"
              fill="none"
              strokeWidth={2}
              strokeLinejoin="round"
            />
            {point ? (
              <circle
                cx={x(point.x)}
                cy={y(point.y)}
                r={5.5}
                strokeWidth={2}
                className="fill-chart-2 stroke-surface"
              />
            ) : null}
          </>
        )}
      </SquarePlot>
      <p className="text-ink-faint mt-1 text-xs">
        Dashed line: guessing, at the {formatPercent(baseline)} case rate. Blue
        dot: the cut-off chosen below.
      </p>
    </ChartFigure>
  );
}
