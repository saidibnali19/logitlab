import { SectionShell } from "@/components/ui/SectionShell";
import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";
import { SectionSummary } from "@/components/report/SectionSummary";
import type { Hygiene } from "@/lib/report/types";

export function DataHygiene({ data }: { data: Hygiene }) {
  return (
    <SectionShell id="data-hygiene">
      <SectionSummary
        verdict={data.verdict}
        facts={[
          {
            label: "Rows with gaps",
            value: data.rowsWithMissing.toLocaleString("en-US"),
          },
          {
            label: "Complete rows",
            value: data.completeCases.toLocaleString("en-US"),
          },
          { label: "Columns filled", value: String(data.imputations.length) },
          {
            label: "Outliers kept in",
            value: `${data.outlierPolicy.flagged.length} columns`,
          },
        ]}
      />
      <ComponentPlaceholder
        name="DataHygiene"
        description="Missingness bars, imputation before/after, and the overridable decision log."
      />
    </SectionShell>
  );
}
