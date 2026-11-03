"""Checks a result against the shape promised in apps/web/src/lib/report/types.ts.

Run on the JSON that was actually written, so what is checked is what the front end will read.
"""

from __future__ import annotations

import math

from . import config

LEVELS = {"pass", "warn", "refuse", "info"}

# Keys whose values are fractions or probabilities and must sit between 0 and 1.
FRACTION_KEYS = {
    "fraction", "prevalence", "rate", "observed", "predicted", "sensitivity", "specificity",
    "precision", "balancedAccuracy", "prBaseline", "testFraction", "baselineRisk", "chosen",
}

# Required keys of each block.
SHAPE: dict[str, object] = {
    "meta": ["schemaVersion", "engineVersion", "datasetName", "source", "rows", "columns", "events", "prevalence", "status", "refusal", "notes"],
    "dataGlance": ["verdict", "columns", "target", "flags"],
    "hygiene": ["verdict", "rowsWithMissing", "completeCases", "missingness", "imputations", "outlierPolicy", "decisionLog"],
    "eda": ["verdict", "continuous", "categorical", "histograms", "outcomeRates", "correlation"],
    "assumptions": ["verdict", "checks", "epv", "vif", "vifLimit", "boxTidwell", "boxTidwellThreshold", "influence", "groupTests"],
    "model": ["verdict", "description", "intercept", "terms", "coefficients", "fit", "counts", "exclusions"],
    "sensitivity": ["verdict", "linearity", "completeCase", "influence"],
    "performance": ["verdict", "split", "auc", "roc", "pr", "prBaseline", "calibration", "threshold", "atChosen", "thresholdTable"],
    "whatIf": ["verdict", "baselineRisk", "controls", "note"],
    "takeaways": ["verdict", "headline", "bullets", "nonSignificantNote", "caveats"],
}

NESTED: dict[tuple[str, str], list[str]] = {
    ("model", "fit"): ["n", "llrChi2", "llrDf", "llrPValue", "mcFaddenR2", "aic"],
    ("model", "counts"): ["significant", "notSignificant"],
    ("assumptions", "epv"): ["events", "terms", "value", "minimum", "refuseBelow"],
    ("assumptions", "influence"): ["threshold", "limit", "count", "maxCooksD", "flagged"],
    ("eda", "correlation"): ["columns", "labels", "matrix"],
    ("performance", "split"): ["trainRows", "testRows", "testEvents", "testFraction", "seed"],
    ("performance", "auc"): ["test", "cvMean", "cvLo", "cvHi", "folds"],
    ("performance", "calibration"): ["bins", "slope", "intercept", "hosmerLemeshow"],
    ("performance", "threshold"): ["chosen", "method", "tunedOn"],
    ("performance", "atChosen"): ["threshold", "sensitivity", "specificity", "precision", "balancedAccuracy", "counts"],
    ("dataGlance", "target"): ["name", "reason", "negativeLabel", "positiveLabel", "counts"],
    ("hygiene", "outlierPolicy"): ["method", "flagged", "action", "reason"],
}

ITEMS: dict[tuple[str, ...], list[str]] = {
    ("dataGlance", "columns"): ["name", "label", "type", "role", "roleReason", "roleSource", "missing", "distinct", "levels"],
    ("hygiene", "imputations"): ["column", "label", "method", "skewness", "fillValue", "reason", "before", "after"],
    ("hygiene", "decisionLog"): ["id", "step", "decision", "reason", "automatic", "alternative"],
    ("eda", "histograms"): ["column", "label", "edges", "negative", "positive"],
    ("assumptions", "checks"): ["id", "title", "verdict", "action", "detail", "remedies"],
    ("assumptions", "groupTests"): ["id", "label", "terms", "reason", "maxVif", "statistic", "df", "pValue", "significant", "interpretation"],
    ("model", "terms"): ["name", "column", "label", "kind", "reference", "unit", "perUnit", "perSd", "mean", "sd"],
    ("model", "coefficients"): ["term", "label", "beta", "se", "z", "pValue", "orRaw", "orRawLo", "orRawHi", "orStd", "orStdLo", "orStdHi", "significant", "interpretation"],
    ("sensitivity", "linearity"): ["column", "label", "boxTidwellP", "primaryAic", "alternativeAic", "deltaAic", "lrPValue", "maxOrChange", "matters", "verdict", "binned", "linearCurve", "splineCurve"],
    ("performance", "thresholdTable"): ["threshold", "sensitivity", "specificity", "precision", "balancedAccuracy", "counts"],
    ("whatIf", "controls"): ["column", "label", "kind", "unit", "min", "max", "step", "default", "options"],
}


