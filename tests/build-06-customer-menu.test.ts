import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { calculateOperatingStatus, formatTime12h, OperatingHourRecord } from "../src/lib/hours-calculator";
import { parseDietaryFlags, buildImageKitTransform, sanitizePublicMenuData } from "../src/lib/sanitizer";
import { getPublicMenuData, GET, POST, PUT, DELETE, PATCH } from "../src/app/api/public/menu/route";

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
  console.log("🧪 DIGINU BUILD-06 PUBLIC CUSTOMER MENU & READ-ONLY PIPELINE TEST SUITE");
  console.log("════════════════════════════════════════════════════════════════════════════════\n");

  // ---------------------------------------------------------------------------
  // 1. UNIT TESTS: Hours Calculator & Time Formatting
  // ---------------------------------------------------------------------------
  console.log("--- 1. UNIT TESTS (Hours Calculator & Time Formatting) ---");

  // A. formatTime12h
  const t1 = formatTime12h("11:00");
  const t2 = formatTime12h("22:30");
  const t3 = formatTime12h("00:00");
  const t4 = formatTime12h("12:15");
  assertTest("UNIT", t1 === "11:00 AM" && t2 === "10:30 PM" && t3 === "12:00 AM" && t4 === "12:15 PM", "formatTime12h accuracy", `Got: 11:00->${t1}, 22:30->${t2}, 00:00->${t3}, 12:15->${t4}`);

  // Mock standard schedule (Mon-Fri 11:00 to 22:00, Sat 12:00 to 23:00, Sun Closed)
  const mockHours: OperatingHourRecord[] = [
    { dayOfWeek: 0, openTime: "11:00", closeTime: "22:00", isClosed: true }, // Sun Closed
    { dayOfWeek: 1, openTime: "11:00", closeTime: "22:00", isClosed: false }, // Mon Open
    { dayOfWeek: 2, openTime: "11:00", closeTime: "22:00", isClosed: false }, // Tue Open
    { dayOfWeek: 3, openTime: "11:00", closeTime: "22:00", isClosed: false }, // Wed Open
    { dayOfWeek: 4, openTime: "11:00", closeTime: "22:00", isClosed: false }, // Thu Open
    { dayOfWeek: 5, openTime: "11:00", closeTime: "22:00", isClosed: false }, // Fri Open
    { dayOfWeek: 6, openTime: "12:00", closeTime: "23:00", isClosed: false }, // Sat Open
  ];

  // B. During open hours (Monday at 14:30)
  const mondayMidday = new Date("2026-11-02T14:30:00"); // Monday
  const statusOpen = calculateOperatingStatus(mockHours, mondayMidday);
  assertTest("DOMAIN_RULE", statusOpen.isOpenNow === true && statusOpen.statusColor === "green", "calculateOperatingStatus (Open)", `Monday 14:30 status: ${statusOpen.statusBadgeText}`);

  // C. Before open hours (Monday at 09:00)
  const mondayMorning = new Date("2026-11-02T09:00:00"); // Monday
  const statusBefore = calculateOperatingStatus(mockHours, mondayMorning);
  assertTest("DOMAIN_RULE", statusBefore.isOpenNow === false && statusBefore.statusBadgeText.includes("Opens at 11:00 AM"), "calculateOperatingStatus (Before Open)", `Monday 09:00 status: ${statusBefore.statusBadgeText}`);

  // D. Closing soon (Monday at 21:45 — 15 mins before 22:00)
  const mondayNight = new Date("2026-11-02T21:45:00"); // Monday
  const statusClosingSoon = calculateOperatingStatus(mockHours, mondayNight);
  assertTest("DOMAIN_RULE", statusClosingSoon.isOpenNow === true && statusClosingSoon.statusColor === "amber", "calculateOperatingStatus (Closing Soon)", `Monday 21:45 status: ${statusClosingSoon.statusBadgeText}`);

  // E. Closed Day (Sunday at 15:00)
  const sundayAfternoon = new Date("2026-11-01T15:00:00"); // Sunday
  const statusSunday = calculateOperatingStatus(mockHours, sundayAfternoon);
  assertTest("DOMAIN_RULE", statusSunday.isOpenNow === false && Boolean(statusSunday.nextOpeningText?.includes("tomorrow at 11:00 AM")), "calculateOperatingStatus (Closed Day)", `Sunday status: ${statusSunday.statusBadgeText}`);

  // ---------------------------------------------------------------------------
  // 2. UNIT TESTS: Dietary & ImageKit Sanitization
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. UNIT TESTS (Dietary & ImageKit Sanitization) ---");

  // A. parseDietaryFlags
  const flags = parseDietaryFlags(true, ["GLUTEN_FREE", "VEGAN", "HALAL", "SPICY"]);
  assertTest(
    "UNIT",
    flags.isVegetarian === true && flags.isGlutenFree === true && flags.isVegan === true && flags.isHalal === true && flags.spicyLevel === 2,
    "parseDietaryFlags parsing",
    `Veg:${flags.isVegetarian}, GF:${flags.isGlutenFree}, Vegan:${flags.isVegan}, Halal:${flags.isHalal}, SpicyLvl:${flags.spicyLevel}`
  );

  // B. buildImageKitTransform
  const rawIk = "https://ik.imagekit.io/diginu/restaurants/test/dish.webp";
  const transformed = buildImageKitTransform(rawIk, "w-400,h-300,fo-auto,q-80");
  assertTest(
    "UNIT",
    transformed === "https://ik.imagekit.io/diginu/restaurants/test/dish.webp?tr=w-400,h-300,fo-auto,q-80",
    "buildImageKitTransform URL",
    `Transformed: ${transformed}`
  );

  // C. buildImageKitTransform ignores non-ImageKit URLs
  const externalUrl = "https://images.unsplash.com/photo-123456";
  const unTransformed = buildImageKitTransform(externalUrl, "w-400");
  assertTest("UNIT", unTransformed === externalUrl, "buildImageKitTransform non-IK pass-through", `Got: ${unTransformed}`);

  // ---------------------------------------------------------------------------
  // 3. SECURITY & PII TESTS: Data Sanitization
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. SECURITY & PII TESTS (Sanitization & Exclusion) ---");

  const sanitized = sanitizePublicMenuData({
    profile: {
      name: "The Royal Spice",
      tagline: "Finest Indian Dining",
      aboutStory: "Traditional heritage recipes",
      address: "123 Curry Lane",
      phone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
      currencyCode: "INR",
      currencySymbol: "₹",
      currencyPosition: "PREFIX",
      themePreset: "warm-cream",
      primaryColor: "#C85A32",
      accentColor: "#F59E0B",
    },
    operatingStatus: {
      isOpenNow: true,
      todayHoursText: "11:00 AM – 10:00 PM",
      statusBadgeText: "Open Now",
    },
    hours: mockHours,
    categories: [
      {
        id: "cat_1",
        name: "Biryani & Rice",
        subtitle: "Aromatic dum preparation",
        displayOrder: 1,
        items: [
          {
            id: "item_1",
            name: "Paneer Biryani",
            shortDescription: "Aromatic basmati rice cooked with fresh paneer",
            detailedDescription: "Layered basmati with saffron and spices",
            price: 160.0,
            isVegetarian: true,
            dietaryFlags: ["VEG", "GLUTEN_FREE"],
            allergenFlags: ["DAIRY"],
            isAvailable: true,
            isFeatured: true,
          },
          {
            id: "item_2",
            name: "Mutton Biryani",
            shortDescription: "Slow-cooked tender goat meat",
            detailedDescription: null,
            price: 240.0,
            isVegetarian: false,
            dietaryFlags: ["HALAL"],
            allergenFlags: [],
            isAvailable: false, // 86 sold out
            isFeatured: false,
          },
        ],
      },
    ],
  });

  // A. PII Verification
  const jsonString = JSON.stringify(sanitized);
  const containsEmail = jsonString.includes("@") && !jsonString.includes("images");
  const containsPassword = jsonString.includes("password") || jsonString.includes("hash");
  assertTest("SECURITY", !containsEmail && !containsPassword, "Zero PII Leakage in Sanitized Payload", "No owner email, passwords or hashes exposed");

  // B. 86 Sold-out flag preservation
  const item1 = sanitized.categories[0].items[0];
  const item2 = sanitized.categories[0].items[1];
  assertTest("DOMAIN_RULE", item1.isAvailable === true && item2.isAvailable === false, "86-Sold Out State Preserved", `Item 1 available: ${item1.isAvailable}, Item 2 available: ${item2.isAvailable}`);

  // ---------------------------------------------------------------------------
  // 4. INTEGRATION TESTS: Live Database Query & API Handler
  // ---------------------------------------------------------------------------
  console.log("\n--- 4. INTEGRATION TESTS (Database & Public Route) ---");

  // A. Live getPublicMenuData()
  const publicData = await getPublicMenuData();
  assertTest(
    "INTEGRATION",
    Boolean(publicData.restaurant.name) && Array.isArray(publicData.categories),
    "getPublicMenuData() execution",
    `Loaded restaurant: "${publicData.restaurant.name}", categories: ${publicData.categories.length}`
  );

  // B. GET /api/public/menu endpoint
  const getResponse = await GET();
  const getBody = await getResponse.json();
  const cacheHeader = getResponse.headers.get("Cache-Control");

  assertTest(
    "INTEGRATION",
    getResponse.status === 200 && getBody.success === true && cacheHeader?.includes("s-maxage=60") === true,
    "GET /api/public/menu Edge Caching Header",
    `Status: ${getResponse.status}, Cache-Control: ${cacheHeader}`
  );

  // C. Mutation methods rejection (405 Method Not Allowed)
  const postRes = await POST();
  const putRes = await PUT();
  const deleteRes = await DELETE();
  const patchRes = await PATCH();

  assertTest(
    "SECURITY",
    postRes.status === 405 && putRes.status === 405 && deleteRes.status === 405 && patchRes.status === 405,
    "Public Route Read-Only Enforcement (405 on Mutations)",
    `POST: ${postRes.status}, PUT: ${putRes.status}, DELETE: ${deleteRes.status}, PATCH: ${patchRes.status}`
  );

  // ---------------------------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------------------------
  console.log("\n════════════════════════════════════════════════════════════════════════════════");
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`📊 TEST RESULTS: ${passedCount} PASSED / ${failedCount} FAILED (TOTAL: ${results.length})`);
  console.log("════════════════════════════════════════════════════════════════════════════════\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite()
  .catch((err) => {
    console.error("Fatal test runner error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
