/**
 * DigiNu — Domain Entity Types and Enums
 * Source: docs/02-technical-architecture/03-data-model-and-erd.md
 */

export const DIETARY_FLAGS = [
  "VEGETARIAN",
  "VEGAN",
  "GLUTEN_FREE",
  "HALAL",
  "DAIRY_FREE",
  "NUT_FREE",
] as const;

export type DietaryFlag = (typeof DIETARY_FLAGS)[number];

export const ALLERGEN_FLAGS = [
  "GLUTEN",
  "DAIRY",
  "EGGS",
  "NUTS",
  "PEANUTS",
  "SHELLFISH",
  "FISH",
  "SOY",
  "SESAME",
  "MOLLUSCS",
  "CELERY",
  "MUSTARD",
] as const;

export type AllergenFlag = (typeof ALLERGEN_FLAGS)[number];

export interface OperatingHoursItem {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  openTime: string;  // "11:00"
  closeTime: string; // "22:00"
  isClosed: boolean;
}

export interface SanitizedOwnerSession {
  id: string;
  email: string;
  fullName: string;
}

