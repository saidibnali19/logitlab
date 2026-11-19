# LogitLab

A portfolio project that shows recruiters for **general analyst roles** that Said Ali can do **binary logistic regression** properly. It was inspired by his group's final-year study of Framingham heart-disease risk. A visitor gives it a CSV with a yes/no outcome and gets an **analyst's view** of the regression: what was done, why, how far to trust it, and what it means in plain English.

## The problem it solves

A logistic regression written in a notebook (say Google Colab) is written for one dataset. Hand it a different one and the code needs many changes: which column is the outcome, how to encode the rest, what to fill, which assumptions to check, how to read the output. LogitLab does that work once, for any CSV with a binary outcome, and hands back a reproducible script to take into a notebook.

So **nothing in the engine or the UI may assume Framingham.** It is one demo, chosen because it is real, messy and imbalanced. Labels, units and copy must not read as health-only or as medical advice.

## What it is not

An opinionated statistician in a box. **It is not SPSS.** It chooses, explains and refuses. It does not offer every test and option.

Out of scope: multi-class outcomes, other model families, accounts, saved sessions, databases, Excel files. Not a clinical tool. Results are associations, not causes.

## The eight deliverables are fixed

These are the homepage's promise: Said's agreed deliverables. **Do not add, remove, rename, reorder or reword them.** The single source of truth is `apps/web/src/lib/report-sections.ts`, which also drives the homepage outline.

| #   | Section                | Promise                                                                                                                                    |
| --- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Your data at a glance  | Detected column roles, a suggested target, flags for ID, constant and leaky columns                                                        |
| 2   | Data hygiene           | Missing values, how each gap was filled, a decision log of every automatic choice                                                          |
| 3   | Know your data         | Summary tables, distributions by outcome, a correlation heatmap                                                                            |
| 4   | Assumption checks      | Traffic-light verdicts on sample size, multicollinearity, linearity and influential points, plus checks that results do not depend on them |
| 5   | The model              | Odds ratios with 95% CIs, per unit or per SD, with a plain-English reading of each                                                         |
| 6   | How well does it work? | ROC, precision-recall and calibration, with a live threshold slider                                                                        |
| 7   | What-if explorer       | Move the sliders and watch the predicted risk change                                                                                       |
| 8   | Takeaways and export   | A plain-English summary, a PDF report, a coefficients CSV and a reproducible script                                                        |

Refining inside a section is fine. A new section, feature, setting or test that the promise does not cover is not: stop and ask Said first. Approved extras to keep: the cost-ratio input (6) and the "strongest pairs" list (3).

## Overrides are real controls

Every override button in the report must work, **including on the Framingham sample**, so a visitor can test them there. The agreed option sets:

- **Outcome:** any binary column, and which of its two levels counts as the event.
- **Fill method per column:** continuous mean or median; categorical mode or a "Missing" level.
- **Outlier capping:** cap flagged values at the fences, or keep them (the default).
- **Reference level:** any level of a categorical column.
- **Duplicate rows:** remove or keep (the default).
- **Remedies:** spline or log for a continuous predictor, and "exclude one" for a redundant pair. They are offered when the evidence is borderline, not only on a failure, so they can be exercised on Framingham (diastolic BP, age, the smoker and cigarettes pair).
- **Include or exclude a column:** a toggle per row in section 1. Columns the engine sets aside as ID, constant or free text have no toggle, because they cannot enter a regression.

- The automatic choices are the default. At the defaults the result is the frozen Framingham result. An override re-runs the engine and replaces the result, and "back to the automatic choices" returns to it.
- Every applied override is recorded: a decision-log entry with `automatic: false`, `roleSource: "user"`, the remedy marked `applied`, exclusions listed in `model.exclusions`, and the report says how many choices were changed.
- Guardrails still apply after an override, so it can end in a refusal. An override never switches a check off.
- The UI renders what the engine offers (`alternative`, `remedies`). It never hard-codes an option. The option sets live in one place in the engine.
- Overrides need Python, so they call the API even for the sample. The baseline sample stays precomputed and instant.

## What "opinionated" means here

- **It refuses analyses that would mislead** (too few events per term, perfect collinearity or separation, no binary outcome), with a message that teaches why.
- **It decides, then explains.** Every automatic choice goes in the decision log with its reason, and its alternative where one exists.
- **It never drops a predictor silently.** A failed assumption means a warning, a remedy and a sensitivity check.
- **It is honest about limits.** An AUC of 0.70 is "modest", not "acceptable". Say what the numbers do not show.
- **The engine decides, the UI displays.** A verdict is data (`{level, text}`). The UI styles it and never decides pass or fail. The one aggregation allowed is the section navigation showing the most severe verdict the engine gave.
- **One consistent set of numbers.** Nothing on the page may disagree with another part of the page.

## Statistical rules (do not "improve" without asking)

- Inference comes from an **unweighted** fit on all rows. Odds ratios are shown per 1 SD by default.
- The threshold is tuned on cross-validation predictions from the training rows. The hold-out test rows (80/20 stratified, seed 42) are used **once**. Imputation for the evaluation is learned from training rows only.
- Box-Tidwell failure triggers a spline sensitivity comparison, not removal.
- Thresholds and limits live in `packages/engine/logitlab_engine/config.py`, not in logic.
- **The Framingham numbers at default settings are frozen** (e.g. LR χ² 404.6, AUC 0.70). Any engine change must leave them identical: regenerate the sample and diff it. Overrides change numbers on purpose, and only when asked for.

