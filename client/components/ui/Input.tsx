import { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  trailing?: ReactNode;
};

export default function Input({
  label,
  hint,
  error,
  trailing,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-kf-ink-soft"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          className={`h-11 w-full rounded-[10px] border bg-kf-surface px-3.5 text-sm text-kf-ink outline-none transition placeholder:text-kf-faint focus:border-kf-accent focus:ring-2 focus:ring-kf-accent/15 ${
            error ? "border-kf-error" : "border-kf-border"
          } ${trailing ? "pr-11" : ""} ${className}`}
          {...props}
        />

        {trailing && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            {trailing}
          </div>
        )}
      </div>

      {error ? (
        <p className="mt-1.5 text-xs text-kf-error">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-kf-muted">{hint}</p>
      ) : null}
    </div>
  );
}
