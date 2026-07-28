import Container from "./Container";

export default function Navbar() {
  return (
    <header className="border-b border-gray-800">
      <Container>
        <nav className="flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">
            KnowFlow
          </h1>

          <ul className="flex items-center gap-8">
            <li>Features</li>
            <li>Pricing</li>
            <li>About</li>
            <li>Contact</li>
          </ul>
        </nav>
      </Container>
    </header>
  );
}