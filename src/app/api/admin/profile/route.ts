import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpdateProfileSchema } from "@/types/validation";
import { apiError, apiNotFound, apiSuccess, apiUnauthorized, apiValidationError } from "@/lib/api-response";

/**
 * GET /api/admin/profile
 * Retrieves the single-tenant restaurant profile and operating hours.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  const profile = await prisma.restaurantProfile.findFirst({
    include: {
      logoAsset: true,
      bannerAsset: true,
    },
  });

  if (!profile) {
    return apiNotFound("Restaurant profile");
  }

  const operatingHours = await prisma.operatingHours.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  return apiSuccess({
    profile,
    operatingHours,
  });
}

/**
 * PATCH /api/admin/profile
 * Updates the single-tenant restaurant profile settings.
 */
export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON", 400);
  }

  const parsed = UpdateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const currentProfile = await prisma.restaurantProfile.findFirst();
  if (!currentProfile) {
    return apiNotFound("Restaurant profile");
  }

  const updatedProfile = await prisma.restaurantProfile.update({
    where: { id: currentProfile.id },
    data: parsed.data,
    include: {
      logoAsset: true,
      bannerAsset: true,
    },
  });

  return apiSuccess(updatedProfile);
}

