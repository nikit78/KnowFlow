"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDashboard } from "../../layout";
import { apiFetch, ApiError } from "@/lib/api";
import type { Collection, KnowledgeDocument } from "@/lib/types";
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
  IconArrowLeft,
  IconArrowRight,
  IconDocument,
  IconFolder,
  IconPlus,
} from "@/components/icons";

type CollectionResponse = {
  success?: boolean;
  collection?: Collection;
  message?: string;
};

type DocumentsResponse = {
  success?: boolean;
  documents?: KnowledgeDocument[];
  message?: string;
};

export default function CollectionDetailPage() {
  useDashboard();

  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [allDocuments, setAllDocuments] = useState<KnowledgeDocument[]>([]);

  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  const [error, setError] = useState("");
  const [documentsError, setDocumentsError] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  const [addingDocumentId, setAddingDocumentId] = useState<string | null>(
    null,
  );

  const [removeTarget, setRemoveTarget] =
    useState<KnowledgeDocument | null>(null);
  const [removingDocumentId, setRemovingDocumentId] = useState<string | null>(
    null,
  );

  const fetchCollection = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch<CollectionResponse>(
        `/collections/${collectionId}`,
      );

      setCollection(data.collection ?? null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setError(
        err instanceof Error ? err.message : "Failed to load collection",
      );
    } finally {
      setLoading(false);
    }
  }, [collectionId, router]);

  const fetchDocuments = useCallback(async () => {
    try {
      setDocumentsLoading(true);
      setDocumentsError("");

      const data = await apiFetch<DocumentsResponse>(
        "/documents?page=1&limit=100",
      );

      setAllDocuments(data.documents ?? []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setDocumentsError(
        err instanceof Error ? err.message : "Failed to load documents",
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

  const collectionDocuments = useMemo(() => {
    if (!collection?.documents) {
      return [] as KnowledgeDocument[];
    }

    return collection.documents.filter(
      (doc): doc is KnowledgeDocument => typeof doc !== "string",
    );
  }, [collection]);

  const collectionDocumentIds = useMemo(
    () => new Set(collectionDocuments.map((doc) => doc._id)),
    [collectionDocuments],
  );

  const availableDocuments = useMemo(
    () =>
      allDocuments.filter((doc) => !collectionDocumentIds.has(doc._id)),
    [allDocuments, collectionDocumentIds],
  );

  async function addDocument(documentId: string) {
    try {
      setAddingDocumentId(documentId);
      setDocumentsError("");

      await apiFetch(
        `/collections/${collectionId}/documents/${documentId}`,
        {
          method: "POST",
        },
      );

      await fetchCollection();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setDocumentsError(
        err instanceof Error ? err.message : "Failed to add document",
      );
    } finally {
      setAddingDocumentId(null);
    }
  }

  async function removeDocument(documentId: string) {
    try {
      setRemovingDocumentId(documentId);
      setError("");

      await apiFetch(
        `/collections/${collectionId}/documents/${documentId}`,
        {
          method: "DELETE",
        },
      );

      setRemoveTarget(null);

      await fetchCollection();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setError(
        err instanceof Error ? err.message : "Failed to remove document",
      );
    } finally {
      setRemovingDocumentId(null);
    }
  }

  function openAddModal() {
    setDocumentsError("");
    setShowAddModal(true);
    void fetchDocuments();
  }

  if (loading) {
    return (
      <div className="flex min-h-[360px] items-center justify-center">
        <Spinner label="Loading collection..." />
      </div>
    );
  }

  if (error && !collection) {
    return (
      <div className="mx-auto max-w-lg space-y-5">
        <Button
          variant="ghost"
          size="sm"
          href="/dashboard/collections"
        >
          <IconArrowLeft size={15} />
          Back to collections
        </Button>

        <div className="kf-card p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-kf-error-soft text-kf-error">
            !
          </div>

          <h1 className="mt-5 text-xl font-semibold text-kf-ink">
            Unable to load collection
          </h1>

          <p className="mt-2 text-sm leading-6 text-kf-muted">
            {error}
          </p>

          <Button
            className="mt-6"
            onClick={() => void fetchCollection()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!collection) return null;

  const collectionColor = collection.color || "#0f766e";

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Breadcrumb / Back */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          href="/dashboard/collections"
        >
          <IconArrowLeft size={15} />
          Back to collections
        </Button>
      </div>

      {/* Collection hero */}
      <section className="kf-card relative overflow-hidden p-6 sm:p-8">
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{
            backgroundColor: collectionColor,
          }}
        />

        <div
          className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full opacity-40 blur-2xl"
          style={{
            backgroundColor: `${collectionColor}18`,
          }}
        />

        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4 sm:gap-5">
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-black/5 text-3xl shadow-sm sm:h-20 sm:w-20 sm:text-4xl"
              style={{
                backgroundColor: `${collectionColor}18`,
              }}
            >
              {collection.icon || "📚"}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-kf-accent-ink">
                Knowledge collection
              </p>

              <h1 className="mt-2 truncate text-2xl font-bold tracking-tight text-kf-ink sm:text-3xl">
                {collection.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-kf-muted">
                {collection.description ||
                  "Organize related documents in one focused knowledge space."}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-kf-surface-muted px-3 py-1.5 text-xs font-medium text-kf-ink-soft">
                  {collectionDocuments.length}{" "}
                  {collectionDocuments.length === 1
                    ? "document"
                    : "documents"}
                </span>

                {collection.createdAt && (
                  <span className="text-xs text-kf-faint">
                    Created {formatDate(collection.createdAt)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={openAddModal}
            className="shrink-0"
          >
            <IconPlus size={16} />
            Add documents
          </Button>
        </div>
      </section>

      {/* Page error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-kf-error/20 bg-kf-error-soft px-4 py-4 text-sm text-kf-error sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1 opacity-90">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => void fetchCollection()}
            className="w-fit rounded-lg px-3 py-2 font-semibold hover:bg-white/60 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Documents */}
      <section>
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-kf-accent-ink">
              Library
            </p>

            <h2 className="mt-1 text-xl font-semibold text-kf-ink">
              Documents in this collection
            </h2>

            <p className="mt-1 text-sm text-kf-muted">
              Everything currently organized inside this knowledge space.
            </p>
          </div>

          <span className="text-xs font-medium text-kf-muted">
            {collectionDocuments.length} total
          </span>
        </div>

        {collectionDocuments.length === 0 ? (
          <EmptyState
            icon={<IconFolder size={22} />}
            title="This collection is empty"
            description="Add documents from your library to start building this focused knowledge space."
            action={
              <Button onClick={openAddModal}>
                <IconPlus size={16} />
                Add your first document
              </Button>
            }
          />
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            {collectionDocuments.map((doc) => {
              const extension = getFileExtension(
                doc.originalName || "FILE",
              );

              return (
                <article
                  key={doc._id}
                  className="kf-card group relative overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:border-kf-border-strong"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-kf-accent-soft text-[10px] font-bold uppercase tracking-wide text-kf-accent-ink">
                      {extension}
                    </div>

                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/dashboard/documents/${doc._id}`,
                          )
                        }
                        className="block max-w-full text-left"
                        aria-label={`Open ${doc.title}`}
                      >
                        <h3 className="truncate text-base font-semibold text-kf-ink transition group-hover:text-kf-accent-ink">
                          {doc.title}
                        </h3>

                        <p className="mt-1 truncate text-xs text-kf-muted">
                          {doc.originalName || "Document"}
                        </p>
                      </button>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">
                          {formatDocumentType(doc.documentType)}
                        </Badge>

                        <Badge tone={getDocumentStatusTone(doc.status)}>
                          {getDocumentStatusLabel(doc.status)}
                        </Badge>

                        <span className="text-[11px] text-kf-muted">
                          {formatBytes(doc.fileSize || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-kf-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs text-kf-faint">
                      {doc.createdAt ? formatDate(doc.createdAt) : ""}
                    </span>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        href={`/dashboard/documents/${doc._id}`}
                      >
                        Open
                        <IconArrowRight size={14} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={removingDocumentId === doc._id}
                        onClick={() => setRemoveTarget(doc)}
                        className="text-kf-error hover:bg-kf-error-soft"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Add documents modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-kf-ink/35 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
          <div
            className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-kf-border bg-kf-surface shadow-[var(--kf-shadow)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-documents-title"
          >
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 border-b border-kf-border p-6 sm:p-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-kf-accent-ink">
                  Add to collection
                </p>

                <h2
                  id="add-documents-title"
                  className="mt-1 text-xl font-semibold text-kf-ink"
                >
                  Choose documents
                </h2>

                <p className="mt-1.5 text-sm leading-5 text-kf-muted">
                  Select documents from your library to add to{" "}
                  <span className="font-medium text-kf-ink">
                    {collection.name}
                  </span>
                  .
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                aria-label="Close add documents dialog"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-kf-faint transition hover:bg-kf-surface-muted hover:text-kf-ink"
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div className="overflow-y-auto p-5 sm:p-6">
              {documentsLoading ? (
                <div className="flex justify-center py-12">
                  <Spinner label="Loading documents..." />
                </div>
              ) : documentsError ? (
                <div className="rounded-xl border border-kf-error/15 bg-kf-error-soft p-5 text-center text-sm text-kf-error">
                  <p>{documentsError}</p>

                  <button
                    type="button"
                    onClick={() => void fetchDocuments()}
                    className="mt-3 font-semibold hover:underline"
                  >
                    Retry
                  </button>
                </div>
              ) : availableDocuments.length === 0 ? (
                <EmptyState
                  icon={<IconDocument size={20} />}
                  title="All documents are already added"
                  description="There are no other active documents available in your library."
                />
              ) : (
                <div className="space-y-3">
                  {availableDocuments.map((doc) => (
                    <div
                      key={doc._id}
                      className="group flex flex-col gap-4 rounded-xl border border-kf-border p-4 transition hover:border-kf-border-strong hover:bg-kf-surface-muted/40 sm:flex-row sm:items-center"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-kf-accent-soft text-[10px] font-bold uppercase tracking-wide text-kf-accent-ink">
                          {getFileExtension(doc.originalName || "FILE")}
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-kf-ink">
                            {doc.title}
                          </h3>

                          <p className="mt-1 truncate text-[11px] text-kf-muted">
                            {formatDocumentType(doc.documentType)} ·{" "}
                            {formatBytes(doc.fileSize || 0)}
                          </p>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        disabled={addingDocumentId === doc._id}
                        onClick={() => void addDocument(doc._id)}
                        className="shrink-0"
                      >
                        {addingDocumentId === doc._id
                          ? "Adding..."
                          : "Add"}
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="flex justify-end border-t border-kf-border p-5">
              <Button
                variant="secondary"
                onClick={() => setShowAddModal(false)}
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Remove confirmation modal */}
      {removeTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-kf-ink/35 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !removingDocumentId
            ) {
              setRemoveTarget(null);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-kf-border bg-kf-surface p-6 shadow-[var(--kf-shadow)] sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="remove-document-title"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-kf-error-soft text-kf-error">
              !
            </div>

            <h2
              id="remove-document-title"
              className="mt-5 text-xl font-semibold text-kf-ink"
            >
              Remove document?
            </h2>

            <p className="mt-2 text-sm leading-6 text-kf-muted">
              Remove{" "}
              <span className="font-semibold text-kf-ink">
                {removeTarget.title}
              </span>{" "}
              from this collection?
              <span className="mt-1 block">
                The document itself will remain in your library.
              </span>
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                disabled={Boolean(removingDocumentId)}
                onClick={() => setRemoveTarget(null)}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                disabled={Boolean(removingDocumentId)}
                onClick={() =>
                  void removeDocument(removeTarget._id)
                }
              >
                {removingDocumentId === removeTarget._id
                  ? "Removing..."
                  : "Remove document"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}