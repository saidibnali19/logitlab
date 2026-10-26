"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import { CircleCheck, CloudUpload, LoaderCircle, OctagonX } from "lucide-react";

export function UploadZone() {
  type UploadStatus = "idle" | "hover" | "invalid" | "loading" | "success";

  const MAX_BYTES = 10 * 1024 * 1024;
  const FAKE_LOAD_MS = 1500;

  const PREVIEW_STATES: UploadStatus[] = [
    "idle",
    "hover",
    "invalid",
    "loading",
    "success",
  ];

  // Full class names written out, so Tailwind can always see them.
  const ZONE_CLASS: Record<UploadStatus, string> = {
    idle: "dropzone-idle",
    hover: "dropzone-hover",
    invalid: "dropzone-invalid animate-shake",
    loading: "dropzone-loading",
    success: "dropzone-success",
  };

  // Returns a teaching message if the file is unusable, otherwise null.
  function validateFile(file: File): string | null {
    if (/\.(xlsx|xls|xlsm)$/i.test(file.name)) {
      return "That's an Excel file. Export it as CSV and try again.";
    }
    if (!/\.csv$/i.test(file.name)) {
      return "Only CSV files are supported. Export your data as .csv and try again.";
    }
    if (file.size === 0) {
      return "That file is empty. Check the export and try again.";
    }
    if (file.size > MAX_BYTES) {
      return "That file is over 10 MB. Try a smaller sample of rows.";
    }
    return null;
  }

  function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const [status, setStatus] = useState<UploadStatus>("idle");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const interactive =
    status === "idle" || status === "hover" || status === "invalid";

  function clearTimer() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }

  // FAKE: replace this timer with the real upload request later.
  function startFakeLoad() {
    clearTimer();
    setStatus("loading");
    timer.current = setTimeout(() => {
      setStatus("success");
      document
        .getElementById("data-glance")
        ?.scrollIntoView({ behavior: "smooth" });
    }, FAKE_LOAD_MS);
  }

  function handleFile(file: File) {
    const error = validateFile(file);
    setFileName(file.name);
    setFileSize(file.size);
    if (error) {
      clearTimer();
      setMessage(error);
      setStatus("invalid");
      return;
    }
    setMessage("");
    startFakeLoad();
  }

  function onPick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = ""; // lets the same file be picked again
  }

  function onDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (interactive) setStatus("hover");
  }

  function onDragLeave(e: DragEvent<HTMLDivElement>) {
    // Ignore the leave event fired when moving over a child element.
    if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
    if (status === "hover") setStatus("idle");
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (!interactive) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
    else setStatus("idle");
  }

  function reset() {
    clearTimer();
    setStatus("idle");
    setFileName("");
    setFileSize(0);
    setMessage("");
  }

  // DEV ONLY: jump straight to a state so you can inspect its design.
  function preview(next: UploadStatus) {
    clearTimer();
    setFileName(
      next === "loading" || next === "success" ? "framingham.csv" : "",
    );
    setFileSize(next === "success" ? 251_000 : 0);
    setMessage(
      next === "invalid"
        ? "That's an Excel file. Export it as CSV and try again."
        : "",
    );
    setStatus(next);
  }

  let body: ReactNode;

  if (interactive) {
    body = (
      <label className="flex cursor-pointer flex-col items-center gap-1">
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={onPick}
          className="sr-only"
        />
        {status === "invalid" ? (
          <>
            <OctagonX className="size-8" aria-hidden="true" />
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
              CSV only, up to 10 MB, one row per observation.
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
        <p className="mt-2 font-medium">Reading your file…</p>
        <p className="text-ink-muted text-sm">{fileName}</p>
        <div className="bg-surface-sunken mt-3 h-1.5 w-full max-w-xs rounded-full">
          <div className="bg-brand h-full w-2/3 animate-pulse rounded-full" />
        </div>
      </div>
    );
  } else {
    body = (
      <div className="flex flex-col items-center gap-1">
        <CircleCheck className="text-pass size-8" aria-hidden="true" />
        <p className="mt-2 font-medium">{fileName}</p>
        <p className="text-sm">{formatBytes(fileSize)} · ready for analysis</p>
        <button
          type="button"
          onClick={reset}
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
              onClick={() => preview(s)}
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
