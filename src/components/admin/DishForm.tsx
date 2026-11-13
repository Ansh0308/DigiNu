"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  UtensilsCrossed,
  FileText,
  ShieldAlert,
  Image as ImageIcon,
  Save,
  Loader2,
  Sparkles,
  Upload,
  FolderOpen,
  Check,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { ImageKitUploader } from "@/components/admin/ImageKitUploader";
import { AIStudioModal } from "@/components/admin/AIStudioModal";

export interface CategoryOption {
  id: string;
  name: string;
}

export interface DishFormData {
  id?: string;
  categoryId: string;
  name: string;
  shortDescription: string;
  detailedDescription: string;
  price: number | string;
  isVegetarian: boolean;
  dietaryFlags: string[];
  allergenFlags: string[];
  isAvailable: boolean;
  isVisible: boolean;
  isFeatured: boolean;
  displayOrder: number;
  imageAssetId?: string | null;
  imageUrl?: string | null;
}

interface DishFormProps {
  categories: CategoryOption[];
  currencySymbol: string;
  currencyPosition: string;
  initialData?: DishFormData;
  mode: "create" | "edit";
}

const DIETARY_OPTIONS = [
  { id: "VEGETARIAN", label: "Vegetarian" },
  { id: "VEGAN", label: "Vegan" },
  { id: "GLUTEN_FREE", label: "Gluten-Free" },
  { id: "HALAL", label: "Halal" },
  { id: "DAIRY_FREE", label: "Dairy-Free" },
  { id: "NUT_FREE", label: "Nut-Free" },
  { id: "SPICY", label: "Spicy / Hot" },
  { id: "JAIN", label: "Jain Friendly" },
];

const ALLERGEN_OPTIONS = [
  "Celery",
  "Cereals (Gluten)",
  "Crustaceans",
  "Eggs",
  "Fish",
  "Lupin",
  "Milk / Dairy",
  "Molluscs",
  "Mustard",
  "Tree Nuts",
  "Peanuts",
  "Sesame",
  "Soybeans",
  "Sulphites",
];

