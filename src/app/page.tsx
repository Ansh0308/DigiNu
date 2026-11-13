import { Metadata } from "next";
import { getPublicMenuData } from "@/app/api/public/menu/route";
import { PublicMenuExperience } from "@/components/public/PublicMenuExperience";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await getPublicMenuData();
    const { restaurant } = data;
    return {
      title: `${restaurant.name} — Digital Menu`,
      description: restaurant.tagline || `Explore the fresh, artisanal dining menu at ${restaurant.name}.`,
      openGraph: {
        title: `${restaurant.name} — Digital Menu`,
        description: restaurant.tagline || `Explore the fresh, artisanal dining menu at ${restaurant.name}.`,
        images: restaurant.bannerUrl ? [restaurant.bannerUrl] : restaurant.logoUrl ? [restaurant.logoUrl] : [],
      },
    };
  } catch {
    return {
      title: "DigiNu — Digital Restaurant Menu",
      description: "A fast, beautiful, and accessible QR-based digital restaurant menu.",
    };
  }
}

export default async function PublicMenuPage() {
  const data = await getPublicMenuData();
  return <PublicMenuExperience data={data} />;
}
