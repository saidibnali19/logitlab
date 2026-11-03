import { formatR } from "@/lib/charts";
import type { Correlation } from "@/lib/report/types";

const SHOWN = 5;

/** The few pairs worth reading first, so the heatmap does not have to be scanned. */
export function StrongestPairs({ correlation }: { correlation: Correlation }) {
  const { labels, matrix } = correlation;

  // Each pair once: the matrix is symmetric, so only cells above the diagonal.
  const pairs: { a: string; b: string; r: number }[] = [];
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      pairs.push({ a: labels[i], b: labels[j], r: matrix[i][j] });
    }
  }
  const strongest = pairs
    .sort((p, q) => Math.abs(q.r) - Math.abs(p.r))
    .slice(0, SHOWN);

  if (strongest.length === 0) return null;

  return (
    <div className="card">
      <h3 className="font-semibold">Strongest pairs</h3>
      <ol className="mt-3 space-y-3">
        {strongest.map((pair) => (
          <li key={`${pair.a}-${pair.b}`} className="text-sm">
            <p className="font-medium">
              {pair.a} and {pair.b}
            </p>
            <div className="mt-1 flex items-center gap-3">
              <div
                className="bg-surface-sunken h-1.5 flex-1 rounded-full"
                aria-hidden="true"
              >
                <div
                  className={`h-full rounded-full ${pair.r >= 0 ? "bg-chart-1" : "bg-chart-2"}`}
                  style={{ width: `${Math.abs(pair.r) * 100}%` }}
                />
              </div>
              <span className="text-ink-muted w-16 text-right tabular-nums">
                r = {formatR(pair.r)}
              </span>
            </div>
          </li>
        ))}
      </ol>
      <p className="text-ink-faint mt-4 text-xs">
        Strongly linked predictors share information. Section 04 checks whether
        that makes any estimate unstable.
      </p>
    </div>
  );
}
