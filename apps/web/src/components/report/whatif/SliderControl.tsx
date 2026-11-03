import type { WhatIfControl } from "@/lib/report/types";

/** A slider value at the precision its step allows, with its unit. */
export function formatControlValue(control: WhatIfControl, value: number) {
  const text = value.toFixed((control.step ?? 1) < 1 ? 1 : 0);
  return control.unit ? `${text} ${control.unit}` : text;
}

/** One measurement, limited to the range the data actually covers. */
export function SliderControl({
  control,
  value,
  onChange,
  lockedBy,
}: {
  control: WhatIfControl;
  value: number;
  onChange: (value: number) => void;
  lockedBy: string | null; // label of the toggle that sets this slider, while it does
}) {
  const min = control.min ?? 0;
  const max = control.max ?? 1;
  const id = `whatif-${control.column}`;
  const typicalAt = ((control.default - min) / (max - min)) * 100;

  return (
    <div className={lockedBy ? "opacity-60" : ""}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {control.label}
        </label>
        <span className="text-sm tabular-nums">
          {formatControlValue(control, value)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={control.step ?? 1}
        value={value}
        disabled={lockedBy !== null}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-valuetext={formatControlValue(control, value)}
        className="accent-brand mt-2 w-full disabled:cursor-not-allowed"
      />
      <div className="text-ink-faint relative h-4 text-xs" aria-hidden="true">
        <span
          className="absolute -translate-x-1/2"
          style={{ left: `${typicalAt}%` }}
        >
          ▲ typical
        </span>
      </div>
      {lockedBy ? (
        <p className="text-ink-faint text-xs">Set by {lockedBy}.</p>
      ) : null}
    </div>
  );
}
