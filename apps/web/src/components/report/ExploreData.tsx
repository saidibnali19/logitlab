import { SectionShell } from "@/components/ui/SectionShell";
import { CorrelationHeatmap } from "@/components/report/explore/CorrelationHeatmap";
import { OutcomeHistograms } from "@/components/report/explore/OutcomeHistograms";
import { OutcomeRates } from "@/components/report/explore/OutcomeRates";
import { StrongestPairs } from "@/components/report/explore/StrongestPairs";
import { SummaryTables } from "@/components/report/explore/SummaryTables";
import { VerdictBanner } from "@/components/report/VerdictBanner";

import type { DataGlance, Eda } from "@/lib/report/types";

export function ExploreData({
  data,
  target,
  prevalence,
}: {
  data: Eda;
  target: DataGlance["target"];
  prevalence: number;
}) {
  return (
    <SectionShell id="explore">
      <div className="space-y-8">
        <VerdictBanner verdict={data.verdict} />
        <SummaryTables
          continuous={data.continuous}
          categorical={data.categorical}
        />
        <OutcomeHistograms
          histograms={data.histograms}
          negativeLabel={target.negativeLabel}
          positiveLabel={target.positiveLabel}
        />
        <OutcomeRates
          rates={data.outcomeRates}
          prevalence={prevalence}
          positiveLabel={target.positiveLabel}
        />
        {data.correlation.labels.length > 1 ? (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <CorrelationHeatmap correlation={data.correlation} />
            <StrongestPairs correlation={data.correlation} />
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
