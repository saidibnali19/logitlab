import { SectionShell } from "@/components/ui/SectionShell";
import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";
import { SectionSummary } from "@/components/report/SectionSummary";
import type { WhatIf } from "@/lib/report/types";

export function WhatIfExplorer({ data }: { data: WhatIf }) {
  return (
    <SectionShell id="what-if">
      <SectionSummary
        verdict={data.verdict}
        facts={[
          {
            label: "Baseline risk",
            value: `${(data.baselineRisk * 100).toFixed(1)}%`,
          },
          { label: "Controls", value: String(data.controls.length) },
        ]}
      >
        <p className="text-ink-muted text-sm">{data.note}</p>
      </SectionSummary>
      <ComponentPlaceholder
        name="WhatIfExplorer"
        description="One slider per predictor and a predicted-risk readout computed in the browser."
      />
    </SectionShell>
  );
}
