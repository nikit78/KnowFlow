"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";

type DocumentStatus =
  | "uploaded"
  | "processing"
  | "processed"
  | "failed";

type DocumentType =
  | "research-paper"
  | "annual-report"
  | "financial-statement"
  | "lecture-notes"
  | "book"
  | "other";

type Document = {
  _id: string;
  title: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  documentType: DocumentType;
  status: DocumentStatus;
  extractedText?: string;
  tags: string[];
  isFavorite: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt?: string;
};

type DocumentChunk = {
  _id: string;
  document: string;
  chunkIndex: number;
  text: string;
  embedding?: number[];
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

function getStatusClasses(status: DocumentStatus) {
  switch (status) {
    case "processed":
      return "border-emerald-500/15 bg-emerald-500/[0.06] text-emerald-400";

    case "processing":
      return "border-amber-500/15 bg-amber-500/[0.06] text-amber-400";

    case "failed":
      return "border-red-500/15 bg-red-500/[0.06] text-red-400";

    default:
      return "border-white/[0.08] bg-white/[0.025] text-zinc-500";
  }
}

function formatDate(dateString?: string) {
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

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();

  const documentId = params.id as string;

  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================
  // Favorite / Trash
  // ==========================

  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [trashLoading, setTrashLoading] = useState(false);
  const [showTrashDialog, setShowTrashDialog] = useState(false);

  // ==========================
  // Edit Metadata
  // ==========================

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDocumentType, setEditDocumentType] =
    useState<DocumentType>("other");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  // ==========================
  // Document Chunks
  // ==========================

  const [chunks, setChunks] = useState<DocumentChunk[]>([]);
  const [chunksLoading, setChunksLoading] = useState(false);
  const [chunksError, setChunksError] = useState("");
  const [chunksLoaded, setChunksLoaded] = useState(false);

  // ==========================
  // Load Document
  // ==========================

  useEffect(() => {
    if (!documentId) {
      return;
    }

    const loadDocument = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/documents/${documentId}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const data = await response.json();

        if (response.status === 401) {
          router.replace("/auth/login");
          return;
        }

        if (response.status === 404) {
          setError("Document not found.");
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load document."
          );
        }

        setDocument(data.document);
      } catch (documentError) {
        console.error(
          "Document loading error:",
          documentError
        );

        setError(
          documentError instanceof Error
            ? documentError.message
            : "Something went wrong while loading the document."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [documentId, router]);

  // ==========================
  // Toggle Favorite
  // ==========================

  const toggleFavorite = async () => {
    if (!document || favoriteLoading) {
      return;
    }

    try {
      setFavoriteLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/documents/${document._id}/favorite`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update favorite."
        );
      }

      setDocument((currentDocument) =>
        currentDocument
          ? {
              ...currentDocument,
              isFavorite: !currentDocument.isFavorite,
            }
          : currentDocument
      );
    } catch (favoriteError) {
      console.error(
        "Favorite update error:",
        favoriteError
      );

      setError(
        favoriteError instanceof Error
          ? favoriteError.message
          : "Failed to update favorite."
      );
    } finally {
      setFavoriteLoading(false);
    }
  };

  // ==========================
  // Move Document To Trash
  // ==========================

  const moveToTrash = async () => {
    if (!document || trashLoading) {
      return;
    }

    try {
      setTrashLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/documents/${document._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to move document to trash."
        );
      }

      setShowTrashDialog(false);

      router.push("/dashboard/trash");
    } catch (trashError) {
      console.error(
        "Move to trash error:",
        trashError
      );

      setError(
        trashError instanceof Error
          ? trashError.message
          : "Failed to move document to trash."
      );
    } finally {
      setTrashLoading(false);
    }
  };

  // ==========================
  // Start Editing
  // ==========================

  const startEditing = () => {
    if (!document) {
      return;
    }

    setEditTitle(document.title);
    setEditDocumentType(document.documentType);
    setEditTags([...document.tags]);

    setNewTag("");
    setSaveError("");
    setSaveSuccess("");
    setIsEditing(true);
  };

  // ==========================
  // Cancel Editing
  // ==========================

  const cancelEditing = () => {
    if (saveLoading) {
      return;
    }

    setIsEditing(false);
    setNewTag("");
    setSaveError("");
  };

  // ==========================
  // Add Tag
  // ==========================

  const addTag = () => {
    const trimmedTag = newTag.trim();

    if (!trimmedTag) {
      return;
    }

    const alreadyExists = editTags.some(
      (tag) => tag.toLowerCase() === trimmedTag.toLowerCase()
    );

    if (alreadyExists) {
      setNewTag("");
      return;
    }

    setEditTags((currentTags) => [
      ...currentTags,
      trimmedTag,
    ]);

    setNewTag("");
  };

  // ==========================
  // Remove Tag
  // ==========================

  const removeTag = (tagToRemove: string) => {
    setEditTags((currentTags) =>
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  // ==========================
  // Handle Tag Enter
  // ==========================

  const handleTagKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  };

  // ==========================
  // Save Metadata
  // ==========================

  const saveMetadata = async () => {
    if (!document || saveLoading) {
      return;
    }

    const trimmedTitle = editTitle.trim();

    if (!trimmedTitle) {
      setSaveError("Document title cannot be empty.");
      return;
    }

    try {
      setSaveLoading(true);
      setSaveError("");
      setSaveSuccess("");

      const response = await fetch(
        `${API_URL}/documents/${document._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: trimmedTitle,
            documentType: editDocumentType,
            tags: editTags,
          }),
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to update document."
        );
      }

      setDocument(data.document);

      setEditTitle(data.document.title);
      setEditDocumentType(data.document.documentType);
      setEditTags(data.document.tags);

      setSaveSuccess("Changes saved successfully.");

      setTimeout(() => {
        setSaveSuccess("");
      }, 2500);

      setIsEditing(false);
    } catch (metadataError) {
      console.error(
        "Document metadata update error:",
        metadataError
      );

      setSaveError(
        metadataError instanceof Error
          ? metadataError.message
          : "Failed to update document."
      );
    } finally {
      setSaveLoading(false);
    }
  };

  // ==========================
  // Load Document Chunks
  // ==========================

  const loadChunks = async () => {
    if (!document || chunksLoading) {
      return;
    }

    try {
      setChunksLoading(true);
      setChunksError("");

      const response = await fetch(
        `${API_URL}/documents/${document._id}/chunks`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to load document chunks."
        );
      }

      setChunks(data.chunks || []);
      setChunksLoaded(true);
    } catch (chunkError) {
      console.error(
        "Document chunks loading error:",
        chunkError
      );

      setChunksError(
        chunkError instanceof Error
          ? chunkError.message
          : "Failed to load document chunks."
      );
    } finally {
      setChunksLoading(false);
    }
  };

  // ==========================
  // Loading State
  // ==========================

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] text-zinc-100">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
          Loading document...
        </div>
      </main>
    );
  }

  // ==========================
  // Error State
  // ==========================

  if (error || !document) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090b] px-6 text-zinc-100">
        <section className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0d0d0f] p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/[0.06] text-red-400">
            <svg
              width="21"
              height="21"
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

          <h1 className="mt-5 text-lg font-semibold text-zinc-200">
            Unable to open document
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-600">
            {error || "This document could not be found."}
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
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      {/* ========================== */}
      {/* Top Bar */}
      {/* ========================== */}

      <header className="fixed left-0 right-0 top-0 z-40 h-[78px] border-b border-white/[0.06] bg-[#09090b]/95 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <button
              type="button"
              onClick={() =>
                router.push("/dashboard/documents")
              }
              className="flex shrink-0 items-center gap-2 text-sm text-zinc-500 transition hover:text-zinc-200"
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

              Documents
            </button>

            <span className="text-zinc-700">/</span>

            <span className="truncate text-sm font-medium text-zinc-200">
              {document.title}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              router.push("/dashboard/documents/upload")
            }
            className="flex shrink-0 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
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
        {/* ========================== */}
        {/* Document Header */}
        {/* ========================== */}

        <section className="rounded-2xl border border-white/[0.08] bg-[#0d0d0f]">
          <div className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              {/* Document Identity */}

              <div className="flex min-w-0 gap-5">
                {/* File Icon */}

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-400/10 bg-blue-500/[0.07] text-xs font-bold tracking-wide text-blue-400">
                  {getExtension(document.originalName)}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      {document.title}
                    </h1>

                    {document.isFavorite && (
                      <svg
                        className="shrink-0 text-amber-400"
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01z" />
                      </svg>
                    )}
                  </div>

                  <p className="mt-2 break-all text-sm text-zinc-600">
                    {document.originalName}
                  </p>
                </div>
              </div>

              {/* ========================== */}
              {/* Actions + Status */}
              {/* ========================== */}

              <div className="flex flex-wrap items-center gap-2">
                {/* Favorite */}

                <button
                  type="button"
                  onClick={toggleFavorite}
                  disabled={favoriteLoading}
                  aria-label={
                    document.isFavorite
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                  className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    document.isFavorite
                      ? "border-amber-500/15 bg-amber-500/[0.06] text-amber-400"
                      : "border-white/[0.08] bg-white/[0.02] text-zinc-500 hover:border-amber-500/15 hover:bg-amber-500/[0.04] hover:text-amber-400"
                  }`}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill={
                      document.isFavorite
                        ? "currentColor"
                        : "none"
                    }
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3z" />
                  </svg>

                  {document.isFavorite
                    ? "Favorited"
                    : "Favorite"}
                </button>

                {/* Preview */}

                <button
                  type="button"
                  onClick={() =>
                    window.open(
                      `${API_URL}/documents/${document._id}/preview`,
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
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
                      d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="2.5"
                    />
                  </svg>

                  Preview
                </button>

                {/* Download */}

                <a
                  href={`${API_URL}/documents/${document._id}/download`}
                  className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200"
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
                      d="M12 3v12"
                      strokeLinecap="round"
                    />

                    <path
                      d="m7 10 5 5 5-5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M5 21h14"
                      strokeLinecap="round"
                    />
                  </svg>

                  Download
                </a>

                {/* Status */}

                <span
                  className={`inline-flex h-9 items-center rounded-md border px-3 text-xs font-medium ${getStatusClasses(
                    document.status
                  )}`}
                >
                  {getStatusLabel(document.status)}
                </span>

                {/* Edit */}

                <button
                  type="button"
                  onClick={startEditing}
                  disabled={isEditing}
                  className="flex h-9 items-center gap-2 rounded-lg border border-blue-500/15 bg-blue-500/[0.05] px-3 text-xs font-medium text-blue-400 transition hover:bg-blue-500/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
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
                      d="M12 20h9"
                      strokeLinecap="round"
                    />

                    <path
                      d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  Edit
                </button>

                {/* Trash */}

                <button
                  type="button"
                  onClick={() => setShowTrashDialog(true)}
                  className="flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-xs font-medium text-zinc-500 transition hover:border-red-500/15 hover:bg-red-500/[0.04] hover:text-red-400"
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
                      d="M6 7l1 13h10l1-13"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    <path
                      d="M9 7V4h6v3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  Trash
                </button>
              </div>
            </div>

            {/* ========================== */}
            {/* Edit Metadata */}
            {/* ========================== */}

            {isEditing && (
              <div className="mt-8 border-t border-white/[0.06] pt-6">
                <div className="rounded-xl border border-blue-500/10 bg-blue-500/[0.025] p-5">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-sm font-semibold text-zinc-200">
                      Edit document
                    </h2>

                    <p className="text-xs text-zinc-600">
                      Update the title, document type, and tags.
                    </p>
                  </div>

                  {/* Title */}

                  <div className="mt-5">
                    <label
                      htmlFor="document-title"
                      className="text-[11px] font-medium uppercase tracking-wider text-zinc-600"
                    >
                      Title
                    </label>

                    <input
                      id="document-title"
                      type="text"
                      value={editTitle}
                      onChange={(event) =>
                        setEditTitle(event.target.value)
                      }
                      disabled={saveLoading}
                      className="mt-2 w-full rounded-lg border border-white/[0.08] bg-[#09090b] px-3.5 py-2.5 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                      placeholder="Document title"
                    />
                  </div>

                  {/* Document Type */}

                  <div className="mt-5">
                    <label
                      htmlFor="document-type"
                      className="text-[11px] font-medium uppercase tracking-wider text-zinc-600"
                    >
                      Document type
                    </label>

                    <select
                      id="document-type"
                      value={editDocumentType}
                      onChange={(event) =>
                        setEditDocumentType(
                          event.target.value as DocumentType
                        )
                      }
                      disabled={saveLoading}
                      className="mt-2 w-full rounded-lg border border-white/[0.08] bg-[#09090b] px-3.5 py-2.5 text-sm text-zinc-200 outline-none transition focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
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

                  {/* Tags */}

                  <div className="mt-5">
                    <label className="text-[11px] font-medium uppercase tracking-wider text-zinc-600">
                      Tags
                    </label>

                    <div className="mt-2 flex gap-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(event) =>
                          setNewTag(event.target.value)
                        }
                        onKeyDown={handleTagKeyDown}
                        disabled={saveLoading}
                        className="min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-[#09090b] px-3.5 py-2.5 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-700 focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                        placeholder="Add a tag"
                      />

                      <button
                        type="button"
                        onClick={addTag}
                        disabled={
                          saveLoading || !newTag.trim()
                        }
                        className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 text-xs font-semibold text-zinc-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Add
                      </button>
                    </div>

                    {editTags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {editTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-xs text-zinc-400"
                          >
                            #{tag}

                            <button
                              type="button"
                              onClick={() => removeTag(tag)}
                              disabled={saveLoading}
                              aria-label={`Remove ${tag}`}
                              className="text-zinc-600 transition hover:text-red-400 disabled:cursor-not-allowed"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Save Errors */}

                  {saveError && (
                    <div className="mt-4 rounded-lg border border-red-500/10 bg-red-500/[0.05] px-3.5 py-3 text-xs text-red-400">
                      {saveError}
                    </div>
                  )}

                  {/* Save Actions */}

                  <div className="mt-6 flex flex-wrap justify-end gap-2">
                    <button
                      type="button"
                      onClick={cancelEditing}
                      disabled={saveLoading}
                      className="rounded-lg border border-white/[0.08] px-4 py-2.5 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.03] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="button"
                      onClick={saveMetadata}
                      disabled={saveLoading}
                      className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {saveLoading && (
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      )}

                      {saveLoading
                        ? "Saving..."
                        : "Save changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Save Success */}

            {saveSuccess && (
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-500/10 bg-emerald-500/[0.05] px-3.5 py-3 text-xs text-emerald-400">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path
                    d="m5 12 4 4L19 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                {saveSuccess}
              </div>
            )}

            {/* ========================== */}
            {/* Metadata */}
            {/* ========================== */}

            <div className="mt-8 grid gap-4 border-t border-white/[0.06] pt-6 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-700">
                  Type
                </p>

                <p className="mt-2 text-sm text-zinc-300">
                  {getDocumentTypeLabel(
                    document.documentType
                  )}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-700">
                  File size
                </p>

                <p className="mt-2 text-sm text-zinc-300">
                  {formatFileSize(document.fileSize)}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-700">
                  Added
                </p>

                <p className="mt-2 text-sm text-zinc-300">
                  {formatDate(document.createdAt)}
                </p>
              </div>

              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-700">
                  Format
                </p>

                <p className="mt-2 text-sm text-zinc-300">
                  {getExtension(document.originalName)}
                </p>
              </div>
            </div>

            {/* ========================== */}
            {/* Tags */}
            {/* ========================== */}

            {document.tags.length > 0 && (
              <div className="mt-6 border-t border-white/[0.06] pt-6">
                <p className="text-[11px] font-medium uppercase tracking-wider text-zinc-700">
                  Tags
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  {document.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-xs text-zinc-500"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================== */}
        {/* Extracted Content */}
        {/* ========================== */}

        <section className="mt-5 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0d0f]">
          <div className="flex flex-col gap-4 border-b border-white/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-zinc-200">
                Extracted content
              </h2>

              <p className="mt-1 text-xs text-zinc-600">
                Text extracted from your uploaded document.
              </p>
            </div>

            <button
              type="button"
              onClick={loadChunks}
              disabled={chunksLoading}
              className="flex h-9 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 text-xs font-medium text-zinc-400 transition hover:bg-white/[0.04] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {chunksLoading ? (
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-300" />
              ) : (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path
                    d="M8 6h13M8 12h13M8 18h13"
                    strokeLinecap="round"
                  />

                  <path
                    d="M3 6h.01M3 12h.01M3 18h.01"
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {chunksLoading
                ? "Loading chunks..."
                : chunksLoaded
                  ? "Reload chunks"
                  : "View chunks"}
            </button>
          </div>

          {document.extractedText ? (
            <div className="max-h-[620px] overflow-y-auto px-6 py-6 sm:px-8">
              <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-7 text-zinc-400">
                {document.extractedText}
              </pre>
            </div>
          ) : (
            <div className="flex min-h-[260px] items-center justify-center px-6 text-center">
              <div>
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] text-zinc-600">
                  <svg
                    width="20"
                    height="20"
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
                  </svg>
                </div>

                <h3 className="mt-4 text-sm font-medium text-zinc-300">
                  Content not available
                </h3>

                <p className="mt-1 text-xs text-zinc-600">
                  No extracted text is available for this
                  document yet.
                </p>
              </div>
            </div>
          )}

          {/* ========================== */}
          {/* Chunks */}
          {/* ========================== */}

          {chunksLoaded && (
            <div className="border-t border-white/[0.06]">
              <div className="border-b border-white/[0.06] px-6 py-5 sm:px-8">
                <h2 className="text-sm font-semibold text-zinc-200">
                  Document chunks
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  {chunks.length}{" "}
                  {chunks.length === 1 ? "chunk" : "chunks"}{" "}
                  available for knowledge retrieval.
                </p>
              </div>

              {chunksError ? (
                <div className="p-6 sm:p-8">
                  <div className="rounded-lg border border-red-500/10 bg-red-500/[0.05] px-4 py-3 text-xs text-red-400">
                    {chunksError}
                  </div>
                </div>
              ) : chunks.length === 0 ? (
                <div className="flex min-h-[180px] items-center justify-center px-6 text-center">
                  <div>
                    <p className="text-sm text-zinc-400">
                      No chunks found
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      This document does not have chunked
                      content yet.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.05]">
                  {chunks.map((chunk) => (
                    <article
                      key={chunk._id}
                      className="px-6 py-6 sm:px-8"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span className="rounded-md border border-blue-500/10 bg-blue-500/[0.05] px-2.5 py-1 text-[11px] font-semibold text-blue-400">
                          Chunk {chunk.chunkIndex + 1}
                        </span>

                        {chunk.embedding &&
                          chunk.embedding.length > 0 && (
                            <span className="text-[11px] text-emerald-500/70">
                              Embedded
                            </span>
                          )}
                      </div>

                      <p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-400">
                        {chunk.text}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* ========================== */}
      {/* Move To Trash Dialog */}
      {/* ========================== */}

      {showTrashDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 backdrop-blur-sm"
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
            className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#111114] p-6 shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
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
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M9 7V4h6v3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2
              id="trash-dialog-title"
              className="mt-5 text-lg font-semibold text-white"
            >
              Move document to trash?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              <span className="font-medium text-zinc-300">
                {document.title}
              </span>{" "}
              will be moved to Trash. You can restore it
              later.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={trashLoading}
                onClick={() =>
                  setShowTrashDialog(false)
                }
                className="rounded-lg border border-white/[0.08] px-4 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.03] hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={trashLoading}
                onClick={moveToTrash}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {trashLoading && (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                )}

                {trashLoading
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