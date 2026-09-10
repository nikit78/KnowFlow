"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";

type Source = {
  documentId: string;
  title?: string;
  chunkIndex: number;
  text?: string;
  document?: {
    _id?: string;
    id?: string;
    title?: string;
    originalName?: string;
  } | null;
};

type AskResponse = {
  success: boolean;
  answer?: string;
  sources?: Source[];
  message?: string;
};

const getSourceDocumentId = (source: Source) =>
  source.documentId ||
  source.document?._id ||
  source.document?.id ||
  "";

const getSourceTitle = (source: Source) =>
  source.title ||
  source.document?.title ||
  source.document?.originalName ||
  "Untitled document";

const getSourceText = (source: Source) =>
  source.text?.trim() || "No preview is available for this document section.";

export default function AskKnowledgePage() {
  const router = useRouter();

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: "include",
        });

        if (!response.ok) {
          router.replace("/auth/login");
          return;
        }
      } catch {
        router.replace("/auth/login");
        return;
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  const askKnowledge = async (event: FormEvent) => {
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
      const response = await fetch(`${API_URL}/documents/rag/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          question: trimmedQuestion,
        }),
      });

      const data: AskResponse = await response.json();

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to get an answer.");
      }

      setAnswer(data.answer || "No answer was generated.");
      setSources(data.sources || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "What information is available in my documents?",
    "Summarize my uploaded documents.",
    "What are the main topics covered in my documents?",
  ];

  if (checkingAuth) {
    return (
      <main className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
          Loading workspace...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-[#09090b]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              Dashboard
            </button>

            <span className="text-zinc-700">/</span>

            <span className="text-sm font-medium text-zinc-100">
              Ask Knowledge
            </span>
          </div>

          <button
            onClick={() => router.push("/dashboard/documents")}
            className="rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-white"
          >
            Documents
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Heading */}
        <section className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/10">
            <svg
              className="h-6 w-6 text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M8 10h8M8 14h5m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Ask your knowledge
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Ask questions about your uploaded documents and get answers based
            on the knowledge stored in your workspace.
          </p>
        </section>

        {/* Question box */}
        <form onSubmit={askKnowledge}>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl shadow-black/20">
            <div className="flex items-end gap-2">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();

                    if (!loading && question.trim()) {
                      event.currentTarget.form?.requestSubmit();
                    }
                  }
                }}
                placeholder="Ask something about your documents..."
                rows={4}
                disabled={loading}
                className="min-h-[110px] flex-1 resize-none bg-transparent px-4 py-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="mb-1 flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-white" />
                    Thinking
                  </>
                ) : (
                  <>
                    Ask
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Suggestions */}
        {!answer && !loading && (
          <section className="mt-8">
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Try asking
            </p>

            <div className="grid gap-3 md:grid-cols-3">
              {suggestedQuestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setQuestion(item)}
                  className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-left text-sm leading-5 text-zinc-400 transition hover:border-zinc-700 hover:bg-zinc-900 hover:text-zinc-200"
                >
                  {item}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Error */}
        {error && (
          <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <div className="flex items-center gap-3 text-sm text-zinc-400">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
              Searching your documents and preparing an answer...
            </div>
          </div>
        )}

        {/* Answer */}
        {answer && !loading && (
          <div className="mt-10 space-y-6">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  ✦
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-zinc-100">
                    Answer
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Generated from your workspace knowledge
                  </p>
                </div>
              </div>

              <div className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                {answer}
              </div>
            </section>

            {/* Sources */}
            {sources.length > 0 && (
              <section>
                <div className="mb-4">
                  <h2 className="text-sm font-semibold text-zinc-100">
                    Sources
                  </h2>

                  <p className="mt-1 text-xs text-zinc-500">
                    Relevant document sections used for this answer
                  </p>
                </div>

                <div className="space-y-3">
                  {sources.map((source, index) => {
                    const documentId = getSourceDocumentId(source);
                    const title = getSourceTitle(source);
                    const text = getSourceText(source);

                    return (
                      <button
                        key={`${documentId}-${source.chunkIndex}-${index}`}
                        type="button"
                        onClick={() => {
                          if (documentId) {
                            router.push(`/dashboard/documents/${documentId}`);
                          }
                        }}
                        disabled={!documentId}
                        className="group w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-zinc-700 hover:bg-zinc-900/70 disabled:cursor-default disabled:hover:border-zinc-800 disabled:hover:bg-zinc-950"
                      >
                        <div className="mb-3 flex items-start justify-between gap-4">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-500">
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                              >
                                <path d="M6 3.5h8l4 4V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20z" />
                                <path d="M14 3.5V8h4M9 12h6M9 15h6M9 18h4" />
                              </svg>
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-zinc-200 group-hover:text-white">
                                {title}
                              </p>

                              <p className="mt-1 text-[11px] text-zinc-600">
                                Relevant section from your workspace
                              </p>
                            </div>
                          </div>

                          <span className="shrink-0 rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-500">
                            Chunk {source.chunkIndex + 1}
                          </span>
                        </div>

                        <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/30 px-3 py-3">
                          <p className="line-clamp-4 text-xs leading-5 text-zinc-400">
                            {text}
                          </p>
                        </div>

                        {documentId && (
                          <div className="mt-3 flex items-center justify-end gap-1 text-[11px] text-zinc-600 transition group-hover:text-blue-400">
                            Open document
                            <span>→</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Ask another */}
            <button
              type="button"
              onClick={() => {
                setAnswer("");
                setSources([]);
                setError("");
                setQuestion("");
              }}
              className="text-sm text-blue-400 transition hover:text-blue-300"
            >
              ← Ask another question
            </button>
          </div>
        )}
      </div>
    </main>
  );
}