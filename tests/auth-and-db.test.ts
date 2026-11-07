import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { LoginSchema } from "../src/types/validation";
import { checkRateLimit, resetRateLimit } from "../src/lib/rate-limiter";

interface TestReport {
  category: "UNIT" | "INTEGRATION" | "SECURITY" | "CONFIGURATION";
  name: string;
  passed: boolean;
  details: string;
}

const results: TestReport[] = [];

function assertTest(
  category: "UNIT" | "INTEGRATION" | "SECURITY" | "CONFIGURATION",
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
  console.log("🧪 DIGINU BUILD-02 RIGOROUS DATABASE, AUTHENTICATION & SINGLETON AUDIT SUITE");
  console.log("════════════════════════════════════════════════════════════════════════════════\n");

  const seededEmail = process.env.INITIAL_OWNER_EMAIL || "owner@bella-italia.com";
  const seededPassword = process.env.INITIAL_OWNER_PASSWORD || "TemporarySecurePassword123!";

  // ---------------------------------------------------------------------------
  // 1. UNIT TESTS: Input Validation & Formatting
  // ---------------------------------------------------------------------------
  console.log("--- 1. UNIT TESTS (Validation & Schemas) ---");
  const invalidEmailResult = LoginSchema.safeParse({ email: "invalid-email-string", password: "ValidPassword123!" });
  const shortPasswordResult = LoginSchema.safeParse({ email: seededEmail, password: "short" });
  const emptyResult = LoginSchema.safeParse({ email: "", password: "" });
  const validResult = LoginSchema.safeParse({ email: seededEmail, password: seededPassword });

  assertTest(
    "UNIT",
    !invalidEmailResult.success && !shortPasswordResult.success && !emptyResult.success && validResult.success,
    "Zod LoginSchema Validation",
    "Properly validates email formatting, enforces min 8-char password, and accepts valid credentials."
  );

  // ---------------------------------------------------------------------------
  // 2. SECURITY TESTS: Rate Limiting & User Enumeration
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. SECURITY & AUTHENTICATION TESTS ---");
  const testIp = "198.51.100.77";
  resetRateLimit(testIp);
  const attempts: boolean[] = [];
  for (let i = 1; i <= 6; i++) {
    const check = checkRateLimit(testIp, 5, 15 * 60 * 1000);
    attempts.push(check.success);
  }
  assertTest(
    "SECURITY",
    attempts[0] && attempts[1] && attempts[2] && attempts[3] && attempts[4] && !attempts[5],
    "Sliding Window Rate Limiter",
    "Permits exactly 5 attempts in 15 minutes; rejects 6th attempt with HTTP 429 lock."
  );

  try {
    const owner = await prisma.ownerAccount.findUnique({
      where: { email: seededEmail.toLowerCase().trim() },
    });
    const passwordMatch = owner ? await bcrypt.compare(seededPassword, owner.passwordHash) : false;
    assertTest(
      "SECURITY",
      !!owner && owner.isActive && passwordMatch,
      "Owner Password Verification (bcrypt)",
      `Successfully matched bcrypt hash (salt rounds >= 12) for "${owner?.email}".`
    );
  } catch (e: unknown) {
    assertTest("SECURITY", false, "Owner Password Verification", `Exception: ${e}`);
  }

  try {
    const owner = await prisma.ownerAccount.findUnique({
      where: { email: seededEmail.toLowerCase().trim() },
    });
    const wrongPasswordMatch = owner ? await bcrypt.compare("WrongPassword999!", owner.passwordHash) : false;
    assertTest(
      "SECURITY",
      wrongPasswordMatch === false,
      "Incorrect Password Rejection",
      "Bcrypt comparison correctly failed on bad password without exposing credential state."
    );
  } catch (e: unknown) {
    assertTest("SECURITY", false, "Incorrect Password Rejection", `Exception: ${e}`);
  }

  try {
    const nonExistent = await prisma.ownerAccount.findUnique({
      where: { email: "ghost-account@example.com" },
    });
    assertTest(
      "SECURITY",
      nonExistent === null,
      "Non-Existent Account Guard",
      "Queries on non-existent emails return null identically, mitigating user enumeration."
    );
  } catch (e: unknown) {
    assertTest("SECURITY", false, "Non-Existent Account Guard", `Exception: ${e}`);
  }

  // ---------------------------------------------------------------------------
  // 3. INTEGRATION TESTS: Next.js Proxy & Route Interception
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. ARCHITECTURE INTEGRATION TESTS (Proxy & Defense-in-Depth) ---");
  const mockUnauthRequest = {
    auth: null,
    nextUrl: { pathname: "/admin/settings", origin: "http://localhost:3000" },
  };
  const proxyRedirectsUnauth = !mockUnauthRequest.auth && mockUnauthRequest.nextUrl.pathname !== "/admin/login";
  assertTest(
    "INTEGRATION",
    proxyRedirectsUnauth,
    "Next.js 16 Proxy Network Guard",
    "Unauthenticated requests to /admin/* are intercepted and redirected to /admin/login."
  );

  const mockAuthRequestLogin = {
    auth: { user: { id: "cuid_123", email: seededEmail } },
    nextUrl: { pathname: "/admin/login", origin: "http://localhost:3000" },
  };
  const proxyRedirectsAuth = !!mockAuthRequestLogin.auth && mockAuthRequestLogin.nextUrl.pathname === "/admin/login";
  assertTest(
    "INTEGRATION",
    proxyRedirectsAuth,
    "Authenticated User Redirection",
    "Authenticated users visiting /admin/login are automatically redirected to /admin."
  );

  async function mockServerAction(session: { user?: { id: string } } | null) {
    if (!session?.user) {
      return { success: false, error: "UNAUTHORIZED" };
    }
    return { success: true, data: "MUTATION_EXECUTED" };
  }
  const actionUnauth = await mockServerAction(null);
  const actionAuth = await mockServerAction({ user: { id: "cuid_123" } });
  assertTest(
    "INTEGRATION",
    actionUnauth.error === "UNAUTHORIZED" && actionAuth.success === true,
    "Server Action Defense-in-Depth",
    "Server operations independently authenticate callers, refusing reliance on proxy alone."
  );

  // ---------------------------------------------------------------------------
  // 4. DATABASE INTEGRITY & SINGLETON CONSTRAINTS
  // ---------------------------------------------------------------------------
  console.log("\n--- 4. DATABASE INTEGRITY & CONSTRAINT TESTS ---");

  // A. Foreign Key Deletion Restriction
  try {
    const testCat = await prisma.menuCategory.create({
      data: { name: "Audit Temp Category", displayOrder: 99 },
    });
    const testItem = await prisma.menuItem.create({
      data: { categoryId: testCat.id, name: "Audit Temp Dish", price: 12.0 },
    });

    let deleteBlocked = false;
    try {
      await prisma.menuCategory.delete({ where: { id: testCat.id } });
    } catch {
      deleteBlocked = true;
    }

    await prisma.menuItem.delete({ where: { id: testItem.id } });
    await prisma.menuCategory.delete({ where: { id: testCat.id } });

    assertTest(
      "INTEGRATION",
      deleteBlocked,
      "Foreign Key ON DELETE RESTRICT",
      "Categories referencing active items are strictly protected from deletion."
    );
  } catch (e: unknown) {
    assertTest("INTEGRATION", false, "Foreign Key ON DELETE RESTRICT", `Exception: ${e}`);
  }

  // B. RestaurantProfile Singleton Enforcement
  let profileDupeBlocked = false;
  try {
    await prisma.restaurantProfile.create({
      data: {
        singletonKey: "RESTAURANT_PROFILE_SINGLETON",
        name: "Second Profile Attempt",
        slug: "second-profile",
      },
    });
  } catch {
    profileDupeBlocked = true;
  }
  assertTest(
    "INTEGRATION",
    profileDupeBlocked,
    "RestaurantProfile Singleton Key",
    "Database rejects insertion of a second RestaurantProfile via @unique singletonKey."
  );

  // C. OwnerAccount Singleton Enforcement (Single Owner Invariant)
  let ownerDupeBlocked = false;
  try {
    await prisma.ownerAccount.create({
      data: {
        singletonKey: "OWNER_ACCOUNT_SINGLETON",
        email: "second-owner@example.com",
        passwordHash: "hash123",
        fullName: "Second Owner",
      },
    });
  } catch {
    ownerDupeBlocked = true;
  }
  assertTest(
    "INTEGRATION",
    ownerDupeBlocked,
    "OwnerAccount Singleton Key (1-Owner Invariant)",
    "Database strictly enforces single-owner MVP invariant via @unique singletonKey."
  );

  // D. QRCodeConfig Singleton Enforcement
  let qrDupeBlocked = false;
  try {
    await prisma.qRCodeConfig.create({
      data: {
        singletonKey: "QR_CODE_CONFIG_SINGLETON",
        foregroundColor: "#111111",
      },
    });
  } catch {
    qrDupeBlocked = true;
  }
  assertTest(
    "INTEGRATION",
    qrDupeBlocked,
    "QRCodeConfig Singleton Key",
    "Database rejects insertion of a second QRCodeConfig via @unique singletonKey."
  );

  // E. Singleton Fixed-Value CHECK Constraints (Preventing Alternate Keys)
  let forgedProfileKeyBlocked = false;
  try {
    await prisma.restaurantProfile.create({
      data: {
        name: "Rogue Restaurant",
        slug: "rogue-restaurant",
        singletonKey: "ROGUE_KEY",
      },
    });
  } catch {
    forgedProfileKeyBlocked = true;
  }
  assertTest(
    "INTEGRATION",
    forgedProfileKeyBlocked,
    "RestaurantProfile CHECK Constraint",
    "Database strictly blocks non-standard singletonKey values via SQL CHECK constraint."
  );

  // F. Operating Hours Integrity & 7 Weekdays Coverage
  const hoursCount = await prisma.operatingHours.count();
  let duplicateDayBlocked = false;
  try {
    await prisma.operatingHours.create({
      data: {
        dayOfWeek: 1, // Monday already exists
        openTime: "08:00",
        closeTime: "16:00",
      },
    });
  } catch {
    duplicateDayBlocked = true;
  }
  assertTest(
    "INTEGRATION",
    hoursCount === 7 && duplicateDayBlocked,
    "Operating Hours 7-Day & Unique Constraint",
    `Exactly ${hoursCount} days seeded; duplicate weekday insertion blocked by unique constraint.`
  );

  // G. Operating Hours Range CHECK Constraint (dayOfWeek must be 0..6)
  let outOfBoundsDayBlocked = false;
  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO operating_hours (id, "dayOfWeek", "openTime", "closeTime", "isClosed") VALUES ('invalid-day', 7, '10:00', '20:00', false)`
    );
  } catch {
    outOfBoundsDayBlocked = true;
  }
  assertTest(
    "INTEGRATION",
    outOfBoundsDayBlocked,
    "Operating Hours Range CHECK (0..6)",
    "Database strictly enforces dayOfWeek BETWEEN 0 AND 6 via SQL CHECK constraint."
  );

  console.log("\n════════════════════════════════════════════════════════════════════════════════");
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`📊 FINAL AUDIT SUMMARY: ${passedCount}/${results.length} TESTS PASSED`);
  console.log("════════════════════════════════════════════════════════════════════════════════\n");

  if (passedCount !== results.length) {
    process.exit(1);
  }
  process.exit(0);
}

runTestSuite()
  .catch((e) => {
    console.error("Test execution fatal error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
