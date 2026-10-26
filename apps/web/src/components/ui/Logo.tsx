type LogoMarkProps = { className?: string };

export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <rect x="2" y="13" width="5" height="9" rx="1.5" />
      <rect x="9.5" y="8" width="5" height="14" rx="1.5" />
      <rect x="17" y="2" width="5" height="20" rx="1.5" />
    </svg>
  );
}

type LogoProps = { className?: string };

export function Logo({ className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className="text-brand size-6" />
      <span className="text-ink text-lg font-semibold tracking-tight">
        LogitLab
      </span>
    </span>
  );
}
