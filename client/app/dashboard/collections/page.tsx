"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Collection = {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  documents?: string[];
  createdAt: string;
  updatedAt?: string;
};

const API_URL = "http://localhost:5000/api";

const COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
];

const ICONS = ["📚", "💡", "🎓", "💼", "📁", "🧠", "⭐", "🔬"];

export default function CollectionsPage() {
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
  const [color, setColor] = useState("#3b82f6");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/collections`, {
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to load collections");
      }

      setCollections(data.collections || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchCollections();
  }, [fetchCollections]);

  const openCreateModal = () => {
    setEditingCollection(null);
    setName("");
    setDescription("");
    setIcon("📚");
    setColor("#3b82f6");
    setSaveError("");
    setShowModal(true);
  };

  const openEditModal = (collection: Collection) => {
    setEditingCollection(collection);
    setName(collection.name);
    setDescription(collection.description || "");
    setIcon(collection.icon || "📚");
    setColor(collection.color || "#3b82f6");
    setSaveError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingCollection(null);
    setSaveError("");
  };

  const handleSave = async () => {
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

      const url = editingCollection
        ? `${API_URL}/collections/${editingCollection._id}`
        : `${API_URL}/collections`;

      const method = editingCollection ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to save collection");
      }

      setShowModal(false);
      setEditingCollection(null);

      await fetchCollections();
    } catch (err) {
      setSaveError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `${API_URL}/collections/${deleteTarget._id}`,
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
        throw new Error(data.message || "Failed to delete collection");
      }

      setDeleteTarget(null);

      await fetchCollections();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete collection"
      );
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const openCollection = (collectionId: string) => {
    router.push(`/dashboard/collections/${collectionId}`);
  };

  const handleCollectionKeyDown = (
    event: React.KeyboardEvent<HTMLDivElement>,
    collectionId: string
  ) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openCollection(collectionId);
    }
  };

  const totalDocuments = collections.reduce(
    (total, collection) => total + (collection.documents?.length || 0),
    0
  );

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-400">
              Organization
            </p>

            <h1 className="text-3xl font-semibold tracking-tight">
              Collections
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              Organize your knowledge into focused spaces for easier access
              and management.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <span className="text-lg leading-none">+</span>
            New Collection
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <p className="text-sm text-zinc-500">Total collections</p>
            <p className="mt-2 text-2xl font-semibold">
              {collections.length}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <p className="text-sm text-zinc-500">Documents organized</p>
            <p className="mt-2 text-2xl font-semibold">
              {totalDocuments}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
            <p className="text-sm text-zinc-500">Status</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              Active
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => void fetchCollections()}
              className="font-semibold text-red-200 hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="h-52 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/60"
              />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-zinc-800 bg-zinc-950/50 px-6 py-20 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-3xl">
              📚
            </div>

            <h2 className="text-xl font-semibold">
              No collections yet
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              Create your first collection to organize documents and
              knowledge around a specific topic.
            </p>

            <button
              type="button"
              onClick={openCreateModal}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500"
            >
              Create your first collection
            </button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => {
              const documentCount = collection.documents?.length || 0;

              return (
                <div
                  key={collection._id}
                  role="button"
                  tabIndex={0}
                  onClick={() => openCollection(collection._id)}
                  onKeyDown={(event) =>
                    handleCollectionKeyDown(event, collection._id)
                  }
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 transition hover:-translate-y-0.5 hover:border-zinc-700 hover:bg-zinc-950 focus:outline-none focus:ring-2 focus:ring-blue-500/60"
                >
                  {/* Collection color indicator */}
                  <div
                    className="absolute inset-x-0 top-0 h-1"
                    style={{
                      backgroundColor: collection.color || "#3b82f6",
                    }}
                  />

                  <div className="flex items-start justify-between gap-4">
                    <div
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
                      style={{
                        backgroundColor: `${
                          collection.color || "#3b82f6"
                        }20`,
                      }}
                    >
                      {collection.icon || "📚"}
                    </div>

                    <div
                      className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:transition sm:group-hover:opacity-100"
                      onClick={(event) => event.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => openEditModal(collection)}
                        className="rounded-lg px-3 py-2 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget(collection)}
                        className="rounded-lg px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-950/40 hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <h2 className="mt-5 text-lg font-semibold">
                    {collection.name}
                  </h2>

                  <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-500">
                    {collection.description || "No description added."}
                  </p>

                  {/* Collection metadata */}
                  <div className="mt-5 flex items-center justify-between border-t border-zinc-800 pt-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-zinc-400">
                        {documentCount}{" "}
                        {documentCount === 1 ? "document" : "documents"}
                      </span>

                      <span className="text-zinc-700">•</span>

                      <span className="text-xs text-zinc-600">
                        Created{" "}
                        {new Date(
                          collection.createdAt
                        ).toLocaleDateString()}
                      </span>
                    </div>

                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          collection.color || "#3b82f6",
                      }}
                    />
                  </div>

                  {/* Open hint */}
                  <div className="mt-4 flex items-center justify-between text-xs text-zinc-600 transition group-hover:text-blue-400">
                    <span>Open collection</span>
                    <span>→</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {editingCollection
                    ? "Edit Collection"
                    : "Create Collection"}
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Give your collection a clear identity.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg px-2 py-1 text-zinc-500 hover:bg-zinc-900 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Collection name
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Machine Learning"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What will this collection contain?"
                  className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-blue-500"
                />
              </div>

              {/* Icon */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Icon
                </label>

                <div className="flex flex-wrap gap-2">
                  {ICONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setIcon(item)}
                      className={`flex h-10 w-10 items-center justify-center rounded-lg border text-lg transition ${
                        icon === item
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-300">
                  Color
                </label>

                <div className="flex flex-wrap gap-3">
                  {COLORS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setColor(item)}
                      aria-label={`Select color ${item}`}
                      className={`h-9 w-9 rounded-full border-2 transition ${
                        color === item
                          ? "scale-110 border-white"
                          : "border-transparent"
                      }`}
                      style={{
                        backgroundColor: item,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Save Error */}
              {saveError && (
                <div className="rounded-xl border border-red-900/50 bg-red-950/20 px-4 py-3 text-sm text-red-300">
                  {saveError}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-900 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving..."
                    : editingCollection
                      ? "Save changes"
                      : "Create collection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-xl">
              🗑️
            </div>

            <h2 className="text-xl font-semibold">
              Delete collection?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              This will permanently delete{" "}
              <span className="font-medium text-zinc-300">
                {deleteTarget.name}
              </span>
              . This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-xl border border-zinc-800 px-5 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-900 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}