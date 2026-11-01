"""Sensitivity checks: does a curve, the filling of gaps, or a few rows change the story?"""

from __future__ import annotations

import numpy as np
import pandas as pd
from scipy.stats import chi2

from . import config
from .assumptions import cooks_distance
from .fmt import fmt_p, join_labels
from .logit import LogitFit, Refused, fit_logit
from .model import odds_ratios
from .profile import Profile


# ───────────────────────── natural cubic spline ─────────────────────────


def _spline_columns(x: np.ndarray, knots: np.ndarray) -> np.ndarray:
    """Restricted cubic spline basis: the variable itself plus two curvature columns (3 df)."""
    t = knots
    k = len(t)
    cube = lambda v: np.clip(v, 0, None) ** 3  # noqa: E731
    scale = (t[-1] - t[0]) ** 2
    cols = [x]
    for j in range(k - 2):
        h = (
            cube(x - t[j])
            - cube(x - t[k - 2]) * (t[k - 1] - t[j]) / (t[k - 1] - t[k - 2])
            + cube(x - t[k - 1]) * (t[k - 2] - t[j]) / (t[k - 1] - t[k - 2])
        ) / scale
        cols.append(h)
    return np.column_stack(cols)


class _Spline:
    """A fitted basis: knots plus the centring and scaling used to keep the optimiser stable."""

    def __init__(self, values: np.ndarray):
        self.knots = np.quantile(values, config.SPLINE_KNOT_QUANTILES)
        raw = _spline_columns(values, self.knots)
        self.mean, self.sd = raw.mean(axis=0), raw.std(axis=0)

    def usable(self) -> bool:
        return bool(np.all(np.diff(self.knots) > 0)) and bool(np.all(self.sd > 0))

    def columns(self, values: np.ndarray) -> np.ndarray:
        return (_spline_columns(values, self.knots) - self.mean) / self.sd


# ───────────────────────── helpers ─────────────────────────


def _std_ors(fit: LogitFit, terms: list[dict]) -> dict[str, float]:
    return {name: o["std"][0] for name, o in odds_ratios(fit, terms).items()}


def _max_change(a: dict[str, float], b: dict[str, float]) -> tuple[float, str | None]:
    """Largest fractional change between two sets of odds ratios, and the term it happened to."""
    changes = {k: abs(b[k] - a[k]) / a[k] for k in a if k in b}
    if not changes:
        return 0.0, None
    term = max(changes, key=lambda k: changes[k])
    return changes[term], term


def _pct(fraction: float) -> str:
    return f"{fraction * 100:.0f}%" if fraction >= 0.1 else f"{fraction * 100:.1f}%"


def _safe_fit(X: pd.DataFrame, y: pd.Series) -> LogitFit | None:
    try:
        fit = fit_logit(X, y)
    except Refused:
        return None
    return None if fit.separated else fit


# ───────────────────────── linear versus spline ─────────────────────────


def _linearity_one(col, X, y, terms, fit, imputed, bt_p) -> dict | None:
    x = imputed[col.name].to_numpy(float)
    spline = _Spline(x)
    if not spline.usable():
        return None

    basis = spline.columns(x)
    names = [f"spline::{col.name}[{i}]" for i in range(basis.shape[1])]
    alt_X = X.drop(columns=col.name).copy()
    for i, name in enumerate(names):
        alt_X[name] = basis[:, i]
    alt = _safe_fit(alt_X, y)
    if alt is None:
        return None

    extra_df = basis.shape[1] - 1
    lr = max(2 * (alt.llf - fit.llf), 0.0)
    lr_p = float(chi2.sf(lr, extra_df))
    delta_aic = float(fit.aic - alt.aic)

    others = [t for t in terms if t["name"] != col.name]
    change, _ = _max_change(_std_ors(fit, others), _std_ors(alt, others))
    matters = delta_aic > config.MATTERS_DELTA_AIC or change > config.MATTERS_OR_CHANGE

    label = col.label
    if matters:
        level = "warn"
        text = (
            f"A curve for {label} fits clearly better than a straight line (AIC better by {delta_aic:.1f}, "
            f"{fmt_p(lr_p)}). Read its odds ratio as an average slope and treat it with caution."
        )
    else:
        level = "pass"
        text = (
            f"Allowing a curve for {label} improves the fit only slightly (AIC better by {delta_aic:.1f}, "
            f"{fmt_p(lr_p)}), and no other odds ratio moves by more than {_pct(change)}. "
            "The straight-line version is reasonable."
        )

    # Curves: the other predictors are held at their averages, so the two lines are comparable.
    means = X.mean().to_dict()
    coef, alt_coef = fit.params.to_dict(), alt.params.to_dict()
    grid = np.linspace(np.quantile(x, 0.01), np.quantile(x, 0.99), config.CURVE_POINTS)
    base_linear = float(sum(coef[c] * means[c] for c in X.columns if c != col.name))
    linear = base_linear + float(coef[col.name]) * grid
    base_alt = float(sum(alt_coef[c] * means[c] for c in alt_X.columns if c not in names))
    curve = base_alt + spline.columns(grid) @ np.array([alt_coef[n] for n in names])

    # Empirical logits in ten equal-sized bins (a half is added to each count so none is infinite).
    frame = pd.DataFrame({"x": x, "y": y.to_numpy()})
    frame["bin"] = pd.qcut(frame["x"], config.BINNED_POINTS, duplicates="drop")
    binned = []
    for _, g in frame.groupby("bin", observed=True):
        events, n = float(g["y"].sum()), len(g)
        binned.append({"x": float(g["x"].mean()), "logit": float(np.log((events + 0.5) / (n - events + 0.5))), "n": n})

    return {
        "column": col.name,
        "label": label,
        "boxTidwellP": bt_p,
        "primaryAic": fit.aic,
        "alternativeAic": alt.aic,
        "deltaAic": delta_aic,
        "lrPValue": lr_p,
        "maxOrChange": change,
        "matters": matters,
        "verdict": {"level": level, "text": text},
        "binned": binned,
        "linearCurve": [{"x": round(float(a), 4), "y": round(float(b), 4)} for a, b in zip(grid, linear)],
        "splineCurve": [{"x": round(float(a), 4), "y": round(float(b), 4)} for a, b in zip(grid, curve)],
    }


