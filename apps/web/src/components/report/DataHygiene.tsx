import { SectionShell } from "@/components/ui/SectionShell";
import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";

export function DataHygiene() {
  return (
    <SectionShell id="data-hygiene">
      <ComponentPlaceholder
        name="DataHygiene"
        description="Missingness bars, imputation before/after, and the overridable decision log."
      />
    </SectionShell>
  );
}
