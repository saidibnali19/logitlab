import { SectionShell } from "@/components/ui/SectionShell";
import { ColumnTable } from "@/components/report/glance/ColumnTable";
import { FlagList } from "@/components/report/glance/FlagList";
import { TargetCard } from "@/components/report/glance/TargetCard";
import { VerdictBanner } from "@/components/report/VerdictBanner";

import type { DataGlance as DataGlanceData } from "@/lib/report/types";

export function DataGlance({
  data,
  rows,
}: {
  data: DataGlanceData;
  rows: number;
}) {
  return (
    <SectionShell id="data-glance">
      <div className="space-y-8">
        <VerdictBanner verdict={data.verdict} />
        <TargetCard
          target={data.target}
          label={
            data.columns.find((c) => c.name === data.target.name)?.label ??
            data.target.name
          }
        />
        <FlagList flags={data.flags} columns={data.columns} />
        <ColumnTable columns={data.columns} rows={rows} />
      </div>
    </SectionShell>
  );
}
