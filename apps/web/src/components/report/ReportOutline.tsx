import { ComponentPlaceholder } from "@/components/ui/ComponentPlaceholder";

export function ReportOutline() {
  return (
    <section
      id="report-outline"
      aria-label="Report outline"
      className="border-t border-slate-200 bg-slate-100 py-16"
    >
      <div className="mx-auto max-w-5xl px-6">
        <ComponentPlaceholder
          name="ReportOutline"
          description="'What you'll get, in order': eight muted cards built from REPORT_SECTIONS. Hidden once data loads."
        />
      </div>
    </section>
  );
}
