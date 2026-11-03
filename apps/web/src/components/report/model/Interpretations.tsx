import type { Coefficient } from "@/lib/report/types";

/** The engine's plain-English reading of each term. Clear evidence first; the rest collapsed. */
export function Interpretations({
  coefficients,
}: {
  coefficients: Coefficient[];
}) {
  const clear = coefficients.filter((c) => c.significant);
  const unclear = coefficients.filter((c) => !c.significant);

  return (
    <div>
      <h3 className="text-lg font-semibold">What each one means</h3>
      {clear.length > 0 ? (
        <ul className="mt-3 space-y-3">
          {clear.map((c) => (
            <li key={c.term} className="text-sm">
              <p className="font-medium">{c.label}</p>
              <p className="text-ink-muted">{c.interpretation}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-ink-muted mt-2 text-sm">
          No term shows clear evidence of an association with the outcome.
        </p>
      )}

      {unclear.length > 0 ? (
        <details className="border-line bg-surface rounded-card mt-4 border">
          <summary className="focus-visible:outline-focus rounded-card cursor-pointer px-5 py-4 font-medium focus-visible:outline-2 focus-visible:outline-offset-2">
            No clear evidence ({unclear.length})
            <span className="text-ink-muted ml-2 text-sm font-normal">
              still in the model, read with their intervals
            </span>
          </summary>
          <ul className="border-line space-y-3 border-t px-5 py-4">
            {unclear.map((c) => (
              <li key={c.term} className="text-sm">
                <p className="font-medium">{c.label}</p>
                <p className="text-ink-muted">{c.interpretation}</p>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
