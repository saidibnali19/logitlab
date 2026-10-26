import { SectionShell } from "@/components/ui/SectionShell";
import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";

export function TakeawaysExport() {
  return (
    <SectionShell id="takeaways">
      <ComponentPlaceholder
        name="TakeawaysExport"
        description="Auto-written plain-English summary and downloads: PDF, coefficients CSV, reproducible script."
      />
    </SectionShell>
  );
}
