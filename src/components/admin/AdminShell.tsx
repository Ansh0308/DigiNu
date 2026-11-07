"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  UtensilsCrossed,
  Store,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { logoutAction } from "@/app/admin/login/actions";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Categories", href: "/admin/categories", icon: Layers },
  { name: "Menu & 86 Hub", href: "/admin/menu", icon: UtensilsCrossed },
  { name: "Profile & Hours", href: "/admin/profile", icon: Store },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If on login page, render bare without the admin shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const isNavActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <div className="min-h-screen bg-[var(--canvas-bg)] flex flex-col md:flex-row text-[var(--text-primary)]">
      {/* Mobile Header Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-[var(--surface-card)] border-b border-[var(--surface-border)] px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--canvas-bg)] transition-colors focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)]"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-2">
            <span className="font-editorial text-lg font-bold tracking-tight text-[var(--brand-primary)]">
              DigiNu
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--surface-border)] text-[var(--text-muted)]">
              Admin
            </span>
          </div>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--brand-primary)] bg-[var(--surface-card)] border border-[var(--surface-border)] px-2.5 py-1.5 rounded-lg hover:border-[var(--brand-primary)] transition-colors"
        >
          <span>Live Menu</span>
          <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
      </header>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 md:hidden backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-64 max-w-[80vw] h-full bg-[var(--surface-card)] p-5 flex flex-col justify-between shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-[var(--surface-border)]">
                <span className="font-editorial text-xl font-bold tracking-tight text-[var(--brand-primary)]">
                  DigiNu Console
                </span>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const active = isNavActive(item);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        active
                          ? "bg-[var(--brand-primary)] text-white shadow-xs font-semibold"
                          : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--canvas-bg)]"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[var(--surface-border)] space-y-2">
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--canvas-bg)]"
              >
                <span>Preview Customer Menu</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col justify-between w-64 shrink-0 bg-[var(--surface-card)] border-r border-[var(--surface-border)] p-5 min-h-screen sticky top-0">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <span className="font-editorial text-xl font-bold tracking-tight text-[var(--text-primary)] block leading-none">
                DigiNu
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[var(--text-muted)]">
                Restaurant OS
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5" aria-label="Admin Navigation">
            {NAV_ITEMS.map((item) => {
              const active = isNavActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? "bg-[var(--brand-primary)] text-white shadow-xs font-semibold"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--canvas-bg)]"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-[var(--surface-border)] space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between w-full px-3.5 py-2 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--canvas-bg)] transition-colors"
          >
            <span>Live Menu View</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Log Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-6">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Thumb-zone priority) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface-card)]/95 backdrop-blur-md border-t border-[var(--surface-border)] flex items-center justify-around py-2 px-1"
        aria-label="Mobile Navigation"
      >
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[44px] min-w-[44px] px-2 py-1 rounded-lg text-[10px] font-medium transition-colors ${
                active
                  ? "text-[var(--brand-primary)] font-semibold"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" aria-hidden="true" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

