import Link from "next/link";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <section className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-2xl font-bold tracking-tight text-white"
          >
            KnowFlow
          </Link>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-950 p-8 shadow-xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Forgot your password?
            </h1>

            <p className="mt-3 text-sm leading-6 text-gray-400">
              Enter the email address connected to your KnowFlow account.
              We&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              Send Reset Link
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-gray-400 transition hover:text-white"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}