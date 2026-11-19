import { Users } from "lucide-react";
import { SITE } from "@/lib/site";

export function AboutProject() {
  return (
    <div>
      <h2 id="about-title" className="text-title">
        Why LogitLab exists
      </h2>
      <div className="text-ink-muted mt-4 max-w-2xl space-y-4">
        <p>
          LogitLab began with a final-year statistics project: a logistic
          regression study of 10-year coronary heart disease risk in Framingham
          participants, completed by Group 3, a team of five.
        </p>
        <p>
          That analysis was run by hand, one notebook step at a time. LogitLab
          turns the same workflow into software meant to work for any binary
          outcome: it cleans the data, tests the assumptions, fits the model and
          explains each decision in plain English. It refuses analyses that
          would mislead. Version 1 shows it on one real example.
        </p>
      </div>

      <p className="rounded-card border-line bg-surface text-ink-muted mt-6 flex max-w-2xl gap-3 border p-4 text-sm">
        <Users
          className="text-brand mt-0.5 size-4 shrink-0"
          aria-hidden="true"
        />
        <span>
          <strong className="text-ink font-medium">Credit.</strong> The
          Framingham study and its findings are the shared work of Group 3, a
          team of five. Turning that analysis into a general-purpose tool, along
          with LogitLab&apos;s design and code, is {SITE.author.name}&apos;s own
          work.
        </span>
      </p>
    </div>
  );
}
