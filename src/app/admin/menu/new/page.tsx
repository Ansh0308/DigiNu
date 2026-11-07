import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DishForm } from "@/components/admin/DishForm";

export default async function NewDishPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const [categories, profile] = await Promise.all([
    prisma.menuCategory.findMany({
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.restaurantProfile.findFirst({
      select: { currencySymbol: true, currencyPosition: true },
    }),
  ]);

  if (categories.length === 0) {
    redirect("/admin/categories");
  }

  return (
    <DishForm
      categories={categories}
      currencySymbol={profile?.currencySymbol || "$"}
      currencyPosition={profile?.currencyPosition || "PREFIX"}
      mode="create"
    />
  );
}