# ───────────────────────── complete cases ─────────────────────────


def _complete_case(X, y, terms, fit, data, profile) -> dict | None:
    predictors = [c.name for c in profile.predictors()]
    keep = data[predictors].notna().all(axis=1).to_numpy()
    if keep.all():
        return None
    cc = _safe_fit(X[keep], y[keep])
    if cc is None:
        return None

    primary, other = odds_ratios(fit, terms), odds_ratios(cc, terms)
    rows, changed = [], []
    for t in terms:
        a, b = primary[t["name"]]["std"], other[t["name"]]["std"]
        same = (a[1] <= 1 <= a[2]) == (b[1] <= 1 <= b[2])
        if not same:
            changed.append(t["label"])
        rows.append(
            {
                "term": t["name"],
                "label": t["label"],
                "orPrimary": a[0],
                "orCompleteCase": b[0],
                "change": (b[0] - a[0]) / a[0],
                "sameSignificance": same,
            }
        )
    worst = max(rows, key=lambda r: abs(r["change"]))
    biggest = abs(worst["change"])
    dropped = int((~keep).sum())
    if changed or biggest > config.MATTERS_OR_CHANGE:
        level = "warn"
        text = (
            f"Using only the {int(keep.sum()):,} complete rows changes whether there is clear evidence for "
            f"{join_labels(changed)}, and moves the odds ratio for {worst['label']} by {_pct(biggest)}. " if changed else
            f"Using only the {int(keep.sum()):,} complete rows moves the odds ratio for {worst['label']} by {_pct(biggest)}. "
        ) + "The way gaps were filled matters for these results."
    else:
        level = "pass"
        text = (
            f"Dropping the {dropped:,} rows with gaps ({dropped / len(y):.1%}) changes no conclusion; "
            f"the largest shift in any odds ratio is {_pct(biggest)}. Filling the gaps is not driving the results."
        )
    return {"primaryN": len(y), "completeCaseN": int(keep.sum()), "verdict": {"level": level, "text": text}, "rows": rows}


# ───────────────────────── removing influential rows ─────────────────────────


def _influence_refit(X, y, terms, fit) -> dict | None:
    k = max(int(round(len(y) * config.INFLUENCE_REFIT_FRACTION)), 1)
    cooks = cooks_distance(X, y, fit)
    keep = np.ones(len(y), dtype=bool)
    keep[np.argsort(cooks)[::-1][:k]] = False
    refit = _safe_fit(X[keep], y[keep])
    if refit is None:
        return None
    change, key = _max_change(_std_ors(fit, terms), _std_ors(refit, terms))
    label = next((t["label"] for t in terms if t["name"] == key), key)
    if change > config.MATTERS_OR_CHANGE:
        level = "warn"
        text = (
            f"Removing the {k} most influential rows moves the odds ratio for {label} by {_pct(change)}. "
            "That estimate rests on a few rows, so read it with caution. This is only a check: no row was removed from the model."
        )
    else:
        level = "pass"
        text = (
            f"Removing the {k} most influential rows ({config.INFLUENCE_REFIT_FRACTION:.0%} of the data) moves no "
            f"odds ratio by more than {_pct(change)}. A few unusual rows are not driving the results. "
            "This is only a check: no row was removed from the model."
        )
    return {"removed": k, "maxOrChange": change, "verdict": {"level": level, "text": text}}


# ───────────────────────── the block ─────────────────────────


def sensitivity_block(X, y, terms, fit, imputed, data, profile: Profile, assumptions: dict) -> dict:
    candidates = [r for r in assumptions["boxTidwell"] if r["pValue"] < config.SENSITIVITY_BT_P]
    candidates.sort(key=lambda r: r["pValue"])

    linearity = []
    for row in candidates:
        result = _linearity_one(profile.info(row["column"]), X, y, terms, fit, imputed, row["pValue"])
        if result:
            linearity.append(result)

    complete_case = _complete_case(X, y, terms, fit, data, profile)
    influence = _influence_refit(X, y, terms, fit)

    verdicts = [r["verdict"]["level"] for r in linearity]
    verdicts += [b["verdict"]["level"] for b in (complete_case, influence) if b]
    n_warn = verdicts.count("warn")
    if not verdicts:
        verdict = {"level": "info", "text": "No sensitivity check was needed for this data."}
    elif n_warn:
        verdict = {"level": "warn", "text": f"{n_warn} of {len(verdicts)} sensitivity checks changed something. See below."}
    else:
        verdict = {
            "level": "pass",
            "text": f"All {len(verdicts)} sensitivity checks left the conclusions unchanged: the straight-line "
            "terms, the filling of gaps and the unusual rows are not driving the results.",
        }
    return {"verdict": verdict, "linearity": linearity, "completeCase": complete_case, "influence": influence}