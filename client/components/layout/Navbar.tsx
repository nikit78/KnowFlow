"use client";

import { useState } from "react";
import Container from "./Container";

const navigation = [
  {
    label: "Features",
    href: "#features",
  },
  {
    label: "About",
    href: "#about",
  },
  {
    label: "Pricing",
    href: "#pricing",
  },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#09090B]/85 backdrop-blur-xl">
      <Container>
        <nav className="flex h-[72px] items-center justify-between">
          <a
            href="/"
            className="text-xl font-semibold tracking-tight text-zinc-100"
          >
            Know<span className="text-blue-400">Flow</span>
          </a>

          <div className="hidden items-center gap-8 md:flex">
            {navigation.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-zinc-500 transition-colors hover:text-zinc-100"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href="/auth/login"
              className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-100"
            >
              Log in
            </a>

            <a
              href="/auth/register"
              className="rounded-lg bg-[#4F6BFF] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#4058E8] hover:shadow-lg hover:shadow-blue-500/10"
            >
              Get started
            </a>
          </div>

          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 text-zinc-300 transition hover:bg-white/5 md:hidden"
          >
            <span className="sr-only">Open menu</span>

            <div className="space-y-1.5">
              <span
                className={`block h-px w-5 bg-current transition-transform ${
                  menuOpen ? "translate-y-2 rotate-45" : ""
                }`}
              />

              <span
                className={`block h-px w-5 bg-current transition-opacity ${
                  menuOpen ? "opacity-0" : ""
                }`}
              />

              <span
                className={`block h-px w-5 bg-current transition-transform ${
                  menuOpen ? "-translate-y-1.5 -rotate-45" : ""
                }`}
              />
            </div>
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-white/5 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {navigation.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-3 text-sm text-zinc-400 transition-colors hover:bg-white/[0.04] hover:text-zinc-100"
                >
                  {item.label}
                </a>
              ))}

              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/5 pt-4">
                <a
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg border border-white/10 px-4 py-2.5 text-center text-sm font-medium text-zinc-300 transition hover:bg-white/5"
                >
                  Log in
                </a>

                <a
                  href="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg bg-[#4F6BFF] px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-[#4058E8]"
                >
                  Get started
                </a>
              </div>
            </div>
          </div>
        )}
      </Container>
    </header>
  );
}