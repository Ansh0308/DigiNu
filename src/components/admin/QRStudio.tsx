"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  QrCode,
  Download,
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileCode,
  Image as ImageIcon,
  Save,
  Palette,
} from "lucide-react";
import { QRPreviewCard } from "./QRPreviewCard";

export interface QRCodeConfigData {
  id?: string;
  foregroundColor: string;
  backgroundColor: string;
  embedLogo: boolean;
  dotStyle: string;
  errorCorrectionLevel: string;
  calloutText: string;
  downloadCount: number;
}

export interface RestaurantProfileData {
  name: string;
  primaryColor?: string;
  logoAsset?: {
    url: string;
  } | null;
}

interface QRStudioProps {
  initialConfig: QRCodeConfigData;
  initialTargetUrl: string;
  initialSvg: string;
  profile: RestaurantProfileData | null;
}

export function QRStudio({
  initialConfig,
  initialTargetUrl,
  initialSvg,
  profile,
}: QRStudioProps) {
  const [config, setConfig] = useState<QRCodeConfigData>(initialConfig);
  const [svgContent, setSvgContent] = useState<string>(initialSvg);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [downloadingFormat, setDownloadingFormat] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Client-side contrast calculation
  const calculateContrast = (fgHex: string, bgHex: string) => {
    try {
      const hexToRgb = (hex: string) => {
        const sanitized = hex.replace("#", "").trim();
        const bigint = parseInt(sanitized, 16);
        return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
      };
      const getLuminance = (rgb: number[]) => {
        const [rs, gs, bs] = rgb.map((c) => {
          const s = c / 255;
          return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      };
      const l1 = getLuminance(hexToRgb(fgHex));
      const l2 = getLuminance(hexToRgb(bgHex));
      const lighter = Math.max(l1, l2);
      const darker = Math.min(l1, l2);
      return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
    } catch {
      return 1.0;
    }
  };

  const contrastRatio = calculateContrast(config.foregroundColor, config.backgroundColor);
  const isContrastWarning = contrastRatio < 7.0;

  // Save updated config
  const handleSaveConfig = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/admin/qr-code/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          foregroundColor: config.foregroundColor,
          backgroundColor: config.backgroundColor,
          embedLogo: config.embedLogo,
          dotStyle: config.dotStyle,
          errorCorrectionLevel: config.errorCorrectionLevel,
          calloutText: config.calloutText,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || "Failed to save configuration");
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);

      // Refresh SVG preview
      const previewRes = await fetch("/api/admin/qr-code/preview");
      if (previewRes.ok) {
        const previewJson = await previewRes.json();
        if (previewJson.success && previewJson.data?.qrSvg) {
          setSvgContent(previewJson.data.qrSvg);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving configuration";
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger asset download
  const handleDownload = async (format: "svg" | "png" | "pdf") => {
    setDownloadingFormat(format);
    try {
      const response = await fetch(`/api/admin/qr-code/download?format=${format}`);
      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition");
      let filename = `menu-qr.${format}`;
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      // Increment download counter optimistically
      setConfig((prev) => ({ ...prev, downloadCount: prev.downloadCount + 1 }));
    } catch (err) {
      console.error(`Download failed:`, err);
      alert(`Could not download ${format.toUpperCase()} asset. Please try again.`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--surface-border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-wider uppercase text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 px-2.5 py-0.5 rounded-full">
              Physical Touchpoint
            </span>
            <span className="text-xs text-[var(--text-muted)] font-mono">
              Downloads: {config.downloadCount}
            </span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] mt-1.5">
            Table QR Code Studio
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1 max-w-2xl">
            Customize, preview, and download print-shop ready vector and high-resolution table QR codes permanently linked to your digital menu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSaveConfig}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--brand-primary)] text-white text-xs font-medium hover:brightness-110 active:scale-[0.98] transition-all shadow-sm disabled:opacity-50"
          >
            {isSaving ? (
              <span className="animate-spin">⌛</span>
            ) : saveSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? "Saving..." : saveSuccess ? "Saved!" : "Save Configuration"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>QR configuration saved successfully. Download assets will render with your updated settings.</span>
        </div>
      )}

      {/* Contrast Warning Banner */}
      {isContrastWarning && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-950">
              Low Color Contrast Warning ({contrastRatio.toFixed(1)}:1)
            </div>
            <p className="text-amber-800/90 mt-0.5 leading-relaxed">
              Selected foreground and background colors yield a contrast ratio below 7:1. Certain older smartphone cameras and dim restaurant lighting may fail to recognize this code. For maximum scannability, use a dark foreground and white background.
            </p>
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Canvas Preview */}
        <div className="lg:col-span-5 space-y-6">
          <QRPreviewCard
            svgContent={svgContent}
            targetUrl={initialTargetUrl}
            foregroundColor={config.foregroundColor}
            backgroundColor={config.backgroundColor}
            embedLogo={config.embedLogo}
            isLoading={false}
          />
        </div>

        {/* Right Column: Customization Controls & Export Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customization Card */}
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-xs space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-[var(--surface-border)]">
              <Palette className="w-4 h-4 text-[var(--brand-primary)]" />
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Styling & Branding Settings
              </h2>
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                  Foreground Color (Pattern)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.foregroundColor}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, foregroundColor: e.target.value }))
                    }
                    className="w-10 h-10 rounded-lg border border-[var(--surface-border)] cursor-pointer p-0.5 bg-transparent"
                    aria-label="Foreground QR Color"
                  />
                  <input
                    type="text"
                    value={config.foregroundColor}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, foregroundColor: e.target.value }))
                    }
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-[var(--surface-border)] bg-[var(--canvas-bg)] focus:outline-[var(--brand-primary)]"
                    maxLength={7}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, backgroundColor: e.target.value }))
                    }
                    className="w-10 h-10 rounded-lg border border-[var(--surface-border)] cursor-pointer p-0.5 bg-transparent"
                    aria-label="Background QR Color"
                  />
                  <input
                    type="text"
                    value={config.backgroundColor}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, backgroundColor: e.target.value }))
                    }
                    className="flex-1 px-3 py-2 text-xs font-mono rounded-lg border border-[var(--surface-border)] bg-[var(--canvas-bg)] focus:outline-[var(--brand-primary)]"
                    maxLength={7}
                  />
                </div>
              </div>
            </div>

            {/* Quick Presets */}
            <div>
              <span className="block text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">
                Quick Palette Presets
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      foregroundColor: "#000000",
                      backgroundColor: "#FFFFFF",
                    }))
                  }
                  className="px-2.5 py-1 text-xs rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] hover:border-[var(--brand-primary)] transition-colors inline-flex items-center gap-1.5"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-black border border-neutral-300" />
                  <span>Classic Black & White</span>
                </button>

                {profile?.primaryColor && (
                  <button
                    type="button"
                    onClick={() =>
                      setConfig((prev) => ({
                        ...prev,
                        foregroundColor: profile.primaryColor!,
                        backgroundColor: "#FFFFFF",
                      }))
                    }
                    className="px-2.5 py-1 text-xs rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] hover:border-[var(--brand-primary)] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-neutral-300"
                      style={{ backgroundColor: profile.primaryColor }}
                    />
                    <span>Brand Primary Color</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    setConfig((prev) => ({
                      ...prev,
                      foregroundColor: "#1A1A1A",
                      backgroundColor: "#FFFFFF",
                    }))
                  }
                  className="px-2.5 py-1 text-xs rounded-lg border border-[var(--surface-border)] bg-[var(--surface-card)] hover:border-[var(--brand-primary)] transition-colors inline-flex items-center gap-1.5"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1A1A1A] border border-neutral-300" />
                  <span>Editorial Charcoal</span>
                </button>
              </div>
            </div>

            {/* Logo Embedding Toggle */}
            <div className="pt-3 border-t border-[var(--surface-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                {profile?.logoAsset?.url ? (
                  <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-[var(--surface-border)] bg-neutral-50 shrink-0">
                    <Image
                      src={profile.logoAsset.url}
                      alt="Restaurant Logo"
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-lg border border-[var(--surface-border)] bg-neutral-100 flex items-center justify-center text-neutral-400 shrink-0">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold text-[var(--text-primary)]">
                    Embed Restaurant Logo
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    {profile?.logoAsset?.url
                      ? "Embeds your official logo in the center badge with a protective white buffer."
                      : "Upload a restaurant logo in Restaurant Profile to display in QR center."}
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.embedLogo}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, embedLogo: e.target.checked }))
                  }
                  className="sr-only peer"
                  aria-label="Toggle Embed Restaurant Logo"
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--brand-primary)]"></div>
              </label>
            </div>

            {/* Callout Text Input */}
            <div className="pt-3 border-t border-[var(--surface-border)]">
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">
                Print Callout Headline
              </label>
              <input
                type="text"
                value={config.calloutText}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, calloutText: e.target.value }))
                }
                maxLength={100}
                placeholder="Scan to View Digital Menu"
                className="w-full px-3 py-2 text-xs rounded-lg border border-[var(--surface-border)] bg-[var(--canvas-bg)] focus:outline-[var(--brand-primary)]"
              />
              <span className="text-[10px] text-[var(--text-muted)] mt-1 block">
                Shown prominently on the printable A6 table-tent PDF. (Max 100 characters)
              </span>
            </div>
          </div>

          {/* Export Print Assets Section */}
          <div className="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--surface-border)]">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-[var(--brand-primary)]" />
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                  Export Production Assets
                </h2>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                3 Standard Formats
              </span>
            </div>

            {/* 3 Download Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Vector SVG */}
              <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--canvas-bg)] flex flex-col justify-between hover:border-[var(--brand-primary)]/50 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                      <FileCode className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100/70 text-indigo-800">
                      SVG Vector
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                    Infinite Vector
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    Lossless vector format. Ideal for laser-engraved wood, acrylic table blocks, and large banners.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload("svg")}
                  disabled={downloadingFormat === "svg"}
                  className="mt-4 w-full py-2 px-3 rounded-lg bg-[var(--surface-card)] border border-[var(--surface-border)] hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] text-xs font-medium text-[var(--text-primary)] transition-all flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
                  aria-label="Download SVG Infinite Vector QR Code"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingFormat === "svg" ? "Exporting..." : "Download SVG"}</span>
                </button>
              </div>

              {/* Card 2: 300 DPI PNG */}
              <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--canvas-bg)] flex flex-col justify-between hover:border-[var(--brand-primary)]/50 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-800">
                      300 DPI PNG
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                    2048 × 2048 PNG
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    Ultra-high resolution raster asset. Ready for office desktop printing, flyers, and digital marketing.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload("png")}
                  disabled={downloadingFormat === "png"}
                  className="mt-4 w-full py-2 px-3 rounded-lg bg-[var(--surface-card)] border border-[var(--surface-border)] hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] text-xs font-medium text-[var(--text-primary)] transition-all flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
                  aria-label="Download 300 DPI High-Resolution PNG QR Code"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingFormat === "png" ? "Exporting..." : "Download PNG"}</span>
                </button>
              </div>

              {/* Card 3: A6 Table-Tent PDF */}
              <div className="p-4 rounded-xl border border-[var(--surface-border)] bg-[var(--canvas-bg)] flex flex-col justify-between hover:border-[var(--brand-primary)]/50 transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100/70 text-amber-900">
                      Print PDF
                    </span>
                  </div>
                  <h3 className="text-xs font-semibold text-[var(--text-primary)]">
                    A6 Table Tent PDF
                  </h3>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    105 × 148mm with 3mm bleed marks. Send directly to any commercial print shop for folded tents.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDownload("pdf")}
                  disabled={downloadingFormat === "pdf"}
                  className="mt-4 w-full py-2 px-3 rounded-lg bg-[var(--surface-card)] border border-[var(--surface-border)] hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] text-xs font-medium text-[var(--text-primary)] transition-all flex items-center justify-center gap-1.5 shadow-2xs disabled:opacity-50"
                  aria-label="Download Print-Ready A6 Table-Tent PDF with Bleed Marks"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{downloadingFormat === "pdf" ? "Generating..." : "Download PDF"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
