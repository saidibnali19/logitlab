import { formatInt, formatPercent } from "@/lib/format";
import type { DataColumn, ColumnRole } from "@/lib/report/types";

// Full class names written out, so Tailwind can always see them.
const ROLE_BADGE: Record<ColumnRole, string> = {
  target: "badge-brand",
  predictor: "badge-outline",
  excluded: "badge-warn",
};

/** Every column, with the type and role the tool detected. */
export function ColumnTable({
  columns,
  rows,
}: {
  columns: DataColumn[];
  rows: number;
}) {
  // One explanation per distinct reason, instead of the same sentence on every row.
  const reasons = new Map<string, string[]>();
  for (const column of columns) {
    reasons.set(column.roleReason, [
      ...(reasons.get(column.roleReason) ?? []),
      column.label,
    ]);
  }

  return (
    <div>
      <h3 className="text-lg font-semibold">Your columns</h3>
      <div className="border-line bg-surface rounded-card mt-3 overflow-x-auto border">
        <table className="w-full min-w-152 text-left text-sm">
          <caption className="sr-only">
            Every column in the file, with the type and role the tool detected.
          </caption>
          <thead className="bg-surface-sunken text-ink-muted text-xs tracking-wide uppercase">
            <tr>
              <th scope="col" className="px-4 py-3 font-medium">
                Column
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Type
              </th>
              <th scope="col" className="px-4 py-3 font-medium">
                Role
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Missing
              </th>
              <th scope="col" className="px-4 py-3 text-right font-medium">
                Distinct values
              </th>
            </tr>
          </thead>
          <tbody className="divide-line divide-y">
            {columns.map((column) => (
              <tr key={column.name}>
                <th scope="row" className="px-4 py-3 text-left font-normal">
                  <span className="font-medium">{column.label}</span>
                  <span className="text-ink-faint ml-2 font-mono text-xs">
                    {column.name}
                  </span>
                  {column.type === "categorical" && column.levels ? (
                    <span className="text-ink-muted mt-0.5 block text-xs">
                      Levels:{" "}
                      {column.levels
                        .map((l, i) => (i === 0 ? `${l} (reference)` : l))
                        .join(", ")}
                    </span>
                  ) : null}
                </th>
                <td className="px-4 py-3">
                  <span className="badge badge-outline">{column.type}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge ${ROLE_BADGE[column.role]}`}>
                    {column.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {column.missing === 0
                    ? "None"
                    : `${formatInt(column.missing)} (${formatPercent(column.missing / rows)})`}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {formatInt(column.distinct)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <details className="text-ink-muted mt-3 text-sm">
        <summary className="cursor-pointer font-medium">
          How each role was decided
        </summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {[...reasons.entries()].map(([reason, labels]) => (
            <li key={reason}>
              {reason}{" "}
              <span className="text-ink-faint">({labels.join(", ")})</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
