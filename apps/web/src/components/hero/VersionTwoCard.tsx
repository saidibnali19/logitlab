import { CloudUpload } from "lucide-react";

import { SITE } from "@/lib/site";

/** Says plainly that uploads are not in this version, instead of a control that cannot work. */
export function VersionTwoCard() {
  return (
    <aside
      aria-label="Planned for version 2"
      className="rounded-card border-line-strong bg-surface-sunken flex items-start gap-4 border border-dashed p-5"
    >
      <CloudUpload
        className="text-ink-faint mt-0.5 size-6 shrink-0"
        aria-hidden="true"
      />
      <div>
        <span className="badge badge-outline">Version 2</span>
        <p className="text-ink-muted mt-2 text-sm">{SITE.v2Line}</p>
      </div>
    </aside>
  );
}
