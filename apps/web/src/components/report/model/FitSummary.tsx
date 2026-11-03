import { formatDecimal, formatInt, formatP } from "@/lib/format";
import type { Model } from "@/lib/report/types";

/** The model as a whole: how it was fitted and how much it explains. */
export function FitSummary({
  description,
  fit,
}: {
  description: string;
  fit: Model["fit"];
}) {
  // Definitions only. How well the model predicts is judged in section 06.
  const facts = [
    {
      label: "Rows",
      value: formatInt(fit.n),
      help: "Every row used in the fit.",
    },
    {
      label: "Likelihood-ratio test",
      value: `χ² = ${formatDecimal(fit.llrChi2, 1)}, df ${fit.llrDf}`,
      help: `Does the model beat having no predictors at all? ${formatP(fit.llrPValue)}.`,
    },
    {
      label: "McFadden R²",
      value: formatDecimal(fit.mcFaddenR2, 3),
      help: "Rarely above 0.4 for this kind of model.",
    },
    {
      label: "AIC",
      value: formatDecimal(fit.aic, 1),
      help: "For comparing models on the same rows; lower is better.",
    },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold">How the model was fitted</h3>
      <p className="text-ink-muted mt-1 text-sm">{description}.</p>
      <dl className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label}>
            <dt className="text-ink-faint text-xs">{fact.label}</dt>
            <dd className="font-medium tabular-nums">{fact.value}</dd>
            <dd className="text-ink-muted mt-0.5 text-xs">{fact.help}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
