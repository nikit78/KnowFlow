"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "../layout";
import { apiFetch, ApiError } from "@/lib/api";
import type { Note } from "@/lib/types";
import { formatDate } from "@/lib/format";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import Input from "@/components/ui/Input";
import Spinner from "@/components/ui/Spinner";
import {
  IconArrowRight,
  IconNote,
  IconPlus,
  IconSearch,
  IconStar,
  IconTrash,
} from "@/components/icons";

type NotesResponse = {
  success: boolean;
  notes?: Note[];
  message?: string;
};

export default function NotesPage() {
  useDashboard();
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

  const loadNotes = useCallback(async () => {
    try {
      setError("");

      const data = await apiFetch<NotesResponse>("/notes");

      setNotes(data.notes ?? []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading notes.",
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  function resetEditor() {
    setTitle("");
    setContent("");
    setTags("");
    setIsCreating(false);
    setEditingNote(null);
  }

  function openCreate() {
    setError("");
    setEditingNote(null);
    setTitle("");
    setContent("");
    setTags("");
    setIsCreating(true);
  }

  function openEdit(note: Note) {
    setError("");
    setIsCreating(false);
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags?.join(", ") || "");
  }

  async function saveNote(event: FormEvent<HTMLFormElement>) {
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

      const payload = {
        title: title.trim(),
        content: content.trim(),
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      if (editingNote) {
        await apiFetch(`/notes/${editingNote._id}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await apiFetch("/notes", {
          method: "POST",
          body: payload,
        });
      }

      resetEditor();
      await loadNotes();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the note.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function togglePin(note: Note) {
    try {
      setError("");

      await apiFetch(`/notes/${note._id}/pin`, {
        method: "PATCH",
      });

      setNotes((current) =>
        current.map((item) =>
          item._id === note._id
            ? {
                ...item,
                isPinned: !item.isPinned,
              }
            : item,
        ),
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setError(
        err instanceof Error ? err.message : "Unable to update note.",
      );
    }
  }

  async function toggleFavorite(note: Note) {
    try {
      setError("");

      await apiFetch(`/notes/${note._id}/favorite`, {
        method: "PATCH",
      });

      setNotes((current) =>
        current.map((item) =>
          item._id === note._id
            ? {
                ...item,
                isFavorite: !item.isFavorite,
              }
            : item,
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
          : "Unable to update favorite.",
      );
    }
  }

  async function deleteNote() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setError("");

      await apiFetch(`/notes/${deleteTarget._id}`, {
        method: "DELETE",
      });

      setNotes((current) =>
        current.filter((note) => note._id !== deleteTarget._id),
      );

      setDeleteTarget(null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        router.replace("/auth/login");
        return;
      }

      setError(
        err instanceof Error ? err.message : "Unable to delete note.",
      );
    } finally {
      setDeleting(false);
    }
  }

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = !query
      ? notes
      : notes.filter(
          (note) =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query) ||
            note.tags?.some((tag) =>
              tag.toLowerCase().includes(query),
            ),
        );

    return [...result].sort((a, b) => {
      if (Boolean(a.isPinned) !== Boolean(b.isPinned)) {
        return a.isPinned ? -1 : 1;
      }

      return (
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
      );
    });
  }, [notes, searchQuery]);

  const pinnedCount = notes.filter((note) => note.isPinned).length;
  const favoriteCount = notes.filter((note) => note.isFavorite).length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-kf-accent-ink">
            Personal knowledge
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-kf-ink sm:text-4xl">
            Notes
          </h1>

          <p className="mt-3 text-sm leading-6 text-kf-muted sm:text-base">
            Capture ideas, technical concepts, interview preparation, and
            useful thoughts alongside your documents.
          </p>
        </div>

        <Button onClick={openCreate}>
          <IconPlus size={16} />
          New note
        </Button>
      </section>

      {/* Overview */}
      <section className="grid gap-4 sm:grid-cols-3">
        <div className="kf-card p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-kf-muted">
            Total notes
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-kf-ink">
            {notes.length}
          </p>

          <p className="mt-2 text-xs text-kf-faint">
            Your saved knowledge
          </p>
        </div>

        <div className="kf-card p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-kf-muted">
            Pinned
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-kf-ink">
            {pinnedCount}
          </p>

          <p className="mt-2 text-xs text-kf-faint">
            Quick-access notes
          </p>
        </div>

        <div className="kf-card p-5">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-kf-muted">
            Favorites
          </p>

          <p className="mt-3 text-3xl font-bold tracking-tight text-kf-ink">
            {favoriteCount}
          </p>

          <p className="mt-2 text-xs text-kf-faint">
            Notes marked important
          </p>
        </div>
      </section>

      {/* Search */}
      <section className="kf-card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-kf-ink">
              Search your notes
            </h2>

            <p className="mt-1 text-xs text-kf-muted">
              Search by title, content, or tag.
            </p>
          </div>

          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="self-start text-xs font-semibold text-kf-accent-ink hover:underline sm:self-auto"
            >
              Clear search
            </button>
          )}
        </div>

        <div className="relative mt-4">
          <IconSearch
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-kf-faint"
          />

          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search notes, content or tags..."
            aria-label="Search notes"
            className="h-11 w-full rounded-xl border border-kf-border bg-kf-surface pl-10 pr-4 text-sm text-kf-ink outline-none transition placeholder:text-kf-faint focus:border-kf-accent focus:ring-2 focus:ring-kf-accent/15"
          />
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
            onClick={() => void loadNotes()}
            className="w-fit rounded-lg px-3 py-2 font-semibold hover:bg-white/60 hover:underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Notes */}
      {loading ? (
        <div className="kf-card flex min-h-[320px] items-center justify-center">
          <Spinner label="Loading notes..." />
        </div>
      ) : filteredNotes.length === 0 ? (
        <EmptyState
          icon={<IconNote size={22} />}
          title={
            searchQuery
              ? "No notes found"
              : "Start writing your first note"
          }
          description={
            searchQuery
              ? "Try a different search term or search by tag."
              : "Keep ideas and useful information close to your documents."
          }
          action={
            !searchQuery ? (
              <Button onClick={openCreate}>
                <IconPlus size={16} />
                Create your first note
              </Button>
            ) : undefined
          }
        />
      ) : (
        <section>
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-kf-accent-ink">
                Your workspace
              </p>

              <h2 className="mt-1 text-xl font-semibold text-kf-ink">
                Your notes
              </h2>

              <p className="mt-1 text-sm text-kf-muted">
                {searchQuery
                  ? `${filteredNotes.length} matching ${
                      filteredNotes.length === 1 ? "note" : "notes"
                    }`
                  : "Recently updated notes, with pinned notes first."}
              </p>
            </div>

            <span className="text-xs text-kf-faint">
              {filteredNotes.length} shown
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredNotes.map((note) => (
              <article
                key={note._id}
                className="kf-card group flex min-h-[270px] flex-col overflow-hidden p-5 transition duration-200 hover:-translate-y-0.5 hover:border-kf-border-strong"
              >
                {/* Card header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex min-w-0 items-center gap-2">
                      {note.isPinned && <BadgePin />}

                      <h2 className="truncate text-base font-semibold text-kf-ink">
                        {note.title}
                      </h2>
                    </div>

                    <p className="mt-2 text-xs text-kf-muted">
                      Updated{" "}
                      {formatDate(note.updatedAt || note.createdAt)}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void togglePin(note)}
                      title={note.isPinned ? "Unpin note" : "Pin note"}
                      aria-label={
                        note.isPinned ? "Unpin note" : "Pin note"
                      }
                      className={`rounded-lg px-2 py-1.5 text-[11px] font-semibold transition ${
                        note.isPinned
                          ? "bg-kf-accent-soft text-kf-accent-ink"
                          : "text-kf-faint hover:bg-kf-surface-muted hover:text-kf-accent-ink"
                      }`}
                    >
                      {note.isPinned ? "Pinned" : "Pin"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void toggleFavorite(note)}
                      title={
                        note.isFavorite
                          ? "Remove favorite"
                          : "Add favorite"
                      }
                      aria-label={
                        note.isFavorite
                          ? "Remove favorite"
                          : "Add favorite"
                      }
                      className="rounded-lg p-2 text-kf-faint transition hover:bg-kf-surface-muted hover:text-kf-favorite"
                    >
                      <IconStar
                        size={15}
                        className={
                          note.isFavorite
                            ? "fill-current text-kf-favorite"
                            : undefined
                        }
                      />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="mt-5 line-clamp-7 flex-1 whitespace-pre-wrap text-sm leading-6 text-kf-ink-soft">
                  {note.content}
                </p>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                  <div className="mt-5 flex flex-wrap gap-2">
                    {note.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-kf-border bg-kf-surface-muted px-2 py-1 text-[11px] font-medium text-kf-muted"
                      >
                        #{tag}
                      </span>
                    ))}

                    {note.tags.length > 4 && (
                      <span className="rounded-md bg-kf-surface-muted px-2 py-1 text-[11px] text-kf-faint">
                        +{note.tags.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="mt-5 flex items-center justify-between gap-3 border-t border-kf-border pt-4">
                  <button
                    type="button"
                    onClick={() => openEdit(note)}
                    className="text-xs font-semibold text-kf-muted transition hover:text-kf-ink"
                  >
                    Edit note
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(note)}
                    className="text-xs font-semibold text-kf-faint transition hover:text-kf-error"
                  >
                    Move to trash
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Create / Edit modal */}
      {(isCreating || editingNote) && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-kf-ink/35 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              resetEditor();
            }
          }}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-kf-border bg-kf-surface shadow-[var(--kf-shadow)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="note-editor-title"
          >
            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 border-b border-kf-border px-6 py-5 sm:px-7">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-kf-accent-ink">
                  {editingNote ? "Edit knowledge" : "New knowledge"}
                </p>

                <h2
                  id="note-editor-title"
                  className="mt-1 text-xl font-semibold text-kf-ink"
                >
                  {editingNote ? "Edit note" : "Create note"}
                </h2>

                <p className="mt-1.5 text-sm text-kf-muted">
                  Keep your thoughts organized and searchable.
                </p>
              </div>

              <button
                type="button"
                onClick={resetEditor}
                disabled={saving}
                aria-label="Close note editor"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-kf-faint transition hover:bg-kf-surface-muted hover:text-kf-ink disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form onSubmit={saveNote} className="space-y-5 p-6 sm:p-7">
              <Input
                label="Title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Java OOP revision"
              />

              <div>
                <label className="mb-2 block text-sm font-medium text-kf-ink-soft">
                  Content
                </label>

                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  placeholder="Write your note here..."
                  rows={10}
                  className="w-full resize-none rounded-xl border border-kf-border bg-kf-surface px-3.5 py-3 text-sm leading-6 text-kf-ink outline-none transition placeholder:text-kf-faint focus:border-kf-accent focus:ring-2 focus:ring-kf-accent/15"
                />

                <p className="mt-2 text-[11px] text-kf-faint">
                  Write anything you want to remember, revise, or search
                  later.
                </p>
              </div>

              <Input
                label="Tags"
                hint="Separate multiple tags with commas."
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="java, dsa, interview"
              />

              <div className="flex flex-col-reverse gap-3 border-t border-kf-border pt-5 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={resetEditor}
                  disabled={saving}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={saving}>
                  {saving
                    ? "Saving..."
                    : editingNote
                      ? "Save changes"
                      : "Create note"}

                  {!saving && <IconArrowRight size={15} />}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-kf-ink/35 px-4 backdrop-blur-sm"
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
            aria-labelledby="delete-note-title"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-kf-error-soft text-kf-error">
              <IconTrash size={20} />
            </div>

            <h2
              id="delete-note-title"
              className="mt-5 text-xl font-semibold text-kf-ink"
            >
              Move note to trash?
            </h2>

            <p className="mt-2 text-sm leading-6 text-kf-muted">
              <span className="font-semibold text-kf-ink">
                {deleteTarget.title}
              </span>{" "}
              will be moved to trash. You can restore it later.
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
                onClick={() => void deleteNote()}
              >
                {deleting ? "Moving..." : "Move to trash"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BadgePin() {
  return (
    <span className="shrink-0 rounded-full bg-kf-accent-soft px-2 py-0.5 text-[10px] font-semibold text-kf-accent-ink">
      Pinned
    </span>
  );
}