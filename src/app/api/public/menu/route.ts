import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateOperatingStatus } from "@/lib/hours-calculator";
import { sanitizePublicMenuData } from "@/lib/sanitizer";

export const dynamic = "force-dynamic";

/**
 * Helper to fetch public menu data directly (reusable by Server Components and API route).
 */
export async function getPublicMenuData() {
  const [profile, hours, categories] = await Promise.all([
    prisma.restaurantProfile.findUnique({
      where: { singletonKey: "RESTAURANT_PROFILE_SINGLETON" },
      include: {
        logoAsset: true,
        bannerAsset: true,
      },
    }),
    prisma.operatingHours.findMany({
      orderBy: { dayOfWeek: "asc" },
    }),
    prisma.menuCategory.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: "asc" },
      include: {
        items: {
          where: { isVisible: true },
          orderBy: { displayOrder: "asc" },
          include: {
            imageAsset: true,
          },
        },
      },
    }),
  ]);

  const defaultProfile = profile || {
    name: "DigiNu Dining",
    slug: "diginu-dining",
    tagline: "Digital Restaurant Menu",
    aboutStory: null,
    address: null,
    phone: null,
    whatsapp: null,
    currencyCode: "INR",
    currencySymbol: "₹",
    currencyPosition: "PREFIX",
    themePreset: "warm-cream",
    primaryColor: "#C85A32",
    accentColor: "#F59E0B",
    logoAsset: null,
    bannerAsset: null,
  };

  const operatingStatus = calculateOperatingStatus(hours);

  return sanitizePublicMenuData({
    profile: defaultProfile,
    operatingStatus,
    hours,
    categories,
  });
}

/**
 * GET /api/public/menu
 * Public, edge-cached endpoint returning sanitized restaurant and menu hierarchy.
 */
export async function GET() {
  try {
    const data = await getPublicMenuData();

    return NextResponse.json(
      {
        success: true,
        data,
        error: null,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("[PUBLIC_MENU_API_ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to load restaurant menu. Please try again shortly.",
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Reject any write/mutation methods on the public menu API.
 */
export async function POST() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}

export async function PUT() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}

export async function DELETE() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}

export async function PATCH() {
  return new NextResponse(null, { status: 405, headers: { Allow: "GET" } });
}

