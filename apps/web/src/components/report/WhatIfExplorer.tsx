import { SectionShell } from "@/components/ui/SectionShell";
import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";

export function WhatIfExplorer() {
  return (
    <SectionShell id="what-if">
      <ComponentPlaceholder
        name="WhatIfExplorer"
        description="One slider per predictor and a predicted-risk readout computed in the browser."
      />
    </SectionShell>
  );
}
