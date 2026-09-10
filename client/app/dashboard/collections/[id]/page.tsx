"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type DocumentType =
  | "research-paper"
  | "annual-report"
  | "financial-statement"
  | "lecture-notes"
  | "book"
  | "other";

type DocumentItem = {
  _id: string;
  title: string;
  originalName?: string;
  fileSize?: number;
  documentType: DocumentType;
  status: "uploaded" | "processing" | "processed" | "failed";
  tags?: string[];
  isFavorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

type Collection = {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  documents?: DocumentItem[];
  createdAt: string;
  updatedAt?: string;
};

const API_URL = "http://localhost:5000/api";

const documentTypeLabels: Record<DocumentType, string> = {
  "research-paper": "Research Paper",
  "annual-report": "Annual Report",
  "financial-statement": "Financial Statement",
  "lecture-notes": "Lecture Notes",
  book: "Book",
  other: "Other",
};

const formatFileSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const formatDate = (date?: string) => {
  if (!date) return "Unknown date";

  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getDocumentIcon = (document: DocumentItem) => {
  if (document.originalName?.toLowerCase().endsWith(".pdf")) {
    return "📕";
  }

  if (
    document.originalName?.toLowerCase().endsWith(".docx") ||
    document.originalName?.toLowerCase().endsWith(".doc")
  ) {
    return "📘";
  }

  if (
    document.originalName?.toLowerCase().endsWith(".md") ||
    document.originalName?.toLowerCase().endsWith(".txt")
  ) {
    return "📝";
  }

  return "📄";
};

export default function CollectionDetailPage() {
  const params = useParams();
  const router = useRouter();

  const collectionId = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [allDocuments, setAllDocuments] = useState<DocumentItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const [error, setError] = useState("");
  const [documentsError, setDocumentsError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [addingDocumentId, setAddingDocumentId] = useState<string | null>(
    null
  );
  const [removingDocumentId, setRemovingDocumentId] = useState<string | null>(
    null
  );

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/collections/${collectionId}`,
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
        throw new Error(data.message || "Failed to load collection");
      }

      setCollection(data.collection);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load collection"
      );
    } finally {
      setLoading(false);
    }
  }, [collectionId, router]);

  const fetchDocuments = useCallback(async () => {
    try {
      setDocumentsLoading(true);
      setDocumentsError("");

      const response = await fetch(
        `${API_URL}/documents?page=1&limit=100`,
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
        throw new Error(data.message || "Failed to load documents");
      }

      setAllDocuments(data.documents || []);
    } catch (err) {
      setDocumentsError(
        err instanceof Error
          ? err.message
          : "Failed to load documents"
      );
    } finally {
      setDocumentsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!collectionId) return;

    void fetchCollection();
    void fetchDocuments();
  }, [collectionId, fetchCollection, fetchDocuments]);

  const collectionDocumentIds = useMemo(() => {
    return new Set(
      (collection?.documents || []).map((document) => document._id)
    );
  }, [collection]);

  const availableDocuments = useMemo(() => {
    return allDocuments.filter(
      (document) => !collectionDocumentIds.has(document._id)
    );
  }, [allDocuments, collectionDocumentIds]);

  const addDocument = async (documentId: string) => {
    try {
      setAddingDocumentId(documentId);

      const response = await fetch(
        `${API_URL}/collections/${collectionId}/documents/${documentId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to add document");
      }

      await fetchCollection();
    } catch (err) {
      setDocumentsError(
        err instanceof Error
          ? err.message
          : "Failed to add document"
      );
    } finally {
      setAddingDocumentId(null);
    }
  };

  const removeDocument = async (documentId: string) => {
    try {
      setRemovingDocumentId(documentId);

      const response = await fetch(
        `${API_URL}/collections/${collectionId}/documents/${documentId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to remove document");
      }

      await fetchCollection();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to remove document"
      );
    } finally {
      setRemovingDocumentId(null);
    }
  };

  const openDocument = (documentId: string) => {
    router.push(`/dashboard/documents/${documentId}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#09090b] px-6 py-8 text-zinc-100 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-800" />
          <div className="mt-4 h-5 w-72 animate-pulse rounded bg-zinc-900" />

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-52 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-950"
              />
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error && !collection) {
    return (
      <main className="min-h-screen bg-[#09090b] px-6 py-8 text-zinc-100 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            onClick={() => router.push("/dashboard/collections")}
            className="mb-8 text-sm text-zinc-400 hover:text-white"
          >
            ← Back to Collections
          </button>

          <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
            <div className="text-3xl">⚠️</div>

            <h1 className="mt-4 text-xl font-semibold">
              Unable to load collection
            </h1>

            <p className="mt-2 text-sm text-zinc-500">{error}</p>

            <button
              type="button"
              onClick={() => void fetchCollection()}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!collection) {
    return null;
  }

  const documents = collection.documents || [];

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => router.push("/dashboard/collections")}
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-white"
        >
          <span>←</span>
          Back to Collections
        </button>

        {/* Collection Header */}
        <section
          className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950/80 p-6 sm:p-8"
        >
          <div
            className="absolute inset-x-0 top-0 h-1"
            style={{
              backgroundColor: collection.color || "#3b82f6",
            }}
          />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-5">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl"
                style={{
                  backgroundColor: `${
                    collection.color || "#3b82f6"
                  }20`,
                }}
              >
                {collection.icon || "📚"}
              </div>

              <div>
                <p className="text-sm font-medium text-blue-400">
                  Collection
                </p>

                <h1 className="mt-1 text-3xl font-semibold tracking-tight">
                  {collection.name}
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                  {collection.description ||
                    "Organize related documents and knowledge in one focused space."}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                  <span className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5">
                    {documents.length}{" "}
                    {documents.length === 1 ? "document" : "documents"}
                  </span>

                  <span>
                    Created {formatDate(collection.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowAddModal(true);
                void fetchDocuments();
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <span className="text-lg">+</span>
              Add Documents
            </button>
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => void fetchCollection()}
              className="font-semibold text-red-200 hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Documents Section */}
        <section className="mt-10">
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Knowledge
              </p>

              <h2 className="mt-1 text-xl font-semibold">
                Documents in this collection
              </h2>
            </div>

            <span className="text-sm text-zinc-600">
              {documents.length} total
            </span>
          </div>

          {documents.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/50 px-6 py-20 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-3xl">
                📂
              </div>

              <h3 className="text-xl font-semibold">
                This collection is empty
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Add documents from your library to start building this
                knowledge space.
              </p>

              <button
                type="button"
                onClick={() => {
                  setShowAddModal(true);
                  void fetchDocuments();
                }}
                className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
              >
                Add your first document
              </button>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {documents.map((document) => (
                <article
                  key={document._id}
                  className="group rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 transition hover:border-zinc-700 hover:bg-zinc-950"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-2xl">
                      {getDocumentIcon(document)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => openDocument(document._id)}
                        className="block max-w-full text-left"
                      >
                        <h3 className="truncate text-base font-semibold text-zinc-100 transition group-hover:text-blue-400">
                          {document.title}
                        </h3>

                        <p className="mt-1 truncate text-xs text-zinc-600">
                          {document.originalName || "Document"}
                        </p>
                      </button>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-md border border-zinc-800 bg-zinc-900 px-2 py-1 text-[11px] text-zinc-400">
                          {documentTypeLabels[document.documentType]}
                        </span>

                        <span
                          className={`rounded-md px-2 py-1 text-[11px] ${
                            document.status === "processed"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : document.status === "failed"
                                ? "bg-red-500/10 text-red-400"
                                : "bg-amber-500/10 text-amber-400"
                          }`}
                        >
                          {document.status}
                        </span>

                        <span className="text-[11px] text-zinc-600">
                          {formatFileSize(document.fileSize)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4">
                    <div className="flex items-center gap-2 text-xs text-zinc-600">
                      <span>{formatDate(document.createdAt)}</span>

                      {document.isFavorite && (
                        <>
                          <span>•</span>
                          <span className="text-amber-400">★ Favorite</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openDocument(document._id)}
                        className="rounded-lg px-3 py-2 text-xs font-semibold text-blue-400 transition hover:bg-blue-500/10 hover:text-blue-300"
                      >
                        Open
                      </button>

                      <button
                        type="button"
                        disabled={removingDocumentId === document._id}
                        onClick={() => void removeDocument(document._id)}
                        className="rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 transition hover:bg-red-950/40 hover:text-red-400 disabled:opacity-50"
                      >
                        {removingDocumentId === document._id
                          ? "Removing..."
                          : "Remove"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Add Documents Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-zinc-800 p-6">
              <div>
                <p className="text-sm font-medium text-blue-400">
                  Add to collection
                </p>

                <h2 className="mt-1 text-xl font-semibold">
                  Choose Documents
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Select documents from your library to add here.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-lg px-2 py-1 text-zinc-500 hover:bg-zinc-900 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto p-6">
              {documentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="h-16 animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/60"
                    />
                  ))}
                </div>
              ) : documentsError ? (
                <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-5 text-center">
                  <p className="text-sm text-red-300">
                    {documentsError}
                  </p>

                  <button
                    type="button"
                    onClick={() => void fetchDocuments()}
                    className="mt-4 text-sm font-semibold text-red-200 hover:text-white"
                  >
                    Retry
                  </button>
                </div>
              ) : availableDocuments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-zinc-800 px-6 py-12 text-center">
                  <div className="text-3xl">✓</div>

                  <h3 className="mt-4 font-semibold">
                    All documents are already added
                  </h3>

                  <p className="mt-2 text-sm text-zinc-600">
                    There are no other active documents available in
                    your library.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableDocuments.map((document) => (
                    <div
                      key={document._id}
                      className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 transition hover:border-zinc-700"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-zinc-900 text-xl">
                        {getDocumentIcon(document)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-semibold">
                          {document.title}
                        </h3>

                        <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-zinc-600">
                          <span>
                            {documentTypeLabels[document.documentType]}
                          </span>

                          <span>•</span>

                          <span>
                            {formatFileSize(document.fileSize)}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={addingDocumentId === document._id}
                        onClick={() => void addDocument(document._id)}
                        className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {addingDocumentId === document._id
                          ? "Adding..."
                          : "Add"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end border-t border-zinc-800 p-5">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-900 hover:text-white"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}