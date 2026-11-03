import { formatDecimal, formatValue } from "@/lib/format";
import type { Imputation } from "@/lib/report/types";

/** How each gap was filled, why that rule was chosen, and what filling did to the column. */
export function ImputationTable({
  imputations,
}: {
  imputations: Imputation[];
}) {
  if (imputations.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold">How the gaps were filled</h3>
      <div className="border-line bg-surface rounded-card mt-3 overflow-x-auto border">
        <table className="w-full min-w-160 text-left text-sm">
          <caption className="sr-only">
            For each column with gaps: the fill rule, the fill value, the
            skewness that drove the choice, and the column&apos;s mean and
            spread before and after filling.
          </caption>
          <thead className="bg-surface-sunken text-ink-muted text-xs tracking-wide uppercase">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Column and reason
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Rule
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Fill value
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Skewness
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Before → after
              </th>
            </tr>
          </thead>
          <tbody className="divide-line divide-y align-top">
            {imputations.map((item) => (
              <tr key={item.column}>
                <th
                  scope="row"
                  className="max-w-sm px-4 py-3 text-left font-normal"
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-ink-muted mt-0.5 block text-xs">
                    {item.reason}
                  </span>
                </th>
                <td className="px-4 py-3">
                  <span className="badge badge-outline">{item.method}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatValue(item.fillValue)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {item.skewness === null ? "—" : formatDecimal(item.skewness)}
                </td>
                <td className="px-4 py-3 text-xs tabular-nums">
                  {item.before && item.after ? (
                    <>
                      <span className="block">
                        mean {formatDecimal(item.before.mean)} →{" "}
                        {formatDecimal(item.after.mean)}
                      </span>
                      <span className="block">
                        SD {formatDecimal(item.before.sd)} →{" "}
                        {formatDecimal(item.after.sd)}
                      </span>
                    </>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
