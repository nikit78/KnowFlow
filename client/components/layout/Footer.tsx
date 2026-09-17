import Link from "next/link";
import Container from "./Container";
import {
  IconArrowRight,
  IconDocument,
  IconFolder,
  IconSpark,
} from "@/components/icons";

const footerLinks = {
  Product: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Ask Knowledge", href: "#ask-ai" },
  ],
  Account: [
    { label: "Log in", href: "/auth/login" },
    { label: "Create account", href: "/auth/register" },
  ],
  Workspace: [
    {
      label: "Documents",
      href: "/dashboard/documents",
      icon: IconDocument,
    },
    {
      label: "Collections",
      href: "/dashboard/collections",
      icon: IconFolder,
    },
    {
      label: "Ask Knowledge",
      href: "/dashboard/ask",
      icon: IconSpark,
    },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-kf-border bg-kf-surface">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:py-16">
          {/* Brand */}
          <div className="max-w-sm">
            <Link
              href="/"
              className="group inline-flex text-lg font-bold tracking-[-0.02em] text-kf-ink"
            >
              Know
              <span className="text-kf-accent transition-colors duration-200 group-hover:text-kf-accent-ink">
                Flow
              </span>
            </Link>

            <p className="mt-4 text-sm leading-6 text-kf-muted">
              Upload documents, organize knowledge, search instantly, and ask
              questions grounded in the information you actually stored.
            </p>

            <Link
              href="/auth/register"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-kf-accent transition-colors hover:text-kf-accent-ink"
            >
              Start building your knowledge
              <IconArrowRight size={14} />
            </Link>
          </div>

          {/* Product & Account */}
          {Object.entries(footerLinks)
            .filter(([title]) => title !== "Workspace")
            .map(([title, links]) => (
              <div key={title}>
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-kf-ink">
                  {title}
                </h3>

                <ul className="mt-4 space-y-2.5">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-kf-muted transition-colors duration-200 hover:text-kf-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          {/* Workspace */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-kf-ink">
              Workspace
            </h3>

            <div className="mt-4 space-y-2">
              {footerLinks.Workspace.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group -mx-2 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors duration-200 hover:bg-kf-surface-muted"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-kf-border bg-kf-bg">
                    <item.icon
                      size={13}
                      className="text-kf-accent transition-transform duration-200 group-hover:scale-105"
                    />
                  </span>

                  <span className="text-sm text-kf-muted transition-colors duration-200 group-hover:text-kf-ink">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col gap-4 border-t border-kf-border py-5 text-xs text-kf-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} KnowFlow. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Upload</span>
            <span aria-hidden="true">→</span>
            <span>Organize</span>
            <span aria-hidden="true">→</span>
            <span>Search</span>
            <span aria-hidden="true">→</span>
            <span>Ask</span>
            <span aria-hidden="true">→</span>
            <span>Understand</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}