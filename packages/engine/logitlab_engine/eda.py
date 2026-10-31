"""Summaries, histograms by outcome and correlations. Produces the eda block."""

from __future__ import annotations

import numpy as np
import pandas as pd

from . import config
from .profile import Profile, level_text


def eda_block(imputed: pd.DataFrame, profile: Profile) -> dict:
    y = imputed[profile.target]
    predictors = profile.predictors()
    continuous = [c for c in predictors if c.type == "continuous"]
    discrete = [c for c in predictors if c.type in ("binary", "categorical")]

    continuous_summary = []
    for col in continuous:
        s = imputed[col.name]
        continuous_summary.append(
            {
                "column": col.name,
                "label": col.label,
                "mean": float(s.mean()),
                "median": float(s.median()),
                "sd": float(s.std()),
                "min": float(s.min()),
                "max": float(s.max()),
                "skewness": float(np.asarray(s.skew())),
            }
        )

    # The outcome comes first so the balance is the first thing on the page.
    categorical_summary = [
        {
            "column": profile.target,
            "label": profile.info(profile.target).label,
            "levels": [
                {"level": profile.negative_label, "n": profile.counts["negative"], "fraction": profile.counts["negative"] / len(y)},
                {"level": profile.positive_label, "n": profile.counts["positive"], "fraction": profile.counts["positive"] / len(y)},
            ],
        }
    ]
    outcome_rates = []
    for col in discrete:
        text = imputed[col.name].map(level_text)
        counts = text.value_counts()
        order = col.levels or list(counts.index)
        categorical_summary.append(
            {
                "column": col.name,
                "label": col.label,
                "levels": [
                    {"level": level, "n": int(counts.get(level, 0)), "fraction": float(counts.get(level, 0)) / len(text)}
                    for level in order
                ],
            }
        )
        rates = y.groupby(text).mean()
        outcome_rates.append(
            {
                "column": col.name,
                "label": col.label,
                "levels": [
                    {"level": level, "n": int(counts.get(level, 0)), "rate": float(rates.get(level, np.nan))}
                    for level in order
                ],
            }
        )

    # Histograms share one set of bin edges so the two outcome groups are comparable.
    histograms = []
    for col in continuous:
        s = imputed[col.name]
        edges = np.histogram_bin_edges(s, bins=config.HISTOGRAM_BINS)
        neg, _ = np.histogram(s[y == 0], bins=edges)
        pos, _ = np.histogram(s[y == 1], bins=edges)
        histograms.append(
            {
                "column": col.name,
                "label": col.label,
                "edges": [round(float(e), 4) for e in edges],
                "negative": [round(float(v), 5) for v in neg / max(neg.sum(), 1)],
                "positive": [round(float(v), 5) for v in pos / max(pos.sum(), 1)],
            }
        )

    # Correlations between predictors (categorical levels use their numeric codes).
    numeric = imputed[[c.name for c in predictors if pd.api.types.is_numeric_dtype(imputed[c.name])]]
    corr = numeric.corr()
    corr_values = corr.to_numpy()
    labels = [profile.info(name).label for name in corr.columns]

    strongest = None
    names = list(corr.columns)
    for i, a in enumerate(names):
        for j in range(i + 1, len(names)):
            b = names[j]
            r = float(corr_values[i, j])
            if strongest is None or abs(r) > abs(strongest[2]):
                strongest = (a, b, r)

    text = f"{len(continuous)} continuous and {len(discrete)} categorical predictors summarised."
    if strongest:
        text += (
            f" The strongest overlap is between '{profile.info(strongest[0]).label}' and "
            f"'{profile.info(strongest[1]).label}' (r = {strongest[2]:.2f})."
        )

    return {
        "verdict": {"level": "info", "text": text},
        "continuous": continuous_summary,
        "categorical": categorical_summary,
        "histograms": histograms,
        "outcomeRates": outcome_rates,
        "correlation": {
            "columns": list(corr.columns),
            "labels": labels,
            "matrix": [[round(float(v), 4) for v in row] for row in corr.values],
        },
    }