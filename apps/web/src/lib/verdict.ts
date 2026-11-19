import { CircleCheck, Info, OctagonX, TriangleAlert } from "lucide-react";

import type { Level } from "@/lib/report/types";

/** How each verdict level looks. The engine picks the level; this only styles it. */

// Full class names written out, so Tailwind can always see them.
export const VERDICT_CLASS: Record<Level, string> = {
  pass: "verdict-pass",
  warn: "verdict-warn",
  refuse: "verdict-refuse",
  info: "verdict-info",
};

export const VERDICT_BADGE: Record<Level, string> = {
  pass: "badge-pass",
  warn: "badge-warn",
  refuse: "badge-refuse",
  info: "badge-outline",
};

export const VERDICT_ICON: Record<Level, typeof Info> = {
  pass: CircleCheck,
  warn: TriangleAlert,
  refuse: OctagonX,
  info: Info,
};

// For the small dots in the section navigation, where an icon would not fit.
export const VERDICT_DOT: Record<Level, string> = {
  pass: "bg-pass",
  warn: "bg-warn",
  refuse: "bg-refuse",
  info: "bg-ink-faint",
};

/** The level in words, for screen readers: a dot's colour alone says nothing to them. */
export function verdictWord(level: Level | null): string {
  switch (level) {
    case "pass":
      return "passed";
    case "warn":
      return "needs attention";
    case "refuse":
      return "stopped";
    case "info":
      return "for information";
    default:
      return "not run";
  }
}
