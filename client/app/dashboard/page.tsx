"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = "http://localhost:5000/api";

type User = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
};

type DashboardStats = {
  totalDocuments: number;
  totalTrashDocuments: number;
  totalStorage: number;
};

type Document = {
  _id: string;
  title: string;
  originalName: string;
  documentType: string;
  fileSize: number;
  status: "uploaded" | "processing" | "processed" | "failed";
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    totalTrashDocuments: 0,
    totalStorage: 0,
  });

  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [documentsError, setDocumentsError] = useState("");

  const [loading, setLoading] = useState(true);

    const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Document[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement | null>(null);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        // ==========================
        // Current User
        // ==========================

        const userResponse = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!userResponse.ok) {
          router.replace("/auth/login");
          return;
        }

        const userData = await userResponse.json();

        if (!userData.success || !userData.user) {
          router.replace("/auth/login");
          return;
        }

        setUser(userData.user);

        // ==========================
        // Document Statistics
        // ==========================

        const statsResponse = await fetch(`${API_URL}/documents/stats`, {
          method: "GET",
          credentials: "include",
        });

        const statsData = await statsResponse.json();

        if (statsResponse.ok && statsData.success) {
          setStats({
            totalDocuments: statsData.stats?.totalDocuments ?? 0,
            totalTrashDocuments:
              statsData.stats?.totalTrashDocuments ?? 0,
            totalStorage: statsData.stats?.totalStorage ?? 0,
          });
        }

        // ==========================
        // Recent Documents
        // ==========================

        try {
          setDocumentsLoading(true);
          setDocumentsError("");

          const documentsResponse = await fetch(
            `${API_URL}/documents?page=1&limit=5`,
            {
              method: "GET",
              credentials: "include",
            }
          );

          const documentsData = await documentsResponse.json();

          if (!documentsResponse.ok || !documentsData.success) {
            throw new Error(
              documentsData.message || "Unable to load documents"
            );
          }

          setDocuments(documentsData.documents ?? []);
        } catch (error) {
          console.error("Documents loading error:", error);
          setDocumentsError("Unable to load your recent documents.");
        } finally {
          setDocumentsLoading(false);
        }
      } catch (error) {
        console.error("Dashboard loading error:", error);
        router.replace("/auth/login");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  // ==========================
  // Helpers
  // ==========================

  const formatStorage = (bytes: number) => {
    if (bytes === 0) {
      return "0 B";
    }

    const units = ["B", "KB", "MB", "GB"];

    const index = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1
    );

    return `${(bytes / Math.pow(1024, index)).toFixed(
      index === 0 ? 0 : 1
    )} ${units[index]}`;
  };

  const formatDocumentType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getFileExtension = (fileName: string) => {
    const parts = fileName.split(".");
    return parts.length > 1 ? parts.pop()?.toUpperCase() : "FILE";
  };

  const getStatusStyles = (status: Document["status"]) => {
    switch (status) {
      case "processed":
        return "border-emerald-400/10 bg-emerald-400/[0.06] text-emerald-300";

      case "processing":
        return "border-amber-400/10 bg-amber-400/[0.06] text-amber-300";

      case "failed":
        return "border-red-400/10 bg-red-400/[0.06] text-red-300";

      default:
        return "border-white/10 bg-white/[0.04] text-zinc-400";
    }
  };

  const getStatusLabel = (status: Document["status"]) => {
    switch (status) {
      case "processed":
        return "Processed";
      case "processing":
        return "Processing";
      case "failed":
        return "Failed";
      default:
        return "Uploaded";
    }
  };

    const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.replace("/auth/login");
    }
  };

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;

      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(target)
      ) {
        setNotificationOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProfileOpen(false);
        setNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearch = async () => {
    const query = searchQuery.trim();

    if (!query) {
      setSearchResults([]);
      setSearchError("");
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError("");

      const response = await fetch(
        `${API_URL}/documents/search?q=${encodeURIComponent(query)}`,
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
        throw new Error(data.message || "Search failed");
      }

      setSearchResults(data.documents ?? []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setSearchError(
        error instanceof Error
          ? error.message
          : "Unable to search documents."
      );
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09090B] text-zinc-100">
        <div className="flex items-center gap-3 text-sm text-zinc-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
          Loading your workspace...
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const firstName = user.name.split(" ")[0];

  return (
    <main className="min-h-screen bg-[#09090B] text-zinc-100">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-[#0C0C0F] lg:flex lg:flex-col">
          <div className="flex h-20 items-center border-b border-white/5 px-6">
            <button
              onClick={() => router.push("/")}
              className="text-xl font-semibold tracking-tight"
            >
              Know<span className="text-blue-400">Flow</span>
            </button>
          </div>

          <div className="flex-1 px-4 py-6">
            <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
              Workspace
            </p>

            <nav className="mt-3 space-y-1">
              <button className="flex w-full items-center gap-3 rounded-lg bg-white/[0.06] px-3 py-2.5 text-sm font-medium text-zinc-100">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
                Overview
              </button>

              <button
                onClick={() => router.push("/dashboard/documents")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4H10l2 2h5.5A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20h-11A2.5 2.5 0 0 1 4 17.5v-11Z" />
                </svg>
                Documents
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard/collections")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="7" cy="7" r="2.5" />
                  <circle cx="17" cy="7" r="2.5" />
                  <circle cx="7" cy="17" r="2.5" />
                  <path d="M9 7h5.5M7 9.5v5M9 17h5.5M17 9.5v5" />
                </svg>
                Collections
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard/notes")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M5 4.5h14A1.5 1.5 0 0 1 20.5 6v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5Z" />
                  <path d="M8 8h8M8 12h6M8 16h4" />
                </svg>
                Notes
              </button>
            </nav>

            <p className="mt-9 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">
              Knowledge
            </p>

            <nav className="mt-3 space-y-1">
              <button
                type="button"
                onClick={() => router.push("/dashboard/ask")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M12 3v18M3 12h18" />
                  <circle cx="12" cy="12" r="7.5" />
                </svg>
                Ask Knowledge
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard/favorites")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200">
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="m12 3 2.6 5.4L20 11l-5.4 2.6L12 19l-2.6-5.4L4 11l5.4-2.6L12 3Z" />
                </svg>
                Favorites
              </button>

              <button
                type="button"
                onClick={() => router.push("/dashboard/trash")}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-white/[0.04] hover:text-zinc-200"
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 18.5v-13Z" />
                  <path d="M8 8h8M8 12h6" />
                </svg>
                Trash
              </button>
            </nav>
          </div>

          {/* User */}
          <div className="border-t border-white/5 p-4">
            <div className="flex items-center gap-3 rounded-xl px-2 py-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-sm font-semibold text-blue-300">
                {firstName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-200">
                  {user.name}
                </p>

                <p className="truncate text-xs text-zinc-600">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <section className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="flex h-20 items-center justify-between border-b border-white/5 px-6 sm:px-8">
            <div>
              <p className="text-xs font-medium text-zinc-600">
                Personal workspace
              </p>

              <h2 className="mt-0.5 text-sm font-medium text-zinc-200">
                Overview
              </h2>
            </div>

            <div className="flex items-center gap-3">
             <button
  type="button"
  onClick={() => {
    setSearchOpen(true);
    setSearchError("");
  }}
  className="hidden h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 text-xs text-zinc-500 transition-colors hover:bg-white/[0.05] hover:text-zinc-300 sm:flex"
>
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m16 16 4.5 4.5" />
                </svg>

                Search

                <span className="ml-2 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-zinc-700">
                  /
                </span>
              </button>

              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationOpen((open) => !open);
                    setProfileOpen(false);
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                    notificationOpen
                      ? "border-white/15 bg-white/[0.06] text-zinc-200"
                      : "border-white/10 text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-200"
                  }`}
                  aria-label="Notifications"
                  aria-expanded={notificationOpen}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
                  </svg>
                </button>

                {notificationOpen && (
                  <div className="absolute right-0 top-12 z-50 w-72 overflow-hidden rounded-2xl border border-white/10 bg-[#0C0C0F] shadow-2xl shadow-black/40">
                    <div className="border-b border-white/5 px-4 py-4">
                      <p className="text-sm font-semibold text-zinc-200">
                        Notifications
                      </p>
                      <p className="mt-1 text-xs leading-5 text-zinc-600">
                        Workspace updates and activity will appear here.
                      </p>
                    </div>

                    <div className="px-4 py-5">
                      <div className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-5 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.04] text-zinc-500">
                          <svg
                            width="17"
                            height="17"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          >
                            <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />
                          </svg>
                        </div>
                        <p className="mt-3 text-xs font-medium text-zinc-300">
                          No new notifications
                        </p>
                        <p className="mt-1 text-[11px] leading-5 text-zinc-600">
                          You&apos;re all caught up.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div ref={profileRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen((open) => !open);
                    setNotificationOpen(false);
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                    profileOpen
                      ? "bg-blue-500/25 text-blue-200 ring-2 ring-blue-400/10"
                      : "bg-blue-500/15 text-blue-300 hover:bg-blue-500/25"
                  }`}
                  aria-label="Open profile menu"
                  aria-expanded={profileOpen}
                >
                  {firstName.charAt(0).toUpperCase()}
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0C0C0F] shadow-2xl shadow-black/40">
                    <div className="border-b border-white/5 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-sm font-semibold text-blue-300">
                          {firstName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-zinc-200">
                            {user.name}
                          </p>
                          <p className="truncate text-xs text-zinc-600">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2">
                      <div className="rounded-xl px-3 py-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-700">
                          Account
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          Personal workspace
                        </p>
                      </div>

                      <div className="my-1 border-t border-white/5" />

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-red-300 transition-colors hover:bg-red-400/[0.06]"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                        >
                          <path d="M10 5H6.5A1.5 1.5 0 0 0 5 6.5v11A1.5 1.5 0 0 0 6.5 19H10" />
                          <path d="M13 8l4 4-4 4M17 12H9" />
                        </svg>
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10">
            <div className="mb-8">
              <p className="text-sm text-zinc-500">Good to see you back,</p>

              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-zinc-100">
                {firstName}.
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-600">
                Your knowledge workspace is ready. Capture something new or
                continue exploring what you have already built.
              </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <p className="text-xs font-medium text-zinc-600">
                  Documents
                </p>

                <div className="mt-3 flex items-end justify-between gap-4">
                  <p className="text-2xl font-semibold tracking-tight text-zinc-100">
                    {stats.totalDocuments}
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-300">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M5 4.5h9l5 5v10H5a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 5 4.5Z" />
                      <path d="M14 4.5V10h5M8 14h8M8 17h5" />
                    </svg>
                  </div>
                </div>

                <p className="mt-2 text-xs text-zinc-700">
                  Active documents
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <p className="text-xs font-medium text-zinc-600">
                  Storage used
                </p>

                <div className="mt-3 flex items-end justify-between gap-4">
                  <p className="text-2xl font-semibold tracking-tight text-zinc-100">
                    {formatStorage(stats.totalStorage)}
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-zinc-300">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
                      <path d="M8 12h8" />
                    </svg>
                  </div>
                </div>

                <p className="mt-2 text-xs text-zinc-700">
                  Active workspace files
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                <p className="text-xs font-medium text-zinc-600">
                  In trash
                </p>

                <div className="mt-3 flex items-end justify-between gap-4">
                  <p className="text-2xl font-semibold tracking-tight text-zinc-100">
                    {stats.totalTrashDocuments}
                  </p>

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] text-zinc-300">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path d="M5 7h14M9 7V4.5h6V7M7 7l1 13h8l1-13M10 11v5M14 11v5" />
                    </svg>
                  </div>
                </div>

                <p className="mt-2 text-xs text-zinc-700">
                  Deleted documents
                </p>
              </div>
            </div>

            {/* Quick actions */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => router.push("/dashboard/documents")}
                className="group rounded-2xl border border-blue-400/10 bg-blue-500/[0.06] p-5 text-left transition-colors hover:border-blue-400/20 hover:bg-blue-500/[0.09]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>

                <h3 className="mt-4 text-sm font-semibold text-zinc-200">
                  Add a document
                </h3>

                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Upload research, notes, reports, books, or other useful
                  knowledge.
                </p>
              </button>

             <button
  type="button"
  onClick={() => router.push("/dashboard/ask")}
  className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-left transition-colors hover:border-white/15 hover:bg-white/[0.04]"
>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] text-zinc-300">
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M11 4h8v8M20 4l-9 9" />
                    <path d="M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" />
                  </svg>
                </div>

                <h3 className="mt-4 text-sm font-semibold text-zinc-200">
                  Ask your knowledge
                </h3>

                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Search across your workspace and get answers grounded in
                  your documents.
                </p>
              </button>
            </div>

            {/* Workspace */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.015]">
              <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
                <div>
                  <h2 className="text-sm font-semibold text-zinc-200">
                    Your workspace
                  </h2>

                  <p className="mt-1 text-xs text-zinc-600">
                    Your most recent documents and activity.
                  </p>
                </div>

                {documents.length > 0 && (
                  <button
                    onClick={() => router.push("/dashboard/documents")}
                    className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-200"
                  >
                    View all
                  </button>
                )}
              </div>

              {/* Loading */}
              {documentsLoading && (
                <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                  <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                    Loading your documents...
                  </div>
                </div>
              )}

              {/* Error */}
              {!documentsLoading && documentsError && (
                <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-400/10 bg-red-400/[0.05] text-red-300">
                    <svg
                      width="21"
                      height="21"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M12 8v5M12 16.5v.5" />
                      <path d="M10.2 4.5 3.8 17a2 2 0 0 0 1.8 2.9h12.8a2 2 0 0 0 1.8-2.9L13.8 4.5a2 2 0 0 0-3.6 0Z" />
                    </svg>
                  </div>

                  <h3 className="mt-4 text-sm font-medium text-zinc-300">
                    Could not load documents
                  </h3>

                  <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-600">
                    {documentsError}
                  </p>

                  <button
                    onClick={() => window.location.reload()}
                    className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-medium text-zinc-300 transition-colors hover:bg-white/[0.06]"
                  >
                    Try again
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!documentsLoading &&
                !documentsError &&
                documents.length === 0 && (
                  <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-600">
                      <svg
                        width="21"
                        height="21"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      >
                        <path d="M5 4.5h9l5 5v10H5a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 5 4.5Z" />
                        <path d="M14 4.5V10h5" />
                      </svg>
                    </div>

                    <h3 className="mt-4 text-sm font-medium text-zinc-300">
                      Nothing here yet
                    </h3>

                    <p className="mt-1 max-w-sm text-xs leading-5 text-zinc-600">
                      Start by adding your first document. Once your workspace
                      has content, your recent documents will appear here.
                    </p>

                    <button
                      onClick={() => router.push("/dashboard/documents")}
                      className="mt-5 rounded-lg bg-blue-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-400"
                    >
                      Add your first document
                    </button>
                  </div>
                )}

              {/* Documents */}
              {!documentsLoading &&
                !documentsError &&
                documents.length > 0 && (
                  <div className="divide-y divide-white/5">
                    {documents.map((document) => (
                      <button
                        key={document._id}
                        type="button"
                        onClick={() =>
                          router.push("/dashboard/documents")
                        }
                        className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.025]"
                      >
                        {/* File icon */}
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-[10px] font-bold tracking-wide text-zinc-500">
                          {getFileExtension(document.originalName)}
                        </div>

                        {/* Main document info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate text-sm font-medium text-zinc-200">
                              {document.title}
                            </p>

                            {document.isFavorite && (
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="shrink-0 text-amber-300"
                              >
                                <path d="m12 3 2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L12 3Z" />
                              </svg>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-600">
                            <span>
                              {formatDocumentType(document.documentType)}
                            </span>

                            <span className="text-zinc-800">•</span>

                            <span>{formatStorage(document.fileSize)}</span>

                            <span className="text-zinc-800">•</span>

                            <span>{formatDate(document.createdAt)}</span>
                          </div>

                          {document.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {document.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="rounded-md border border-white/5 bg-white/[0.025] px-1.5 py-0.5 text-[10px] text-zinc-600"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Status */}
                        <div
                          className={`hidden shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium sm:block ${getStatusStyles(
                            document.status
                          )}`}
                        >
                          {getStatusLabel(document.status)}
                        </div>

                        {/* Arrow */}
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.7"
                          className="shrink-0 text-zinc-700 transition-colors group-hover:text-zinc-400"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </button>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </section>
      </div>
            {/* Global Search Modal */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 px-4 pt-[12vh] backdrop-blur-sm"
          onMouseDown={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0C0C0F] shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {/* Search Header */}
            <div className="border-b border-white/5 p-4">
              <div className="flex items-center gap-3">
                <svg
                  width="19"
                  height="19"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="shrink-0 text-zinc-500"
                >
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m16 16 4.5 4.5" />
                </svg>

                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleSearch();
                    }

                    if (event.key === "Escape") {
                      setSearchOpen(false);
                    }
                  }}
                  placeholder="Search your documents..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                />

                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="rounded-lg border border-white/10 px-2 py-1 text-[10px] text-zinc-600 transition hover:bg-white/[0.04] hover:text-zinc-300"
                >
                  ESC
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <p className="text-[11px] text-zinc-600">
                  Search by document title, filename, tags, or extracted text.
                </p>

                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="rounded-lg bg-blue-500 px-3 py-1.5 text-[11px] font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {searchLoading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {/* Search Results */}
            <div className="max-h-[55vh] overflow-y-auto">
              {searchError && (
                <div className="m-4 rounded-xl border border-red-400/10 bg-red-400/[0.05] px-4 py-3 text-xs text-red-300">
                  {searchError}
                </div>
              )}

              {!searchLoading &&
                !searchError &&
                searchQuery.trim() &&
                searchResults.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-600">
                      <svg
                        width="21"
                        height="21"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      >
                        <circle cx="11" cy="11" r="6.5" />
                        <path d="m16 16 4.5 4.5" />
                      </svg>
                    </div>

                    <p className="mt-4 text-sm font-medium text-zinc-300">
                      No documents found
                    </p>

                    <p className="mt-1 text-xs text-zinc-600">
                      Try another title, filename, tag, or keyword.
                    </p>
                  </div>
                )}

              {searchLoading && (
                <div className="px-6 py-12 text-center">
                  <div className="flex items-center justify-center gap-3 text-sm text-zinc-500">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-blue-400" />
                    Searching your knowledge...
                  </div>
                </div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <div className="divide-y divide-white/5">
                  {searchResults.map((document) => (
                    <button
                      key={document._id}
                      type="button"
                      onClick={() => {
                        setSearchOpen(false);
                        router.push(
                          `/dashboard/documents/${document._id}`
                        );
                      }}
                      className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-[10px] font-bold tracking-wide text-zinc-500">
                        {getFileExtension(document.originalName)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium text-zinc-200">
                            {document.title}
                          </p>

                          {document.isFavorite && (
                            <span className="shrink-0 text-xs text-amber-300">
                              ★
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-zinc-600">
                          <span className="truncate">
                            {document.originalName}
                          </span>

                          <span>•</span>

                          <span>
                            {formatDocumentType(document.documentType)}
                          </span>

                          <span>•</span>

                          <span>
                            {formatStorage(document.fileSize)}
                          </span>
                        </div>

                        {document.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {document.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md border border-white/5 bg-white/[0.025] px-1.5 py-0.5 text-[10px] text-zinc-600"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        className="shrink-0 text-zinc-700 transition-colors group-hover:text-zinc-400"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}

              {!searchQuery.trim() && (
                <div className="px-6 py-10">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-700">
                    Quick search
                  </p>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      "KnowFlow",
                      "research",
                      "lecture notes",
                      "machine learning",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => {
                          setSearchQuery(suggestion);
                        }}
                        className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 text-left text-xs text-zinc-500 transition hover:border-white/10 hover:bg-white/[0.04] hover:text-zinc-300"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}