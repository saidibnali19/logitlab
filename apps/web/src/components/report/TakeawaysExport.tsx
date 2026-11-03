import { SectionShell } from "@/components/ui/SectionShell";
import { Caveats } from "@/components/report/takeaways/Caveats";
import { ExportPanel } from "@/components/report/takeaways/ExportPanel";
import { Summary } from "@/components/report/takeaways/Summary";
import { VerdictBanner } from "@/components/report/VerdictBanner";

import type { Model, Takeaways } from "@/lib/report/types";

/** The report in a few lines, its limits, and the files to take away. */
export function TakeawaysExport({
  data,
  model,
  datasetName,
}: {
  data: Takeaways;
  model: Model;
  datasetName: string;
}) {
  return (
    <SectionShell id="takeaways">
      <div className="space-y-8">
        <VerdictBanner verdict={data.verdict} />
        <Summary data={data} />
        <Caveats caveats={data.caveats} />
        <ExportPanel
          model={model}
          script={data.script}
          datasetName={datasetName}
        />
      </div>
    </SectionShell>
  );
}
