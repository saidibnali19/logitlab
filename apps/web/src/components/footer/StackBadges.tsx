const STACK = [
  "Next.js",
  "Tailwind CSS",
  "FastAPI",
  "pandas",
  "statsmodels",
  "scikit-learn",
  "Turborepo",
];

export function StackBadges() {
  return (
    <div>
      <p className="text-sm font-medium">How it&apos;s built</p>
      <ul className="mt-2 flex flex-wrap gap-2">
        {STACK.map((name) => (
          <li key={name} className="badge badge-outline">
            {name}
          </li>
        ))}
      </ul>
    </div>
  );
}
