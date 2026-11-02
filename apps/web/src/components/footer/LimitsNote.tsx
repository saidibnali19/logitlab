import { Info } from "lucide-react";

export function LimitsNote() {
  return (
    <p className="text-ink-muted flex max-w-2xl gap-3 text-sm">
      <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        LogitLab supports binary outcomes only. It is a learning and portfolio
        project, not a clinical tool, so its output should not inform medical
        decisions. In this version the Framingham sample is a prepared result
        from the same engine; analysing your own file arrives when the engine is
        connected.
      </span>
    </p>
  );
}
