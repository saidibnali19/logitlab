import { LogoMark } from "@/components/ui/Logo";
import { SITE } from "@/lib/site";

export function FooterBar() {
  return (
    <div className="border-line bg-surface border-t">
      <div className="text-ink-muted mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-6 text-sm sm:flex-row sm:justify-between">
        <p className="flex items-center gap-2 text-center sm:text-left">
          <LogoMark className="text-brand size-5" />
          <span>
            {SITE.name} · Built by {SITE.author.name}, {SITE.year}
          </span>
        </p>
        <nav aria-label="Footer" className="flex items-center gap-5">
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            Source code
          </a>
          <a href="#" className="nav-link">
            Back to top
          </a>
        </nav>
      </div>
      <p className="text-ink-muted mx-auto max-w-5xl px-6 pb-6 text-center text-xs sm:text-left">
        Sample data: the Framingham Heart Study, a publicly available,
        de-identified dataset used here for academic research.
      </p>
    </div>
  );
}
