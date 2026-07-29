import Container from "../layout/Container";

const stats = [
  {
    value: "10K+",
    label: "Notes Managed",
  },
  {
    value: "5K+",
    label: "Active Users",
  },
  {
    value: "99.9%",
    label: "System Uptime",
  },
  {
    value: "24/7",
    label: "AI Assistance",
  },
];

export default function Stats() {
  return (
    <section className="border-b border-white/5 py-16 md:py-20">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4">
          {stats.map((item, index) => (
            <div
              key={item.label}
              className={`px-5 py-6 text-center md:px-8 ${
                index !== 0 ? "border-l border-white/10" : ""
              }`}
            >
              <p className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
                {item.value}
              </p>

              <p className="mt-2 text-xs uppercase tracking-wider text-zinc-500 sm:text-sm">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}