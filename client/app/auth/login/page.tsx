"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import GoogleSignIn from "@/components/auth/GoogleSignIn";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { apiFetch, ApiError } from "@/lib/api";
import {
  IconArrowRight,
  IconEye,
  IconEyeOff,
  IconLock,
} from "@/components/icons";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleCredential(credential: string) {
    setError("");
    setGoogleLoading(true);

    try {
      await apiFetch("/auth/google", {
        method: "POST",
        body: { credential },
      });

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Google sign-in failed. Please try again.",
      );
    } finally {
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      await apiFetch("/auth/login", {
        method: "POST",
        body: {
          email: email.trim(),
          password,
        },
      });

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  const submitting = loading || googleLoading;

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Your knowledge is waiting for you."
      description="Sign in to upload documents, organize collections, and ask questions grounded in your own files."
    >
      <div className="mt-8 lg:mt-0">
        {/* Heading */}
        <div>
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-kf-border bg-kf-surface-muted">
            <IconLock size={17} className="text-kf-accent" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-kf-ink">
            Sign in to KnowFlow
          </h2>

          <p className="mt-2 text-sm leading-6 text-kf-muted">
            Continue to your private knowledge workspace.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="mt-6 rounded-xl border border-kf-error/20 bg-kf-error-soft px-4 py-3.5 text-sm leading-6 text-kf-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Email / password */}
        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            label="Password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            trailing={
              <button
                type="button"
                className="rounded-lg p-2 text-kf-muted transition-colors hover:bg-kf-surface-muted hover:text-kf-ink focus:outline-none focus:ring-2 focus:ring-kf-accent/30"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <IconEyeOff size={16} />
                ) : (
                  <IconEye size={16} />
                )}
              </button>
            }
          />

          <div className="flex items-center justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-xs font-semibold text-kf-accent transition-colors hover:text-kf-accent-hover"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
          >
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <IconArrowRight size={15} />}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-kf-border" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-kf-faint">
            Or continue with
          </span>
          <div className="h-px flex-1 bg-kf-border" />
        </div>

        {/* Google */}
        <div className="relative">
          <GoogleSignIn
            onCredential={handleGoogleCredential}
            disabled={submitting}
          />

          {googleLoading && (
            <div
              className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl border border-kf-border bg-kf-bg/85 text-sm font-medium text-kf-muted backdrop-blur-sm"
              aria-live="polite"
            >
              Signing in with Google...
            </div>
          )}
        </div>

        {/* Register */}
        <div className="mt-8 rounded-xl border border-kf-border bg-kf-surface-muted/50 px-4 py-3.5 text-center">
          <p className="text-sm text-kf-muted">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-kf-accent transition-colors hover:text-kf-accent-hover"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}