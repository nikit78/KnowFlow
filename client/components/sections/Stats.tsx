import Container from "../layout/Container";

const stats = [
  {
    value: "10K+",
    label: "Notes organized",
  },
  {
    value: "5K+",
    label: "Active thinkers",
  },
  {
    value: "99.9%",
    label: "Platform uptime",
  },
  {
    value: "24/7",
    label: "AI availability",
  },
];

export default function Stats() {
  return (
    <section className="border-b border-white/5 py-20 md:py-24">
      <Container>
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111113]">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`relative p-6 text-center sm:p-8 ${
                  index < stats.length - 1
                    ? "border-b border-white/10 md:border-b-0 md:border-r"
                    : ""
                } ${
                  index === 1
                    ? "border-l border-white/10 md:border-l-0"
                    : ""
                } ${
                  index === 2
                    ? "md:border-l-0"
                    : ""
                }`}
              >
                <p className="text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-zinc-500 sm:text-sm">
                  {stat.label}
                </p>

                <div className="mx-auto mt-5 h-px w-8 bg-blue-400/30" />
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-700">
          Built for people who want their knowledge to work harder.
        </p>
      </Container>
    </section>
  );
}