import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReorderItemsSchema } from "@/types/validation";
import { apiError, apiSuccess, apiUnauthorized, apiValidationError } from "@/lib/api-response";

/**
 * PUT /api/admin/items/reorder
 * Atomically updates the displayOrder of items within a category according to array order.
 */
export async function PUT(request: NextRequest) {
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

  const parsed = ReorderItemsSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { orderedIds } = parsed.data;

  // Execute displayOrder update in a single transaction
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.menuItem.update({
        where: { id },
        data: { displayOrder: index },
      })
    )
  );

  return apiSuccess({ updatedCount: orderedIds.length });
}

