type Props = {
  name: string;
  description?: string;
};

export function ComponentPlaceholder({ name, description }: Props) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-white/60 p-6 text-center">
      <p className="font-mono text-sm font-medium text-emerald-700">
        {`<${name} />`}
      </p>
      {description && (
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      )}
    </div>
  );
}
