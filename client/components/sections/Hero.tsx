import Container from "../layout/Container";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 py-24 md:py-32 lg:py-36">
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-blue-500/[0.08] blur-[120px]" />

      <Container>
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.06] px-4 py-2 text-xs font-medium text-blue-300">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Your personal knowledge workspace
          </div>

          <h1 className="mt-7 text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl md:text-6xl lg:text-7xl">
            Your knowledge,
            <span className="block text-zinc-500">
              finally working together.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg sm:leading-8">
            Capture ideas, organize your notes, connect your documents, and
            discover answers faster with one calm, intelligent workspace.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button>Start building</Button>

            <a
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-lg border border-white/10 px-6 text-sm font-semibold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
            >
              Explore features
            </a>
          </div>
        </div>

        <div className="relative mx-auto mt-20 max-w-5xl">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-blue-500/[0.06] blur-3xl" />

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111113] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <div className="flex h-12 items-center justify-between border-b border-white/10 px-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
              </div>

              <div className="rounded-md border border-white/10 px-3 py-1.5 text-[10px] text-zinc-600">
                app.knowflow
              </div>

              <div className="w-12" />
            </div>

            <div className="grid min-h-[390px] md:grid-cols-[180px_1fr]">
              <aside className="hidden border-r border-white/10 bg-white/[0.015] p-4 md:block">
                <div className="mb-8 text-sm font-semibold text-zinc-200">
                  Know<span className="text-blue-400">Flow</span>
                </div>

                <div className="space-y-1.5">
                  <div className="rounded-lg bg-blue-500/10 px-3 py-2.5 text-xs font-medium text-blue-300">
                    Overview
                  </div>

                  <div className="px-3 py-2.5 text-xs text-zinc-500">
                    My Notes
                  </div>

                  <div className="px-3 py-2.5 text-xs text-zinc-500">
                    Documents
                  </div>

                  <div className="px-3 py-2.5 text-xs text-zinc-500">
                    Collections
                  </div>
                </div>

                <div className="mt-8 border-t border-white/5 pt-5">
                  <p className="px-3 text-[10px] uppercase tracking-wider text-zinc-700">
                    Workspace
                  </p>

                  <div className="mt-3 space-y-1.5">
                    <div className="px-3 py-2 text-xs text-zinc-600">
                      Product Ideas
                    </div>

                    <div className="px-3 py-2 text-xs text-zinc-600">
                      Research
                    </div>
                  </div>
                </div>
              </aside>

              <div className="p-5 sm:p-7">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-zinc-600">
                      Monday, July 29
                    </p>

                    <h2 className="mt-1 text-lg font-semibold text-zinc-100">
                      Good morning
                    </h2>
                  </div>

                  <div className="flex h-9 items-center rounded-lg border border-white/10 px-3 text-xs text-zinc-600">
                    Search your knowledge...
                  </div>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">
                        Notes
                      </span>

                      <span className="text-[10px] text-blue-400">
                        +12%
                      </span>
                    </div>

                    <p className="mt-4 text-2xl font-semibold text-zinc-100">
                      248
                    </p>

                    <div className="mt-4 h-1 rounded-full bg-white/5">
                      <div className="h-1 w-3/4 rounded-full bg-blue-500/60" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">
                        Documents
                      </span>

                      <span className="text-[10px] text-cyan-400">
                        Synced
                      </span>
                    </div>

                    <p className="mt-4 text-2xl font-semibold text-zinc-100">
                      64
                    </p>

                    <div className="mt-4 flex gap-1">
                      <span className="h-1 flex-1 rounded-full bg-cyan-400/40" />
                      <span className="h-1 flex-1 rounded-full bg-cyan-400/25" />
                      <span className="h-1 flex-1 rounded-full bg-cyan-400/10" />
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-zinc-500">
                        AI Insights
                      </span>

                      <span className="text-[10px] text-violet-400">
                        8 new
                      </span>
                    </div>

                    <p className="mt-4 text-2xl font-semibold text-zinc-100">
                      32
                    </p>

                    <div className="mt-4 flex items-end gap-1">
                      <span className="h-3 w-1.5 rounded-sm bg-violet-400/20" />
                      <span className="h-5 w-1.5 rounded-sm bg-violet-400/30" />
                      <span className="h-7 w-1.5 rounded-sm bg-violet-400/40" />
                      <span className="h-4 w-1.5 rounded-sm bg-violet-400/25" />
                      <span className="h-8 w-1.5 rounded-sm bg-violet-400/50" />
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-zinc-600">
                          Recent activity
                        </p>

                        <p className="mt-1 text-sm font-medium text-zinc-200">
                          Knowledge at a glance
                        </p>
                      </div>

                      <span className="text-xs text-zinc-700">
                        View all
                      </span>
                    </div>

                    <div className="mt-5 space-y-3">
                      <div className="flex items-center gap-3 rounded-lg bg-white/[0.025] p-3">
                        <div className="h-8 w-8 rounded-lg bg-blue-400/10" />

                        <div className="flex-1">
                          <div className="h-2 w-32 rounded-full bg-white/10" />
                          <div className="mt-2 h-1.5 w-20 rounded-full bg-white/5" />
                        </div>

                        <span className="text-[10px] text-zinc-700">
                          2m
                        </span>
                      </div>

                      <div className="flex items-center gap-3 rounded-lg bg-white/[0.025] p-3">
                        <div className="h-8 w-8 rounded-lg bg-cyan-400/10" />

                        <div className="flex-1">
                          <div className="h-2 w-40 rounded-full bg-white/10" />
                          <div className="mt-2 h-1.5 w-24 rounded-full bg-white/5" />
                        </div>

                        <span className="text-[10px] text-zinc-700">
                          18m
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-400/10 bg-blue-400/[0.03] p-5">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-400" />

                      <p className="text-xs font-medium text-blue-300">
                        AI Assistant
                      </p>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-zinc-300">
                      “You have 3 related notes about your current project.
                      Want me to connect them?”
                    </p>

                    <div className="mt-5 rounded-lg border border-white/10 bg-black/10 px-3 py-2 text-[10px] text-zinc-600">
                      Ask anything about your workspace...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}