import type { WhatIfControl } from "@/lib/report/types";

/** A predictor with several levels; the first option is the reference. */
export function SelectControl({
  control,
  value,
  onChange,
}: {
  control: WhatIfControl;
  value: number;
  onChange: (value: number) => void;
}) {
  const id = `whatif-${control.column}`;

  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-sm font-medium">
        {control.label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="form-input w-auto py-1.5"
      >
        {(control.options ?? []).map((option, i) => (
          <option key={option.label} value={i}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
