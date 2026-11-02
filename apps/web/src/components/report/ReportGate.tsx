"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { isComplete } from "@/lib/report/types";

import { RefusalCard } from "./RefusalCard";
import { ReportBanner } from "./ReportBanner";
import { useReport } from "./ReportProvider";

/**
 * Decides what the visitor sees: the hero and outline while there is no
 * result, and the report once there is one. Both arrive as props so the
 * server-rendered pieces stay server-rendered.
 */
export function ReportGate({
  intro,
  children,
}: {
  intro: ReactNode;
  children: ReactNode;
}) {
  const { state } = useReport();
  const previous = useRef(state.status);

  // Move the page and the keyboard focus when the report appears or goes away.
  useEffect(() => {
    const before = previous.current;
    previous.current = state.status;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const behavior = reduce ? "auto" : "smooth";

    if (state.status === "ready" && before !== "ready") {
      document
        .getElementById("report")
        ?.scrollIntoView({ behavior, block: "start" });
      document.getElementById("report-heading")?.focus({ preventScroll: true });
    }
    if (state.status === "empty" && before === "ready") {
      window.scrollTo({ top: 0, behavior });
      document.getElementById("data-upload")?.focus({ preventScroll: true });
    }
  }, [state.status]);

  let announcement = "";
  if (state.status === "ready") {
    announcement = isComplete(state.result)
      ? "Analysis ready. The report has eight sections."
      : "The analysis was stopped. The reason is shown at the top of the report.";
  }

  return (
    <>
      <div role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {state.status === "ready" ? (
        <div id="report">
          <ReportBanner meta={state.result.meta} />
          {isComplete(state.result) ? null : (
            <RefusalCard refusal={state.result.meta.refusal} />
          )}
          {children}
        </div>
      ) : (
        intro
      )}
    </>
  );
}
