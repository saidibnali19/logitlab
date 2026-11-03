import { formatPercent } from "@/lib/format";
import type { Prediction } from "@/lib/risk";

/** The predicted risk with its interval, placed against the typical person and the overall rate. */
export function RiskReadout({
  prediction,
  typical,
  prevalence,
  positiveLabel,
  isTypical,
  onReset,
}: {
  prediction: Prediction;
  typical: Prediction;
  prevalence: number;
  positiveLabel: string;
  isTypical: boolean;
  onReset: () => void;
}) {
  const { risk, lo, hi } = prediction;
  // The scale grows in steps of 10% so the bar keeps its meaning as the risk rises.
  const axisMax = Math.min(
    1,
    Math.max(0.3, Math.ceil(Math.max(hi, prevalence) * 10) / 10),
  );
  const at = (value: number) =>
    `${(Math.min(value, axisMax) / axisMax) * 100}%`;
  const oddsVsTypical = Math.exp(prediction.logOdds - typical.logOdds);

  return (
    <div className="card" aria-live="polite">
      <p className="text-ink-faint text-xs font-medium tracking-wide uppercase">
        Estimated chance of {positiveLabel.toLowerCase()}
      </p>
      <p className="mt-1 text-4xl font-semibold tabular-nums">
        {formatPercent(risk)}
      </p>
      <p className="text-ink-muted mt-1 text-sm tabular-nums">
        95% interval {formatPercent(lo)} to {formatPercent(hi)}
      </p>

      <div
        className="bg-surface-sunken relative mt-5 h-3 rounded-full"
        aria-hidden="true"
      >
        <div
          className="bg-chart-band absolute inset-y-0 rounded-full"
          style={{ left: at(lo), width: `calc(${at(hi)} - ${at(lo)})` }}
        />
        <div
          className="bg-chart-1 absolute -top-1 h-5 w-1 -translate-x-1/2 rounded-full"
          style={{ left: at(risk) }}
        />
        <div
          className="border-chart-ref absolute -inset-y-1.5 border-l border-dashed"
          style={{ left: at(prevalence) }}
        />
      </div>
      <div
        className="text-ink-faint relative mt-1 h-8 text-xs"
        aria-hidden="true"
      >
        <span className="absolute left-0">0%</span>
        <span
          className="absolute top-4 -translate-x-1/2 whitespace-nowrap"
          style={{ left: at(prevalence) }}
        >
          overall {formatPercent(prevalence, 0)}
        </span>
        <span className="absolute right-0">{formatPercent(axisMax, 0)}</span>
      </div>

      <p className="mt-3 text-sm">
        {isTypical
          ? "This is the typical person: every control at its usual value."
          : `${oddsVsTypical.toFixed(oddsVsTypical < 1 ? 2 : 1)}× the typical person's odds (typical: ${formatPercent(typical.risk)}).`}
      </p>

      <button
        type="button"
        onClick={onReset}
        disabled={isTypical}
        className="btn btn-outline btn-sm mt-4"
      >
        Back to the typical person
      </button>

      <p className="text-ink-faint mt-4 text-xs">
        The interval shows how sure the model is about its estimate for people
        like this. It is not a range for any one person&apos;s future.
      </p>
    </div>
  );
}
