import { formatInt } from "@/lib/format";
import type { Hygiene } from "@/lib/report/types";

/** Unusual values are flagged and kept, never silently removed. */
export function OutlierCard({ policy }: { policy: Hygiene["outlierPolicy"] }) {
  return (
    <div className="card">
      <div className="flex flex-wrap items-center gap-3">
        <h3 className="text-lg font-semibold">Unusual values</h3>
        <span className="badge badge-brand">All kept</span>
      </div>
      <p className="text-ink-muted mt-1 text-sm">
        Flagged with the {policy.method} rule.
      </p>

      {policy.flagged.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {policy.flagged.map((item) => (
            <li key={item.column} className="badge badge-outline">
              {item.label}
              <span className="text-ink font-semibold tabular-nums">
                {formatInt(item.count)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm">No unusual values were found.</p>
      )}

      <p className="mt-4 text-sm">{policy.reason}</p>
    </div>
  );
}
