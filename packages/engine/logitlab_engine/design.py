"""Builds the model's design matrix and the list of terms shared by every later step."""

from __future__ import annotations

import pandas as pd

from . import config
from .profile import Profile, level_text


def build_design(imputed: pd.DataFrame, profile: Profile) -> tuple[pd.DataFrame, list[dict]]:
    """Returns the design matrix (with a constant first) and the contract's `Term` list."""
    columns: dict[str, pd.Series] = {"const": pd.Series(1.0, index=imputed.index)}
    terms: list[dict] = []

    for col in profile.predictors():
        series = imputed[col.name]
        unit = config.UNITS.get(col.name)

        if col.type == "continuous":
            values = series.astype(float)
            columns[col.name] = values
            terms.append(
                {
                    "name": col.name,
                    "column": col.name,
                    "label": col.label,
                    "kind": "continuous",
                    "reference": None,
                    "unit": unit,
                    "mean": float(values.mean()),
                    "sd": float(values.std()),
                }
            )

        elif col.type == "binary":
            if set(series.unique()) <= {0, 1}:
                coded = series.astype(float)
            else:
                coded = (series.map(level_text) == (col.levels or [])[1]).astype(float)
            columns[col.name] = coded
            terms.append(
                {
                    "name": col.name,
                    "column": col.name,
                    "label": col.label,
                    "kind": "binary",
                    "reference": None,
                    "unit": None,
                    "mean": None,
                    "sd": None,
                }
            )

        else:  # categorical: one indicator per level except the reference
            levels = col.levels or []
            reference = levels[0]
            text = series.map(level_text)
            for level in levels[1:]:
                name = f"{col.name}[{level}]"
                columns[name] = (text == level).astype(float)
                terms.append(
                    {
                        "name": name,
                        "column": col.name,
                        "label": f"{col.label}: {level} vs {reference}",
                        "kind": "level",
                        "reference": reference,
                        "unit": None,
                        "mean": None,
                        "sd": None,
                    }
                )

    return pd.DataFrame(columns), terms