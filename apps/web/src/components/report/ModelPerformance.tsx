import { SectionShell } from "@/components/ui/SectionShell";
import { CalibrationPlot } from "@/components/report/performance/CalibrationPlot";
import { PerformanceView } from "@/components/report/performance/PerformanceView";
import { TestingSummary } from "@/components/report/performance/TestingSummary";
import { VerdictBanner } from "@/components/report/VerdictBanner";

import type { DataGlance, Performance } from "@/lib/report/types";

/** How well the model separates cases from non-cases, and whether its risks can be trusted. */
export function ModelPerformance({
  data,
  target,
}: {
  data: Performance;
  target: DataGlance["target"];
}) {
  return (
    <SectionShell id="performance">
      <div className="space-y-8">
        <VerdictBanner verdict={data.verdict} />
        <TestingSummary split={data.split} auc={data.auc} />
        <PerformanceView
          data={data}
          negativeLabel={target.negativeLabel}
          positiveLabel={target.positiveLabel}
        />
        <CalibrationPlot calibration={data.calibration} />
      </div>
    </SectionShell>
  );
}
