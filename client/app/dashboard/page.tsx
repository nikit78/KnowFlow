"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useDashboard } from "./layout";
import { apiFetch, ApiError } from "@/lib/api";
import type {
  Collection,
  DashboardStats,
  KnowledgeDocument,
} from "@/lib/types";
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
  IconDocument,
  IconFolder,
  IconNote,
  IconPlus,
  IconSpark,
  IconStar,
  IconUpload,
  IconArrowRight,
} from "@/components/icons";

type StatsResponse = {
  success: boolean;
  stats?: DashboardStats;
};

type DocumentsResponse = {
  success: boolean;
  documents?: KnowledgeDocument[];
};

type CollectionsResponse = {
  success: boolean;
  collections?: Collection[];
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useDashboard();

  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    totalTrashDocuments: 0,
    totalStorage: 0,
  });

  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [favoritesCount, setFavoritesCount] = useState<number | null>(null);
  const [collectionsCount, setCollectionsCount] = useState<number | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const [statsData, docsData, favoritesData, collectionsData] =
          await Promise.all([
            apiFetch<StatsResponse>("/documents/stats"),
            apiFetch<DocumentsResponse>("/documents?page=1&limit=5"),
            apiFetch<DocumentsResponse>("/documents/favorites").catch(
              () => null,
            ),
            apiFetch<CollectionsResponse>("/collections").catch(() => null),
          ]);

        if (cancelled) return;

        if (statsData.success && statsData.stats) {
          setStats({
            totalDocuments: statsData.stats.totalDocuments ?? 0,
            totalTrashDocuments: statsData.stats.totalTrashDocuments ?? 0,
            totalStorage: statsData.stats.totalStorage ?? 0,
          });
        }

        setDocuments(docsData.documents ?? []);

        if (favoritesData) {
          setFavoritesCount(favoritesData.documents?.length ?? 0);
        }

        if (collectionsData) {
          setCollectionsCount(collectionsData.collections?.length ?? 0);
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
              : "Unable to load your workspace.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [router]);

  const firstName = user.name.split(" ")[0] || user.name;

  const quickActions = [
    {
      href: "/dashboard/documents/upload",
      title: "Upload document",
      description: "Add research, notes, or reports to your workspace.",
      icon: IconUpload,
    },
    {
      href: "/dashboard/collections",
      title: "New collection",
      description: "Group related documents into a focused space.",
      icon: IconFolder,
    },
    {
      href: "/dashboard/notes",
      title: "Write a note",
      description: "Capture ideas alongside your knowledge base.",
      icon: IconNote,
    },
    {
      href: "/dashboard/ask",
      title: "Ask Knowledge",
      description: "Get answers grounded in your uploaded documents.",
      icon: IconSpark,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-kf-border bg-kf-surface px-6 py-7 sm:px-8 sm:py-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-kf-accent-soft/60 blur-3xl"
        />

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-kf-accent">
            Your workspace
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-kf-ink sm:text-4xl">
            Welcome back, {firstName}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-kf-muted sm:text-[15px]">
            Everything you need to store, organize, search, and understand your
            knowledge in one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/dashboard/documents/upload" size="sm">
              <IconUpload size={15} />
              Upload document
            </Button>

            <Button href="/dashboard/ask" variant="secondary" size="sm">
              <IconSpark size={15} />
              Ask Knowledge
            </Button>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div
          className="rounded-xl border border-kf-error/20 bg-kf-error-soft px-4 py-3.5 text-sm leading-6 text-kf-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {loading ? (
        <div className="kf-card flex min-h-[280px] items-center justify-center">
          <Spinner label="Loading workspace..." />
        </div>
      ) : (
        <>
          {/* Stats */}
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-kf-faint">
                  Overview
                </p>
                <h2 className="mt-1 text-lg font-semibold tracking-tight text-kf-ink">
                  Workspace at a glance
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Documents"
                value={String(stats.totalDocuments)}
                hint="Active in workspace"
                icon={<IconDocument size={18} />}
              />

              <StatCard
                label="Storage"
                value={formatBytes(stats.totalStorage)}
                hint="Active files"
                icon={<IconUpload size={18} />}
              />

              <StatCard
                label="Favorites"
                value={
                  favoritesCount === null ? "—" : String(favoritesCount)
                }
                hint="Saved documents"
                icon={<IconStar size={18} />}
              />

              <StatCard
                label="Collections"
                value={
                  collectionsCount === null
                    ? "—"
                    : String(collectionsCount)
                }
                hint={
                  stats.totalTrashDocuments > 0
                    ? `${stats.totalTrashDocuments} in trash`
                    : "Organized spaces"
                }
                icon={<IconFolder size={18} />}
              />
            </div>
          </section>

          {/* Quick actions */}
          <section>
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-kf-faint">
                Quick actions
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-kf-ink">
                What would you like to do?
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickActions.map((action) => {
                const Icon = action.icon;

                return (
                  <Link
                    key={action.href}
                    href={action.href}
                    className="group rounded-2xl border border-kf-border bg-kf-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-kf-border-strong hover:shadow-[0_12px_32px_rgba(15,23,42,0.07)] focus:outline-none focus:ring-2 focus:ring-kf-accent/30"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-kf-accent-soft text-kf-accent-ink transition-transform duration-200 group-hover:scale-105">
                        <Icon size={19} />
                      </div>

                      <IconArrowRight
                        size={15}
                        className="mt-1 text-kf-faint transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-kf-accent"
                      />
                    </div>

                    <h3 className="mt-5 text-sm font-semibold text-kf-ink">
                      {action.title}
                    </h3>

                    <p className="mt-1.5 text-xs leading-5 text-kf-muted">
                      {action.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Recent documents */}
          <section className="overflow-hidden rounded-2xl border border-kf-border bg-kf-surface">
            <div className="flex flex-col gap-3 border-b border-kf-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-kf-faint">
                  Your library
                </p>

                <h2 className="mt-1 text-lg font-semibold tracking-tight text-kf-ink">
                  Recent documents
                </h2>

                <p className="mt-1 text-xs text-kf-muted">
                  Your latest uploads and updates
                </p>
              </div>

              {documents.length > 0 && (
                <Button
                  href="/dashboard/documents"
                  variant="ghost"
                  size="sm"
                >
                  View all
                  <IconArrowRight size={14} />
                </Button>
              )}
            </div>

            {documents.length === 0 ? (
              <div className="p-6 sm:p-8">
                <EmptyState
                  icon={<IconPlus size={20} />}
                  title="Your knowledge library is empty"
                  description="Upload your first document to start building your personal knowledge workspace."
                  action={
                    <Button href="/dashboard/documents/upload">
                      <IconUpload size={16} />
                      Upload document
                    </Button>
                  }
                />
              </div>
            ) : (
              <div className="divide-y divide-kf-border">
                {documents.map((doc) => (
                  <Link
                    key={doc._id}
                    href={`/dashboard/documents/${doc._id}`}
                    className="group flex items-center gap-3 px-5 py-4 transition-colors hover:bg-kf-surface-muted sm:gap-4 sm:px-6"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-kf-border bg-kf-surface-muted text-[10px] font-bold uppercase tracking-wide text-kf-accent-ink">
                      {getFileExtension(doc.originalName)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-semibold text-kf-ink">
                          {doc.title}
                        </p>

                        {doc.isFavorite && (
                          <IconStar
                            size={14}
                            className="shrink-0 text-kf-favorite"
                          />
                        )}
                      </div>

                      <p className="mt-1 truncate text-xs text-kf-muted">
                        {formatDocumentType(doc.documentType)} ·{" "}
                        {formatBytes(doc.fileSize)} ·{" "}
                        {formatDate(doc.createdAt)}
                      </p>
                    </div>

                    <Badge tone={getDocumentStatusTone(doc.status)}>
                      {getDocumentStatusLabel(doc.status)}
                    </Badge>

                    <IconArrowRight
                      size={15}
                      className="hidden shrink-0 text-kf-faint transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-kf-accent sm:block"
                    />
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <div className="group rounded-2xl border border-kf-border bg-kf-surface p-5 transition-all duration-200 hover:border-kf-border-strong hover:shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold text-kf-muted">{label}</p>

        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-kf-accent-soft text-kf-accent-ink transition-transform duration-200 group-hover:scale-105">
          {icon}
        </span>
      </div>

      <p className="mt-4 text-2xl font-bold tracking-[-0.025em] text-kf-ink">
        {value}
      </p>

      <p className="mt-1 text-xs text-kf-faint">{hint}</p>
    </div>
  );
}