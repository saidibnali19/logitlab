import { formatDecimal, formatPValue } from "@/lib/format";
import { VERDICT_BADGE } from "@/lib/verdict";
import type { Assumptions, Level } from "@/lib/report/types";

const RESULT: Record<Level, string> = {
  pass: "Straight line fits",
  info: "Borderline",
  warn: "Curved",
  refuse: "Refused",
};

/** The Box-Tidwell test for each measurement: does a straight line suit it? */
export function LinearityTests({
  rows,
  threshold,
}: {
  rows: Assumptions["boxTidwell"];
  threshold: number;
}) {
  if (rows.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold">Linearity in the logit</h3>
      <p className="text-ink-muted mt-1 text-sm">
        The model assumes each measurement shifts the log-odds along a straight
        line. A p-value below {formatDecimal(threshold, 4)} (0.05 shared across
        the {rows.length} tests) would say it does not.
      </p>
      <div className="border-line bg-surface rounded-card mt-3 overflow-x-auto border">
        <table className="w-full min-w-96 text-left text-sm">
          <caption className="sr-only">
            Box-Tidwell p-value and result for each continuous predictor.
          </caption>
          <thead className="bg-surface-sunken text-ink-muted text-xs tracking-wide uppercase">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Measurement
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                p-value
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Result
              </th>
            </tr>
          </thead>
          <tbody className="divide-line divide-y">
            {rows.map((row) => (
              <tr key={row.column}>
                <th scope="row" className="px-4 py-3 text-left font-medium">
                  {row.label}
                </th>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatPValue(row.pValue)}
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${VERDICT_BADGE[row.level]}`}>
                    {RESULT[row.level]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
