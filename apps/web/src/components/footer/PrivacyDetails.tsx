import { ChevronDown } from "lucide-react";

export function PrivacyDetails() {
  return (
    <details className="group rounded-card border-line bg-surface max-w-2xl border">
      <summary className="rounded-card focus-visible:outline-focus flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
        How LogitLab handles your file
        <ChevronDown
          className="text-ink-muted size-4 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <ul className="text-ink-muted list-disc space-y-1.5 px-4 pb-4 pl-8 text-sm">
        <li>
          Your file is read in memory and discarded once results are sent.
        </li>
        <li>Nothing is written to a database, and there are no accounts.</li>
        <li>No analytics or tracking cookies are used.</li>
      </ul>
    </details>
  );
}
