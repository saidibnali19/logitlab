"use client";

import { useState } from "react";

import { RiskReadout } from "@/components/report/whatif/RiskReadout";
import { SelectControl } from "@/components/report/whatif/SelectControl";
import { SliderControl } from "@/components/report/whatif/SliderControl";
import { ToggleControl } from "@/components/report/whatif/ToggleControl";
import { WhatChanged } from "@/components/report/whatif/WhatChanged";
import type { WhatIf } from "@/lib/report/types";
import {
  changesFromTypical,
  predict,
  typicalValues,
  type Values,
} from "@/lib/risk";

/**
 * Holds every control's value. The risk is recomputed from the result's
 * coefficients on each change, in the browser, with no request to a server.
 */
export function WhatIfView({
  data,
  prevalence,
  positiveLabel,
}: {
  data: WhatIf;
  prevalence: number;
  positiveLabel: string;
}) {
  const typical = typicalValues(data);
  const [values, setValues] = useState<Values>(typical);

  const labelOf = (column: string) =>
    data.controls.find((c) => c.column === column)?.label ?? column;

  function set(column: string, value: number) {
    setValues((current) => {
      const next = { ...current, [column]: value };
      // A slider tied to this toggle follows it: locked at its off value, or reset to its on value.
      for (const control of data.controls) {
        if (control.linked?.column === column) {
          next[control.column] =
            value === 0 ? control.linked.offValue : control.linked.onValue;
        }
      }
      return next;
    });
  }

  const prediction = predict(data, values);
  const typicalPrediction = predict(data, typical);
  const changes = changesFromTypical(data, values);
  const choices = data.controls.filter((c) => c.kind !== "slider");
  const sliders = data.controls.filter((c) => c.kind === "slider");

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="order-2 space-y-8 lg:order-1">
        {choices.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold">About the person</h3>
            <div className="mt-3 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {choices.map((control) =>
                control.kind === "toggle" ? (
                  <ToggleControl
                    key={control.column}
                    control={control}
                    value={values[control.column]}
                    onChange={(v) => set(control.column, v)}
                  />
                ) : (
                  <SelectControl
                    key={control.column}
                    control={control}
                    value={values[control.column]}
                    onChange={(v) => set(control.column, v)}
                  />
                ),
              )}
            </div>
          </div>
        ) : null}

        {sliders.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold">Measurements</h3>
            <div className="mt-3 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {sliders.map((control) => {
                const linked = control.linked;
                const locked = linked !== null && values[linked.column] === 0;
                return (
                  <SliderControl
                    key={control.column}
                    control={control}
                    value={values[control.column]}
                    onChange={(v) => set(control.column, v)}
                    lockedBy={locked && linked ? labelOf(linked.column) : null}
                  />
                );
              })}
            </div>
            <p className="text-ink-faint mt-3 text-xs">
              Each slider covers the middle 98% of the data, so the model is
              never asked about people it has not seen.
            </p>
          </div>
        ) : null}
      </div>

      <div className="order-1 space-y-4 lg:sticky lg:top-24 lg:order-2">
        <RiskReadout
          prediction={prediction}
          typical={typicalPrediction}
          prevalence={prevalence}
          positiveLabel={positiveLabel}
          isTypical={changes.length === 0}
          onReset={() => setValues(typical)}
        />
        <WhatChanged changes={changes} />
      </div>
    </div>
  );
}
