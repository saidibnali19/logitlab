import { Lock } from "lucide-react";

export function TrustLine() {
  return (
    <p className="reveal-fade reveal-delay-400 text-ink-muted flex items-center justify-center gap-2 text-sm">
      <Lock className="size-4" aria-hidden="true" />
      Your file is processed in memory and never stored.
    </p>
  );
}
