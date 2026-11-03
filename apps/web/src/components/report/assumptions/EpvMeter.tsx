import { formatDecimal, formatInt } from "@/lib/format";
import type { Assumptions } from "@/lib/report/types";

/** Events per model term, placed against the refusal floor and the usual guideline. */
export function EpvMeter({ epv }: { epv: Assumptions["epv"] }) {
  // The scale runs to twice the guideline; anything beyond sits at the end with an arrow.
  const axisMax = epv.minimum * 2;
  const at = (value: number) =>
    `${(Math.min(value, axisMax) / axisMax) * 100}%`;
  const beyond = epv.value > axisMax;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold">Events per term</h3>
      <p className="mt-1">
        <span className="text-2xl font-semibold tabular-nums">
          {formatDecimal(epv.value, 1)}
        </span>{" "}
        <span className="text-ink-muted text-sm">
          {formatInt(epv.events)} events across {formatInt(epv.terms)} model
          terms
        </span>
      </p>

      <div
        role="img"
        aria-label={`${formatDecimal(epv.value, 1)} events per term. Below ${epv.refuseBelow} the analysis is refused; ${epv.minimum} is the usual guideline.`}
        className="relative mt-5"
      >
        <div className="flex h-3 overflow-hidden rounded-full">
          <div
            className="bg-refuse/30"
            style={{ width: at(epv.refuseBelow) }}
          />
          <div
            className="bg-warn/30"
            style={{
              width: `${((epv.minimum - epv.refuseBelow) / axisMax) * 100}%`,
            }}
          />
          <div className="bg-pass/30 flex-1" />
        </div>
        <div
          className="bg-ink absolute -top-1 h-5 w-0.5 -translate-x-1/2 rounded-full"
          style={{ left: at(epv.value) }}
        />
      </div>

      <div
        className="text-ink-faint relative mt-2 h-4 text-xs"
        aria-hidden="true"
      >
        <span
          className="absolute -translate-x-1/2"
          style={{ left: at(epv.refuseBelow) }}
        >
          {epv.refuseBelow}
        </span>
        <span
          className="absolute -translate-x-1/2"
          style={{ left: at(epv.minimum) }}
        >
          {epv.minimum}
        </span>
        {beyond ? <span className="absolute right-0">{axisMax}+ →</span> : null}
      </div>

      <p className="text-ink-muted mt-3 text-sm">
        Below {epv.refuseBelow} per term the analysis is refused, because the
        estimates would be too unstable. {epv.minimum} or more is the usual
        guideline.
      </p>
    </div>
  );
}
