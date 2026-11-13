"use client";

import { useEffect, useRef } from "react";
import { PublicMenuCategory } from "@/lib/sanitizer";

interface CategoryNavProps {
  categories: PublicMenuCategory[];
  activeCategoryId: string;
  onSelectCategory: (id: string) => void;
}

export function CategoryNav({
  categories,
  activeCategoryId,
  onSelectCategory,
}: CategoryNavProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activePillRef = useRef<HTMLButtonElement>(null);

  // Auto-center active category pill
  useEffect(() => {
    if (activePillRef.current && containerRef.current) {
      const container = containerRef.current;
      const pill = activePillRef.current;
      const pillLeft = pill.offsetLeft;
      const pillWidth = pill.offsetWidth;
      const containerWidth = container.offsetWidth;

      container.scrollTo({
        left: pillLeft - containerWidth / 2 + pillWidth / 2,
        behavior: "smooth",
      });
    }
  }, [activeCategoryId]);

  if (categories.length === 0) return null;

  return (
    <nav
      aria-label="Menu categories navigation"
      className="sticky top-0 z-30 w-full bg-[var(--surface-canvas)]/92 backdrop-blur-xl border-b border-[var(--surface-border)] shadow-xs transition-shadow"
    >
      <div
        ref={containerRef}
        role="tablist"
        aria-label="Food categories"
        className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth"
      >
        {categories.map((category) => {
          const isActive = category.id === activeCategoryId;
          return (
            <button
              key={category.id}
              ref={isActive ? activePillRef : null}
              role="tab"
              aria-selected={isActive}
              aria-controls={`category-panel-${category.id}`}
              id={`category-tab-${category.id}`}
              onClick={() => onSelectCategory(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 select-none cursor-pointer flex items-center gap-1.5 ${
                isActive
                  ? "bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white shadow-md shadow-orange-600/25 scale-[1.03] ring-1 ring-white/20"
                  : "bg-[var(--surface-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-amber-400/40 border border-[var(--surface-border)] active:scale-95"
              }`}
            >
              <span>{category.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-sans transition-colors ${
                  isActive ? "bg-white/25 text-white" : "bg-[var(--surface-border)]/70 text-[var(--text-muted)]"
                }`}
              >
                {category.items.length}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
