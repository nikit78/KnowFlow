"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { IconArrowLeft, IconArrowRight, IconMail } from "@/components/icons";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <AuthShell
      eyebrow="Account recovery"
      title="Reset access when you need it."
      description="Password reset email delivery is not connected yet. Use your existing login method, or contact support if you are locked out."
    >
      <div className="mt-8 lg:mt-0">
        {/* Heading */}
        <div>
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl border border-kf-border bg-kf-surface-muted">
            <IconMail size={17} className="text-kf-accent" />
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-kf-ink">
            Forgot your password?
          </h2>

          <p className="mt-2 text-sm leading-6 text-kf-muted">
            Enter your email to see the available recovery options.
          </p>
        </div>

        {submitted ? (
          /* Recovery state */
          <div className="mt-7 rounded-2xl border border-kf-border bg-kf-surface p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-kf-accent/20 bg-kf-accent-soft">
              <IconMail size={17} className="text-kf-accent" />
            </div>

            <h3 className="mt-5 text-base font-semibold text-kf-ink">
              Recovery email is not enabled yet
            </h3>

            <p className="mt-2 text-sm leading-6 text-kf-muted">
              KnowFlow currently supports email/password and Google sign-in.
              If you registered with Google, continue with Google on the login
              page. Email reset will be added when the mail provider is
              configured.
            </p>

            <div className="mt-6">
              <Button href="/auth/login">
                Back to login
                <IconArrowRight size={15} />
              </Button>
            </div>
          </div>
        ) : (
          /* Form */
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

            <Button type="submit" className="w-full">
              Continue
              <IconArrowRight size={15} />
            </Button>
          </form>
        )}

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-kf-muted transition-colors hover:text-kf-ink"
          >
            <IconArrowLeft size={14} />
            Back to login
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}