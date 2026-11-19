export const REPORT_SECTIONS = [
  {
    id: "data-glance",
    number: 1,
    short: "Glance", // fits the progress rail
    title: "Your data at a glance",
    description:
      "Detected column roles, a suggested target, and flags for ID, constant and leaky columns.",
  },
  {
    id: "data-hygiene",
    number: 2,
    short: "Hygiene", // fits the progress rail
    title: "Data hygiene",
    description:
      "Missing values, how each gap was filled, and a decision log of every automatic choice.",
  },
  {
    id: "explore",
    number: 3,
    short: "Explore", // fits the progress rail
    title: "Know your data",
    description:
      "Summary tables, distributions by outcome and a correlation heatmap.",
  },
  {
    id: "assumptions",
    number: 4,
    short: "Assumptions", // fits the progress rail
    title: "Assumption checks",
    description:
      "Traffic-light verdicts on sample size, multicollinearity, linearity and influential points, plus checks that the results do not depend on them.",
  },
  {
    id: "model",
    number: 5,
    short: "Model", // fits the progress rail
    title: "The model",
    description:
      "Odds ratios with 95% confidence intervals, per unit or per standard deviation, with a plain-English reading of each.",
  },
  {
    id: "performance",
    number: 6,
    short: "Performance", // fits the progress rail
    title: "How well does it work?",
    description:
      "ROC, precision-recall and calibration, with a live threshold slider.",
  },
  {
    id: "what-if",
    number: 7,
    short: "What-if", // fits the progress rail
    title: "What-if explorer",
    description:
      "Move the sliders and watch the predicted risk change instantly.",
  },
  {
    id: "takeaways",
    number: 8,
    short: "Takeaways", // fits the progress rail
    title: "Takeaways and export",
    description:
      "A plain-English summary, plus a PDF report and a reproducible script.",
  },
] as const;

export type SectionId = (typeof REPORT_SECTIONS)[number]["id"];

/** Every section id in page order. One shared array, so effects that depend on it do not re-run. */
export const SECTION_IDS: SectionId[] = REPORT_SECTIONS.map(
  (section) => section.id,
);

export function getSection(id: SectionId) {
  const section = REPORT_SECTIONS.find((s) => s.id === id);
  if (!section) throw new Error(`Unknown report section: ${id}`);
  return section;
}
