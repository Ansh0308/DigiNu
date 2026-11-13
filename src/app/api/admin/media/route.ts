import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnauthorized } from "@/lib/api-response";

/**
 * GET /api/admin/media
 * Lists media library assets with optional assetType filter.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type"); // 'ALL' | 'FOOD_UPLOAD' | 'AI_GENERATED' | 'LOGO' | 'BANNER'

  const where: Record<string, unknown> = {};
  if (typeFilter && typeFilter !== "ALL") {
    where.assetType = typeFilter;
  }

  const assets = await prisma.mediaAsset.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      menuItems: {
        select: { id: true, name: true },
      },
      logoProfiles: {
        select: { id: true, name: true },
      },
      bannerProfiles: {
        select: { id: true, name: true },
      },
    },
  });

  return apiSuccess(assets);
}

