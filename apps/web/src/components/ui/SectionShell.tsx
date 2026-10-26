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
      className="scroll-mt-20 border-t border-slate-200 py-16"
    >
      <div className="mx-auto max-w-5xl px-6">
        <p className="font-mono text-sm text-emerald-700">
          {String(number).padStart(2, "0")}
        </p>
        <h2
          id={`${id}-title`}
          className="mt-1 text-2xl font-semibold tracking-tight"
        >
          {title}
        </h2>
        <p className="mt-2 max-w-2xl text-slate-600">{description}</p>
        <div className="mt-8">{children}</div>
      </div>
    </section>
  );
}
