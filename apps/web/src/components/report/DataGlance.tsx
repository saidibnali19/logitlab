import { SectionShell } from "@/components/ui/SectionShell";
import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";
import { SectionSummary } from "@/components/report/SectionSummary";
import type { DataGlance as DataGlanceData } from "@/lib/report/types";

export function DataGlance({ data }: { data: DataGlanceData }) {
  const count = (role: string) =>
    data.columns.filter((c) => c.role === role).length;

  return (
    <SectionShell id="data-glance">
      <SectionSummary
        verdict={data.verdict}
        facts={[
          { label: "Outcome", value: data.target.name },
          { label: "Predictors", value: String(count("predictor")) },
          { label: "Excluded", value: String(count("excluded")) },
          { label: "Flags", value: String(data.flags.length) },
        ]}
      >
        {data.flags.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {data.flags.map((flag) => (
              <li key={`${flag.kind}-${flag.column}`}>
                <span className="font-medium">{flag.column}:</span>{" "}
                {flag.message}
              </li>
            ))}
          </ul>
        ) : null}
      </SectionSummary>
      <ComponentPlaceholder
        name="DataGlance"
        description="Column-role chips, target suggestion with a plain-English reason, and data flags."
      />
    </SectionShell>
  );
}
