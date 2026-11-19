import type { ReactNode } from "react";
import { getSection, type SectionId } from "@/lib/report-sections";

type Props = {
  id: SectionId;
  children: ReactNode;
};

export function SectionShell({ id, children }: Props) {
  const { number, title, description } = getSection(id);

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      // Focusable from a jump in the section navigation, so the next Tab carries on from the section.
      tabIndex={-1}
      // Room for the sticky header, and under xl the sticky section bar as well.
      className="border-line scroll-mt-28 border-t py-16 outline-none xl:scroll-mt-20"
    >
      <div className="mx-auto max-w-5xl px-6">
        {/* Only the heading eases in: a whole section is far taller than the screen and would stay half faded. */}
        <div className="scroll-reveal-up">
          <p className="text-brand font-mono text-sm">
            {String(number).padStart(2, "0")}
          </p>
          <h2 id={`${id}-title`} className="text-title mt-1">
            {title}
          </h2>
          <p className="text-ink-muted mt-2 max-w-2xl">{description}</p>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
