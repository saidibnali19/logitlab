export type OddsScale = "std" | "raw";

const OPTIONS: { value: OddsScale; label: string }[] = [
  { value: "std", label: "Per 1 SD" },
  { value: "raw", label: "Per unit" },
];

/** Switches every odds ratio between per-SD and per-unit. Native radios, so keys work. */
export function ScaleToggle({
  value,
  onChange,
}: {
  value: OddsScale;
  onChange: (value: OddsScale) => void;
}) {
  return (
    <fieldset className="border-line bg-surface-sunken inline-flex rounded-lg border p-1 text-sm">
      <legend className="sr-only">Show odds ratios</legend>
      {OPTIONS.map((option) => (
        <label
          key={option.value}
          className={`has-focus-visible:outline-focus cursor-pointer rounded-md px-3 py-1.5 font-medium transition-colors duration-150 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 ${
            value === option.value
              ? "bg-surface text-ink shadow-card"
              : "text-ink-muted hover:text-ink"
          }`}
        >
          <input
            type="radio"
            name="odds-scale"
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
