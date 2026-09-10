"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Document = {
  _id: string;
  title: string;
  originalName: string;
  documentType: string;
  status: string;
  fileSize: number;
  mimeType: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt?: string;
};

export default function FavoritesPage() {
  const router = useRouter();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/documents/favorites",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load favorites");
      }

      setDocuments(data.documents || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      await fetchFavorites();
    };

    void load();
  }, [fetchFavorites]);

  const toggleFavorite = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/documents/${id}/favorite`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to update favorite");
      }

      setDocuments((current) =>
        current.filter((document) => document._id !== id)
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update favorite"
      );
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return "📕";

    if (mimeType.includes("word") || mimeType.includes("document")) {
      return "📘";
    }

    if (mimeType.includes("text")) return "📄";

    return "📁";
  };

  const formatDocumentType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-yellow-400">
            Saved Knowledge
          </p>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-500/20 bg-yellow-500/10 text-xl">
              ⭐
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Favorites
              </h1>

              <p className="mt-1 text-sm text-zinc-500">
                Quickly access the documents you use most.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <p className="text-sm text-zinc-500">Favorite documents</p>

            <p className="mt-2 text-2xl font-semibold">
              {documents.length}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <p className="text-sm text-zinc-500">Collection</p>

            <p className="mt-2 text-2xl font-semibold">Saved</p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>

            <button
              onClick={() => void fetchFavorites()}
              className="font-semibold text-red-200 hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/60"
              />
            ))}
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/50 px-6 py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-3xl">
              ⭐
            </div>

            <h2 className="text-xl font-semibold">
              No favorite documents
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Mark important documents as favorites from your Documents
              library and they will appear here.
            </p>

            <button
              onClick={() => router.push("/dashboard/documents")}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Browse Documents
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((document) => (
              <div
                key={document._id}
                role="button"
                tabIndex={0}
                onClick={() =>
                  router.push(`/dashboard/documents/${document._id}`)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    router.push(
                      `/dashboard/documents/${document._id}`
                    );
                  }
                }}
                className="group cursor-pointer rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/70"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-xl">
                    {getFileIcon(document.mimeType)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="truncate text-sm font-semibold text-zinc-100">
                        {document.title}
                      </h2>

                      <span className="rounded-md border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-[11px] font-medium text-yellow-400">
                        Favorite
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-zinc-600">
                      {document.originalName}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-500">
                        {formatDocumentType(document.documentType)}
                      </span>

                      <span className="text-xs text-zinc-600">
                        {formatFileSize(document.fileSize)}
                      </span>

                      <span className="text-xs text-zinc-600">•</span>

                      <span className="text-xs text-zinc-600">
                        {new Date(
                          document.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        void toggleFavorite(document._id);
                      }}
                      className="rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-400 transition hover:bg-yellow-500/20"
                      title="Remove from favorites"
                    >
                      ★
                    </button>

                    <button
                      onClick={(event) => {
                        event.stopPropagation();

                        router.push(
                          `/dashboard/documents/${document._id}`
                        );
                      }}
                      className="hidden rounded-xl border border-zinc-800 px-3 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-white sm:block"
                    >
                      Open
                    </button>
                  </div>
                </div>

                {document.tags?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-zinc-800 pt-3">
                    {document.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-zinc-900 px-2 py-1 text-[11px] text-zinc-500"
                      >
                        #{tag}
                      </span>
                    ))}

                    {document.tags.length > 5 && (
                      <span className="px-1 py-1 text-[11px] text-zinc-600">
                        +{document.tags.length - 5} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}