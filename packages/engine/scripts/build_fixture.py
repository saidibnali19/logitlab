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
    result, _ = run_analysis(df, "Framingham Heart Study", "sample")
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


if __name__ == "__main__":
    main()