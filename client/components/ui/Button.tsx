import Link from "next/link";
import { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  className?: string;
};

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-kf-accent text-white hover:bg-kf-accent-hover shadow-sm disabled:opacity-60",
  secondary:
    "bg-kf-surface text-kf-ink border border-kf-border hover:border-kf-border-strong hover:bg-kf-surface-muted disabled:opacity-60",
  ghost:
    "bg-transparent text-kf-ink-soft hover:bg-kf-surface-muted hover:text-kf-ink disabled:opacity-60",
  danger:
    "bg-kf-error text-white hover:brightness-110 disabled:opacity-60",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-[15px]",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  href,
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  const classes = `inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold transition duration-150 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kf-accent ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
