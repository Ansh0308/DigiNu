import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CategoryManager } from "./CategoryManager";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const categories = await prisma.menuCategory.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });

  return <CategoryManager initialCategories={categories} />;
}

