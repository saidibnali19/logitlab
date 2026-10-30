"""The analysis entry point. Grows block by block; later steps add more blocks."""

from __future__ import annotations

from dataclasses import dataclass

import pandas as pd

from . import config
from .hygiene import Imputer, hygiene_block
from .profile import Profile, build_profile, choose_target, encode_target, glance_block


@dataclass
class Prepared:
    """Everything later steps need, so nothing is recomputed."""

    data: pd.DataFrame  # target-complete rows, target recoded to 0/1
    profile: Profile
    imputer: Imputer  # fitted on all rows (used for the inference model)
    imputed: pd.DataFrame  # data with gaps filled


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

    result = {
        "meta": meta,
        "dataGlance": glance_block(profile, rows),
        "hygiene": hygiene_block(prepared.data, profile, prepared.imputer, prepared.imputed, dropped, duplicates),
    }
    return result, prepared