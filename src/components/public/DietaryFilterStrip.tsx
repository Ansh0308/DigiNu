"use client";

import { X } from "lucide-react";

export interface ActiveDietaryFilters {
  vegOnly: boolean;
  veganOnly: boolean;
  glutenFreeOnly: boolean;
  halalOnly: boolean;
  dairyFreeOnly: boolean;
  nutFreeOnly: boolean;
  spicyOnly: boolean;
}

export const INITIAL_DIETARY_FILTERS: ActiveDietaryFilters = {
  vegOnly: false,
  veganOnly: false,
  glutenFreeOnly: false,
  halalOnly: false,
  dairyFreeOnly: false,
  nutFreeOnly: false,
  spicyOnly: false,
};

interface DietaryFilterStripProps {
  filters: ActiveDietaryFilters;
  onChange: (filters: ActiveDietaryFilters) => void;
  onReset: () => void;
}

export function DietaryFilterStrip({
  filters,
  onChange,
  onReset,
}: DietaryFilterStripProps) {
  const activeCount = Object.values(filters).filter(Boolean).length;

  const toggleFilter = (key: keyof ActiveDietaryFilters) => {
    onChange({
      ...filters,
      [key]: !filters[key],
    });
  };

  const filterConfigs: {
    key: keyof ActiveDietaryFilters;
    label: string;
    icon: string;
  }[] = [
    { key: "vegOnly", label: "Pure Veg", icon: "🌱" },
    { key: "veganOnly", label: "Vegan", icon: "🌿" },
    { key: "glutenFreeOnly", label: "Gluten-Free", icon: "🌾" },
    { key: "halalOnly", label: "Halal", icon: "☪️" },
    { key: "dairyFreeOnly", label: "Dairy-Free", icon: "🥛" },
    { key: "nutFreeOnly", label: "Nut-Free", icon: "🥜" },
    { key: "spicyOnly", label: "Spicy", icon: "🌶️" },
  ];

  return (
    <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
      {activeCount > 0 && (
        <button
          type="button"
          onClick={onReset}
          className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors"
          aria-label="Clear all dietary filters"
        >
          <X className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Clear ({activeCount})</span>
        </button>
      )}

      {filterConfigs.map((cfg) => {
        const isSelected = filters[cfg.key];
        return (
          <button
            key={cfg.key}
            type="button"
            role="checkbox"
            aria-checked={isSelected}
            onClick={() => toggleFilter(cfg.key)}
            className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all select-none border ${
              isSelected
                ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-xs"
                : "bg-[var(--surface-card)] text-[var(--text-muted)] border-[var(--surface-border)] hover:border-[var(--brand-primary)]/50 hover:text-[var(--text-primary)]"
            }`}
          >
            <span aria-hidden="true">{cfg.icon}</span>
            <span>{cfg.label}</span>
          </button>
        );
      })}
    </div>
  );
}

