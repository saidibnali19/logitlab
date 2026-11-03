import { SegmentedControl } from "@/components/ui/SegmentedControl";

export type OddsScale = "std" | "raw";

const OPTIONS: { value: OddsScale; label: string }[] = [
  { value: "std", label: "Per 1 SD" },
  { value: "raw", label: "Per unit" },
];

/** Switches every odds ratio between per-SD and per-unit. */
export function ScaleToggle({
  value,
  onChange,
}: {
  value: OddsScale;
  onChange: (value: OddsScale) => void;
}) {
  return (
    <SegmentedControl
      name="odds-scale"
      legend="Show odds ratios"
      options={OPTIONS}
      value={value}
      onChange={onChange}
    />
  );
}
