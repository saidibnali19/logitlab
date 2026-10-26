import { CircleCheck, TriangleAlert } from "lucide-react";
import { PREVIEW_CHECKS } from "@/lib/preview-data";

// Full class names written out so Tailwind can see them.
const STYLE = {
  pass: {
    card: "verdict-pass",
    badge: "badge-pass",
    label: "Pass",
    Icon: CircleCheck,
  },
  warn: {
    card: "verdict-warn",
    badge: "badge-warn",
    label: "Review",
    Icon: TriangleAlert,
  },
} as const;

export function MiniAssumptionCards() {
  return (
    <ul className="space-y-2.5">
      {PREVIEW_CHECKS.map((check) => {
        const s = STYLE[check.verdict];
        return (
          <li key={check.title} className={`verdict-card ${s.card} p-3`}>
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-2 text-sm font-medium">
                <s.Icon className="size-4 shrink-0" aria-hidden="true" />
                {check.title}
              </p>
              <span className={`badge ${s.badge}`}>{s.label}</span>
            </div>
            <p className="mt-1 text-xs">{check.detail}</p>
          </li>
        );
      })}
    </ul>
  );
}
