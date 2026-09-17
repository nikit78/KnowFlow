type BadgeProps = {
  children: React.ReactNode;
  tone?:
    | "neutral"
    | "accent"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "favorite";
  className?: string;
};

const tones: Record<NonNullable<BadgeProps["tone"]>, string> = {
  neutral: "bg-kf-surface-muted text-kf-ink-soft",
  accent: "bg-kf-accent-soft text-kf-accent-ink",
  success: "bg-kf-success-soft text-kf-success",
  warning: "bg-kf-warning-soft text-kf-warning",
  error: "bg-kf-error-soft text-kf-error",
  info: "bg-kf-info-soft text-kf-info",
  favorite: "bg-kf-favorite-soft text-kf-favorite",
};

export default function Badge({
  children,
  tone = "neutral",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
