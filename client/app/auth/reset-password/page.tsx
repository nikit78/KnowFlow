"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  IconArrowLeft,
  IconArrowRight,
  IconEye,
  IconEyeOff,
  IconLock,
} from "@/components/icons";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [message, setMessage] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setMessage(
      "Password reset tokens are not enabled yet. Please sign in with your current credentials or Google.",
    );
  }

  return (
    <AuthShell
      eyebrow="Reset password"
      title="A secure new password, when recovery is ready."
      description="Choose a new password here once email-based recovery is enabled. For now, you can continue using your existing sign-in method."
    >
      <div className="mt-8 lg:mt-0">
        <div>
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-kf-border bg-kf-surface-muted">
            <IconLock size={17} className="text-kf-accent" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-kf-ink">
            Create a new password
          </h2>

          <p className="mt-2 text-sm leading-6 text-kf-muted">
            Enter and confirm your new password below.
          </p>
        </div>

        {message && (
          <div
            className="mt-6 rounded-xl border border-kf-border bg-kf-surface-muted px-4 py-3.5 text-sm leading-6 text-kf-ink-soft"
            role="status"
          >
            {message}
          </div>
        )}

        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            autoComplete="new-password"
            required
            trailing={
              <button
                type="button"
                className="rounded-lg p-2 text-kf-muted transition-colors hover:bg-kf-surface-muted hover:text-kf-ink focus:outline-none focus:ring-2 focus:ring-kf-accent/30"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={
                  showPassword ? "Hide new password" : "Show new password"
                }
              >
                {showPassword ? (
                  <IconEyeOff size={16} />
                ) : (
                  <IconEye size={16} />
                )}
              </button>
            }
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            label="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Repeat your password"
            autoComplete="new-password"
            required
            trailing={
              <button
                type="button"
                className="rounded-lg p-2 text-kf-muted transition-colors hover:bg-kf-surface-muted hover:text-kf-ink focus:outline-none focus:ring-2 focus:ring-kf-accent/30"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={
                  showConfirmPassword
                    ? "Hide confirmed password"
                    : "Show confirmed password"
                }
              >
                {showConfirmPassword ? (
                  <IconEyeOff size={16} />
                ) : (
                  <IconEye size={16} />
                )}
              </button>
            }
          />

          <Button type="submit" className="w-full">
            Update password
            <IconArrowRight size={15} />
          </Button>
        </form>

        <div className="mt-8 rounded-xl border border-kf-border bg-kf-surface-muted/50 px-4 py-3.5">
          <p className="text-center text-sm text-kf-muted">
            Recovery email not available yet?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-kf-accent transition-colors hover:text-kf-accent-hover"
            >
              Sign in instead
            </Link>
          </p>
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/auth/forgot-password"
            className="inline-flex items-center gap-2 text-xs font-semibold text-kf-muted transition-colors hover:text-kf-ink"
          >
            <IconArrowLeft size={14} />
            Back to password recovery
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}