"""Column typing, roles and flags. Produces the dataGlance block."""

from __future__ import annotations

import re
from dataclasses import dataclass, field

import numpy as np
import pandas as pd

from . import config


def pretty(name: str) -> str:
    if name in config.LABELS:
        return config.LABELS[name]
    spaced = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", " ", name.replace("_", " "))
    return spaced.capitalize()


def level_text(value) -> str:
    if isinstance(value, (float, np.floating)) and float(value).is_integer():
        return str(int(value))
    return str(value)


def _integer_like(series: pd.Series) -> bool:
    values = series.dropna()
    if values.empty or not pd.api.types.is_numeric_dtype(values):
        return False
    return bool(np.allclose(values, np.round(values)))


def detect_type(series: pd.Series, name: str) -> str:
    values = series.dropna()
    distinct = values.nunique()
    if distinct <= 1:
        return "constant"
    if pd.api.types.is_bool_dtype(series):
        return "binary"
    numeric = pd.api.types.is_numeric_dtype(series)
    if distinct == len(values):
        looks_like_id = bool(re.search(r"(^|_)id$|^id($|_)|index", name, re.I))
        if looks_like_id or not numeric or (_integer_like(series) and values.is_monotonic_increasing):
            return "id"
    if distinct == 2:
        return "binary"
    if not numeric:
        return "categorical" if distinct <= config.TEXT_MAX_LEVELS else "text"
    if _integer_like(series) and distinct <= config.CATEGORICAL_MAX_LEVELS:
        return "categorical"
    return "continuous"


def choose_target(df: pd.DataFrame, requested: str | None) -> tuple[str, str]:
    binary = [c for c in df.columns if df[c].dropna().nunique() == 2]
    if requested is not None:
        if requested not in df.columns:
            raise ValueError(f"The column '{requested}' does not exist in this file.")
        if requested not in binary:
            raise ValueError(
                f"'{requested}' has {df[requested].dropna().nunique()} distinct values. "
                "Binary logistic regression needs an outcome with exactly two."
            )
        return requested, "You chose this column."

    hinted = [c for c in binary if any(h in c.lower() for h in config.TARGET_HINTS)]
    if hinted:
        pick = hinted[-1]
        reason = "Exactly two distinct values, and the name suggests an outcome"
        reason += " (it is also the last column)." if pick == df.columns[-1] else "."
        return pick, reason
    if df.columns[-1] in binary:
        return df.columns[-1], "The last column has exactly two values, where outcomes usually sit."
    raise ValueError(
        "No column with exactly two distinct values was found, so there is no binary "
        "outcome to model. Binary logistic regression needs a yes/no style target."
    )


def encode_target(series: pd.Series, name: str) -> tuple[pd.Series, str, str]:
    values = sorted(series.dropna().unique(), key=lambda v: (str(type(v)), v))
    mapping = {values[0]: 0, values[1]: 1}
    if name in config.TARGET_LABELS:
        negative, positive = config.TARGET_LABELS[name]
    else:
        negative, positive = level_text(values[0]), level_text(values[1])
    return series.map(mapping), negative, positive


def auc_vs_target(x: pd.Series, y: pd.Series) -> float | None:
    mask = x.notna() & y.notna()
    x, y = x[mask], y[mask]
    n1, n0 = int((y == 1).sum()), int((y == 0).sum())
    if n1 == 0 or n0 == 0:
        return None
    ranks = x.rank()
    return float((ranks[y == 1].sum() - n1 * (n1 + 1) / 2) / (n1 * n0))


@dataclass
class ColumnInfo:
    name: str
    label: str
    type: str
    role: str
    role_reason: str
    role_source: str
    missing: int
    distinct: int
    levels: list[str] | None
    reference: object | None = None  # raw reference level for categorical columns


