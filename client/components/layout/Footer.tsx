import Container from "./Container";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "About", href: "#about" },
];

const companyLinks = [
  { label: "Contact", href: "#contact" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

export default function Footer() {
  return (
    <footer className="bg-[#070708]">
      <Container>
        <div className="grid gap-12 border-b border-white/10 py-14 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <a
              href="/"
              className="text-xl font-semibold tracking-tight text-zinc-100"
            >
              Know<span className="text-blue-400">Flow</span>
            </a>

            <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-500">
              A connected workspace for your notes, ideas, documents, and
              intelligent knowledge discovery.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-200">
              Product
            </h3>

            <div className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-zinc-200">
              Company
            </h3>

            <div className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="block text-sm text-zinc-500 transition-colors hover:text-zinc-200"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 py-6 text-xs text-zinc-600 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 KnowFlow. All rights reserved.</p>

          <p>Built for better thinking.</p>
        </div>
      </Container>
    </footer>
  );
}