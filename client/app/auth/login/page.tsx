import Link from "next/link";

export default function LoginPage() {
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

          <p className="text-xs text-zinc-700">
            © 2026 KnowFlow
          </p>
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

              <form className="mt-8 space-y-5">
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
                    placeholder="you@example.com"
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
                    placeholder="Enter your password"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-blue-400/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-blue-400/10"
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-white/10 bg-white/[0.03] accent-blue-500"
                  />

                  <span className="text-sm text-zinc-500">
                    Remember me
                  </span>
                </label>

                <button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-blue-500 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-400 active:scale-[0.99]"
                >
                  Sign in
                </button>
              </form>

              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-xs text-zinc-700">
                  OR
                </span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <button
                type="button"
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.02] px-5 text-sm font-medium text-zinc-300 transition-colors hover:bg-white/[0.04] hover:text-zinc-100"
              >
                Continue with Google
              </button>

              <p className="mt-8 text-center text-sm text-zinc-500">
                Don't have an account?{" "}
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