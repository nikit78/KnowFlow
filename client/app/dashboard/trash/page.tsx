"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";

type Document = {
  _id: string;
  title: string;
  originalName: string;
  documentType: string;
  fileSize: number;
  createdAt: string;
  deletedAt?: string | null;
  tags: string[];
  status: "uploaded" | "processing" | "processed" | "failed";
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function getExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf(".");

  if (lastDot === -1) {
    return "FILE";
  }

  return fileName.slice(lastDot + 1).toUpperCase();
}

function getDocumentTypeLabel(type: string) {
  const labels: Record<string, string> = {
    "research-paper": "Research Paper",
    "annual-report": "Annual Report",
    "financial-statement": "Financial Statement",
    "lecture-notes": "Lecture Notes",
    book: "Book",
    other: "Other",
  };

  return labels[type] || type;
}

function formatDate(dateString?: string | null) {
  if (!dateString) {
    return "Unknown date";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export default function TrashPage() {
  const router = useRouter();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [documentToRestore, setDocumentToRestore] =
    useState<Document | null>(null);

  const [restoring, setRestoring] = useState(false);

  const [documentToDelete, setDocumentToDelete] =
  useState<Document | null>(null);

const [permanentlyDeleting, setPermanentlyDeleting] =
  useState(false);

  // ==========================
  // Load Trash
  // ==========================

  useEffect(() => {
    const loadTrash = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/documents/trash`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          router.push("/auth/login");
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load trash."
          );
        }

        setDocuments(data.documents || []);
      } catch (trashError) {
        console.error("Trash loading error:", trashError);

        setError(
          trashError instanceof Error
            ? trashError.message
            : "Something went wrong while loading trash."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTrash();
  }, [router]);

  // ==========================
  // Restore Document
  // ==========================

  const restoreDocument = async () => {
    if (!documentToRestore) {
      return;
    }

    try {
      setRestoring(true);
      setError("");

      const response = await fetch(
        `${API_URL}/documents/${documentToRestore._id}/restore`,
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

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to restore document."
        );
      }

      setDocuments((currentDocuments) =>
        currentDocuments.filter(
          (document) =>
            document._id !== documentToRestore._id
        )
      );

      setDocumentToRestore(null);
    } catch (restoreError) {
      console.error(
        "Restore document error:",
        restoreError
      );

      setError(
        restoreError instanceof Error
          ? restoreError.message
          : "Failed to restore document."
      );
    } finally {
      setRestoring(false);
    }
  };

  // ==========================
// Permanent Delete Document
// ==========================

const permanentlyDeleteDocument = async () => {
  if (!documentToDelete) {
    return;
  }

  try {
    setPermanentlyDeleting(true);
    setError("");

    const response = await fetch(
      `${API_URL}/documents/${documentToDelete._id}/permanent`,
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

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to permanently delete document."
      );
    }

    setDocuments((currentDocuments) =>
      currentDocuments.filter(
        (document) =>
          document._id !== documentToDelete._id
      )
    );

    setDocumentToDelete(null);
  } catch (deleteError) {
    console.error(
      "Permanent delete document error:",
      deleteError
    );

    setError(
      deleteError instanceof Error
        ? deleteError.message
        : "Failed to permanently delete document."
    );
  } finally {
    setPermanentlyDeleting(false);
  }
};

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      {/* ========================== */}
      {/* Top Bar */}
      {/* ========================== */}

      <header className="fixed left-0 right-0 top-0 z-40 h-[78px] border-b border-white/[0.06] bg-[#09090b]/95 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-200"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <path
                  d="M19 12H5M12 19l-7-7 7-7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              Dashboard
            </button>

            <span className="text-zinc-700">/</span>

            <span className="text-sm font-medium text-zinc-200">
              Trash
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/documents")
            }
            className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.03] hover:text-zinc-200"
          >
            Documents
          </button>
        </div>
      </header>

      {/* ========================== */}
      {/* Main */}
      {/* ========================== */}

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-32 lg:px-8">
        {/* Heading */}

        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 text-sm font-medium text-red-400">
              Recycle bin
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Trash
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-500">
              Documents moved here can be restored to your
              workspace.
            </p>
          </div>

          <div className="shrink-0 rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-2.5">
            <p className="text-xs text-zinc-600">
              Deleted documents
            </p>

            <p className="mt-0.5 text-sm font-medium text-zinc-300">
              {loading ? "—" : documents.length}
            </p>
          </div>
        </div>

        {/* ========================== */}
        {/* Loading */}
        {/* ========================== */}

        {loading ? (
          <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d0f]">
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-red-500" />

              <p className="mt-4 text-sm text-zinc-500">
                Loading trash...
              </p>
            </div>
          </section>
        ) : error ? (
          /* ========================== */
          /* Error */
          /* ========================== */

          <section className="rounded-2xl border border-red-500/15 bg-[#0d0d0f]">
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/[0.06] text-red-400">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <circle cx="12" cy="12" r="9" />

                  <path
                    d="M12 8v5"
                    strokeLinecap="round"
                  />

                  <path
                    d="M12 16h.01"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h2 className="mt-5 text-base font-semibold text-zinc-200">
                Unable to load trash
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.03] hover:text-zinc-200"
              >
                Try again
              </button>
            </div>
          </section>
        ) : documents.length === 0 ? (
          /* ========================== */
          /* Empty Trash */
          /* ========================== */

          <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d0f]">
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-500/[0.07] text-emerald-400">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path
                    d="M20 6 9 17l-5-5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h2 className="mt-5 text-lg font-semibold text-zinc-200">
                Trash is empty
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">
                Documents you move to trash will appear here.
                You can restore them whenever you need.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard/documents")
                }
                className="mt-6 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Back to documents
              </button>
            </div>
          </section>
        ) : (
          /* ========================== */
          /* Trash List */
          /* ========================== */

          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0f]">
            {/* List Header */}

            <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
              <div className="grid grid-cols-[minmax(0,1fr)_120px] items-center gap-4 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                <span>Document</span>

                <span className="hidden sm:block">
                  Deleted
                </span>
              </div>
            </div>

            {/* Documents */}

            <div className="divide-y divide-white/[0.05]">
              {documents.map((document) => (
                <div
                  key={document._id}
                  className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_120px] sm:items-center sm:px-6"
                >
                  {/* Document */}

                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-red-400/10 bg-red-500/[0.06] text-[10px] font-bold tracking-wide text-red-400">
                      {getExtension(document.originalName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-zinc-200">
                          {document.title}
                        </p>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-600">
                        <span>
                          {getDocumentTypeLabel(
                            document.documentType
                          )}
                        </span>

                        <span className="text-zinc-800">
                          •
                        </span>

                        <span>
                          {formatFileSize(document.fileSize)}
                        </span>

                        {document.tags.length > 0 && (
                          <>
                            <span className="text-zinc-800">
                              •
                            </span>

                            <span className="truncate">
                              {document.tags
                                .slice(0, 3)
                                .join(", ")}
                            </span>
                          </>
                        )}
                      </div>

                      <p className="mt-2 text-xs text-zinc-700">
                        Deleted{" "}
                        {formatDate(document.deletedAt)}
                      </p>
                    </div>

                    {/* Restore */}

                    <button
                      type="button"
                      onClick={() =>
                        setDocumentToRestore(document)
                      }
                      aria-label={`Restore ${document.title}`}
                      className="flex shrink-0 items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-emerald-500/20 hover:bg-emerald-500/[0.05] hover:text-emerald-400"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path
                          d="M3 12a9 9 0 1 0 3-6.7"
                          strokeLinecap="round"
                        />

                        <path
                          d="M3 4v5h5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      Restore
                    </button>

                    {/* Permanent Delete */}

<button
  type="button"
  onClick={() =>
    setDocumentToDelete(document)
  }
  aria-label={`Permanently delete ${document.title}`}
  className="flex shrink-0 items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-zinc-400 transition hover:border-red-500/20 hover:bg-red-500/[0.05] hover:text-red-400"
>
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
  >
    <path
      d="M4 7h16"
      strokeLinecap="round"
    />

    <path
      d="M10 11v6M14 11v6"
      strokeLinecap="round"
    />

    <path
      d="m6 7 1 13h10l1-13"
      strokeLinecap="round"
      strokeLinejoin="round"
    />

    <path
      d="M9 7V4h6v3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>

  Delete
</button>
                  </div>

                  {/* Deleted Date */}

                  <div className="hidden text-xs text-zinc-600 sm:block">
                    {formatDate(document.deletedAt)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ========================== */}
      {/* Restore Dialog */}
      {/* ========================== */}

      {documentToRestore && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
          onClick={() => {
            if (!restoring) {
              setDocumentToRestore(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="restore-dialog-title"
            className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#111114] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Icon */}

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-500/10 bg-emerald-500/[0.07] text-emerald-400">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <path
                  d="M3 12a9 9 0 1 0 3-6.7"
                  strokeLinecap="round"
                />

                <path
                  d="M3 4v5h5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2
              id="restore-dialog-title"
              className="mt-5 text-lg font-semibold text-white"
            >
              Restore document?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              <span className="font-medium text-zinc-300">
                {documentToRestore.title}
              </span>{" "}
              will be restored to your Documents workspace.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={restoring}
                onClick={() =>
                  setDocumentToRestore(null)
                }
                className="rounded-lg border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.03] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={restoring}
                onClick={restoreDocument}
                className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {restoring && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}

                {restoring
                  ? "Restoring..."
                  : "Restore document"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ========================== */}
{/* Permanent Delete Dialog */}
{/* ========================== */}

{documentToDelete && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
    onClick={() => {
      if (!permanentlyDeleting) {
        setDocumentToDelete(null);
      }
    }}
  >
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="permanent-delete-dialog-title"
      className="w-full max-w-md rounded-2xl border border-red-500/10 bg-[#111114] p-6 shadow-2xl"
      onClick={(event) => event.stopPropagation()}
    >
      {/* Icon */}

      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/[0.07] text-red-400">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <path
            d="M3 6h18"
            strokeLinecap="round"
          />

          <path
            d="M8 6V4h8v2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="m19 6-1 14H6L5 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <path
            d="M10 11v5M14 11v5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h2
        id="permanent-delete-dialog-title"
        className="mt-5 text-lg font-semibold text-white"
      >
        Permanently delete document?
      </h2>

      <p className="mt-2 text-sm leading-6 text-zinc-500">
        <span className="font-medium text-zinc-300">
          {documentToDelete.title}
        </span>{" "}
        will be permanently removed from KnowFlow.
        <span className="mt-2 block font-medium text-red-400/80">
          This action cannot be undone.
        </span>
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          disabled={permanentlyDeleting}
          onClick={() => setDocumentToDelete(null)}
          className="rounded-lg border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.03] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={permanentlyDeleting}
          onClick={permanentlyDeleteDocument}
          className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {permanentlyDeleting && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          )}

          {permanentlyDeleting
            ? "Deleting..."
            : "Delete permanently"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}