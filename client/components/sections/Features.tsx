import Container from "../layout/Container";
import FeatureCard from "../common/FeatureCard";

const features = [
  {
    number: "01",
    title: "AI-powered search",
    description:
      "Find the exact note, idea, or document you need without digging through folders.",
    icon: "⌕",
  },
  {
    number: "02",
    title: "Connected knowledge",
    description:
      "Keep related notes, documents, and ideas connected so your knowledge grows with you.",
    icon: "◈",
  },
  {
    number: "03",
    title: "A calmer workspace",
    description:
      "A focused workspace designed to help you think clearly instead of managing another complicated tool.",
    icon: "✦",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="border-b border-white/5 py-24 md:py-28"
    >
      <Container>
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
            Why KnowFlow
          </span>

          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-100 sm:text-4xl">
            Everything you need to make
            <span className="text-zinc-500"> knowledge useful.</span>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-500">
            KnowFlow brings your notes, documents, and ideas into one
            connected workspace built around how you actually think.
          </p>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.number}
              number={feature.number}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}