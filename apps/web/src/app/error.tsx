"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { useReport } from "@/components/report/ReportProvider";

/**
 * Shown when something throws while the page renders, for example a result
 * that does not have the shape the report expects. The header stays, so the
 * visitor is never left on a blank screen.
 */
export default function Error({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const { reset } = useReport();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
        <div className="verdict-card verdict-warn flex gap-4 p-6" role="alert">
          <TriangleAlert className="size-6 shrink-0" aria-hidden="true" />
          <div>
            <h1 className="text-lg font-semibold">
              The report could not be shown
            </h1>
            <p className="mt-2">
              Something in this result was not what the page expected, so it
              stopped rather than show numbers it could not stand behind.
            </p>
            {/* The report state sits above this boundary, so it has to be cleared or the same result throws again. */}
            <button
              type="button"
              onClick={() => {
                reset();
                retry();
              }}
              className="btn btn-primary mt-4"
            >
              Start over
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
