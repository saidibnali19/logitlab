export const PREVIEW_LABEL = "Preview · Framingham Heart Study, n = 4,238";

export type ForestRow = { label: string; or: number; lo: number; hi: number };

// Per-SD odds ratios (binary predictors: yes vs no).
// Derived from report Tables 4.1 and 4.3: OR = exp(coef x SD), CI from reported z-values.
export const FOREST_ROWS: ForestRow[] = [
  { label: "Prior stroke", or: 3.98, lo: 1.71, hi: 9.28 },
  { label: "Systolic BP", or: 1.7, lo: 1.58, hi: 1.82 },
  { label: "Male", or: 1.56, lo: 1.34, hi: 1.83 },
  { label: "Glucose", or: 1.2, lo: 1.12, hi: 1.29 },
  { label: "Cigarettes/day", or: 1.2, lo: 1.11, hi: 1.29 },
  { label: "Total cholesterol", or: 1.19, lo: 1.11, hi: 1.28 },
];

// From the report: AUC 0.66; confusion matrix at threshold 0.43
// (sensitivity 93/129, false-positive rate 358/719).
export const ROC = {
  auc: 0.66,
  point: { fpr: 0.5, tpr: 0.72, threshold: 0.43 },
};

export type PreviewCheck = {
  title: string;
  verdict: "pass" | "warn";
  detail: string;
};

export const PREVIEW_CHECKS: PreviewCheck[] = [
  {
    title: "Sample size",
    verdict: "pass",
    detail: "644 events, 92 per variable (10 needed).",
  },
  {
    title: "Multicollinearity",
    verdict: "pass",
    detail: "Highest VIF is 1.12 (limit 5).",
  },
  {
    title: "Linearity (Box-Tidwell)",
    verdict: "pass",
    detail: "Every p-value is above 0.2 (must exceed 0.05).",
  },
  {
    title: "Age linearity",
    verdict: "warn",
    detail:
      "Non-linear in the logit. A spline is suggested instead of dropping it.",
  },
];
