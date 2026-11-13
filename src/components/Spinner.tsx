export function Spinner({
  size = 20,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={`sanaa-spinner inline-block ${className}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <span className="ring ring-outer" />
      <span className="ring ring-inner" />
    </span>
  );
}

export function FullPageLoader({ label }: { label?: string }) {
  return (
    <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4">
      <Spinner size={40} />
      {label && (
        <p className="font-display text-sm tracking-wide text-ink-muted">
          {label}
        </p>
      )}
    </div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`sanaa-shimmer rounded-xl ${className}`} />;
}
