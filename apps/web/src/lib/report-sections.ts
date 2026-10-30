export const REPORT_SECTIONS = [
  {
    id: "data-glance",
    number: 1,
    title: "Your data at a glance",
    description:
      "Detected column roles, a suggested target, and flags for ID, constant and leaky columns.",
  },
  {
    id: "data-hygiene",
    number: 2,
    title: "Data hygiene",
    description:
      "Missing values, imputation choices and a decision log you can override.",
  },
  {
    id: "explore",
    number: 3,
    title: "Know your data",
    description:
      "Summary tables, distributions by outcome and a correlation heatmap.",
  },
  {
    id: "assumptions",
    number: 4,
    title: "Assumption checks",
    description:
      "Traffic-light verdicts on sample size, multicollinearity, linearity and influential points.",
  },
  {
    id: "model",
    number: 5,
    title: "The model",
    description:
      "Odds ratios with 95% confidence intervals, shown per standard deviation.",
  },
  {
    id: "performance",
    number: 6,
    title: "How well does it work?",
    description:
      "ROC, precision-recall and calibration, with a live threshold slider.",
  },
  {
    id: "what-if",
    number: 7,
    title: "What-if explorer",
    description:
      "Move the sliders and watch the predicted risk change instantly.",
  },
  {
    id: "takeaways",
    number: 8,
    title: "Takeaways and export",
    description:
      "A plain-English summary, plus a PDF report and a reproducible script.",
  },
] as const;

export type SectionId = (typeof REPORT_SECTIONS)[number]["id"];

export function getSection(id: SectionId) {
  const section = REPORT_SECTIONS.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown report section: ${id}`);
  return section;
}
