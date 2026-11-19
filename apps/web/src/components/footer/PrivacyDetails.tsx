import { ChevronDown } from "lucide-react";

/** Says only what the code does. The in-memory promise for uploads is version 2's, and is labelled as such. */
export function PrivacyDetails() {
  return (
    <details className="group rounded-card border-line bg-surface max-w-2xl border">
      <summary className="rounded-card focus-visible:outline-focus flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 [&::-webkit-details-marker]:hidden">
        Privacy
        <ChevronDown
          className="text-ink-muted size-4 transition-transform group-open:rotate-180"
          aria-hidden="true"
        />
      </summary>
      <ul className="text-ink-muted list-disc space-y-1.5 px-4 pb-4 pl-8 text-sm">
        <li>
          This version reads no files: there is no upload, and nothing you enter
          or choose is sent anywhere.
        </li>
        <li>
          There are no accounts, no database, no analytics and no tracking
          cookies.
        </li>
        <li>
          The one thing the site remembers is your light or dark choice, kept in
          your browser.
        </li>
        <li>
          Version 2 is planned to analyse an uploaded file in memory and never
          store it.
        </li>
      </ul>
    </details>
  );
}
