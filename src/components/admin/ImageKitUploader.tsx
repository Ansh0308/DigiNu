"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Loader2, AlertCircle, CheckCircle2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface UploadedMediaAsset {
  id: string;
  fileId: string;
  filePath: string;
  url: string;
  assetType: "LOGO" | "BANNER" | "FOOD_UPLOAD" | "AI_GENERATED";
  width: number;
  height: number;
  sizeBytes: number;
  originalFilename: string;
}

interface ImageKitUploaderProps {
  assetType: "LOGO" | "BANNER" | "FOOD_UPLOAD" | "AI_GENERATED";
  folderType?: "branding" | "dishes" | "ai-generated";
  currentImageUrl?: string | null;
  onUploadSuccess: (asset: UploadedMediaAsset) => void;
  onRemove?: () => void;
  aspectRatioLabel?: string;
  maxSizeBytes?: number; // Default: 5MB (5 * 1024 * 1024)
}

const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function ImageKitUploader({
  assetType,
  folderType = "dishes",
  currentImageUrl,
  onUploadSuccess,
  onRemove,
  aspectRatioLabel,
  maxSizeBytes = 5 * 1024 * 1024,
}: ImageKitUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validateFile = async (file: File): Promise<string | null> => {
    // 1. File Size Check (Max 5MB)
    if (file.size > maxSizeBytes) {
      const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
      return `File exceeds the maximum allowed size of ${maxMb}MB. Current size: ${(
        file.size /
        (1024 * 1024)
      ).toFixed(2)}MB.`;
    }

    // 2. MIME & Extension Check
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext) || !ALLOWED_MIME_TYPES.includes(file.type)) {
      return `Invalid file type "${file.name}". Please upload a JPEG, PNG, or WebP image.`;
    }

    // 3. Binary Magic Number / Signature Sniffing (Defense Against Extension Renaming)
    try {
      const slice = file.slice(0, 12);
      const buffer = await slice.arrayBuffer();
      const bytes = new Uint8Array(buffer);

      const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
      const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
      const isRiff = bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
      const isWebp = isRiff && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;

      if (!isJpeg && !isPng && !isWebp) {
        return "File content does not match authentic JPEG, PNG, or WebP binary signatures.";
      }
    } catch {
      return "Unable to inspect file structure. Please ensure the file is not corrupted.";
    }

    return null;
  };

  const processUpload = async (file: File) => {
    setUploadError(null);

    const validationMsg = await validateFile(file);
    if (validationMsg) {
      setUploadError(validationMsg);
      toast.error(validationMsg);
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assetType", assetType);
      formData.append("folderType", folderType);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || "Failed to upload image to cloud storage");
      }

      const savedAsset: UploadedMediaAsset = data.data;
      setPreviewUrl(savedAsset.url);
      onUploadSuccess(savedAsset);
      toast.success(`Photo "${file.name}" uploaded and optimized via ImageKit.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload error";
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processUpload(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUpload(files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove?.();
    toast.info("Image unlinked from form.");
  };

  return (
    <div className="space-y-3">
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ALLOWED_EXTENSIONS.join(",")}
        onChange={handleFileChange}
        className="sr-only"
        aria-hidden="true"
      />

      {/* Upload Zone / Preview Box */}
      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden border border-[var(--surface-border)] bg-[var(--canvas-bg)] p-2 flex flex-col items-center group">
          <div className="relative w-full aspect-video sm:aspect-2/1 max-h-56 rounded-xl overflow-hidden bg-black/5 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Uploaded asset preview"
              className="w-full h-full object-contain"
            />
            <div className="absolute top-2 right-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 px-2 py-1 rounded-md backdrop-blur-xs border border-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                ImageKit Ready
              </span>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 rounded-lg bg-rose-950/80 text-rose-300 hover:text-white hover:bg-rose-900 border border-rose-800 transition-colors cursor-pointer"
                aria-label="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="w-full flex items-center justify-between pt-2 px-1">
            <span className="text-[11px] text-[var(--text-muted)] truncate max-w-xs">
              {aspectRatioLabel || "Image attached"}
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-[var(--brand-primary)] hover:underline cursor-pointer"
            >
              Replace Photo
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload photo — drag and drop or click to browse"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 outline-hidden ${
            isDragging
              ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5 scale-[1.01]"
              : "border-[var(--surface-border)] hover:border-stone-400 bg-[var(--canvas-bg)]"
          } ${isUploading ? "pointer-events-none opacity-80" : ""}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 py-4" aria-live="polite">
              <Loader2 className="w-8 h-8 text-[var(--brand-primary)] animate-spin" />
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                Uploading to ImageKit CDN...
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                Optimizing WebP compression & caching
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] flex items-center justify-center text-[var(--text-muted)] shadow-xs">
                <Upload className="w-5 h-5 text-[var(--brand-primary)]" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-[var(--text-primary)]">
                  Click to upload or drag & drop photo
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  JPEG, PNG, or WebP up to 5MB {aspectRatioLabel && `• ${aspectRatioLabel}`}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message Alert */}
      {uploadError && (
        <div
          role="alert"
          className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div className="flex-1">
            <p className="font-semibold">Upload Failed</p>
            <p className="text-[11px] mt-0.5 leading-relaxed">{uploadError}</p>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="text-rose-400 hover:text-rose-600"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

