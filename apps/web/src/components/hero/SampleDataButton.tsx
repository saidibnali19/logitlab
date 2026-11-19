"use client";

import { ArrowRight, Database, LoaderCircle } from "lucide-react";

import { useReport } from "@/components/report/ReportProvider";
import { REFUSED_SAMPLE_URL } from "@/lib/report/load";

/** The main action: open the prepared example, or the one the engine refuses. */
export function SampleDataButton() {
  const { state, loadSample } = useReport();
  const busy = state.status === "loading";

  return (
    <div className="flex flex-col items-center gap-4">
      {/* The id is where keyboard focus returns after "Start over". */}
      <button
        id="try-sample"
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

      <p className="text-ink-muted text-center text-sm">
        A real, messy dataset: 10-year heart disease risk in Framingham
        participants.
      </p>

      {/* A failed load must say so; the button above stays usable to try again. */}
      {state.status === "error" ? (
        <p role="alert" className="verdict-card verdict-refuse w-full text-sm">
          {state.error.message}
        </p>
      ) : null}

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
