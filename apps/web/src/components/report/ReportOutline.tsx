import { REPORT_SECTIONS } from "@/lib/report-sections";

export function ReportOutline() {
  // Cycles through your scroll-delay classes so each row of four cascades in.
  // Full class names are written out so Tailwind can see them.
  const STAGGER = [
    "",
    "scroll-delay-100",
    "scroll-delay-200",
    "scroll-delay-300",
  ];
  return (
    <section
      id="report-outline"
      aria-label="Report outline"
      className="border-line bg-surface-sunken border-t py-16"
    >
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-title">What you&apos;ll get, in order</h2>
        <p className="text-ink-muted mt-2 max-w-2xl">
          Eight sections, from data quality to takeaways. Each one opens with a
          one-line verdict.
        </p>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {REPORT_SECTIONS.map((section, i) => (
            <li
              key={section.id}
              className={`scroll-reveal-up ${STAGGER[i % STAGGER.length]}`}
            >
              <a href={`#${section.id}`} className="outline-card">
                <span className="text-brand font-mono text-sm">
                  {String(section.number).padStart(2, "0")}
                </span>
                <span className="text-ink font-medium">{section.title}</span>
                <span className="text-ink-muted text-sm">
                  {section.description}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
