"use client";

import { useReport } from "./ReportProvider";

/** A development-only readout of the report state. Renders nothing in production. */
export function StateDebugStrip() {
  const { state, loadSample, reset } = useReport();

  if (process.env.NODE_ENV !== "development") return null;

  let detail = "";
  if (state.status === "loading") detail = `loading ${state.source}`;
  if (state.status === "ready") {
    const { meta } = state.result;
    detail = `${meta.datasetName}, ${meta.rows} rows, ${meta.status}`;
  }
  if (state.status === "error")
    detail = `${state.error.kind}: ${state.error.message}`;

  return (
    <div className="border-line bg-surface text-ink fixed bottom-3 left-3 z-50 max-w-xs rounded-lg border p-3 text-xs shadow-lg">
      <p className="font-mono">
        state: <strong>{state.status}</strong>
      </p>
      {detail ? <p className="text-ink/70 mt-1">{detail}</p> : null}
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={() => void loadSample()}
          className="border-line hover:bg-canvas rounded border px-2 py-1"
        >
          Load sample
        </button>
        <button
          type="button"
          onClick={reset}
          className="border-line hover:bg-canvas rounded border px-2 py-1"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
