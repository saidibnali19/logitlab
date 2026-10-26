import { FOREST_ROWS } from "@/lib/preview-data";

const W = 360;
const TOP = 12;
const ROW_H = 28;
const PLOT_L = 118;
const PLOT_R = 300;
const MIN = 0.8;
const MAX = 10;
const TICKS = [1, 2, 5, 10];
const H = TOP + FOREST_ROWS.length * ROW_H + 30;

// Log scale: equal distances mean equal ratios.
function x(value: number) {
  const t = (Math.log(value) - Math.log(MIN)) / (Math.log(MAX) - Math.log(MIN));
  return PLOT_L + t * (PLOT_R - PLOT_L);
}

export function MiniForestPlot() {
  const axisY = TOP + FOREST_ROWS.length * ROW_H;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Forest plot of odds ratios per standard deviation. Prior stroke is highest at 3.98, then systolic blood pressure 1.70, male 1.56, glucose 1.20, cigarettes per day 1.20 and total cholesterol 1.19."
      className="h-auto w-full"
    >
      {TICKS.map((t) => (
        <g key={t}>
          <line
            x1={x(t)}
            x2={x(t)}
            y1={TOP - 4}
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

      {FOREST_ROWS.map((row, i) => {
        const y = TOP + i * ROW_H + ROW_H / 2;
        return (
          <g key={row.label}>
            <text x={0} y={y + 4} className="fill-ink text-[11px]">
              {row.label}
            </text>
            <line
              x1={x(row.lo)}
              x2={x(row.hi)}
              y1={y}
              y2={y}
              className="stroke-chart-1"
              strokeWidth={2}
              strokeLinecap="round"
            />
            <circle cx={x(row.or)} cy={y} r={4} className="fill-chart-1" />
            <text
              x={W}
              y={y + 4}
              textAnchor="end"
              className="fill-ink-muted font-mono text-[11px]"
            >
              {row.or.toFixed(2)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
