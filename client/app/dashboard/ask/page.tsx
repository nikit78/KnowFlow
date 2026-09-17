"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "../layout";
import { apiFetch, ApiError } from "@/lib/api";
import type { RagSource } from "@/lib/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import {
  IconArrowRight,
  IconDocument,
  IconSpark,
} from "@/components/icons";

type AskResponse = {
  success: boolean;
  answer?: string;
  sources?: RagSource[];
  message?: string;
};

function getSourceDocumentId(source: RagSource) {
  return (
    source.documentId ||
    source.document?._id ||
    source.document?.id ||
    ""
  );
}

function getSourceTitle(source: RagSource) {
  return (
    source.documentTitle ||
    source.title ||
    source.document?.title ||
    source.document?.originalName ||
    source.originalName ||
    "Untitled document"
  );
}

function getSourceText(source: RagSource) {
  return (
    source.text?.trim() ||
    "No preview is available for this document section."
  );
}

const suggestedQuestions = [
  "What are the key findings across my research papers?",
  "Summarize the financial risks mentioned in my reports.",
  "What did my lecture notes say about normalization?",
  "Compare the conclusions from these documents.",
];

export default function AskKnowledgePage() {
  useDashboard();
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<RagSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function askKnowledge(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedQuestion = question.trim();

    if (!trimmedQuestion) {
      setError("Please enter a question.");
      return;
    }

    setLoading(true);
    setError("");
    setAnswer("");
    setSources([]);

    try {
      const data = await apiFetch<AskResponse>(
        "/documents/rag/ask",
        {
          method: "POST",
          body: {
            question: trimmedQuestion,
          },
        },
      );

      setAnswer(
        data.answer || "No answer was generated.",
      );

      setSources(data.sources ?? []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";

      setError(
        /no relevant|context found/i.test(message)
          ? "I couldn't find enough relevant information in your documents to answer confidently."
          : message,
      );
    } finally {
      setLoading(false);
    }
  }

  function resetConversation() {
    setAnswer("");
    setSources([]);
    setError("");
    setQuestion("");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Hero */}
      <section className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-kf-accent-soft text-kf-accent-ink shadow-sm">
          <IconSpark size={24} />
        </div>

        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-kf-accent-ink">
            AI knowledge assistant
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-kf-ink sm:text-4xl">
            Ask your knowledge
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-kf-muted sm:text-base">
            Ask questions about your uploaded documents and get answers
            grounded in the knowledge stored in your workspace.
          </p>
        </div>
      </section>

      {/* Question composer */}
      <section>
        <form onSubmit={askKnowledge}>
          <div className="kf-card overflow-hidden border-kf-border-strong p-2 shadow-[var(--kf-shadow)]">
            <div className="flex flex-col">
              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();

                    if (
                      !loading &&
                      question.trim()
                    ) {
                      event.currentTarget.form?.requestSubmit();
                    }
                  }
                }}
                placeholder="Ask something about your documents..."
                rows={5}
                disabled={loading}
                aria-label="Ask a question about your documents"
                className="min-h-[130px] w-full resize-none bg-transparent px-4 py-3 text-sm leading-6 text-kf-ink outline-none placeholder:text-kf-faint disabled:cursor-not-allowed disabled:opacity-60 sm:min-h-[145px]"
              />

              <div className="flex flex-col gap-3 border-t border-kf-border px-3 pb-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[11px] text-kf-faint">
                  Press Enter to ask · Shift + Enter for a new line
                </p>

                <Button
                  type="submit"
                  disabled={
                    loading || !question.trim()
                  }
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    "Thinking..."
                  ) : (
                    <>
                      Ask Knowledge
                      <IconArrowRight size={16} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </section>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-kf-error/20 bg-kf-error-soft px-4 py-4 text-sm text-kf-error sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">
              I couldn't answer that
            </p>

            <p className="mt-1 leading-5 opacity-90">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="w-fit rounded-lg px-3 py-2 text-xs font-semibold hover:bg-white/60 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="kf-card flex flex-col items-center justify-center gap-4 p-8 text-center sm:p-10">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-kf-accent-soft text-kf-accent-ink">
            <IconSpark size={20} />
          </div>

          <div>
            <p className="text-sm font-semibold text-kf-ink">
              Searching your knowledge
            </p>

            <p className="mt-1 text-xs leading-5 text-kf-muted">
              Finding relevant document sections and preparing an
              answer...
            </p>
          </div>

          <Spinner label="Processing your question..." />
        </div>
      )}

      {/* Suggestions */}
      {!answer && !loading && !error && (
        <section>
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-kf-accent-ink">
              Get started
            </p>

            <h2 className="mt-1 text-xl font-semibold text-kf-ink">
              Try asking
            </h2>

            <p className="mt-1 text-sm text-kf-muted">
              Start with one of these questions or write your own.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {suggestedQuestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setQuestion(item)}
                className="group rounded-2xl border border-kf-border bg-kf-surface p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-kf-border-strong hover:bg-kf-surface-muted"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm leading-6 text-kf-muted transition group-hover:text-kf-ink">
                    {item}
                  </p>

                  <IconArrowRight
                    size={14}
                    className="mt-1 shrink-0 text-kf-faint transition group-hover:translate-x-0.5 group-hover:text-kf-accent-ink"
                  />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Answer */}
      {answer && !loading && (
        <div className="space-y-8">
          <section className="kf-card overflow-hidden">
            <div className="border-b border-kf-border bg-kf-surface-muted/50 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-kf-accent-soft text-kf-accent-ink">
                  <IconSpark size={17} />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-kf-ink">
                    Answer
                  </h2>

                  <p className="mt-0.5 text-xs text-kf-muted">
                    Generated from your workspace knowledge
                  </p>
                </div>
              </div>
            </div>

            <div className="px-5 py-6 sm:px-6 sm:py-7">
              <div className="whitespace-pre-wrap text-sm leading-7 text-kf-ink-soft">
                {answer}
              </div>
            </div>
          </section>

          {/* Sources */}
          {sources.length > 0 && (
            <section>
              <div className="mb-5 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-kf-accent-ink">
                    Grounding
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-kf-ink">
                    Sources
                  </h2>

                  <p className="mt-1 text-sm text-kf-muted">
                    Relevant document sections used to prepare this
                    answer.
                  </p>
                </div>

                <span className="text-xs text-kf-faint">
                  {sources.length}{" "}
                  {sources.length === 1
                    ? "source"
                    : "sources"}
                </span>
              </div>

              <div className="space-y-4">
                {sources.map((source, index) => {
                  const documentId =
                    getSourceDocumentId(source);

                  const title =
                    getSourceTitle(source);

                  const text =
                    getSourceText(source);

                  return (
                    <button
                      key={`${documentId}-${source.chunkIndex ?? index}-${index}`}
                      type="button"
                      onClick={() => {
                        if (documentId) {
                          router.push(
                            `/dashboard/documents/${documentId}`,
                          );
                        }
                      }}
                      disabled={!documentId}
                      className="group kf-card w-full p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-kf-border-strong disabled:cursor-default disabled:hover:translate-y-0 disabled:hover:border-kf-border sm:p-5"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-kf-accent-soft text-kf-accent-ink">
                            <IconDocument size={16} />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-kf-ink transition group-hover:text-kf-accent-ink">
                              {title}
                            </p>

                            <p className="mt-1 text-[11px] text-kf-muted">
                              Relevant section from your workspace
                            </p>
                          </div>
                        </div>

                        <Badge tone="neutral">
                          Source {index + 1}
                        </Badge>
                      </div>

                      <div className="mt-4 rounded-xl border border-kf-border bg-kf-surface-muted/50 px-4 py-3.5">
                        <p className="line-clamp-5 text-xs leading-5 text-kf-ink-soft">
                          {text}
                        </p>
                      </div>

                      {documentId && (
                        <div className="mt-3 flex items-center justify-end gap-1 text-[11px] font-semibold text-kf-muted transition group-hover:text-kf-accent-ink">
                          Open document
                          <IconArrowRight size={12} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Ask another */}
          <div className="flex justify-center border-t border-kf-border pt-6">
            <button
              type="button"
              onClick={resetConversation}
              className="group inline-flex items-center gap-2 rounded-xl border border-kf-border bg-kf-surface px-4 py-2.5 text-sm font-semibold text-kf-muted transition hover:border-kf-border-strong hover:text-kf-ink"
            >
              Ask another question
              <IconArrowRight
                size={14}
                className="transition group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}