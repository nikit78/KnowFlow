import Container from "../layout/Container";

const points = [
  {
    title: "Capture without friction",
    description:
      "Save thoughts, notes, and useful information without breaking your flow.",
  },
  {
    title: "Connect what matters",
    description:
      "Turn scattered information into a connected knowledge base you can actually use.",
  },
  {
    title: "Ask instead of searching",
    description:
      "Use your knowledge with natural questions instead of remembering where everything lives.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="border-b border-white/5 py-24 md:py-32"
    >
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400">
              Built around your thinking
            </span>

            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
              Your knowledge should feel
              <span className="text-zinc-500"> connected.</span>
            </h2>

            <p className="mt-6 text-base leading-7 text-zinc-500">
              Most productivity tools help you store information. KnowFlow
              goes one step further by helping you connect, understand, and
              reuse the knowledge you already have.
            </p>

            <div className="mt-9 space-y-6">
              {points.map((point, index) => (
                <div key={point.title} className="flex gap-4">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-xs font-medium text-zinc-400">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-zinc-200">
                      {point.title}
                    </h3>

                    <p className="mt-1.5 text-sm leading-6 text-zinc-500">
                      {point.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-cyan-400/[0.04] blur-3xl" />

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111113] shadow-[0_24px_70px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <p className="text-xs text-zinc-600">
                    Knowledge graph
                  </p>

                  <p className="mt-1 text-sm font-medium text-zinc-200">
                    Project research
                  </p>
                </div>

                <span className="rounded-full border border-cyan-400/10 bg-cyan-400/[0.05] px-2.5 py-1 text-[10px] text-cyan-300">
                  Connected
                </span>
              </div>

              <div className="relative min-h-[360px] overflow-hidden p-6">
                <div className="absolute left-1/2 top-1/2 h-px w-[65%] -translate-x-1/2 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent" />

                <div className="absolute left-1/2 top-[34%] h-[48%] w-px -translate-x-1/2 bg-cyan-400/10" />

                <div className="absolute left-[28%] top-[30%] h-px w-[45%] rotate-[20deg] bg-white/5" />

                <div className="absolute left-[28%] top-[70%] h-px w-[45%] -rotate-[20deg] bg-white/5" />

                <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/[0.07] text-center shadow-[0_0_40px_rgba(79,107,255,0.08)]">
                  <div>
                    <div className="mx-auto h-2 w-2 rounded-full bg-blue-400" />
                    <p className="mt-2 text-xs font-medium text-blue-200">
                      Core idea
                    </p>
                  </div>
                </div>

                <div className="absolute left-[10%] top-[18%] rounded-xl border border-white/10 bg-[#18181B] px-4 py-3">
                  <p className="text-[10px] text-zinc-600">
                    Note
                  </p>
                  <p className="mt-1 text-xs text-zinc-300">
                    Product vision
                  </p>
                </div>

                <div className="absolute right-[8%] top-[25%] rounded-xl border border-white/10 bg-[#18181B] px-4 py-3">
                  <p className="text-[10px] text-zinc-600">
                    Document
                  </p>
                  <p className="mt-1 text-xs text-zinc-300">
                    Research notes
                  </p>
                </div>

                <div className="absolute bottom-[18%] left-[12%] rounded-xl border border-white/10 bg-[#18181B] px-4 py-3">
                  <p className="text-[10px] text-zinc-600">
                    Idea
                  </p>
                  <p className="mt-1 text-xs text-zinc-300">
                    User insights
                  </p>
                </div>

                <div className="absolute bottom-[15%] right-[10%] rounded-xl border border-white/10 bg-[#18181B] px-4 py-3">
                  <p className="text-[10px] text-zinc-600">
                    AI insight
                  </p>
                  <p className="mt-1 text-xs text-cyan-300">
                    4 connections found
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-5 left-6 rounded-xl border border-white/10 bg-[#18181B] px-4 py-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="flex -space-x-1.5">
                  <span className="h-6 w-6 rounded-full border-2 border-[#18181B] bg-blue-400/40" />
                  <span className="h-6 w-6 rounded-full border-2 border-[#18181B] bg-cyan-400/30" />
                  <span className="h-6 w-6 rounded-full border-2 border-[#18181B] bg-violet-400/30" />
                </div>

                <div>
                  <p className="text-xs font-medium text-zinc-200">
                    24 connections
                  </p>

                  <p className="text-[10px] text-zinc-600">
                    discovered this week
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}