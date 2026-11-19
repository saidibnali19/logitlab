import { readFileSync } from "node:fs";
import { join } from "node:path";

import type { Metadata } from "next";
import {
  ChevronDown,
  CircleCheck,
  CloudUpload,
  Lock,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react";
import { StatusDot } from "@/components/layout/StatusDot";
import { Logo, LogoMark } from "@/components/ui/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { Level } from "@/lib/report/types";
import { verdictWord } from "@/lib/verdict";

export const metadata: Metadata = {
  title: "Style guide · LogitLab",
  robots: { index: false, follow: false },
};

const colourGroups = [
  { title: "Surfaces", names: ["canvas", "surface", "surface-sunken"] },
  {
    title: "Text and lines",
    names: ["ink", "ink-muted", "ink-faint", "line", "line-strong"],
  },
  {
    title: "Brand",
    names: [
      "brand",
      "brand-hover",
      "brand-ink",
      "brand-soft",
      "brand-soft-hover",
      "brand-soft-ink",
    ],
  },
  {
    title: "Verdicts",
    names: [
      "pass",
      "pass-soft",
      "pass-ink",
      "warn",
      "warn-soft",
      "warn-ink",
      "refuse",
      "refuse-soft",
      "refuse-ink",
    ],
  },
  {
    title: "Charts",
    names: ["chart-1", "chart-2", "chart-ref", "chart-grid", "chart-band"],
  },
];

/**
 * Each token's light and dark palette entry, read from theme.css at build time
 * so this page can never drift from it. (A page cannot show both schemes with
 * live classes: the build resolves each token on :root, so the scheme can only
 * be switched for the whole page, which is what the toggle above does.)
 */
function readTokens(): Record<string, [light: string, dark: string]> {
  const css = readFileSync(join(process.cwd(), "src/styles/theme.css"), "utf8");
  const tokens: Record<string, [string, string]> = {};
  const pattern =
    /--color-([a-z0-9-]+):\s*light-dark\(\s*var\(--color-([a-z0-9-]+)\),\s*var\(--color-([a-z0-9-]+)\)\s*\)/g;
  for (const match of css.matchAll(pattern)) {
    tokens[match[1]] = [match[2], match[3]];
  }
  return tokens;
}

const tokens = readTokens();

/** One token as its light and dark values, side by side. */
function Swatch({ name }: { name: string }) {
  const pair = tokens[name];
  // A token that is not in theme.css shows as missing instead of quietly vanishing.
  const [light, dark] = pair ?? ["?", "?"];
  const square = "border-line size-10 border";

  return (
    <div className="flex items-center gap-3">
      <div className="flex shrink-0" aria-hidden="true">
        <span
          className={`${square} rounded-l-lg`}
          style={{ backgroundColor: `var(--color-${light})` }}
        />
        <span
          className={`${square} rounded-r-lg border-l-0`}
          style={{ backgroundColor: `var(--color-${dark})` }}
        />
      </div>
      <div>
        <code className="text-ink-muted font-mono text-sm">{name}</code>
        <p className="text-ink-faint text-xs">
          {light} · {dark}
        </p>
      </div>
    </div>
  );
}

const statusLevels: (Level | null)[] = ["pass", "warn", "refuse", "info", null];

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-line border-t py-10">
      <h2 className="text-title">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function StyleGuidePage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div className="flex items-start justify-between gap-4">
        <p className="text-brand font-mono text-sm">/styleguide</p>
        <ThemeToggle />
      </div>
      <h1 className="text-display mt-1">Style guide</h1>
      <p className="text-lead text-ink-muted mt-4 max-w-2xl">
        Every token and component in one place. Change a token in theme.css and
        this page shows the redesign instantly, in both themes.
      </p>

      <Block title="Logo">
        <div className="flex items-center gap-8">
          <Logo />
          <LogoMark className="text-brand size-10" />
        </div>
      </Block>

      <Block title="Colour tokens">
        <p className="text-ink-muted mb-6 max-w-2xl text-sm">
          Each token holds a light and a dark value, so components never need a
          dark: variant. The left square is light, the right one dark, with the
          palette entry each comes from. The toggle above switches the rest of
          this page.
        </p>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {colourGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-ink text-sm font-semibold">{group.title}</h3>
              {group.names.map((name) => (
                <Swatch key={name} name={name} />
              ))}
            </div>
          ))}
        </div>
      </Block>

      <Block title="Type scale">
        <div className="space-y-4">
          <p className="text-display">A statistician&apos;s analysis.</p>
          <p className="text-title">Section title</p>
          <p className="text-lead text-ink-muted">
            Lead paragraph for subheadlines and section descriptions.
          </p>
          <p>Body text for everyday reading.</p>
          <p className="text-ink-muted text-sm">Small supporting text.</p>
          <p className="font-mono text-sm">
            OR = 1.54 (95% CI 1.12 to 2.12), p = 0.008
          </p>
        </div>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <button className="btn btn-primary btn-lg">
            Try with Framingham data
          </button>
          <button className="btn btn-primary">Primary</button>
          <button className="btn btn-soft">Soft</button>
          <button className="btn btn-outline">Outline</button>
          <button className="btn btn-primary btn-sm">Small</button>
          <button className="btn btn-primary" disabled>
            Disabled
          </button>
        </div>
      </Block>

      <Block title="Badges">
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-brand">
            Binary logistic regression, end to end
          </span>
          <span className="badge badge-outline">Illustrative preview</span>
          <span className="badge badge-pass">
            <CircleCheck className="size-3.5" /> Pass
          </span>
          <span className="badge badge-warn">
            <TriangleAlert className="size-3.5" /> Review
          </span>
          <span className="badge badge-refuse">
            <OctagonX className="size-3.5" /> Refused
          </span>
        </div>
      </Block>

      <Block title="Verdict cards">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="verdict-card verdict-pass">
            <p className="flex items-center gap-2 font-medium">
              <CircleCheck className="size-4" /> Multicollinearity
            </p>
            <p className="mt-1 text-sm">All VIF values are below 5.</p>
          </div>
          <div className="verdict-card verdict-warn">
            <p className="flex items-center gap-2 font-medium">
              <TriangleAlert className="size-4" /> Linearity
            </p>
            <p className="mt-1 text-sm">
              Age is non-linear in the logit. A spline is suggested.
            </p>
          </div>
          <div className="verdict-card verdict-refuse">
            <p className="flex items-center gap-2 font-medium">
              <OctagonX className="size-4" /> Sample size
            </p>
            <p className="mt-1 text-sm">
              Only 6 events per variable. At least 10 are needed.
            </p>
          </div>
        </div>
      </Block>

      <Block title="Card and form input">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card">
            <p className="font-medium">A card</p>
            <p className="text-ink-muted mt-1 text-sm">
              One radius, one border, one soft shadow.
            </p>
          </div>
          <div className="card space-y-3">
            <label className="text-sm font-medium" htmlFor="sg-input">
              Target column
            </label>
            <input
              id="sg-input"
              className="form-input"
              placeholder="TenYearCHD"
            />
          </div>
        </div>
      </Block>

      <Block title="Upload zone states (version 2 reference, not shown in version 1)">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-card border-brand/40 bg-surface border-2 border-dashed p-8 text-center">
            <CloudUpload className="text-brand mx-auto size-8" />
            <p className="mt-2 font-medium">Drop a CSV here or browse</p>
            <p className="text-ink-muted text-sm">Idle</p>
          </div>
          <div className="rounded-card border-brand bg-brand-soft border-2 border-solid p-8 text-center">
            <CloudUpload className="text-brand mx-auto size-8" />
            <p className="mt-2 font-medium">Release to upload</p>
            <p className="text-ink-muted text-sm">Hover</p>
          </div>
          <div className="animate-shake rounded-card border-refuse-line bg-refuse-soft text-refuse-ink border-2 border-dashed p-8 text-center">
            <OctagonX className="mx-auto size-8" />
            <p className="mt-2 font-medium">
              That&apos;s an Excel file. Export it as CSV and try again.
            </p>
            <p className="text-sm">Invalid (reload to replay the shake)</p>
          </div>
          <div className="rounded-card border-line-strong bg-surface border-2 border-dashed p-8 text-center">
            <LoaderCircle className="text-brand mx-auto size-8 animate-spin" />
            <p className="mt-2 font-medium">Reading your file…</p>
            <p className="text-ink-muted text-sm">Loading</p>
          </div>
        </div>
      </Block>

      <Block title="Section navigation dots">
        <p className="text-ink-muted mb-4 max-w-2xl text-sm">
          The dot is the engine&apos;s verdict for a section. The word beside it
          is what a screen reader hears, because colour alone says nothing to
          it.
        </p>
        <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          {statusLevels.map((level) => (
            <li key={level ?? "none"} className="flex items-center gap-2">
              <StatusDot level={level} />
              <span>{level ?? "not run"}</span>
              <span className="text-ink-faint">· {verdictWord(level)}</span>
            </li>
          ))}
        </ul>
      </Block>

      <Block title="Icons in use">
        <div className="text-ink-muted flex items-center gap-6">
          <Lock className="size-5" />
          <CloudUpload className="size-5" />
          <ChevronDown className="size-5" />
          <CircleCheck className="text-pass size-5" />
          <TriangleAlert className="text-warn size-5" />
          <OctagonX className="text-refuse size-5" />
        </div>
      </Block>
    </main>
  );
}
