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
    <section className="py-24">
      <Container>
        <div className="grid gap-8 grid-cols-2 md:grid-cols-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-gray-800 p-8 text-center"
            >
              <h3 className="text-4xl font-bold text-white">
                {item.value}
              </h3>

              <p className="mt-3 text-gray-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}