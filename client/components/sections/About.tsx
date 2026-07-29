import Container from "../layout/Container";

const highlights = [
  {
    number: "01",
    title: "Capture",
    description:
      "Save notes, documents, ideas, and useful information without breaking your flow.",
  },
  {
    number: "02",
    title: "Connect",
    description:
      "Bring related information together so your knowledge becomes easier to navigate.",
  },
  {
    number: "03",
    title: "Discover",
    description:
      "Use intelligent search and AI assistance to find answers when you need them.",
  },
];

export default function About() {
  return (
    <section id="about" className="border-b border-white/5 py-24 md:py-32">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">
              About KnowFlow
            </p>

            <h2 className="mt-5 text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl md:text-5xl">
              A calmer way to
              <span className="text-zinc-500"> manage what you know.</span>
            </h2>

            <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400">
              KnowFlow brings your notes, documents, ideas, and AI assistance
              into one connected workspace. Instead of jumping between
              different tools, your knowledge stays together and grows with
              you.
            </p>

            <div className="mt-9 flex items-center gap-4">
              <div className="h-px w-12 bg-blue-400/60" />

              <p className="text-sm text-zinc-500">
                Capture. Connect. Discover.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-blue-500/5 blur-2xl" />

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#111113] shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                </div>

                <span className="text-xs text-zinc-600">
                  KnowFlow Workspace
                </span>
              </div>

              <div className="grid min-h-[360px] grid-cols-[150px_1fr]">
                <aside className="border-r border-white/10 bg-white/[0.02] p-4">
                  <div className="mb-7 text-sm font-semibold text-zinc-200">
                    KnowFlow
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="rounded-lg bg-blue-500/10 px-3 py-2 text-blue-300">
                      All Notes
                    </div>

                    <div className="px-3 py-2 text-zinc-500">
                      Projects
                    </div>

                    <div className="px-3 py-2 text-zinc-500">
                      Ideas
                    </div>

                    <div className="px-3 py-2 text-zinc-500">
                      Documents
                    </div>
                  </div>
                </aside>

                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">
                        Knowledge workspace
                      </p>

                      <h3 className="mt-1 text-lg font-semibold text-zinc-100">
                        Your second brain
                      </h3>
                    </div>

                    <div className="rounded-lg border border-white/10 px-3 py-2 text-xs text-zinc-400">
                      Search
                    </div>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                      <div className="mb-4 h-2 w-16 rounded-full bg-blue-400/40" />
                      <div className="h-2 w-full rounded-full bg-white/5" />
                      <div className="mt-2 h-2 w-4/5 rounded-full bg-white/5" />
                      <div className="mt-5 text-[11px] text-zinc-600">
                        Product ideas
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                      <div className="mb-4 h-2 w-20 rounded-full bg-cyan-400/30" />
                      <div className="h-2 w-full rounded-full bg-white/5" />
                      <div className="mt-2 h-2 w-3/5 rounded-full bg-white/5" />
                      <div className="mt-5 text-[11px] text-zinc-600">
                        Research notes
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4 sm:col-span-2">
                      <div className="mb-4 flex items-center justify-between">
                        <div className="h-2 w-24 rounded-full bg-violet-400/30" />
                        <div className="h-5 w-16 rounded-md bg-white/5" />
                      </div>

                      <div className="h-2 w-full rounded-full bg-white/5" />
                      <div className="mt-2 h-2 w-11/12 rounded-full bg-white/5" />
                      <div className="mt-2 h-2 w-2/3 rounded-full bg-white/5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid border-y border-white/10 md:grid-cols-3">
          {highlights.map((item, index) => (
            <div
              key={item.number}
              className={`py-7 md:px-7 ${
                index !== 0 ? "border-t border-white/10 md:border-l md:border-t-0" : ""
              }`}
            >
              <span className="text-xs font-semibold tracking-widest text-blue-400">
                {item.number}
              </span>

              <h3 className="mt-3 text-lg font-semibold text-zinc-100">
                {item.title}
              </h3>

              <p className="mt-2 text-sm leading-6 text-zinc-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}