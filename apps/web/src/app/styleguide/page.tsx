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
import { Logo, LogoMark } from "@/components/ui/Logo";

export const metadata: Metadata = {
  title: "Style guide · LogitLab",
  robots: { index: false, follow: false },
};

const colourGroups = [
  {
    title: "Surfaces",
    items: [
      { name: "canvas", cls: "bg-canvas" },
      { name: "surface", cls: "bg-surface" },
      { name: "surface-sunken", cls: "bg-surface-sunken" },
    ],
  },
  {
    title: "Text and lines",
    items: [
      { name: "ink", cls: "bg-ink" },
      { name: "ink-muted", cls: "bg-ink-muted" },
      { name: "ink-faint", cls: "bg-ink-faint" },
      { name: "line", cls: "bg-line" },
      { name: "line-strong", cls: "bg-line-strong" },
    ],
  },
  {
    title: "Brand",
    items: [
      { name: "brand", cls: "bg-brand" },
      { name: "brand-hover", cls: "bg-brand-hover" },
      { name: "brand-soft", cls: "bg-brand-soft" },
      { name: "brand-soft-hover", cls: "bg-brand-soft-hover" },
    ],
  },
  {
    title: "Verdicts",
    items: [
      { name: "pass", cls: "bg-pass" },
      { name: "pass-soft", cls: "bg-pass-soft" },
      { name: "warn", cls: "bg-warn" },
      { name: "warn-soft", cls: "bg-warn-soft" },
      { name: "refuse", cls: "bg-refuse" },
      { name: "refuse-soft", cls: "bg-refuse-soft" },
    ],
  },
  {
    title: "Charts",
    items: [
      { name: "chart-1", cls: "bg-chart-1" },
      { name: "chart-2", cls: "bg-chart-2" },
      { name: "chart-ref", cls: "bg-chart-ref" },
      { name: "chart-grid", cls: "bg-chart-grid" },
      { name: "chart-band", cls: "bg-chart-band" },
    ],
  },
];

function Swatch({ name, cls }: { name: string; cls: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`border-line size-10 shrink-0 rounded-lg border ${cls}`}
      />
      <code className="text-ink-muted font-mono text-sm">{name}</code>
    </div>
  );
}

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
      <p className="text-brand font-mono text-sm">/styleguide</p>
      <h1 className="text-display mt-1">Style guide</h1>
      <p className="text-lead text-ink-muted mt-4 max-w-2xl">
        Every token and component in one place. Change a token in theme.css and
        this page shows the redesign instantly.
      </p>

      <Block title="Logo">
        <div className="flex items-center gap-8">
          <Logo />
          <LogoMark className="text-brand size-10" />
        </div>
      </Block>

      <Block title="Colour tokens">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {colourGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h3 className="text-ink text-sm font-semibold">{group.title}</h3>
              {group.items.map((item) => (
                <Swatch key={item.name} {...item} />
              ))}
            </div>
          ))}
        </div>
      </Block>

      <Block title="Type scale">
        <div className="space-y-4">
          <p className="text-display">Upload a CSV.</p>
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

      <Block title="Upload zone states (static preview)">
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
