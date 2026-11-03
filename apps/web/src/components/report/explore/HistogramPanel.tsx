import { scaleLinear } from "d3-scale";

import { ChartFigure } from "@/components/charts/ChartFigure";
import { formatEdge } from "@/lib/charts";
import { formatPercent } from "@/lib/format";
import type { OutcomeHistogram } from "@/lib/report/types";

const W = 240;
const H = 132;
const LEFT = 6;
const RIGHT = 6;
const TOP = 8;
const BOTTOM = 22;

/** A stepped outline over the bins: flat across each bin, vertical between them. */
function stepPoints(
  edges: number[],
  values: number[],
  x: (v: number) => number,
  y: (v: number) => number,
): string {
  return values
    .map((v, i) => `L${x(edges[i])},${y(v)} L${x(edges[i + 1])},${y(v)}`)
    .join(" ");
}

/** One predictor's distribution, drawn once for each outcome group. */
export function HistogramPanel({
  histogram,
  negativeLabel,
  positiveLabel,
}: {
  histogram: OutcomeHistogram;
  negativeLabel: string;
  positiveLabel: string;
}) {
  const { edges, negative, positive } = histogram;
  const first = edges[0];
  const last = edges[edges.length - 1];

  const x = scaleLinear()
    .domain([first, last])
    .range([LEFT, W - RIGHT]);
  // Each panel has its own height scale: the comparison is between the two groups inside it.
  const y = scaleLinear()
    .domain([0, Math.max(...negative, ...positive)])
    .nice()
    .range([H - BOTTOM, TOP]);
  const base = y(0);

  const steps = (values: number[]) => stepPoints(edges, values, x, y);
  const area = `M${x(first)},${base} ${steps(negative)} L${x(last)},${base} Z`;
  const line = `M${x(first)},${base} ${steps(positive)} L${x(last)},${base}`;

  return (
    <ChartFigure
      title={histogram.label}
      table={
        <table className="w-full text-left text-xs tabular-nums">
          <caption className="sr-only">
            Share of each outcome group in every bin of {histogram.label}.
          </caption>
          <thead className="text-ink-muted">
            <tr>
              <th scope="col" className="py-1 pr-3 font-medium">
                Bin
              </th>
              <th scope="col" className="py-1 pr-3 text-right font-medium">
                {negativeLabel}
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                {positiveLabel}
              </th>
            </tr>
          </thead>
          <tbody className="divide-line divide-y">
            {negative.map((share, i) => (
              <tr key={edges[i]}>
                <th scope="row" className="py-1 pr-3 font-normal">
                  {formatEdge(edges[i])} to {formatEdge(edges[i + 1])}
                </th>
                <td className="py-1 pr-3 text-right">{formatPercent(share)}</td>
                <td className="py-1 text-right">
                  {formatPercent(positive[i])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Distribution of ${histogram.label} from ${formatEdge(first)} to ${formatEdge(last)}, drawn separately for ${negativeLabel} and ${positiveLabel}. The values are in the table below.`}
        className="h-auto w-full"
      >
        <path d={area} className="fill-chart-ref/35" />
        <path
          d={line}
          className="stroke-chart-1"
          fill="none"
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
        <line
          x1={LEFT}
          x2={W - RIGHT}
          y1={base}
          y2={base}
          className="stroke-chart-grid"
        />
        {x.ticks(4).map((t) => (
          <text
            key={t}
            x={x(t)}
            y={H - 6}
            textAnchor="middle"
            className="fill-ink-muted text-[10px]"
          >
            {formatEdge(t)}
          </text>
        ))}
      </svg>
    </ChartFigure>
  );
}
