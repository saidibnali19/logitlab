import { VerdictBanner } from "@/components/report/VerdictBanner";
import { formatInt, formatPercent } from "@/lib/format";
import type { Sensitivity } from "@/lib/report/types";

/** The model refitted without its most influential rows, to see what rests on them. */
export function InfluenceRefit({
  refit,
}: {
  refit: NonNullable<Sensitivity["influence"]>;
}) {
  return (
    <div className="space-y-3">
      <h4 className="font-semibold">Without the most influential rows</h4>
      <VerdictBanner verdict={refit.verdict} />
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        <div>
          <dt className="text-ink-faint text-xs">Rows left out</dt>
          <dd className="font-medium tabular-nums">
            {formatInt(refit.removed)}
          </dd>
        </div>
        <div>
          <dt className="text-ink-faint text-xs">Largest odds-ratio change</dt>
          <dd className="font-medium tabular-nums">
            {formatPercent(refit.maxOrChange)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
