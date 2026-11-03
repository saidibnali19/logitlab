import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { SITE } from "@/lib/site";

export function SiteHeader() {
  return (
    <header className="border-line bg-surface/80 sticky top-0 z-40 border-b backdrop-blur print:hidden">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link href="/" aria-label={`${SITE.name} home`}>
          <Logo />
        </Link>
        <nav aria-label="Primary" className="flex items-center gap-5">
          <a
            href={SITE.githubUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub repository"
            className="nav-link"
          >
            <GithubIcon className="size-4" />
            <span className="hidden sm:inline">GitHub Repo</span>
          </a>
          <span aria-hidden="true" className="bg-line h-5 w-px" />
          <a href={SITE.aboutHref} className="nav-link">
            About the project
          </a>
        </nav>
      </div>
    </header>
  );
}
