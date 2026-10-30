import Image from "next/image";
import { Mail } from "lucide-react";
import { GithubIcon } from "@/components/ui/GithubIcon";
import { SITE } from "@/lib/site";

export function BuilderCard() {
  const { author } = SITE;

  return (
    <div className="card flex flex-col items-center text-center">
      <Image
        src={author.photo}
        alt={`Portrait of ${author.name}`}
        width={160}
        height={160}
        className="border-line size-28 rounded-full border object-cover"
      />
      <p className="text-ink-muted mt-4 text-xs font-medium tracking-wide uppercase">
        About the builder
      </p>
      <h3 className="mt-1 text-lg font-semibold">{author.name}</h3>
      <p className="text-ink-muted mt-1 text-sm">{author.title}</p>

      <div className="mt-5 flex flex-wrap justify-center gap-3">
        <a
          href={author.githubProfile}
          target="_blank"
          rel="noreferrer"
          className="btn btn-outline"
        >
          <GithubIcon className="size-4" />
          GitHub
        </a>
        <a href={`mailto:${author.email}`} className="btn btn-primary">
          <Mail className="size-4" aria-hidden="true" />
          Email me
        </a>
      </div>
    </div>
  );
}
