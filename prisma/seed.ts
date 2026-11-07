import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Starting DigiNu database seed...");

  const restaurantName = process.env.RESTAURANT_NAME || "Bella Italia";
  const restaurantSlug = process.env.RESTAURANT_SLUG || "bella-italia";
  const initialEmail = process.env.INITIAL_OWNER_EMAIL || "owner@bella-italia.com";
  const initialPassword = process.env.INITIAL_OWNER_PASSWORD || "TemporarySecurePassword123!";

  // Production Security Guardrail: Prevent insecure default passwords in live deployments
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.INITIAL_OWNER_PASSWORD || process.env.INITIAL_OWNER_PASSWORD === "TemporarySecurePassword123!")
  ) {
    throw new Error(
      "SECURITY VIOLATION: INITIAL_OWNER_PASSWORD must be explicitly configured with a strong unique credential in production environments."
    );
  }

  // 1. Seed RestaurantProfile Singleton (Development Seed Data)
  const existingProfile = await prisma.restaurantProfile.findFirst();
  if (!existingProfile) {
    await prisma.restaurantProfile.create({
      data: {
        singletonKey: "RESTAURANT_PROFILE_SINGLETON",
        name: restaurantName,
        slug: restaurantSlug,
        tagline: "Artisanal Culinary Heritage & Contemporary Dining (Demo Data)",
        aboutStory: "Crafted with passion, our kitchen celebrates seasonal ingredients and time-honored recipes.",
        address: "124 King Street, Charleston, SC",
        phone: "(843) 555-0199",
        currencyCode: "USD",
        currencySymbol: "$",
        currencyPosition: "PREFIX",
        themePreset: "warm-cream",
        primaryColor: "#C85A32",
        accentColor: "#F59E0B",
        aiCreditsBalance: 30,
        aiCreditsMonthlyLimit: 30,
      },
    });
    console.log(`✅ Seeded RestaurantProfile (Demo Development Seed): ${restaurantName}`);
  } else {
    console.log(`ℹ️ RestaurantProfile already exists: ${existingProfile.name}`);
  }

  // 2. Seed Single OwnerAccount with bcrypt hash (salt rounds = 12)
  const passwordHash = await bcrypt.hash(initialPassword, 12);
  const owner = await prisma.ownerAccount.upsert({
    where: { singletonKey: "OWNER_ACCOUNT_SINGLETON" },
    update: {
      email: initialEmail.toLowerCase().trim(),
      passwordHash,
      isActive: true,
    },
    create: {
      singletonKey: "OWNER_ACCOUNT_SINGLETON",
      email: initialEmail.toLowerCase().trim(),
      passwordHash,
      fullName: "Restaurant General Manager",
      isActive: true,
    },
  });
  console.log(`✅ Seeded Single OwnerAccount: ${owner.email}`);

  // 3. Seed QRCodeConfig Singleton
  const existingQR = await prisma.qRCodeConfig.findFirst();
  if (!existingQR) {
    await prisma.qRCodeConfig.create({
      data: {
        singletonKey: "QR_CODE_CONFIG_SINGLETON",
        foregroundColor: "#000000",
        embedLogo: true,
        dotStyle: "rounded",
        downloadCount: 0,
      },
    });
    console.log("✅ Seeded QRCodeConfig singleton");
  } else {
    console.log("ℹ️ QRCodeConfig singleton already exists");
  }

  // 4. Seed OperatingHours (7 days: Sunday=0 to Saturday=6)
  for (let day = 0; day < 7; day++) {
    await prisma.operatingHours.upsert({
      where: { dayOfWeek: day },
      update: {},
      create: {
        dayOfWeek: day,
        openTime: "11:00",
        closeTime: "22:00",
        isClosed: false,
      },
    });
  }
  console.log("✅ Seeded 7 days OperatingHours (11:00 - 22:00)");

  console.log("🎉 DigiNu database seed completed successfully.");
  process.exit(0);
}

main()
  .catch((e) => {
    console.error("❌ Seed script failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
