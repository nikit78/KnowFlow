"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "../layout";
import { apiFetch, ApiError } from "@/lib/api";
import type { Collection } from "@/lib/types";
import { formatDate } from "@/lib/format";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import {
  IconArrowLeft,
  IconArrowRight,
  IconFolder,
  IconPlus,
} from "@/components/icons";

type CollectionsResponse = {
  success?: boolean;
  collections?: Collection[];
  message?: string;
};

const COLORS = [
  "#0f766e",
  "#0369a1",
  "#b45309",
  "#be123c",
  "#7c3aed",
  "#15803d",
];

const ICONS = ["📚", "💡", "🎓", "💼", "📁", "🧠", "⭐", "🔬"];

export default function CollectionsPage() {
  useDashboard();
  const router = useRouter();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCollection, setEditingCollection] =
    useState<Collection | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📚");
  const [color, setColor] = useState("#0f766e");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch<CollectionsResponse>("/collections");

      setCollections(data.collections ?? []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setError(
        err instanceof Error ? err.message : "Failed to load collections",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchCollections();
  }, [fetchCollections]);

  function openCreateModal() {
    setEditingCollection(null);
    setName("");
    setDescription("");
    setIcon("📚");
    setColor("#0f766e");
    setSaveError("");
    setShowModal(true);
  }

  function openEditModal(collection: Collection) {
    setEditingCollection(collection);
    setName(collection.name);
    setDescription(collection.description || "");
    setIcon(collection.icon || "📚");
    setColor(collection.color || "#0f766e");
    setSaveError("");
    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingCollection(null);
    setSaveError("");
  }

  async function handleSave() {
    if (!name.trim()) {
      setSaveError("Collection name is required.");
      return;
    }

    try {
      setSaving(true);
      setSaveError("");

      const payload = {
        name: name.trim(),
        description: description.trim(),
        icon,
        color,
      };

      if (editingCollection) {
        await apiFetch(`/collections/${editingCollection._id}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await apiFetch("/collections", {
          method: "POST",
          body: payload,
        });
      }

      setShowModal(false);
      setEditingCollection(null);

      await fetchCollections();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setSaveError(
        err instanceof Error ? err.message : "Failed to save collection",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setError("");

      await apiFetch(`/collections/${deleteTarget._id}`, {
        method: "DELETE",
      });

      setDeleteTarget(null);

      await fetchCollections();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setError(
        err instanceof Error ? err.message : "Failed to delete collection",
      );

      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const totalDocuments = collections.reduce(
    (total, collection) =>
      total +
      (Array.isArray(collection.documents)
        ? collection.documents.length
        : 0),
    0,
  );

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-kf-accent-ink">
            Knowledge workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-kf-ink sm:text-4xl">
            Collections
          </h1>

          <p className="mt-3 text-sm leading-6 text-kf-muted sm:text-base">
            Group related documents into focused spaces so your knowledge stays
            easy to find, review, and use.
          </p>
        </div>

        <Button onClick={openCreateModal}>
          <IconPlus size={16} />
          New collection
        </Button>
      </section>

      {/* Overview */}
      <section className="grid gap-4 sm:grid-cols-2">
        <div className="kf-card group relative overflow-hidden p-5">
          <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-kf-accent-soft opacity-70" />

          <p className="relative text-xs font-medium uppercase tracking-[0.14em] text-kf-muted">
            Total collections
          </p>

          <div className="relative mt-3 flex items-end justify-between gap-4">
            <p className="text-3xl font-bold tracking-tight text-kf-ink">
              {collections.length}
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-kf-accent-soft text-kf-accent-ink">
              <IconFolder size={19} />
            </div>
          </div>

          <p className="relative mt-2 text-xs text-kf-faint">
            Focused knowledge spaces
          </p>
        </div>

        <div className="kf-card group relative overflow-hidden p-5">
          <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-kf-surface-muted" />

          <p className="relative text-xs font-medium uppercase tracking-[0.14em] text-kf-muted">
            Documents organized
          </p>

          <div className="relative mt-3 flex items-end justify-between gap-4">
            <p className="text-3xl font-bold tracking-tight text-kf-ink">
              {totalDocuments}
            </p>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-kf-border bg-kf-surface text-kf-muted">
              <span className="text-lg">◫</span>
            </div>
          </div>

          <p className="relative mt-2 text-xs text-kf-faint">
            Documents grouped across collections
          </p>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="flex flex-col gap-3 rounded-2xl border border-kf-error/20 bg-kf-error-soft px-4 py-4 text-sm text-kf-error sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-1 opacity-90">{error}</p>
          </div>

          <button
            type="button"
            onClick={() => void fetchCollections()}
            className="w-fit rounded-lg px-3 py-2 font-semibold transition hover:bg-white/60 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Collection content */}
      {loading ? (
        <section>
          <div className="mb-4">
            <div className="h-5 w-36 animate-pulse rounded bg-kf-surface-muted" />
            <div className="mt-2 h-4 w-64 animate-pulse rounded bg-kf-surface-muted" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-56 animate-pulse rounded-2xl border border-kf-border bg-kf-surface-muted"
              />
            ))}
          </div>
        </section>
      ) : collections.length === 0 ? (
        <EmptyState
          icon={<IconFolder size={22} />}
          title="No collections yet"
          description="Create your first collection to organize documents around a topic, project, subject, or workflow."
          action={
            <Button onClick={openCreateModal}>
              <IconPlus size={16} />
              Create your first collection
            </Button>
          }
        />
      ) : (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-kf-ink">
              Your collections
            </h2>
            <p className="mt-1 text-sm text-kf-muted">
              Open a collection to explore its documents.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => {
              const documentCount = Array.isArray(collection.documents)
                ? collection.documents.length
                : 0;

              const collectionColor = collection.color || "#0f766e";

              return (
                <div
                  key={collection._id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open collection ${collection.name}`}
                  onClick={() =>
                    router.push(
                      `/dashboard/collections/${collection._id}`,
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();

                      router.push(
                        `/dashboard/collections/${collection._id}`,
                      );
                    }
                  }}
                  className="kf-card group relative cursor-pointer overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:border-kf-border-strong hover:shadow-[var(--kf-shadow)] focus:outline-none focus:ring-2 focus:ring-kf-accent/30"
                >
                  {/* Accent line */}
                  <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{
                      backgroundColor: collectionColor,
                    }}
                  />

                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-black/5 text-2xl shadow-sm"
                      style={{
                        backgroundColor: `${collectionColor}18`,
                      }}
                    >
                      {collection.icon || "📚"}
                    </div>

                    <div
                      className="flex gap-1 opacity-100 transition sm:opacity-0 sm:group-hover:opacity-100"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => openEditModal(collection)}
                        className="rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-semibold text-kf-muted transition hover:border-kf-border hover:bg-kf-surface-muted hover:text-kf-ink"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(collection)}
                        className="rounded-lg border border-transparent px-2.5 py-1.5 text-xs font-semibold text-kf-error transition hover:border-kf-error/15 hover:bg-kf-error-soft"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-5">
                    <h3 className="line-clamp-1 text-lg font-semibold text-kf-ink">
                      {collection.name}
                    </h3>

                    <p className="mt-2 min-h-12 line-clamp-2 text-sm leading-6 text-kf-muted">
                      {collection.description || "No description added yet."}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-kf-border pt-4">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-kf-ink-soft">
                        {documentCount}{" "}
                        {documentCount === 1 ? "document" : "documents"}
                      </p>

                      {collection.createdAt && (
                        <p className="mt-1 text-[11px] text-kf-faint">
                          Created {formatDate(collection.createdAt)}
                        </p>
                      )}
                    </div>

                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-kf-accent-ink transition group-hover:gap-1.5">
                      Open
                      <IconArrowRight size={14} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-kf-ink/35 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeModal();
            }
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-kf-border bg-kf-surface p-6 shadow-[var(--kf-shadow)] sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="collection-modal-title"
          >
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-kf-accent-ink">
                  {editingCollection ? "Collection settings" : "New space"}
                </p>

                <h2
                  id="collection-modal-title"
                  className="mt-1 text-xl font-semibold text-kf-ink"
                >
                  {editingCollection
                    ? "Edit collection"
                    : "Create collection"}
                </h2>

                <p className="mt-1.5 text-sm leading-5 text-kf-muted">
                  Give this knowledge space a clear name, identity, and
                  purpose.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Close collection dialog"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-kf-faint transition hover:bg-kf-surface-muted hover:text-kf-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <Input
                label="Collection name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Machine Learning"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-kf-ink-soft">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder="What will this collection contain?"
                  className="w-full resize-none rounded-xl border border-kf-border bg-kf-surface px-3.5 py-3 text-sm leading-6 text-kf-ink outline-none transition placeholder:text-kf-faint focus:border-kf-accent focus:ring-2 focus:ring-kf-accent/15"
                />
              </div>

              {/* Icon */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-kf-ink-soft">
                    Icon
                  </label>

                  <span className="text-xs text-kf-faint">
                    Choose an identity
                  </span>
                </div>

                <div className="grid grid-cols-8 gap-2">
                  {ICONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setIcon(item)}
                      aria-label={`Select ${item} icon`}
                      aria-pressed={icon === item}
                      className={`flex h-10 items-center justify-center rounded-xl border text-lg transition ${
                        icon === item
                          ? "border-kf-accent bg-kf-accent-soft shadow-sm"
                          : "border-kf-border bg-kf-surface hover:border-kf-border-strong hover:bg-kf-surface-muted"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-sm font-medium text-kf-ink-soft">
                    Color
                  </label>

                  <span className="text-xs text-kf-faint">
                    Accent color
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {COLORS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setColor(item)}
                      aria-label={`Select color ${item}`}
                      aria-pressed={color === item}
                      className={`h-9 w-9 rounded-full border-2 transition duration-150 ${
                        color === item
                          ? "scale-110 border-kf-ink shadow-sm"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{
                        backgroundColor: item,
                      }}
                    />
                  ))}
                </div>
              </div>

              {saveError && (
                <div className="rounded-xl border border-kf-error/15 bg-kf-error-soft px-4 py-3 text-sm text-kf-error">
                  {saveError}
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-kf-border pt-5 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  disabled={saving}
                  onClick={closeModal}
                >
                  Cancel
                </Button>

                <Button
                  disabled={saving}
                  onClick={() => void handleSave()}
                >
                  {saving ? (
                    "Saving..."
                  ) : (
                    <>
                      {editingCollection
                        ? "Save changes"
                        : "Create collection"}
                      <IconArrowRight size={15} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-kf-ink/35 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !deleting) {
              setDeleteTarget(null);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-kf-border bg-kf-surface p-6 shadow-[var(--kf-shadow)] sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-collection-title"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-kf-error-soft text-kf-error">
              <span className="text-lg">!</span>
            </div>

            <h2
              id="delete-collection-title"
              className="mt-5 text-xl font-semibold text-kf-ink"
            >
              Delete collection?
            </h2>

            <p className="mt-2 text-sm leading-6 text-kf-muted">
              This will permanently delete{" "}
              <span className="font-semibold text-kf-ink">
                {deleteTarget.name}
              </span>
              . The documents themselves will not be deleted.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                variant="secondary"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                disabled={deleting}
                onClick={() => void handleDelete()}
              >
                {deleting ? "Deleting..." : "Delete collection"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}