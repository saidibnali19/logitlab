"""Assumption checks and joint tests. Produces the assumptions block.

The rule: a failed assumption changes how the model is shaped or read. It never
removes a predictor. Only a refusal (an impossible or meaningless model) stops the run.
"""

from __future__ import annotations

import numpy as np
import pandas as pd
from scipy.stats import chi2

from . import config
from .fmt import fmt_p, join_labels
from .logit import LogitFit, Refused, fit_logit
from .profile import Profile


# ───────────────────────── individual computations ─────────────────────────


def vif_table(X: pd.DataFrame, terms: list[dict]) -> list[dict]:
    names = [t["name"] for t in terms]
    Z = X[names].to_numpy(float)
    rows = []
    for j, term in enumerate(terms):
        target = Z[:, j]
        A = np.column_stack([np.ones(len(Z)), np.delete(Z, j, axis=1)])
        beta, *_ = np.linalg.lstsq(A, target, rcond=None)
        residual = target - A @ beta
        total = float(((target - target.mean()) ** 2).sum())
        r2 = 1.0 - float(residual @ residual) / total if total > 0 else 1.0
        value = 1.0 / (1.0 - r2) if r2 < 1 - 1e-12 else float("inf")
        rows.append({"term": term["name"], "label": term["label"], "value": value})
    return rows


def related_groups(X: pd.DataFrame, terms: list[dict]) -> list[list[str]]:
    """Connected groups of terms whose pairwise |correlation| reaches the threshold."""
    names = [t["name"] for t in terms]
    corr = X[names].corr().abs().to_numpy()
    position = {name: i for i, name in enumerate(names)}
    seen: set[str] = set()
    groups: list[list[str]] = []
    for start in names:
        if start in seen:
            continue
        stack, component = [start], []
        while stack:
            node = stack.pop()
            if node in seen:
                continue
            seen.add(node)
            component.append(node)
            for other in names:
                if other not in seen and corr[position[node], position[other]] >= config.GROUP_CORRELATION:
                    stack.append(other)
        if len(component) > 1:
            groups.append([n for n in names if n in component])
    return groups


def joint_tests(X: pd.DataFrame, terms: list[dict], fit: LogitFit, vif: list[dict]) -> list[dict]:
    label_of = {t["name"]: t["label"] for t in terms}
    vif_of = {v["term"]: v["value"] for v in vif}
    corr_names = [t["name"] for t in terms]
    corr = X[corr_names].corr().to_numpy()
    position = {name: i for i, name in enumerate(corr_names)}
    tests = []
    for number, members in enumerate(related_groups(X, terms), start=1):
        beta = fit.params[members].to_numpy()
        cov = fit.cov.loc[members, members].to_numpy()
        statistic = float(beta @ np.linalg.solve(cov, beta))
        df = len(members)
        p_value = float(chi2.sf(statistic, df))

        pairs = [(a, b, float(corr[position[a], position[b]])) for i, a in enumerate(members) for b in members[i + 1 :]]
        a, b, r = max(pairs, key=lambda item: abs(item[2]))
        labels = [label_of[m] for m in members]
        significant = p_value < 0.05
        if significant:
            reading = (
                f"Together they show clear evidence of an association with the outcome "
                f"(χ² = {statistic:.1f}, df = {df}, {fmt_p(p_value)}). Because they overlap, "
                "read their separate odds ratios as a set rather than one by one."
            )
        else:
            reading = (
                f"There is no clear evidence that they are associated with the outcome as a set "
                f"(χ² = {statistic:.1f}, df = {df}, {fmt_p(p_value)})."
            )
        tests.append(
            {
                "id": f"group-{number}",
                "label": join_labels(labels),
                "terms": members,
                "reason": f"Correlated at |r| ≥ {config.GROUP_CORRELATION:g}; the strongest pair is "
                f"{label_of[a]} and {label_of[b]} (r = {r:.2f}).",
                "maxVif": float(max(vif_of[m] for m in members)),
                "statistic": statistic,
                "df": df,
                "pValue": p_value,
                "significant": significant,
                "interpretation": reading,
            }
        )
    return tests


