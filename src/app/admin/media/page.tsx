import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MediaLibrary } from "./MediaLibrary";

export default async function AdminMediaPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const assets = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      menuItems: {
        select: { id: true, name: true },
      },
      logoProfiles: {
        select: { id: true, name: true },
      },
      bannerProfiles: {
        select: { id: true, name: true },
      },
    },
  });

  return (
    <MediaLibrary
      initialAssets={assets.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
      }))}
    />
  );
}

