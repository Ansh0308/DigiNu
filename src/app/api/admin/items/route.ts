import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateItemSchema } from "@/types/validation";
import { apiError, apiNotFound, apiSuccess, apiUnauthorized, apiValidationError } from "@/lib/api-response";

/**
 * GET /api/admin/items
 * Returns items matching optional category, search, and availability filters.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get("categoryId") || undefined;
  const search = searchParams.get("search")?.trim() || undefined;
  const status = searchParams.get("status") || "all";

  // Build filter conditions
  const where: Record<string, unknown> = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { shortDescription: { contains: search, mode: "insensitive" } },
    ];
  }

  if (status === "available") {
    where.isAvailable = true;
  } else if (status === "sold_out") {
    where.isAvailable = false;
  }

  const items = await prisma.menuItem.findMany({
    where,
    orderBy: [{ category: { displayOrder: "asc" } }, { displayOrder: "asc" }, { name: "asc" }],
    include: {
      category: {
        select: { id: true, name: true, displayOrder: true },
      },
      imageAsset: true,
    },
  });

  return apiSuccess(items);
}

/**
 * POST /api/admin/items
 * Creates a new food item in the specified category.
 */
export async function POST(request: NextRequest) {
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

  const parsed = CreateItemSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  // Ensure category exists
  const categoryExists = await prisma.menuCategory.findUnique({
    where: { id: parsed.data.categoryId },
  });

  if (!categoryExists) {
    return apiNotFound("Menu category");
  }

  // Calculate default displayOrder within the category if omitted
  let displayOrder = parsed.data.displayOrder;
  if (displayOrder === 0) {
    const highestItem = await prisma.menuItem.findFirst({
      where: { categoryId: parsed.data.categoryId },
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });
    displayOrder = (highestItem?.displayOrder ?? -1) + 1;
  }

  const newItem = await prisma.menuItem.create({
    data: {
      categoryId: parsed.data.categoryId,
      name: parsed.data.name,
      shortDescription: parsed.data.shortDescription ?? null,
      detailedDescription: parsed.data.detailedDescription ?? null,
      price: parsed.data.price,
      isVegetarian: parsed.data.isVegetarian,
      dietaryFlags: parsed.data.dietaryFlags,
      allergenFlags: parsed.data.allergenFlags,
      isAvailable: parsed.data.isAvailable,
      isVisible: parsed.data.isVisible,
      isFeatured: parsed.data.isFeatured,
      displayOrder,
    },
    include: {
      category: {
        select: { id: true, name: true, displayOrder: true },
      },
      imageAsset: true,
    },
  });

  return apiSuccess(newItem, 201);
}

