import Container from "@/components/layout/Container";
import {
  IconDocument,
  IconFolder,
  IconNote,
  IconSearch,
  IconSpark,
  IconStar,
  IconTrash,
  IconUpload,
} from "@/components/icons";

const steps = [
  {
    title: "Upload",
    description:
      "Add PDFs, DOCX, TXT, or Markdown files to your private workspace.",
    icon: IconUpload,
  },
  {
    title: "Organize",
    description:
      "Group documents into collections, tag them, and keep notes nearby.",
    icon: IconFolder,
  },
  {
    title: "Search",
    description:
      "Find what you need by title, content, tags, or document type.",
    icon: IconSearch,
  },
  {
    title: "Ask",
    description:
      "Ask questions and get answers grounded in your uploaded knowledge.",
    icon: IconSpark,
  },
  {
    title: "Understand",
    description:
      "Review sources, excerpts, and context so every answer stays trustworthy.",
    icon: IconDocument,
  },
];

const features = [
  {
    title: "Document management",
    description:
      "Upload, preview, download, and track processing status from one workspace.",
    icon: IconDocument,
  },
  {
    title: "Smart search",
    description:
      "Locate documents quickly with filters for type, status, tags, and favorites.",
    icon: IconSearch,
  },
  {
    title: "Collections",
    description:
      "Create focused folders for research, courses, reports, or projects.",
    icon: IconFolder,
  },
  {
    title: "Notes",
    description:
      "Capture summaries and insights alongside the documents you are studying.",
    icon: IconNote,
  },
  {
    title: "Favorites",
    description:
      "Star important knowledge so you can return to it without searching again.",
    icon: IconStar,
  },
  {
    title: "Trash & recovery",
    description:
      "Soft-delete safely, restore when needed, or permanently remove files.",
    icon: IconTrash,
  },
  {
    title: "AI Knowledge Assistant",
    description:
      "Ask questions and inspect the source documents used to form each answer.",
    icon: IconSpark,
  },
];

