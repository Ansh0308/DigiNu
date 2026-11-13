"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  Utensils,
  ChefHat,
  ShieldAlert,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface AIStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItemId: string;
  dishName: string;
  onApplySuccess: (asset: { id: string; url: string }) => void;
}

export function AIStudioModal({
  isOpen,
  onClose,
  menuItemId,
  dishName,
  onApplySuccess,
}: AIStudioModalProps) {
  const { toast } = useToast();
  const modalRef = useRef<HTMLDivElement>(null);

  const [creditsBalance, setCreditsBalance] = useState<number | null>(null);
  const [creditsLimit, setCreditsLimit] = useState<number>(30);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);

  // Generation state machine: 'idle' | 'generating' | 'preview' | 'approving' | 'error'
  const [modalState, setModalState] = useState<
    "idle" | "generating" | "preview" | "approving" | "error"
  >("idle");

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [promptUsed, setPromptUsed] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [generationSeconds, setGenerationSeconds] = useState(0);

  // Fetch current credit balance
  const fetchCredits = useCallback(async () => {
    setIsLoadingCredits(true);
    try {
      const res = await fetch("/api/admin/ai/credits");
      const data = await res.json();
      if (res.ok && data.success) {
        setCreditsBalance(data.data.aiCreditsBalance);
        setCreditsLimit(data.data.aiCreditsMonthlyLimit);
      }
    } catch {
      // Non-critical fallback
    } finally {
      setIsLoadingCredits(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/ai/credits");
        const data = await res.json();
        if (!ignore && res.ok && data.success) {
          setCreditsBalance(data.data.aiCreditsBalance);
          setCreditsLimit(data.data.aiCreditsMonthlyLimit);
        }
      } catch {}
    }
    load();
    return () => {
      ignore = true;
    };
  }, []);

  // Timer while generating
  useEffect(() => {
    if (modalState !== "generating") return;

    const timer = setInterval(() => {
      setGenerationSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [modalState]);

  // Discard candidate helper (persists DISCARDED status, credit remains consumed)
  const discardActiveCandidate = useCallback(async (resId: string) => {
    try {
      await fetch("/api/admin/ai/discard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reservationId: resId }),
      });
    } catch {
      // Best-effort discard call
    }
  }, []);

  // Safe dismiss that marks candidate as discarded if unapproved
  const handleSafeClose = useCallback(async () => {
    if (reservationId && modalState !== "approving") {
      await discardActiveCandidate(reservationId);
    }
    onClose();
  }, [reservationId, modalState, discardActiveCandidate, onClose]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && modalState !== "approving") {
        handleSafeClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, modalState, handleSafeClose]);

  // Trigger Generation
  const handleGenerate = async () => {
    // If a previous candidate exists, discard it first
    if (reservationId) {
      await discardActiveCandidate(reservationId);
      setReservationId(null);
    }

    setModalState("generating");
    setGenerationSeconds(0);
    setErrorMessage(null);
    setIsZoomed(false);

    try {
      const res = await fetch("/api/admin/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItemId }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        const errorText =
          data?.error?.message || "Failed to generate food photograph. Your credits are unaffected.";
        setErrorMessage(errorText);
        setModalState("error");
        fetchCredits();
        return;
      }

      setPreviewUrl(data.data.previewUrl);
      setPromptUsed(data.data.promptUsed);
      setReservationId(data.data.reservationId);
      setCreditsBalance(data.data.creditsRemaining);
      setModalState("preview");
    } catch {
      setErrorMessage("Network interrupted during generation. Please try again.");
      setModalState("error");
      fetchCredits();
    }
  };

  // Trigger Approval & DB Link
  const handleApprove = async () => {
    if (!previewUrl || !reservationId || !promptUsed) return;

    setModalState("approving");

    try {
      const res = await fetch("/api/admin/ai/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menuItemId,
          reservationId,
          imageBufferBase64: previewUrl,
          promptUsed,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || "Approval failed");
      }

      toast.success("AI culinary photo approved and applied to dish!");
      onApplySuccess({
        id: data.data.imageAssetId,
        url: data.data.imageUrl,
      });

      // Clear reservation reference since it has been finalized
      setReservationId(null);
      onClose();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || "Failed to finalize image approval.";
      toast.error(msg);
      setErrorMessage(msg);
      setModalState("preview"); // Let user retry
    }
  };

  if (!isOpen) return null;

  const isExhausted = creditsBalance !== null && creditsBalance <= 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-studio-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh] animate-in slide-in-from-bottom-8 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--surface-border)] bg-[var(--surface-bg)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="ai-studio-title"
                className="font-editorial text-xl font-bold text-[var(--text-primary)]"
              >
                AI Food Photography Studio
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Studio-quality culinary plating for{" "}
                <span className="font-semibold text-[var(--text-primary)]">
                  &ldquo;{dishName}&rdquo;
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Credit Badge */}
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-medium border flex items-center gap-1.5 ${
                isExhausted
                  ? "bg-red-500/10 text-red-600 border-red-500/20"
                  : "bg-[var(--brand-accent)]/10 text-[var(--brand-accent)] border-[var(--brand-accent)]/20"
              }`}
              title="Monthly AI generation credits"
            >
              <Utensils className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {isLoadingCredits ? "..." : creditsBalance ?? 0} / {creditsLimit} credits
              </span>
            </div>

            <button
              type="button"
              onClick={handleSafeClose}
              disabled={modalState === "approving"}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--surface-card)] transition-colors disabled:opacity-50"
              aria-label="Close AI Studio Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5">
          {/* STATE: Idle / Welcome */}
          {modalState === "idle" && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] mx-auto flex items-center justify-center">
                <ChefHat className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-editorial text-lg font-semibold text-[var(--text-primary)]">
                  Ready to plate &ldquo;{dishName}&rdquo;?
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  Chef AI will synthesize artisanal ceramic plating, warm natural side
                  lighting, and vibrant garnishes tailored to this dish.
                </p>
              </div>

              {isExhausted ? (
                <div className="inline-flex items-center gap-2 p-3 bg-red-500/10 text-red-600 rounded-xl text-xs max-w-sm border border-red-500/20 text-left">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>
                    Your monthly credit allowance is exhausted. Please contact support to replenish
                    credits.
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-6 py-2.5 bg-[var(--brand-primary)] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Photo Candidate</span>
                </button>
              )}

              <p className="text-xs text-[var(--text-muted)]">
                Each generation consumes 1 credit. Approving consumes 0 additional credits.
              </p>
            </div>
          )}

          {/* STATE: Generating Animation */}
          {modalState === "generating" && (
            <div
              className="space-y-4 py-6"
              role="status"
              aria-live="polite"
              aria-label="Generating culinary image"
            >
              {/* Shimmer Placeholder (16:9 ratio) */}
              <div className="w-full aspect-[16/9] rounded-2xl bg-gradient-to-r from-[var(--surface-bg)] via-[var(--surface-border)]/40 to-[var(--surface-bg)] bg-[length:200%_100%] animate-pulse border border-[var(--surface-border)] flex flex-col items-center justify-center p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[var(--brand-primary)]/20 text-[var(--brand-primary)] flex items-center justify-center animate-spin">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-editorial text-base font-semibold text-[var(--text-primary)]">
                    Chef AI is plating your dish...
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    Synthesizing macro culinary lighting, fresh garnish, and artisanal plating.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
                <span>Elapsed time: {generationSeconds}s</span>
                <span>
                  {generationSeconds > 8
                    ? "Still generating... this can take up to 25 seconds"
                    : "Standard speed: ~3–5 seconds"}
                </span>
              </div>
            </div>
          )}

          {/* STATE: Preview Candidate */}
          {(modalState === "preview" || modalState === "approving") && previewUrl && (
            <div className="space-y-4">
              {/* Image Preview Container */}
              <div className="relative group rounded-2xl overflow-hidden border border-[var(--surface-border)] bg-black/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt={`AI generated plating for ${dishName}`}
                  className={`w-full object-cover transition-transform duration-300 ${
                    isZoomed ? "scale-125 cursor-zoom-out" : "aspect-[16/9] cursor-zoom-in"
                  }`}
                  onClick={() => setIsZoomed(!isZoomed)}
                />

                {/* Zoom Toggle Overlay */}
                <button
                  type="button"
                  onClick={() => setIsZoomed(!isZoomed)}
                  className="absolute bottom-3 right-3 p-2 bg-black/60 text-white rounded-lg backdrop-blur-md hover:bg-black/80 transition-colors"
                  aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                >
                  {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                </button>
              </div>

              {/* Synthesized Prompt Excerpt */}
              {promptUsed && (
                <div className="p-3 bg-[var(--surface-bg)] border border-[var(--surface-border)] rounded-xl text-xs space-y-1">
                  <span className="font-semibold text-[var(--text-primary)] block">
                    Synthesized Photographic Directive:
                  </span>
                  <p className="text-[var(--text-muted)] line-clamp-2 italic">
                    &ldquo;{promptUsed}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STATE: Error Banner */}
          {modalState === "error" && errorMessage && (
            <div
              className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl space-y-2"
              role="alert"
            >
              <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Generation Error</span>
              </div>
              <p className="text-xs text-red-600/90 leading-relaxed">{errorMessage}</p>
              <p className="text-xs text-[var(--text-muted)] pt-1">
                Your credits have been refunded and your existing menu item is completely unaffected.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-[var(--surface-border)] bg-[var(--surface-bg)] flex items-center justify-between gap-3">
          {modalState === "idle" && (
            <div className="w-full flex justify-end">
              <button
                type="button"
                onClick={handleSafeClose}
                className="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {modalState === "generating" && (
            <div className="w-full flex items-center justify-center text-xs text-[var(--text-muted)]">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              <span>Plating in progress...</span>
            </div>
          )}

          {(modalState === "preview" || modalState === "approving") && (
            <>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={modalState === "approving"}
                className="px-4 py-2 text-sm font-medium border border-[var(--surface-border)] rounded-xl text-[var(--text-primary)] hover:bg-[var(--surface-card)] transition-colors inline-flex items-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Regenerate New Photo</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSafeClose}
                  disabled={modalState === "approving"}
                  className="px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-50"
                >
                  Discard
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={modalState === "approving"}
                  className="px-5 py-2 bg-[var(--brand-primary)] text-white text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm inline-flex items-center gap-2 disabled:opacity-50"
                  aria-busy={modalState === "approving"}
                >
                  {modalState === "approving" ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving & Applying...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Apply to Dish</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {modalState === "error" && (
            <div className="w-full flex items-center justify-between">
              <button
                type="button"
                onClick={handleSafeClose}
                className="px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Dismiss
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                className="px-5 py-2 bg-[var(--brand-primary)] text-white text-sm font-medium rounded-xl hover:opacity-90 inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
