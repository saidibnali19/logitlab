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

export const VERDICT_ICON: Record<Level, typeof Info> = {
  pass: CircleCheck,
  warn: TriangleAlert,
  refuse: OctagonX,
  info: Info,
};
