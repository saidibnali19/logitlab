/**
 * A small set of mutually exclusive choices drawn as one pill. Native radios
 * underneath, so arrow keys move between options and screen readers hear a group.
 */
export function SegmentedControl<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
  disabled = false,
}: {
  name: string; // unique per group on the page
  legend: string; // read by screen readers only
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <fieldset
      disabled={disabled}
      className="border-line bg-surface-sunken inline-flex rounded-lg border p-1 text-sm disabled:opacity-50"
    >
      <legend className="sr-only">{legend}</legend>
      {options.map((option) => (
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
            name={name}
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
