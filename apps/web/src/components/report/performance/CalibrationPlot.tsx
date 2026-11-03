import { ChartFigure } from "@/components/charts/ChartFigure";
import { SquarePlot } from "@/components/charts/SquarePlot";
import { VerdictBanner } from "@/components/report/VerdictBanner";
import { formatDecimal, formatInt, formatP, formatPercent } from "@/lib/format";
import type { Performance } from "@/lib/report/types";

/** Whether a predicted 20% risk really means about 20% of such people have the outcome. */
export function CalibrationPlot({
  calibration,
}: {
  calibration: Performance["calibration"];
}) {
  const { bins, slope, intercept, hosmerLemeshow } = calibration;
  // Zoomed to the data: most predictions sit low, and a full square would crowd them in a corner.
  const highest = Math.max(
    ...bins.flatMap((b) => [b.predicted, b.observed]),
    0.1,
  );
  const max = Math.min(Math.ceil(highest * 10) / 10, 1);
  const largest = Math.max(...bins.map((b) => b.n));

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">
          Can the risks be taken literally?
        </h3>
        <p className="text-ink-muted mt-1 text-sm">
          The test rows, split into {bins.length} groups by predicted risk. On
          the dashed line, predicted risk matches what actually happened.
        </p>
      </div>
      <VerdictBanner verdict={calibration.verdict} />

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,22rem)_1fr]">
        <ChartFigure
          title="Calibration"
          table={
            <table className="w-full text-left text-xs tabular-nums">
              <caption className="sr-only">
                Mean predicted risk and observed rate in each group of test
                rows.
              </caption>
              <thead className="text-ink-muted">
                <tr>
                  <th scope="col" className="py-1 pr-3 font-medium">
                    Predicted
                  </th>
                  <th scope="col" className="py-1 pr-3 text-right font-medium">
                    Observed
                  </th>
                  <th scope="col" className="py-1 text-right font-medium">
                    Rows
                  </th>
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {bins.map((b) => (
                  <tr key={b.predicted}>
                    <th scope="row" className="py-1 pr-3 font-normal">
                      {formatPercent(b.predicted)}
                    </th>
                    <td className="py-1 pr-3 text-right">
                      {formatPercent(b.observed)}
                    </td>
                    <td className="py-1 text-right">{formatInt(b.n)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          }
        >
          <SquarePlot
            max={max}
            xTitle="Predicted risk"
            yTitle="Observed rate"
            label={`Calibration plot of ${bins.length} groups, predicted risk against observed rate, both from 0 to ${max}. ${calibration.verdict.text}`}
          >
            {(x, y) => (
              <>
                <line
                  x1={x(0)}
                  y1={y(0)}
                  x2={x(max)}
                  y2={y(max)}
                  className="stroke-chart-ref"
                  strokeDasharray="4 3"
                />
                {bins.map((b) => (
                  <circle
                    key={b.predicted}
                    cx={x(b.predicted)}
                    cy={y(b.observed)}
                    r={2.5 + 2.5 * Math.sqrt(b.n / largest)}
                    className="fill-chart-1"
                  />
                ))}
              </>
            )}
          </SquarePlot>
        </ChartFigure>

        <dl className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2">
          <div>
            <dt className="text-ink-faint text-xs">Calibration slope</dt>
            <dd className="font-medium tabular-nums">
              {slope === null ? "—" : formatDecimal(slope)}
            </dd>
            <dd className="text-ink-muted mt-0.5 text-xs">
              1 is perfect. Below 1, predictions are too spread out; above 1,
              too bunched together.
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint text-xs">Calibration intercept</dt>
            <dd className="font-medium tabular-nums">
              {intercept === null ? "—" : formatDecimal(intercept)}
            </dd>
            <dd className="text-ink-muted mt-0.5 text-xs">
              0 is perfect, read together with the slope.
            </dd>
          </div>
          <div>
            <dt className="text-ink-faint text-xs">Hosmer-Lemeshow test</dt>
            <dd className="font-medium tabular-nums">
              {hosmerLemeshow === null
                ? "—"
                : `χ² = ${formatDecimal(hosmerLemeshow.statistic, 1)}, df ${hosmerLemeshow.df}, ${formatP(hosmerLemeshow.pValue)}`}
            </dd>
            <dd className="text-ink-muted mt-0.5 text-xs">
              A small p-value means predicted and observed rates disagree
              overall.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