export default function Features() {
  return (
    <>
      {/* How it works */}
      <section
        id="how-it-works"
        className="border-b border-kf-border py-16 md:py-20"
      >
        <Container>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kf-accent">
              How it works
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-kf-ink sm:text-4xl">
              From files to understanding
            </h2>

            <p className="mt-4 text-base leading-7 text-kf-muted">
              KnowFlow follows a clear path: upload your material, organize it,
              search it, and ask AI questions about it.
            </p>
          </div>

          {/* Workflow */}
          <div className="relative mt-10 md:mt-12">
            {/* Desktop connector */}
            <div
              aria-hidden="true"
              className="absolute left-[10%] right-[10%] top-[34px] hidden h-px bg-kf-border md:block"
            />

            <div className="grid gap-3 md:grid-cols-5 md:gap-4">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="group relative z-10 rounded-2xl border border-kf-border bg-kf-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-kf-accent/30 hover:shadow-[0_12px_30px_rgba(15,23,42,0.06)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-kf-border bg-kf-surface-muted">
                      <step.icon
                        size={17}
                        className="text-kf-accent"
                      />
                    </div>

                    <span className="text-[11px] font-semibold tracking-wide text-kf-faint">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-kf-ink">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-kf-muted">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Core features */}
<section
  id="features"
  className="border-b border-kf-border py-16 md:py-20"
>
  <Container>
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-kf-accent">
          Core features
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-kf-ink sm:text-4xl">
          Everything you need to manage knowledge
        </h2>

        <p className="mt-4 text-base leading-7 text-kf-muted">
          A focused workspace for storing, organizing, finding, and
          understanding the information that matters to you.
        </p>
      </div>

      <p className="hidden max-w-xs text-right text-xs leading-5 text-kf-faint md:block">
        One workspace for documents, notes, collections, search, and
        source-grounded AI answers.
      </p>
    </div>

    <div className="mt-10 grid gap-4 md:mt-12 md:grid-cols-2 xl:grid-cols-3">
      {/* Document management */}
      <div className="group relative overflow-hidden rounded-2xl border border-kf-border bg-kf-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-kf-accent/30 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-kf-border bg-kf-surface-muted">
            <IconDocument size={19} className="text-kf-accent" />
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-kf-faint">
            Workspace
          </span>
        </div>

        <h3 className="mt-7 text-lg font-semibold tracking-tight text-kf-ink">
          Document management
        </h3>

        <p className="mt-2 text-sm leading-6 text-kf-muted">
          Upload, preview, download, and track document processing from one
          workspace.
        </p>
      </div>

      {/* Smart search */}
      <div className="group relative overflow-hidden rounded-2xl border border-kf-border bg-kf-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-kf-accent/30 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-kf-border bg-kf-surface-muted">
            <IconSearch size={19} className="text-kf-accent" />
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-kf-faint">
            Discovery
          </span>
        </div>

        <h3 className="mt-7 text-lg font-semibold tracking-tight text-kf-ink">
          Smart search
        </h3>

        <p className="mt-2 text-sm leading-6 text-kf-muted">
          Find documents using titles, content, tags, document types, and
          workspace filters.
        </p>
      </div>

      {/* Collections */}
      <div className="group relative overflow-hidden rounded-2xl border border-kf-border bg-kf-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-kf-accent/30 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-kf-border bg-kf-surface-muted">
            <IconFolder size={19} className="text-kf-accent" />
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-kf-faint">
            Organization
          </span>
        </div>

        <h3 className="mt-7 text-lg font-semibold tracking-tight text-kf-ink">
          Collections
        </h3>

        <p className="mt-2 text-sm leading-6 text-kf-muted">
          Create focused collections for courses, research, reports, projects,
          or any topic you want to keep together.
        </p>
      </div>

      {/* Notes */}
      <div className="group relative overflow-hidden rounded-2xl border border-kf-border bg-kf-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-kf-accent/30 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-kf-border bg-kf-surface-muted">
            <IconNote size={19} className="text-kf-accent" />
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-kf-faint">
            Capture
          </span>
        </div>

        <h3 className="mt-7 text-lg font-semibold tracking-tight text-kf-ink">
          Notes
        </h3>

        <p className="mt-2 text-sm leading-6 text-kf-muted">
          Capture thoughts, summaries, and useful insights without leaving
          your knowledge workspace.
        </p>
      </div>

      {/* Favorites */}
      <div className="group relative overflow-hidden rounded-2xl border border-kf-border bg-kf-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-kf-accent/30 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-kf-border bg-kf-surface-muted">
            <IconStar size={19} className="text-kf-accent" />
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-kf-faint">
            Quick access
          </span>
        </div>

        <h3 className="mt-7 text-lg font-semibold tracking-tight text-kf-ink">
          Favorites
        </h3>

        <p className="mt-2 text-sm leading-6 text-kf-muted">
          Keep important documents close so frequently used knowledge is
          always easy to reach.
        </p>
      </div>

      {/* Trash */}
      <div className="group relative overflow-hidden rounded-2xl border border-kf-border bg-kf-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-kf-accent/30 hover:shadow-[0_14px_35px_rgba(15,23,42,0.07)]">
        <div className="flex items-start justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-kf-border bg-kf-surface-muted">
            <IconTrash size={19} className="text-kf-accent" />
          </div>

          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-kf-faint">
            Recovery
          </span>
        </div>

        <h3 className="mt-7 text-lg font-semibold tracking-tight text-kf-ink">
          Trash &amp; recovery
        </h3>

        <p className="mt-2 text-sm leading-6 text-kf-muted">
          Safely move documents to trash, restore them when needed, or
          permanently remove them.
        </p>
      </div>

      {/* AI Knowledge Assistant */}
      <div className="group relative overflow-hidden rounded-2xl border border-kf-accent/25 bg-[linear-gradient(135deg,rgba(240,253,250,0.95),rgba(255,255,255,1))] p-7 shadow-[0_14px_35px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-kf-accent/45 hover:shadow-[0_18px_40px_rgba(15,23,42,0.08)] md:col-span-2 xl:col-span-3">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-kf-accent/20 bg-kf-surface">
                <IconSpark size={21} className="text-kf-accent" />
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-kf-accent">
                  Intelligence
                </p>

                <h3 className="mt-0.5 text-xl font-semibold tracking-tight text-kf-ink">
                  AI Knowledge Assistant
                </h3>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-kf-muted sm:text-base">
              Ask questions about your uploaded knowledge and inspect the
              source documents behind the answer. KnowFlow keeps the
              conversation connected to your workspace.
            </p>
          </div>

          <div className="w-full max-w-md rounded-xl border border-kf-accent/15 bg-kf-surface/80 p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-kf-muted">
              <IconSpark size={14} className="text-kf-accent" />
              Ask your knowledge
            </div>

            <div className="mt-3 rounded-lg border border-kf-border bg-kf-surface-muted px-3 py-3 text-sm text-kf-faint">
              What does my uploaded research say about...
            </div>

            <div className="mt-3 flex items-center gap-2 text-[11px] text-kf-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-kf-accent" />
              Answers grounded in your documents
            </div>
          </div>
        </div>
      </div>
    </div>
  </Container>
</section>
    </>
  );
}