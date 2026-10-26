import { ArrowRight, Database } from "lucide-react";

export function SampleDataButton() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-ink-faint flex w-full items-center gap-4 text-sm">
        <span className="bg-line h-px flex-1" />
        <span>or</span>
        <span className="bg-line h-px flex-1" />
      </div>

      <button
        type="button"
        className="btn btn-primary btn-lg w-full sm:w-auto sm:min-w-80"
      >
        <Database className="size-5" aria-hidden="true" />
        Try with Framingham data
        <ArrowRight className="size-5" aria-hidden="true" />
      </button>

      <p className="text-ink-muted text-sm">
        4,238 participants · 10-year heart disease risk · no upload needed
      </p>
    </div>
  );
}
