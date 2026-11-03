import { CheckCard } from "@/components/report/assumptions/CheckCard";
import type { AssumptionCheck } from "@/lib/report/types";

/** Every check the engine ran. A refusal comes first, across the full width. */
export function CheckGrid({ checks }: { checks: AssumptionCheck[] }) {
  const refused = checks.filter((check) => check.verdict.level === "refuse");
  const rest = checks.filter((check) => check.verdict.level !== "refuse");

  return (
    <div>
      <h3 className="text-lg font-semibold">The checks</h3>
      <ul className="mt-3 grid gap-4 md:grid-cols-2">
        {refused.map((check) => (
          <li key={check.id} className="md:col-span-2">
            <CheckCard check={check} />
          </li>
        ))}
        {rest.map((check) => (
          <li key={check.id}>
            <CheckCard check={check} />
          </li>
        ))}
      </ul>
    </div>
  );
}
