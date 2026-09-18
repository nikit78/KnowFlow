"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDashboard } from "../../layout";
import { apiFetch, ApiError, API_URL } from "@/lib/api";
import type { DocumentType, KnowledgeDocument } from "@/lib/types";
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
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import {
  IconArrowLeft,
  IconArrowRight,
  IconDownload,
  IconEye,
  IconPlus,
  IconStar,
  IconTrash,
} from "@/components/icons";

type DocumentDetail = KnowledgeDocument & {
  fileName?: string;
  isDeleted?: boolean;
};

type DocumentChunk = {
  _id: string;
  document: string;
  chunkIndex: number;
  text: string;
  embedding?: number[];
};

type DocumentResponse = {
  success: boolean;
  document?: DocumentDetail;
  message?: string;
};

type ChunksResponse = {
  success: boolean;
  chunks?: DocumentChunk[];
  message?: string;
};

export default function DocumentDetailPage() {
  useDashboard();

  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const [document, setDocument] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [trashLoading, setTrashLoading] = useState(false);
  const [showTrashDialog, setShowTrashDialog] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDocumentType, setEditDocumentType] =
    useState<DocumentType>("other");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [chunksLoading, setChunksLoading] = useState(false);
  const [chunksError, setChunksError] = useState("");
  const [chunksLoaded, setChunksLoaded] = useState(false);

  useEffect(() => {
    if (!documentId) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await apiFetch<DocumentResponse>(
          `/documents/${documentId}`,
        );

        if (!cancelled) {
          setDocument(data.document ?? null);
        }
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/auth/login");
          return;
        }

        if (err instanceof ApiError && err.status === 404) {
          if (!cancelled) {
            setError("Document not found.");
          }
          return;
        }

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading the document.",
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
  }, [documentId, router]);

  async function toggleFavorite() {
    if (!document || favoriteLoading) return;

    try {
      setFavoriteLoading(true);
      setError("");

      await apiFetch(`/documents/${document._id}/favorite`, {
        method: "PATCH",
      });

      setDocument((current) =>
        current
          ? {
              ...current,
              isFavorite: !current.isFavorite,
            }
          : current,
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setError(
        err instanceof Error ? err.message : "Failed to update favorite.",
      );
    } finally {
      setFavoriteLoading(false);
    }
  }

  async function moveToTrash() {
    if (!document || trashLoading) return;

    try {
      setTrashLoading(true);
      setError("");

      await apiFetch(`/documents/${document._id}`, {
        method: "DELETE",
      });

      setShowTrashDialog(false);
      router.push("/dashboard/trash");
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
      setTrashLoading(false);
    }
  }

  function startEditing() {
    if (!document) return;

    setEditTitle(document.title);
    setEditDocumentType(document.documentType as DocumentType);
    setEditTags([...document.tags]);
    setNewTag("");
    setSaveError("");
    setSaveSuccess("");
    setIsEditing(true);
  }

  function addTag() {
    const trimmed = newTag.trim();

    if (!trimmed) return;

    if (
      editTags.some(
        (tag) => tag.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setNewTag("");
      return;
    }

    setEditTags((current) => [...current, trimmed]);
    setNewTag("");
  }

  async function saveMetadata() {
    if (!document || saveLoading) return;

    const trimmedTitle = editTitle.trim();

    if (!trimmedTitle) {
      setSaveError("Document title cannot be empty.");
      return;
    }

    try {
      setSaveLoading(true);
      setSaveError("");
      setSaveSuccess("");

      const data = await apiFetch<DocumentResponse>(
        `/documents/${document._id}`,
        {
          method: "PATCH",
          body: {
            title: trimmedTitle,
            documentType: editDocumentType,
            tags: editTags,
          },
        },
      );

      if (data.document) {
        setDocument(data.document);
        setEditTitle(data.document.title);
        setEditDocumentType(
          data.document.documentType as DocumentType,
        );
        setEditTags(data.document.tags);
      }

      setSaveSuccess("Changes saved successfully.");

      setTimeout(() => {
        setSaveSuccess("");
      }, 2500);

      setIsEditing(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setSaveError(
        err instanceof Error
          ? err.message
          : "Failed to update document.",
      );
    } finally {
      setSaveLoading(false);
    }
  }

  async function previewDocument() {
    if (!document) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/documents/${document._id}/preview`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/auth/login");
          return;
        }

        throw new Error("Failed to preview document.");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      window.open(blobUrl, "_blank", "noopener,noreferrer");

      window.setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60_000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to preview document."
      );
    }
  }

  async function downloadDocument() {
    if (!document) return;

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/documents/${document._id}/download`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          router.replace("/auth/login");
          return;
        }

        throw new Error("Failed to download document.");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = document.originalName;
      link.style.display = "none";

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 60_000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to download document."
      );
    }
  }

  async function loadChunks() {
    if (!document || chunksLoading) return;

    try {
      setChunksLoading(true);
      setChunksError("");

      const data = await apiFetch<ChunksResponse>(
        `/documents/${document._id}/chunks`,
      );

      setChunks(data.chunks ?? []);
      setChunksLoaded(true);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setChunksError(
        err instanceof Error
          ? err.message
          : "Failed to load document chunks.",
      );
    } finally {
      setChunksLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Spinner label="Loading document..." />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="mx-auto flex min-h-[420px] max-w-md items-center justify-center">
        <div className="kf-card w-full p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-kf-error-soft text-kf-error">
            <IconTrash size={20} />
          </div>

          <h1 className="mt-5 text-xl font-semibold text-kf-ink">
            Unable to open document
          </h1>

          <p className="mt-2 text-sm leading-6 text-kf-muted">
            {error || "This document could not be found."}
          </p>

          <Button
            href="/dashboard/documents"
            className="mt-6"
          >
            <IconArrowLeft size={15} />
            Back to documents
          </Button>
        </div>
      </div>
    );
  }

  const extension = getFileExtension(document.originalName);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Breadcrumb / top actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button
          variant="ghost"
          size="sm"
          href="/dashboard/documents"
        >
          <IconArrowLeft size={15} />
          Documents
        </Button>

        <Button
          href="/dashboard/documents/upload"
          size="sm"
        >
          <IconPlus size={16} />
          Add document
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-kf-error/20 bg-kf-error-soft px-4 py-3 text-sm text-kf-error"
        >
          {error}
        </div>
      )}

      {/* Main document card */}
      <section className="kf-card overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
            {/* Document identity */}
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-kf-border bg-kf-accent-soft text-xs font-bold uppercase tracking-wide text-kf-accent-ink">
                {extension}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="break-words text-2xl font-bold tracking-tight text-kf-ink sm:text-3xl">
                    {document.title}
                  </h1>

                  {document.isFavorite && (
                    <span
                      className="flex h-7 w-7 items-center justify-center rounded-lg bg-kf-favorite-soft"
                      title="Favorite"
                    >
                      <IconStar
                        size={15}
                        className="fill-current text-kf-favorite"
                      />
                    </span>
                  )}
                </div>

                <p className="mt-2 break-all text-sm text-kf-muted">
                  {document.originalName}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge
                    tone={getDocumentStatusTone(document.status)}
                  >
                    {getDocumentStatusLabel(document.status)}
                  </Badge>

                  <span className="text-xs text-kf-faint">
                    Added {formatDate(document.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 xl:max-w-[520px] xl:justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void toggleFavorite()}
                disabled={favoriteLoading}
              >
                <IconStar
                  size={14}
                  className={
                    document.isFavorite
                      ? "fill-current text-kf-favorite"
                      : undefined
                  }
                />
                {favoriteLoading
                  ? "Saving..."
                  : document.isFavorite
                    ? "Favorited"
                    : "Favorite"}
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => void previewDocument()}
              >
                <IconEye size={14} />
                Preview
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => void downloadDocument()}
              >
                <IconDownload size={14} />
                Download
              </Button>

              <Button
                variant="secondary"
                size="sm"
                onClick={startEditing}
                disabled={isEditing}
              >
                Edit details
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTrashDialog(true)}
                className="text-kf-error hover:bg-kf-error-soft"
              >
                <IconTrash size={14} />
                Trash
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-kf-border bg-kf-border sm:grid-cols-2 lg:grid-cols-4">
            <MetaItem
              label="Document type"
              value={formatDocumentType(document.documentType)}
            />

            <MetaItem
              label="File size"
              value={formatBytes(document.fileSize)}
            />

            <MetaItem
              label="File format"
              value={extension}
            />

            <MetaItem
              label="Added"
              value={formatDate(document.createdAt)}
            />
          </div>

          {/* Tags */}
          {document.tags.length > 0 && (
            <div className="mt-7 border-t border-kf-border pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-kf-faint">
                Tags
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {document.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg border border-kf-border bg-kf-surface-muted px-2.5 py-1 text-xs font-medium text-kf-ink-soft"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Edit panel */}
        {isEditing && (
          <div className="border-t border-kf-border bg-kf-surface-muted/45 p-6 sm:p-8">
            <div className="mx-auto max-w-3xl">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-kf-accent-ink">
                  Document settings
                </p>

                <h2 className="mt-1 text-lg font-semibold text-kf-ink">
                  Edit document details
                </h2>

                <p className="mt-1 text-sm text-kf-muted">
                  Update the metadata used to organize and retrieve this
                  document.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                <Input
                  id="document-title"
                  label="Title"
                  value={editTitle}
                  onChange={(event) =>
                    setEditTitle(event.target.value)
                  }
                  disabled={saveLoading}
                />

                <div>
                  <label
                    htmlFor="document-type"
                    className="mb-2 block text-sm font-medium text-kf-ink-soft"
                  >
                    Document type
                  </label>

                  <select
                    id="document-type"
                    value={editDocumentType}
                    onChange={(event) =>
                      setEditDocumentType(
                        event.target.value as DocumentType,
                      )
                    }
                    disabled={saveLoading}
                    className="h-11 w-full rounded-xl border border-kf-border bg-kf-surface px-3.5 text-sm text-kf-ink outline-none transition focus:border-kf-accent focus:ring-2 focus:ring-kf-accent/15"
                  >
                    <option value="research-paper">
                      Research Paper
                    </option>
                    <option value="annual-report">
                      Annual Report
                    </option>
                    <option value="financial-statement">
                      Financial Statement
                    </option>
                    <option value="lecture-notes">
                      Lecture Notes
                    </option>
                    <option value="book">Book</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-kf-ink-soft">
                    Tags
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(event) =>
                        setNewTag(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          addTag();
                        }
                      }}
                      disabled={saveLoading}
                      placeholder="Add a tag..."
                      className="h-11 min-w-0 flex-1 rounded-xl border border-kf-border bg-kf-surface px-3.5 text-sm text-kf-ink outline-none transition placeholder:text-kf-faint focus:border-kf-accent focus:ring-2 focus:ring-kf-accent/15"
                    />

                    <Button
                      variant="secondary"
                      onClick={addTag}
                      disabled={
                        saveLoading || !newTag.trim()
                      }
                    >
                      <IconPlus size={15} />
                      Add
                    </Button>
                  </div>

                  {editTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {editTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-kf-border bg-kf-surface px-2.5 py-1.5 text-xs font-medium text-kf-ink-soft"
                        >
                          #{tag}

                          <button
                            type="button"
                            onClick={() =>
                              setEditTags((current) =>
                                current.filter(
                                  (item) => item !== tag,
                                ),
                              )
                            }
                            disabled={saveLoading}
                            aria-label={`Remove ${tag}`}
                            className="rounded-md px-1 text-kf-faint transition hover:bg-kf-error-soft hover:text-kf-error"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {saveError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-kf-error/20 bg-kf-error-soft px-4 py-3 text-sm text-kf-error"
                  >
                    {saveError}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-2 border-t border-kf-border pt-5 sm:flex-row sm:justify-end">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      if (!saveLoading) {
                        setIsEditing(false);
                      }
                    }}
                    disabled={saveLoading}
                  >
                    Cancel
                  </Button>

                  <Button
                    onClick={() => void saveMetadata()}
                    disabled={saveLoading}
                  >
                    {saveLoading
                      ? "Saving..."
                      : "Save changes"}
                    {!saveLoading && (
                      <IconArrowRight size={15} />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {saveSuccess && (
          <div className="border-t border-kf-border px-6 py-4 sm:px-8">
            <div className="rounded-xl border border-kf-success/20 bg-kf-success-soft px-4 py-3 text-sm text-kf-success">
              {saveSuccess}
            </div>
          </div>
        )}
      </section>

      {/* Extracted content */}
      <section className="kf-card overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-kf-border px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-kf-accent-ink">
              Knowledge source
            </p>

            <h2 className="mt-1 text-lg font-semibold text-kf-ink">
              Extracted content
            </h2>

            <p className="mt-1 text-sm text-kf-muted">
              Text extracted from your uploaded document and used by
              KnowFlow for retrieval.
            </p>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => void loadChunks()}
            disabled={chunksLoading}
          >
            {chunksLoading
              ? "Loading chunks..."
              : chunksLoaded
                ? "Reload chunks"
                : "View chunks"}
            {!chunksLoading && (
              <IconArrowRight size={14} />
            )}
          </Button>
        </div>

        {document.extractedText ? (
          <div className="max-h-[620px] overflow-y-auto px-6 py-7 sm:px-8">
            <div className="rounded-2xl border border-kf-border bg-kf-surface-muted/45 p-5 sm:p-6">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-kf-ink-soft">
                {document.extractedText}
              </pre>
            </div>
          </div>
        ) : (
          <div className="flex min-h-[240px] items-center justify-center px-6 text-center">
            <div className="max-w-sm">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-kf-surface-muted text-kf-faint">
                <IconEye size={19} />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-kf-ink">
                Content not available
              </h3>

              <p className="mt-1 text-sm leading-6 text-kf-muted">
                No extracted text is available for this document yet.
              </p>
            </div>
          </div>
        )}

        {/* Chunks */}
        {chunksLoaded && (
          <div className="border-t border-kf-border">
            <div className="border-b border-kf-border px-6 py-5 sm:px-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-kf-faint">
                    Retrieval data
                  </p>

                  <h2 className="mt-1 text-base font-semibold text-kf-ink">
                    Document chunks
                  </h2>

                  <p className="mt-1 text-xs text-kf-muted">
                    {chunks.length}{" "}
                    {chunks.length === 1
                      ? "chunk"
                      : "chunks"}{" "}
                    available for knowledge retrieval.
                  </p>
                </div>

                {chunks.length > 0 && (
                  <span className="rounded-lg bg-kf-accent-soft px-2.5 py-1 text-[11px] font-semibold text-kf-accent-ink">
                    Retrieval ready
                  </span>
                )}
              </div>
            </div>

            {chunksError ? (
              <div className="p-6 text-sm text-kf-error">
                {chunksError}
              </div>
            ) : chunks.length === 0 ? (
              <div className="flex min-h-[180px] items-center justify-center px-6 text-center">
                <div>
                  <h3 className="text-sm font-medium text-kf-ink">
                    No chunks found
                  </h3>

                  <p className="mt-1 text-xs text-kf-muted">
                    No processed chunks are available for this
                    document yet.
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-kf-border">
                {chunks.map((chunk) => (
                  <article
                    key={chunk._id}
                    className="px-6 py-6 transition hover:bg-kf-surface-muted/40 sm:px-8"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Badge tone="accent">
                        Chunk {chunk.chunkIndex + 1}
                      </Badge>

                      {chunk.embedding &&
                        chunk.embedding.length > 0 && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-kf-success">
                            <span className="h-1.5 w-1.5 rounded-full bg-kf-success" />
                            Embedded
                          </span>
                        )}
                    </div>

                    <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-kf-ink-soft">
                      {chunk.text}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Trash modal */}
      {showTrashDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-kf-ink/30 px-4 backdrop-blur-sm"
          onClick={() => {
            if (!trashLoading) {
              setShowTrashDialog(false);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="trash-dialog-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-kf-border bg-kf-surface shadow-[var(--kf-shadow)]"
            onClick={(event) => event.stopPropagation()}
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
                    Move document to trash?
                  </h2>

                  <p className="mt-1 text-sm leading-5 text-kf-muted">
                    This document will be removed from your active
                    library.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="rounded-xl border border-kf-border bg-kf-surface-muted px-4 py-3">
                <p className="truncate text-sm font-semibold text-kf-ink">
                  {document.title}
                </p>

                <p className="mt-1 truncate text-xs text-kf-muted">
                  {document.originalName}
                </p>
              </div>

              <p className="mt-3 text-xs leading-5 text-kf-muted">
                You can restore this document later from the Trash
                section.
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  disabled={trashLoading}
                  onClick={() =>
                    setShowTrashDialog(false)
                  }
                >
                  Cancel
                </Button>

                <Button
                  variant="danger"
                  disabled={trashLoading}
                  onClick={() => void moveToTrash()}
                >
                  {trashLoading
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

function MetaItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-kf-surface px-4 py-4 sm:px-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-kf-faint">
        {label}
      </p>

      <p className="mt-2 truncate text-sm font-medium text-kf-ink">
        {value}
      </p>
    </div>
  );
}