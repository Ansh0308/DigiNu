"use client";

import { useState, useMemo } from "react";
import { Utensils, SearchX, Compass, ArrowUp, X } from "lucide-react";
import { PublicMenuPayload, PublicMenuItem } from "@/lib/sanitizer";
import { RestaurantHero } from "./RestaurantHero";
import { CategoryNav } from "./CategoryNav";
import { SearchBar } from "./SearchBar";
import {
  DietaryFilterStrip,
  ActiveDietaryFilters,
  INITIAL_DIETARY_FILTERS,
} from "./DietaryFilterStrip";
import { MenuItemCard } from "./MenuItemCard";
import { DishDetailDrawer } from "./DishDetailDrawer";
import { OutsideHoursBanner } from "./OutsideHoursBanner";
import { OfflineNotice } from "./OfflineNotice";
import { PublicMenuFooter } from "./PublicMenuFooter";
import { useScrollSpy } from "@/hooks/useScrollSpy";

interface PublicMenuExperienceProps {
  data: PublicMenuPayload;
}

export function PublicMenuExperience({ data }: PublicMenuExperienceProps) {
  const { restaurant, categories } = data;

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [dietaryFilters, setDietaryFilters] = useState<ActiveDietaryFilters>(INITIAL_DIETARY_FILTERS);

  // Selected dish for detail bottom sheet
  const [selectedDish, setSelectedDish] = useState<PublicMenuItem | null>(null);

  // Floating Category Quick-Sheet
  const [showQuickCategories, setShowQuickCategories] = useState(false);

  // Filter items based on active criteria
  const isFiltering = useMemo(() => {
    const hasSearch = searchQuery.trim().length > 0;
    const hasDietary = Object.values(dietaryFilters).some(Boolean);
    return hasSearch || hasDietary;
  }, [searchQuery, dietaryFilters]);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return categories
      .map((cat) => {
        const matchingItems = cat.items.filter((item) => {
          // 1. Text Search matching
          if (query) {
            const nameMatch = item.name.toLowerCase().includes(query);
            const shortDescMatch = item.shortDescription?.toLowerCase().includes(query);
            const detailedDescMatch = item.detailedDescription?.toLowerCase().includes(query);
            const allergenMatch = item.allergens.some((a) => a.toLowerCase().includes(query));

            if (!nameMatch && !shortDescMatch && !detailedDescMatch && !allergenMatch) {
              return false;
            }
          }

          // 2. Dietary filters matching
          if (dietaryFilters.vegOnly && !item.dietary.isVegetarian) return false;
          if (dietaryFilters.veganOnly && !item.dietary.isVegan) return false;
          if (dietaryFilters.glutenFreeOnly && !item.dietary.isGlutenFree) return false;
          if (dietaryFilters.halalOnly && !item.dietary.isHalal) return false;
          if (dietaryFilters.dairyFreeOnly && !item.dietary.isDairyFree) return false;
          if (dietaryFilters.nutFreeOnly && !item.dietary.isNutFree) return false;
          if (dietaryFilters.spicyOnly && item.dietary.spicyLevel === 0) return false;

          return true;
        });

        return {
          ...cat,
          items: matchingItems,
        };
      })
      .filter((cat) => cat.items.length > 0);
  }, [categories, searchQuery, dietaryFilters]);

  // Total matching dishes count
  const totalFilteredDishes = useMemo(() => {
    return filteredCategories.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [filteredCategories]);

  // Category navigation scroll spy
  const visibleCategoryIds = useMemo(
    () => filteredCategories.map((c) => c.id),
    [filteredCategories]
  );
  const { activeId, scrollToCategory } = useScrollSpy(visibleCategoryIds, 110);

  const handleResetFilters = () => {
    setSearchQuery("");
    setDietaryFilters(INITIAL_DIETARY_FILTERS);
  };

  const handleQuickScroll = (catId: string) => {
    setShowQuickCategories(false);
    scrollToCategory(catId);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[var(--surface-canvas)] text-[var(--text-primary)] antialiased font-sans"
      style={{
        ["--brand-primary" as string]: restaurant.primaryColor || "#C85A32",
      }}
    >
      {/* Outside hours status banner if closed */}
      {!restaurant.isOpenNow && (
        <OutsideHoursBanner todayHoursText={restaurant.todayHoursText} />
      )}

      {/* Hero Header */}
      <RestaurantHero restaurant={restaurant} />

      {/* Sticky Category Navigation Bar */}
      <CategoryNav
        categories={filteredCategories}
        activeCategoryId={activeId}
        onSelectCategory={scrollToCategory}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Search & Dietary Filter Section */}
        <div className="space-y-3.5 mb-8">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
          <DietaryFilterStrip
            filters={dietaryFilters}
            onChange={setDietaryFilters}
            onReset={handleResetFilters}
          />

          {/* Active Filter Results Counter */}
          {isFiltering && (
            <div className="flex items-center justify-between py-2 px-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-950 animate-fadeIn">
              <span>
                Found <strong className="font-bold text-amber-900">{totalFilteredDishes}</strong>{" "}
                {totalFilteredDishes === 1 ? "dish" : "dishes"}
                {searchQuery ? ` matching "${searchQuery}"` : ""}
              </span>
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-amber-800 font-bold hover:underline cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Categories & Dishes List */}
        {filteredCategories.length > 0 ? (
          <div className="space-y-12">
            {filteredCategories.map((category) => (
              <section
                key={category.id}
                id={`category-${category.id}`}
                className="scroll-mt-28"
                aria-labelledby={`category-title-${category.id}`}
              >
                {/* Ornamental Category Header */}
                <div className="mb-5 pb-2.5 border-b border-[var(--surface-border)]/80 flex items-end justify-between">
                  <div>
                    <h2
                      id={`category-title-${category.id}`}
                      className="font-editorial text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)] leading-tight"
                    >
                      {category.name}
                    </h2>
                    {category.subtitle && (
                      <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 font-sans">
                        {category.subtitle}
                      </p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full border border-amber-200/50">
                    {category.items.length} {category.items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* Items Grid (1 col mobile, 2 cols tablet/desktop) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  {category.items.map((item) => (
                    <MenuItemCard
                      key={item.id}
                      item={item}
                      currencySymbol={restaurant.currencySymbol}
                      currencyPosition={restaurant.currencyPosition as "PREFIX" | "SUFFIX"}
                      onClick={setSelectedDish}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Empty Search / Filter State (SCR-CUST-05) */
          <div className="my-16 py-12 px-4 text-center rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs animate-fadeIn">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center text-[var(--brand-primary)]">
              {isFiltering ? (
                <SearchX className="w-8 h-8" aria-hidden="true" />
              ) : (
                <Utensils className="w-8 h-8" aria-hidden="true" />
              )}
            </div>
            <h3 className="font-editorial text-xl font-bold text-[var(--text-primary)]">
              {isFiltering ? "No dishes match your preferences" : "Menu coming soon"}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--text-muted)] max-w-sm mx-auto leading-relaxed">
              {isFiltering
                ? "Try searching for a different ingredient or clearing some of your dietary preferences."
                : "Our culinary staff is currently curating this digital dining menu."}
            </p>
            {isFiltering && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-6 px-6 py-2.5 rounded-full text-xs font-semibold bg-[var(--brand-primary)] text-white shadow-md shadow-orange-500/25 hover:opacity-95 transition-all cursor-pointer active:scale-95"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Bar: Category Quick Navigator & Scroll To Top */}
      <aside
        aria-label="Quick menu navigation"
        className="fixed bottom-6 right-4 sm:right-8 z-40 flex items-center gap-2"
      >
        {/* Quick Menu Jump Button */}
        <button
          type="button"
          onClick={() => setShowQuickCategories(true)}
          aria-label="Quick jump to category"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-neutral-900/90 text-white shadow-xl backdrop-blur-md border border-white/10 hover:bg-neutral-900 transition-transform active:scale-95 cursor-pointer text-xs font-semibold"
        >
          <Compass className="w-4 h-4 text-amber-400" aria-hidden="true" />
          <span>Menu</span>
        </button>

        {/* Scroll To Top */}
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top of menu"
          className="w-10 h-10 rounded-full bg-[var(--surface-card)] text-[var(--text-primary)] border border-[var(--surface-border)] shadow-lg flex items-center justify-center hover:border-amber-400 transition-transform active:scale-90 cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" aria-hidden="true" />
        </button>
      </aside>

      {/* Category Quick Sheet Modal */}
      {showQuickCategories && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="quick-menu-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowQuickCategories(false);
          }}
        >
          <div className="w-full max-w-md bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-3xl shadow-2xl p-6 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--surface-border)]">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-amber-600" aria-hidden="true" />
                <h3 id="quick-menu-title" className="font-editorial text-xl font-bold text-[var(--text-primary)]">
                  Jump to Category
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickCategories(false)}
                aria-label="Close category jumper"
                className="p-1.5 rounded-full hover:bg-[var(--surface-canvas)] text-[var(--text-muted)] cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 max-h-[60vh] overflow-y-auto divide-y divide-[var(--surface-border)]/60">
              {filteredCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleQuickScroll(cat.id)}
                  className={`w-full text-left py-3 px-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                    cat.id === activeId
                      ? "bg-amber-500/10 font-bold text-amber-900"
                      : "hover:bg-[var(--surface-canvas)] text-[var(--text-primary)]"
                  }`}
                >
                  <span className="text-sm font-medium">{cat.name}</span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">
                    {cat.items.length} dishes
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dish Detail Bottom Sheet Drawer */}
      <DishDetailDrawer
        item={selectedDish}
        onClose={() => setSelectedDish(null)}
        currencySymbol={restaurant.currencySymbol}
        currencyPosition={restaurant.currencyPosition as "PREFIX" | "SUFFIX"}
      />

      {/* Offline Status Listener */}
      <OfflineNotice />

      {/* White-Label Footer */}
      <PublicMenuFooter />
    </div>
  );
}
