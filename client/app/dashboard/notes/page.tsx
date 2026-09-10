"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";

type Note = {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: string;
  updatedAt?: string;
};

type NotesResponse = {
  success: boolean;
  notes?: Note[];
  message?: string;
};

export default function NotesPage() {
  const router = useRouter();

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadNotes = async () => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/notes`, {
        credentials: "include",
      });

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      const data: NotesResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load notes.");
      }

      setNotes(data.notes || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading notes."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      await loadNotes();
    };

    void load();
  }, [router]);

  const resetEditor = () => {
    setTitle("");
    setContent("");
    setTags("");
    setIsCreating(false);
    setEditingNote(null);
  };

  const openCreate = () => {
    setError("");
    setEditingNote(null);
    setTitle("");
    setContent("");
    setTags("");
    setIsCreating(true);
  };

  const openEdit = (note: Note) => {
    setError("");
    setIsCreating(false);
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags?.join(", ") || "");
  };

  const saveNote = async (event: FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      setError("Please enter a note title.");
      return;
    }

    if (!content.trim()) {
      setError("Please enter some note content.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const isEditing = Boolean(editingNote);

      const response = await fetch(
        isEditing
          ? `${API_URL}/notes/${editingNote!._id}`
          : `${API_URL}/notes`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            tags: tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          }),
        }
      );

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save note.");
      }

      resetEditor();
      await loadNotes();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the note."
      );
    } finally {
      setSaving(false);
    }
  };

  const togglePin = async (note: Note) => {
    try {
      const response = await fetch(`${API_URL}/notes/${note._id}/pin`, {
        method: "PATCH",
        credentials: "include",
      });

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update pin.");
      }

      setNotes((current) =>
        current.map((item) =>
          item._id === note._id
            ? { ...item, isPinned: !item.isPinned }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update note."
      );
    }
  };

  const toggleFavorite = async (note: Note) => {
    try {
      const response = await fetch(
        `${API_URL}/notes/${note._id}/favorite`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to update favorite.");
      }

      setNotes((current) =>
        current.map((item) =>
          item._id === note._id
            ? { ...item, isFavorite: !item.isFavorite }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update favorite."
      );
    }
  };

  const deleteNote = async () => {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setError("");

      const response = await fetch(
        `${API_URL}/notes/${deleteTarget._id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (response.status === 401) {
        router.replace("/auth/login");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to delete note.");
      }

      setNotes((current) =>
        current.filter((note) => note._id !== deleteTarget._id)
      );

      setDeleteTarget(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete note."
      );
    } finally {
      setDeleting(false);
    }
  };

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = !query
      ? notes
      : notes.filter((note) => {
          return (
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query) ||
            note.tags?.some((tag) =>
              tag.toLowerCase().includes(query)
            )
          );
        });

    return [...result].sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }

      return (
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
      );
    });
  }, [notes, searchQuery]);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <main className="min-h-screen bg-[#09090b] text-zinc-100">
      <header className="sticky top-0 z-30 border-b border-zinc-800/80 bg-[#09090b]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-sm text-zinc-400 transition hover:text-white"
            >
              Dashboard
            </button>

            <span className="text-zinc-700">/</span>

            <span className="text-sm font-medium text-zinc-100">
              Notes
            </span>
          </div>

          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
          >
            <span className="text-lg leading-none">+</span>
            New note
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="mb-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-blue-400">
                Workspace
              </p>

              <h1 className="text-3xl font-semibold tracking-tight">
                Your Notes
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
                Capture ideas, technical notes and important thoughts in one
                organized workspace.
              </p>
            </div>

            <div className="text-sm text-zinc-500">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
            </div>
          </div>
        </section>

        <section className="mb-8">
          <div className="relative max-w-2xl">
            <svg
              className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
              />
            </svg>

            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search notes, content or tags..."
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-3 pl-11 pr-4 text-sm text-zinc-200 outline-none transition placeholder:text-zinc-600 focus:border-zinc-700"
            />
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950">
            <div className="flex items-center gap-3 text-sm text-zinc-500">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-700 border-t-blue-500" />
              Loading notes...
            </div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/50 px-6 text-center">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-2xl">
              📝
            </div>

            <h2 className="text-lg font-medium text-zinc-200">
              {searchQuery
                ? "No notes found"
                : "Start writing your first note"}
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
              {searchQuery
                ? "Try a different search term or search by tag."
                : "Keep ideas, learning notes and useful information close to your documents."}
            </p>

            {!searchQuery && (
              <button
                onClick={openCreate}
                className="mt-6 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500"
              >
                Create your first note
              </button>
            )}
          </div>
        ) : (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredNotes.map((note) => (
              <article
                key={note._id}
                className="group flex min-h-[250px] flex-col rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition hover:border-zinc-700 hover:bg-zinc-900/70"
              >
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      {note.isPinned && (
                        <span
                          className="text-xs text-blue-400"
                          title="Pinned"
                        >
                          📌
                        </span>
                      )}

                      <h2 className="truncate text-base font-semibold text-zinc-100">
                        {note.title}
                      </h2>
                    </div>

                    <p className="text-xs text-zinc-600">
                      Updated{" "}
                      {formatDate(note.updatedAt || note.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => void togglePin(note)}
                      title={note.isPinned ? "Unpin" : "Pin"}
                      className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-900 hover:text-blue-400"
                    >
                      {note.isPinned ? "📌" : "📍"}
                    </button>

                    <button
                      onClick={() => void toggleFavorite(note)}
                      title={
                        note.isFavorite
                          ? "Remove favorite"
                          : "Add favorite"
                      }
                      className="rounded-lg p-2 text-zinc-600 transition hover:bg-zinc-900 hover:text-yellow-400"
                    >
                      {note.isFavorite ? "★" : "☆"}
                    </button>
                  </div>
                </div>

                <p className="line-clamp-6 flex-1 whitespace-pre-wrap text-sm leading-6 text-zinc-400">
                  {note.content}
                </p>

                {note.tags?.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {note.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-zinc-900 px-2 py-1 text-[11px] text-zinc-500"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 flex items-center justify-between border-t border-zinc-900 pt-4">
                  <button
                    onClick={() => openEdit(note)}
                    className="text-xs font-medium text-zinc-400 transition hover:text-white"
                  >
                    Edit note
                  </button>

                  <button
                    onClick={() => setDeleteTarget(note)}
                    className="text-xs font-medium text-zinc-600 transition hover:text-red-400"
                  >
                    Move to trash
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      {(isCreating || editingNote) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-zinc-800 bg-[#0c0c0f] shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100">
                  {editingNote ? "Edit note" : "Create note"}
                </h2>

                <p className="mt-1 text-xs text-zinc-600">
                  Keep your thoughts organized and searchable.
                </p>
              </div>

              <button
                onClick={resetEditor}
                className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-900 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveNote} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  Title
                </label>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Java OOP revision"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  Content
                </label>

                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write your note here..."
                  rows={9}
                  className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-700 focus:border-zinc-700"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-zinc-400">
                  Tags
                </label>

                <input
                  value={tags}
                  onChange={(event) => setTags(event.target.value)}
                  placeholder="java, dsa, interview"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-700 focus:border-zinc-700"
                />

                <p className="mt-2 text-[11px] text-zinc-600">
                  Separate multiple tags with commas.
                </p>
              </div>

              <div className="flex justify-end gap-3 border-t border-zinc-800 pt-5">
                <button
                  type="button"
                  onClick={resetEditor}
                  className="rounded-lg border border-zinc-800 px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-white" />
                  )}

                  {saving
                    ? "Saving..."
                    : editingNote
                      ? "Save changes"
                      : "Create note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-[#0c0c0f] p-6 shadow-2xl">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
              🗑
            </div>

            <h2 className="text-lg font-semibold text-zinc-100">
              Move note to trash?
            </h2>

            <p className="mt-2 text-sm leading-6 text-zinc-500">
              <span className="text-zinc-300">
                {deleteTarget.title}
              </span>{" "}
              will be moved to trash. You can restore it later.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-lg border border-zinc-800 px-4 py-2.5 text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={() => void deleteNote()}
                disabled={deleting}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {deleting && (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-white" />
                )}

                {deleting ? "Moving..." : "Move to trash"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}