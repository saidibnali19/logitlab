"""Honest performance: a hold-out test set used once, with the cut-off tuned by cross-validation."""

from __future__ import annotations

import numpy as np
import pandas as pd
from scipy.stats import chi2, t as student_t
from sklearn.metrics import precision_recall_curve, roc_auc_score, roc_curve
from sklearn.model_selection import StratifiedKFold, train_test_split

from . import config
from .design import build_design
from .fmt import fmt_p
from .hygiene import Imputer
from .logit import LogitFit, Refused, fit_logit
from .profile import Profile


def _sigmoid(z: np.ndarray) -> np.ndarray:
    return 1.0 / (1.0 + np.exp(-z))


def _fit_and_predict(train: pd.DataFrame, other: pd.DataFrame, profile: Profile) -> tuple[LogitFit, np.ndarray]:
    """Learns the fill values on `train` only, fits the model there, and scores `other`."""
    imputer = Imputer.fit(train, profile)
    X_train, _ = build_design(imputer.transform(train), profile)
    X_other, _ = build_design(imputer.transform(other), profile)
    X_other = X_other.reindex(columns=X_train.columns, fill_value=0.0)
    y_train = train[profile.target]
    fit = fit_logit(X_train, y_train)
    beta = fit.params.reindex(X_train.columns).to_numpy(dtype=float)
    return fit, _sigmoid(X_other.to_numpy(dtype=float) @ beta)


def _row(y: np.ndarray, p: np.ndarray, threshold: float) -> dict:
    predicted = p >= threshold
    tp = int(((y == 1) & predicted).sum())
    fp = int(((y == 0) & predicted).sum())
    tn = int(((y == 0) & ~predicted).sum())
    fn = int(((y == 1) & ~predicted).sum())
    sensitivity = tp / (tp + fn) if tp + fn else 0.0
    specificity = tn / (tn + fp) if tn + fp else 0.0
    return {
        "threshold": round(float(threshold), 4),
        "sensitivity": sensitivity,
        "specificity": specificity,
        "precision": tp / (tp + fp) if tp + fp else None,
        "balancedAccuracy": (sensitivity + specificity) / 2,
        "counts": {"tp": tp, "fp": fp, "tn": tn, "fn": fn},
    }


def _thin(points: list[dict]) -> list[dict]:
    if len(points) <= config.CURVE_MAX_POINTS:
        return points
    keep = np.unique(np.linspace(0, len(points) - 1, config.CURVE_MAX_POINTS).round().astype(int))
    return [points[i] for i in keep]


def _calibration(y: np.ndarray, p: np.ndarray) -> dict:
    frame = pd.DataFrame({"y": y, "p": p})
    frame["bin"] = pd.qcut(frame["p"], config.CALIBRATION_BINS, duplicates="drop")
    bins, statistic = [], 0.0
    for _, g in frame.groupby("bin", observed=True):
        n, predicted, observed = len(g), float(g["p"].mean()), float(g["y"].mean())
        bins.append({"predicted": predicted, "observed": observed, "n": n})
        denominator = n * predicted * (1 - predicted)
        if denominator > 0:
            statistic += (n * observed - n * predicted) ** 2 / denominator

    hosmer = None
    if len(bins) >= 3:
        df = len(bins) - 2
        hosmer = {"statistic": float(statistic), "df": df, "pValue": float(chi2.sf(statistic, df))}

    slope = intercept = None
    clipped = np.clip(p, 1e-6, 1 - 1e-6)
    design = pd.DataFrame({"const": 1.0, "logit": np.log(clipped / (1 - clipped))})
    try:
        fit = fit_logit(design, pd.Series(y))
        if not fit.separated:
            params = fit.params.to_dict()
            slope, intercept = float(params["logit"]), float(params["const"])
    except Refused:
        pass
    return {
        "verdict": _calibration_verdict(slope, hosmer),
        "bins": bins,
        "slope": slope,
        "intercept": intercept,
        "hosmerLemeshow": hosmer,
    }


def _calibration_verdict(slope: float | None, hosmer: dict | None) -> dict:
    """Whether predicted risks can be read as real probabilities."""
    if slope is None:
        return {"level": "info", "text": "The calibration slope could not be estimated, so read predicted risks as rankings only."}
    low, high = config.CALIBRATION_SLOPE_RANGE
    if slope < low:
        spread = (
            f"Predicted risks are too spread out: the calibration slope is {slope:.2f}, where 1 is perfect, "
            "so the highest risks are overstated and the lowest understated."
        )
    elif slope > high:
        spread = (
            f"Predicted risks are too bunched together: the calibration slope is {slope:.2f}, where 1 is perfect, "
            "so the highest risks are understated and the lowest overstated."
        )
    else:
        spread = f"Predicted risks have about the right spread (calibration slope {slope:.2f}, where 1 is perfect)."

    misfit = hosmer is not None and hosmer["pValue"] < config.HOSMER_ALPHA
    if hosmer is None:
        overall = ""
    elif misfit:
        overall = f" The Hosmer-Lemeshow test finds a misfit between predicted and observed rates ({fmt_p(hosmer['pValue'])})."
    else:
        overall = f" The Hosmer-Lemeshow test finds no clear misfit ({fmt_p(hosmer['pValue'])})."

    level = "warn" if misfit or not (low <= slope <= high) else "pass"
    return {"level": level, "text": spread + overall}


