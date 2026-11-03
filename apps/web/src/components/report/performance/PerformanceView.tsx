"use client";

import { useState } from "react";

import { ConfusionMatrix } from "@/components/report/performance/ConfusionMatrix";
import { PrCurve } from "@/components/report/performance/PrCurve";
import { RocCurve } from "@/components/report/performance/RocCurve";
import { ThresholdControls } from "@/components/report/performance/ThresholdControls";
import type { Performance } from "@/lib/report/types";

/** The cheapest cut-off on the cross-validation rows, where a missed case costs `ratio` false alarms. */
function cheapest(table: Performance["thresholdTableCv"], ratio: number) {
  let best = 0;
  let bestCost = Infinity;
  table.forEach((row, i) => {
    const cost = ratio * row.counts.fn + row.counts.fp;
    if (cost < bestCost) {
      best = i;
      bestCost = cost;
    }
  });
  return best;
}

/**
 * Holds the cut-off, so the slider, the confusion matrix and both curve
 * markers always show the same row. Everything is read from the result:
 * moving the slider never calls the server.
 */
export function PerformanceView({
  data,
  negativeLabel,
  positiveLabel,
}: {
  data: Performance;
  negativeLabel: string;
  positiveLabel: string;
}) {
  const table = data.thresholdTable;
  const chosenIndex = Math.max(
    0,
    table.findIndex(
      (row) => Math.abs(row.threshold - data.threshold.chosen) < 1e-9,
    ),
  );
  const [index, setIndex] = useState(chosenIndex);
  // Starts at non-cases per case: there, weighing errors by cost roughly matches the balanced cut-off.
  const { tp, fn, fp, tn } = data.thresholdTableCv[0].counts;
  const [costRatio, setCostRatio] = useState(() =>
    Math.max(1, Math.round((tn + fp) / Math.max(tp + fn, 1))),
  );

  const row = table[index];
  // Same grid on both tables, so an index on the cross-validation one is a cut-off here too.
  const suggestedIndex = cheapest(data.thresholdTableCv, costRatio);

  return (
    <div>
      <h3 className="text-lg font-semibold">Pick a cut-off</h3>
      <p className="text-ink-muted mt-1 max-w-2xl text-sm">
        The model gives each person a risk; a cut-off turns it into a yes or no.
        Lower it to catch more cases at the price of more false alarms.
        Everything below is on the test rows.
      </p>

      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        <ThresholdControls
          table={table}
          index={index}
          chosenIndex={chosenIndex}
          onChange={setIndex}
          costRatio={costRatio}
          onCostRatioChange={setCostRatio}
          suggestedIndex={suggestedIndex}
        />
        <ConfusionMatrix
          row={row}
          negativeLabel={negativeLabel}
          positiveLabel={positiveLabel}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <RocCurve
          roc={data.roc}
          auc={data.auc.test}
          point={{ x: 1 - row.specificity, y: row.sensitivity }}
        />
        <PrCurve
          pr={data.pr}
          baseline={data.prBaseline}
          point={
            row.precision === null
              ? null
              : { x: row.sensitivity, y: row.precision }
          }
        />
      </div>

      <p className="text-ink-faint mt-3 text-xs">
        The slider explores the test rows. Choosing a cut-off by eye here would
        be tuning on the test set, which is why the chosen and suggested
        cut-offs both come from cross-validation.
      </p>
    </div>
  );
}
