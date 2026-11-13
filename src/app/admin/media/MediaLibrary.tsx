"use client";

import React, { useState, useMemo } from "react";
import {
  FolderOpen,
  Filter,
  Trash2,
  Copy,
  ExternalLink,
  Check,
  AlertTriangle,
  Loader2,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import { ImageKitUploader, type UploadedMediaAsset } from "@/components/admin/ImageKitUploader";
import { useToast } from "@/components/ui/Toast";

export interface MediaAssetItem {
  id: string;
  fileId: string;
  filePath: string;
  url: string;
  assetType: string;
  width: number;
  height: number;
  sizeBytes: number;
  originalFilename: string;
  createdAt: string | Date;
  menuItems?: { id: string; name: string }[];
  logoProfiles?: { id: string; name: string }[];
  bannerProfiles?: { id: string; name: string }[];
}

interface MediaLibraryProps {
  initialAssets: MediaAssetItem[];
  onSelectAsset?: (asset: MediaAssetItem) => void;
  selectionMode?: boolean;
}

export function MediaLibrary({
  initialAssets,
  onSelectAsset,
  selectionMode = false,
}: MediaLibraryProps) {
  const { toast } = useToast();
  const [assets, setAssets] = useState<MediaAssetItem[]>(initialAssets);
  const [activeTab, setActiveTab] = useState<"ALL" | "FOOD_UPLOAD" | "AI_GENERATED" | "BRANDING">("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Deletion modal state
  const [deleteTarget, setDeleteTarget] = useState<MediaAssetItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (activeTab === "ALL") return true;
      if (activeTab === "FOOD_UPLOAD") return asset.assetType === "FOOD_UPLOAD";
      if (activeTab === "AI_GENERATED") return asset.assetType === "AI_GENERATED";
      if (activeTab === "BRANDING") return asset.assetType === "LOGO" || asset.assetType === "BANNER";
      return true;
    });
  }, [assets, activeTab]);

  // Handle Upload Success
  const handleNewUpload = (newAsset: UploadedMediaAsset) => {
    setAssets((prev) => [
      {
        ...newAsset,
        createdAt: new Date().toISOString(),
        menuItems: [],
        logoProfiles: [],
        bannerProfiles: [],
      },
      ...prev,
    ]);
  };

  // Copy ImageKit URL
  const handleCopyUrl = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast.success("CDN URL copied to clipboard.");
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy URL.");
    }
  };

  // Delete Asset
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/media/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData?.error?.message || "Failed to delete media asset");
      }

      setAssets((prev) => prev.filter((a) => a.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success(`Photo "${deleteTarget.originalFilename}" removed from library.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting asset";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      {!selectionMode && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--surface-border)]">
          <div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Media Asset Library
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Central ImageKit CDN gallery. High-resolution dish photos, brand assets, and AI culinary imagery.
            </p>
          </div>
        </div>
      )}

      {/* Top Upload Zone */}
      <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] pb-3 border-b border-[var(--surface-border)]">
          <FolderOpen className="w-4 h-4 text-[var(--brand-primary)]" />
          <span>Upload New Asset to ImageKit</span>
        </div>
        <ImageKitUploader
          assetType="FOOD_UPLOAD"
          folderType="dishes"
          onUploadSuccess={handleNewUpload}
          aspectRatioLabel="Uploaded to /restaurants/dishes/"
        />
      </div>

      {/* Filter Tabs Bar */}
      <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-xl bg-[var(--canvas-bg)] p-1 border border-[var(--surface-border)]">
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "ALL"
                ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xs font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            All Media ({assets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("FOOD_UPLOAD")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "FOOD_UPLOAD"
                ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xs font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Food Photography
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("AI_GENERATED")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "AI_GENERATED"
                ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xs font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            AI Generated
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("BRANDING")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              activeTab === "BRANDING"
                ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xs font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Logos & Banners
          </button>
        </div>

        <div className="text-xs text-[var(--text-muted)]">
          Showing <span className="font-semibold text-[var(--text-primary)]">{filteredAssets.length}</span> asset(s)
        </div>
      </div>

      {/* Media Grid Gallery */}
      {filteredAssets.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-center space-y-2">
          <p className="text-xs text-[var(--text-muted)]">
            No media assets found under this filter.
          </p>
          <p className="text-[11px] text-[var(--text-muted)]">
            Upload images above or attach photos directly when editing food items.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const linkedDishes = asset.menuItems || [];
            const isBranding = (asset.logoProfiles?.length || 0) > 0 || (asset.bannerProfiles?.length || 0) > 0;

            return (
              <div
                key={asset.id}
                className="group relative rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] overflow-hidden shadow-xs hover:border-[var(--brand-primary)] transition-all flex flex-col justify-between"
              >
                {/* Image Container with ImageKit Transform */}
                <div className="relative aspect-square w-full bg-black/5 overflow-hidden flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`${asset.url}?tr=w-300,h-300,c-at_max,f-webp,q-80`}
                    alt={asset.originalFilename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Badges Overlay */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/75 text-white backdrop-blur-xs">
                      {asset.assetType}
                    </span>
                    {asset.assetType === "AI_GENERATED" && (
                      <span className="inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-500 text-stone-950 font-mono">
                        <Sparkles className="w-2.5 h-2.5" /> Flux.1
                      </span>
                    )}
                  </div>

                  {/* Selection Button (if in picker mode) */}
                  {selectionMode && onSelectAsset && (
                    <button
                      type="button"
                      onClick={() => onSelectAsset(asset)}
                      className="absolute inset-0 bg-[var(--brand-primary)]/80 text-white font-semibold text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Select This Image</span>
                    </button>
                  )}
                </div>

                {/* Info & Metadata */}
                <div className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold text-[var(--text-primary)] truncate block" title={asset.originalFilename}>
                      {asset.originalFilename}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-mono">
                    <span>{asset.width}×{asset.height}px</span>
                    <span>{formatFileSize(asset.sizeBytes)}</span>
                  </div>

                  {/* Linked usage tag */}
                  {linkedDishes.length > 0 && (
                    <div className="pt-1 flex items-center gap-1 text-[10px] text-[var(--brand-primary)] truncate font-medium">
                      <Tag className="w-3 h-3 shrink-0" />
                      <span className="truncate">Linked: {linkedDishes.map((d) => d.name).join(", ")}</span>
                    </div>
                  )}
                  {isBranding && (
                    <div className="pt-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      ★ Active Brand Asset
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="pt-2 border-t border-[var(--surface-border)] flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(asset.url, asset.id)}
                        className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--canvas-bg)] transition-colors cursor-pointer"
                        title="Copy Image CDN URL"
                        aria-label={`Copy URL for ${asset.originalFilename}`}
                      >
                        {copiedId === asset.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <a
                        href={asset.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--canvas-bg)] transition-colors"
                        title="Open Full Image"
                        aria-label={`Open full image for ${asset.originalFilename}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(asset)}
                      className="p-1.5 rounded-md text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                      title="Delete Asset"
                      aria-label={`Delete ${asset.originalFilename}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-asset-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-[var(--surface-card)] max-w-md w-full rounded-2xl p-6 border border-[var(--surface-border)] shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 id="delete-asset-title" className="font-editorial text-lg font-bold text-[var(--text-primary)]">
                Delete Media Asset
              </h2>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Are you sure you want to delete <strong>&quot;{deleteTarget.originalFilename}&quot;</strong>? Dishes using this photo will automatically have their image unlinked.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--surface-border)]">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Delete Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

