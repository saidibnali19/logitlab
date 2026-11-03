"""Writes a standalone Python script that reproduces the full-data model exactly.

The script repeats what the engine did, step by step, with the values it chose
written in: the same rows, the same gap filling, the same encoding and the same
fit. The fixture build runs it and checks its coefficients match the result's.
"""

from __future__ import annotations

import json
from pathlib import Path

import pandas as pd


def _value(value) -> str:
    """A fill value as Python source, e.g. 78.0 or 'yes'."""
    if isinstance(value, str):
        return json.dumps(value)
    return repr(float(value))


def script_block(raw: pd.DataFrame, prepared, dataset_name: str, csv_name: str) -> dict:
    profile, imputer, imputed, terms = prepared.profile, prepared.imputer, prepared.imputed, prepared.terms
    target = profile.target
    outcomes = sorted(raw[target].dropna().unique(), key=lambda v: (str(type(v)), v))
    positive = outcomes[1].item() if hasattr(outcomes[1], "item") else outcomes[1]
    data = prepared.data
    stem = Path(csv_name).stem

    lines = [
        '"""',
        f"Reproduces the LogitLab model for {dataset_name}.",
        "",
        "Covers the full-data model (sections 02 and 05 of the report): the same rows,",
        "the same gap filling, the same encoding and the same fit. The train/test",
        "evaluation in section 06 is not included.",
        "",
        "Needs pandas, numpy and statsmodels.",
        f"Run it with: python logitlab_{stem}.py path/to/{csv_name}",
        '"""',
        "",
        "import sys",
        "",
        "import numpy as np",
        "import pandas as pd",
        "import statsmodels.api as sm",
        "",
        f'DATA = sys.argv[1] if len(sys.argv) > 1 else "{csv_name}"',
        f'TARGET = "{target}"',
        f"POSITIVE = {positive!r}  # the outcome value counted as 1",
        "",
        "df = pd.read_csv(DATA)",
        "# Rows without an outcome cannot teach the model anything, so they are dropped.",
        "df = df[df[TARGET].notna()].reset_index(drop=True)",
        "y = (df[TARGET] == POSITIVE).astype(int)",
        "",
        "# Gaps are filled with the values LogitLab chose (section 02's decision log).",
    ]

    for rule in imputer.rules:
        if not data[rule.column].isna().any():
            continue
        if rule.group_column is not None:
            lines += [
                f"# '{rule.column}' is 0 wherever '{rule.group_column}' is 0; its other gaps get the median among positive values.",
                f'df.loc[df["{rule.column}"].isna() & (df["{rule.group_column}"] == 0), "{rule.column}"] = 0',
            ]
        lines.append(f'df["{rule.column}"] = df["{rule.column}"].fillna({_value(rule.fill_value)})  # {rule.method}')

    lines += [
        "",
        "",
        "def level(value):",
        '    """A level as LogitLab reads it: 1.0 becomes "1"."""',
        "    if isinstance(value, float) and value.is_integer():",
        "        return str(int(value))",
        "    return str(value)",
        "",
        "",
        "# One column per model term, in the model's order.",
        'X = pd.DataFrame({"const": 1.0}, index=df.index)',
    ]
    continuous: list[str] = []
    for t in terms:
        column, name = t["column"], t["name"]
        if t["kind"] == "continuous":
            lines.append(f'X["{name}"] = df["{column}"].astype(float)')
            continuous.append(name)
        elif t["kind"] == "binary":
            if set(imputed[column].unique()) <= {0, 1}:
                lines.append(f'X["{name}"] = df["{column}"].astype(float)')
            else:
                second = (profile.info(column).levels or [])[1]
                lines.append(f'X["{name}"] = (df["{column}"].map(level) == {json.dumps(second)}).astype(float)')
        else:
            level = name[len(column) + 1 : -1]  # "education[2]" -> "2"
            lines.append(
                f'X["{name}"] = (df["{column}"].map(level) == {json.dumps(level)}).astype(float)'
                f"  # against level {json.dumps(t['reference'])}"
            )

    lines += [
        "",
        "fit = sm.Logit(y, X).fit(disp=0, maxiter=200)",
        "print(fit.summary())",
        "",
        "# Odds ratios with 95% intervals: per unit, and per 1 SD for measurements.",
        "ci = fit.conf_int()",
        f"CONTINUOUS = {json.dumps(continuous)}",
        "scale = pd.Series(1.0, index=fit.params.index)",
        "scale[CONTINUOUS] = X[CONTINUOUS].std()",
        "odds = pd.DataFrame(",
        "    {",
        '        "OR per unit": np.exp(fit.params),',
        '        "low": np.exp(ci[0]),',
        '        "high": np.exp(ci[1]),',
        '        "OR per SD": np.exp(fit.params * scale),',
        '        "p": fit.pvalues,',
        "    }",
        ').drop(index="const")',
        "print(odds.round(3))",
        "",
    ]
    return {"filename": f"logitlab_{stem}.py", "code": "\n".join(lines)}