def box_tidwell(X: pd.DataFrame, y: pd.Series, imputed: pd.DataFrame, profile: Profile) -> tuple[list[dict], dict[str, float]]:
    """Adds x·ln(x) for every continuous predictor and tests each added term (Wald)."""
    continuous = [c for c in profile.predictors() if c.type == "continuous"]
    if not continuous:
        return [], {}
    augmented = X.copy()
    shifts: dict[str, float] = {}
    for col in continuous:
        x = imputed[col.name].astype(float)
        shift = 0.0 if x.min() > 0 else 1.0 - float(x.min())  # logs need strictly positive values
        shifted = x + shift
        term = shifted * np.log(shifted)
        # Centring and scaling the added column keeps the optimiser stable and leaves its Wald p-value unchanged.
        augmented[f"bt::{col.name}"] = (term - term.mean()) / term.std()
        shifts[col.name] = shift

    try:
        fit = fit_logit(augmented, y)
    except Refused:
        return [], shifts
    alpha = config.BOX_TIDWELL_ALPHA / len(continuous)  # Bonferroni
    rows = []
    for col in continuous:
        p_value = float(fit.pvalues[f"bt::{col.name}"])
        level = "warn" if p_value < alpha else ("info" if p_value < config.BOX_TIDWELL_ALPHA else "pass")
        rows.append({"column": col.name, "label": col.label, "pValue": p_value, "level": level})
    return rows, shifts


def cooks_distance(X: pd.DataFrame, y: pd.Series, fit: LogitFit) -> np.ndarray:
    values = X.to_numpy(float)
    p = np.clip(fit.fitted, 1e-12, 1 - 1e-12)
    w = p * (1 - p)
    weighted = values * np.sqrt(w)[:, None]
    inverse = np.linalg.inv(weighted.T @ weighted)
    leverage = np.einsum("ij,jk,ik->i", weighted, inverse, weighted)
    pearson = (y.to_numpy(float) - p) / np.sqrt(w)
    return pearson**2 * leverage / (values.shape[1] * (1 - leverage) ** 2)


# ───────────────────────── the block ─────────────────────────


def _check(id_: str, title: str, level: str, text: str, action: str, detail: str, remedies: list[dict] | None = None) -> dict:
    return {
        "id": id_,
        "title": title,
        "verdict": {"level": level, "text": text},
        "action": action,
        "detail": detail,
        "remedies": remedies or [],
    }


def _dependent_columns(X: pd.DataFrame) -> list[str]:
    rank = np.linalg.matrix_rank(X.to_numpy(float))
    out = []
    for name in X.columns:
        if name != "const" and np.linalg.matrix_rank(X.drop(columns=name).to_numpy(float)) == rank:
            out.append(name)
    return out


