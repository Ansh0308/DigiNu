"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  AlertTriangle,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

export interface CategoryWithCount {
  id: string;
  name: string;
  subtitle: string | null;
  displayOrder: number;
  isActive: boolean;
  _count: {
    items: number;
  };
}

interface CategoryManagerProps {
  initialCategories: CategoryWithCount[];
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<CategoryWithCount[]>(initialCategories);

  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryWithCount | null>(null);
  const [deleteCategory, setDeleteCategory] = useState<CategoryWithCount | null>(null);

  // Form states
  const [formName, setFormName] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formIsActive, setFormIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  // Open Create Modal
  const openCreateModal = () => {
    setFormName("");
    setFormSubtitle("");
    setFormIsActive(true);
    setCreateModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (cat: CategoryWithCount) => {
    setEditCategory(cat);
    setFormName(cat.name);
    setFormSubtitle(cat.subtitle || "");
    setFormIsActive(cat.isActive);
  };

  // Create Category Handler
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          subtitle: formSubtitle.trim() || null,
          isActive: formIsActive,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData?.error?.message || "Failed to create category");
      }

      setCategories((prev) => [...prev, resData.data]);
      setCreateModalOpen(false);
      toast.success(`Category "${formName}" created successfully.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error creating category";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update Category Handler
  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory || !formName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/categories/${editCategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          subtitle: formSubtitle.trim() || null,
          isActive: formIsActive,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData?.error?.message || "Failed to update category");
      }

      setCategories((prev) =>
        prev.map((c) => (c.id === editCategory.id ? { ...c, ...resData.data } : c))
      );
      setEditCategory(null);
      toast.success(`Category "${formName}" updated.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error updating category";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Visibility directly
  const handleToggleActive = async (cat: CategoryWithCount) => {
    const nextState = !cat.isActive;
    // Optimistic update
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, isActive: nextState } : c))
    );

    try {
      const response = await fetch(`/api/admin/categories/${cat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: nextState }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData?.error?.message || "Failed to update category status");
      }

      toast.success(
        nextState
          ? `"${cat.name}" is now visible on menu.`
          : `"${cat.name}" hidden from customer menu.`
      );
    } catch (err: unknown) {
      // Revert on error
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isActive: !nextState } : c))
      );
      const msg = err instanceof Error ? err.message : "Error updating status";
      toast.error(msg);
    }
  };

  // Reorder Category (move up or down)
  const handleMoveCategory = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === categories.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const newCategories = [...categories];
    const [moved] = newCategories.splice(index, 1);
    newCategories.splice(targetIndex, 0, moved);

    // Update local displayOrder
    const reordered = newCategories.map((item, idx) => ({
      ...item,
      displayOrder: idx,
    }));

    setCategories(reordered);
    setIsReordering(true);

    try {
      const response = await fetch("/api/admin/categories/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: reordered.map((c) => c.id) }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData?.error?.message || "Failed to save reordered sequence");
      }
      toast.success("Category sequence saved.");
    } catch (err: unknown) {
      // Revert to initial
      setCategories(categories);
      const msg = err instanceof Error ? err.message : "Reordering error";
      toast.error(msg);
    } finally {
      setIsReordering(false);
    }
  };

  // Delete Category Handler
  const handleDeleteCategory = async () => {
    if (!deleteCategory) return;
    if (deleteCategory._count.items > 0) {
      toast.error("Cannot delete a category containing dishes. Reassign or delete dishes first.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/categories/${deleteCategory.id}`, {
        method: "DELETE",
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData?.error?.message || "Failed to delete category");
      }

      setCategories((prev) => prev.filter((c) => c.id !== deleteCategory.id));
      setDeleteCategory(null);
      toast.success(`Category "${deleteCategory.name}" removed.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error deleting category";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[var(--surface-border)]">
        <div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Category Management Studio
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Create, reorder, and control visibility for all menu sections. Diners browse dishes in this exact sequence.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--brand-primary)] text-white hover:opacity-90 transition-opacity shadow-xs cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Category List Card */}
      <div className="p-6 rounded-2xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--surface-border)]">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)]">
            <Layers className="w-4 h-4 text-[var(--brand-primary)]" />
            <span>Active Menu Sections ({categories.length})</span>
          </div>
          {isReordering && (
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving order...
            </span>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <p className="text-xs text-[var(--text-muted)]">
              No categories have been created yet.
            </p>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--brand-primary)] bg-[var(--canvas-bg)] border border-[var(--surface-border)]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create First Category</span>
            </button>
          </div>
        ) : (
          <div className="divide-y divide-[var(--surface-border)]">
            {categories.map((cat, index) => (
              <div
                key={cat.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[var(--canvas-bg)] px-3 rounded-xl transition-colors"
              >
                {/* Left: Reorder Controls & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex flex-col gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveCategory(index, "up")}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      aria-label={`Move ${cat.name} up`}
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === categories.length - 1}
                      onClick={() => handleMoveCategory(index, "down")}
                      className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)] disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                      aria-label={`Move ${cat.name} down`}
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[var(--text-primary)]">
                        {cat.name}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          cat.isActive
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                            : "bg-stone-200 dark:bg-stone-800 text-[var(--text-muted)]"
                        }`}
                      >
                        {cat.isActive ? "Visible" : "Hidden"}
                      </span>
                      <span className="text-[10px] text-[var(--text-muted)] font-medium">
                        &bull; {cat._count.items} {cat._count.items === 1 ? "dish" : "dishes"}
                      </span>
                    </div>
                    {cat.subtitle && (
                      <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
                        {cat.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Visibility Switch */}
                  <button
                    type="button"
                    onClick={() => handleToggleActive(cat)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                      cat.isActive
                        ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                        : "bg-stone-100 dark:bg-stone-800 text-[var(--text-muted)] border-[var(--surface-border)]"
                    }`}
                  >
                    {cat.isActive ? "Hide" : "Show"}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(cat)}
                    className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-card)] transition-colors cursor-pointer"
                    aria-label={`Edit ${cat.name}`}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteCategory(cat)}
                    className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                    aria-label={`Delete ${cat.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {createModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-category-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-[var(--surface-card)] max-w-md w-full rounded-2xl p-6 border border-[var(--surface-border)] shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--surface-border)]">
              <h2 id="create-category-title" className="font-editorial text-lg font-bold text-[var(--text-primary)]">
                Add Menu Category
              </h2>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label htmlFor="create-cat-name" className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="create-cat-name"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden"
                  placeholder="e.g. Handmade Pastas, Starters, Desserts"
                  maxLength={60}
                />
              </div>

              <div>
                <label htmlFor="create-cat-subtitle" className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Subtitle (Optional)
                </label>
                <input
                  id="create-cat-subtitle"
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden"
                  placeholder="e.g. Rolled fresh daily with organic semolina"
                  maxLength={160}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="create-cat-active"
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-[var(--surface-border)] text-[var(--brand-primary)]"
                />
                <label htmlFor="create-cat-active" className="text-xs font-medium text-[var(--text-primary)] cursor-pointer">
                  Visible on public customer menu
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--surface-border)]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formName.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--brand-primary)] text-white hover:opacity-90 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editCategory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-category-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-[var(--surface-card)] max-w-md w-full rounded-2xl p-6 border border-[var(--surface-border)] shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--surface-border)]">
              <h2 id="edit-category-title" className="font-editorial text-lg font-bold text-[var(--text-primary)]">
                Edit Category &bull; {editCategory.name}
              </h2>
              <button
                type="button"
                onClick={() => setEditCategory(null)}
                className="p-1 rounded text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label htmlFor="edit-cat-name" className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="edit-cat-name"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden"
                  maxLength={60}
                />
              </div>

              <div>
                <label htmlFor="edit-cat-subtitle" className="block text-xs font-semibold text-[var(--text-primary)] mb-1">
                  Subtitle (Optional)
                </label>
                <input
                  id="edit-cat-subtitle"
                  type="text"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-[var(--canvas-bg)] border border-[var(--surface-border)] text-[var(--text-primary)] focus:border-[var(--brand-primary)] focus:outline-hidden"
                  maxLength={160}
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="edit-cat-active"
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="rounded border-[var(--surface-border)] text-[var(--brand-primary)]"
                />
                <label htmlFor="edit-cat-active" className="text-xs font-medium text-[var(--text-primary)] cursor-pointer">
                  Visible on public customer menu
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--surface-border)]">
                <button
                  type="button"
                  onClick={() => setEditCategory(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formName.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--brand-primary)] text-white hover:opacity-90 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Update Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SAFEGUARD MODAL */}
      {deleteCategory && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-category-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
        >
          <div className="bg-[var(--surface-card)] max-w-md w-full rounded-2xl p-6 border border-[var(--surface-border)] shadow-xl space-y-5">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 id="delete-category-title" className="font-editorial text-lg font-bold text-[var(--text-primary)]">
                Delete Category
              </h2>
            </div>

            {deleteCategory._count.items > 0 ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong>Deletion Safeguard:</strong> This category cannot be deleted because it currently contains <strong>{deleteCategory._count.items} dish(es)</strong>. Please reassign or delete these dishes from the Menu Catalog before deleting this category.
                </div>
                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setDeleteCategory(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-[var(--surface-border)] text-[var(--text-primary)] hover:bg-stone-300 dark:hover:bg-stone-700 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Are you sure you want to permanently delete category <strong>&quot;{deleteCategory.name}&quot;</strong>? This action cannot be undone.
                </p>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--surface-border)]">
                  <button
                    type="button"
                    onClick={() => setDeleteCategory(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleDeleteCategory}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    <span>Confirm Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

