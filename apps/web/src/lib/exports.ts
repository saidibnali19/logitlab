import type { Model } from "@/lib/report/types";

/** One CSV field, quoted when it holds anything that would break the row. */
function field(value: string | number | boolean) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Every coefficient at full precision, for a spreadsheet or another tool. */
export function coefficientsCsv(model: Model): string {
  const header = [
    "term",
    "label",
    "beta",
    "se",
    "z",
    "p_value",
    "or_per_unit",
    "or_per_unit_low",
    "or_per_unit_high",
    "or_per_sd",
    "or_per_sd_low",
    "or_per_sd_high",
    "clear_evidence",
  ];
  const rows = model.coefficients.map((c) =>
    [
      c.term,
      c.label,
      c.beta,
      c.se,
      c.z,
      c.pValue,
      c.orRaw,
      c.orRawLo,
      c.orRawHi,
      c.orStd,
      c.orStdLo,
      c.orStdHi,
      c.significant ? "yes" : "no",
    ]
      .map(field)
      .join(","),
  );
  return [header.join(","), ...rows].join("\n") + "\n";
}
