"""A small summary of a finished result, for the landing page's preview strip.

Generated from the result so the hero can never disagree with the report.
"""

from __future__ import annotations

import math

from . import config


def _card_level(level: str) -> str:
    return "warn" if level in ("warn", "refuse") else "pass"


def preview_block(result: dict) -> dict:
    meta, model, perf = result["meta"], result["model"], result["performance"]
    assumptions, sens = result["assumptions"], result["sensitivity"]
    checks_by_id = {c["id"]: c for c in assumptions["checks"]}

    # The six strongest terms with clear evidence, by distance of the odds ratio from 1.
    clear = [c for c in model["coefficients"] if c["significant"]]
    clear.sort(key=lambda c: abs(math.log(c["orStd"])), reverse=True)
    forest = [
        {"label": c["label"], "or": round(c["orStd"], 3), "lo": round(c["orStdLo"], 3), "hi": round(c["orStdHi"], 3)}
        for c in clear[:6]
    ]

    at = perf["atChosen"]
    roc = {
        "auc": round(perf["auc"]["test"], 3),
        "label": perf["verdict"]["text"].split(" ")[0],
        "curve": [{"fpr": p["x"], "tpr": p["y"]} for p in perf["roc"]],
        "point": {
            "fpr": round(1 - at["specificity"], 3),
            "tpr": round(at["sensitivity"], 3),
            "threshold": perf["threshold"]["chosen"],
        },
    }

    epv = assumptions["epv"]
    worst_vif = max(assumptions["vif"], key=lambda row: row["value"])
    cc = sens["completeCase"]
    if cc and cc["verdict"]["level"] == "warn":
        changed = sum(1 for row in cc["rows"] if not row["sameSignificance"])
        detail = (
            f"Dropping rows with gaps changes {changed} conclusion{'s' if changed != 1 else ''}."
            if changed
            else cc["verdict"]["text"]
        )
        gaps = {"title": "Missing-data sensitivity", "verdict": "warn", "detail": detail}
    else:
        gaps = {"title": "Missing-data sensitivity", "verdict": "pass", "detail": "Conclusions hold when rows with gaps are dropped."}

    checks = [
        {
            "title": "Sample size",
            "verdict": "pass" if epv["value"] >= epv["minimum"] else "warn",
            "detail": f"{epv['events']} events, {epv['value']:.1f} per model term ({epv['minimum']} needed).",
        },
        {
            "title": "Multicollinearity",
            "verdict": _card_level(checks_by_id["multicollinearity"]["verdict"]["level"]),
            "detail": f"Highest VIF is {worst_vif['value']:.2f} (limit {config.VIF_LIMIT:g}).",
        },
        {
            "title": "Linearity (Box-Tidwell)",
            "verdict": _card_level(checks_by_id["linearity"]["verdict"]["level"]),
            "detail": checks_by_id["linearity"]["verdict"]["text"],
        },
        gaps,
    ]

    return {
        "label": f"Preview · {meta['datasetName']}, n = {meta['rows']:,}",
        "forest": forest,
        "roc": roc,
        "checks": checks,
    }