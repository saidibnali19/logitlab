"""The full-data model block: coefficients, odds ratios and plain-English readings."""

from __future__ import annotations

import numpy as np
from scipy.stats import chi2

from . import config
from .fmt import fmt_p
from .logit import LogitFit


def odds_ratios(fit: LogitFit, terms: list[dict]) -> dict[str, dict]:
    """Per-unit and per-SD odds ratios with 95% intervals, keyed by term name."""
    z = config.CONFIDENCE_Z
    params, ses, pvalues = fit.params.to_dict(), fit.se.to_dict(), fit.pvalues.to_dict()
    out = {}
    for t in terms:
        beta, se = float(params[t["name"]]), float(ses[t["name"]])
        scale = t["sd"] if t["kind"] == "continuous" and t["sd"] else 1.0
        out[t["name"]] = {
            "beta": beta,
            "se": se,
            "p": float(pvalues[t["name"]]),
            "raw": (float(np.exp(beta)), float(np.exp(beta - z * se)), float(np.exp(beta + z * se))),
            "std": (float(np.exp(beta * scale)), float(np.exp((beta - z * se) * scale)), float(np.exp((beta + z * se) * scale))),
        }
    return out


def _percent(odds_ratio: float) -> str:
    change = (odds_ratio - 1) * 100
    if abs(change) >= 100:
        return f"{odds_ratio:.2f} times the odds"
    return f"{abs(change):.0f}% {'higher' if change > 0 else 'lower'} odds"


def _ci(lo: float, hi: float) -> str:
    return f"{lo:.2f} to {hi:.2f}"


def _reading(term: dict, o: dict, significant: bool, outcome: str) -> str:
    raw, std = o["raw"], o["std"]
    stats = f"OR {raw[0]:.2f}, 95% CI {_ci(raw[1], raw[2])}, {fmt_p(o['p'])}"
    if term["kind"] == "continuous":
        unit = f" {term['unit']}" if term["unit"] else ""
        singular = config.UNIT_SINGULAR.get(term["unit"], term["unit"])
        subject = f"each extra {singular}" if term["unit"] else "each one-unit increase"
        sd_text = f"1 SD ({term['sd']:.1f}{unit})"
        if significant:
            return (
                f"With the other predictors held fixed, {subject} of {term['label']} goes with "
                f"{_percent(raw[0])} of {outcome} ({stats}). Per {sd_text}: OR {std[0]:.2f} "
                f"(95% CI {_ci(std[1], std[2])})."
            )
        return (
            f"There is no clear evidence that {term['label']} is associated with {outcome} once the "
            f"other predictors are accounted for ({stats}). The data fit both a small increase and a "
            "small decrease, so this does not prove it has no effect."
        )
    what = term["label"]
    if significant:
        return (
            f"With the other predictors held fixed, {what} goes with {_percent(raw[0])} of {outcome} "
            f"({stats})."
        )
    return (
        f"There is no clear evidence that {what} is associated with {outcome} once the other predictors "
        f"are accounted for ({stats}). The data fit both a small increase and a small decrease, so "
        "this does not prove it has no effect."
    )


def model_block(fit: LogitFit, terms: list[dict], y, outcome_label: str) -> dict:
    n = len(y)
    events = float(y.sum())
    p0 = events / n
    llnull = events * np.log(p0) + (n - events) * np.log(1 - p0)
    llr = max(2 * (fit.llf - llnull), 0.0)
    df = len(terms)

    odds = odds_ratios(fit, terms)
    coefficients = []
    for t in terms:
        o = odds[t["name"]]
        significant = not (o["raw"][1] <= 1 <= o["raw"][2])
        coefficients.append(
            {
                "term": t["name"],
                "label": t["label"],
                "beta": o["beta"],
                "se": o["se"],
                "z": o["beta"] / o["se"],
                "pValue": o["p"],
                "orRaw": o["raw"][0],
                "orRawLo": o["raw"][1],
                "orRawHi": o["raw"][2],
                "orStd": o["std"][0],
                "orStdLo": o["std"][1],
                "orStdHi": o["std"][2],
                "significant": significant,
                "interpretation": _reading(t, o, significant, outcome_label),
            }
        )

    n_sig = sum(c["significant"] for c in coefficients)
    n_not = len(coefficients) - n_sig
    verdict = {
        "level": "info",
        "text": f"{n_sig} of {len(coefficients)} terms show clear evidence of an association with the outcome; "
        f"{n_not} do not. A term with no clear evidence stays in the model.",
    }
    return {
        "verdict": verdict,
        "description": f"Unweighted logistic regression on all {n:,} rows",
        "intercept": float(fit.params.to_dict()["const"]),
        "terms": terms,
        "coefficients": coefficients,
        "fit": {
            "n": n,
            "llrChi2": float(llr),
            "llrDf": df,
            "llrPValue": float(chi2.sf(llr, df)),
            "mcFaddenR2": float(1 - fit.llf / llnull),
            "aic": fit.aic,
        },
        "counts": {"significant": n_sig, "notSignificant": n_not},
        "exclusions": [],
    }