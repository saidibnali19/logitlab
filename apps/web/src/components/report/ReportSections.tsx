"use client";

import { isComplete } from "@/lib/report/types";

import { AssumptionChecks } from "./AssumptionChecks";
import { DataGlance } from "./DataGlance";
import { DataHygiene } from "./DataHygiene";
import { ExploreData } from "./ExploreData";
import { ModelPerformance } from "./ModelPerformance";
import { ModelResults } from "./ModelResults";
import { useReport } from "./ReportProvider";
import { TakeawaysExport } from "./TakeawaysExport";
import { WhatIfExplorer } from "./WhatIfExplorer";

/**
 * Reads the result once and hands every section only its own slice.
 * A refused analysis still has sections 01 to 04, so those render; the
 * model-dependent ones appear only when a model exists.
 */
export function ReportSections() {
  const { state } = useReport();
  if (state.status !== "ready") return null;
  const result = state.result;

  return (
    <>
      <DataGlance data={result.dataGlance} rows={result.meta.rows} />
      <DataHygiene data={result.hygiene} />
      <ExploreData
        data={result.eda}
        target={result.dataGlance.target}
        prevalence={result.meta.prevalence}
      />
      <AssumptionChecks
        data={result.assumptions}
        sensitivity={result.sensitivity}
      />
      {isComplete(result) ? (
        <>
          <ModelResults
            data={result.model}
            groups={result.assumptions.groupTests}
            fragile={
              result.sensitivity.completeCase?.rows
                .filter((row) => !row.sameSignificance)
                .map((row) => row.term) ?? []
            }
          />
          <ModelPerformance
            data={result.performance}
            target={result.dataGlance.target}
          />
          <WhatIfExplorer
            data={result.whatIf}
            target={result.dataGlance.target}
            prevalence={result.meta.prevalence}
          />
          <TakeawaysExport
            data={result.takeaways}
            model={result.model}
            datasetName={result.meta.datasetName}
          />
        </>
      ) : null}
    </>
  );
}