@dataclass
class Profile:
    columns: list[ColumnInfo]
    target: str
    target_reason: str
    negative_label: str
    positive_label: str
    counts: dict
    flags: list[dict] = field(default_factory=list)
    # (indicator column, amount column) where indicator == (amount > 0)
    structural_pairs: list[tuple[str, str]] = field(default_factory=list)

    def predictors(self) -> list[ColumnInfo]:
        return [c for c in self.columns if c.role == "predictor"]

    def info(self, name: str) -> ColumnInfo:
        return next(c for c in self.columns if c.name == name)

    def partner_indicator(self, amount_column: str) -> str | None:
        for indicator, amount in self.structural_pairs:
            if amount == amount_column:
                return indicator
        return None


def _levels_and_reference(series: pd.Series, kind: str) -> tuple[list[str], object]:
    values = series.dropna()
    if kind == "categorical":
        numeric = pd.api.types.is_numeric_dtype(values)
        ordered = sorted(values.unique()) if numeric else list(values.value_counts().index)
        reference = ordered[0]
    else:
        ordered = sorted(values.unique(), key=lambda v: (str(type(v)), v))
        reference = ordered[0]
    return [level_text(v) for v in ordered], reference


def build_profile(df: pd.DataFrame, y: pd.Series, target: str, target_reason: str, negative: str, positive: str) -> Profile:
    columns: list[ColumnInfo] = []
    for name in df.columns:
        series = df[name]
        distinct = int(series.dropna().nunique())
        missing = int(series.isna().sum())
        label = pretty(name)

        if name == target:
            columns.append(
                ColumnInfo(name, label, "binary", "target", target_reason, "auto", missing, distinct, [negative, positive])
            )
            continue

        kind = detect_type(series, name)
        if kind in ("id", "constant", "text"):
            reasons = {
                "id": "Every row has a different value, so it identifies rows and carries no pattern to learn.",
                "constant": "Every row has the same value, so it cannot explain differences in the outcome.",
                "text": "Free text with many distinct values; it cannot enter a regression as it is.",
            }
            columns.append(
                ColumnInfo(name, label, kind, "excluded", reasons[kind], "auto", missing, distinct, None)
            )
            continue

        levels, reference = (None, None)
        if kind in ("binary", "categorical"):
            levels, reference = _levels_and_reference(series, kind)
        reasons = {
            "continuous": "A continuous measurement, used as a numeric predictor.",
            "binary": "A two-value indicator, coded 0 and 1.",
            "categorical": (
                f"Categorical with {distinct} levels; coded as {max(distinct - 1, 0)} indicator "
                f"columns against the reference level '{levels[0] if levels else ''}'."
            ),
        }
        columns.append(
            ColumnInfo(name, label, kind, "predictor", reasons[kind], "auto", missing, distinct, levels, reference)
        )

    profile = Profile(
        columns=columns,
        target=target,
        target_reason=target_reason,
        negative_label=negative,
        positive_label=positive,
        counts={"negative": int((y == 0).sum()), "positive": int((y == 1).sum())},
    )
    _add_flags(profile, df, y)
    return profile


