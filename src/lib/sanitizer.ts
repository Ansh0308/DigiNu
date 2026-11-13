export interface PublicRestaurantProfile {
  name: string;
  tagline: string | null;
  aboutStory: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  currencyCode: string;
  currencySymbol: string;
  currencyPosition: string;
  themePreset: string;
  primaryColor: string;
  accentColor: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  isOpenNow: boolean;
  statusBadgeText: string;
  todayHoursText: string;
  operatingHours: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[];
}

export interface PublicDietaryFlags {
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isHalal: boolean;
  isDairyFree: boolean;
  isNutFree: boolean;
  spicyLevel: number;
}

export interface PublicMenuItem {
  id: string;
  name: string;
  shortDescription: string | null;
  detailedDescription: string | null;
  price: number;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  isAvailable: boolean;
  isFeatured: boolean;
  dietary: PublicDietaryFlags;
  allergens: string[];
}

export interface PublicMenuCategory {
  id: string;
  name: string;
  subtitle: string | null;
  displayOrder: number;
  items: PublicMenuItem[];
}

export interface PublicMenuPayload {
  restaurant: PublicRestaurantProfile;
  categories: PublicMenuCategory[];
}

/**
 * Builds responsive ImageKit WebP CDN URL.
 */
export function buildImageKitTransform(rawUrl: string, transformParams: string): string {
  if (!rawUrl) return rawUrl;
  if (!rawUrl.includes("ik.imagekit.io")) {
    return rawUrl;
  }
  const separator = rawUrl.includes("?") ? "&" : "?";
  return `${rawUrl}${separator}tr=${transformParams}`;
}

/**
 * Formats dietary flags from stored array and boolean into structured flags.
 */
export function parseDietaryFlags(isVegetarian: boolean, flags: string[]): PublicDietaryFlags {
  const normalized = (flags || []).map((f) => f.toUpperCase());
  return {
    isVegetarian: isVegetarian || normalized.includes("VEGETARIAN") || normalized.includes("VEG"),
    isVegan: normalized.includes("VEGAN") || normalized.includes("VGN"),
    isGlutenFree: normalized.includes("GLUTEN_FREE") || normalized.includes("GF"),
    isHalal: normalized.includes("HALAL"),
    isDairyFree: normalized.includes("DAIRY_FREE") || normalized.includes("DF"),
    isNutFree: normalized.includes("NUT_FREE") || normalized.includes("NF"),
    spicyLevel: normalized.includes("VERY_SPICY") ? 3 : normalized.includes("SPICY") ? 2 : normalized.includes("MILD") ? 1 : 0,
  };
}

/**
 * Strips all sensitive fields and serializes database entities into the public menu contract.
 */
export function sanitizePublicMenuData(params: {
  profile: {
    name: string;
    tagline: string | null;
    aboutStory: string | null;
    address: string | null;
    phone: string | null;
    whatsapp: string | null;
    currencyCode: string;
    currencySymbol: string;
    currencyPosition: string;
    themePreset: string;
    primaryColor: string;
    accentColor: string;
    logoAsset?: { url: string } | null;
    bannerAsset?: { url: string } | null;
  };
  operatingStatus: {
    isOpenNow: boolean;
    todayHoursText: string;
    statusBadgeText: string;
  };
  hours: {
    dayOfWeek: number;
    openTime: string;
    closeTime: string;
    isClosed: boolean;
  }[];
  categories: {
    id: string;
    name: string;
    subtitle: string | null;
    displayOrder: number;
    items: {
      id: string;
      name: string;
      shortDescription: string | null;
      detailedDescription: string | null;
      price: { toNumber?: () => number } | number | string;
      isVegetarian: boolean;
      dietaryFlags: string[];
      allergenFlags: string[];
      isAvailable: boolean;
      isFeatured: boolean;
      imageAsset?: { url: string } | null;
    }[];
  }[];
}): PublicMenuPayload {
  const { profile, operatingStatus, hours, categories } = params;

  const publicCategories: PublicMenuCategory[] = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    subtitle: cat.subtitle,
    displayOrder: cat.displayOrder,
    items: cat.items.map((item) => {
      const rawPrice =
        typeof item.price === "object" && item.price !== null && "toNumber" in item.price && typeof item.price.toNumber === "function"
          ? item.price.toNumber()
          : Number(item.price);

      const rawImageUrl = item.imageAsset?.url || null;
      const imageUrl = rawImageUrl ? buildImageKitTransform(rawImageUrl, "w-800,q-85,fo-auto") : null;
      const thumbnailUrl = rawImageUrl ? buildImageKitTransform(rawImageUrl, "w-400,h-300,fo-auto,q-80") : null;

      return {
        id: item.id,
        name: item.name,
        shortDescription: item.shortDescription,
        detailedDescription: item.detailedDescription,
        price: isNaN(rawPrice) ? 0 : rawPrice,
        imageUrl,
        thumbnailUrl,
        isAvailable: item.isAvailable,
        isFeatured: item.isFeatured,
        dietary: parseDietaryFlags(item.isVegetarian, item.dietaryFlags),
        allergens: item.allergenFlags || [],
      };
    }),
  }));

  return {
    restaurant: {
      name: profile.name,
      tagline: profile.tagline,
      aboutStory: profile.aboutStory,
      address: profile.address,
      phone: profile.phone,
      whatsapp: profile.whatsapp,
      currencyCode: profile.currencyCode,
      currencySymbol: profile.currencySymbol,
      currencyPosition: profile.currencyPosition,
      themePreset: profile.themePreset,
      primaryColor: profile.primaryColor,
      accentColor: profile.accentColor,
      logoUrl: profile.logoAsset?.url || null,
      bannerUrl: profile.bannerAsset?.url || null,
      isOpenNow: operatingStatus.isOpenNow,
      statusBadgeText: operatingStatus.statusBadgeText,
      todayHoursText: operatingStatus.todayHoursText,
      operatingHours: hours.map((h) => ({
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed,
      })),
    },
    categories: publicCategories,
  };
}
