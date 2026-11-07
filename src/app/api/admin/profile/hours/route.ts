import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpdateOperatingHoursSchema } from "@/types/validation";
import { apiError, apiSuccess, apiUnauthorized, apiValidationError } from "@/lib/api-response";

/**
 * PATCH /api/admin/profile/hours
 * Updates all 7 days of restaurant operating hours atomically.
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

  const parsed = UpdateOperatingHoursSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  // Validate time logic: if not closed, openTime must be before closeTime
  for (const item of parsed.data) {
    if (!item.isClosed && item.openTime >= item.closeTime) {
      return apiError(
        "INVALID_TIME_RANGE",
        `Close time (${item.closeTime}) must be after open time (${item.openTime}) on day ${item.dayOfWeek}`,
        422
      );
    }
  }

  // Atomically update each day
  await prisma.$transaction(
    parsed.data.map((item) =>
      prisma.operatingHours.upsert({
        where: { dayOfWeek: item.dayOfWeek },
        update: {
          openTime: item.openTime,
          closeTime: item.closeTime,
          isClosed: item.isClosed,
        },
        create: {
          dayOfWeek: item.dayOfWeek,
          openTime: item.openTime,
          closeTime: item.closeTime,
          isClosed: item.isClosed,
        },
      })
    )
  );

  const updatedHours = await prisma.operatingHours.findMany({
    orderBy: { dayOfWeek: "asc" },
  });

  return apiSuccess(updatedHours);
}