def _add_flags(profile: Profile, df: pd.DataFrame, y: pd.Series) -> None:
    flags = profile.flags
    predictors = profile.predictors()
    numeric = [c for c in predictors if c.type in ("continuous", "binary") and pd.api.types.is_numeric_dtype(df[c.name])]

    # Possible leakage: one predictor separates the outcome almost perfectly.
    for col in numeric:
        auc = auc_vs_target(df[col.name], y)
        if auc is not None and (auc >= config.LEAKAGE_AUC or auc <= 1 - config.LEAKAGE_AUC):
            flags.append(
                {
                    "column": col.name,
                    "related": [],
                    "kind": "leakage",
                    "level": "warn",
                    "message": f"'{col.label}' separates the outcome almost perfectly on its own "
                    f"(single-variable AUC {max(auc, 1 - auc):.2f}). That usually means it is "
                    "recorded after, or derived from, the outcome.",
                }
            )

    # Structural redundancy: a 0/1 indicator that equals (amount > 0).
    taken: set[frozenset[str]] = set()
    indicators = [c for c in numeric if c.type == "binary" and set(df[c.name].dropna().unique()) <= {0, 1}]
    amounts = [c for c in numeric if c.type == "continuous"]
    for ind in indicators:
        for amt in amounts:
            both = df[[ind.name, amt.name]].dropna()
            if both.empty or (both[amt.name] > 0).all() or (both[amt.name] == 0).all():
                continue
            agreement = float(((both[ind.name] == 1) == (both[amt.name] > 0)).mean())
            if agreement >= config.STRUCTURAL_AGREEMENT:
                profile.structural_pairs.append((ind.name, amt.name))
                taken.add(frozenset((ind.name, amt.name)))
                flags.append(
                    {
                        "column": ind.name,
                        "related": [amt.name],
                        "kind": "redundant",
                        "level": "warn",
                        "message": f"'{ind.label}' matches '{amt.label} above zero' in "
                        f"{agreement:.1%} of rows where both are known, so the two carry almost "
                        "the same information. Both are kept and tested jointly, because their "
                        "separate odds ratios will be imprecise.",
                    }
                )

    # Near-duplicate predictors.
    if len(numeric) > 1:
        corr = df[[c.name for c in numeric]].corr()
        names = list(corr.columns)
        for i, a in enumerate(names):
            for b in names[i + 1 :]:
                if frozenset((a, b)) in taken:
                    continue
                r = corr.loc[a, b]
                if pd.notna(r) and abs(r) >= config.HIGH_CORRELATION:
                    flags.append(
                        {
                            "column": a,
                            "related": [b],
                            "kind": "redundant",
                            "level": "warn",
                            "message": f"'{profile.info(a).label}' and '{profile.info(b).label}' are "
                            f"almost duplicates (correlation {r:.2f}). Both are kept and tested jointly.",
                        }
                    )

    # Rare binary predictors: the estimate will be imprecise.
    for col in predictors:
        if col.type != "binary":
            continue
        counts = df[col.name].value_counts()
        if len(counts) != 2:
            continue
        minority_level, minority = counts.index[-1], int(counts.iloc[-1])
        fraction = minority / int(counts.sum())
        if fraction < config.RARE_FRACTION:
            flags.append(
                {
                    "column": col.name,
                    "related": [],
                    "kind": "rare",
                    "level": "warn",
                    "message": f"Only {minority} rows ({fraction:.1%}) have '{col.label}' = "
                    f"{level_text(minority_level)}. The estimate for it will be imprecise, "
                    "so expect a wide confidence interval.",
                }
            )


def glance_block(profile: Profile, rows: int) -> dict:
    predictors = profile.predictors()
    excluded = [c for c in profile.columns if c.role == "excluded"]
    positive_fraction = profile.counts["positive"] / rows
    warn = any(f["level"] == "warn" for f in profile.flags)

    text = (
        f"Target: {profile.target} ({positive_fraction:.1%} positive). "
        f"{len(predictors)} usable predictors"
    )
    if excluded:
        text += f", {len(excluded)} column(s) set aside"
    text += f"; {len(profile.flags)} flag(s) worth reading." if profile.flags else "; nothing unusual flagged."

    return {
        "verdict": {"level": "warn" if warn else "pass", "text": text},
        "columns": [
            {
                "name": c.name,
                "label": c.label,
                "type": c.type,
                "role": c.role,
                "roleReason": c.role_reason,
                "roleSource": c.role_source,
                "missing": c.missing,
                "distinct": c.distinct,
                "levels": c.levels,
            }
            for c in profile.columns
        ],
        "target": {
            "name": profile.target,
            "reason": profile.target_reason,
            "negativeLabel": profile.negative_label,
            "positiveLabel": profile.positive_label,
            "counts": profile.counts,
        },
        "flags": profile.flags,
    }