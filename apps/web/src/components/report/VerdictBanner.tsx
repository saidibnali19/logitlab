import { VERDICT_CLASS, VERDICT_ICON } from "@/lib/verdict";
import type { Verdict } from "@/lib/report/types";

/** The one-line verdict that opens every section. */
export function VerdictBanner({ verdict }: { verdict: Verdict }) {
  const Icon = VERDICT_ICON[verdict.level];

  return (
    <div className={`verdict-card flex gap-3 ${VERDICT_CLASS[verdict.level]}`}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <p>{verdict.text}</p>
    </div>
  );
}
