import { Info } from "lucide-react";

import { SectionShell } from "@/components/ui/SectionShell";
import { VerdictBanner } from "@/components/report/VerdictBanner";
import { WhatIfView } from "@/components/report/whatif/WhatIfView";

import type { DataGlance, WhatIf } from "@/lib/report/types";

/** Build a person from the controls and watch the model's estimate for them change. */
export function WhatIfExplorer({
  data,
  target,
  prevalence,
}: {
  data: WhatIf;
  target: DataGlance["target"];
  prevalence: number;
}) {
  return (
    <SectionShell id="what-if">
      <div className="space-y-8">
        <VerdictBanner verdict={data.verdict} />
        <p className="text-ink-muted flex max-w-2xl gap-3 text-sm">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{data.note}</span>
        </p>
        <WhatIfView
          data={data}
          prevalence={prevalence}
          positiveLabel={target.positiveLabel}
        />
      </div>
    </SectionShell>
  );
}
