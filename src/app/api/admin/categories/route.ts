import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CreateCategorySchema } from "@/types/validation";
import { apiError, apiSuccess, apiUnauthorized, apiValidationError } from "@/lib/api-response";

/**
 * GET /api/admin/categories
 * Returns all menu categories ordered by displayOrder with dish counts.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  const categories = await prisma.menuCategory.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });

  return apiSuccess(categories);
}

/**
 * POST /api/admin/categories
 * Creates a new menu category with automatic displayOrder calculation if omitted.
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

  const parsed = CreateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  // If displayOrder not specified, place at the end of the list
  let displayOrder = parsed.data.displayOrder;
  if (displayOrder === 0) {
    const highestOrder = await prisma.menuCategory.findFirst({
      orderBy: { displayOrder: "desc" },
      select: { displayOrder: true },
    });
    displayOrder = (highestOrder?.displayOrder ?? -1) + 1;
  }

  const newCategory = await prisma.menuCategory.create({
    data: {
      name: parsed.data.name,
      subtitle: parsed.data.subtitle ?? null,
      displayOrder,
      isActive: parsed.data.isActive ?? true,
    },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });

  return apiSuccess(newCategory, 201);
}

