# LogitLab

A portfolio project that shows recruiters for **general analyst roles** that Said Ali can do **binary logistic regression** properly. It was inspired by his group's final-year study of Framingham heart-disease risk. The aim is that a visitor gives it a CSV with a yes/no outcome and gets an **analyst's view** of the regression: what was done, why, how far to trust it, and what it means in plain English. Version 1 shows that view on one prepared example. Uploads arrive in version 2.

## Release scope

Said is applying for analyst roles now, so the project ships in two versions. A recruiter who spends two minutes on the site or the repo must see a finished, honest product: nothing that looks broken, and nothing that promises something that does not work yet.

- **Version 1 (current work):** a complete, guided analysis of the prepared example dataset (Framingham) at the automatic choices, with all eight report sections working, plus the refusal example ("See what LogitLab refuses"). The eight deliverables below are unchanged.
- **Version 2 (later, not now):** analysing an uploaded CSV through the FastAPI service, every override, and two more example datasets. Its design is under "Version 2 design" below. It is the plan, not current work: do not build toward it without asking.

What that means in the code today:

- No switched-off controls and no upload zone. The hero has a static "Version 2" card instead of a file input.
- The decision log shows each `alternative` as plain text ("Alternative considered: …"), and `CheckCard` shows `remedies` as plain text. They never become buttons in version 1.
- One line says what version 2 adds: `SITE.v2Line` in `apps/web/src/lib/site.ts`. Use it word for word wherever the UI or README mentions version 2.
- Privacy copy describes what version 1 does: no file is read, nothing is sent, no cookies or analytics, and the light or dark choice is kept in the browser. "Processed in memory and never stored" is version 2's promise and is labelled as such.
- Every number on the page comes from the result file. Do not hard-code a count in copy (Group 3's report says 4,238 records, the example has 4,240 rows).

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
  - `apps/web`: Next.js 16, React 19, TypeScript, Tailwind 4. Hand-written SVG charts with `d3-scale`. Live at https://logitlab.vercel.app/ (Vercel).
  - `packages/engine`: pure Python (pandas, statsmodels, scikit-learn, scipy). **No web code.** It outputs one JSON result.
- The report is precomputed: `apps/web/public/samples/*.result.json`, loaded instantly. `framingham-small` is a deliberately refused result shown by "See what LogitLab refuses". Nothing runs Python in version 1.
- **The contract** is `apps/web/src/lib/report/types.ts` and `packages/engine/logitlab_engine/validate.py`. Change both together, and bump `SCHEMA_VERSION` for anything not purely additive. Rules: proportions are 0 to 1, no NaN or Infinity (use `null`), verdicts are data, curves are about 100 points, anything the UI computes live ships its ingredients.
- Generated files (`*.result.json`, `preview.generated.json`) are written by `packages/engine/scripts/build_fixture.py`. Never edit them by hand. The script validates the contract and runs the generated reproducible script against the CSV.
- **Privacy is a public promise.** Keep the copy true to what the code does (see "Release scope"). In version 1 the site collects nothing and has no cookies or analytics.

## Version 2 design

This is the plan for version 2, not current work. It keeps the rules the original scope set.

### Uploads and the API

- **A FastAPI service wraps the engine** and runs overrides and uploaded CSVs. Said chose FastAPI over running Python in the browser. It is not built.
- Hosting is not decided (leaning Render). Whatever the host, the service must cope with a cold start (the page wakes it early and says so) and the memory that statsmodels and scikit-learn need.
- **Privacy:** "processed in memory and never stored" becomes a real promise here. The API must be stateless: no database, no files written, no logging of file contents or column names. No analytics, no cookies.

### Three example datasets

Framingham plus two more, not chosen yet, so nothing may be written for Framingham alone. Each needs its CSV and a generated result, and every override must work on all of them.

### Overrides are real controls

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
- In version 2 the buttons come back: the plain-text alternatives and remedies of version 1 become the controls.

## Commands

- Repo root: `npm run dev`, `npm run build`, `npm run lint`, `npm run format:check`.
- Type-check (no script): `cd apps/web && npx tsc --noEmit -p .`. Delete `.next/types` first if it complains about missing routes.
- Engine: `packages/engine/.venv/Scripts/python.exe` from `packages/engine`. Prefix with `PYTHONIOENCODING=utf-8` on Windows.
  - `scripts/build_fixture.py` regenerates the sample results and runs every check.
  - `scripts/smoke_test.py` prints library versions and basic stats. There is no test suite yet.
- Before saying work is done: lint, type-check, `prettier --check`, a production build, and for UI changes look at it in a browser in light and dark and at phone width (320 to 1920, no horizontal overflow).
- `npm run format:check` fails on a Windows checkout for reasons that are not real: working-tree files have CRLF endings (`core.autocrlf`) and the untracked `.claude/` skill files are flagged. Check what you touched with `npx prettier --check <paths> --end-of-line auto`.

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
- The first `next build` or `next dev` run by an agent may stop with an "upgrade reminder" when a Next.js advisory exists; run the same command again.
- `StateDebugStrip` appears in development only.

## Pending decisions (delete as they are settled)

- **Licence (reconsider):** there is no LICENSE file, so the code is not licensed for reuse. Said chose to leave it for now. Reconsider before sharing the repo more widely, or if anyone asks to reuse it. The Framingham CSV is not LogitLab's to license: its terms are the Kaggle page's.
- **CSV terms (check):** the example CSV came from https://www.kaggle.com/datasets/aasheesh200/framingham-heart-study-dataset. The licence on that page was not checked (the page could not be fetched). Read it before relying on redistributing the CSV in the repo and on the site.
- **Version 2:** hosting for the FastAPI service (Render or another) and where it lives (probably `apps/api`).
- **Version 2:** which two datasets join Framingham as examples.

@apps/web/AGENTS.md
