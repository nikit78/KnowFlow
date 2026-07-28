import Container from "./Container";

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 py-10">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-400">
            © 2026 KnowFlow. All rights reserved.
          </p>

          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </Container>
    </footer>
  );
}