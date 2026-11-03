"""What-if explorer ingredients: controls, defaults and the baseline risk."""

from __future__ import annotations

import numpy as np
import pandas as pd

from .logit import LogitFit
from .profile import Profile, level_label


def _step(observed: pd.Series) -> float:
    """The finest step the recorded values use: whole numbers, halves, or tenths.

    Read from the values before gaps were filled, since a fill value such as a mean
    (236.7) would otherwise make whole-number data look like it has decimals.
    """
    if bool((observed == observed.round()).all()):
        return 1.0
    if bool((observed * 2 == (observed * 2).round()).all()):
        return 0.5
    return 0.1


def _snap(value: float, step: float) -> float:
    return round(round(value / step) * step, 4)


def whatif_block(
    X: pd.DataFrame, terms: list[dict], fit: LogitFit, imputed: pd.DataFrame, raw: pd.DataFrame, profile: Profile
) -> dict:
    params = fit.params.to_dict()
    logit = float(params["const"])
    controls: list[dict] = []

    seen: list[str] = []
    for t in terms:
        if t["column"] not in seen:
            seen.append(t["column"])

    def binary_default(column: str) -> int:
        """The more common value, so the typical person has what most people have."""
        name = next(t["name"] for t in terms if t["column"] == column)
        return 1 if float(X[name].mean()) > 0.5 else 0

    for column in seen:
        group = [t for t in terms if t["column"] == column]
        info = profile.info(column)
        first = group[0]

        if first["kind"] == "continuous":
            observed = raw[column].dropna().astype(float)
            series = imputed[column].astype(float)
            step = _step(observed)
            low = round(float(np.floor(series.quantile(0.01) / step) * step), 4)
            high = round(float(np.ceil(series.quantile(0.99) / step) * step), 4)
            # The median is what a typical person has; the mean of a skewed column is not.
            default = float(np.clip(_snap(float(observed.median()), step), low, high))

            # An amount tied to an indicator (cigarettes and smoking) moves with it,
            # so the explorer can never build a non-smoker who smokes.
            linked = None
            indicator = profile.partner_indicator(column)
            if indicator is not None and indicator in seen:
                positive = observed[observed > 0]
                on_value = float(np.clip(_snap(float(positive.median()), step), low, high)) if not positive.empty else default
                linked = {"column": indicator, "offValue": 0.0, "onValue": on_value}
                default = on_value if binary_default(indicator) == 1 else 0.0

            logit += float(params[first["name"]]) * default
            controls.append(
                {
                    "column": column, "label": info.label, "kind": "slider", "unit": first["unit"],
                    "min": low, "max": high, "step": step, "default": default, "options": None, "linked": linked,
                }
            )
            continue

        if first["kind"] == "binary":
            levels = info.levels or ["0", "1"]
            options = [
                {"label": level_label(info, levels[0]), "term": None},
                {"label": level_label(info, levels[1]), "term": first["name"]},
            ]
            default = binary_default(column)
            kind = "toggle"
        else:
            reference = first["reference"] or "Reference"
            options = [{"label": reference, "term": None}] + [
                {"label": t["label"].split(": ", 1)[-1].split(" vs ")[0], "term": t["name"]} for t in group
            ]
            shares = [1 - sum(float(X[t["name"]].mean()) for t in group)] + [float(X[t["name"]].mean()) for t in group]
            default = int(np.argmax(shares))
            kind = "select"

        chosen = options[default]["term"]
        if chosen is not None:
            logit += float(params[chosen])
        controls.append(
            {
                "column": column, "label": info.label, "kind": kind, "unit": None,
                "min": None, "max": None, "step": None, "default": float(default), "options": options, "linked": None,
            }
        )

    risk = float(1 / (1 + np.exp(-logit)))
    return {
        "verdict": {
            "level": "info",
            "text": f"With every control at its typical value, the model estimates a {risk:.1%} chance of "
            f"{profile.positive_label}. Move the controls to see how the estimate changes.",
        },
        "baselineRisk": risk,
        "controls": controls,
        "note": "Uses the full-data model, not the hold-out model. It shows what the model estimates from "
        "patterns in this data, not what would happen if a person changed.",
    }
