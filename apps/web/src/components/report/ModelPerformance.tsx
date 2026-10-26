import { SectionShell } from "@/components/ui/SectionShell";
import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";

export function ModelPerformance() {
  return (
    <SectionShell id="performance">
      <ComponentPlaceholder
        name="ModelPerformance"
        description="ROC and PR curves, calibration plot, CV-AUC with CI, threshold slider and live confusion matrix."
      />
    </SectionShell>
  );
}
