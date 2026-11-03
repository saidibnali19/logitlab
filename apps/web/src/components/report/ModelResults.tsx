import { SectionShell } from "@/components/ui/SectionShell";
import { FitSummary } from "@/components/report/model/FitSummary";
import { Interpretations } from "@/components/report/model/Interpretations";
import { OddsRatioView } from "@/components/report/model/OddsRatioView";
import { VerdictBanner } from "@/components/report/VerdictBanner";

import type { GroupTest, Model } from "@/lib/report/types";

/**
 * The fitted model. Section 04's related groups and fragile estimates come
 * along so the forest plot can point back to them.
 */
export function ModelResults({
  data,
  groups,
  fragile,
}: {
  data: Model;
  groups: GroupTest[];
  fragile: string[];
}) {
  // Each related group gets a letter, keyed by column so every level of a categorical shares it.
  const groupOf: Record<string, string> = {};
  groups.forEach((group, i) => {
    for (const column of group.terms) {
      groupOf[column] = String.fromCharCode(65 + i);
    }
  });

  return (
    <SectionShell id="model">
      <div className="space-y-8">
        <VerdictBanner verdict={data.verdict} />
        <FitSummary description={data.description} fit={data.fit} />
        <OddsRatioView
          terms={data.terms}
          coefficients={data.coefficients}
          intercept={data.intercept}
          groupOf={groupOf}
          fragile={fragile}
        />
        <Interpretations coefficients={data.coefficients} />

        {data.exclusions.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold">Left out by you</h3>
            <ul className="text-ink-muted mt-2 list-disc space-y-1 pl-5 text-sm">
              {data.exclusions.map((item) => (
                <li key={item.column}>
                  <span className="text-ink font-medium">{item.column}</span>:{" "}
                  {item.reason}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </SectionShell>
  );
}