## Architecture

- npm-workspaces + Turborepo monorepo.
  - `apps/web`: Next.js 16, React 19, TypeScript, Tailwind 4. Hand-written SVG charts with `d3-scale`.
  - `packages/engine`: pure Python (pandas, statsmodels, scikit-learn, scipy). **No web code.** It outputs one JSON result.
  - **A FastAPI service wraps the engine** and runs overrides and uploaded CSVs. Said chose FastAPI over running Python in the browser. It is not built yet. The upload zone says the engine is not connected.
- Hosting is not decided (leaning Render). Whatever the host, the service must cope with a cold start (the page wakes it early and says so) and the memory that statsmodels and scikit-learn need.
- The sample baseline is precomputed: `apps/web/public/samples/*.result.json`, loaded instantly. `framingham-small` is a deliberately refused result shown by "See what LogitLab refuses".
- **There will be three example datasets** (Framingham plus two more, not chosen yet), so nothing may be written for Framingham alone. Each needs its CSV and a generated result, and every override must work on all of them.
- **The contract** is `apps/web/src/lib/report/types.ts` and `packages/engine/logitlab_engine/validate.py`. Change both together, and bump `SCHEMA_VERSION` for anything not purely additive. Rules: proportions are 0 to 1, no NaN or Infinity (use `null`), verdicts are data, curves are about 100 points, anything the UI computes live ships its ingredients.
- Generated files (`*.result.json`, `preview.generated.json`) are written by `packages/engine/scripts/build_fixture.py`. Never edit them by hand. The script validates the contract and runs the generated reproducible script against the CSV.
- **Privacy is a public promise** ("processed in memory and never stored", no analytics, no cookies). The API must be stateless: no database, no files written, no logging of file contents or column names. Keep the copy true.

## Commands

- Repo root: `npm run dev`, `npm run build`, `npm run lint`, `npm run format:check`.
- Type-check (no script): `cd apps/web && npx tsc --noEmit -p .`. Delete `.next/types` first if it complains about missing routes.
- Engine: `packages/engine/.venv/Scripts/python.exe` from `packages/engine`. Prefix with `PYTHONIOENCODING=utf-8` on Windows.
  - `scripts/build_fixture.py` regenerates the sample results and runs every check.
  - `scripts/smoke_test.py` prints library versions and basic stats. There is no test suite yet.
- Before saying work is done: lint, type-check, `prettier --check`, a production build, and for UI changes look at it in a browser in light and dark and at phone width (320 to 1920, no horizontal overflow).

## Front-end conventions

- **Colour: semantic tokens only** (`bg-surface`, `text-ink-muted`, `border-line`, `brand`, `pass`, `warn`, `refuse`, `chart-*`). Never raw palette classes (`slate-500`) or hex outside `src/styles/theme.css`. Each token holds `light-dark(light, dark)`, so components never use `dark:`. The build rewrites `light-dark()`, so the theme switches only at `<html data-theme>`, never per element.
- One component per file, named function, props typed inline, a one-line `/** */` comment. Comments explain **why**, in plain English. Import with `@/`.
- `"use client"` only for small interactive islands (toggles, sliders, navigation). Everything else renders without client code.
- Verdict maps live in `lib/verdict.ts` and number formatting in `lib/format.ts`. Reuse them.
- Every chart sits in `ChartFigure` with a table fallback. Grids that only set columns at a breakpoint need `grid-cols-1` if a child has a minimum width, or the page widens on phones.
- Shared component classes (`.card`, `.btn`, `.badge-*`, `.verdict-*`) are in `styles/components.css`. They cannot `@apply` each other.
- Next.js 16 differs from older versions (Cache Components on, `error.tsx` gets `retry`). Read the relevant guide in `node_modules/next/dist/docs/` before Next work.
- Prettier is authoritative (double quotes, 80 columns, Tailwind class sorting). Run `npx prettier --write` on files you touch.
- Print is part of the product ("Save as PDF"): `styles/print.css` forces light, keeps backgrounds and opens every `<details>`.

## Copy and tone

- UI copy uses British spelling (analyse, colour). Plain English. No jargon without a gloss. No hype, no clinical claims.
- Every number a visitor sees comes from the engine. Never hard-code a figure in the UI.

## Git workflow

- Said works in rounds: a plan with numbered decisions, he picks, then code. If he says "no code yet", write none.
- One branch per piece of work, small commits, imperative sentence-case messages with no prefixes, ending with the session's co-author trailer.
- **Never merge or push unless asked.** Stage files by explicit path: `core.autocrlf` makes many files show as modified with no real diff. `git diff --ignore-cr-at-eol` shows real changes.
- Leave `.claude/` and `skills-lock.json` alone.

## Environment (Windows)

- Git Bash and PowerShell are both available. Use PowerShell for `npx.cmd`, which fails in Git Bash because of the space in `C:\Program Files`.
- The first `next build` or `next dev` run by an agent stops with an "upgrade reminder"; run the same command again.
- `StateDebugStrip` and the upload-zone state picker appear in development only.

## Pending decisions (delete as they are settled)

- Hosting (Render or another) and where the FastAPI app lives (probably `apps/api`).
- Which two datasets join Framingham as examples.

@apps/web/AGENTS.md
