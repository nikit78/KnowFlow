import Container from "./Container";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "About", href: "#about" },
  ],
  Account: [
    { label: "Log in", href: "/auth/login" },
    { label: "Create account", href: "/auth/register" },
  ],
  Legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#09090B]">
      <Container>
        <div className="grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <a
              href="/"
              className="text-xl font-semibold tracking-tight text-zinc-100"
            >
              Know<span className="text-blue-400">Flow</span>
            </a>

            <p className="mt-4 text-sm leading-6 text-zinc-500">
              A calm, connected workspace for your notes, documents, ideas,
              and everything worth remembering.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-green-400" />

              <span className="text-[11px] text-zinc-600">
                All systems operational
              </span>
            </div>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                {title}
              </h3>

              <ul className="mt-5 space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-zinc-600 transition-colors hover:text-zinc-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-white/5 py-6 text-xs text-zinc-700 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 KnowFlow. All rights reserved.</p>

          <p>Built for better thinking.</p>
        </div>
      </Container>
    </footer>
  );
}