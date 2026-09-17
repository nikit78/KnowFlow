import { ReactNode } from "react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[16px] border border-dashed border-kf-border bg-kf-surface/70 px-6 py-14 text-center">
      {icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-kf-accent-soft text-kf-accent-ink">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-kf-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-kf-muted">
        {description}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
