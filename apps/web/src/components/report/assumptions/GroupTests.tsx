import { formatDecimal, formatP } from "@/lib/format";
import type { GroupTest } from "@/lib/report/types";

/** Overlapping predictors are kept together and tested as a set, not dropped. */
export function GroupTests({ groups }: { groups: GroupTest[] }) {
  if (groups.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold">
        Related predictors, tested together
      </h3>
      <p className="text-ink-muted mt-1 text-sm">
        Predictors that move together are kept and given one joint test, so
        their shared signal is not lost between them.
      </p>
      <ul className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <li key={group.id} className="card flex flex-col gap-2 p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h4 className="font-semibold">{group.label}</h4>
              <span
                className={`badge ${group.significant ? "badge-brand" : "badge-outline"}`}
              >
                {group.significant ? "Clear evidence" : "No clear evidence"}
              </span>
            </div>
            <p className="text-ink-muted text-xs">{group.reason}</p>
            <p className="font-mono text-xs tabular-nums">
              χ² = {formatDecimal(group.statistic, 1)} · df = {group.df} ·{" "}
              {formatP(group.pValue)} · highest VIF{" "}
              {formatDecimal(group.maxVif)}
            </p>
            <p className="text-sm">{group.interpretation}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
