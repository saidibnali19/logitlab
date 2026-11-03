import { SegmentedControl } from "@/components/ui/SegmentedControl";
import type { WhatIfControl } from "@/lib/report/types";

/** A yes-or-no predictor; the value is the index of the chosen option. */
export function ToggleControl({
  control,
  value,
  onChange,
}: {
  control: WhatIfControl;
  value: number;
  onChange: (value: number) => void;
}) {
  const options = (control.options ?? []).map((option, i) => ({
    value: String(i),
    label: option.label,
  }));

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium" aria-hidden="true">
        {control.label}
      </span>
      <SegmentedControl
        name={`whatif-${control.column}`}
        legend={control.label}
        options={options}
        value={String(value)}
        onChange={(next) => onChange(Number(next))}
      />
    </div>
  );
}
