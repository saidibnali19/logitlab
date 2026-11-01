import { OctagonX } from "lucide-react";

import type { Refusal } from "@/lib/report/types";

/** Shown instead of the report when the engine decided no honest model was possible. */
export function RefusalCard({ refusal }: { refusal: Refusal | null }) {
  const title = refusal?.title ?? "No model could be fitted";
  const message =
    refusal?.message ??
    "The data did not allow a trustworthy model to be built.";

  return (
    <section
      aria-labelledby="refusal-title"
      className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6"
    >
      <div className="border-refuse-line bg-refuse-soft text-refuse-ink flex gap-4 rounded-xl border p-6">
        <OctagonX className="size-6 shrink-0" aria-hidden="true" />
        <div>
          <h3 id="refusal-title" className="text-lg font-semibold">
            The analysis was stopped: {title}
          </h3>
          <p className="mt-2">{message}</p>
          {refusal?.column ? (
            <p className="mt-2 text-sm">
              Column involved: <code>{refusal.column}</code>
            </p>
          ) : null}
          <p className="mt-4 text-sm">
            LogitLab stops rather than show numbers it cannot stand behind. Fix
            the issue, or use Start over to try another file.
          </p>
        </div>
      </div>
    </section>
  );
}
