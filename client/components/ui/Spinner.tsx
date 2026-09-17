export default function Spinner({
  className = "",
  label = "Loading",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={`inline-flex items-center gap-2 text-sm text-kf-muted ${className}`}
      role="status"
      aria-live="polite"
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-kf-border-strong border-t-kf-accent" />
      <span>{label}</span>
    </div>
  );
}
