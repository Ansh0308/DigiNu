import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MenuCatalog } from "./MenuCatalog";

export default async function AdminMenuPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const [items, categories, profile] = await Promise.all([
    prisma.menuItem.findMany({
      orderBy: [{ category: { displayOrder: "asc" } }, { displayOrder: "asc" }, { name: "asc" }],
      include: {
        category: {
          select: { id: true, name: true, displayOrder: true },
        },
        imageAsset: {
          select: { url: true },
        },
      },
    }),
    prisma.menuCategory.findMany({
      orderBy: { displayOrder: "asc" },
      select: { id: true, name: true },
    }),
    prisma.restaurantProfile.findFirst({
      select: { currencySymbol: true, currencyPosition: true },
    }),
  ]);

  return (
    <MenuCatalog
      initialItems={items.map((item) => ({
        ...item,
        price: Number(item.price),
      }))}
      categories={categories}
      currencySymbol={profile?.currencySymbol || "$"}
      currencyPosition={profile?.currencyPosition || "PREFIX"}
    />
  );
}

