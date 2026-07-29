import Container from "../layout/Container";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-white/5">
      <div className="absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />

      <Container>
        <div className="mx-auto max-w-4xl py-24 text-center md:py-32">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-zinc-300">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            Your knowledge, organized intelligently
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-zinc-100 sm:text-6xl md:text-7xl">
            Build your
            <span className="block text-blue-400">
              second brain.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-zinc-400 sm:text-lg">
            KnowFlow helps you capture, organize, and discover
            your knowledge without losing the ideas that matter.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button>Get Started</Button>

            <button
              type="button"
              className="rounded-lg border border-white/10 px-6 py-3 text-sm font-medium text-zinc-300 transition-all duration-200 hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              Explore Features
            </button>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-sm font-medium text-zinc-200">
                Capture
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Keep important ideas in one place.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-sm font-medium text-zinc-200">
                Connect
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Discover relationships between your knowledge.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <p className="text-sm font-medium text-zinc-200">
                Discover
              </p>
              <p className="mt-1 text-xs leading-5 text-zinc-500">
                Find the information you need faster.
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}