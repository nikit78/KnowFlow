import Link from "next/link";

export default function RegisterPage() {
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
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Start your workspace
            </span>

            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-zinc-100 xl:text-5xl">
              Give your ideas a place to grow.
            </h1>

            <p className="mt-6 max-w-md text-base leading-7 text-zinc-500">
              Create a focused workspace for your notes, research, ideas, and
              everything you want to remember.
            </p>

            <div className="mt-10 grid max-w-sm grid-cols-3 gap-3">
              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-lg font-semibold text-zinc-200">01</p>
                <p className="mt-1 text-xs text-zinc-600">Capture</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-lg font-semibold text-zinc-200">02</p>
                <p className="mt-1 text-xs text-zinc-600">Connect</p>
              </div>

              <div className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
                <p className="text-lg font-semibold text-zinc-200">03</p>
                <p className="mt-1 text-xs text-zinc-600">Discover</p>
              </div>
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
                  Create your KnowFlow account
                </h2>

                <p className="mt-2 text-sm text-zinc-500">
                  Start building your personal knowledge workspace.
                </p>
              </div>

              <form className="mt-8 space-y-5">
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                  >
                    Full name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Your name"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-blue-400/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-blue-400/10"
                  />
                </div>

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
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-zinc-300"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-700 focus:border-blue-400/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-blue-400/10"
                  />

                  <p className="mt-2 text-xs text-zinc-700">
                    Use at least 8 characters.
                  </p>
                </div>

                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 rounded border-white/10 bg-white/[0.03] accent-blue-500"
                  />

                  <span className="text-xs leading-5 text-zinc-600">
                    I agree to the KnowFlow{" "}
                    <a
                      href="#"
                      className="text-zinc-400 transition-colors hover:text-zinc-200"
                    >
                      Terms
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-zinc-400 transition-colors hover:text-zinc-200"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>

                <button
                  type="submit"
                  className="h-11 w-full rounded-xl bg-blue-500 px-5 text-sm font-semibold text-white transition-all duration-200 hover:bg-blue-400 active:scale-[0.99]"
                >
                  Create account
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
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-blue-400 transition-colors hover:text-blue-300"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}