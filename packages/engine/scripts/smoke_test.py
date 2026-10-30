import sys
from pathlib import Path

import pandas as pd
import scipy
import sklearn
import statsmodels
import statsmodels.api as sm

ROOT = Path(__file__).resolve().parents[3]
CSV = ROOT / "apps" / "web" / "public" / "samples" / "framingham.csv"


def main() -> None:
    print(f"Python       {sys.version.split()[0]}")
    print(f"pandas       {pd.__version__}")
    print(f"scipy        {scipy.__version__}")
    print(f"statsmodels  {statsmodels.__version__}")
    print(f"scikit-learn {sklearn.__version__}")
    print()

    df = pd.read_csv(CSV)
    events = int(df["TenYearCHD"].sum())
    print(f"Rows x columns: {df.shape[0]} x {df.shape[1]}")
    print(f"Events: {events} ({events / len(df):.1%})")

    missing = df.isna().sum()
    missing = missing[missing > 0].sort_values(ascending=False)
    print("Missing values per column:")
    for column, count in missing.items():
        print(f"  {column:<12}{count}")
    print(f"Rows with at least one gap: {int(df.isna().any(axis=1).sum())}")
    print()

    complete = df.dropna()
    X = sm.add_constant(complete[["age", "sysBP"]])
    model = sm.Logit(complete["TenYearCHD"], X).fit(disp=0)
    print(f"Test fit converged: {model.mle_retvals['converged']}")
    print(model.params.round(4).to_string())


if __name__ == "__main__":
    main()