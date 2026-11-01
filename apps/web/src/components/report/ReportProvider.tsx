"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { loadSampleResult, type LoadError } from "@/lib/report/load";
import {
  isComplete,
  type AnalysisResult,
  type CompleteResult,
} from "@/lib/report/types";

/** Longest file the page will accept. Real uploads arrive in a later phase. */
export const MAX_UPLOAD_MB = 25;

/** A short pause so the loading state is seen, not a flash. */
const MIN_LOADING_MS = 600;

export type ReportError =
  | LoadError
  | { kind: "invalid-file"; message: string }
  | { kind: "backend-unavailable"; message: string };

export type ReportState =
  | { status: "empty" }
  | { status: "loading"; source: "sample" | "upload" }
  | { status: "ready"; result: AnalysisResult }
  | { status: "error"; error: ReportError };

type ReportContextValue = {
  state: ReportState;
  loadSample: () => Promise<void>;
  /** Checks the file without reading it, then explains that analysis is not connected yet. */
  loadUpload: (file: File) => void;
  reset: () => void;
};

const ReportContext = createContext<ReportContextValue | null>(null);

export function ReportProvider({ children }: { children: ReactNode }) {
  // Held in memory only: nothing is written to the browser's storage.
  const [state, setState] = useState<ReportState>({ status: "empty" });
  // Each request gets a number, so a slow one can never overwrite a newer choice.
  const latest = useRef(0);

  const loadSample = useCallback(async () => {
    const id = ++latest.current;
    setState({ status: "loading", source: "sample" });

    const started = performance.now();
    const outcome = await loadSampleResult();
    const remaining = MIN_LOADING_MS - (performance.now() - started);
    if (remaining > 0)
      await new Promise((resolve) => setTimeout(resolve, remaining));

    if (id !== latest.current) return;
    setState(
      outcome.ok
        ? { status: "ready", result: outcome.result }
        : { status: "error", error: outcome.error },
    );
  }, []);

  const loadUpload = useCallback((file: File) => {
    latest.current += 1;

    const looksLikeCsv = /\.csv$/i.test(file.name) || file.type === "text/csv";
    let error: ReportError;
    if (!looksLikeCsv) {
      error = {
        kind: "invalid-file",
        message:
          "That does not look like a CSV file. LogitLab reads .csv files.",
      };
    } else if (file.size === 0) {
      error = { kind: "invalid-file", message: "That file is empty." };
    } else if (file.size > MAX_UPLOAD_MB * 1024 * 1024) {
      error = {
        kind: "invalid-file",
        message: `That file is larger than ${MAX_UPLOAD_MB} MB.`,
      };
    } else {
      error = {
        kind: "backend-unavailable",
        message:
          "Analysing your own file needs the engine, which is not connected in this version. Your file was not read or sent anywhere. Try the sample instead.",
      };
    }
    setState({ status: "error", error });
  }, []);

  const reset = useCallback(() => {
    latest.current += 1;
    setState({ status: "empty" });
  }, []);

  const value = useMemo(
    () => ({ state, loadSample, loadUpload, reset }),
    [state, loadSample, loadUpload, reset],
  );

  return (
    <ReportContext.Provider value={value}>{children}</ReportContext.Provider>
  );
}

export function useReport(): ReportContextValue {
  const context = useContext(ReportContext);
  if (context === null) {
    throw new Error("useReport must be used inside <ReportProvider>.");
  }
  return context;
}

/** The result, but only when it is ready and nothing was refused. Otherwise null. */
export function useCompleteResult(): CompleteResult | null {
  const { state } = useReport();
  return state.status === "ready" && isComplete(state.result)
    ? state.result
    : null;
}
