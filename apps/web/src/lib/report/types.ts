/**
 * The contract between the analysis engine and the report UI.
 *
 * Rules every field follows:
 *  - Proportions are fractions from 0 to 1 (never 0 to 100). The UI formats them.
 *  - No NaN or Infinity. Use null when a value does not exist.
 *  - Verdicts are data: a level plus a plain-English sentence. The UI maps
 *    levels to styles and never decides pass or fail itself.
 *  - Anything the UI computes live ships with its ingredients.
 *  - Curves are downsampled to about 100 points so the file stays small.
 */

export const SCHEMA_VERSION = 1;

export type Level = "pass" | "warn" | "refuse" | "info";
export type Verdict = { level: Level; text: string };
export type Point = { x: number; y: number };

// ───────────────────────── Meta ─────────────────────────

export type Refusal = {
  check: string; // id of the assumption check that refused
  title: string;
  message: string; // teaches why, in plain English
  column: string | null; // the offending column, if one exists
};

export type Meta = {
  schemaVersion: number;
  engineVersion: string;
  datasetName: string;
  source: "sample" | "upload";
  rows: number;
  columns: number;
  events: number;
  prevalence: number; // fraction of rows where the target is 1
  status: "complete" | "refused";
  refusal: Refusal | null;
  /** No need to mention the final year project and complicate things. */
  notes: string[];
};

// ───────────────────── 01 Data at a glance ─────────────────────

export type ColumnType =
  "binary" | "continuous" | "categorical" | "id" | "constant" | "text";

export type ColumnRole = "target" | "predictor" | "excluded";

export type DataColumn = {
  name: string;
  label: string; // human label, e.g. "Systolic BP"
  type: ColumnType;
  role: ColumnRole;
  roleReason: string;
  roleSource: "auto" | "user"; // only the user may exclude a predictor
  missing: number;
  distinct: number;
  levels: string[] | null; // categorical levels, reference level first
};

export type DataFlag = {
  column: string;
  related: string[]; // other columns involved, if any
  kind: "id" | "constant" | "leakage" | "redundant" | "rare";
  level: Level;
  message: string;
};

export type DataGlance = {
  verdict: Verdict;
  columns: DataColumn[];
  target: {
    name: string;
    reason: string;
    negativeLabel: string;
    positiveLabel: string;
    counts: { negative: number; positive: number };
  };
  flags: DataFlag[];
};

// ───────────────────── 02 Data hygiene ─────────────────────

export type Moments = { mean: number; median: number; sd: number };

export type MissingnessItem = {
  column: string;
  label: string;
  count: number;
  fraction: number;
};

export type Imputation = {
  column: string;
  label: string;
  method: "median" | "mean" | "mode";
  skewness: number | null; // the skew that drove the choice
  fillValue: number | string;
  reason: string;
  before: Moments | null; // null for categorical columns
  after: Moments | null;
};

export type DecisionLogEntry = {
  id: string;
  step:
    | "ingest"
    | "roles"
    | "imputation"
    | "outliers"
    | "encoding"
    | "assumptions"
    | "model"
    | "threshold";
  decision: string;
  reason: string;
  automatic: boolean;
  /** What the user could choose instead. Null if the choice is not overridable. */
  alternative: string | null;
};

export type Hygiene = {
  verdict: Verdict;
  rowsWithMissing: number;
  completeCases: number;
  missingness: MissingnessItem[];
  imputations: Imputation[];
  outlierPolicy: {
    method: string;
    flagged: { column: string; label: string; count: number }[];
    action: "kept";
    reason: string;
  };
  decisionLog: DecisionLogEntry[];
};

// ───────────────────── 03 Know your data ─────────────────────

export type ContinuousSummary = {
  column: string;
  label: string;
  mean: number;
  median: number;
  sd: number;
  min: number;
  max: number;
  skewness: number;
};

export type CategoricalSummary = {
  column: string;
  label: string;
  /** `label` is what people read: 0/1 indicators become "No" and "Yes". */
  levels: { level: string; label: string; n: number; fraction: number }[];
};

export type OutcomeHistogram = {
  column: string;
  label: string;
  edges: number[]; // bin edges, length = bins + 1
  negative: number[]; // share of the negative class in each bin
  positive: number[]; // share of the positive class in each bin
};

