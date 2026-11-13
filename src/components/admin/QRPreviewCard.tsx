"use client";

import React from "react";
import { QrCode, ExternalLink, ShieldCheck, Smartphone } from "lucide-react";

interface QRPreviewCardProps {
  svgContent: string;
  targetUrl: string;
  foregroundColor: string;
  backgroundColor: string;
  embedLogo: boolean;
  isLoading?: boolean;
}

export function QRPreviewCard({
  svgContent,
  targetUrl,
  foregroundColor,
  backgroundColor,
  embedLogo,
  isLoading = false,
}: QRPreviewCardProps) {
  return (
    <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col items-center text-center">
      <div className="w-full flex items-center justify-between pb-4 border-b border-[var(--surface-border)] mb-6">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]">
            <QrCode className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Live Vector Canvas
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ECL-H (30% Recovery)</span>
        </div>
      </div>

      {/* QR Canvas Display */}
      <div className="relative group p-4 sm:p-6 rounded-2xl bg-white border border-[#EFECE6] shadow-sm transition-transform duration-300 hover:scale-[1.01]">
        {isLoading ? (
          <div className="w-64 h-64 sm:w-72 sm:h-72 flex flex-col items-center justify-center gap-3 bg-neutral-50 rounded-xl animate-pulse">
            <QrCode className="w-12 h-12 text-neutral-300 animate-spin" />
            <span className="text-xs font-medium text-neutral-400">Rendering preview...</span>
          </div>
        ) : svgContent ? (
          <div
            className="w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
            aria-label="Restaurant Digital Menu QR Code Live Preview"
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        ) : (
          <div className="w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center text-neutral-400 text-xs">
            No preview available
          </div>
        )}
      </div>

      {/* Target URL Pill */}
      <div className="mt-5 w-full max-w-sm">
        <div className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
          Permanent Destination URL
        </div>
        <a
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-xs font-mono font-medium rounded-lg bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--brand-primary)] hover:border-[var(--brand-primary)] transition-colors truncate"
          title="Open live public customer menu"
        >
          <span className="truncate">{targetUrl}</span>
          <ExternalLink className="w-3 h-3 shrink-0" />
        </a>
      </div>

      {/* Mobile Verification Callout */}
      <div className="mt-6 w-full max-w-sm p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left flex items-start gap-3">
        <div className="p-1 rounded-md bg-amber-500/20 text-amber-700 shrink-0 mt-0.5">
          <Smartphone className="w-4 h-4" />
        </div>
        <div>
          <div className="text-xs font-semibold text-amber-900">
            Instant Camera Verification
          </div>
          <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
            Open your iPhone or Android camera app right now and point it at your screen to test scannability and live menu redirection.
          </p>
        </div>
      </div>
    </div>
  );
}

