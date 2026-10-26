import { SectionShell } from "@/components/ui/SectionShell";
import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";

export function ExploreData() {
  return (
    <SectionShell id="explore">
      <ComponentPlaceholder
        name="ExploreData"
        description="Summary tables, distributions split by outcome, and the correlation heatmap."
      />
    </SectionShell>
  );
}
