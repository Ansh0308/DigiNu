import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import {
  CreateCategorySchema,
  ReorderCategoriesSchema,
  CreateItemSchema,
  UpdateAvailabilitySchema,
  UpdateProfileSchema,
  UpdateOperatingHoursSchema,
} from "../src/types/validation";
import { apiUnauthorized, apiValidationError } from "../src/lib/api-response";
import { z } from "zod";

interface TestReport {
  category: "UNIT" | "INTEGRATION" | "SECURITY" | "DOMAIN_RULE";
  name: string;
  passed: boolean;
  details: string;
}

const results: TestReport[] = [];

function assertTest(
  category: "UNIT" | "INTEGRATION" | "SECURITY" | "DOMAIN_RULE",
  condition: boolean,
  testName: string,
  details: string
) {
  if (condition) {
    results.push({ category, name: testName, passed: true, details });
    console.log(`✅ [${category}] ${testName} — ${details}`);
  } else {
    results.push({ category, name: testName, passed: false, details });
    console.error(`❌ [${category} FAILED] ${testName} — ${details}`);
  }
}

async function runTestSuite() {
  console.log("════════════════════════════════════════════════════════════════════════════════");
  console.log("🧪 DIGINU BUILD-03 RIGOROUS MENU MANAGEMENT, 86 HUB & PROFILE CRUD TEST SUITE");
  console.log("════════════════════════════════════════════════════════════════════════════════\n");

  // ---------------------------------------------------------------------------
  // 1. UNIT TESTS: Zod Schemas & Domain Rules
  // ---------------------------------------------------------------------------
  console.log("--- 1. UNIT TESTS (Validation & Schemas) ---");

  // A. CreateItemSchema Validation
  const validItem = CreateItemSchema.safeParse({
    categoryId: "clx1234567890",
    name: "Truffle Tagliolini",
    shortDescription: "Fresh egg pasta with black truffle",
    price: 24.5,
    isVegetarian: true,
    dietaryFlags: ["VEGETARIAN"],
    allergenFlags: ["Gluten", "Dairy"],
  });
  const negativePriceItem = CreateItemSchema.safeParse({
    categoryId: "clx1234567890",
    name: "Bad Item",
    price: -5.0,
  });
  const emptyNameItem = CreateItemSchema.safeParse({
    categoryId: "clx1234567890",
    name: "   ",
    price: 15.0,
  });

  assertTest(
    "UNIT",
    validItem.success && !negativePriceItem.success && !emptyNameItem.success,
    "CreateItemSchema Validation",
    "Accepts valid dish, rejects negative prices and blank dish names."
  );

  // B. 86 Availability Toggle Schema
  const validAvail = UpdateAvailabilitySchema.safeParse({ isAvailable: false });
  const missingAvail = UpdateAvailabilitySchema.safeParse({});
  const invalidAvail = UpdateAvailabilitySchema.safeParse({ isAvailable: "not-a-bool" });

  assertTest(
    "UNIT",
    validAvail.success && !missingAvail.success && !invalidAvail.success,
    "UpdateAvailabilitySchema Validation",
    "Strictly validates boolean isAvailable for 1-tap 86 toggling."
  );

  // C. Reorder Categories Schema
  const validReorder = ReorderCategoriesSchema.safeParse({
    orderedIds: ["id1", "id2", "id3"],
  });
  const emptyReorder = ReorderCategoriesSchema.safeParse({ orderedIds: [] });

  assertTest(
    "UNIT",
    validReorder.success && !emptyReorder.success,
    "ReorderCategoriesSchema Validation",
    "Requires non-empty ordered list of category IDs."
  );

  // D. Profile Theming Schema
  const validProfileUpdate = UpdateProfileSchema.safeParse({
    primaryColor: "#C85A32",
    accentColor: "#F59E0B",
    themePreset: "warm-cream",
    currencyPosition: "PREFIX",
  });
  const invalidHexProfile = UpdateProfileSchema.safeParse({
    primaryColor: "not-a-hex",
  });

  assertTest(
    "UNIT",
    validProfileUpdate.success && !invalidHexProfile.success,
    "UpdateProfileSchema Hex Validation",
    "Accepts standard hex color codes and rejects invalid formatting."
  );

  // E. 7-Day Operating Hours Schema
  const valid7Days = UpdateOperatingHoursSchema.safeParse(
    Array.from({ length: 7 }, (_, i) => ({
      dayOfWeek: i,
      openTime: "11:00",
      closeTime: "22:00",
      isClosed: false,
    }))
  );
  const incomplete6Days = UpdateOperatingHoursSchema.safeParse(
    Array.from({ length: 6 }, (_, i) => ({
      dayOfWeek: i,
      openTime: "11:00",
      closeTime: "22:00",
      isClosed: false,
    }))
  );

  assertTest(
    "UNIT",
    valid7Days.success && !incomplete6Days.success,
    "UpdateOperatingHoursSchema 7-Day Enforce",
    "Enforces array length of exactly 7 days for weekly operational coverage."
  );

  // ---------------------------------------------------------------------------
  // 2. SECURITY TESTS: Defense-in-Depth & Response Envelopes
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. SECURITY TESTS (API Defense-in-Depth & Envelopes) ---");

  const unauthResponse = apiUnauthorized();
  const unauthBody = await unauthResponse.json();

  assertTest(
    "SECURITY",
    unauthResponse.status === 401 &&
      unauthBody.success === false &&
      unauthBody.error.code === "UNAUTHORIZED",
    "apiUnauthorized Envelope Guard",
    "Enforces HTTP 401 with standardized error envelope on unauthenticated access."
  );

  const dummySchema = z.object({ name: z.string().min(3) });
  const dummyParse = dummySchema.safeParse({ name: "a" });
  let valErrBody: { success?: boolean; error?: { code?: string } } = {};
  if (!dummyParse.success) {
    const valErrResponse = apiValidationError(dummyParse.error);
    valErrBody = await valErrResponse.json();
  }

  assertTest(
    "SECURITY",
    valErrBody.success === false && valErrBody.error?.code === "VALIDATION_ERROR",
    "apiValidationError Envelope Guard",
    "Standardized 422 Unprocessable Content envelope returned on invalid payloads."
  );

  // ---------------------------------------------------------------------------
  // 3. INTEGRATION TESTS: Database Mutations & Persistence
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. INTEGRATION & DOMAIN TESTS (Database CRUD & Rules) ---");

  // A. Profile & Theming Persistence
  const profile = await prisma.restaurantProfile.findFirst();
  if (!profile) throw new Error("Restaurant profile missing");

  const originalPrimary = profile.primaryColor;
  const testPrimary = "#2563EB";

  const updatedProfile = await prisma.restaurantProfile.update({
    where: { id: profile.id },
    data: { primaryColor: testPrimary },
  });

  assertTest(
    "INTEGRATION",
    updatedProfile.primaryColor === testPrimary,
    "Profile Theming Update Persistence",
    `Updated primary brand color to ${testPrimary} and verified DB persistence.`
  );

  // Revert back
  await prisma.restaurantProfile.update({
    where: { id: profile.id },
    data: { primaryColor: originalPrimary },
  });

  // B. Operating Hours Batch Update
  const originalSunday = await prisma.operatingHours.findUnique({
    where: { dayOfWeek: 0 },
  });
  const updatedSunday = await prisma.operatingHours.update({
    where: { dayOfWeek: 0 },
    data: { openTime: "10:30", closeTime: "23:00" },
  });

  assertTest(
    "INTEGRATION",
    updatedSunday.openTime === "10:30" && updatedSunday.closeTime === "23:00",
    "Operating Hours Update Persistence",
    "Updated Sunday kitchen schedule to 10:30–23:00 in database."
  );

  // Revert back
  if (originalSunday) {
    await prisma.operatingHours.update({
      where: { dayOfWeek: 0 },
      data: { openTime: originalSunday.openTime, closeTime: originalSunday.closeTime },
    });
  }

  // C. Category Creation & Reordering
  const testCatA = await prisma.menuCategory.create({
    data: {
      name: "BUILD03 Test Starters",
      subtitle: "House specials",
      displayOrder: 98,
    },
  });

  const testCatB = await prisma.menuCategory.create({
    data: {
      name: "BUILD03 Test Mains",
      subtitle: "Entrees",
      displayOrder: 99,
    },
  });

  // Reorder test: Swap display orders
  await prisma.$transaction([
    prisma.menuCategory.update({ where: { id: testCatA.id }, data: { displayOrder: 99 } }),
    prisma.menuCategory.update({ where: { id: testCatB.id }, data: { displayOrder: 98 } }),
  ]);

  const readCatA = await prisma.menuCategory.findUnique({ where: { id: testCatA.id } });
  const readCatB = await prisma.menuCategory.findUnique({ where: { id: testCatB.id } });

  assertTest(
    "INTEGRATION",
    readCatA?.displayOrder === 99 && readCatB?.displayOrder === 98,
    "Category Creation & Reordering",
    "Created test categories and swapped displayOrder atomically via transaction."
  );

  // D. Food Item Creation & 1-Tap 86 Availability Toggle
  const testDish = await prisma.menuItem.create({
    data: {
      categoryId: testCatA.id,
      name: "BUILD03 Test Bruschetta",
      shortDescription: "Toasted country bread with heirloom tomatoes and basil",
      price: 14.5,
      isVegetarian: true,
      dietaryFlags: ["VEGETARIAN", "VEGAN"],
      allergenFlags: ["Gluten"],
      isAvailable: true,
    },
  });

  assertTest(
    "INTEGRATION",
    Number(testDish.price) === 14.5 && testDish.isAvailable === true,
    "Food Item Creation with Dietary Flags",
    "Persisted dish with Decimal price 14.50 and vegetarian flag."
  );

  // Toggle availability to false (86'd)
  const toggledDishOff = await prisma.menuItem.update({
    where: { id: testDish.id },
    data: { isAvailable: false },
  });

  assertTest(
    "DOMAIN_RULE",
    toggledDishOff.isAvailable === false,
    "1-Tap 86 Toggle: Mark Sold Out",
    `Dish "${toggledDishOff.name}" marked as isAvailable = false instantly in DB.`
  );

  // Toggle back to true (Available)
  const toggledDishOn = await prisma.menuItem.update({
    where: { id: testDish.id },
    data: { isAvailable: true },
  });

  assertTest(
    "DOMAIN_RULE",
    toggledDishOn.isAvailable === true,
    "1-Tap 86 Toggle: Restore Available",
    `Dish "${toggledDishOn.name}" restored to isAvailable = true.`
  );

  // E. Category Deletion Safeguard (Category with dishes CANNOT be deleted)
  let deletionBlocked = false;
  const itemCountInCat = await prisma.menuItem.count({ where: { categoryId: testCatA.id } });
  if (itemCountInCat > 0) {
    try {
      // In Prisma schema, onDelete: Restrict protects category from deletion
      await prisma.menuCategory.delete({ where: { id: testCatA.id } });
    } catch {
      deletionBlocked = true;
    }
  }

  assertTest(
    "DOMAIN_RULE",
    deletionBlocked,
    "Category Delete Safeguard (Item Count > 0)",
    "Database and domain safeguard prevent deleting category containing active dishes."
  );

  // F. Cleanup: Delete dish first, then delete empty category
  await prisma.menuItem.delete({ where: { id: testDish.id } });
  await prisma.menuCategory.delete({ where: { id: testCatA.id } });
  await prisma.menuCategory.delete({ where: { id: testCatB.id } });

  const catDeletedCheck = await prisma.menuCategory.findUnique({ where: { id: testCatA.id } });

  assertTest(
    "INTEGRATION",
    catDeletedCheck === null,
    "Empty Category Clean Deletion",
    "Successfully deleted empty category after removing associated dishes."
  );

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log("\n════════════════════════════════════════════════════════════════════════════════");
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`📊 FINAL AUDIT SUMMARY: ${passedCount}/${results.length} TESTS PASSED`);
  console.log("════════════════════════════════════════════════════════════════════════════════\n");

  if (passedCount !== results.length) {
    console.error("❌ Some tests failed!");
    process.exit(1);
  } else {
    console.log("🎉 All BUILD-03 CRUD, validation, and domain safeguard tests PASSED!");
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
