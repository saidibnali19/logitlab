import { HistogramPanel } from "@/components/report/explore/HistogramPanel";
import type { OutcomeHistogram } from "@/lib/report/types";

/** Every measurement split by outcome, as small multiples so they can be compared at a glance. */
export function OutcomeHistograms({
  histograms,
  negativeLabel,
  positiveLabel,
}: {
  histograms: OutcomeHistogram[];
  negativeLabel: string;
  positiveLabel: string;
}) {
  if (histograms.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-semibold">Distributions by outcome</h3>
      <div className="text-ink-muted mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
        <span className="flex items-center gap-2">
          <span
            className="bg-chart-ref/35 size-2.5 rounded-sm"
            aria-hidden="true"
          />
          {negativeLabel}
        </span>
        <span className="flex items-center gap-2">
          <span className="bg-chart-1 h-0.5 w-3" aria-hidden="true" />
          {positiveLabel}
        </span>
      </div>
      <p className="text-ink-faint mt-1 text-xs">
        Height is the share of each group in a bin, so the two groups compare
        fairly even though one is much larger.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {histograms.map((histogram) => (
          <HistogramPanel
            key={histogram.column}
            histogram={histogram}
            negativeLabel={negativeLabel}
            positiveLabel={positiveLabel}
          />
        ))}
      </div>
    </div>
  );
}
