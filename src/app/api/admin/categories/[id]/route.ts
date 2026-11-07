import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpdateCategorySchema } from "@/types/validation";
import { apiError, apiNotFound, apiSuccess, apiUnauthorized, apiValidationError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/admin/categories/[id]
 * Updates category details (name, subtitle, isActive, displayOrder).
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

  const parsed = UpdateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const existingCategory = await prisma.menuCategory.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    return apiNotFound("Menu category");
  }

  const updatedCategory = await prisma.menuCategory.update({
    where: { id },
    data: parsed.data,
    include: {
      _count: {
        select: { items: true },
      },
    },
  });

  return apiSuccess(updatedCategory);
}

/**
 * DELETE /api/admin/categories/[id]
 * Safely deletes a category. Rejects with 409 if category has associated food items.
 */
export async function DELETE(_request: NextRequest, context: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  const { id } = await context.params;

  const existingCategory = await prisma.menuCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });

  if (!existingCategory) {
    return apiNotFound("Menu category");
  }

  // Enforce domain safeguard: Category must be empty before deletion
  if (existingCategory._count.items > 0) {
    return apiError(
      "CATEGORY_NOT_EMPTY",
      `Cannot delete category "${existingCategory.name}" because it contains ${existingCategory._count.items} dish(es). Move or delete the dishes before deleting this category.`,
      409,
      { dishCount: existingCategory._count.items }
    );
  }

  await prisma.menuCategory.delete({
    where: { id },
  });

  return apiSuccess({ deletedId: id });
}

