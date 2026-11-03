import type { DecisionLogEntry } from "@/lib/report/types";

const STEP_LABEL: Record<DecisionLogEntry["step"], string> = {
  ingest: "Reading the file",
  roles: "Column roles",
  imputation: "Filling gaps",
  outliers: "Unusual values",
  encoding: "Encoding",
  assumptions: "Assumption checks",
  model: "The model",
  threshold: "The cut-off",
};

/** Every automatic choice, in order, with the reason for it. */
export function DecisionLog({ entries }: { entries: DecisionLogEntry[] }) {
  // Consecutive entries about the same step are shown together.
  const groups: {
    step: DecisionLogEntry["step"];
    items: DecisionLogEntry[];
  }[] = [];
  for (const entry of entries) {
    const last = groups[groups.length - 1];
    if (last && last.step === entry.step) last.items.push(entry);
    else groups.push({ step: entry.step, items: [entry] });
  }

  // Open by default: the log is the heart of this section, not a footnote.
  return (
    <details open className="border-line bg-surface rounded-card group border">
      <summary className="focus-visible:outline-focus rounded-card cursor-pointer px-5 py-4 font-medium focus-visible:outline-2 focus-visible:outline-offset-2">
        Decision log
        <span className="text-ink-muted ml-2 text-sm font-normal">
          {entries.length} automatic choices, each with its reason
        </span>
      </summary>

      <div className="border-line space-y-6 border-t px-5 py-5">
        <p className="text-ink-muted text-sm">
          Nothing here was decided silently. Where a different choice was
          possible it is shown as a button. Picking one needs the live engine,
          which is not connected in this version, so the buttons are switched
          off.
        </p>

        {groups.map((group, index) => (
          <section
            key={`${group.step}-${index}`}
            aria-labelledby={`log-${index}`}
          >
            <h4
              id={`log-${index}`}
              className="text-ink-faint text-xs font-medium tracking-wide uppercase"
            >
              {STEP_LABEL[group.step]}
            </h4>
            <ol className="mt-2 space-y-3">
              {group.items.map((entry) => (
                <li key={entry.id} className="text-sm">
                  <p className="font-medium">{entry.decision}</p>
                  <p className="text-ink-muted">{entry.reason}</p>
                  {entry.alternative ? (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm mt-2"
                      disabled
                    >
                      {entry.alternative}
                    </button>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </details>
  );
}
