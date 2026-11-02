"""Builds the Framingham fixture the front end reads, and checks it against the contract."""

import json
import sys
from pathlib import Path

import pandas as pd

ENGINE = Path(__file__).resolve().parents[1]
ROOT = ENGINE.parents[1]
sys.path.insert(0, str(ENGINE))

from logitlab_engine.pipeline import run_analysis  # noqa: E402
from logitlab_engine.preview import preview_block  # noqa: E402
from logitlab_engine.serialize import write_json  # noqa: E402
from logitlab_engine.validate import validate_result  # noqa: E402

CSV = ROOT / "apps" / "web" / "public" / "samples" / "framingham.csv"
OUT = ROOT / "apps" / "web" / "public" / "samples" / "framingham.result.json"
PREVIEW_OUT = ROOT / "apps" / "web" / "src" / "lib" / "preview.generated.json"


def main() -> None:
    df = pd.read_csv(CSV)
    result, prepared = run_analysis(df, "Framingham Heart Study", "sample")
    write_json(result, OUT)
    
    
    def refuse_constant(name):
        raise ValueError(f"{name} found in the JSON")

    written = json.loads(OUT.read_text(encoding="utf-8"), parse_constant=refuse_constant)
    problems = validate_result(written)
    if problems:
        print(f"CONTRACT CHECK FAILED ({len(problems)} problem(s)):")
        for line in problems:
            print("  -", line)
        sys.exit(1)
    print(f"Contract check passed. {OUT.stat().st_size / 1024:.0f} KB written.")

    if written["meta"]["status"] == "complete":
        write_json(preview_block(written), PREVIEW_OUT)
        print(f"Preview written to {PREVIEW_OUT.relative_to(ROOT)}.")

    meta, glance, hygiene = result["meta"], result["dataGlance"], result["hygiene"]
    print(f"Wrote {OUT.relative_to(ROOT)}\n")
    print(f"Rows {meta['rows']}, events {meta['events']} ({meta['prevalence']:.1%})\n")

    print("DATA AT A GLANCE")
    print(" ", glance["verdict"]["text"])
    for col in glance["columns"]:
        print(f"  {col['role']:<10}{col['type']:<12}{col['name']}")
    for flag in glance["flags"]:
        print(f"  FLAG [{flag['kind']}] {flag['column']} ~ {flag['related']}")

    print("\nDATA HYGIENE")
    print(" ", hygiene["verdict"]["text"])
    for item in hygiene["imputations"]:
        print(f"  {item['column']:<12}{item['method']:<8}fill={item['fillValue']}  skew={item['skewness']}")
    print("  Outliers kept:", [(o["column"], o["count"]) for o in hygiene["outlierPolicy"]["flagged"]])
    print(f"  Decision log entries: {len(hygiene['decisionLog'])}")
    
    
    eda, assumptions = result["eda"], result["assumptions"]
    print("\nKNOW YOUR DATA")
    print(" ", eda["verdict"]["text"])

    print("\nASSUMPTION CHECKS")
    print("  Status:", meta["status"])
    print(" ", assumptions["verdict"]["text"])
    for check in assumptions["checks"]:
        print(f"  {check['verdict']['level']:<7}{check['id']:<19}{check['verdict']['text']}")
    print("  VIF:", {v["term"]: round(v["value"], 2) for v in assumptions["vif"]})
    print("  Box-Tidwell:", {b["column"]: round(b["pValue"], 4) for b in assumptions["boxTidwell"]})
    influence = assumptions["influence"]
    print(f"  Cook's distance: max {influence['maxCooksD']:.4f}, {influence['count']} rows above 4/n")
    for g in assumptions["groupTests"]:
        print(f"  {g['id']}: {g['terms']}  chi2={g['statistic']:.1f} df={g['df']} p={g['pValue']:.2g}")
    if prepared.fit is not None:
        print(f"  Log-likelihood of the full model: {prepared.fit.llf:.4f}")
        
    
    model, sens = result.get("model"), result.get("sensitivity")
    if model:
        print("\nTHE MODEL")
        print(" ", model["verdict"]["text"])
        print(" ", model["description"])
        f = model["fit"]
        print(f"  LR chi2={f['llrChi2']:.1f} df={f['llrDf']} p={f['llrPValue']:.2g}  McFadden R2={f['mcFaddenR2']:.4f}  AIC={f['aic']:.1f}")
        for c in model["coefficients"]:
            star = "*" if c["significant"] else " "
            print(f"  {star} {c['term']:<16}OR/unit {c['orRaw']:.3f} ({c['orRawLo']:.3f}-{c['orRawHi']:.3f})  OR/SD {c['orStd']:.2f}  p={c['pValue']:.3g}")
        print("  Example (non-significant):", next(c["interpretation"] for c in model["coefficients"] if not c["significant"]))
        print("  Example (significant):   ", next(c["interpretation"] for c in model["coefficients"] if c["significant"]))

    if sens:
        print("\nSENSITIVITY")
        print(" ", sens["verdict"]["text"])
        for item in sens["linearity"]:
            print(f"  [{item['verdict']['level']}] {item['column']}: dAIC={item['deltaAic']:.2f} LR p={item['lrPValue']:.3f} max OR change={item['maxOrChange']:.3%}")
        cc = sens["completeCase"]
        if cc:
            print(f"  [{cc['verdict']['level']}] complete cases {cc['completeCaseN']} of {cc['primaryN']}:", cc["verdict"]["text"])
            print("  Largest change:", max(cc["rows"], key=lambda r: abs(r["change"]))["term"], f"{max(abs(r['change']) for r in cc['rows']):.1%}")
        if sens["influence"]:
            print(f"  [{sens['influence']['verdict']['level']}] influence refit removed {sens['influence']['removed']}: max OR change {sens['influence']['maxOrChange']:.2%}")
            
    
    
    perf, what, take = result.get("performance"), result.get("whatIf"), result.get("takeaways")
    if perf:
        print("\nPERFORMANCE")
        print(" ", perf["verdict"]["text"])
        sp, a = perf["split"], perf["auc"]
        print(f"  Split: train {sp['trainRows']}, test {sp['testRows']} ({sp['testEvents']} events), seed {sp['seed']}")
        print(f"  AUC test {a['test']:.4f}  CV {a['cvMean']:.4f} ({a['cvLo']:.4f}-{a['cvHi']:.4f}) over {a['folds']} folds")
        print(f"  Chosen threshold {perf['threshold']['chosen']:.2f}; at it: {perf['atChosen']['counts']}  precision={perf['atChosen']['precision']}")
        c = perf["calibration"]
        print(f"  Calibration slope={c['slope']}  intercept={c['intercept']}  HL={c['hosmerLemeshow']}")
        print(f"  ROC points {len(perf['roc'])}, PR points {len(perf['pr'])}, threshold rows {len(perf['thresholdTable'])}, baseline {perf['prBaseline']:.3f}")
    if what:
        print("\nWHAT-IF")
        print(" ", what["verdict"]["text"])
        print("  Controls:", [(c["column"], c["kind"], c["default"]) for c in what["controls"]])
    if take:
        print("\nTAKEAWAYS")
        print(" ", take["headline"])
        for b in take["bullets"]:
            print(f"  [{b['level']}] {b['text'][:150]}")
        print("  Note:", take["nonSignificantNote"])
        print("  Caveats:", len(take["caveats"]))


if __name__ == "__main__":
    main()