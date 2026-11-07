"use client";

import { useActionState, useState } from "react";
import { loginAction, LoginActionResult } from "@/app/admin/login/actions";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

interface LoginFormProps {
  callbackUrl?: string;
}

export function LoginForm({ callbackUrl = "/admin" }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState<LoginActionResult | undefined, FormData>(
    loginAction,
    undefined
  );

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-[var(--shadow-modal)] transition-all">
      {/* Brand Icon & Heading */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-2xl bg-[var(--canvas-bg)] text-[var(--brand-primary)] border border-[var(--surface-border)] shadow-xs">
          <Lock className="w-6 h-6" aria-hidden="true" />
        </div>
        <h1 className="font-editorial text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Owner Portal
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1.5">
          Sign in to manage your restaurant menu and settings
        </p>
      </div>

      {/* Error Banner */}
      {state?.error && (
        <div
          role="alert"
          aria-live="assertive"
          className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-sm flex items-start gap-3 animate-in fade-in duration-200"
        >
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" aria-hidden="true" />
          <div className="leading-snug">{state.error}</div>
        </div>
      )}

      {/* Login Form */}
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] mb-1.5"
          >
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="username"
            placeholder="owner@restaurant.com"
            disabled={isPending}
            className="w-full px-4 py-3 rounded-lg bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-all disabled:opacity-60"
          />
        </div>

        {/* Password Field with Reveal Toggle */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              disabled={isPending}
              className="w-full px-4 py-3 pr-12 rounded-lg bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-hidden focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-transparent transition-all disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1 top-1 bottom-1 w-11 h-11 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)] rounded-md transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" aria-hidden="true" />
              ) : (
                <Eye className="w-4 h-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2.5 text-xs text-[var(--text-muted)] cursor-pointer select-none">
            <input
              type="checkbox"
              name="rememberMe"
              disabled={isPending}
              className="w-4 h-4 rounded border-[var(--surface-border)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
            />
            <span>Remember me for 30 days</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          aria-busy={isPending}
          className="w-full py-3.5 px-4 rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-[var(--brand-primary-fg)] font-medium text-sm shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)] disabled:opacity-70 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In to Admin</span>
          )}
        </button>
      </form>

      {/* Return to Public Menu Link */}
      <div className="text-center pt-8 mt-6 border-t border-[var(--surface-border)]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-primary)] rounded-md px-2.5 py-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Return to Public Menu</span>
        </Link>
      </div>
    </div>
  );
}

