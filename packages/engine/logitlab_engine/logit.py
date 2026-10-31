"""A thin wrapper around statsmodels' Logit so the rest of the engine stays simple."""

from __future__ import annotations

import warnings
from dataclasses import dataclass

import numpy as np
import pandas as pd
import statsmodels.api as sm
from statsmodels.tools.sm_exceptions import PerfectSeparationError


class Refused(Exception):
    """Raised when an honest analysis is impossible. The message teaches why."""

    def __init__(self, check: str, title: str, message: str, column: str | None = None):
        super().__init__(message)
        self.check, self.title, self.message, self.column = check, title, message, column

    def as_dict(self) -> dict:
        return {"check": self.check, "title": self.title, "message": self.message, "column": self.column}


@dataclass
class LogitFit:
    params: pd.Series
    se: pd.Series
    pvalues: pd.Series
    cov: pd.DataFrame
    llf: float
    aic: float
    fitted: np.ndarray
    converged: bool
    separated: bool
    result: object  # the underlying statsmodels result


def fit_logit(X: pd.DataFrame, y: pd.Series) -> LogitFit:
    separated = False
    with warnings.catch_warnings(record=True) as caught:
        warnings.simplefilter("always")
        try:
            result = sm.Logit(y, X).fit(disp=0, maxiter=200)
        except PerfectSeparationError:
            raise Refused(
                "separation",
                "Perfect separation",
                "A predictor, or a combination of predictors, splits the outcome perfectly, so the "
                "model's estimates would run off to infinity. Check for a column that is really the "
                "outcome in disguise.",
            )
    for w in caught:
        text = f"{w.category.__name__} {w.message}".lower()
        if "perfectseparation" in text or "perfect separation" in text:
            separated = True

    params = result.params
    converged = bool(result.mle_retvals.get("converged", True))
    if not converged or float(np.abs(params).max()) > 25:
        separated = True

    return LogitFit(
        params=params,
        se=result.bse,
        pvalues=result.pvalues,
        cov=result.cov_params(),
        llf=float(result.llf),
        aic=float(result.aic),
        fitted=np.asarray(result.predict()),
        converged=converged,
        separated=separated,
        result=result,
    )