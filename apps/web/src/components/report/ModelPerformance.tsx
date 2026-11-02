import { SectionShell } from "@/components/ui/SectionShell";
import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";
import { SectionSummary } from "@/components/report/SectionSummary";
import type { Performance } from "@/lib/report/types";

export function ModelPerformance({ data }: { data: Performance }) {
  const at = data.atChosen;
  const percent = (value: number) => `${(value * 100).toFixed(0)}%`;
  return (
    <SectionShell id="performance">
      <SectionSummary
        verdict={data.verdict}
        facts={[
          { label: "AUC on test rows", value: data.auc.test.toFixed(3) },
          {
            label: "AUC by cross-validation",
            value: `${data.auc.cvMean.toFixed(2)} (${data.auc.cvLo.toFixed(2)} to ${data.auc.cvHi.toFixed(2)})`,
          },
          { label: "Chosen cut-off", value: data.threshold.chosen.toFixed(2) },
          {
            label: "Test rows",
            value: data.split.testRows.toLocaleString("en-US"),
          },
          { label: "Cases caught", value: percent(at.sensitivity) },
          { label: "Non-cases cleared", value: percent(at.specificity) },
          {
            label: "Flagged who are cases",
            value:
              at.precision === null ? "none flagged" : percent(at.precision),
          },
        ]}
      />
      <ComponentPlaceholder
        name="ModelPerformance"
        description="ROC and PR curves, calibration plot, CV-AUC with CI, threshold slider and live confusion matrix."
      />
    </SectionShell>
  );
}
