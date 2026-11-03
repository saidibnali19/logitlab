import { formatPercent } from "@/lib/format";
import type { ThresholdRow } from "@/lib/report/types";

/** The cut-off slider, a way back to the chosen cut-off, and the cost-ratio suggestion. */
export function ThresholdControls({
  table,
  index,
  chosenIndex,
  onChange,
  costRatio,
  onCostRatioChange,
  suggestedIndex,
}: {
  table: ThresholdRow[];
  index: number;
  chosenIndex: number;
  onChange: (index: number) => void;
  costRatio: number;
  onCostRatioChange: (value: number) => void;
  suggestedIndex: number;
}) {
  const row = table[index];
  const last = table.length - 1;
  const suggested = table[suggestedIndex];

  return (
    <div className="space-y-5">
      <div>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <label htmlFor="cut-off" className="font-medium">
            Cut-off: flag anyone with a predicted risk of at least{" "}
            <span className="tabular-nums">{row.threshold.toFixed(2)}</span>
          </label>
          <button
            type="button"
            onClick={() => onChange(chosenIndex)}
            disabled={index === chosenIndex}
            className="btn btn-outline btn-sm"
          >
            Back to {table[chosenIndex].threshold.toFixed(2)}
          </button>
        </div>
        <input
          id="cut-off"
          type="range"
          min={0}
          max={last}
          step={1}
          value={index}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-valuetext={`cut-off ${row.threshold.toFixed(2)}: catches ${formatPercent(row.sensitivity, 0)} of cases`}
          className="accent-brand mt-3 w-full"
        />
        <div className="text-ink-faint relative h-4 text-xs" aria-hidden="true">
          <span className="absolute left-0">
            {table[0].threshold.toFixed(2)}
          </span>
          <span
            className="text-brand absolute -translate-x-1/2 font-medium"
            style={{ left: `${(chosenIndex / last) * 100}%` }}
          >
            ▲ chosen
          </span>
          <span className="absolute right-0">
            {table[last].threshold.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="border-line rounded-card border p-4">
        <label htmlFor="cost-ratio" className="text-sm font-medium">
          A missed case costs
          <input
            id="cost-ratio"
            type="number"
            min={1}
            max={50}
            step={1}
            // Uncontrolled, so the field can be cleared and retyped; only valid numbers apply.
            defaultValue={costRatio}
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isFinite(value) && value >= 1)
                onCostRatioChange(Math.min(value, 50));
            }}
            className="form-input mx-2 inline-block w-16 py-1 text-center tabular-nums"
          />
          times a false alarm
        </label>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <p className="text-sm">
            Suggested cut-off:{" "}
            <strong className="tabular-nums">
              {suggested.threshold.toFixed(2)}
            </strong>
          </p>
          <button
            type="button"
            onClick={() => onChange(suggestedIndex)}
            disabled={index === suggestedIndex}
            className="btn btn-soft btn-sm"
          >
            Use it
          </button>
        </div>
        <p className="text-ink-faint mt-2 text-xs">
          Chosen on the cross-validation predictions from the training rows,
          never on the test rows, so the results shown are still honest.
        </p>
      </div>
    </div>
  );
}
