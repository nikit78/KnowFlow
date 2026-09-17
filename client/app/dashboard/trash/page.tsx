"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "../layout";
import { apiFetch, ApiError } from "@/lib/api";
import type { KnowledgeDocument } from "@/lib/types";
import {
  formatBytes,
  formatDate,
  formatDocumentType,
  getFileExtension,
} from "@/lib/format";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Spinner from "@/components/ui/Spinner";
import {
  IconArrowRight,
  IconCheck,
  IconDocument,
  IconRestore,
  IconTrash,
} from "@/components/icons";

type TrashResponse = {
  success: boolean;
  documents?: KnowledgeDocument[];
  message?: string;
};

export default function TrashPage() {
  useDashboard();
  const router = useRouter();

  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [documentToRestore, setDocumentToRestore] =
    useState<KnowledgeDocument | null>(null);
  const [restoring, setRestoring] = useState(false);

  const [documentToDelete, setDocumentToDelete] =
    useState<KnowledgeDocument | null>(null);
  const [permanentlyDeleting, setPermanentlyDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch<TrashResponse>(
          "/documents/trash",
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
              : "Something went wrong while loading trash.",
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

  async function restoreDocument() {
    if (!documentToRestore) return;

    try {
      setRestoring(true);
      setError("");

      await apiFetch(
        `/documents/${documentToRestore._id}/restore`,
        {
          method: "PATCH",
        },
      );

      setDocuments((current) =>
        current.filter(
          (doc) => doc._id !== documentToRestore._id,
        ),
      );

      setDocumentToRestore(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Failed to restore document.",
      );
    } finally {
      setRestoring(false);
    }
  }

  async function permanentlyDeleteDocument() {
    if (!documentToDelete) return;

    try {
      setPermanentlyDeleting(true);
      setError("");

      await apiFetch(
        `/documents/${documentToDelete._id}/permanent`,
        {
          method: "DELETE",
        },
      );

      setDocuments((current) =>
        current.filter(
          (doc) => doc._id !== documentToDelete._id,
        ),
      );

      setDocumentToDelete(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Failed to permanently delete document.",
      );
    } finally {
      setPermanentlyDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-kf-accent-ink">
            Document recovery
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-kf-ink sm:text-4xl">
            Trash
          </h1>

          <p className="mt-3 text-sm leading-6 text-kf-muted sm:text-base">
            Recover documents you removed from your workspace or
            permanently delete them when you no longer need them.
          </p>
        </div>

        <Button
          variant="secondary"
          href="/dashboard/documents"
        >
          <IconDocument size={16} />
          Documents
          <IconArrowRight size={15} />
        </Button>
      </section>

      {/* Overview */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="kf-card p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-kf-muted">
            In trash
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-kf-ink">
            {loading ? "—" : documents.length}
          </p>

          <p className="mt-2 text-xs text-kf-faint">
            Documents currently removed
          </p>
        </div>

        <div className="kf-card p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-kf-muted">
            Recovery
          </p>

          <p className="mt-3 text-sm font-semibold text-kf-ink">
            Restore anytime
          </p>

          <p className="mt-2 text-xs leading-5 text-kf-faint">
            Restore a document back to your Documents workspace.
          </p>
        </div>

        <div className="kf-card hidden p-5 sm:block">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-kf-muted">
            Permanent deletion
          </p>

          <p className="mt-3 text-sm font-semibold text-kf-error">
            Cannot be undone
          </p>

          <p className="mt-2 text-xs leading-5 text-kf-faint">
            Only permanently delete documents when you are sure.
          </p>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-kf-error/20 bg-kf-error-soft px-4 py-4 text-sm text-kf-error sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">
              Something went wrong
            </p>

            <p className="mt-1 opacity-90">
              {error}
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.refresh()}
            className="w-fit rounded-lg px-3 py-2 font-semibold hover:bg-white/60 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="kf-card flex min-h-[320px] items-center justify-center">
          <Spinner label="Loading trash..." />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<IconCheck size={22} />}
          title="Trash is empty"
          description="Documents you move to trash will appear here. You can restore them whenever you need."
          action={
            <Button href="/dashboard/documents">
              <IconDocument size={16} />
              Back to documents
              <IconArrowRight size={15} />
            </Button>
          }
        />
      ) : (
        <section>
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-kf-accent-ink">
              Removed documents
            </p>

            <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-kf-ink">
                  Recently deleted
                </h2>

                <p className="mt-1 text-sm text-kf-muted">
                  Restore documents or permanently remove them.
                </p>
              </div>

              <span className="text-xs text-kf-faint">
                {documents.length}{" "}
                {documents.length === 1
                  ? "document"
                  : "documents"}
              </span>
            </div>
          </div>

          <div className="kf-card overflow-hidden">
            {/* Desktop heading */}
            <div className="hidden border-b border-kf-border px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-kf-faint sm:grid sm:grid-cols-[minmax(0,1fr)_130px_auto] sm:items-center sm:gap-5">
              <span>Document</span>
              <span>Deleted</span>
              <span>Actions</span>
            </div>

            <div className="divide-y divide-kf-border">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="px-5 py-5 transition hover:bg-kf-surface-muted/40"
                >
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_130px_auto] sm:items-center sm:gap-5">
                    {/* Document */}
                    <div className="flex min-w-0 items-start gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kf-error-soft text-[10px] font-bold uppercase tracking-wide text-kf-error">
                        {getFileExtension(doc.originalName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-kf-ink">
                          {doc.title}
                        </p>

                        <p className="mt-1 truncate text-xs text-kf-muted">
                          {doc.originalName}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-kf-muted">
                          <span>
                            {formatDocumentType(
                              doc.documentType,
                            )}
                          </span>

                          <span aria-hidden="true">·</span>

                          <span>
                            {formatBytes(doc.fileSize)}
                          </span>
                        </div>

                        {doc.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {doc.tags
                              .slice(0, 3)
                              .map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md border border-kf-border bg-kf-surface-muted px-2 py-1 text-[10px] font-medium text-kf-muted"
                                >
                                  #{tag}
                                </span>
                              ))}

                            {doc.tags.length > 3 && (
                              <span className="rounded-md bg-kf-surface-muted px-2 py-1 text-[10px] text-kf-faint">
                                +{doc.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <p className="mt-2 text-xs text-kf-faint sm:hidden">
                          Deleted{" "}
                          {formatDate(
                            doc.deletedAt || doc.createdAt,
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Deleted date */}
                    <p className="hidden text-xs text-kf-muted sm:block">
                      {formatDate(
                        doc.deletedAt || doc.createdAt,
                      )}
                    </p>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setDocumentToRestore(doc)
                        }
                      >
                        <IconRestore size={14} />
                        Restore
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDocumentToDelete(doc)
                        }
                        className="text-kf-error hover:bg-kf-error-soft"
                      >
                        <IconTrash size={14} />
                        <span className="hidden sm:inline">
                          Delete
                        </span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Restore modal */}
      {documentToRestore && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-kf-ink/35 px-4 backdrop-blur-sm"
          onClick={() => {
            if (!restoring) {
              setDocumentToRestore(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="restore-document-title"
            className="w-full max-w-md rounded-2xl border border-kf-border bg-kf-surface p-6 shadow-[var(--kf-shadow)] sm:p-7"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-kf-success-soft text-kf-success">
              <IconRestore size={20} />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-kf-success">
              Document recovery
            </p>

            <h2
              id="restore-document-title"
              className="mt-1 text-xl font-semibold text-kf-ink"
            >
              Restore document?
            </h2>

            <p className="mt-2 text-sm leading-6 text-kf-muted">
              <span className="font-semibold text-kf-ink">
                {documentToRestore.title}
              </span>{" "}
              will be restored to your Documents workspace.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                disabled={restoring}
                onClick={() =>
                  setDocumentToRestore(null)
                }
              >
                Cancel
              </Button>

              <Button
                disabled={restoring}
                onClick={() =>
                  void restoreDocument()
                }
              >
                <IconRestore size={15} />
                {restoring
                  ? "Restoring..."
                  : "Restore document"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent delete modal */}
      {documentToDelete && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-kf-ink/35 px-4 backdrop-blur-sm"
          onClick={() => {
            if (!permanentlyDeleting) {
              setDocumentToDelete(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="permanent-delete-title"
            className="w-full max-w-md rounded-2xl border border-kf-border bg-kf-surface p-6 shadow-[var(--kf-shadow)] sm:p-7"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-kf-error-soft text-kf-error">
              <IconTrash size={20} />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-kf-error">
              Permanent deletion
            </p>

            <h2
              id="permanent-delete-title"
              className="mt-1 text-xl font-semibold text-kf-ink"
            >
              Permanently delete document?
            </h2>

            <p className="mt-2 text-sm leading-6 text-kf-muted">
              <span className="font-semibold text-kf-ink">
                {documentToDelete.title}
              </span>{" "}
              will be permanently removed from KnowFlow.
            </p>

            <div className="mt-4 rounded-xl border border-kf-error/15 bg-kf-error-soft px-3.5 py-3 text-xs font-medium leading-5 text-kf-error">
              This action cannot be undone.
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                disabled={permanentlyDeleting}
                onClick={() =>
                  setDocumentToDelete(null)
                }
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                disabled={permanentlyDeleting}
                onClick={() =>
                  void permanentlyDeleteDocument()
                }
              >
                <IconTrash size={15} />
                {permanentlyDeleting
                  ? "Deleting..."
                  : "Delete permanently"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}