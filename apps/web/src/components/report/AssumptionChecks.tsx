import { SectionShell } from "@/components/ui/SectionShell";
import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";
import { SectionSummary } from "@/components/report/SectionSummary";
import type { Assumptions, Sensitivity } from "@/lib/report/types";

export function AssumptionChecks({
  data,
  sensitivity,
}: {
  data: Assumptions;
  sensitivity: Sensitivity | null;
}) {
  const highestVif = Math.max(0, ...data.vif.map((row) => row.value));
  return (
    <SectionShell id="assumptions">
      <SectionSummary
        heading="Checks"
        verdict={data.verdict}
        facts={[
          { label: "Events per term", value: data.epv.value.toFixed(1) },
          { label: "Highest VIF", value: highestVif.toFixed(2) },
          {
            label: "Largest Cook's D",
            value: data.influence.maxCooksD.toFixed(3),
          },
          { label: "Related groups", value: String(data.groupTests.length) },
        ]}
      >
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {data.checks.map((check) => (
            <li key={check.id}>
              <span className="font-medium">
                {check.title} ({check.verdict.level}):
              </span>{" "}
              {check.verdict.text}
            </li>
          ))}
        </ul>
      </SectionSummary>

      {sensitivity ? (
        <SectionSummary
          heading="Does it matter? (sensitivity)"
          verdict={sensitivity.verdict}
        />
      ) : null}
      <ComponentPlaceholder
        name="AssumptionChecks"
        description="Traffic-light verdict cards (pass, warn, refuse) with offered remedies."
      />
    </SectionShell>
  );
}
