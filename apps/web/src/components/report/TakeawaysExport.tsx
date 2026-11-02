import { SectionShell } from "@/components/ui/SectionShell";
import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";
import { SectionSummary } from "@/components/report/SectionSummary";
import type { Takeaways } from "@/lib/report/types";

export function TakeawaysExport({ data }: { data: Takeaways }) {
  return (
    <SectionShell id="takeaways">
      <SectionSummary verdict={data.verdict}>
        <p className="font-medium">{data.headline}</p>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {data.bullets.map((bullet) => (
            <li key={bullet.text}>
              <span className="font-medium">({bullet.level})</span>{" "}
              {bullet.text}
            </li>
          ))}
        </ul>
        {data.nonSignificantNote ? (
          <p className="text-ink-muted text-sm">{data.nonSignificantNote}</p>
        ) : null}
        <ul className="text-ink-muted list-disc space-y-1 pl-5 text-sm">
          {data.caveats.map((caveat) => (
            <li key={caveat}>{caveat}</li>
          ))}
        </ul>
      </SectionSummary>
      <ComponentPlaceholder
        name="TakeawaysExport"
        description="Auto-written plain-English summary and downloads: PDF, coefficients CSV, reproducible script."
      />
    </SectionShell>
  );
}
