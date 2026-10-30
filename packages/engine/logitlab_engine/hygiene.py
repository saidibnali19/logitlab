"""Imputation, outlier screening and the decision log. Produces the hygiene block."""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd

from . import config
from .profile import Profile, level_text


@dataclass
class ColumnRule:
    column: str
    method: str  # "median" | "mean" | "mode"
    fill_value: float | str | int
    overall_value: float | str | int  # what a plain fill would have used
    skewness: float | None
    group_column: str | None = None  # indicator that decides between 0 and fill_value


class Imputer:
    """Learns fill values from one dataset and applies them to any dataset.

    Fitting on training rows only and then transforming the test rows is how the
    hold-out evaluation avoids leaking information from the test set.
    """

    def __init__(self, rules: list[ColumnRule]):
        self.rules = rules

    @classmethod
    def fit(cls, df: pd.DataFrame, profile: Profile) -> "Imputer":
        rules: list[ColumnRule] = []
        for col in profile.predictors():
            observed = df[col.name].dropna()
            if observed.empty:
                continue
            if col.type == "continuous":
                skew = float(observed.skew()) if len(observed) > 2 else None
                indicator = profile.partner_indicator(col.name)
                overall = float(observed.median() if (skew is not None and abs(skew) > config.SKEW_THRESHOLD) else observed.mean())
                if indicator is not None:
                    positive = observed[observed > 0]
                    fill = float(positive.median() if not positive.empty else observed.median())
                    rules.append(ColumnRule(col.name, "median", fill, float(observed.median()), skew, indicator))
                elif skew is not None and abs(skew) > config.SKEW_THRESHOLD:
                    rules.append(ColumnRule(col.name, "median", overall, overall, skew))
                else:
                    rules.append(ColumnRule(col.name, "mean", overall, overall, skew))
            else:
                mode = observed.mode().iloc[0]
                rules.append(ColumnRule(col.name, "mode", mode, mode, None))
        return cls(rules)

    def transform(self, df: pd.DataFrame) -> pd.DataFrame:
        out = df.copy()
        for rule in self.rules:
            series = out[rule.column]
            if rule.group_column is not None and rule.group_column in out.columns:
                known_non = series.isna() & (out[rule.group_column] == 0)
                series = series.mask(known_non, 0)
            out[rule.column] = series.fillna(rule.fill_value)
        return out


def _moments(series: pd.Series) -> dict:
    return {"mean": float(series.mean()), "median": float(series.median()), "sd": float(series.std())}


def _fill_text(rule: ColumnRule, profile: Profile, raw: pd.DataFrame) -> str:
    label = profile.info(rule.column).label
    n_missing = int(raw[rule.column].isna().sum())
    if rule.group_column is not None:
        indicator = profile.info(rule.group_column).label
        n_ind = int((raw.loc[raw[rule.column].isna(), rule.group_column] == 1).sum())
        share = f"All {n_missing}" if n_ind == n_missing else f"{n_ind} of the {n_missing}"
        return (
            f"'{indicator}' is known for every row. {share} missing values belong "
            f"to rows where it is 1, so the overall median ({rule.overall_value:g}) would have "
            f"contradicted what is already known. Rows where it is 0 get 0; the others get the "
            f"median among positive values ({rule.fill_value:g})."
        )
    if rule.method == "median":
        return (
            f"Skewness is {rule.skewness:.2f}, beyond ±{config.SKEW_THRESHOLD:g}, so a few extreme values "
            f"would drag the mean. The median ({rule.fill_value:g}) is the robust choice."
        )
    if rule.method == "mean":
        skew = f"{rule.skewness:.2f}" if rule.skewness is not None else "small"
        return f"Skewness is {skew}, close to symmetric, so the mean ({rule.fill_value:.2f}) is a fair fill value."
    return f"'{label}' is categorical, so the most common value ({level_text(rule.fill_value)}) is used."


