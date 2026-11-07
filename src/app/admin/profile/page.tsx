import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./ProfileForm";

export default async function AdminProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const [profile, operatingHours] = await Promise.all([
    prisma.restaurantProfile.findFirst(),
    prisma.operatingHours.findMany({
      orderBy: { dayOfWeek: "asc" },
    }),
  ]);

  if (!profile) {
    throw new Error("Restaurant profile record not initialized");
  }

  return (
    <ProfileForm
      initialProfile={{
        id: profile.id,
        name: profile.name,
        slug: profile.slug,
        tagline: profile.tagline,
        aboutStory: profile.aboutStory,
        address: profile.address,
        phone: profile.phone,
        whatsapp: profile.whatsapp,
        currencyCode: profile.currencyCode,
        currencySymbol: profile.currencySymbol,
        currencyPosition: profile.currencyPosition,
        themePreset: profile.themePreset,
        primaryColor: profile.primaryColor,
        accentColor: profile.accentColor,
      }}
      initialHours={operatingHours.map((h) => ({
        id: h.id,
        dayOfWeek: h.dayOfWeek,
        openTime: h.openTime,
        closeTime: h.closeTime,
        isClosed: h.isClosed,
      }))}
    />
  );
}

