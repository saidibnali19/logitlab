/** The limits that apply to any reading of these results. */
export function Caveats({ caveats }: { caveats: string[] }) {
  if (caveats.length === 0) return null;

  return (
    <div className="border-line bg-surface-sunken rounded-card border p-5">
      <h3 className="font-semibold">Keep in mind</h3>
      <ul className="text-ink-muted mt-2 list-disc space-y-1 pl-5 text-sm">
        {caveats.map((caveat) => (
          <li key={caveat}>{caveat}</li>
        ))}
      </ul>
    </div>
  );
}
