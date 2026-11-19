"use client";

import { useEffect, useRef } from "react";

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

/**
 * The same section links as the ProgressRail, for screens too narrow for it:
 * a bar under the header that sticks while the report is on screen and
 * scrolls sideways when the chips do not all fit.
 */
export function SectionBar() {
  const { state } = useReport();
  if (state.status !== "ready") return null;
  return <Bar levels={sectionLevels(state.result)} />;
}

function Bar({ levels }: { levels: Record<SectionId, Level | null> }) {
  const active = useActiveSection(SECTION_IDS);
  const list = useRef<HTMLUListElement>(null);

  // Keep the current chip in view as the reader moves down the report.
  useEffect(() => {
    const scroller = list.current;
    const chip = scroller?.querySelector<HTMLElement>(
      '[aria-current="location"]',
    );
    if (!scroller || !chip) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    scroller.scrollTo({
      left: chip.offsetLeft - (scroller.clientWidth - chip.clientWidth) / 2,
      behavior: reduce ? "auto" : "smooth",
    });
  }, [active]);

  return (
    <nav
      aria-label="Report sections"
      className="border-line bg-surface/90 sticky top-14 z-30 border-b backdrop-blur xl:hidden print:hidden"
    >
      <ul
        ref={list}
        className="relative mx-auto flex max-w-5xl [scrollbar-width:none] gap-2 overflow-x-auto px-4 py-2 sm:px-6"
      >
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
            <li key={section.id} className="shrink-0">
              {level === null ? (
                <span
                  className="badge badge-outline whitespace-nowrap opacity-60"
                  title={`${section.title}: not run`}
                >
                  {label}
                </span>
              ) : (
                <a
                  href={`#${section.id}`}
                  title={section.title}
                  aria-current={section.id === active ? "location" : undefined}
                  className={`badge focus-visible:outline-focus whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    section.id === active
                      ? "badge-brand"
                      : "badge-outline hover:text-ink"
                  }`}
                >
                  {label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
