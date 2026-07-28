import Container from "../layout/Container";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="py-20">
      <Container>
        <h1 className="text-5xl font-bold">
          Welcome to KnowFlow
        </h1>

        <p className="mt-6 text-gray-400">
          Build your second brain with AI.
        </p>

        <div className="mt-8">
          <Button>Get Started</Button>
        </div>
      </Container>
    </section>
  );
}