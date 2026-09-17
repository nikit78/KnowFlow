import Button from "@/components/ui/Button";
import Container from "@/components/layout/Container";
import {
  IconArrowRight,
  IconDocument,
  IconFolder,
  IconSearch,
  IconSpark,
} from "@/components/icons";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-kf-border">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(circle_at_50%_0%,rgba(20,184,166,0.08),transparent_62%)]" />

      <Container>
        <div className="relative mx-auto max-w-4xl px-2 pb-14 pt-16 text-center sm:pt-20 md:pb-16 md:pt-24">
          <div className="kf-fade-up">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-kf-accent">
              KnowFlow
            </p>

            <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-bold tracking-[-0.035em] text-kf-ink sm:text-5xl md:text-[3.7rem] md:leading-[1.05]">
              Your knowledge, organized
              <span className="block">and ready to understand.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-kf-muted sm:text-lg sm:leading-8">
              Store your documents, organize your knowledge, search instantly,
              and ask AI questions grounded in the information you actually
              uploaded.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/auth/register" size="lg">
                Start building your knowledge
                <IconArrowRight size={16} />
              </Button>

              <Button href="/auth/login" variant="secondary" size="lg">
                Explore the workspace
              </Button>
            </div>
          </div>

          {/* Product preview */}
          <div
            className="relative mx-auto mt-12 max-w-5xl kf-fade-up sm:mt-14"
            style={{ animationDelay: "120ms" }}
          >
            <div className="relative overflow-hidden rounded-2xl border border-kf-border bg-kf-surface shadow-[0_24px_70px_rgba(15,23,42,0.10)]">
              {/* Browser chrome */}
              <div className="flex h-11 items-center justify-between border-b border-kf-border bg-kf-surface-muted/80 px-4">
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d6d3d1]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d6d3d1]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#d6d3d1]" />
                </div>

                <span className="hidden rounded-md border border-kf-border bg-kf-surface px-2.5 py-1 text-[10px] font-medium text-kf-muted sm:inline-flex">
                  knowflow.app/dashboard
                </span>

                <span className="w-10" />
              </div>

              <div className="grid min-h-[330px] md:grid-cols-[190px_1fr]">
                {/* Sidebar */}
                <aside className="hidden border-r border-kf-border bg-kf-surface p-4 md:block">
                  <p className="mb-6 text-sm font-bold text-kf-ink">
                    Know<span className="text-kf-accent">Flow</span>
                  </p>

                  <div className="space-y-1 text-xs">
                    <div className="rounded-lg bg-kf-accent-soft px-3 py-2.5 font-medium text-kf-accent-ink">
                      Overview
                    </div>

                    <div className="px-3 py-2.5 text-kf-muted">
                      Documents
                    </div>

                    <div className="px-3 py-2.5 text-kf-muted">
                      Collections
                    </div>

                    <div className="px-3 py-2.5 text-kf-muted">
                      Ask Knowledge
                    </div>
                  </div>
                </aside>

                {/* Main preview */}
                <div className="bg-[linear-gradient(180deg,#ffffff_0%,#f7f6f3_100%)] p-5 sm:p-7">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs text-kf-faint">Your workspace</p>

                      <h2 className="mt-1 text-lg font-semibold tracking-tight text-kf-ink">
                        Knowledge overview
                      </h2>
                    </div>

                    <div className="flex h-9 items-center gap-2 rounded-lg border border-kf-border bg-kf-surface px-3 text-xs text-kf-muted">
                      <IconSearch size={14} />
                      <span>Search your documents...</span>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        label: "Documents",
                        value: "Ready to explore",
                        icon: IconDocument,
                      },
                      {
                        label: "Collections",
                        value: "Organize by topic",
                        icon: IconFolder,
                      },
                      {
                        label: "Ask Knowledge",
                        value: "Answers with sources",
                        icon: IconSpark,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-xl border border-kf-border bg-kf-surface p-4 text-left transition-shadow duration-200 hover:shadow-sm"
                      >
                        <item.icon
                          size={16}
                          className="text-kf-accent"
                        />

                        <p className="mt-4 text-xs text-kf-muted">
                          {item.label}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-kf-ink">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border border-kf-border bg-kf-surface p-4 text-left">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-xs font-medium uppercase tracking-[0.12em] text-kf-faint">
                        Knowledge workflow
                      </p>

                      <span className="text-xs font-medium text-kf-accent">
                        Your workspace
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-semibold tracking-wide text-kf-ink">
                      UPLOAD{" "}
                      <span className="text-kf-faint">→</span>{" "}
                      ORGANIZE{" "}
                      <span className="text-kf-faint">→</span>{" "}
                      SEARCH{" "}
                      <span className="text-kf-faint">→</span>{" "}
                      ASK{" "}
                      <span className="text-kf-faint">→</span>{" "}
                      UNDERSTAND
                    </p>

                    <p className="mt-2 max-w-2xl text-xs leading-5 text-kf-muted">
                      Turn uploaded files into searchable knowledge and ask
                      questions using the information inside your workspace.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}