export type OutcomeRate = {
  column: string;
  label: string;
  levels: { level: string; label: string; n: number; rate: number }[]; // rate = P(target = 1)
};

export type Correlation = {
  columns: string[];
  labels: string[];
  matrix: number[][]; // symmetric, predictors only
};

export type Eda = {
  verdict: Verdict;
  continuous: ContinuousSummary[];
  categorical: CategoricalSummary[];
  histograms: OutcomeHistogram[];
  outcomeRates: OutcomeRate[];
  correlation: Correlation;
};

// ───────────────────── 04 Assumption checks ─────────────────────

export type RemedyOption = {
  id: string;
  label: string;
  description: string;
  applied: boolean;
};

/** What the tool did about a check. It never drops a predictor on its own. */
export type AssumptionAction =
  "kept" | "remedy-offered" | "remedy-applied" | "refused";

export type AssumptionCheck = {
  id:
    | "binary-outcome"
    | "independence"
    | "sample-size"
    | "multicollinearity"
    | "linearity"
    | "influence"
    | "separation";
  title: string;
  verdict: Verdict;
  action: AssumptionAction;
  detail: string;
  remedies: RemedyOption[];
};

export type GroupTest = {
  id: string;
  label: string; // e.g. "Blood pressure measures"
  terms: string[];
  reason: string; // why these terms were grouped
  maxVif: number;
  statistic: number; // Wald chi-square
  df: number;
  pValue: number;
  significant: boolean;
  interpretation: string;
};

export type Assumptions = {
  verdict: Verdict;
  checks: AssumptionCheck[];
  epv: {
    events: number;
    terms: number;
    value: number;
    minimum: number; // the usual guideline
    refuseBelow: number; // the analysis is refused under this
  };
  vif: { term: string; label: string; value: number }[];
  vifLimit: number; // a VIF at or above this warns
  boxTidwell: {
    column: string;
    label: string;
    pValue: number;
    level: Level;
  }[];
  /** 0.05 divided by the number of tests; a p-value below it warns. */
  boxTidwellThreshold: number;
  influence: {
    threshold: number; // the 4/n guideline
    limit: number; // a Cook's distance above this warns
    count: number;
    maxCooksD: number;
    flagged: { row: number; cooksD: number }[]; // top few only
  };
  groupTests: GroupTest[];
};

// ───────────────────── Sensitivity (shown in section 04) ─────────────────────

export type LinearityComparison = {
  column: string;
  label: string;
  boxTidwellP: number;
  primaryAic: number;
  alternativeAic: number; // 3-df spline
  deltaAic: number; // primary minus alternative; positive favours the spline
  lrPValue: number;
  maxOrChange: number; // largest change in any other OR, as a fraction
  matters: boolean;
  verdict: Verdict;
  binned: { x: number; logit: number; n: number }[];
  linearCurve: Point[];
  splineCurve: Point[];
};

export type CompleteCaseComparison = {
  primaryN: number;
  completeCaseN: number;
  verdict: Verdict;
  /** Odds ratios per 1 SD for continuous terms, versus the reference otherwise. */
  rows: {
    term: string;
    label: string;
    orPrimary: number;
    orCompleteCase: number;
    change: number; // fraction
    sameSignificance: boolean;
  }[];
};

export type Sensitivity = {
  verdict: Verdict;
  linearity: LinearityComparison[];
  completeCase: CompleteCaseComparison | null;
  /** Stretch: refit without the most influential points. */
  influence: {
    removed: number;
    maxOrChange: number;
    verdict: Verdict;
  } | null;
};

// ───────────────────── 05 The model ─────────────────────

export type Term = {
  name: string; // e.g. "age", "education[2]"
  column: string;
  label: string;
  kind: "continuous" | "binary" | "level";
  reference: string | null; // reference level for level terms
  unit: string | null; // e.g. "mmHg"
  perUnit: string | null; // continuous only, e.g. "per year"
  perSd: string | null; // continuous only, e.g. "per SD (8.6 years)"
  mean: number | null; // continuous only; used by the what-if explorer
  sd: number | null; // continuous only; used for per-SD odds ratios
};

