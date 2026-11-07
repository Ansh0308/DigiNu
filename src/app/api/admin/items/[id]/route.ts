import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpdateItemSchema } from "@/types/validation";
import { apiError, apiNotFound, apiSuccess, apiUnauthorized, apiValidationError } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/items/[id]
 * Retrieves a single food item with its full relation data.
 */
export async function GET(_request: NextRequest, context: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  const { id } = await context.params;

  const item = await prisma.menuItem.findUnique({
    where: { id },
    include: {
      category: true,
      imageAsset: true,
    },
  });

  if (!item) {
    return apiNotFound("Food item");
  }

  return apiSuccess(item);
}

/**
 * PATCH /api/admin/items/[id]
 * Updates dish properties, descriptions, pricing, and dietary/allergen disclosures.
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

  const parsed = UpdateItemSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const existingItem = await prisma.menuItem.findUnique({
    where: { id },
  });

  if (!existingItem) {
    return apiNotFound("Food item");
  }

  // If categoryId is being changed, ensure target category exists
  if (parsed.data.categoryId && parsed.data.categoryId !== existingItem.categoryId) {
    const categoryExists = await prisma.menuCategory.findUnique({
      where: { id: parsed.data.categoryId },
    });
    if (!categoryExists) {
      return apiNotFound("Target menu category");
    }
  }

  const updatedItem = await prisma.menuItem.update({
    where: { id },
    data: parsed.data,
    include: {
      category: {
        select: { id: true, name: true, displayOrder: true },
      },
      imageAsset: true,
    },
  });

  return apiSuccess(updatedItem);
}

/**
 * DELETE /api/admin/items/[id]
 * Deletes a food item.
 */
export async function DELETE(_request: NextRequest, context: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  const { id } = await context.params;

  const existingItem = await prisma.menuItem.findUnique({
    where: { id },
  });

  if (!existingItem) {
    return apiNotFound("Food item");
  }

  await prisma.menuItem.delete({
    where: { id },
  });

  return apiSuccess({ deletedId: id });
}

