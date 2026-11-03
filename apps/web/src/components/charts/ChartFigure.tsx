import type { ReactNode } from "react";

/**
 * Frames one chart: a title, the drawing, and the same numbers as a table.
 * The table is the accessible version of the chart, so every chart gets one.
 */
export function ChartFigure({
  title,
  children,
  table,
}: {
  title: string;
  children: ReactNode;
  table?: ReactNode;
}) {
  return (
    <figure className="border-line bg-surface rounded-card border p-4">
      <figcaption className="font-medium">{title}</figcaption>
      <div className="mt-2">{children}</div>
      {table ? (
        <details className="mt-3">
          <summary className="text-ink-muted cursor-pointer text-xs font-medium">
            View as table
          </summary>
          <div className="mt-2 overflow-x-auto">{table}</div>
        </details>
      ) : null}
    </figure>
  );
}
