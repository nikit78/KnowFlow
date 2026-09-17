import Container from "@/components/layout/Container";
import Button from "@/components/ui/Button";
import {
  IconArrowRight,
  IconCheck,
  IconDocument,
  IconFolder,
  IconLock,
  IconSearch,
  IconSpark,
  IconStar,
  IconNote,
  IconTrash,
} from "@/components/icons";

export default function About() {
  return (
    <>
      {/* AI Knowledge Assistant */}
      <section id="ask-ai" className="border-b border-kf-border py-16 md:py-20">
        <Container>
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-kf-border bg-kf-surface px-3 py-1.5">
                <IconSpark size={14} className="text-kf-accent" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-kf-accent">
                  AI Knowledge Assistant
                </span>
              </div>

              <h2 className="mt-5 text-3xl font-bold tracking-[-0.025em] text-kf-ink sm:text-4xl">
                Ask questions. Understand your documents.
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-kf-muted">
                KnowFlow retrieves relevant passages from your uploaded
                documents and uses them to generate answers you can verify
                against the original sources.
              </p>

              <div className="mt-7 space-y-3">
                {[
                  "Answers are grounded in your uploaded knowledge",
                  "Relevant source documents are shown with the answer",
                  "Review the supporting excerpts before trusting the result",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-kf-accent-soft">
                      <IconCheck size={12} className="text-kf-accent" />
                    </div>

                    <p className="text-sm leading-6 text-kf-ink-soft">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button href="/auth/register">
                  Try Ask Knowledge
                  <IconArrowRight size={15} />
                </Button>
              </div>
            </div>

            {/* Answer preview */}
            <div className="relative">
              <div className="absolute -inset-4 rounded-[28px] bg-kf-accent-soft/40 blur-2xl" />

              <div className="relative overflow-hidden rounded-2xl border border-kf-border bg-kf-surface shadow-[0_20px_55px_rgba(15,23,42,0.08)]">
                <div className="border-b border-kf-border bg-kf-surface-muted/60 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <IconSearch size={14} className="text-kf-muted" />

                    <p className="text-sm font-medium text-kf-ink">
                      What did my lecture notes say about normalization?
                    </p>
                  </div>
                </div>

                <div className="space-y-6 p-5 sm:p-6">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-kf-faint">
                      Answer
                    </p>

                    <p className="mt-2 text-sm leading-6 text-kf-ink-soft">
                      Normalization reduces redundancy by organizing data into
                      related tables. Your notes highlight 1NF, 2NF, and 3NF as
                      progressive steps for cleaner database design.
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-kf-faint">
                        Sources
                      </p>

                      <span className="text-[10px] font-medium text-kf-accent">
                        2 documents
                      </span>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="rounded-xl border border-kf-border bg-kf-bg p-4">
                        <div className="flex items-start gap-3">
                          <IconDocument
                            size={15}
                            className="mt-0.5 shrink-0 text-kf-accent"
                          />

                          <div>
                            <p className="text-sm font-medium text-kf-ink">
                              DBMS Lecture Notes.pdf
                            </p>

                            <p className="mt-1 text-xs leading-5 text-kf-muted">
                              “3NF removes transitive dependencies so non-key
                              attributes depend only on the primary key.”
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-xl border border-kf-border bg-kf-bg p-4">
                        <div className="flex items-start gap-3">
                          <IconDocument
                            size={15}
                            className="mt-0.5 shrink-0 text-kf-accent"
                          />

                          <div>
                            <p className="text-sm font-medium text-kf-ink">
                              Database Design Summary.md
                            </p>

                            <p className="mt-1 text-xs leading-5 text-kf-muted">
                              “Normalization improves integrity and simplifies
                              updates across related entities.”
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Document intelligence + organization */}
      <section className="border-b border-kf-border py-16 md:py-20">
        <Container>
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-kf-border bg-kf-surface p-7">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-kf-border bg-kf-surface-muted">
                  <IconDocument size={20} className="text-kf-accent" />
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-kf-faint">
                  Document intelligence
                </span>
              </div>

              <h2 className="mt-7 text-2xl font-bold tracking-tight text-kf-ink">
                Documents become searchable knowledge
              </h2>

              <p className="mt-4 text-sm leading-6 text-kf-muted">
                After upload, KnowFlow extracts text, prepares the content for
                search, and makes it available for AI questions. You stay
                focused on the knowledge — not the pipeline.
              </p>

              <div className="mt-7 space-y-3">
                {[
                  "Supports PDF, DOCX, TXT, and Markdown",
                  "Clear processing states from upload to completion",
                  "Preview extracted content from document details",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl border border-kf-border bg-kf-bg px-4 py-3"
                  >
                    <IconCheck size={14} className="shrink-0 text-kf-accent" />
                    <span className="text-sm text-kf-ink-soft">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-kf-border bg-kf-surface p-7">
              <div className="flex items-start justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-kf-border bg-kf-surface-muted">
                  <IconFolder size={20} className="text-kf-accent" />
                </div>

                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-kf-faint">
                  Organization
                </span>
              </div>

              <h2 className="mt-7 text-2xl font-bold tracking-tight text-kf-ink">
                Keep related knowledge together
              </h2>

              <p className="mt-4 text-sm leading-6 text-kf-muted">
                Organize your workspace without forcing everything into a
                complicated hierarchy. Group related files, mark important
                documents, and capture insights as you work.
              </p>

              <div className="mt-7 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {[
                  {
                    title: "Collections",
                    icon: IconFolder,
                  },
                  {
                    title: "Favorites",
                    icon: IconStar,
                  },
                  {
                    title: "Notes",
                    icon: IconNote,
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="flex items-center gap-3 rounded-xl border border-kf-border bg-kf-bg px-4 py-3"
                  >
                    <item.icon size={15} className="text-kf-accent" />
                    <span className="text-sm font-medium text-kf-ink-soft">
                      {item.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Security */}
      <section
        id="security"
        className="border-b border-kf-border py-16 md:py-20"
      >
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-kf-border bg-kf-surface">
              <IconLock size={19} className="text-kf-accent" />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-kf-accent">
              Trust & access
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-kf-ink sm:text-4xl">
              Your knowledge stays scoped to your account
            </h2>

            <p className="mt-4 text-base leading-7 text-kf-muted">
              KnowFlow uses authenticated APIs, httpOnly cookie sessions, and
              user-scoped queries so workspace data stays separated between
              accounts.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Authenticated access",
                text: "Email/password and Google sign-in use authenticated sessions.",
              },
              {
                title: "Protected APIs",
                text: "Document, collection, note, and Ask Knowledge routes require authentication.",
              },
              {
                title: "User-scoped data",
                text: "Queries are restricted to the signed-in user's workspace.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-kf-border bg-kf-surface p-6"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-kf-accent-soft">
                  <IconLock size={15} className="text-kf-accent" />
                </div>

                <h3 className="mt-5 text-base font-semibold text-kf-ink">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-kf-muted">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-20">
        <Container>
          <div className="relative overflow-hidden rounded-3xl border border-kf-accent/20 bg-[linear-gradient(135deg,#134e4a_0%,#0f766e_55%,#0d9488_100%)] px-7 py-12 text-center text-white shadow-[0_22px_55px_rgba(15,23,42,0.12)] sm:px-10 md:py-14">
            <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-black/10 blur-3xl" />

            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                Start with your knowledge
              </p>

              <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
                Turn your documents into a workspace you can understand.
              </h2>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
                Create an account, upload your first file, and explore your
                documents with search and source-grounded AI answers.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button
                  href="/auth/register"
                  className="!bg-white !text-kf-accent-ink hover:!bg-kf-accent-soft"
                  size="lg"
                >
                  Start building your knowledge
                  <IconArrowRight size={16} />
                </Button>

                <Button
                  href="/auth/login"
                  variant="secondary"
                  size="lg"
                  className="!border-white/30 !bg-transparent !text-white hover:!bg-white/10"
                >
                  Log in
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}