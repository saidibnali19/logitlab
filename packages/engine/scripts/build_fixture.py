"""Builds the Framingham fixture. Until step 1.3f this writes a partial file for review."""

import sys
from pathlib import Path

import pandas as pd

ENGINE = Path(__file__).resolve().parents[1]
ROOT = ENGINE.parents[1]
sys.path.insert(0, str(ENGINE))

from logitlab_engine.pipeline import run_analysis  # noqa: E402
from logitlab_engine.serialize import write_json  # noqa: E402

CSV = ROOT / "apps" / "web" / "public" / "samples" / "framingham.csv"
OUT = ENGINE / "out" / "result.partial.json"


def main() -> None:
    df = pd.read_csv(CSV)
    result, prepared = run_analysis(df, "Framingham Heart Study", "sample")
    write_json(result, OUT)

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


if __name__ == "__main__":
    main()