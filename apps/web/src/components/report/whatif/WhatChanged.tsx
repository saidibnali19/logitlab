import { formatControlValue } from "@/components/report/whatif/SliderControl";
import type { WhatIfControl } from "@/lib/report/types";
import type { Change } from "@/lib/risk";

function describe(control: WhatIfControl, value: number) {
  return control.kind === "slider"
    ? formatControlValue(control, value)
    : (control.options?.[value]?.label ?? String(value));
}

/** Why the estimate moved: each change from typical, with its effect on the odds alone. */
export function WhatChanged({ changes }: { changes: Change[] }) {
  if (changes.length === 0) return null;

  return (
    <div className="card">
      <h4 className="font-semibold">What changed</h4>
      <ul className="mt-3 space-y-2 text-sm">
        {changes.map(({ control, from, to, multiplier }) => (
          <li
            key={control.column}
            className="flex items-baseline justify-between gap-3"
          >
            <span>
              <span className="font-medium">{control.label}</span>{" "}
              <span className="text-ink-muted">
                {describe(control, to)} instead of {describe(control, from)}
              </span>
            </span>
            {/* Neutral on purpose: higher odds are only bad when the outcome is. */}
            <span className="text-ink shrink-0 font-mono text-xs tabular-nums">
              {multiplier >= 1 ? "↑" : "↓"} odds ×{multiplier.toFixed(2)}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-ink-faint mt-3 text-xs">
        Each multiplier is that change on its own, using the odds ratios from
        section 05. Together they multiply.
      </p>
    </div>
  );
}
