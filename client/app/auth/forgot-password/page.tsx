import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#09090B] px-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111113] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-tight text-zinc-100"
          >
            Know<span className="text-blue-400">Flow</span>
          </Link>

          <h1 className="mt-8 text-3xl font-semibold text-zinc-100">
            Forgot your password?
          </h1>

          <p className="mt-3 text-sm leading-6 text-zinc-500">
            Enter your email address and we'll send you a password reset link.
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-zinc-300"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-blue-400/40 focus:ring-2 focus:ring-blue-400/10"
            />
          </div>

          <button
            type="submit"
            className="h-11 w-full rounded-xl bg-blue-500 text-sm font-semibold text-white transition hover:bg-blue-400"
          >
            Send Reset Link
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/auth/login"
            className="text-sm text-blue-400 transition hover:text-blue-300"
          >
            ← Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}