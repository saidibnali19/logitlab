import { SectionShell } from "@/components/ui/SectionShell";
import { DecisionLog } from "@/components/report/hygiene/DecisionLog";
import { GapsOverview } from "@/components/report/hygiene/GapsOverview";
import { ImputationTable } from "@/components/report/hygiene/ImputationTable";
import { OutlierCard } from "@/components/report/hygiene/OutlierCard";
import { VerdictBanner } from "@/components/report/VerdictBanner";

import type { Hygiene } from "@/lib/report/types";

export function DataHygiene({ data }: { data: Hygiene }) {
  return (
    <SectionShell id="data-hygiene">
      <div className="space-y-8">
        <VerdictBanner verdict={data.verdict} />
        <GapsOverview data={data} />
        <ImputationTable imputations={data.imputations} />
        <OutlierCard policy={data.outlierPolicy} />
        <DecisionLog entries={data.decisionLog} />
      </div>
    </SectionShell>
  );
}
