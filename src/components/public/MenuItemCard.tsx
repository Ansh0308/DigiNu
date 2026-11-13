"use client";

import Image from "next/image";
import { Utensils, Ban, Sparkles, ChevronRight } from "lucide-react";
import { PublicMenuItem } from "@/lib/sanitizer";

interface MenuItemCardProps {
  item: PublicMenuItem;
  currencySymbol: string;
  currencyPosition?: "PREFIX" | "SUFFIX";
  onClick: (item: PublicMenuItem) => void;
}

export function MenuItemCard({
  item,
  currencySymbol,
  currencyPosition = "PREFIX",
  onClick,
}: MenuItemCardProps) {
  const isAvailable = item.isAvailable;

  const formattedPrice =
    currencyPosition === "PREFIX"
      ? `${currencySymbol}${item.price.toFixed(0)}`
      : `${item.price.toFixed(0)} ${currencySymbol}`;

  return (
    <article
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(item);
        }
      }}
      aria-label={`${item.name}, ${formattedPrice}${!isAvailable ? " - Currently Sold Out" : ""}`}
      className={`group relative flex flex-row items-center justify-between p-4 rounded-3xl bg-[var(--surface-card)] border border-[var(--surface-border)] shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out cursor-pointer overflow-hidden ${
        !isAvailable
          ? "opacity-60 bg-neutral-50/70 grayscale-[40%]"
          : "hover:border-amber-400/50 hover:ring-1 hover:ring-amber-400/20"
      }`}
    >
      {/* Left: Dish Information & Meta */}
      <div className="flex-1 min-w-0 pr-3.5 sm:pr-4 flex flex-col justify-between self-stretch">
        <div>
          {/* Header row: Veg/Non-Veg FSSAI Icon + Title */}
          <div className="flex items-start gap-2">
            {/* Authentic Indian FSSAI Veg / Non-Veg Indicator */}
            <span
              className={`mt-1 flex-shrink-0 w-4 h-4 rounded-xs border-2 flex items-center justify-center ${
                item.dietary.isVegetarian
                  ? "border-emerald-600 bg-emerald-50"
                  : "border-red-700 bg-red-50"
              }`}
              title={item.dietary.isVegetarian ? "Pure Vegetarian" : "Non-Vegetarian"}
              aria-label={item.dietary.isVegetarian ? "Pure Vegetarian" : "Non-Vegetarian"}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  item.dietary.isVegetarian ? "bg-emerald-600" : "bg-red-700"
                }`}
              />
            </span>

            <div className="min-w-0 flex-1">
              <h3 className="font-editorial text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-amber-800 transition-colors leading-snug tracking-tight">
                {item.name}
              </h3>

              {item.isFeatured && (
                <span className="inline-flex items-center gap-1 mt-0.5 text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 py-0.2 rounded-md">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600" aria-hidden="true" />
                  <span>Chef’s Special</span>
                </span>
              )}
            </div>
          </div>

          {/* Short description */}
          {item.shortDescription && (
            <p className="mt-1.5 text-xs sm:text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
              {item.shortDescription}
            </p>
          )}
        </div>

        {/* Bottom row: Bold Indian Price & Dietary Tags */}
        <div className="mt-3 pt-2 flex flex-wrap items-center justify-between border-t border-[var(--surface-border)]/50">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-base sm:text-lg font-bold text-[var(--brand-primary)] tabular-nums">
              {formattedPrice}
            </span>

            {/* Quick Dietary Chips */}
            <div className="flex items-center gap-1">
              {item.dietary.isGlutenFree && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-900 font-semibold">
                  GF
                </span>
              )}
              {item.dietary.isVegan && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-green-100 text-green-900 font-semibold">
                  Vegan
                </span>
              )}
              {item.dietary.spicyLevel > 0 && (
                <span className="text-xs" title={`Spiciness: Level ${item.dietary.spicyLevel}`}>
                  {"🌶️".repeat(item.dietary.spicyLevel)}
                </span>
              )}
            </div>
          </div>

          {/* Micro arrow indicator on hover */}
          <span className="hidden sm:inline-flex items-center text-xs font-medium text-[var(--text-muted)] group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all">
            <span>View</span>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
          </span>
        </div>
      </div>

      {/* Right: Food Photography Thumbnail */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-100 flex-shrink-0 border border-[var(--surface-border)] shadow-xs">
        {item.thumbnailUrl || item.imageUrl ? (
          <Image
            src={item.thumbnailUrl || item.imageUrl!}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 96px, 112px"
            className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-amber-800/25">
            <Utensils className="w-8 h-8" aria-hidden="true" />
          </div>
        )}

        {/* Sold out overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[1px] flex flex-col items-center justify-center p-1 text-center">
            <Ban className="w-5 h-5 text-red-400 mb-0.5" aria-hidden="true" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-white">
              Sold Out
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
