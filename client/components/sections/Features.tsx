import Container from "../layout/Container";
import FeatureCard from "../common/FeatureCard";

const features = [
  {
    title: "AI Search",
    description:
      "Find your notes instantly using AI-powered search.",
  },
  {
    title: "Smart Organization",
    description:
      "Keep all knowledge organized automatically.",
  },
  {
    title: "Secure Storage",
    description:
      "Your data stays protected and encrypted.",
  },
];

export default function Features() {
  return (
    <section className="py-20">
      <Container>
        <div className="text-center">
          <h2 className="text-4xl font-bold">
            Features
          </h2>

          <p className="mt-4 text-gray-400">
            Everything you need to manage knowledge.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
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