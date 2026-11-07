import Link from "next/link";
import { Utensils, Shield } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-between p-6 sm:p-12">
      <header className="w-full max-w-2xl flex items-center justify-between py-4 border-b border-[var(--surface-border)]">
        <div className="flex items-center gap-2">
          <Utensils className="w-6 h-6 text-[var(--brand-primary)]" aria-hidden="true" />
          <span className="font-editorial text-2xl font-semibold tracking-tight">
            DigiNu
          </span>
        </div>
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)] rounded-md px-2.5 py-1.5"
          aria-label="Owner Admin Portal Login"
        >
          <Shield className="w-4 h-4" aria-hidden="true" />
          <span>Staff Login</span>
        </Link>
      </header>

      <section className="w-full max-w-2xl text-center my-auto py-16">
        <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[var(--brand-primary)] bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-full mb-6">
          Digital Restaurant Experience
        </span>
        <h1 className="font-editorial text-4xl sm:text-5xl font-bold tracking-tight text-[var(--text-primary)] mb-4">
          Culinary Excellence, Digitally Crafted
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed mb-8">
          Welcome to our interactive digital menu. Browse fresh seasonal dishes, verify dietary preferences, and discover chef recommendations.
        </p>
        <div className="inline-flex items-center justify-center gap-3 p-4 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-xl shadow-sm text-sm text-[var(--text-muted)]">
          <div className="w-2.5 h-2.5 rounded-full bg-[var(--brand-primary)] animate-pulse" aria-hidden="true" />
          <span>Public menu rendering pipeline initialized (BUILD-01)</span>
        </div>
      </section>

      <footer className="w-full max-w-2xl text-center py-6 border-t border-[var(--surface-border)] text-xs text-[var(--text-muted)]">
        <p>DigiNu Single-Tenant Deployment Platform &bull; WCAG 2.2 AA Compliant</p>
      </footer>
    </main>
  );
}

