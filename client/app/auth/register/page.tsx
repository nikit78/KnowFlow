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
  IconCheck,
  IconEye,
  IconEyeOff,
  IconUser,
} from "@/components/icons";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

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

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName || !trimmedEmail || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please agree to continue creating your account.");
      return;
    }

    try {
      setLoading(true);

      await apiFetch("/auth/register", {
        method: "POST",
        body: {
          name: trimmedName,
          email: trimmedEmail,
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
      eyebrow="Start your workspace"
      title="Give your documents a place to become knowledge."
      description="Create an account to upload files, organize collections, take notes, and ask AI questions with sources."
    >
      <div className="mt-8 lg:mt-0">
        {/* Heading */}
        <div>
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-kf-border bg-kf-surface-muted">
            <IconUser size={17} className="text-kf-accent" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-kf-ink">
            Create your KnowFlow account
          </h2>

          <p className="mt-2 text-sm leading-6 text-kf-muted">
            Start building a private knowledge base in minutes.
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

        {/* Form */}
        <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
          <Input
            id="name"
            name="name"
            label="Full name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your full name"
            autoComplete="name"
            required
          />

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
            placeholder="At least 6 characters"
            autoComplete="new-password"
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

          {/* Privacy acknowledgement */}
          <label className="group flex cursor-pointer items-start gap-3 rounded-xl border border-kf-border bg-kf-surface-muted/50 p-4 transition-colors hover:border-kf-accent/25">
            <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(event) => setAcceptedTerms(event.target.checked)}
                className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-kf-border bg-kf-surface accent-kf-accent checked:border-kf-accent checked:bg-kf-accent"
              />

              <IconCheck
                size={11}
                className="pointer-events-none absolute text-white opacity-0 transition-opacity peer-checked:opacity-100"
              />
            </span>

            <span className="text-xs leading-5 text-kf-muted">
              I understand KnowFlow stores my documents privately in my account
              and uses them only to power search and AI answers for me.
            </span>
          </label>

          <Button
            type="submit"
            className="w-full"
            disabled={submitting}
          >
            {loading ? "Creating account..." : "Create account"}
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
              Creating your account...
            </div>
          )}
        </div>

        {/* Login */}
        <div className="mt-8 rounded-xl border border-kf-border bg-kf-surface-muted/50 px-4 py-3.5 text-center">
          <p className="text-sm text-kf-muted">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-kf-accent transition-colors hover:text-kf-accent-hover"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}