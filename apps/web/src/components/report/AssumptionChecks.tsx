import { SectionShell } from "@/components/ui/SectionShell";
import { CheckGrid } from "@/components/report/assumptions/CheckGrid";
import { EpvMeter } from "@/components/report/assumptions/EpvMeter";
import { GroupTests } from "@/components/report/assumptions/GroupTests";
import { InfluenceSummary } from "@/components/report/assumptions/InfluenceSummary";
import { LinearityTests } from "@/components/report/assumptions/LinearityTests";
import { VifChart } from "@/components/report/assumptions/VifChart";
import { SectionSummary } from "@/components/report/SectionSummary";
import { VerdictBanner } from "@/components/report/VerdictBanner";

import type { Assumptions, Sensitivity } from "@/lib/report/types";

/**
 * The checks first, then the evidence behind them. When the analysis was
 * refused, the evidence lists are empty and those parts render nothing.
 */
export function AssumptionChecks({
  data,
  sensitivity,
}: {
  data: Assumptions;
  sensitivity: Sensitivity | null;
}) {
  return (
    <SectionShell id="assumptions">
      <div className="space-y-8">
        <VerdictBanner verdict={data.verdict} />
        <CheckGrid checks={data.checks} />
        <div className="grid gap-4 md:grid-cols-2">
          <EpvMeter epv={data.epv} />
          <InfluenceSummary influence={data.influence} />
        </div>
        <VifChart vif={data.vif} limit={data.vifLimit} />
        <GroupTests groups={data.groupTests} />
        <LinearityTests
          rows={data.boxTidwell}
          threshold={data.boxTidwellThreshold}
        />

        {sensitivity ? (
          <SectionSummary
            heading="Does it matter? (sensitivity)"
            verdict={sensitivity.verdict}
          />
        ) : null}
      </div>
    </SectionShell>
  );
}
