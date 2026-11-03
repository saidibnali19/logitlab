import { SectionShell } from "@/components/ui/SectionShell";
import { CheckGrid } from "@/components/report/assumptions/CheckGrid";
import { CompleteCaseChart } from "@/components/report/assumptions/CompleteCaseChart";
import { EpvMeter } from "@/components/report/assumptions/EpvMeter";
import { GroupTests } from "@/components/report/assumptions/GroupTests";
import { InfluenceRefit } from "@/components/report/assumptions/InfluenceRefit";
import { InfluenceSummary } from "@/components/report/assumptions/InfluenceSummary";
import { LinearityComparison } from "@/components/report/assumptions/LinearityComparison";
import { LinearityTests } from "@/components/report/assumptions/LinearityTests";
import { VifChart } from "@/components/report/assumptions/VifChart";
import { VerdictBanner } from "@/components/report/VerdictBanner";

import type { Assumptions, Sensitivity } from "@/lib/report/types";

/**
 * The checks first, then the evidence behind them, then whether the results
 * survive refitting. When the analysis was refused, the evidence lists are
 * empty and there is no sensitivity block, so those parts render nothing.
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
          <div className="border-line space-y-6 border-t pt-8">
            <div>
              <h3 className="text-title">Does it matter?</h3>
              <p className="text-ink-muted mt-1 max-w-2xl text-sm">
                Each check refits the model a different way. If the answers
                barely move, the results do not hinge on the choices above.
              </p>
            </div>
            <VerdictBanner verdict={sensitivity.verdict} />

            {sensitivity.linearity.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-semibold">Straight line or curve?</h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {sensitivity.linearity.map((comparison) => (
                    <LinearityComparison
                      key={comparison.column}
                      comparison={comparison}
                    />
                  ))}
                </div>
              </div>
            ) : null}

            {sensitivity.completeCase ? (
              <div className="space-y-3">
                <h4 className="font-semibold">Without filling any gaps</h4>
                <VerdictBanner verdict={sensitivity.completeCase.verdict} />
                <CompleteCaseChart comparison={sensitivity.completeCase} />
              </div>
            ) : null}

            {sensitivity.influence ? (
              <InfluenceRefit refit={sensitivity.influence} />
            ) : null}
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
