import { z } from "zod";

/**
 * Standard API Response Envelope
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
}

/**
 * Owner Authentication Login Validation Schema
 */
export const LoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required")
    .email("Please provide a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().default(false).optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;

/**
 * Single-Tenant Restaurant Profile Update Schema
 */
export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters").optional(),
  tagline: z.string().trim().max(160, "Tagline must not exceed 160 characters").nullable().optional(),
  aboutStory: z.string().trim().max(2000, "About story must not exceed 2000 characters").nullable().optional(),
  address: z.string().trim().max(255, "Address must not exceed 255 characters").nullable().optional(),
  phone: z.string().trim().max(30, "Phone number must not exceed 30 characters").nullable().optional(),
  whatsapp: z.string().trim().max(30, "WhatsApp number must not exceed 30 characters").nullable().optional(),
  currencyCode: z.string().trim().length(3, "Currency code must be exactly 3 uppercase letters (e.g. USD, EUR)").toUpperCase().optional(),
  currencySymbol: z.string().trim().min(1, "Currency symbol is required").max(5, "Currency symbol must not exceed 5 characters").optional(),
  currencyPosition: z.enum(["PREFIX", "SUFFIX"]).optional(),
  themePreset: z.enum(["clean-white", "warm-cream", "midnight-charcoal"]).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Primary color must be a valid 6-character hex code (e.g. #C85A32)").optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Accent color must be a valid 6-character hex code (e.g. #F59E0B)").optional(),
});

export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>;

/**
 * 7-Day Operating Hours Update Schema
 */
export const OperatingHourItemSchema = z.object({
  dayOfWeek: z.number().int().min(0, "dayOfWeek must be between 0 (Sunday) and 6 (Saturday)").max(6),
  openTime: z.string().regex(/^\d{2}:\d{2}$/, "Time format must be HH:MM (e.g. 11:00)"),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/, "Time format must be HH:MM (e.g. 22:00)"),
  isClosed: z.boolean(),
});

export const UpdateOperatingHoursSchema = z
  .array(OperatingHourItemSchema)
  .length(7, "Operating hours must contain records for all 7 days of the week");

export type OperatingHourItemInput = z.infer<typeof OperatingHourItemSchema>;
export type UpdateOperatingHoursInput = z.infer<typeof UpdateOperatingHoursSchema>;

/**
 * Category Management Schemas
 */
export const CreateCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(60, "Category name must not exceed 60 characters"),
  subtitle: z.string().trim().max(160, "Subtitle must not exceed 160 characters").nullable().optional(),
  displayOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true).optional(),
});

export const UpdateCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name must be at least 2 characters").max(60, "Category name must not exceed 60 characters").optional(),
  subtitle: z.string().trim().max(160, "Subtitle must not exceed 160 characters").nullable().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const ReorderCategoriesSchema = z.object({
  orderedIds: z.array(z.string().min(1, "ID cannot be empty")).min(1, "orderedIds list cannot be empty"),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type ReorderCategoriesInput = z.infer<typeof ReorderCategoriesSchema>;

/**
 * Food Item Catalog Schemas
 */
export const CreateItemSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().trim().min(2, "Dish name must be at least 2 characters").max(100, "Dish name must not exceed 100 characters"),
  shortDescription: z.string().trim().max(180, "Short description must not exceed 180 characters").nullable().optional(),
  detailedDescription: z.string().trim().max(2000, "Detailed description must not exceed 2000 characters").nullable().optional(),
  price: z.coerce.number().min(0, "Price cannot be negative").max(99999.99, "Price exceeds maximum threshold"),
  isVegetarian: z.boolean().default(false),
  dietaryFlags: z.array(z.string()).default([]),
  allergenFlags: z.array(z.string()).default([]),
  isAvailable: z.boolean().default(true),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
});

export const UpdateItemSchema = CreateItemSchema.partial();

export const UpdateAvailabilitySchema = z.object({
  isAvailable: z.boolean({ required_error: "isAvailable boolean is required" }),
});

export const ReorderItemsSchema = z.object({
  orderedIds: z.array(z.string().min(1, "ID cannot be empty")).min(1, "orderedIds list cannot be empty"),
});

export type CreateItemInput = z.infer<typeof CreateItemSchema>;
export type UpdateItemInput = z.infer<typeof UpdateItemSchema>;
export type UpdateAvailabilityInput = z.infer<typeof UpdateAvailabilitySchema>;
export type ReorderItemsInput = z.infer<typeof ReorderItemsSchema>;
