"""The analysis entry point. Grows block by block; later steps add more blocks."""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from . import config
from .assumptions import build_assumptions
from .design import build_design
from .eda import eda_block
from .hygiene import Imputer, hygiene_block
from .logit import LogitFit
from .model import model_block
from .performance import performance_block
from .profile import Profile, build_profile, choose_target, encode_target, glance_block
from .sensitivity import sensitivity_block
from .takeaways import refused_takeaways, takeaways_block
from .whatif import whatif_block


@dataclass
class Prepared:
    """Everything later steps need, so nothing is recomputed."""

    data: pd.DataFrame  # target-complete rows, target recoded to 0/1
    profile: Profile
    imputer: Imputer  # fitted on all rows (used for the inference model)
    imputed: pd.DataFrame  # data with gaps filled
    design: pd.DataFrame | None = None  # design matrix with a constant first
    terms: list[dict] | None = None  # the contract's Term list
    y: pd.Series | None = None
    fit: LogitFit | None = None  # the full-data logistic fit


def prepare(df: pd.DataFrame, target: str | None = None) -> tuple[Prepared, int, int]:
    duplicates = int(df.duplicated().sum())
    name, reason = choose_target(df, target)

    data = df.copy()
    dropped = int(data[name].isna().sum())
    data = data[data[name].notna()].reset_index(drop=True)

    y, negative, positive = encode_target(data[name], name)
    data[name] = y.astype(int)

    profile = build_profile(data, data[name], name, reason, negative, positive)
    imputer = Imputer.fit(data, profile)
    imputed = imputer.transform(data)
    return Prepared(data, profile, imputer, imputed), dropped, duplicates


def run_analysis(df: pd.DataFrame, dataset_name: str, source: str = "sample", target: str | None = None) -> tuple[dict, Prepared]:
    prepared, dropped, duplicates = prepare(df, target)
    profile, data = prepared.profile, prepared.data
    rows = len(data)

    meta = {
        "schemaVersion": config.SCHEMA_VERSION,
        "engineVersion": config.ENGINE_VERSION,
        "datasetName": dataset_name,
        "source": source,
        "rows": rows,
        "columns": int(data.shape[1]),
        "events": profile.counts["positive"],
        "prevalence": profile.counts["positive"] / rows,
        "status": "complete",
        "refusal": None,
        "notes": config.sample_notes(rows) if source == "sample" else [],
    }

    prepared.design, prepared.terms = build_design(prepared.imputed, profile)
    prepared.y = prepared.data[profile.target]

    assumptions, refusal, fit = build_assumptions(prepared.design, prepared.y, prepared.terms, prepared.imputed, profile)
    prepared.fit = fit
    if refusal is not None:
        meta["status"] = "refused"
        meta["refusal"] = refusal

    result = {
        "meta": meta,
        "dataGlance": glance_block(profile, rows),
        "hygiene": hygiene_block(prepared.data, profile, prepared.imputer, prepared.imputed, dropped, duplicates),
        "eda": eda_block(prepared.imputed, profile),
        "assumptions": assumptions,
    }

    if refusal is None and fit is not None:
        outcome = profile.positive_label
        result["model"] = model_block(fit, prepared.terms, prepared.y, outcome)
        result["sensitivity"] = sensitivity_block(
            prepared.design, prepared.y, prepared.terms, fit, prepared.imputed, prepared.data, profile, assumptions
        )
        result["performance"] = performance_block(prepared.data, profile)
        result["whatIf"] = whatif_block(prepared.design, prepared.terms, fit, prepared.imputed, prepared.data, profile)
        result["takeaways"] = takeaways_block(result)
    else:
        result["model"] = result["sensitivity"] = result["performance"] = result["whatIf"] = None
        result["takeaways"] = refused_takeaways(refusal or {"title": "No model", "message": "A model could not be fitted."})
    return result, prepared