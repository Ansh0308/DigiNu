import Link from "next/link";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-[var(--canvas-bg)] text-[var(--text-primary)]">
      <div className="w-full max-w-md text-center p-8 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-md">
        <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-[var(--surface-border)] text-[var(--brand-primary)]">
          <Compass className="w-6 h-6" aria-hidden="true" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)] mb-2">
          Error 404
        </p>
        <h1 className="font-editorial text-3xl font-bold tracking-tight mb-3">
          Page Not Found
        </h1>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">
          The dish, category, or administrative page you are looking for does not exist or has been relocated.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-[var(--brand-primary)] text-[var(--brand-primary-fg)] font-medium text-sm hover:opacity-90 active:scale-[0.99] transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)]"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Return to Menu</span>
        </Link>
      </div>
    </main>
  );
}

