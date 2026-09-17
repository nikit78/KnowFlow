"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { User } from "@/lib/types";
import { getInitials } from "@/lib/format";
import {
  IconDocument,
  IconFolder,
  IconHome,
  IconLogout,
  IconMenu,
  IconClose,
  IconNote,
  IconSpark,
  IconStar,
  IconTrash,
  IconUser,
} from "@/components/icons";
import Spinner from "@/components/ui/Spinner";

type AuthResponse = {
  success: boolean;
  user: User;
};

type DashboardContextValue = {
  user: User;
  refreshUser: () => Promise<void>;
};

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboard() {
  const value = useContext(DashboardContext);

  if (!value) {
    throw new Error("useDashboard must be used within the dashboard layout");
  }

  return value;
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: IconHome },
  { href: "/dashboard/documents", label: "Documents", icon: IconDocument },
  { href: "/dashboard/collections", label: "Collections", icon: IconFolder },
  { href: "/dashboard/notes", label: "Notes", icon: IconNote },
  { href: "/dashboard/favorites", label: "Favorites", icon: IconStar },
  { href: "/dashboard/trash", label: "Trash", icon: IconTrash },
  { href: "/dashboard/ask", label: "Ask Knowledge", icon: IconSpark },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  async function refreshUser() {
    const data = await apiFetch<AuthResponse>("/auth/me");
    setUser(data.user);
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        await refreshUser();
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          router.replace("/auth/login");
          return;
        }

        router.replace("/auth/login");
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
  }, [router]);

  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const value = useMemo(
    () => ({
      user: user as User,
      refreshUser,
    }),
    [user],
  );

  async function handleLogout() {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch {
      // Still leave the session UI even if logout request fails.
    }

    router.replace("/auth/login");
  }

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-kf-bg">
        <Spinner label="Loading workspace..." />
      </div>
    );
  }

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-kf-border bg-kf-surface">
      {/* Brand */}
      <div className="flex h-16 items-center justify-between border-b border-kf-border px-5">
        <Link
          href="/dashboard"
          className="text-lg font-bold tracking-[-0.025em] text-kf-ink"
        >
          Know<span className="text-kf-accent">Flow</span>
        </Link>

        <button
          type="button"
          className="rounded-lg p-2 text-kf-muted transition-colors hover:bg-kf-surface-muted hover:text-kf-ink lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <IconClose size={18} />
        </button>
      </div>

      {/* Navigation */}
      <div className="px-4 pt-6">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-kf-faint">
          Workspace
        </p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-3">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-kf-accent-soft text-kf-accent-ink"
                  : "text-kf-ink-soft hover:bg-kf-surface-muted hover:text-kf-ink"
              }`}
            >
              {active && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 h-5 w-0.5 rounded-full bg-kf-accent"
                />
              )}

              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                  active
                    ? "bg-white/70 text-kf-accent"
                    : "text-kf-muted group-hover:text-kf-ink"
                }`}
              >
                <Icon size={17} />
              </span>

              <span>{item.label}</span>

              {item.label === "Ask Knowledge" && !active && (
                <span className="ml-auto rounded-full bg-kf-accent-soft px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-kf-accent-ink">
                  AI
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="border-t border-kf-border p-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((open) => !open)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
              profileOpen
                ? "bg-kf-surface-muted"
                : "hover:bg-kf-surface-muted"
            }`}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kf-accent-soft text-xs font-bold text-kf-accent-ink">
              {getInitials(user.name)}
            </span>

            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-kf-ink">
                {user.name}
              </span>

              <span className="mt-0.5 block truncate text-[11px] text-kf-muted">
                {user.email}
              </span>
            </span>

            <IconUser size={16} className="shrink-0 text-kf-faint" />
          </button>

          {profileOpen && (
            <div
              className="absolute bottom-[calc(100%+8px)] left-0 right-0 z-30 rounded-xl border border-kf-border bg-kf-surface p-1.5 shadow-[var(--kf-shadow)]"
              role="menu"
            >
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-kf-error transition-colors hover:bg-kf-error-soft"
                role="menuitem"
              >
                <IconLogout size={16} />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );

  return (
    <DashboardContext.Provider value={value}>
      <div className="min-h-screen bg-kf-bg lg:grid lg:grid-cols-[16rem_1fr]">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">{sidebar}</div>

        {/* Mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              className="absolute inset-0 bg-kf-ink/30 backdrop-blur-[2px]"
              aria-label="Close sidebar overlay"
              onClick={() => setSidebarOpen(false)}
            />

            <div className="absolute inset-y-0 left-0 z-10 shadow-2xl">
              {sidebar}
            </div>
          </div>
        )}

        <div className="min-w-0">
          {/* Top bar */}
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-kf-border bg-kf-bg/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
            <button
              type="button"
              className="rounded-xl border border-kf-border bg-kf-surface p-2 text-kf-ink transition-colors hover:bg-kf-surface-muted lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <IconMenu size={18} />
            </button>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-kf-ink">
                Knowledge workspace
              </p>

              <p className="hidden truncate text-xs text-kf-muted sm:block">
                Upload → Organize → Search → Ask
              </p>
            </div>

            <Link
              href="/dashboard/ask"
              className="inline-flex items-center gap-2 rounded-xl bg-kf-accent px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-kf-accent-hover hover:shadow-md focus:outline-none focus:ring-2 focus:ring-kf-accent/30"
            >
              <IconSpark size={15} />
              <span className="hidden sm:inline">Ask Knowledge</span>
              <span className="sm:hidden">Ask</span>
            </Link>
          </header>

          {/* Page content */}
          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </DashboardContext.Provider>
  );
}