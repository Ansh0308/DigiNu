import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DishForm } from "@/components/admin/DishForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditDishPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const [dish, categories, profile] = await Promise.all([
    prisma.menuItem.findUnique({
      where: { id },
      include: { imageAsset: true },
    }),
    prisma.menuCategory.findMany({
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.restaurantProfile.findFirst({
      select: { currencySymbol: true, currencyPosition: true },
    }),
  ]);

  if (!dish) {
    notFound();
  }

  return (
    <DishForm
      categories={categories}
      currencySymbol={profile?.currencySymbol || "$"}
      currencyPosition={profile?.currencyPosition || "PREFIX"}
      initialData={{
        id: dish.id,
        categoryId: dish.categoryId,
        name: dish.name,
        shortDescription: dish.shortDescription || "",
        detailedDescription: dish.detailedDescription || "",
        price: Number(dish.price),
        isVegetarian: dish.isVegetarian,
        dietaryFlags: dish.dietaryFlags,
        allergenFlags: dish.allergenFlags,
        isAvailable: dish.isAvailable,
        isVisible: dish.isVisible,
        isFeatured: dish.isFeatured,
        displayOrder: dish.displayOrder,
        imageAssetId: dish.imageAssetId,
        imageUrl: dish.imageAsset?.url || null,
      }}
      mode="edit"
    />
  );
}

