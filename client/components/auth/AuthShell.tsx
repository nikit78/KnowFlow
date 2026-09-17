import Link from "next/link";
import { ReactNode } from "react";
import {
  IconArrowRight,
  IconDocument,
  IconFolder,
  IconSearch,
  IconSpark,
} from "@/components/icons";

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-kf-bg">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        {/* Left brand panel */}
        <section className="relative hidden overflow-hidden border-r border-white/10 bg-[#115e59] lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:p-10 xl:p-12">
          {/* Background atmosphere */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
          >
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-[#14b8a6]/25 blur-3xl" />

            <div className="absolute right-[-100px] top-[34%] h-72 w-72 rounded-full border border-white/10" />

            <div className="absolute right-[-40px] top-[40%] h-56 w-56 rounded-full border border-white/10" />

            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.12))]" />
          </div>

          {/* Brand */}
          <Link
            href="/"
            className="relative z-10 w-fit text-xl font-bold tracking-[-0.025em] text-white"
          >
            Know<span className="text-teal-200">Flow</span>
          </Link>

          {/* Main message */}
          <div className="relative z-10 max-w-xl">
            <div className="max-w-lg rounded-3xl border border-white/15 bg-white/[0.08] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.12)] backdrop-blur-md xl:p-8">
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-teal-200" />

                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-100/80">
                  {eyebrow}
                </p>
              </div>

              <h1 className="mt-5 max-w-lg text-4xl font-bold leading-[1.08] tracking-[-0.035em] text-white xl:text-[2.8rem]">
                {title}
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-white/75 xl:text-[15px]">
                {description}
              </p>

              {/* Workflow preview */}
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                  Knowledge workflow
                </p>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  {[
                    {
                      label: "Upload",
                      icon: IconDocument,
                    },
                    {
                      label: "Organize",
                      icon: IconFolder,
                    },
                    {
                      label: "Search",
                      icon: IconSearch,
                    },
                    {
                      label: "Ask",
                      icon: IconSpark,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-white/10 bg-white/[0.06] px-2 py-3 text-center"
                    >
                      <item.icon
                        size={15}
                        className="mx-auto text-teal-100/80"
                      />

                      <p className="mt-2 text-[10px] font-medium text-white/65">
                        {item.label}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2 text-[11px] font-medium text-teal-100/70">
                  <span>Build your knowledge</span>
                  <IconArrowRight size={13} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <p className="relative z-10 text-[11px] font-medium tracking-wide text-white/45">
            Upload → Organize → Search → Ask → Understand
          </p>
        </section>

        {/* Right content */}
        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
          <div className="w-full max-w-md">
            {/* Mobile brand */}
            <div className="mb-10 lg:hidden">
              <Link
                href="/"
                className="text-xl font-bold tracking-[-0.025em] text-kf-ink"
              >
                Know<span className="text-kf-accent">Flow</span>
              </Link>
            </div>

            {children}
          </div>
        </section>
      </div>
    </main>
  );
}