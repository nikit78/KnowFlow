import Container from "./Container";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090B]/80 backdrop-blur-xl">
      <Container>
        <nav className="flex h-16 items-center justify-between">
          <a
            href="/"
            className="text-lg font-semibold tracking-tight text-zinc-100 transition-colors hover:text-white"
          >
            Know<span className="text-blue-400">Flow</span>
          </a>

          <ul className="hidden items-center gap-8 md:flex">
            <li>
              <a
                href="#features"
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
              >
                Features
              </a>
            </li>

            <li>
              <a
                href="#pricing"
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
              >
                Pricing
              </a>
            </li>

            <li>
              <a
                href="#about"
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
              >
                About
              </a>
            </li>

            <li>
              <a
                href="#contact"
                className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
              >
                Contact
              </a>
            </li>
          </ul>

          <a
            href="/auth/login"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-zinc-200 transition-all hover:border-white/20 hover:bg-white/5"
          >
            Sign in
          </a>
        </nav>
      </Container>
    </header>
  );
}