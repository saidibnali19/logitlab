import { SectionShell } from "@/components/ui/SectionShell";
import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";

export function ModelResults() {
  return (
    <SectionShell id="model">
      <ComponentPlaceholder
        name="ModelResults"
        description="Per-SD forest plot on a log axis, coefficient table, and a raw/standardised toggle."
      />
    </SectionShell>
  );
}
