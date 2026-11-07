import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpdateAvailabilitySchema } from "@/types/validation";
import { apiError, apiNotFound, apiSuccess, apiUnauthorized, apiValidationError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/items/[id]/availability
 * 1-Tap "86" Availability Toggle endpoint.
 * Immediately marks a dish as available or sold-out across the platform.
 */
export async function PATCH(request: NextRequest, context: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON", 400);
  }

  const parsed = UpdateAvailabilitySchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const existingItem = await prisma.menuItem.findUnique({
    where: { id },
  });

  if (!existingItem) {
    return apiNotFound("Food item");
  }

  const updatedItem = await prisma.menuItem.update({
    where: { id },
    data: {
      isAvailable: parsed.data.isAvailable,
    },
    select: {
      id: true,
      name: true,
      isAvailable: true,
      categoryId: true,
      updatedAt: true,
    },
  });

  return apiSuccess(updatedItem);
}