export function DishForm({
  categories,
  currencySymbol,
  currencyPosition,
  initialData,
  mode,
}: DishFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState<DishFormData>(
    initialData ?? {
      categoryId: categories[0]?.id || "",
      name: "",
      shortDescription: "",
      detailedDescription: "",
      price: "",
      isVegetarian: false,
      dietaryFlags: [],
      allergenFlags: [],
      isAvailable: true,
      isVisible: true,
      isFeatured: false,
      displayOrder: 0,
      imageAssetId: null,
      imageUrl: null,
    }
  );

  const [activeImageTab, setActiveImageTab] = useState<"upload" | "library" | "ai">("upload");
  const [libraryAssets, setLibraryAssets] = useState<{ id: string; url: string; originalFilename: string }[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLibraryAssets = async () => {
    if (libraryAssets.length > 0) return;
    setIsLoadingLibrary(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (res.ok && data.success) {
        setLibraryAssets(data.data);
      }
    } catch {
      toast.error("Failed to load media library assets");
    } finally {
      setIsLoadingLibrary(false);
    }
  };

  // Toggle dietary flag
  const toggleDietaryFlag = (flag: string) => {
    setFormData((prev) => {
      const exists = prev.dietaryFlags.includes(flag);
      const nextFlags = exists
        ? prev.dietaryFlags.filter((f) => f !== flag)
        : [...prev.dietaryFlags, flag];
      return {
        ...prev,
        dietaryFlags: nextFlags,
        isVegetarian: flag === "VEGETARIAN" || flag === "VEGAN" ? !exists : prev.isVegetarian,
      };
    });
  };

  // Toggle allergen flag
  const toggleAllergen = (allergen: string) => {
    setFormData((prev) => ({
      ...prev,
      allergenFlags: prev.allergenFlags.includes(allergen)
        ? prev.allergenFlags.filter((a) => a !== allergen)
        : [...prev.allergenFlags, allergen],
    }));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.categoryId) {
      toast.error("Please select a valid menu category.");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Dish name is required.");
      return;
    }

    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum < 0) {
      toast.error("Please specify a valid non-negative price.");
      return;
    }

    setIsSubmitting(true);

    try {
      const endpoint = mode === "create" ? "/api/admin/items" : `/api/admin/items/${formData.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const payload = {
        categoryId: formData.categoryId,
        name: formData.name.trim(),
        shortDescription: formData.shortDescription.trim() || null,
        detailedDescription: formData.detailedDescription.trim() || null,
        price: priceNum,
        isVegetarian: formData.isVegetarian,
        dietaryFlags: formData.dietaryFlags,
        allergenFlags: formData.allergenFlags,
        isAvailable: formData.isAvailable,
        isVisible: formData.isVisible,
        isFeatured: formData.isFeatured,
        imageAssetId: formData.imageAssetId || null,
      };

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (!response.ok || !resData.success) {
        throw new Error(resData?.error?.message || "Failed to save dish");
      }

      toast.success(
        mode === "create"
          ? `Dish "${formData.name}" added to menu catalog.`
          : `Dish "${formData.name}" updated successfully.`
      );

      router.push("/admin/menu");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving dish";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--surface-border)]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/menu"
            className="p-2 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            aria-label="Back to menu catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {mode === "create" ? "Add New Dish" : `Edit &bull; ${formData.name}`}
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Configure culinary details, descriptions, dietary flags, and pricing.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Link
            href="/admin/menu"
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--brand-primary)] text-white hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Dish...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{mode === "create" ? "Publish Dish" : "Save Changes"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 1: Basic Information */}
      <section className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--surface-border)]">
          <UtensilsCrossed className="w-5 h-5 text-[var(--brand-primary)]" aria-hidden="true" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Basic Information & Pricing
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="sm:col-span-2">
            <label htmlFor="dish-name" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Dish Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="dish-name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden"
              placeholder="e.g. Truffle Tagliolini, Risotto ai Funghi, Tiramisu Tradizionale"
              maxLength={100}
            />
          </div>

          <div>
            <label htmlFor="dish-category" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              id="dish-category"
              required
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dish-price" className="block text-xs font-semibold text-[var(--text-primary)] mb-1.5">
              Price ({currencyPosition === "PREFIX" ? currencySymbol : `${currencySymbol} suffix`}){" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              id="dish-price"
              type="number"
              step="0.01"
              min="0"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] font-mono tabular-nums focus:border-[var(--brand-primary)] focus:outline-hidden"
              placeholder="18.50"
            />
          </div>

          <div className="flex items-center gap-3 pt-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--text-primary)] select-none">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="rounded border-[var(--surface-border)] text-[var(--brand-primary)]"
              />
              <span>Chef&apos;s Special (Featured)</span>
            </label>
          </div>

          <div className="flex items-center gap-3 pt-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--text-primary)] select-none">
              <input
                type="checkbox"
                checked={formData.isVisible}
                onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                className="rounded border-[var(--surface-border)] text-[var(--brand-primary)]"
              />
              <span>Visible on Menu</span>
            </label>
          </div>
        </div>
      </section>

      {/* SECTION 2: Descriptions */}
      <section className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--surface-border)]">
          <FileText className="w-5 h-5 text-[var(--brand-primary)]" aria-hidden="true" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Descriptions & Culinary Notes
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="dish-short-desc" className="block text-xs font-semibold text-[var(--text-primary)]">
                Short Description (Card Summary)
              </label>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                {formData.shortDescription.length}/180
              </span>
            </div>
            <input
              id="dish-short-desc"
              type="text"
              value={formData.shortDescription}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden"
              placeholder="e.g. Egg tagliolini pasta tossed in Normandy butter and fresh black Umbrian truffles"
              maxLength={180}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="dish-detail-desc" className="block text-xs font-semibold text-[var(--text-primary)]">
                Detailed Description (Dish Detail Drawer)
              </label>
              <span className="text-[10px] text-[var(--text-muted)] font-mono">
                {formData.detailedDescription.length}/2000
              </span>
            </div>
            <textarea
              id="dish-detail-desc"
              rows={4}
              value={formData.detailedDescription}
              onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden resize-y"
              placeholder="Handmade daily by Chef Marco using 30-egg-yolk pasta dough, slow-braised ragu of wild boar, aged 24-month Parmigiano Reggiano..."
              maxLength={2000}
            />
          </div>
        </div>
      </section>

      {/* SECTION 3: Dietary Flags & 14 Allergens */}
      <section className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs space-y-6">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--surface-border)]">
          <ShieldAlert className="w-5 h-5 text-[var(--brand-primary)]" aria-hidden="true" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            Dietary Disclosures & Allergen Checklist
          </h2>
        </div>

        {/* Veg Toggle */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--canvas-bg)] border border-[var(--surface-border)]">
          <span className="text-xs font-semibold text-[var(--text-primary)]">
            Vegetarian Dish:
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isVegetarian: true })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                formData.isVegetarian
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-[var(--surface-card)] text-[var(--text-muted)] border border-[var(--surface-border)]"
              }`}
            >
              🌱 Yes, Vegetarian
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isVegetarian: false })}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                !formData.isVegetarian
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-[var(--surface-card)] text-[var(--text-muted)] border border-[var(--surface-border)]"
              }`}
            >
              🥩 Non-Vegetarian
            </button>
          </div>
        </div>

        {/* Dietary Flag Chips */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2">
            Dietary Highlights (Pill Badges)
          </label>
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((opt) => {
              const selected = formData.dietaryFlags.includes(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleDietaryFlag(opt.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    selected
                      ? "bg-[var(--brand-primary)] text-white shadow-xs font-semibold"
                      : "bg-[var(--canvas-bg)] text-[var(--text-muted)] border border-[var(--surface-border)] hover:border-stone-400"
                  }`}
                >
                  {selected && "✓ "}
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 14 Major Allergens */}
        <div>
          <label className="block text-xs font-semibold text-[var(--text-primary)] mb-2">
            Contains Allergens (14 Major Regulatory Allergens)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 rounded-xl bg-[var(--canvas-bg)] border border-[var(--surface-border)]">
            {ALLERGEN_OPTIONS.map((allergen) => {
              const checked = formData.allergenFlags.includes(allergen);
              return (
                <label
                  key={allergen}
                  className="flex items-center gap-2 cursor-pointer text-xs text-[var(--text-primary)] select-none"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleAllergen(allergen)}
                    className="rounded border-[var(--surface-border)] text-[var(--brand-primary)]"
                  />
                  <span>{allergen}</span>
                </label>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECTION 4: Image Pipeline (Scope Guard for BUILD-04 / BUILD-05) */}
      <section className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-4 border-b border-[var(--surface-border)]">
          <ImageIcon className="w-5 h-5 text-[var(--brand-primary)]" aria-hidden="true" />
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
              Food Photography
            </h2>
            <p className="text-[11px] text-[var(--text-muted)]">
              Image pipeline connects in BUILD-04 (ImageKit) and BUILD-05 (AI Culinary Studio).
            </p>
          </div>
        </div>

        {/* Image Tabs */}
        <div className="inline-flex rounded-xl bg-[var(--canvas-bg)] p-1 border border-[var(--surface-border)]">
          <button
            type="button"
            onClick={() => setActiveImageTab("upload")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
              activeImageTab === "upload"
                ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xs font-semibold"
                : "text-[var(--text-muted)]"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveImageTab("library");
              fetchLibraryAssets();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
              activeImageTab === "library"
                ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xs font-semibold"
                : "text-[var(--text-muted)]"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Media Library</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveImageTab("ai")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
              activeImageTab === "ai"
                ? "bg-[var(--surface-card)] text-[var(--brand-primary)] shadow-xs font-semibold"
                : "text-[var(--text-muted)]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Generate with AI</span>
          </button>
        </div>

        {/* Tab 1: Upload via ImageKit */}
        {activeImageTab === "upload" && (
          <ImageKitUploader
            assetType="FOOD_UPLOAD"
            folderType="dishes"
            currentImageUrl={formData.imageUrl}
            aspectRatioLabel="Recommended 16:9 or 1:1 culinary photo"
            onUploadSuccess={(asset) => {
              setFormData((prev) => ({
                ...prev,
                imageAssetId: asset.id,
                imageUrl: asset.url,
              }));
            }}
            onRemove={() => {
              setFormData((prev) => ({
                ...prev,
                imageAssetId: null,
                imageUrl: null,
              }));
            }}
          />
        )}

        {/* Tab 2: Pick from Media Library */}
        {activeImageTab === "library" && (
          <div className="space-y-3">
            {isLoadingLibrary ? (
              <div className="py-8 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--brand-primary)]" />
                <span>Loading media assets...</span>
              </div>
            ) : libraryAssets.length === 0 ? (
              <div className="py-8 text-center text-xs text-[var(--text-muted)] border border-dashed border-[var(--surface-border)] rounded-xl bg-[var(--canvas-bg)]">
                No uploaded photos found in the media library. Use the &quot;Upload Photo&quot; tab above to add dish photos.
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 max-h-60 overflow-y-auto p-1">
                {libraryAssets.map((asset) => {
                  const isSelected = formData.imageAssetId === asset.id;
                  return (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          imageAssetId: asset.id,
                          imageUrl: asset.url,
                        }));
                        toast.success(`Selected "${asset.originalFilename}"`);
                      }}
                      className={`group relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        isSelected
                          ? "border-[var(--brand-primary)] ring-2 ring-[var(--brand-primary)]/30"
                          : "border-[var(--surface-border)] hover:border-stone-400"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`${asset.url}?tr=w-150,h-150,c-at_max,f-webp,q-80`}
                        alt={asset.originalFilename}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[var(--brand-primary)]/30 flex items-center justify-center">
                          <Check className="w-5 h-5 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {formData.imageUrl && (
              <div className="flex items-center justify-between text-xs pt-2">
                <span className="text-[var(--text-muted)]">Photo linked to dish</span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, imageAssetId: null, imageUrl: null }))
                  }
                  className="text-rose-500 hover:underline cursor-pointer"
                >
                  Unlink Photo
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: AI Food Image Studio */}
        {activeImageTab === "ai" && (
          <div className="space-y-4">
            {initialData?.id ? (
              <div className="p-8 border-2 border-dashed border-[var(--brand-primary)]/30 rounded-2xl text-center space-y-4 bg-[var(--surface-bg)]">
                <div className="w-12 h-12 rounded-2xl bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center mx-auto">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="font-editorial text-base font-semibold text-[var(--text-primary)]">
                    Generate Studio Food Photography with AI
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Synthesize custom ceramic plating, macro side lighting, and fresh garnishes
                    tailored to &ldquo;{formData.name}&rdquo;. Preview before approving.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAIModalOpen(true)}
                  className="px-6 py-2.5 bg-[var(--brand-primary)] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Launch AI Studio Modal</span>
                </button>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-[var(--surface-border)] rounded-2xl text-center space-y-3 bg-[var(--surface-bg)]">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                    Save Dish First to Enable AI Studio
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    AI prompt synthesis requires the dish record and its category relationship.
                    Please publish or save this dish first, then launch the AI Studio from the edit screen.
                  </p>
                </div>
              </div>
            )}

            {formData.imageUrl && (
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-[var(--text-muted)]">Active photo linked to dish</span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, imageAssetId: null, imageUrl: null }))
                  }
                  className="text-rose-500 hover:underline cursor-pointer"
                >
                  Unlink Photo
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* AI Studio Modal */}
      {initialData?.id && (
        <AIStudioModal
          isOpen={isAIModalOpen}
          onClose={() => setIsAIModalOpen(false)}
          menuItemId={initialData.id}
          dishName={formData.name}
          onApplySuccess={(asset) => {
            setFormData((prev) => ({
              ...prev,
              imageAssetId: asset.id,
              imageUrl: asset.url,
            }));
          }}
        />
      )}

      {/* Bottom Action Row */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--surface-border)]">
        <Link
          href="/admin/menu"
          className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold bg-[var(--brand-primary)] text-white hover:opacity-90 transition-opacity shadow-xs cursor-pointer disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Dish...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{mode === "create" ? "Publish Dish" : "Save Changes"}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

