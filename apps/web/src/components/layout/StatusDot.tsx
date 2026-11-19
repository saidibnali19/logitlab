import { VERDICT_DOT } from "@/lib/verdict";
import type { Level } from "@/lib/report/types";

/** A section's verdict as a small dot. Hollow when the section was not run. */
export function StatusDot({ level }: { level: Level | null }) {
  return (
    <span
      aria-hidden="true"
      className={`size-2 shrink-0 rounded-full ${
        level ? VERDICT_DOT[level] : "border-line-strong border"
      }`}
    />
  );
}
