import { SCHEMA_VERSION, type AnalysisResult } from "./types";

/** Where the Framingham sample result lives. Fetched at runtime, never bundled. */
export const SAMPLE_URL = "/samples/framingham.result.json";

export type LoadErrorKind = "network" | "malformed" | "version";
export type LoadError = { kind: LoadErrorKind; message: string };

export type LoadOutcome =
  { ok: true; result: AnalysisResult } | { ok: false; error: LoadError };

function fail(kind: LoadErrorKind, message: string): LoadOutcome {
  return { ok: false, error: { kind, message } };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Checks that parsed JSON is a result this version of the app can read.
 * The engine already validates the full shape when it writes the file, so
 * this only guards the things that can drift: the version and the top level.
 */
export function readResult(value: unknown): LoadOutcome {
  if (!isObject(value) || !isObject(value.meta)) {
    return fail("malformed", "The result file is not in the expected format.");
  }
  if (value.meta.schemaVersion !== SCHEMA_VERSION) {
    return fail(
      "version",
      "This result was made by a different version of the engine than this page expects.",
    );
  }
  const blocks = ["dataGlance", "hygiene", "eda", "assumptions", "takeaways"];
  if (blocks.some((block) => !isObject(value[block]))) {
    return fail(
      "malformed",
      "The result file is missing some of its sections.",
    );
  }
  return { ok: true, result: value as unknown as AnalysisResult };
}

export async function loadSampleResult(): Promise<LoadOutcome> {
  let response: Response;
  try {
    response = await fetch(SAMPLE_URL, { cache: "no-store" });
  } catch {
    return fail(
      "network",
      "The sample could not be loaded. Check your connection and try again.",
    );
  }
  if (!response.ok) {
    return fail(
      "network",
      `The sample could not be loaded (status ${response.status}).`,
    );
  }

  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    return fail("malformed", "The sample file could not be read.");
  }
  return readResult(parsed);
}
