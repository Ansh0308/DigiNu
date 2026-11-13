"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { X, AlertTriangle, Utensils, Ban, Sparkles, ShieldCheck } from "lucide-react";
import { PublicMenuItem } from "@/lib/sanitizer";

interface DishDetailDrawerProps {
  item: PublicMenuItem | null;
  onClose: () => void;
  currencySymbol: string;
  currencyPosition?: "PREFIX" | "SUFFIX";
}

export function DishDetailDrawer({
  item,
  onClose,
  currencySymbol,
  currencyPosition = "PREFIX",
}: DishDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && item) {
        onClose();
      }
    };

    if (item) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [item, onClose]);

  if (!item) return null;

  const formattedPrice =
    currencyPosition === "PREFIX"
      ? `${currencySymbol}${item.price.toFixed(0)}`
      : `${item.price.toFixed(0)} ${currencySymbol}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dish-drawer-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 backdrop-blur-sm transition-opacity animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={drawerRef}
        className="w-full sm:max-w-lg max-h-[92vh] bg-[var(--surface-card)] rounded-t-3xl sm:rounded-3xl border border-[var(--surface-border)] shadow-2xl overflow-y-auto flex flex-col transition-transform animate-slideUp"
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 20px)",
        }}
      >
        {/* Mobile Drag Indicator Handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
        </div>

        {/* Hero Photo Section with Close Overlay */}
        <div className="relative w-full aspect-video bg-gradient-to-br from-amber-50 to-orange-100 flex-shrink-0 overflow-hidden">
          {item.imageUrl || item.thumbnailUrl ? (
            <Image
              src={item.imageUrl || item.thumbnailUrl!}
              alt={item.name}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 512px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-amber-800/25">
              <Utensils className="w-16 h-16" aria-hidden="true" />
            </div>
          )}

          {/* Vignette Gradient on photo */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

          {/* Close Button (Touch Friendly 44x44px target) */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dish details"
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/85 transition-colors shadow-lg active:scale-95"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Sold out overlay */}
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center p-4 text-center">
              <Ban className="w-10 h-10 text-red-400 mb-2" aria-hidden="true" />
              <span className="text-base font-bold uppercase tracking-wider text-white">
                Sold Out Today
              </span>
              <p className="text-xs text-neutral-300 mt-1 max-w-xs">
                This specialty dish is currently unavailable for today’s dining service.
              </p>
            </div>
          )}
        </div>

        {/* Details Container */}
        <div className="p-6 flex-1 flex flex-col gap-4">
          {/* Header & Price */}
          <div className="flex items-start justify-between gap-4 border-b border-[var(--surface-border)]/70 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`w-4 h-4 rounded-xs border-2 flex items-center justify-center ${
                    item.dietary.isVegetarian
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-red-700 bg-red-50"
                  }`}
                  aria-label={item.dietary.isVegetarian ? "Pure Vegetarian" : "Non-Vegetarian"}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.dietary.isVegetarian ? "bg-emerald-600" : "bg-red-700"
                    }`}
                  />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-500">
                  {item.dietary.isVegetarian ? "100% Pure Vegetarian" : "Non-Vegetarian"}
                </span>

                {item.isFeatured && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-full">
                    <Sparkles className="w-3 h-3 text-amber-600" aria-hidden="true" />
                    <span>Specialty</span>
                  </span>
                )}
              </div>

              <h2
                id="dish-drawer-title"
                className="font-editorial text-2xl sm:text-3xl font-bold text-[var(--text-primary)] leading-tight tracking-tight"
              >
                {item.name}
              </h2>
            </div>

            <div className="text-right flex-shrink-0">
              <span className="font-editorial text-2xl sm:text-3xl font-bold text-[var(--brand-primary)] tabular-nums">
                {formattedPrice}
              </span>
            </div>
          </div>

          {/* Dietary Badges */}
          <div className="flex flex-wrap items-center gap-2">
            {item.dietary.isGlutenFree && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200/60 shadow-2xs">
                🌾 Gluten-Free
              </span>
            )}
            {item.dietary.isVegan && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-900 border border-green-200/60 shadow-2xs">
                🌿 Vegan
              </span>
            )}
            {item.dietary.isHalal && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-900 border border-teal-200/60 shadow-2xs">
                ☪️ Halal Certified
              </span>
            )}
            {item.dietary.isDairyFree && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-200/60 shadow-2xs">
                🥛 Dairy-Free
              </span>
            )}
            {item.dietary.isNutFree && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-900 border border-purple-200/60 shadow-2xs">
                🥜 Nut-Free
              </span>
            )}
            {item.dietary.spicyLevel > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-900 border border-red-200/60 shadow-2xs">
                {"🌶️".repeat(item.dietary.spicyLevel)} Spiciness (Lvl {item.dietary.spicyLevel})
              </span>
            )}
          </div>

          {/* Detailed Culinary Story */}
          <div className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed space-y-2 py-1">
            {item.detailedDescription ? (
              <p className="leading-relaxed">{item.detailedDescription}</p>
            ) : item.shortDescription ? (
              <p className="leading-relaxed">{item.shortDescription}</p>
            ) : (
              <p className="italic text-xs text-[var(--text-muted)]/70">
                Freshly prepared to order by our kitchen team using authentic local spices and fresh ingredients.
              </p>
            )}
          </div>

          {/* Allergen Advisories Box */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-950 text-xs sm:text-sm">
              <div className="flex items-center gap-2 font-bold mb-1 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
                <span>Allergen & Dietary Advisory</span>
              </div>
              <p className="text-amber-900/90 leading-relaxed">
                Contains: <strong className="font-semibold">{item.allergens.join(", ")}</strong>.
                If you have specific food sensitivities or allergies, please inform your table captain.
              </p>
            </div>
          )}

          {/* Tableside Ordering Notice */}
          <div className="mt-auto pt-4 border-t border-[var(--surface-border)] text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-card)] border border-[var(--surface-border)] text-xs text-[var(--text-muted)]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
              <span>Digital Menu &bull; Order directly with your table server</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
