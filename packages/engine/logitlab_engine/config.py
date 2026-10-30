"""Thresholds and display metadata. Change a rule here, not in the logic."""

ENGINE_VERSION = "0.1.0"
SCHEMA_VERSION = 1

# Column typing
CATEGORICAL_MAX_LEVELS = 5  # integer-coded columns with up to this many levels
TEXT_MAX_LEVELS = 12  # text columns with more levels are treated as free text

# Imputation
SKEW_THRESHOLD = 1.0  # |skewness| above this -> median, otherwise mean
HIGH_MISSING_FRACTION = 0.05  # a column missing more than this earns a warning

# Flags
RARE_FRACTION = 0.01  # a binary predictor with a minority group below this
LEAKAGE_AUC = 0.95  # a single predictor this good (or this bad) looks like leakage
HIGH_CORRELATION = 0.90  # near-duplicate predictors
STRUCTURAL_AGREEMENT = 0.99  # "indicator equals (amount > 0)" agreement

# Outliers
IQR_FENCE = 1.5

TARGET_HINTS = (
    "chd",
    "target",
    "outcome",
    "label",
    "class",
    "churn",
    "survived",
    "disease",
    "default",
    "fraud",
    "response",
)

# Display metadata for the Framingham sample. Unknown columns fall back to a
# prettified version of their name, so uploads still look reasonable.
LABELS = {
    "male": "Male (vs female)",
    "age": "Age",
    "education": "Education level",
    "currentSmoker": "Current smoker",
    "cigsPerDay": "Cigarettes per day",
    "BPMeds": "On BP medication",
    "prevalentStroke": "Prior stroke",
    "prevalentHyp": "Hypertension",
    "diabetes": "Diabetes",
    "totChol": "Total cholesterol",
    "sysBP": "Systolic BP",
    "diaBP": "Diastolic BP",
    "BMI": "BMI",
    "heartRate": "Heart rate",
    "glucose": "Glucose",
    "TenYearCHD": "10-year CHD",
}

UNITS = {
    "age": "years",
    "cigsPerDay": "cigarettes",
    "totChol": "mg/dL",
    "sysBP": "mmHg",
    "diaBP": "mmHg",
    "BMI": "kg/m²",
    "heartRate": "bpm",
    "glucose": "mg/dL",
}

TARGET_LABELS = {
    "TenYearCHD": ("No CHD within 10 years", "CHD within 10 years"),
}


def sample_notes(rows: int) -> list[str]:
    """Honest notes about how the sample analysis differs from the project report."""
    return [
        f"All {rows:,} rows are used. The project report analysed 4,238 rows; "
        "the two-row difference could not be traced, so no rows are removed.",
        "Age stays in the model. The report excluded it for non-linearity; "
        "here, assumption failures lead to warnings and sensitivity checks, "
        "never to dropped predictors.",
        "Coefficients come from an unweighted fit on all rows. The report used "
        "class weights, which inflate predicted probabilities.",
    ]