def _walk(value, path: str, errors: list[str]) -> None:
    if isinstance(value, dict):
        for key, inner in value.items():
            where = f"{path}.{key}" if path else key
            if key in FRACTION_KEYS and isinstance(inner, (int, float)) and not isinstance(inner, bool):
                if not 0 <= inner <= 1:
                    errors.append(f"{where} = {inner} is outside 0 to 1")
            if key == "verdict" and isinstance(inner, dict) and inner.get("level") not in LEVELS:
                errors.append(f"{where}.level = {inner.get('level')!r} is not a valid level")
            _walk(inner, where, errors)
    elif isinstance(value, list):
        for i, inner in enumerate(value):
            _walk(inner, f"{path}[{i}]", errors)
    elif isinstance(value, float) and not math.isfinite(value):
        errors.append(f"{path} is not a finite number")


def _missing(obj, keys: list[str], where: str, errors: list[str]) -> None:
    if not isinstance(obj, dict):
        errors.append(f"{where} should be an object")
        return
    for key in keys:
        if key not in obj:
            errors.append(f"{where} is missing '{key}'")


def validate_result(result: dict) -> list[str]:
    errors: list[str] = []
    for block in ("meta", "dataGlance", "hygiene", "eda", "assumptions", "model", "sensitivity", "performance", "whatIf", "takeaways"):
        if block not in result:
            errors.append(f"missing block '{block}'")

    meta = result.get("meta", {})
    if meta.get("schemaVersion") != config.SCHEMA_VERSION:
        errors.append(f"meta.schemaVersion is {meta.get('schemaVersion')}, expected {config.SCHEMA_VERSION}")
    if meta.get("status") not in ("complete", "refused"):
        errors.append(f"meta.status = {meta.get('status')!r}")

    complete = meta.get("status") == "complete"
    for block, keys in SHAPE.items():
        value = result.get(block)
        if value is None:
            always = block in ("meta", "dataGlance", "hygiene", "eda", "assumptions", "takeaways")
            if always or complete:
                errors.append(f"block '{block}' is null")
            continue
        _missing(value, keys, block, errors)

    for (block, field), keys in NESTED.items():
        inner = (result.get(block) or {}).get(field)
        if result.get(block) is not None and inner is not None:
            _missing(inner, keys, f"{block}.{field}", errors)

    for (block, field), keys in ITEMS.items():
        items = (result.get(block) or {}).get(field) or []
        for i, item in enumerate(items[:3]):  # the first few are enough to catch a shape error
            _missing(item, keys, f"{block}.{field}[{i}]", errors)

    # One level deeper than ITEMS reaches.
    flagged = ((result.get("hygiene") or {}).get("outlierPolicy") or {}).get("flagged") or []
    for i, item in enumerate(flagged[:3]):
        _missing(item, ["column", "label", "count"], f"hygiene.outlierPolicy.flagged[{i}]", errors)
    eda = result.get("eda") or {}
    for field, value_key in (("categorical", "fraction"), ("outcomeRates", "rate")):
        for i, entry in enumerate((eda.get(field) or [])[:3]):
            for j, level in enumerate((entry.get("levels") or [])[:3]):
                _missing(level, ["level", "label", "n", value_key], f"eda.{field}[{i}].levels[{j}]", errors)

    deep = complete and all(result.get(b) is not None for b in ("model", "sensitivity", "performance", "whatIf"))
    if deep:
        n_terms = len(result["model"]["terms"])
        if len(result["model"]["coefficients"]) != n_terms:
            errors.append("model has a different number of terms and coefficients")
        if len(result["assumptions"]["vif"]) != n_terms:
            errors.append("assumptions.vif does not cover every term")
        size = len(result["eda"]["correlation"]["columns"])
        matrix = result["eda"]["correlation"]["matrix"]
        if len(matrix) != size or any(len(row) != size for row in matrix):
            errors.append("eda.correlation.matrix is not square")
        for h in result["eda"]["histograms"]:
            if len(h["edges"]) != len(h["negative"]) + 1 or len(h["negative"]) != len(h["positive"]):
                errors.append(f"eda.histograms '{h['column']}' has mismatched bin lengths")
    elif not complete:
        for block in ("model", "sensitivity", "performance", "whatIf"):
            if result.get(block) is not None:
                errors.append(f"block '{block}' must be null when the analysis was refused")

    _walk(result, "", errors)
    return errors