import { VERDICT_CLASS } from "@/lib/verdict";
import type { DataColumn, DataFlag } from "@/lib/report/types";

const KIND_TITLE: Record<DataFlag["kind"], string> = {
  id: "Looks like an ID column",
  constant: "Never changes",
  leakage: "Possible leakage",
  redundant: "Near-duplicate predictors",
  rare: "Very rare category",
};

/** Things in the data worth reading before trusting the model. */
export function FlagList({
  flags,
  columns,
}: {
  flags: DataFlag[];
  columns: DataColumn[];
}) {
  if (flags.length === 0) return null;

  const labelOf = (name: string) =>
    columns.find((c) => c.name === name)?.label ?? name;

  return (
    <div>
      <h3 className="text-lg font-semibold">Worth reading</h3>
      <ul className="mt-3 space-y-3">
        {flags.map((flag) => (
          <li
            key={`${flag.kind}-${flag.column}`}
            className={`verdict-card ${VERDICT_CLASS[flag.level]}`}
          >
            <p className="font-medium">
              {KIND_TITLE[flag.kind]}:{" "}
              {[flag.column, ...flag.related].map(labelOf).join(" and ")}
            </p>
            <p className="mt-1 text-sm">{flag.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
