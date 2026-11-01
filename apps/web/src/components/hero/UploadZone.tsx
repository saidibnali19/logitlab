"use client";

import {
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import {
  CircleCheck,
  CloudUpload,
  Info,
  LoaderCircle,
  OctagonX,
} from "lucide-react";

import { MAX_UPLOAD_MB, useReport } from "@/components/report/ReportProvider";

export function UploadZone() {
  type UploadStatus =
    "idle" | "hover" | "invalid" | "notice" | "loading" | "success";

  const PREVIEW_STATES: UploadStatus[] = [
    "idle",
    "hover",
    "invalid",
    "notice",
    "loading",
    "success",
  ];

  // Full class names written out, so Tailwind can always see them.
  const ZONE_CLASS: Record<UploadStatus, string> = {
    idle: "dropzone-idle",
    hover: "dropzone-hover",
    invalid: "dropzone-invalid animate-shake",
    notice: "dropzone-notice",
    loading: "dropzone-loading",
    success: "dropzone-success",
  };

  const { state, loadUpload, reset } = useReport();
  const [dragging, setDragging] = useState(false);
  // DEV ONLY: lets you look at any state while designing.
  const [preview, setPreview] = useState<UploadStatus | null>(null);

  // What the zone shows is worked out from the report state, never stored twice.
  let status: UploadStatus = "idle";
  let message = "";
  if (state.status === "loading") {
    status = "loading";
  } else if (state.status === "ready") {
    status = "success";
  } else if (dragging) {
    status = "hover";
  } else if (state.status === "error") {
    status = state.error.kind === "backend-unavailable" ? "notice" : "invalid";
    message = state.error.message;
  }

  if (preview !== null && state.status === "empty") {
    status = preview;
    if (preview === "invalid") {
      message = "That's an Excel file. Export it as CSV and try again.";
    }
    if (preview === "notice") {
      message =
        "Analysing your own file needs the engine, which is not connected in this version. Your file was not read or sent anywhere. Try the sample instead.";
    }
  }

  const locked = status === "loading" || status === "success";
  const loadingUpload = state.status === "loading" && state.source === "upload";
  const dataset = state.status === "ready" ? state.result.meta : null;
  const datasetName = dataset?.datasetName ?? "Framingham Heart Study";
  const rowsText = (dataset?.rows ?? 4240).toLocaleString("en-US");
  const finished =
    dataset?.status === "refused"
      ? "the analysis was stopped"
      : "ready for analysis";

  function handleFile(file: File) {
    setPreview(null);
    loadUpload(file);
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // lets the same file be picked again
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!locked) setDragging(true);
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    // Ignore the leave event fired when moving over a child element.
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    setDragging(false);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (locked) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function startOver() {
    setPreview(null);
    reset();
  }

  let body: ReactNode;

  if (!locked) {
    body = (
      <label className="flex cursor-pointer flex-col items-center gap-1">
        <input
          id="data-upload"
          type="file"
          accept=".csv,text/csv"
          onChange={onPick}
          className="sr-only"
        />
        {status === "invalid" || status === "notice" ? (
          <>
            {status === "invalid" ? (
              <OctagonX className="size-8" aria-hidden="true" />
            ) : (
              <Info className="size-8" aria-hidden="true" />
            )}
            <span className="mt-2 font-medium">{message}</span>
            <span className="text-sm">
              Drop another file or{" "}
              <span className="underline underline-offset-4">browse</span>
            </span>
          </>
        ) : (
          <>
            <CloudUpload className="text-brand size-8" aria-hidden="true" />
            <span className="mt-2 text-base font-medium">
              {status === "hover" ? (
                "Release to upload"
              ) : (
                <>
                  Drop a CSV here or{" "}
                  <span className="text-brand underline underline-offset-4">
                    browse
                  </span>
                </>
              )}
            </span>
            <span className="text-ink-muted text-sm">
              CSV only, up to {MAX_UPLOAD_MB} MB, one row per observation.
            </span>
          </>
        )}
      </label>
    );
  } else if (status === "loading") {
    body = (
      <div className="flex w-full flex-col items-center gap-1">
        <LoaderCircle
          className="text-brand size-8 animate-spin"
          aria-hidden="true"
        />
        <p className="mt-2 font-medium">
          {loadingUpload ? "Reading your file…" : "Loading the sample…"}
        </p>
        <p className="text-ink-muted text-sm">{datasetName}</p>
        <div className="bg-surface-sunken mt-3 h-1.5 w-full max-w-xs rounded-full">
          <div className="bg-brand h-full w-2/3 animate-pulse rounded-full" />
        </div>
      </div>
    );
  } else {
    body = (
      <div className="flex flex-col items-center gap-1">
        <CircleCheck className="text-pass size-8" aria-hidden="true" />
        <p className="mt-2 font-medium">{datasetName}</p>
        <p className="text-sm">
          {rowsText} rows · {finished}
        </p>
        <button
          type="button"
          onClick={startOver}
          className="btn btn-outline btn-sm mt-3"
        >
          Start over
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`dropzone ${ZONE_CLASS[status]}`}
      >
        <div aria-live="polite">{body}</div>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="text-ink-faint mt-3 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span>Preview state:</span>
          {PREVIEW_STATES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setPreview(s)}
              className={`badge cursor-pointer ${
                status === s ? "badge-brand" : "badge-outline"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
