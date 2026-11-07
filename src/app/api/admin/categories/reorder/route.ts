import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReorderCategoriesSchema } from "@/types/validation";
import { apiError, apiSuccess, apiUnauthorized, apiValidationError } from "@/lib/api-response";

/**
 * PUT /api/admin/categories/reorder
 * Atomically updates the displayOrder of categories according to array order.
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

  const parsed = ReorderCategoriesSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { orderedIds } = parsed.data;

  // Execute displayOrder update in a single transaction
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.menuCategory.update({
        where: { id },
        data: { displayOrder: index },
      })
    )
  );

  const updatedCategories = await prisma.menuCategory.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });

  return apiSuccess(updatedCategories);
}

