"""The closing summary, written from the other blocks so it can never disagree with them."""

from __future__ import annotations

import numpy as np

from .fmt import fmt_p, join_labels


def refused_takeaways(refusal: dict) -> dict:
    return {
        "verdict": {"level": "refuse", "text": f"Refused: {refusal['title']}."},
        "headline": f"The analysis was stopped: {refusal['title'].lower()}.",
        "bullets": [{"level": "refuse", "text": refusal["message"]}],
        "nonSignificantNote": None,
        "caveats": [],
    }


def _lead(c: dict, term: dict) -> str:
    if term["kind"] == "continuous":
        return f"{c['label']}: each 1 SD higher goes with {c['orStd']:.2f} times the odds (95% CI {c['orStdLo']:.2f} to {c['orStdHi']:.2f})."
    return f"{c['label']}: {c['orRaw']:.2f} times the odds (95% CI {c['orRawLo']:.2f} to {c['orRawHi']:.2f})."


def takeaways_block(result: dict) -> dict:
    model, sens, perf = result["model"], result["sensitivity"], result["performance"]
    assumptions, positive = result["assumptions"], result["dataGlance"]["target"]["positiveLabel"]
    term_of = {t["name"]: t for t in model["terms"]}
    coefficients = model["coefficients"]

    significant = [c for c in coefficients if c["significant"]]
    significant.sort(key=lambda c: abs(np.log(c["orStd"])), reverse=True)
    others = [c for c in coefficients if not c["significant"]]

    bullets: list[dict] = [{"level": "info", "text": _lead(c, term_of[c["term"]])} for c in significant[:3]]
    if perf is not None:
        bullets.append({"level": perf["verdict"]["level"], "text": perf["verdict"]["text"]})
    for g in assumptions["groupTests"]:
        if g["significant"]:
            bullets.append(
                {"level": "info", "text": f"{g['label']} overlap, so read their odds ratios as a set (joint test, {fmt_p(g['pValue'])})."}
            )
    for item in sens["linearity"]:
        if item["verdict"]["level"] == "warn":
            bullets.append({"level": "warn", "text": item["verdict"]["text"]})
    for block in (sens["completeCase"], sens["influence"]):
        if block and block["verdict"]["level"] == "warn":
            bullets.append({"level": "warn", "text": block["verdict"]["text"]})

    note = None
    if others:
        shown = join_labels([c["label"] for c in others[:5]])
        more = f" and {len(others) - 5} more" if len(others) > 5 else ""
        note = (
            f"{len(others)} predictors showed no clear evidence of an association: {shown}{more}. "
            "They stay in the model. No clear evidence is not evidence that there is no effect."
        )

    caveats = [
        "These are associations in observational data, not proof that changing a factor changes the outcome.",
        "Independence of rows is assumed, not tested.",
        f"The model learns from one dataset ({result['meta']['datasetName']}). Check it on other populations before relying on it.",
        "The cut-off was tuned by cross-validation on the training rows; the hold-out test rows were used once.",
    ]
    for check in assumptions["checks"]:
        if check["verdict"]["level"] == "warn":
            caveats.append(check["verdict"]["text"])

    headline = f"{len(significant)} of {len(coefficients)} predictors show clear evidence of an association with {positive}."
    if perf is not None:
        headline += f" Discrimination is {perf['verdict']['text'].split(' ')[0].lower()} (AUC {perf['auc']['test']:.2f})."

    warned = any(b["level"] == "warn" for b in bullets) or len(caveats) > 4
    verdict = (
        {"level": "warn", "text": "Read the results together with the cautions below."}
        if warned
        else {"level": "pass", "text": "The results held up under every check."}
    )
    return {"verdict": verdict, "headline": headline, "bullets": bullets, "nonSignificantNote": note, "caveats": caveats}