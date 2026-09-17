"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "../layout";
import { apiFetch, ApiError } from "@/lib/api";
import type { DocumentStatus, KnowledgeDocument } from "@/lib/types";
import {
  formatBytes,
  formatDate,
  formatDocumentType,
  getDocumentStatusLabel,
  getDocumentStatusTone,
  getFileExtension,
} from "@/lib/format";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import {
  IconArrowRight,
  IconDocument,
  IconPlus,
  IconSearch,
  IconStar,
  IconTrash,
  IconUpload,
} from "@/components/icons";

type DocumentsResponse = {
  success: boolean;
  documents?: KnowledgeDocument[];
  message?: string;
};

export default function DocumentsPage() {
  useDashboard();
  const router = useRouter();

  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [documentToTrash, setDocumentToTrash] =
    useState<KnowledgeDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch<DocumentsResponse>(
          "/documents?page=1&limit=20",
        );

        if (!cancelled) {
          setDocuments(data.documents ?? []);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/auth/login");
          return;
        }

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load documents.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  async function toggleFavorite(documentId: string) {
    try {
      setError("");

      await apiFetch(`/documents/${documentId}/favorite`, {
        method: "PATCH",
      });

      setDocuments((current) =>
        current.map((doc) =>
          doc._id === documentId
            ? {
                ...doc,
                isFavorite: !doc.isFavorite,
              }
            : doc,
        ),
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update favorite.",
      );
    }
  }

  async function moveToTrash() {
    if (!documentToTrash) return;

    try {
      setDeleting(true);
      setError("");

      await apiFetch(`/documents/${documentToTrash._id}`, {
        method: "DELETE",
      });

      setDocuments((current) =>
        current.filter(
          (doc) => doc._id !== documentToTrash._id,
        ),
      );

      setDocumentToTrash(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Failed to move document to trash.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const documentTypes = useMemo(
    () =>
      Array.from(
        new Set(
          documents.map(
            (document) => document.documentType,
          ),
        ),
      ),
    [documents],
  );

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return documents.filter((document) => {
      const matchesSearch =
        !query ||
        document.title.toLowerCase().includes(query) ||
        document.originalName.toLowerCase().includes(query) ||
        document.tags.some((tag) =>
          tag.toLowerCase().includes(query),
        );

      const matchesType =
        typeFilter === "all" ||
        document.documentType === typeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        document.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    documents,
    searchQuery,
    typeFilter,
    statusFilter,
  ]);

  const hasFilters =
    searchQuery.trim() !== "" ||
    typeFilter !== "all" ||
    statusFilter !== "all";

  const processedCount = documents.filter(
    (document) => document.status === "processed",
  ).length;

  const favoriteCount = documents.filter(
    (document) => document.isFavorite,
  ).length;

  function clearFilters() {
    setSearchQuery("");
    setTypeFilter("all");
    setStatusFilter("all");
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      {/* Header */}
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-kf-accent-ink">
            Knowledge library
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-kf-ink sm:text-[34px]">
            Documents
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-6 text-kf-muted">
            Keep your knowledge organized, searchable,
            and ready for AI-powered retrieval.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="rounded-xl border border-kf-border bg-kf-surface px-4 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-kf-faint">
              Library
            </p>

            <p className="mt-0.5 text-sm font-semibold text-kf-ink">
              {loading
                ? "—"
                : `${documents.length} ${
                    documents.length === 1
                      ? "document"
                      : "documents"
                  }`}
            </p>
          </div>

          <Button href="/dashboard/documents/upload">
            <IconPlus size={16} />
            Add document
          </Button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start justify-between gap-4 rounded-2xl border border-kf-error/20 bg-kf-error-soft px-4 py-3.5 text-sm text-kf-error"
        >
          <div className="flex items-start gap-3">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-kf-error" />

            <p className="leading-5">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="shrink-0 text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Metrics */}
      {!loading && documents.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-3">
          <LibraryMetric
            label="Total documents"
            value={documents.length}
            detail="In your workspace"
          />

          <LibraryMetric
            label="Ready for search"
            value={processedCount}
            detail="Successfully processed"
          />

          <LibraryMetric
            label="Favorites"
            value={favoriteCount}
            detail="Saved for quick access"
            icon={
              <IconStar
                size={16}
                className="mb-1 text-kf-favorite"
              />
            }
          />
        </section>
      )}

      {/* Search and filters */}
      {!loading && documents.length > 0 && (
        <section className="kf-card overflow-hidden">
          <div className="border-b border-kf-border px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-kf-accent-soft text-kf-accent-ink">
                <IconSearch size={16} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-kf-ink">
                  Find a document
                </h2>

                <p className="mt-0.5 text-xs text-kf-muted">
                  Search by title, filename, or tags
                </p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative min-w-0 flex-1">
                <IconSearch
                  size={16}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-kf-faint"
                />

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search documents, filenames, or tags..."
                  aria-label="Search documents"
                  className="h-11 w-full rounded-xl border border-kf-border bg-kf-surface pl-10 pr-4 text-sm text-kf-ink outline-none transition placeholder:text-kf-faint focus:border-kf-accent focus:ring-2 focus:ring-kf-accent/15"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(event) =>
                  setTypeFilter(event.target.value)
                }
                aria-label="Filter by document type"
                className="h-11 rounded-xl border border-kf-border bg-kf-surface px-3.5 text-sm text-kf-ink outline-none transition focus:border-kf-accent focus:ring-2 focus:ring-kf-accent/15"
              >
                <option value="all">All types</option>

                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {formatDocumentType(type)}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value)
                }
                aria-label="Filter by document status"
                className="h-11 rounded-xl border border-kf-border bg-kf-surface px-3.5 text-sm text-kf-ink outline-none transition focus:border-kf-accent focus:ring-2 focus:ring-kf-accent/15"
              >
                <option value="all">All statuses</option>

                {(
                  [
                    "processed",
                    "processing",
                    "uploaded",
                    "failed",
                  ] as DocumentStatus[]
                ).map((status) => (
                  <option key={status} value={status}>
                    {getDocumentStatusLabel(status)}
                  </option>
                ))}
              </select>

              {hasFilters && (
                <Button
                  variant="secondary"
                  onClick={clearFilters}
                >
                  Clear
                </Button>
              )}
            </div>

            {hasFilters && (
              <div className="mt-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-kf-muted">
                  Showing{" "}
                  <span className="font-semibold text-kf-ink">
                    {filteredDocuments.length}
                  </span>{" "}
                  of {documents.length} documents
                </p>

                {searchQuery && (
                  <p className="truncate text-xs text-kf-faint">
                    Search: “{searchQuery}”
                  </p>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Main content */}
      {loading ? (
        <div className="kf-card flex min-h-[360px] items-center justify-center">
          <Spinner label="Loading documents..." />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<IconDocument size={22} />}
          title="Your library is empty"
          description="Upload your first document and KnowFlow will prepare it for search and knowledge retrieval."
          action={
            <Button href="/dashboard/documents/upload">
              <IconUpload size={16} />
              Add your first document
            </Button>
          }
        />
      ) : filteredDocuments.length === 0 ? (
        <EmptyState
          icon={<IconSearch size={22} />}
          title="No matching documents"
          description="Try a different search term or adjust your filters to find what you need."
          action={
            <Button
              variant="secondary"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <section className="kf-card overflow-hidden">
          {/* Desktop heading */}
          <div className="hidden border-b border-kf-border bg-kf-surface-muted/50 px-5 py-3 sm:grid sm:grid-cols-[minmax(0,1fr)_130px_120px]">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-kf-faint">
              Document
            </span>

            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-kf-faint">
              Status
            </span>

            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-kf-faint">
              Added
            </span>
          </div>

          <div className="divide-y divide-kf-border">
            {filteredDocuments.map((document) => (
              <DocumentRow
                key={document._id}
                document={document}
                onFavorite={() =>
                  void toggleFavorite(document._id)
                }
                onTrash={() =>
                  setDocumentToTrash(document)
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Upload hint */}
      {!loading && documents.length > 0 && (
        <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-kf-border bg-kf-surface/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-kf-accent-soft text-kf-accent-ink">
              <IconUpload size={16} />
            </div>

            <div>
              <p className="text-sm font-medium text-kf-ink">
                Have another document?
              </p>

              <p className="mt-0.5 text-xs leading-5 text-kf-muted">
                Add PDFs, documents, or supported text files
                to your library.
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/documents/upload"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-kf-accent-ink transition hover:gap-2"
          >
            Upload now
            <IconArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* Trash confirmation */}
      {documentToTrash && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-kf-ink/30 px-4 backdrop-blur-sm"
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
            className="w-full max-w-md overflow-hidden rounded-2xl border border-kf-border bg-kf-surface shadow-[var(--kf-shadow)]"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="border-b border-kf-border px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kf-error-soft text-kf-error">
                  <IconTrash size={20} />
                </div>

                <div>
                  <h2
                    id="trash-dialog-title"
                    className="text-lg font-semibold text-kf-ink"
                  >
                    Move to trash?
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-kf-muted">
                    The document will be removed from your
                    active library.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-xl border border-kf-border bg-kf-surface-muted px-4 py-3">
                <p className="truncate text-sm font-semibold text-kf-ink">
                  {documentToTrash.title}
                </p>

                <p className="mt-1 truncate text-xs text-kf-muted">
                  {documentToTrash.originalName}
                </p>
              </div>

              <p className="mt-3 text-xs leading-5 text-kf-muted">
                You can restore this document later from
                Trash.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  disabled={deleting}
                  onClick={() =>
                    setDocumentToTrash(null)
                  }
                >
                  Cancel
                </Button>

                <Button
                  variant="danger"
                  disabled={deleting}
                  onClick={() => void moveToTrash()}
                >
                  {deleting
                    ? "Moving..."
                    : "Move to trash"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LibraryMetric({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: number;
  detail: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-kf-border bg-kf-surface px-4 py-4 transition hover:border-kf-border-strong">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-kf-faint">
        {label}
      </p>

      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-2xl font-bold tracking-tight text-kf-ink">
          {value}
        </p>

        {icon ?? (
          <IconDocument
            size={16}
            className="mb-1 text-kf-faint"
          />
        )}
      </div>

      <p className="mt-1 text-xs text-kf-muted">
        {detail}
      </p>
    </div>
  );
}

function DocumentRow({
  document,
  onFavorite,
  onTrash,
}: {
  document: KnowledgeDocument;
  onFavorite: () => void;
  onTrash: () => void;
}) {
  const extension = getFileExtension(
    document.originalName,
  );

  return (
    <div className="group grid gap-4 px-4 py-4 transition hover:bg-kf-surface-muted sm:grid-cols-[minmax(0,1fr)_130px_120px] sm:px-5">
      {/* Document */}
      <div className="flex min-w-0 items-start gap-3.5">
        <Link
          href={`/dashboard/documents/${document._id}`}
          aria-label={`Open ${document.title}`}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-kf-border bg-kf-accent-soft text-[10px] font-bold uppercase tracking-wide text-kf-accent-ink transition hover:border-kf-accent/30"
        >
          {extension}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <Link
              href={`/dashboard/documents/${document._id}`}
              className="min-w-0 truncate text-sm font-semibold text-kf-ink transition hover:text-kf-accent-ink"
            >
              {document.title}
            </Link>

            <button
              type="button"
              onClick={onFavorite}
              aria-label={
                document.isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              aria-pressed={document.isFavorite}
              title={
                document.isFavorite
                  ? "Remove from favorites"
                  : "Add to favorites"
              }
              className="shrink-0 rounded-lg p-1.5 text-kf-faint transition hover:bg-kf-surface hover:text-kf-favorite focus:outline-none focus:ring-2 focus:ring-kf-accent/20"
            >
              <IconStar
                size={15}
                className={
                  document.isFavorite
                    ? "fill-current text-kf-favorite"
                    : ""
                }
              />
            </button>

            <button
              type="button"
              onClick={onTrash}
              aria-label={`Move ${document.title} to trash`}
              title="Move to trash"
              className="shrink-0 rounded-lg p-1.5 text-kf-faint opacity-70 transition hover:bg-kf-error-soft hover:text-kf-error focus:outline-none focus:ring-2 focus:ring-kf-error/20 sm:opacity-0 sm:group-hover:opacity-100"
            >
              <IconTrash size={15} />
            </button>
          </div>

          <p className="mt-1 truncate text-xs text-kf-muted">
            {formatDocumentType(
              document.documentType,
            )}{" "}
            · {formatBytes(document.fileSize)}
          </p>

          {document.tags.length > 0 && (
            <div className="mt-2 flex min-w-0 items-center gap-1.5 overflow-hidden">
              {document.tags
                .slice(0, 3)
                .map((tag) => (
                  <span
                    key={tag}
                    className="shrink-0 rounded-md bg-kf-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-kf-muted"
                  >
                    #{tag}
                  </span>
                ))}

              {document.tags.length > 3 && (
                <span className="shrink-0 text-[10px] text-kf-faint">
                  +{document.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 pl-[58px] sm:pl-0">
        <Badge
          tone={getDocumentStatusTone(
            document.status,
          )}
        >
          {getDocumentStatusLabel(
            document.status,
          )}
        </Badge>
      </div>

      {/* Added */}
      <p className="pl-[58px] text-xs text-kf-muted sm:pl-0">
        <span className="sm:hidden">Added </span>
        {formatDate(document.createdAt)}
      </p>
    </div>
  );
}