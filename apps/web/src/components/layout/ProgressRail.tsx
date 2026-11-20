"use client";

import { StatusDot } from "@/components/layout/StatusDot";
import { useReport } from "@/components/report/ReportProvider";
import {
  REPORT_SECTIONS,
  SECTION_IDS,
  type SectionId,
} from "@/lib/report-sections";
import { sectionLevels } from "@/lib/report/status";
import type { Level } from "@/lib/report/types";
import { useActiveSection } from "@/lib/use-active-section";
import { verdictWord } from "@/lib/verdict";
import Link from "next/link";

/**
 * Section links down the left edge, each with the engine's verdict as a dot.
 * Only on wide screens, where the margin beside the report has room for it;
 * narrower screens get the SectionBar instead.
 */
export function ProgressRail() {
  const { state } = useReport();
  if (state.status !== "ready") return null;
  return <Rail levels={sectionLevels(state.result)} />;
}

function Rail({ levels }: { levels: Record<SectionId, Level | null> }) {
  const active = useActiveSection(SECTION_IDS);
  const row =
    "-ml-px flex items-center gap-2 border-l-2 py-1.5 pr-1 pl-3 text-xs";

  return (
    <nav
      aria-label="Report sections"
      // Hidden (and out of the tab order) above the first section and below the last.
      className={`fixed top-1/2 left-4 z-30 hidden w-28 -translate-y-1/2 transition-[opacity,visibility] duration-200 xl:block print:hidden ${
        active ? "visible opacity-100" : "invisible opacity-0"
      }`}
    >
      <ol className="border-line border-l">
        {REPORT_SECTIONS.map((section) => {
          const level = levels[section.id];
          const label = (
            <>
              <StatusDot level={level} />
              <span>
                {section.short}
                <span className="sr-only">, {verdictWord(level)}</span>
              </span>
            </>
          );

          return (
            <li key={section.id}>
              {level === null ? (
                <span
                  className={`${row} text-ink-faint border-transparent`}
                  title={`${section.title}: not run`}
                >
                  {label}
                </span>
              ) : (
                <Link
                  href={`#${section.id}`}
                  title={section.title}
                  aria-current={section.id === active ? "location" : undefined}
                  className={`${row} focus-visible:outline-focus rounded-r-md transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    section.id === active
                      ? "border-brand text-ink font-medium"
                      : "text-ink-muted hover:text-ink border-transparent"
                  }`}
                >
                  {label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
