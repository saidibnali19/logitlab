"""What-if explorer ingredients: controls, defaults and the baseline risk."""

from __future__ import annotations

import numpy as np
import pandas as pd

from .logit import LogitFit
from .profile import Profile


def _step(series: pd.Series) -> float:
    return 1.0 if bool((series == series.round()).all()) else 0.1


def whatif_block(X: pd.DataFrame, terms: list[dict], fit: LogitFit, imputed: pd.DataFrame, profile: Profile) -> dict:
    params = fit.params.to_dict()
    logit = float(params["const"])
    controls: list[dict] = []

    seen: list[str] = []
    for t in terms:
        if t["column"] not in seen:
            seen.append(t["column"])

    for column in seen:
        group = [t for t in terms if t["column"] == column]
        info = profile.info(column)
        first = group[0]

        if first["kind"] == "continuous":
            series = imputed[column].astype(float)
            step = _step(series)
            low = round(float(np.floor(series.quantile(0.01) / step) * step), 4)
            high = round(float(np.ceil(series.quantile(0.99) / step) * step), 4)
            default = round(float(np.clip(round(float(series.mean()) / step) * step, low, high)), 4)
            logit += float(params[first["name"]]) * default
            controls.append(
                {
                    "column": column, "label": info.label, "kind": "slider", "unit": first["unit"],
                    "min": low, "max": high, "step": step, "default": default, "options": None,
                }
            )
            continue

        if first["kind"] == "binary":
            labels = info.levels or ["No", "Yes"]
            options = [{"label": labels[0], "term": None}, {"label": labels[1], "term": first["name"]}]
            default = 1 if float(X[first["name"]].mean()) > 0.5 else 0
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
                "min": None, "max": None, "step": None, "default": float(default), "options": options,
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