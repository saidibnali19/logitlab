import type { SectionId } from "@/lib/report-sections";
import { isComplete, type AnalysisResult, type Level } from "./types";

// A pass is better news than a note, so a note never hides a pass.
const SEVERITY: Record<Level, number> = {
  info: 0,
  pass: 1,
  warn: 2,
  refuse: 3,
};

/** The most severe of the verdicts the engine gave a section. The UI picks among them; it never invents one. */
function worst(...levels: (Level | undefined)[]): Level {
  const given = levels.filter((level): level is Level => level !== undefined);
  return given.reduce((a, b) => (SEVERITY[b] > SEVERITY[a] ? b : a));
}

/**
 * Each section's level for the navigation. A section that was not run is null:
 * a refused analysis has no model, so it has no sections 05 to 08.
 */
export function sectionLevels(
  result: AnalysisResult,
): Record<SectionId, Level | null> {
  const leading = {
    "data-glance": result.dataGlance.verdict.level,
    "data-hygiene": result.hygiene.verdict.level,
    explore: result.eda.verdict.level,
    assumptions: worst(
      result.assumptions.verdict.level,
      result.sensitivity?.verdict.level,
    ),
  };

  if (!isComplete(result)) {
    return {
      ...leading,
      model: null,
      performance: null,
      "what-if": null,
      takeaways: null,
    };
  }
  return {
    ...leading,
    model: result.model.verdict.level,
    performance: worst(
      result.performance.verdict.level,
      result.performance.calibration.verdict.level,
    ),
    "what-if": result.whatIf.verdict.level,
    takeaways: result.takeaways.verdict.level,
  };
}