def _wording(auc: float) -> tuple[str, str]:
    if auc >= 0.8:
        return "Good", "pass"
    if auc >= 0.7:
        return "Acceptable", "pass"
    if auc >= 0.6:
        return "Modest", "warn"
    return "Weak", "warn"


def performance_block(data: pd.DataFrame, profile: Profile) -> dict | None:
    target = profile.target
    train, test = train_test_split(
        data, test_size=config.TEST_FRACTION, stratify=data[target], random_state=config.SPLIT_SEED
    )
    train, test = train.reset_index(drop=True), test.reset_index(drop=True)
    y_test = test[target].to_numpy(dtype=int)

    # Cut-off: tuned on out-of-fold predictions from the training rows only.
    folds = StratifiedKFold(n_splits=config.CV_FOLDS, shuffle=True, random_state=config.SPLIT_SEED)
    oof = np.zeros(len(train))
    fold_auc = []
    y_train = train[target].to_numpy(dtype=int)
    try:
        for fit_idx, val_idx in folds.split(train, y_train):
            _, p_val = _fit_and_predict(train.iloc[fit_idx], train.iloc[val_idx], profile)
            oof[val_idx] = p_val
            fold_auc.append(float(roc_auc_score(y_train[val_idx], p_val)))
        final_fit, p_test = _fit_and_predict(train, test, profile)
    except Refused:
        return None
    if final_fit.separated:
        return None

    grid = np.round(np.arange(0.01, 1.0, 0.01), 2)
    balanced = [_row(y_train, oof, g)["balancedAccuracy"] for g in grid]
    chosen = float(grid[int(np.argmax(balanced))])

    k = len(fold_auc)
    mean_auc = float(np.mean(fold_auc))
    half = float(student_t.ppf(0.975, k - 1) * np.std(fold_auc, ddof=1) / np.sqrt(k)) if k > 1 else 0.0
    test_auc = float(roc_auc_score(y_test, p_test))

    fpr, tpr, _ = roc_curve(y_test, p_test)
    precision, recall, _ = precision_recall_curve(y_test, p_test)
    at_chosen = _row(y_test, p_test, chosen)

    word, level = _wording(test_auc)
    verdict = {
        "level": level,
        "text": (
            f"{word} discrimination. On the unseen test rows the model scores AUC {test_auc:.2f} "
            f"(5-fold cross-validation {mean_auc:.2f}, 95% CI {max(mean_auc - half, 0):.2f} to {min(mean_auc + half, 1):.2f}). "
            f"At the chosen cut-off of {chosen:.2f} it catches {at_chosen['sensitivity']:.0%} of cases "
            f"and clears {at_chosen['specificity']:.0%} of non-cases."
        ),
    }
    return {
        "verdict": verdict,
        "split": {
            "trainRows": len(train),
            "testRows": len(test),
            "testEvents": int(y_test.sum()),
            "testFraction": config.TEST_FRACTION,
            "seed": config.SPLIT_SEED,
        },
        "auc": {
            "test": test_auc,
            "cvMean": mean_auc,
            "cvLo": max(mean_auc - half, 0.0),
            "cvHi": min(mean_auc + half, 1.0),
            "folds": k,
        },
        "roc": _thin([{"x": round(float(a), 4), "y": round(float(b), 4)} for a, b in zip(fpr, tpr)]),
        "pr": _thin([{"x": round(float(a), 4), "y": round(float(b), 4)} for a, b in zip(recall, precision)]),
        "prBaseline": float(y_test.mean()),
        "calibration": _calibration(y_test, p_test),
        "threshold": {"chosen": chosen, "method": "balanced-accuracy", "tunedOn": "cross-validation"},
        "atChosen": at_chosen,
        "thresholdTable": [_row(y_test, p_test, g) for g in grid],
        # The same grid on the training rows' cross-validation predictions: any cut-off is chosen
        # here, so the test rows stay unseen until it is reported.
        "thresholdTableCv": [_row(y_train, oof, g) for g in grid],
    }