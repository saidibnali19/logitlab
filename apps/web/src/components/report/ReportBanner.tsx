"use client";

import { RotateCcw } from "lucide-react";

import type { Meta } from "@/lib/report/types";

import { useReport } from "./ReportProvider";

/** The slim header shown in place of the hero once a result exists. */
export function ReportBanner({ meta }: { meta: Meta }) {
  const { reset } = useReport();

  return (
    <section
      aria-labelledby="report-heading"
      className="border-line bg-surface border-b"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-6 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-ink-faint text-sm">
              {meta.source === "sample" ? "Sample dataset" : "Your file"}
            </p>
            <h2
              id="report-heading"
              tabIndex={-1}
              className="text-2xl font-semibold outline-none"
            >
              {meta.datasetName}
            </h2>
            <p className="text-ink-muted mt-1 text-sm">
              {meta.rows.toLocaleString("en-US")} rows ·{" "}
              {meta.events.toLocaleString("en-US")} events (
              {(meta.prevalence * 100).toFixed(1)}%) ·{" "}
              {meta.columns.toLocaleString("en-US")} columns
            </p>
          </div>

          <button
            type="button"
            onClick={reset}
            className="btn btn-outline btn-sm"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Start over
          </button>
        </div>

        {meta.notes.length > 0 ? (
          <details className="text-ink-muted text-sm">
            <summary className="cursor-pointer font-medium">
              How this analysis was run
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {meta.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </section>
  );
}
