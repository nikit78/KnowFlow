"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";
const GOOGLE_CLIENT_ID =
  "445239036663-ppphrcc4gfdjkeshhlqm8plhid83hlmv.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: string;
              size?: string;
              width?: number;
              text?: string;
              shape?: string;
            },
          ) => void;
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const scriptId = "google-identity-services";

    const initializeGoogle = () => {
      if (!window.google) {
        return;
      }

      const googleButton = document.getElementById("google-sign-in");

      if (!googleButton) {
        return;
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });

      googleButton.innerHTML = "";

      window.google.accounts.id.renderButton(googleButton, {
        theme: "outline",
        size: "large",
        width: 400,
        text: "continue_with",
        shape: "rectangular",
      });
    };

    const existingScript = document.getElementById(scriptId);

    if (existingScript) {
      initializeGoogle();
      return;
    }

    const script = document.createElement("script");

    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = initializeGoogle;

    document.head.appendChild(script);
  }, []);

  async function handleGoogleResponse(response: { credential: string }) {
    setError("");
    setGoogleLoading(true);

    try {
      const result = await fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(
          data.message || "Unable to sign in with Google.",
        );
      }

      router.push("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
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

      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to sign in.");
      }

      router.push("/dashboard");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#09090B] text-zinc-100">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="hidden border-r border-white/5 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <Link
            href="/"
            className="w-fit text-xl font-semibold tracking-tight"
          >
            Know<span className="text-blue-400">Flow</span>
          </Link>

          <div className="max-w-lg">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
              Welcome back
            </span>

            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-zinc-100 xl:text-5xl">
              Your knowledge is waiting for you.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-zinc-500">
              Pick up where you left off. Your notes, ideas, documents, and
              connected knowledge are all in one place.
            </p>

            <div className="mt-10 flex items-center gap-3">
              <div className="flex -space-x-2">
                <span className="h-8 w-8 rounded-full border-2 border-[#09090B] bg-blue-400/30" />
                <span className="h-8 w-8 rounded-full border-2 border-[#09090B] bg-cyan-400/25" />
                <span className="h-8 w-8 rounded-full border-2 border-[#09090B] bg-violet-400/25" />
              </div>

              <p className="text-xs text-zinc-600">
                A calmer way to manage what you know.
              </p>
            </div>
          </div>

          <p className="text-xs text-zinc-700">© 2026 KnowFlow</p>
        </section>

        <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden">
              <Link
                href="/"
                className="text-xl font-semibold tracking-tight"
              >
                Know<span className="text-blue-400">Flow</span>
              </Link>
            </div>

            <div className="mt-12 lg:mt-0">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
                  Sign in to KnowFlow
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Enter your details to continue to your workspace.
                </p>
              </div>

              {error && (
                <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-blue-400/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-blue-400/10"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-zinc-300"
                    >
                      Password
                    </label>

                    <Link
                      href="/auth/forgot-password"
                      className="text-xs font-medium text-blue-400 transition-colors hover:text-blue-300"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-blue-400/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-blue-400/10"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/10 bg-white/[0.03] accent-blue-500"
                  />

                  <span className="text-sm text-zinc-500">Remember me</span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-xl bg-blue-500 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-400 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-xs text-zinc-700">OR</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="relative">
                <div
                  id="google-sign-in"
                  className="flex min-h-11 w-full items-center justify-center"
                />

                {googleLoading && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-[#09090B]/80 text-sm text-zinc-400">
                    Signing in with Google...
                  </div>
                )}
              </div>

              <p className="mt-8 text-center text-sm text-zinc-500">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/register"
                  className="font-medium text-blue-400 transition-colors hover:text-blue-300"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}