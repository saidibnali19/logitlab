import type { OddsRow } from "@/components/report/model/OddsRatioView";
import { formatDecimal, formatOddsRatio, formatPValue } from "@/lib/format";
import type { Coefficient } from "@/lib/report/types";

/** The forest plot's numbers, plus the raw log-odds output for anyone who wants it. */
export function CoefficientTable({
  rows,
  coefficients,
  intercept,
}: {
  rows: OddsRow[];
  coefficients: Coefficient[];
  intercept: number;
}) {
  return (
    <div>
      <div className="border-line bg-surface rounded-card overflow-x-auto border">
        <table className="w-full min-w-136 text-left text-sm">
          <caption className="sr-only">
            Odds ratio, 95% confidence interval and p-value for every model
            term, in the unit chosen above.
          </caption>
          <thead className="bg-surface-sunken text-ink-muted text-xs tracking-wide uppercase">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Term
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Odds ratio
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                95% CI
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                p-value
              </th>
            </tr>
          </thead>
          <tbody className="divide-line divide-y">
            {rows.map((row, i) => (
              <tr key={row.term}>
                <th scope="row" className="px-4 py-3 text-left font-normal">
                  <span className="font-medium">{row.label}</span>
                  {row.step ? (
                    <span className="text-ink-faint ml-2 text-xs">
                      {row.step}
                    </span>
                  ) : null}
                  {row.fragile ? (
                    <span className="badge badge-warn ml-2">Fragile</span>
                  ) : null}
                </th>
                <td
                  className={`px-4 py-3 text-right tabular-nums ${row.significant ? "font-semibold" : ""}`}
                >
                  {formatOddsRatio(row.or)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatOddsRatio(row.lo)} to {formatOddsRatio(row.hi)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatPValue(coefficients[i].pValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="mt-3 text-sm">
        <summary className="cursor-pointer font-medium">
          Model coefficients (log-odds)
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="text-left text-xs tabular-nums">
            <caption className="sr-only">
              Coefficient, standard error and z statistic for every term.
            </caption>
            <thead className="text-ink-muted">
              <tr>
                <th scope="col" className="py-1 pr-6 font-medium">
                  Term
                </th>
                <th scope="col" className="py-1 pr-6 text-right font-medium">
                  β (per unit)
                </th>
                <th scope="col" className="py-1 pr-6 text-right font-medium">
                  SE
                </th>
                <th scope="col" className="py-1 text-right font-medium">
                  z
                </th>
              </tr>
            </thead>
            <tbody className="divide-line divide-y">
              <tr>
                <th scope="row" className="py-1 pr-6 font-normal">
                  Intercept
                </th>
                <td className="py-1 pr-6 text-right">
                  {formatDecimal(intercept, 4)}
                </td>
                <td className="py-1 pr-6 text-right">—</td>
                <td className="py-1 text-right">—</td>
              </tr>
              {coefficients.map((c) => (
                <tr key={c.term}>
                  <th scope="row" className="py-1 pr-6 font-normal">
                    {c.label}
                  </th>
                  <td className="py-1 pr-6 text-right">
                    {formatDecimal(c.beta, 4)}
                  </td>
                  <td className="py-1 pr-6 text-right">
                    {formatDecimal(c.se, 4)}
                  </td>
                  <td className="py-1 text-right">{formatDecimal(c.z)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