def hygiene_block(raw: pd.DataFrame, profile: Profile, imputer: Imputer, imputed: pd.DataFrame, dropped_target_rows: int, duplicates: int) -> dict:
    rows = len(raw)
    predictors = [c.name for c in profile.predictors()]

    # Missingness
    missing = raw[predictors].isna().sum()
    missingness = [
        {"column": name, "label": profile.info(name).label, "count": int(count), "fraction": float(count) / rows}
        for name, count in missing.sort_values(ascending=False).items()
        if count > 0
    ]
    rows_with_missing = int(raw[predictors].isna().any(axis=1).sum())

    # Imputations (only for columns that actually had gaps)
    rule_by_column = {r.column: r for r in imputer.rules}
    imputations = []
    for item in missingness:
        rule = rule_by_column[item["column"]]
        is_numeric = rule.method != "mode"
        before = _moments(raw[item["column"]].dropna()) if is_numeric else None
        after = _moments(imputed[item["column"]]) if is_numeric else None
        imputations.append(
            {
                "column": item["column"],
                "label": item["label"],
                "method": rule.method,
                "skewness": rule.skewness,
                "fillValue": rule.fill_value if is_numeric else level_text(rule.fill_value),
                "reason": _fill_text(rule, profile, raw),
                "before": before,
                "after": after,
            }
        )

    # Outlier screening: flag, never delete.
    flagged = []
    for col in profile.predictors():
        if col.type != "continuous":
            continue
        values = raw[col.name].dropna()
        q1, q3 = values.quantile(0.25), values.quantile(0.75)
        spread = q3 - q1
        count = int(((values < q1 - config.IQR_FENCE * spread) | (values > q3 + config.IQR_FENCE * spread)).sum())
        if count:
            flagged.append({"column": col.name, "count": count})
    flagged.sort(key=lambda item: item["count"], reverse=True)

    outlier_policy = {
        "method": f"{config.IQR_FENCE:g} × IQR fences",
        "flagged": flagged,
        "action": "kept",
        "reason": (
            "Extreme values were kept. A value outside the fences is unusual, not necessarily wrong, "
            "and in clinical data the extremes are often the high-risk cases a model should learn from."
        ),
    }

    # Decision log
    log: list[dict] = []

    def add(step: str, decision: str, reason: str, alternative: str | None = None, automatic: bool = True):
        log.append(
            {
                "id": f"d{len(log) + 1:02d}",
                "step": step,
                "decision": decision,
                "reason": reason,
                "automatic": automatic,
                "alternative": alternative,
            }
        )

    add("ingest", f"Read {rows + dropped_target_rows:,} rows and {len(raw.columns)} columns.", "Every row is used unless the outcome is missing.")
    if dropped_target_rows:
        add("ingest", f"Removed {dropped_target_rows} rows with a missing outcome.", "A row without an outcome cannot teach the model anything.")
    if duplicates:
        add("ingest", f"Found {duplicates} exact duplicate rows and kept them.", "Identical rows can be genuine, so none are removed without your say-so.", "Remove the duplicate rows")
    else:
        add("ingest", "No exact duplicate rows were found.", "Nothing needed removing.")

    add("roles", f"Chose '{profile.target}' as the outcome.", profile.target_reason, "Choose a different outcome column")
    for col in profile.columns:
        if col.role == "excluded":
            add("roles", f"Set aside '{col.name}'.", col.role_reason)

    for item in imputations:
        count = next(m["count"] for m in missingness if m["column"] == item["column"])
        noun = "value" if count == 1 else "values"
        add("imputation", f"Filled {count} missing {noun} in '{item['column']}' with the {item['method']}.", item["reason"], "Use a different fill method")
    add(
        "imputation",
        "For the hold-out evaluation, fill values are re-learned from the training rows only.",
        "Learning them from all rows would let information from the test rows leak into the evaluation.",
    )

    if flagged:
        names = ", ".join(f"{item['column']} ({item['count']})" for item in flagged)
        add("outliers", f"Flagged unusual values but kept them: {names}.", outlier_policy["reason"], "Cap values at the fences")
    else:
        add("outliers", "No unusual values were flagged.", f"No value fell outside the {config.IQR_FENCE:g} × IQR fences.")

    for col in profile.predictors():
        if col.type == "categorical" and col.levels:
            add(
                "encoding",
                f"Coded '{col.name}' as {len(col.levels) - 1} indicator columns against level '{col.levels[0]}'.",
                "A categorical predictor needs one indicator per level except a reference level.",
                "Choose a different reference level",
            )

    # Verdict
    worst = max((m["fraction"] for m in missingness), default=0.0)
    if missingness:
        top = missingness[0]
        level = "warn" if worst >= config.HIGH_MISSING_FRACTION else "pass"
        text = (
            f"{rows_with_missing:,} of {rows:,} rows ({rows_with_missing / rows:.1%}) had at least one gap, "
            f"across {len(missingness)} columns. '{top['label']}' had the most ({top['fraction']:.1%}). "
            "Every gap was filled by a rule chosen from the column's own distribution"
            + ("; section 04 checks whether the filling changes the results." if level == "warn" else ".")
        )
    else:
        level, text = "pass", "No missing values were found, so nothing needed filling."

    return {
        "verdict": {"level": level, "text": text},
        "rowsWithMissing": rows_with_missing,
        "completeCases": rows - rows_with_missing,
        "missingness": missingness,
        "imputations": imputations,
        "outlierPolicy": outlier_policy,
        "decisionLog": log,
    }