"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Leaf,
  X,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Quick86Switch } from "@/components/admin/Quick86Switch";
import { useToast } from "@/components/ui/Toast";

export interface MenuItemWithRelations {
  id: string;
  categoryId: string;
  name: string;
  shortDescription: string | null;
  detailedDescription: string | null;
  price: number | string | { toString(): string };
  isVegetarian: boolean;
  dietaryFlags: string[];
  allergenFlags: string[];
  isAvailable: boolean;
  isVisible: boolean;
  isFeatured: boolean;
  displayOrder: number;
  category: {
    id: string;
    name: string;
    displayOrder: number;
  };
  imageAsset: {
    url: string;
  } | null;
}

interface CategoryOption {
  id: string;
  name: string;
}

interface MenuCatalogProps {
  initialItems: MenuItemWithRelations[];
  categories: CategoryOption[];
  currencySymbol: string;
  currencyPosition: string;
}

export function MenuCatalog({
  initialItems,
  categories,
  currencySymbol,
  currencyPosition,
}: MenuCatalogProps) {
  const { toast } = useToast();
  const [items, setItems] = useState<MenuItemWithRelations[]>(initialItems);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all"); // 'all' | 'available' | 'sold_out'

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<MenuItemWithRelations | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered Items computation
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.categoryId !== selectedCategory) {
        return false;
      }

      // Availability filter
      if (availabilityFilter === "available" && !item.isAvailable) {
        return false;
      }
      if (availabilityFilter === "sold_out" && item.isAvailable) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.shortDescription?.toLowerCase().includes(query) ?? false;
        if (!matchesName && !matchesDesc) {
          return false;
        }
      }

      return true;
    });
  }, [items, selectedCategory, availabilityFilter, searchQuery]);

  // Format currency
  const formatPrice = (price: unknown) => {
    const val = Number(price).toFixed(2);
    return currencyPosition === "PREFIX" ? `${currencySymbol}${val}` : `${val} ${currencySymbol}`;
  };

  // Toggle Visibility
  const handleToggleVisibility = async (dish: MenuItemWithRelations) => {
    const nextVisibility = !dish.isVisible;
    // Optimistic
    setItems((prev) =>
      prev.map((i) => (i.id === dish.id ? { ...i, isVisible: nextVisibility } : i))
    );

    try {
      const response = await fetch(`/api/admin/items/${dish.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVisible: nextVisibility }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData?.error?.message || "Failed to update visibility");
      }

      toast.success(
        nextVisibility
          ? `"${dish.name}" is now visible on menu.`
          : `"${dish.name}" hidden from customer menu.`
      );
    } catch (err: unknown) {
      // Revert
      setItems((prev) =>
        prev.map((i) => (i.id === dish.id ? { ...i, isVisible: !nextVisibility } : i))
      );
      const msg = err instanceof Error ? err.message : "Error updating visibility";
      toast.error(msg);
    }
  };

  // Delete Item
  const handleDeleteItem = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/admin/items/${deleteTarget.id}`, {
        method: "DELETE",
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData?.error?.message || "Failed to delete dish");
      }

      setItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setDeleteTarget(null);
      toast.success(`"${deleteTarget.name}" deleted from catalog.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting dish";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--surface-border)]">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Menu Catalog & 86 Hub
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Browse all culinary offerings, toggle instant 86 sold-out availability, adjust pricing, and curate dietary tags.
          </p>
        </div>

        <Link
          href="/admin/menu/new"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--brand-primary)] text-white hover:opacity-90 transition-opacity shadow-xs focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Food Item</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by dish name or description..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 hidden sm:block" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden"
            aria-label="Filter by menu category"
          >
            <option value="all">All Categories ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Availability Filter Buttons */}
        <div className="inline-flex rounded-xl bg-[var(--canvas-bg)] p-1 border border-[var(--surface-border)] self-start md:self-auto">
          <button
            type="button"
            onClick={() => setAvailabilityFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              availabilityFilter === "all"
                ? "bg-[var(--surface-card)] text-[var(--text-primary)] shadow-xs font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            All ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setAvailabilityFilter("available")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              availabilityFilter === "available"
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Available
          </button>
          <button
            type="button"
            onClick={() => setAvailabilityFilter("sold_out")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              availabilityFilter === "sold_out"
                ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            86&apos;d Sold Out
          </button>
        </div>
      </div>

      {/* Dishes Table / Mobile Cards */}
      <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--surface-border)]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            <UtensilsCrossed className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>Dishes in Catalog ({filteredItems.length})</span>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-[var(--text-muted)]">
              No dishes match your current search or category filter.
            </p>
            {(searchQuery || selectedCategory !== "all" || availabilityFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setAvailabilityFilter("all");
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--brand-primary)] bg-[var(--canvas-bg)] border border-[var(--surface-border)] cursor-pointer"
              >
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[var(--surface-border)]">
            {filteredItems.map((dish) => (
              <div
                key={dish.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--canvas-bg)] px-3 rounded-xl transition-colors"
              >
                {/* Left: Thumbnail & Dish Information */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  {/* Thumbnail / Veg Indicator */}
                  <div className="relative w-12 h-12 rounded-xl bg-[var(--surface-border)] flex items-center justify-center shrink-0 overflow-hidden border border-[var(--surface-border)]">
                    {dish.imageAsset?.url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={dish.imageAsset.url}
                        alt={dish.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UtensilsCrossed className="w-5 h-5 text-[var(--text-muted)]" />
                    )}
                    {dish.isVegetarian && (
                      <div
                        className="absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full bg-white dark:bg-stone-900 border border-emerald-600 flex items-center justify-center shadow-xs"
                        title="Vegetarian Dish"
                      >
                        <Leaf className="w-2.5 h-2.5 text-emerald-600" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {dish.name}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--surface-border)] text-[var(--text-muted)] font-medium">
                        {dish.category.name}
                      </span>
                      {dish.isFeatured && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold">
                          ★ Chef&apos;s Special
                        </span>
                      )}
                    </div>

                    {dish.shortDescription && (
                      <p className="text-[11px] text-[var(--text-muted)] truncate max-w-md mt-0.5">
                        {dish.shortDescription}
                      </p>
                    )}

                    {/* Dietary Badges */}
                    {dish.dietaryFlags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        {dish.dietaryFlags.map((flag) => (
                          <span
                            key={flag}
                            className="text-[9px] px-1.5 py-0.2 rounded bg-stone-100 dark:bg-stone-800 text-[var(--text-muted)] font-mono"
                          >
                            {flag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Price, 86 Switch & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--surface-border)]">
                  {/* Price */}
                  <span className="text-sm font-bold text-[var(--text-primary)] tabular-nums">
                    {formatPrice(dish.price)}
                  </span>

                  {/* 1-Tap 86 Availability Toggle with status text */}
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`text-[11px] font-semibold hidden md:inline ${
                        dish.isAvailable
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {dish.isAvailable ? "Available" : "Sold Out (86)"}
                    </span>
                    <Quick86Switch
                      itemId={dish.id}
                      dishName={dish.name}
                      initialAvailable={dish.isAvailable}
                      onStatusChange={(newStatus) => {
                        setItems((prev) =>
                          prev.map((i) => (i.id === dish.id ? { ...i, isAvailable: newStatus } : i))
                        );
                      }}
                    />
                  </div>

                  {/* Visibility Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleVisibility(dish)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--canvas-bg)] transition-colors cursor-pointer"
                    title={dish.isVisible ? "Visible on menu. Click to hide." : "Hidden from menu. Click to show."}
                    aria-label={`Toggle visibility for ${dish.name}`}
                  >
                    {dish.isVisible ? (
                      <Eye className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-stone-400" />
                    )}
                  </button>

                  {/* Edit Link */}
                  <Link
                    href={`/admin/menu/${dish.id}`}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--canvas-bg)] transition-colors"
                    aria-label={`Edit ${dish.name}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Link>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(dish)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    aria-label={`Delete ${dish.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dish-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-[var(--surface-card)] max-w-md w-full rounded-2xl p-6 border border-[var(--surface-border)] shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 id="delete-dish-title" className="font-editorial text-lg font-bold text-[var(--text-primary)]">
                Delete Food Item
              </h2>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Are you sure you want to permanently delete <strong>&quot;{deleteTarget.name}&quot;</strong> from your restaurant catalog? This cannot be undone.
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
                onClick={handleDeleteItem}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Delete Dish</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

