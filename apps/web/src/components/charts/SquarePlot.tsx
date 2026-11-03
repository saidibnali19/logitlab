import { scaleLinear, type ScaleLinear } from "d3-scale";
import type { ReactNode } from "react";

type Scale = ScaleLinear<number, number>;

const SIDE = 240;
const LEFT = 38;
const RIGHT = 10;
const TOP = 10;
const BOTTOM = 36;

/**
 * A square plot from 0 to `max` on both axes, with gridlines and axis titles.
 * ROC, precision-recall and calibration all draw inside it.
 */
export function SquarePlot({
  max = 1,
  xTitle,
  yTitle,
  label,
  children,
}: {
  max?: number;
  xTitle: string;
  yTitle: string;
  label: string;
  children: (x: Scale, y: Scale) => ReactNode;
}) {
  const x = scaleLinear()
    .domain([0, max])
    .range([LEFT, LEFT + SIDE]);
  const y = scaleLinear()
    .domain([0, max])
    .range([TOP + SIDE, TOP]);
  const ticks = x.ticks(5);

  return (
    <svg
      viewBox={`0 0 ${LEFT + SIDE + RIGHT} ${TOP + SIDE + BOTTOM}`}
      role="img"
      aria-label={label}
      className="h-auto w-full"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={x(t)}
            x2={x(t)}
            y1={TOP}
            y2={TOP + SIDE}
            className="stroke-chart-grid"
          />
          <line
            x1={LEFT}
            x2={LEFT + SIDE}
            y1={y(t)}
            y2={y(t)}
            className="stroke-chart-grid"
          />
          <text
            x={x(t)}
            y={TOP + SIDE + 14}
            textAnchor="middle"
            className="fill-ink-muted text-[9px]"
          >
            {t}
          </text>
          <text
            x={LEFT - 6}
            y={y(t) + 3}
            textAnchor="end"
            className="fill-ink-muted text-[9px]"
          >
            {t}
          </text>
        </g>
      ))}
      <text
        x={LEFT + SIDE / 2}
        y={TOP + SIDE + 30}
        textAnchor="middle"
        className="fill-ink-muted text-[10px]"
      >
        {xTitle}
      </text>
      <text
        transform={`translate(10, ${TOP + SIDE / 2}) rotate(-90)`}
        textAnchor="middle"
        className="fill-ink-muted text-[10px]"
      >
        {yTitle}
      </text>
      {children(x, y)}
    </svg>
  );
}
