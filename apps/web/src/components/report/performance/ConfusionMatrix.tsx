import { formatInt, formatPercent } from "@/lib/format";
import type { ThresholdRow } from "@/lib/report/types";

/** What the cut-off does to the test rows: the four outcomes, then the same in plain words. */
export function ConfusionMatrix({
  row,
  negativeLabel,
  positiveLabel,
}: {
  row: ThresholdRow;
  negativeLabel: string;
  positiveLabel: string;
}) {
  const { tp, fp, tn, fn } = row.counts;
  const cases = tp + fn;
  const nonCases = tn + fp;
  const flagged = tp + fp;

  let flaggedText: string;
  if (row.precision === null) {
    flaggedText = "Nobody is flagged at this cut-off.";
  } else if (tp === 0) {
    flaggedText = `None of the ${formatInt(flagged)} people flagged is a case.`;
  } else {
    flaggedText = `About 1 in ${Math.round(1 / row.precision)} people flagged is a case (${formatInt(tp)} of ${formatInt(flagged)}).`;
  }

  const cell = "px-3 py-3 text-center tabular-nums";

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="border-line w-full min-w-96 border-separate border-spacing-1 text-sm">
          <caption className="sr-only">
            Test rows by actual outcome and by whether the model flags them at a
            cut-off of {row.threshold.toFixed(2)}.
          </caption>
          <thead className="text-ink-muted text-xs">
            <tr>
              <td />
              <th scope="col" className="px-3 py-1 font-medium">
                Flagged
              </th>
              <th scope="col" className="px-3 py-1 font-medium">
                Not flagged
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th
                scope="row"
                className="text-ink-muted pr-2 text-left text-xs font-medium"
              >
                {positiveLabel}
              </th>
              <td className={`${cell} bg-pass-soft text-pass-ink rounded-md`}>
                <span className="block text-lg font-semibold">
                  {formatInt(tp)}
                </span>
                <span className="text-xs">caught</span>
              </td>
              <td className={`${cell} bg-warn-soft text-warn-ink rounded-md`}>
                <span className="block text-lg font-semibold">
                  {formatInt(fn)}
                </span>
                <span className="text-xs">missed</span>
              </td>
            </tr>
            <tr>
              <th
                scope="row"
                className="text-ink-muted pr-2 text-left text-xs font-medium"
              >
                {negativeLabel}
              </th>
              <td className={`${cell} bg-warn-soft text-warn-ink rounded-md`}>
                <span className="block text-lg font-semibold">
                  {formatInt(fp)}
                </span>
                <span className="text-xs">false alarms</span>
              </td>
              <td className={`${cell} bg-surface-sunken rounded-md`}>
                <span className="block text-lg font-semibold">
                  {formatInt(tn)}
                </span>
                <span className="text-ink-muted text-xs">cleared</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <ul className="space-y-1 text-sm" aria-live="polite">
        <li>
          Catches <strong>{formatInt(tp)}</strong> of {formatInt(cases)} cases (
          {formatPercent(row.sensitivity, 0)}).
        </li>
        <li>
          Clears <strong>{formatInt(tn)}</strong> of {formatInt(nonCases)}{" "}
          non-cases ({formatPercent(row.specificity, 0)}).
        </li>
        <li>{flaggedText}</li>
      </ul>
      <p className="text-ink-faint text-xs">
        A case is a row with {positiveLabel.toLowerCase()}.
      </p>
    </div>
  );
}
