"use client";

import { ArrowRight, Database, LoaderCircle } from "lucide-react";

import { useReport } from "@/components/report/ReportProvider";
import { REFUSED_SAMPLE_URL } from "@/lib/report/load";

export function SampleDataButton() {
  const { state, loadSample } = useReport();
  const busy = state.status === "loading";

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-ink-faint flex w-full items-center gap-4 text-sm">
        <span className="bg-line h-px flex-1" />
        <span>or</span>
        <span className="bg-line h-px flex-1" />
      </div>

      <button
        type="button"
        onClick={() => void loadSample()}
        disabled={busy}
        aria-busy={busy}
        className="btn btn-primary btn-lg w-full disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-80"
      >
        {busy ? (
          <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
        ) : (
          <Database className="size-5" aria-hidden="true" />
        )}
        {busy ? "Loading the sample…" : "Try with Framingham data"}
        <ArrowRight className="size-5" aria-hidden="true" />
      </button>

      <p className="text-ink-muted text-sm">
        4,240 participants · 10-year heart disease risk · no upload needed
      </p>

      {/* What makes it an opinionated tool: it says no. Shown with a real result, not described. */}
      <button
        type="button"
        onClick={() => void loadSample(REFUSED_SAMPLE_URL)}
        disabled={busy}
        className="text-ink-muted hover:text-ink focus-visible:outline-focus rounded-md text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-60"
      >
        See what LogitLab refuses
      </button>
    </div>
  );
}
