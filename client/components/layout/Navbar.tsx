"use client";

import Link from "next/link";
import { useState } from "react";
import Container from "./Container";
import Button from "@/components/ui/Button";
import { IconClose, IconMenu } from "@/components/icons";

const navigation = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Ask AI", href: "#ask-ai" },
  { label: "Security", href: "#security" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-kf-border/80 bg-[#f7f6f3]/90 backdrop-blur-xl">
      <Container>
        <nav
          aria-label="Main navigation"
          className="flex min-h-[68px] items-center justify-between"
        >
          {/* Brand */}
          <Link
            href="/"
            onClick={closeMenu}
            className="group flex items-center text-lg font-bold tracking-[-0.02em] text-kf-ink"
          >
            Know
            <span className="text-kf-accent transition-colors duration-200 group-hover:text-kf-accent-ink">
              Flow
            </span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden items-center gap-7 md:flex">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="relative py-2 text-sm font-medium text-kf-muted transition-colors duration-200 hover:text-kf-ink"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <Button href="/auth/login" variant="ghost" size="sm">
              Log in
            </Button>

            <Button href="/auth/register" size="sm">
              Get started
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-kf-border bg-kf-surface text-kf-ink transition-all duration-200 hover:border-kf-accent/40 hover:bg-kf-surface-muted focus:outline-none focus:ring-2 focus:ring-kf-accent/30 md:hidden"
          >
            {menuOpen ? <IconClose size={18} /> : <IconMenu size={18} />}
          </button>
        </nav>

        {/* Mobile navigation */}
        <div
          id="mobile-navigation"
          className={`overflow-hidden transition-[max-height,opacity] duration-200 md:hidden ${
            menuOpen
              ? "max-h-[420px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="border-t border-kf-border py-4">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={closeMenu}
                  className="rounded-xl px-3 py-3 text-sm font-medium text-kf-ink-soft transition-colors duration-200 hover:bg-kf-surface-muted hover:text-kf-ink"
                >
                  {item.label}
                </a>
              ))}

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-kf-border pt-4">
                <Button
                  href="/auth/login"
                  variant="secondary"
                  size="sm"
                  onClick={closeMenu}
                >
                  Log in
                </Button>

                <Button
                  href="/auth/register"
                  size="sm"
                  onClick={closeMenu}
                >
                  Get started
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
}