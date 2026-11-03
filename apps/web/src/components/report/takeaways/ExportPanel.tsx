"use client";

import { FileCode, FileSpreadsheet, Printer } from "lucide-react";

import { downloadText, slug } from "@/lib/download";
import { coefficientsCsv } from "@/lib/exports";
import type { Model, Takeaways } from "@/lib/report/types";

/** Ways to take the analysis away. Every file is made in the browser from the result. */
export function ExportPanel({
  model,
  script,
  datasetName,
}: {
  model: Model;
  script: Takeaways["script"];
  datasetName: string;
}) {
  const exports = [
    {
      label: "Print or save as PDF",
      detail:
        "The whole report as you have set it up, including your cut-off and what-if person. Choose “Save as PDF” in the print dialog.",
      Icon: Printer,
      action: "Open print dialog",
      onClick: () => window.print(),
    },
    {
      label: "Coefficients (CSV)",
      detail:
        "Every term's coefficient, standard error, p-value and odds ratios at full precision.",
      Icon: FileSpreadsheet,
      action: "Download",
      onClick: () =>
        downloadText(
          `${slug(datasetName)}-coefficients.csv`,
          coefficientsCsv(model),
          "text/csv;charset=utf-8",
        ),
    },
    ...(script
      ? [
          {
            label: "Reproducible script (Python)",
            detail:
              "Fills the gaps, encodes the columns and fits the model exactly as here. Checked to give the same coefficients.",
            Icon: FileCode,
            action: "Download",
            onClick: () =>
              downloadText(
                script.filename,
                script.code,
                "text/x-python;charset=utf-8",
              ),
          },
        ]
      : []),
  ];

  return (
    <div className="print:hidden">
      <h3 className="text-lg font-semibold">Take it with you</h3>
      <ul className="mt-3 grid gap-4 md:grid-cols-3">
        {exports.map(({ label, detail, Icon, action, onClick }) => (
          <li key={label} className="card flex flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <Icon className="text-brand size-5" aria-hidden="true" />
              <h4 className="font-semibold">{label}</h4>
            </div>
            <p className="text-ink-muted flex-1 text-sm">{detail}</p>
            <button
              type="button"
              onClick={onClick}
              className="btn btn-soft btn-sm self-start"
            >
              {action}
            </button>
          </li>
        ))}
      </ul>
      <p className="text-ink-faint mt-3 text-xs">
        Files are made in your browser. Nothing is sent anywhere.
      </p>
    </div>
  );
}
