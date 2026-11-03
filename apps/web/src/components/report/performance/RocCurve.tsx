import { ChartFigure } from "@/components/charts/ChartFigure";
import { SquarePlot } from "@/components/charts/SquarePlot";
import { formatDecimal, formatPercent } from "@/lib/format";
import type { Point } from "@/lib/report/types";

/** Every trade-off between catching cases and raising false alarms, with the current cut-off marked. */
export function RocCurve({
  roc,
  auc,
  point,
}: {
  roc: Point[];
  auc: number;
  point: Point; // x = false-alarm rate, y = share of cases caught
}) {
  const path = (x: (v: number) => number, y: (v: number) => number) =>
    roc.map((p, i) => `${i ? "L" : "M"}${x(p.x)},${y(p.y)}`).join(" ");

  return (
    <ChartFigure title="ROC curve">
      <SquarePlot
        xTitle="False-alarm rate"
        yTitle="Cases caught"
        label={`ROC curve with AUC ${formatDecimal(auc)}. At the current cut-off, ${formatPercent(point.y, 0)} of cases are caught with a false-alarm rate of ${formatPercent(point.x, 0)}.`}
      >
        {(x, y) => (
          <>
            <line
              x1={x(0)}
              y1={y(0)}
              x2={x(1)}
              y2={y(1)}
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
            <circle
              cx={x(point.x)}
              cy={y(point.y)}
              r={5.5}
              strokeWidth={2}
              className="fill-chart-2 stroke-surface"
            />
          </>
        )}
      </SquarePlot>
      <p className="text-ink-faint mt-1 text-xs">
        Dashed line: a coin flip. Blue dot: the cut-off chosen below.
      </p>
    </ChartFigure>
  );
}
