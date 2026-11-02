import { SectionShell } from "@/components/ui/SectionShell";
import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";
import { SectionSummary } from "@/components/report/SectionSummary";
import type { Eda } from "@/lib/report/types";

export function ExploreData({ data }: { data: Eda }) {
  const size = data.correlation.columns.length;
  return (
    <SectionShell id="explore">
      <SectionSummary
        verdict={data.verdict}
        facts={[
          { label: "Continuous", value: String(data.continuous.length) },
          { label: "Categorical", value: String(data.categorical.length) },
          { label: "Histograms", value: String(data.histograms.length) },
          { label: "Correlation grid", value: `${size} × ${size}` },
        ]}
      />
      <ComponentPlaceholder
        name="ExploreData"
        description="Summary tables, distributions split by outcome, and the correlation heatmap."
      />
    </SectionShell>
  );
}
