import { SectionShell } from "@/components/ui/SectionShell";
import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";
import { SectionSummary } from "@/components/report/SectionSummary";
import type { Model } from "@/lib/report/types";

export function ModelResults({ data }: { data: Model }) {
  const clear = data.coefficients.filter((c) => c.significant);
  return (
    <SectionShell id="model">
      <SectionSummary
        verdict={data.verdict}
        facts={[
          { label: "Terms", value: String(data.coefficients.length) },
          { label: "Clear evidence", value: String(data.counts.significant) },
          {
            label: "No clear evidence",
            value: String(data.counts.notSignificant),
          },
          { label: "McFadden R²", value: data.fit.mcFaddenR2.toFixed(3) },
        ]}
      >
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {clear.map((c) => (
            <li key={c.term}>
              <span className="font-medium">{c.label}:</span> OR{" "}
              {c.orStd.toFixed(2)} (95% CI {c.orStdLo.toFixed(2)} to{" "}
              {c.orStdHi.toFixed(2)})
            </li>
          ))}
        </ul>
        <p className="text-ink-muted text-xs">
          Continuous predictors are shown per 1 SD; the others versus their
          reference.
        </p>
      </SectionSummary>
      <ComponentPlaceholder
        name="ModelResults"
        description="Per-SD forest plot on a log axis, coefficient table, and a raw/standardised toggle."
      />
    </SectionShell>
  );
}