def build_assumptions(X: pd.DataFrame, y: pd.Series, terms: list[dict], imputed: pd.DataFrame, profile: Profile) -> tuple[dict, dict | None, LogitFit | None]:
    """Returns (block, refusal or None, the full-data fit or None)."""
    n, n_terms = len(y), len(terms)
    events = int(y.sum())
    smaller = min(events, n - events)
    epv_value = smaller / n_terms
    label_of = {t["name"]: t["label"] for t in terms}

    checks: list[dict] = []
    epv = {"events": smaller, "terms": n_terms, "value": epv_value, "minimum": config.MIN_EPV}
    empty = {"threshold": 4 / n, "count": 0, "maxCooksD": 0.0, "flagged": []}

    def finish(refusal: Refused | None, vif=None, bt=None, influence=None, groups=None, fit=None):
        levels = [c["verdict"]["level"] for c in checks]
        if refusal is not None:
            verdict = {"level": "refuse", "text": f"Refused: {refusal.title}. {refusal.message}"}
        else:
            n_warn = levels.count("warn")
            passed = levels.count("pass")
            assumed = levels.count("info")
            text = f"{passed} checks passed"
            if assumed:
                text += f", {assumed} assumed rather than tested"
            text += f", {n_warn} need attention." if n_warn else "."
            text += " No predictor was removed."
            verdict = {"level": "warn" if n_warn else "pass", "text": text}
        block = {
            "verdict": verdict,
            "checks": checks,
            "epv": epv,
            "vif": vif or [],
            "boxTidwell": bt or [],
            "influence": influence or empty,
            "groupTests": groups or [],
        }
        return block, (refusal.as_dict() if refusal else None), fit

    # 1. Binary outcome (true by construction once a target is chosen)
    checks.append(
        _check(
            "binary-outcome",
            "Binary outcome",
            "pass",
            "The outcome has exactly two values.",
            "kept",
            f"'{profile.target}' takes exactly two values: {profile.negative_label} and {profile.positive_label}.",
        )
    )

    # 2. Independence (cannot be tested from a file)
    checks.append(
        _check(
            "independence",
            "Independent observations",
            "info",
            "Assumed, not tested.",
            "kept",
            "This depends on how the data were collected: one row per person, with no repeated "
            "measurements. A CSV cannot prove it, so it is stated here rather than silently assumed.",
        )
    )

    # 3. Sample size (events per term)
    if epv_value < config.REFUSE_EPV:
        refusal = Refused(
            "sample-size",
            "Too few events",
            f"There are only {smaller} events for {n_terms} model terms ({epv_value:.1f} per term). "
            f"Below {config.REFUSE_EPV} per term, the estimates are too unstable to trust. "
            "Collect more cases, or exclude some predictors yourself.",
        )
        checks.append(_check("sample-size", "Sample size", "refuse", f"{epv_value:.1f} events per term.", "refused", refusal.message))
        return finish(refusal)
    level = "pass" if epv_value >= config.MIN_EPV else "warn"
    checks.append(
        _check(
            "sample-size",
            "Sample size",
            level,
            f"{epv_value:.1f} events per term.",
            "kept",
            f"{smaller} events across {n_terms} model terms gives {epv_value:.1f} per term; "
            f"at least {config.MIN_EPV} is the usual guideline.",
        )
    )

    # 4. Perfect collinearity makes the model impossible to fit.
    if np.linalg.matrix_rank(X.to_numpy(float)) < X.shape[1]:
        names = _dependent_columns(X)
        shown = ", ".join(f"'{label_of.get(m, m)}'" for m in names[:4])
        refusal = Refused(
            "multicollinearity",
            "Perfect collinearity",
            f"Some predictors are exact combinations of others ({shown}), so the model cannot "
            "tell their effects apart. Exclude one of them and run it again.",
            names[0] if names else None,
        )
        checks.append(_check("multicollinearity", "Multicollinearity", "refuse", "Perfect collinearity.", "refused", refusal.message))
        return finish(refusal)

    # 5. Fit once; it feeds the joint tests, the separation check and influence.
    try:
        fit = fit_logit(X, y)
    except Refused as refusal:
        checks.append(_check("separation", "Separation", "refuse", refusal.title + ".", "refused", refusal.message))
        return finish(refusal)
    if fit.separated:
        refusal = Refused(
            "separation",
            "Perfect or near-perfect separation",
            "The model could not settle on stable estimates, which usually means a predictor "
            "separates the outcome almost perfectly. Check for a column that is the outcome in disguise.",
        )
        checks.append(_check("separation", "Separation", "refuse", refusal.title + ".", "refused", refusal.message))
        return finish(refusal)
    checks.append(_check("separation", "Separation", "pass", "The model converged normally.", "kept", "No predictor separates the outcome perfectly."))

    # 6. Multicollinearity (VIF) and the joint tests
    vif = vif_table(X, terms)
    worst = max(vif, key=lambda row: row["value"])
    groups = joint_tests(X, terms, fit, vif)
    if worst["value"] >= config.VIF_LIMIT:
        level, text, action = "warn", f"Highest VIF is {worst['value']:.1f} (limit {config.VIF_LIMIT:g}).", "remedy-offered"
    else:
        level, text, action = "pass", f"Highest VIF is {worst['value']:.2f} (limit {config.VIF_LIMIT:g}).", "kept"
    detail = f"'{worst['label']}' has the highest variance inflation factor, {worst['value']:.2f}."
    if groups:
        detail += (
            f" {len(groups)} group(s) of related predictors were found (correlation of at least "
            f"{config.GROUP_CORRELATION:g}). They are all kept and tested together below."
        )
    remedies = []
    if level == "warn":
        remedies = [
            {"id": "joint-test", "label": "Read related predictors as a set", "description": "Use the joint test for each group instead of reading single odds ratios.", "applied": True},
            {"id": "exclude-one", "label": "Exclude one yourself", "description": "Only you can remove a predictor; do it in section 01 if a pair is truly redundant.", "applied": False},
        ]
    checks.append(_check("multicollinearity", "Multicollinearity", level, text, action, detail, remedies))

    # 7. Linearity in the logit (Box-Tidwell)
    bt, shifts = box_tidwell(X, y, imputed, profile)
    alpha = config.BOX_TIDWELL_ALPHA / max(len(bt), 1)
    flagged = [row for row in bt if row["level"] == "warn"]
    borderline = [row for row in bt if row["level"] == "info"]
    shifted = [profile.info(c).label for c, s in shifts.items() if s]
    if not bt and shifts:
        level, action = "info", "kept"
        text = "Linearity could not be tested."
    elif flagged:
        names = join_labels([row["label"] for row in flagged])
        level, action = "warn", "remedy-offered"
        text = f"Non-linearity detected for {names}."
    else:
        smallest = min(bt, key=lambda row: row["pValue"]) if bt else None
        level, action = "pass", "kept"
        text = (
            f"No continuous predictor is non-linear (smallest {fmt_p(smallest['pValue'])}, for {smallest['label']})."
            if smallest
            else "There are no continuous predictors to check."
        )
    detail = (
        f"Each continuous predictor was tested with a Box-Tidwell term. The threshold is "
        f"{config.BOX_TIDWELL_ALPHA:g} divided by the {len(bt)} tests, which is {alpha:.4f}."
    )
    if borderline:
        detail += f" {len(borderline)} more fall between that and {config.BOX_TIDWELL_ALPHA:g}: {join_labels([r['label'] for r in borderline])}."
    if shifted:
        detail += f" {join_labels(shifted)} contains zeros, so 1 was added before taking logarithms."
    if flagged:
        detail += " With thousands of rows this test detects even small curvature, so section 04 shows whether it matters."
    remedies = []
    if flagged:
        remedies = [
            {"id": "keep-linear", "label": "Keep it linear and flag the caveat", "description": "The odds ratio is read as an average slope. This is the current model.", "applied": True},
            {"id": "spline", "label": "Model it with a spline", "description": "A flexible curve; compared with the linear fit under 'Does it matter?'.", "applied": False},
            {"id": "log", "label": "Log-transform it", "description": "Often fixes right-skewed measures, but changes what an odds ratio means.", "applied": False},
        ]
    checks.append(_check("linearity", "Linearity in the logit", level, text, action, detail, remedies))

    # 8. Influential observations (never deleted)
    cooks = cooks_distance(X, y, fit)
    order = np.argsort(cooks)[::-1]
    guideline = 4 / n
    count = int((cooks > guideline).sum())
    biggest = float(cooks.max())
    influence = {
        "threshold": guideline,
        "count": count,
        "maxCooksD": biggest,
        "flagged": [{"row": int(i) + 1, "cooksD": float(cooks[i])} for i in order[:5]],
    }
    if biggest > config.COOKS_LIMIT:
        level, text = "warn", f"One or more rows have a Cook's distance above {config.COOKS_LIMIT:g}."
    else:
        level, text = "pass", f"No row is highly influential (largest Cook's distance {biggest:.3f})."
    detail = (
        f"{count} of {n:,} rows exceed the common 4/n guideline ({guideline:.5f}), which is expected "
        f"in a large sample. The largest Cook's distance is {biggest:.3f}; values above "
        f"{config.COOKS_LIMIT:g} would be a concern. No row was removed."
    )
    checks.append(_check("influence", "Influential observations", level, text, "kept", detail))

    return finish(None, vif=vif, bt=bt, influence=influence, groups=groups, fit=fit)