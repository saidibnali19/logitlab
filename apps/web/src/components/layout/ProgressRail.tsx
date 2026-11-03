export function ProgressRail() {
  return (
    <aside className="fixed top-1/2 left-4 z-30 hidden w-28 -translate-y-1/2 rounded-lg border border-dashed border-slate-300 bg-white/80 p-2 text-center text-xs text-slate-600 xl:block print:hidden">
      <p className="font-mono font-medium text-emerald-700">
        {"<ProgressRail />"}
      </p>
      <p className="mt-1">Section jump links, shown after data loads</p>
    </aside>
  );
}
