import type { ReactNode } from "react";
import { MiniForestPlot } from "@/components/hero/MiniForestPlot";
import { MiniRocCurve } from "@/components/hero/MiniRocCurve";
import { MiniAssumptionCards } from "@/components/hero/MiniAssumptionCards";
import { PREVIEW_LABEL } from "@/lib/preview-data";

function PreviewCard({
  title,
  caption,
  badge,
  children,
}: {
  title: string;
  caption: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium">{title}</h3>
        {badge && <span className="badge badge-warn">{badge}</span>}
      </div>
      <p className="text-ink-muted mb-3 text-xs">{caption}</p>
      {children}
    </div>
  );
}
export function ProductPreview() {
  return (
    <section
      aria-label="Preview of a LogitLab report"
      className="reveal-up reveal-delay-400 mt-4"
    >
      <div className="flex justify-center">
        <span className="badge badge-outline">{PREVIEW_LABEL}</span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr_1fr]">
        <PreviewCard
          title="Which factors matter"
          caption="Odds ratio per 1 SD, log scale"
        >
          <MiniForestPlot />
        </PreviewCard>

        <PreviewCard
          title="How well does it work?"
          caption="ROC curve, AUC 0.66 (modest)"
        >
          <MiniRocCurve />
        </PreviewCard>

        <PreviewCard
          title="Assumption checks"
          caption="Verdicts, not rubber stamps"
        >
          <MiniAssumptionCards />
        </PreviewCard>
      </div>

      <p className="text-ink-muted mt-3 text-center text-xs">
        Values are from the project report (weighted model), rescaled to per-SD.
        The ROC shape is approximate. The live app refits your data and may
        differ slightly.
      </p>
    </section>
  );
}
