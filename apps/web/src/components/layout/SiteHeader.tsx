import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-line bg-surface/80 sticky top-0 z-40 border-b backdrop-blur print:hidden">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label={`${SITE.name} home`} className="shrink-0">
          <Logo />
        </Link>
        {/* Tighter on phones: the dividers go and the labels shorten, so the whole row fits. */}
        <nav aria-label="Primary" className="flex items-center gap-3 sm:gap-5">
          <Link
            href={SITE.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="nav-link"
          >
            <GithubIcon className="size-4" />
            <span className="hidden sm:inline">GitHub Repo</span>
          </Link>
          <span
            aria-hidden="true"
            className="bg-line hidden h-5 w-px sm:block"
          />
          <Link href={SITE.aboutHref} className="nav-link whitespace-nowrap">
            <span className="sm:hidden">About</span>
            <span className="hidden sm:inline">About the project</span>
          </Link>
          <span
            aria-hidden="true"
            className="bg-line hidden h-5 w-px sm:block"
          />
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
