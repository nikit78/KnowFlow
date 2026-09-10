"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";

type DocumentStatus =
  | "uploaded"
  | "processing"
  | "processed"
  | "failed";

type Document = {
  _id: string;
  title: string;
  originalName: string;
  documentType: string;
  fileSize: number;
  status: DocumentStatus;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

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

function getStatusLabel(status: DocumentStatus) {
  const labels: Record<DocumentStatus, string> = {
    uploaded: "Uploaded",
    processing: "Processing",
    processed: "Processed",
    failed: "Failed",
  };

  return labels[status];
}

function formatDate(dateString: string) {
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

export default function DocumentsPage() {
  const router = useRouter();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [documentToTrash, setDocumentToTrash] =
  useState<Document | null>(null);

const [deleting, setDeleting] = useState(false);

  // ==========================
  // Toggle Favorite
  // ==========================

  const toggleFavorite = async (documentId: string) => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/documents/${documentId}/favorite`,
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
          data.message || "Failed to update favorite."
        );
      }

      setDocuments((currentDocuments) =>
        currentDocuments.map((document) =>
          document._id === documentId
            ? {
                ...document,
                isFavorite: !document.isFavorite,
              }
            : document
        )
      );
    } catch (favoriteError) {
      console.error("Favorite update error:", favoriteError);

      setError(
        favoriteError instanceof Error
          ? favoriteError.message
          : "Failed to update favorite."
      );
    }
  };

  const moveToTrash = async () => {
  if (!documentToTrash) {
    return;
  }

  try {
    setDeleting(true);
    setError("");

    const response = await fetch(
      `${API_URL}/documents/${documentToTrash._id}`,
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
        data.message || "Failed to move document to trash."
      );
    }

    setDocuments((currentDocuments) =>
      currentDocuments.filter(
        (document) =>
          document._id !== documentToTrash._id
      )
    );

    setDocumentToTrash(null);
  } catch (trashError) {
    console.error("Move to trash error:", trashError);

    setError(
      trashError instanceof Error
        ? trashError.message
        : "Failed to move document to trash."
    );
  } finally {
    setDeleting(false);
  }
};

  // ==========================
  // Load Documents
  // ==========================

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/documents?page=1&limit=20`,
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
            data.message || "Failed to load documents."
          );
        }

        setDocuments(data.documents || []);
      } catch (documentsError) {
        setError(
          documentsError instanceof Error
            ? documentsError.message
            : "Something went wrong while loading documents."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, [router]);

  // ==========================
  // Filtered Documents
  // ==========================

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        !query ||
        document.title.toLowerCase().includes(query) ||
        document.originalName.toLowerCase().includes(query) ||
        document.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );

      const matchesType =
        typeFilter === "all" ||
        document.documentType === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        document.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [
    documents,
    searchQuery,
    typeFilter,
    statusFilter,
  ]);

  // ==========================
  // Filter Options
  // ==========================

  const documentTypes = useMemo(() => {
    const types = documents.map(
      (document) => document.documentType
    );

    return Array.from(new Set(types));
  }, [documents]);

  // ==========================
  // Render
  // ==========================

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
              Documents
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/documents/upload")
            }
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
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
                d="M12 5v14M5 12h14"
                strokeLinecap="round"
              />
            </svg>

            Add document
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
            <p className="mb-3 text-sm font-medium text-blue-400">
              Knowledge workspace
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Documents
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-500">
              Manage the documents in your knowledge workspace
              and keep everything organized in one place.
            </p>
          </div>

          <div className="shrink-0 rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-2.5">
            <p className="text-xs text-zinc-600">
              Workspace documents
            </p>

            <p className="mt-0.5 text-sm font-medium text-zinc-300">
              {loading ? "—" : documents.length}
            </p>
          </div>
        </div>

        {/* ========================== */}
        {/* Search + Filters */}
        {/* ========================== */}

        {!loading &&
          !error &&
          documents.length > 0 && (
            <div className="mb-5 rounded-2xl border border-white/[0.07] bg-[#0d0d0f] p-3">
              <div className="flex flex-col gap-3 lg:flex-row">
                {/* Search */}

                <div className="relative min-w-0 flex-1">
                  <svg
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="11" cy="11" r="6.5" />

                    <path d="m16 16 4.5 4.5" />
                  </svg>

                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) =>
                      setSearchQuery(event.target.value)
                    }
                    placeholder="Search documents, filenames, or tags..."
                    className="h-11 w-full rounded-xl border border-white/[0.07] bg-white/[0.025] pl-10 pr-4 text-sm text-zinc-200 outline-none placeholder:text-zinc-700 transition focus:border-blue-500/30 focus:bg-white/[0.035]"
                  />
                </div>

                {/* Type Filter */}

                <select
                  value={typeFilter}
                  onChange={(event) =>
                    setTypeFilter(event.target.value)
                  }
                  className="h-11 rounded-xl border border-white/[0.07] bg-[#111114] px-3 text-sm text-zinc-400 outline-none transition focus:border-blue-500/30"
                >
                  <option value="all">All types</option>

                  {documentTypes.map((type) => (
                    <option key={type} value={type}>
                      {getDocumentTypeLabel(type)}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="h-11 rounded-xl border border-white/[0.07] bg-[#111114] px-3 text-sm text-zinc-400 outline-none transition focus:border-blue-500/30"
                >
                  <option value="all">All statuses</option>

                  <option value="processed">
                    Processed
                  </option>

                  <option value="processing">
                    Processing
                  </option>

                  <option value="uploaded">
                    Uploaded
                  </option>

                  <option value="failed">
                    Failed
                  </option>
                </select>

                {/* Clear */}

                {(searchQuery ||
                  typeFilter !== "all" ||
                  statusFilter !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setTypeFilter("all");
                      setStatusFilter("all");
                    }}
                    className="h-11 rounded-xl border border-white/[0.07] px-4 text-sm text-zinc-500 transition hover:bg-white/[0.03] hover:text-zinc-200"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Filter result count */}

              {(searchQuery ||
                typeFilter !== "all" ||
                statusFilter !== "all") && (
                <p className="px-1 pt-3 text-xs text-zinc-600">
                  Showing {filteredDocuments.length} of{" "}
                  {documents.length} documents
                </p>
              )}
            </div>
          )}

        {/* ========================== */}
        {/* Loading */}
        {/* ========================== */}

        {loading ? (
          <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d0f]">
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/10 border-t-blue-500" />

              <p className="mt-4 text-sm text-zinc-500">
                Loading your documents...
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
                Unable to load documents
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
          /* Empty Workspace */
          /* ========================== */

          <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d0f]">
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/[0.07] text-blue-400">
                <svg
                  width="25"
                  height="25"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path
                    d="M6 3h8l4 4v14H6z"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M14 3v5h4"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M9 13h6M9 17h4"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <h2 className="mt-5 text-lg font-semibold text-zinc-200">
                No documents yet
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">
                Upload your first document and KnowFlow will
                prepare it for search and knowledge retrieval.
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push("/dashboard/documents/upload")
                }
                className="mt-6 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
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
                    d="M12 5v14M5 12h14"
                    strokeLinecap="round"
                  />
                </svg>

                Add your first document
              </button>
            </div>
          </section>
        ) : filteredDocuments.length === 0 ? (
          /* ========================== */
          /* No Search Results */
          /* ========================== */

          <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d0f]">
            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.025] text-zinc-500">
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <circle cx="11" cy="11" r="6.5" />

                  <path d="m16 16 4.5 4.5" />
                </svg>
              </div>

              <h2 className="mt-5 text-base font-semibold text-zinc-200">
                No matching documents
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-600">
                Try changing your search or filters to find
                what you are looking for.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                  setStatusFilter("all");
                }}
                className="mt-5 rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-zinc-400 transition hover:bg-white/[0.03] hover:text-zinc-200"
              >
                Clear filters
              </button>
            </div>
          </section>
        ) : (
          /* ========================== */
          /* Documents List */
          /* ========================== */

          <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0f]">
            {/* List header */}

            <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">
              <div className="grid grid-cols-[minmax(0,1fr)_120px_120px] items-center gap-4 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                <span>Document</span>

                <span className="hidden sm:block">
                  Status
                </span>

                <span className="hidden sm:block">
                  Added
                </span>
              </div>
            </div>

            {/* Documents */}

            <div className="divide-y divide-white/[0.05]">
              {filteredDocuments.map((document) => (
                <div
                  key={document._id}
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    router.push(
                      `/dashboard/documents/${document._id}`
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" ||
                      event.key === " "
                    ) {
                      event.preventDefault();

                      router.push(
                        `/dashboard/documents/${document._id}`
                      );
                    }
                  }}
                  className="group grid w-full cursor-pointer grid-cols-1 gap-4 px-5 py-5 text-left transition hover:bg-white/[0.018] focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500/30 sm:grid-cols-[minmax(0,1fr)_120px_120px] sm:items-center sm:gap-4 sm:px-6"
                >
                  {/* Document */}

                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-blue-400/10 bg-blue-500/[0.07] text-[10px] font-bold tracking-wide text-blue-400">
                      {getExtension(document.originalName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-zinc-200 group-hover:text-white">
                          {document.title}
                        </p>

                        {/* Favorite */}

                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleFavorite(document._id);
                          }}
                          aria-label={
                            document.isFavorite
                              ? "Remove from favorites"
                              : "Add to favorites"
                          }
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-600 transition hover:bg-white/[0.06] hover:text-amber-400"
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill={
                              document.isFavorite
                                ? "currentColor"
                                : "none"
                            }
                            stroke="currentColor"
                            strokeWidth="1.7"
                            className={
                              document.isFavorite
                                ? "text-amber-400"
                                : "text-zinc-600"
                            }
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01z" />
                          </svg>
                        </button>
                        <button
  type="button"
  onClick={(event) => {
    event.stopPropagation();
    setDocumentToTrash(document);
  }}
  aria-label={`Move ${document.title} to trash`}
  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-600 transition hover:bg-red-500/[0.08] hover:text-red-400"
>
  <svg
    width="15"
    height="15"
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
      d="M6 7l1 13h10l1-13"
      strokeLinejoin="round"
    />

    <path
      d="M9 7V4h6v3"
      strokeLinejoin="round"
    />
  </svg>
</button>
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
                    </div>

                    <svg
                      className="mt-1 shrink-0 text-zinc-700 transition group-hover:translate-x-0.5 group-hover:text-zinc-400"
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path
                        d="M9 18l6-6-6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  {/* Status */}

                  <div className="sm:block">
                    <span
                      className={`inline-flex rounded-md border px-2.5 py-1 text-[11px] font-medium ${
                        document.status === "processed"
                          ? "border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-400"
                          : document.status === "processing"
                            ? "border-amber-500/15 bg-amber-500/[0.06] text-amber-400"
                            : document.status === "failed"
                              ? "border-red-500/15 bg-red-500/[0.06] text-red-400"
                              : "border-white/[0.08] bg-white/[0.025] text-zinc-500"
                      }`}
                    >
                      {getStatusLabel(document.status)}
                    </span>
                  </div>

                  {/* Date */}

                  <div className="hidden text-xs text-zinc-600 sm:block">
                    {formatDate(document.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
        {/* ========================== */}
      {/* Move to Trash Dialog */}
      {/* ========================== */}

      {documentToTrash && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
          onClick={() => {
            if (!deleting) {
              setDocumentToTrash(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trash-dialog-title"
            className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#111114] p-6 shadow-2xl"
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
                  d="M4 7h16"
                  strokeLinecap="round"
                />

                <path
                  d="M10 11v6M14 11v6"
                  strokeLinecap="round"
                />

                <path
                  d="M6 7l1 13h10l1-13"
                  strokeLinejoin="round"
                />

                <path
                  d="M9 7V4h6v3"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Content */}

            <h2
              id="trash-dialog-title"
              className="mt-5 text-lg font-semibold text-white"
            >
              Move document to trash?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              <span className="font-medium text-zinc-300">
                {documentToTrash.title}
              </span>{" "}
              will be moved to Trash. You can restore it
              later.
            </p>

            {/* Actions */}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDocumentToTrash(null)}
                className="rounded-lg border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.03] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={moveToTrash}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}

                {deleting
                  ? "Moving..."
                  : "Move to trash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}