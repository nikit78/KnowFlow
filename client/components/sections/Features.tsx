import Container from "../layout/Container";
import FeatureCard from "../common/FeatureCard";

const features = [
  {
    title: "AI Search",
    description:
      "Find the right note, idea, or piece of information without digging through folders.",
  },
  {
    title: "Smart Organization",
    description:
      "Keep your knowledge structured and connected so important ideas are easier to revisit.",
  },
  {
    title: "Secure Storage",
    description:
      "Keep your personal knowledge in a secure workspace designed around privacy and control.",
  },
];

export default function Features() {
  return (
    <section className="border-b border-white/5 py-24 md:py-28">
      <Container>
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">
            Core features
          </p>

          <h2 className="text-3xl font-bold tracking-tight text-zinc-100 sm:text-4xl">
            Everything you need to
            <span className="text-zinc-500">
              {" "}work with your knowledge.
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
            KnowFlow brings your notes, ideas, and information
            into a workspace that feels simple to use and easy to grow.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}