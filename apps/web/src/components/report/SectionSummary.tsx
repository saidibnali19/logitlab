import { CircleCheck, Info, OctagonX, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

import type { Level, Verdict } from "@/lib/report/types";

export type Fact = { label: string; value: string };

// Full class names written out, so Tailwind can always see them.
const LEVEL_CLASS: Record<Level, string> = {
  pass: "border-pass-line bg-pass-soft text-pass-ink",
  warn: "border-warn-line bg-warn-soft text-warn-ink",
  refuse: "border-refuse-line bg-refuse-soft text-refuse-ink",
  info: "border-line bg-surface text-ink",
};

const LEVEL_ICON: Record<Level, typeof Info> = {
  pass: CircleCheck,
  warn: TriangleAlert,
  refuse: OctagonX,
  info: Info,
};

/**
 * A plain stand-in that proves real engine values reach a section.
 * Each real section replaces its summary in Phase 2.
 */
export function SectionSummary({
  heading,
  verdict,
  facts,
  children,
}: {
  heading?: string;
  verdict: Verdict;
  facts?: Fact[];
  children?: ReactNode;
}) {
  const Icon = LEVEL_ICON[verdict.level];

  return (
    <div className="mb-6 space-y-4">
      {heading ? (
        <p className="text-ink-faint text-xs font-medium tracking-wide uppercase">
          {heading}
        </p>
      ) : null}

      <div
        className={`flex gap-3 rounded-xl border p-4 ${LEVEL_CLASS[verdict.level]}`}
      >
        <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p>{verdict.text}</p>
      </div>

      {facts && facts.length > 0 ? (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-ink-faint text-xs">{fact.label}</dt>
              <dd className="font-medium tabular-nums">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {children}
    </div>
  );
}
