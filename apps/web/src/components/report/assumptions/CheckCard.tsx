import { VERDICT_CLASS, VERDICT_ICON } from "@/lib/verdict";
import type {
  AssumptionAction,
  AssumptionCheck,
  Level,
} from "@/lib/report/types";

// Passes stay calm so that the cards needing attention stand out.
// Full class names written out, so Tailwind can always see them.
const CARD_CLASS: Record<Level, string> = {
  pass: VERDICT_CLASS.info,
  info: VERDICT_CLASS.info,
  warn: VERDICT_CLASS.warn,
  refuse: VERDICT_CLASS.refuse,
};

const ICON_CLASS: Record<Level, string> = {
  pass: "text-pass",
  info: "text-ink-faint",
  warn: "",
  refuse: "",
};

const ACTION: Record<AssumptionAction, { label: string; badge: string }> = {
  kept: { label: "Kept", badge: "badge-outline" },
  "remedy-offered": { label: "Remedy offered", badge: "badge-warn" },
  "remedy-applied": { label: "Remedy applied", badge: "badge-pass" },
  refused: { label: "Refused", badge: "badge-refuse" },
};

/** One assumption: the verdict, what the tool did about it, and why. */
export function CheckCard({ check }: { check: AssumptionCheck }) {
  const level = check.verdict.level;
  const Icon = VERDICT_ICON[level];
  const action = ACTION[check.action];
  const offered = check.remedies.filter((remedy) => !remedy.applied);

  return (
    <div className={`verdict-card h-full ${CARD_CLASS[level]}`}>
      <div className="flex items-start gap-3">
        <Icon
          className={`mt-0.5 size-5 shrink-0 ${ICON_CLASS[level]}`}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-semibold">{check.title}</h4>
            <span className={`badge ${action.badge}`}>{action.label}</span>
          </div>
          <p className="mt-1 text-sm">{check.verdict.text}</p>

          <details className="mt-2 text-sm">
            <summary className="cursor-pointer font-medium opacity-80">
              Why
            </summary>
            <p className="mt-1 opacity-90">{check.detail}</p>
          </details>

          {check.remedies.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {check.remedies.map((remedy) => (
                <li key={remedy.id} className="text-sm">
                  {remedy.applied ? (
                    <span className="badge badge-pass">
                      Applied: {remedy.label}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled
                    >
                      {remedy.label}
                    </button>
                  )}
                  <p className="mt-1 text-xs opacity-80">
                    {remedy.description}
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
          {offered.length > 0 ? (
            <p className="mt-2 text-xs opacity-80">
              Choosing a remedy needs the live engine, which is not connected in
              this version.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
