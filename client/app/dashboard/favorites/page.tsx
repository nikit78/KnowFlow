"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "../layout";
import { apiFetch, ApiError } from "@/lib/api";
import type { KnowledgeDocument } from "@/lib/types";
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
  IconStar,
} from "@/components/icons";

type FavoritesResponse = {
  success?: boolean;
  documents?: KnowledgeDocument[];
  message?: string;
};

export default function FavoritesPage() {
  useDashboard();
  const router = useRouter();

  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchFavorites = useCallback(async () => {
    try {
      setError("");

      const data = await apiFetch<FavoritesResponse>(
        "/documents/favorites",
      );

      setDocuments(data.documents ?? []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load favorite documents.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchFavorites();
  }, [fetchFavorites]);

  async function toggleFavorite(id: string) {
    try {
      setError("");

      await apiFetch(`/documents/${id}/favorite`, {
        method: "PATCH",
      });

      setDocuments((current) =>
        current.filter((doc) => doc._id !== id),
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

  function openDocument(id: string) {
    router.push(`/dashboard/documents/${id}`);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-kf-accent-ink">
            Personal library
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-kf-ink sm:text-4xl">
            Favorites
          </h1>

          <p className="mt-3 text-sm leading-6 text-kf-muted sm:text-base">
            Keep the documents you use most within quick reach.
          </p>
        </div>

        <Button
          href="/dashboard/documents"
          variant="secondary"
        >
          <IconDocument size={16} />
          Browse documents
          <IconArrowRight size={15} />
        </Button>
      </section>

      {/* Overview */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="kf-card p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-kf-muted">
            Favorite documents
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-kf-ink">
            {loading ? "—" : documents.length}
          </p>

          <p className="mt-2 text-xs text-kf-faint">
            Saved for quick access
          </p>
        </div>

        <div className="kf-card p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-kf-muted">
            Library
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-kf-ink">
            <IconStar
              size={25}
              className="inline-block fill-current text-kf-favorite"
            />
          </p>

          <p className="mt-2 text-xs text-kf-faint">
            Your important documents
          </p>
        </div>

        <div className="kf-card hidden p-5 sm:block">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-kf-muted">
            Quick access
          </p>

          <p className="mt-3 text-sm font-semibold text-kf-ink">
            Open any document
          </p>

          <p className="mt-2 text-xs leading-5 text-kf-faint">
            Select a favorite to view its details and content.
          </p>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-kf-error/20 bg-kf-error-soft px-4 py-4 text-sm text-kf-error sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Unable to load favorites</p>
            <p className="mt-1 opacity-90">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => void fetchFavorites()}
            className="w-fit rounded-lg px-3 py-2 font-semibold hover:bg-white/60 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="kf-card flex min-h-[320px] items-center justify-center">
          <Spinner label="Loading favorites..." />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={<IconStar size={22} />}
          title="No favorite documents"
          description="Mark important documents as favorites from your Documents library and they will appear here."
          action={
            <Button href="/dashboard/documents">
              <IconDocument size={16} />
              Browse documents
              <IconArrowRight size={15} />
            </Button>
          }
        />
      ) : (
        <section>
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-kf-accent-ink">
              Saved documents
            </p>

            <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-kf-ink">
                  Your favorites
                </h2>

                <p className="mt-1 text-sm text-kf-muted">
                  Important documents you have saved for quick access.
                </p>
              </div>

              <span className="text-xs text-kf-faint">
                {documents.length}{" "}
                {documents.length === 1 ? "document" : "documents"}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {documents.map((doc) => (
              <article
                key={doc._id}
                role="button"
                tabIndex={0}
                onClick={() => openDocument(doc._id)}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    openDocument(doc._id);
                  }
                }}
                className="kf-card group cursor-pointer p-4 transition duration-200 hover:-translate-y-0.5 hover:border-kf-border-strong sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* File icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-kf-accent-soft text-[10px] font-bold uppercase tracking-wide text-kf-accent-ink">
                    {getFileExtension(doc.originalName)}
                  </div>

                  {/* Main info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="min-w-0 max-w-full truncate text-sm font-semibold text-kf-ink sm:max-w-[520px]">
                        {doc.title}
                      </h2>

                      <Badge tone="favorite">
                        Favorite
                      </Badge>

                      <Badge tone={getDocumentStatusTone(doc.status)}>
                        {getDocumentStatusLabel(doc.status)}
                      </Badge>
                    </div>

                    <p className="mt-1 truncate text-xs text-kf-muted">
                      {doc.originalName}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-kf-muted">
                      <span>
                        {formatDocumentType(doc.documentType)}
                      </span>

                      <span aria-hidden="true">·</span>

                      <span>
                        {formatBytes(doc.fileSize)}
                      </span>

                      <span aria-hidden="true">·</span>

                      <span>
                        Added {formatDate(doc.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        void toggleFavorite(doc._id);
                      }}
                      aria-label="Remove from favorites"
                      title="Remove from favorites"
                      className="flex h-10 items-center gap-2 rounded-xl border border-kf-favorite/20 bg-kf-favorite-soft px-3 text-sm font-medium text-kf-favorite transition hover:border-kf-favorite/30"
                    >
                      <IconStar
                        size={16}
                        className="fill-current"
                      />
                      <span className="hidden sm:inline">
                        Favorite
                      </span>
                    </button>

                    <Button
                      variant="secondary"
                      size="sm"
                      className="inline-flex"
                      onClick={(event) => {
                        event.stopPropagation();
                        openDocument(doc._id);
                      }}
                    >
                      Open
                      <IconArrowRight size={14} />
                    </Button>
                  </div>
                </div>

                {/* Tags */}
                {doc.tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-kf-border pt-4">
                    {doc.tags.slice(0, 5).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-kf-border bg-kf-surface-muted px-2 py-1 text-[11px] font-medium text-kf-muted"
                      >
                        #{tag}
                      </span>
                    ))}

                    {doc.tags.length > 5 && (
                      <span className="rounded-md bg-kf-surface-muted px-2 py-1 text-[11px] text-kf-faint">
                        +{doc.tags.length - 5}
                      </span>
                    )}
                  </div>
                )}

                {/* Hover hint */}
                <div className="mt-3 flex items-center justify-end gap-1 text-[11px] font-medium text-kf-faint opacity-0 transition group-hover:opacity-100">
                  View document
                  <IconArrowRight size={12} />
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}