export type Coefficient = {
  term: string;
  label: string;
  beta: number;
  se: number;
  z: number;
  pValue: number;
  orRaw: number; // per one unit, or versus the reference
  orRawLo: number;
  orRawHi: number;
  /** Per 1 SD for continuous terms; equals orRaw for binary and level terms. */
  orStd: number;
  orStdLo: number;
  orStdHi: number;
  significant: boolean; // 95% CI excludes 1
  /** Auto-written sentence. For non-significant terms it says "no clear evidence". */
  interpretation: string;
};

export type Model = {
  verdict: Verdict;
  description: string; // e.g. "Unweighted logistic regression on all 4,240 rows"
  intercept: number;
  terms: Term[];
  coefficients: Coefficient[];
  fit: {
    n: number;
    llrChi2: number;
    llrDf: number;
    llrPValue: number;
    mcFaddenR2: number;
    aic: number;
  };
  counts: { significant: number; notSignificant: number };
  /** Only columns the user chose to exclude. The tool never adds to this. */
  exclusions: { column: string; reason: string }[];
};

// ───────────────────── 06 How well does it work? ─────────────────────

export type ConfusionCounts = {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
};

export type ThresholdRow = {
  threshold: number;
  sensitivity: number;
  specificity: number;
  precision: number | null; // null when nothing is predicted positive
  balancedAccuracy: number;
  counts: ConfusionCounts;
};

export type Performance = {
  verdict: Verdict; // honest wording, e.g. "Modest discrimination"
  split: {
    trainRows: number;
    testRows: number;
    testEvents: number;
    testFraction: number;
    seed: number;
  };
  auc: {
    test: number;
    cvMean: number;
    cvLo: number;
    cvHi: number;
    folds: number;
  };
  roc: Point[]; // x = 1 - specificity, y = sensitivity
  pr: Point[]; // x = recall, y = precision
  prBaseline: number; // prevalence in the test set
  calibration: {
    verdict: Verdict; // whether predicted risks can be read as real probabilities
    bins: { predicted: number; observed: number; n: number }[];
    slope: number | null;
    intercept: number | null;
    hosmerLemeshow: { statistic: number; df: number; pValue: number } | null;
  };
  threshold: {
    chosen: number;
    method: "balanced-accuracy";
    tunedOn: "cross-validation";
  };
  atChosen: ThresholdRow;
  thresholdTable: ThresholdRow[]; // grid for the live slider, on the test rows
  /** The same grid on cross-validation predictions from the training rows. Cut-offs are chosen here. */
  thresholdTableCv: ThresholdRow[];
};

// ───────────────────── 07 What-if explorer ─────────────────────

export type WhatIfControl = {
  column: string;
  label: string;
  kind: "slider" | "toggle" | "select";
  unit: string | null;
  min: number | null;
  max: number | null;
  step: number | null;
  default: number;
  /** For toggles and selects: the term each choice switches on (null = reference). */
  options: { label: string; term: string | null }[] | null;
};

export type WhatIf = {
  verdict: Verdict;
  baselineRisk: number; // predicted risk with every control at its default
  controls: WhatIfControl[];
  note: string; // e.g. "Uses the full-data model, not the hold-out model."
};

// ───────────────────── 08 Takeaways ─────────────────────

export type Takeaways = {
  verdict: Verdict;
  headline: string;
  bullets: { level: Level; text: string }[];
  nonSignificantNote: string | null;
  caveats: string[];
};

// ───────────────────── The whole result ─────────────────────

export type AnalysisResult = {
  meta: Meta;
  dataGlance: DataGlance;
  hygiene: Hygiene;
  eda: Eda;
  assumptions: Assumptions;
  /** Null when the analysis was refused before a model could be fitted. */
  model: Model | null;
  sensitivity: Sensitivity | null;
  performance: Performance | null;
  whatIf: WhatIf | null;
  takeaways: Takeaways;
};

/** A result where nothing was refused, so every later block exists. */
export type CompleteResult = AnalysisResult & {
  model: Model;
  sensitivity: Sensitivity;
  performance: Performance;
  whatIf: WhatIf;
};

export function isComplete(result: AnalysisResult): result is CompleteResult {
  return (
    result.meta.status === "complete" &&
    result.model !== null &&
    result.sensitivity !== null &&
    result.performance !== null &&
    result.whatIf !== null
  );
}
