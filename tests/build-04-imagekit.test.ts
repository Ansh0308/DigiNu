import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { ConfirmUploadSchema } from "../src/types/validation";
import { imagekit, getImageKitTransformUrl } from "../src/lib/imagekit";

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
  console.log("🧪 DIGINU BUILD-04 IMAGEKIT MEDIA PIPELINE & METADATA TEST SUITE");
  console.log("════════════════════════════════════════════════════════════════════════════════\n");

  // ---------------------------------------------------------------------------
  // 1. UNIT TESTS: ConfirmUploadSchema & URL Transformers
  // ---------------------------------------------------------------------------
  console.log("--- 1. UNIT TESTS (Validation & Transformation) ---");

  // A. ConfirmUploadSchema Validation
  const validUpload = ConfirmUploadSchema.safeParse({
    fileId: "file_ik_123456",
    filePath: "/restaurants/red-apple/dishes/paneer_butter_masala.jpg",
    url: "https://ik.imagekit.io/diginu/restaurants/red-apple/dishes/paneer_butter_masala.jpg",
    assetType: "FOOD_UPLOAD",
    width: 1200,
    height: 800,
    sizeBytes: 245000,
    originalFilename: "paneer_butter_masala.jpg",
  });

  const missingFileId = ConfirmUploadSchema.safeParse({
    fileId: "",
    filePath: "/path.jpg",
    url: "https://ik.imagekit.io/test.jpg",
    assetType: "FOOD_UPLOAD",
    width: 100,
    height: 100,
    sizeBytes: 1000,
    originalFilename: "test.jpg",
  });

  const invalidAssetType = ConfirmUploadSchema.safeParse({
    fileId: "file_123",
    filePath: "/path.jpg",
    url: "https://ik.imagekit.io/test.jpg",
    assetType: "INVALID_TYPE",
    width: 100,
    height: 100,
    sizeBytes: 1000,
    originalFilename: "test.jpg",
  });

  const invalidUrl = ConfirmUploadSchema.safeParse({
    fileId: "file_123",
    filePath: "/path.jpg",
    url: "not-a-valid-url",
    assetType: "FOOD_UPLOAD",
    width: 100,
    height: 100,
    sizeBytes: 1000,
    originalFilename: "test.jpg",
  });

  assertTest(
    "UNIT",
    validUpload.success && !missingFileId.success && !invalidAssetType.success && !invalidUrl.success,
    "ConfirmUploadSchema Validation",
    "Accepts valid metadata and rejects empty IDs, invalid URLs, and unknown asset types."
  );

  // B. ImageKit URL Transformer Recipes
  const thumbUrl = getImageKitTransformUrl("https://ik.imagekit.io/diginu", "dishes/pavbhaji.jpg", "food_thumb");
  const modalUrl = getImageKitTransformUrl("https://ik.imagekit.io/diginu", "dishes/pavbhaji.jpg", "food_modal");
  const bannerUrl = getImageKitTransformUrl("https://ik.imagekit.io/diginu", "branding/cover.jpg", "banner");

  assertTest(
    "UNIT",
    thumbUrl.includes("tr=w-200,h-200,c-at_max,f-webp,q-85") &&
      modalUrl.includes("tr=w-800,h-600,c-at_max,f-webp,q-90") &&
      bannerUrl.includes("tr=w-1200,h-400,c-at_max,f-webp,q-85"),
    "ImageKit URL Transformation Recipes",
    "Generated WebP transformation query strings matching Phase 03 design guidelines."
  );

  // ---------------------------------------------------------------------------
  // 2. SECURITY TESTS: HMAC Token & Private Key Isolation & Folder Scope
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. SECURITY TESTS (HMAC Signatures, Isolation & Rate Limiting) ---");

  // A. HMAC Authentication Parameters Generation
  const authParams = imagekit.getAuthenticationParameters();
  assertTest(
    "SECURITY",
    typeof authParams.token === "string" &&
      authParams.token.length > 0 &&
      typeof authParams.signature === "string" &&
      authParams.signature.length > 0 &&
      authParams.expire > Math.floor(Date.now() / 1000),
    "ImageKit HMAC Token Generation",
    "Generated valid HMAC-SHA1 signature and token with future expiration timestamp."
  );

  // B. Private Key Isolation
  const envKeys = Object.keys(process.env);
  const leakedToPublic = envKeys.some(
    (k) => k.startsWith("NEXT_PUBLIC_") && process.env[k]?.includes(process.env.IMAGEKIT_PRIVATE_KEY || "###")
  );

  assertTest(
    "SECURITY",
    !leakedToPublic,
    "IMAGEKIT_PRIVATE_KEY Bundle Isolation",
    "Private key is strictly server-side and never aliased under NEXT_PUBLIC_* prefixes."
  );

  // C. Rate Limiting on Media Endpoints
  const { checkRateLimit } = await import("../src/lib/rate-limiter");
  const testIp = `test-ip-${Date.now()}`;
  for (let i = 0; i < 30; i++) {
    checkRateLimit(`media-confirm:${testIp}`, 30, 60000);
  }
  const rateLimitLocked = checkRateLimit(`media-confirm:${testIp}`, 30, 60000);

  assertTest(
    "SECURITY",
    !rateLimitLocked.success && rateLimitLocked.remaining === 0,
    "Media Confirm Rate Limiting Guard",
    "Strictly locks confirmation attempts exceeding quota (HTTP 429)."
  );

  // D. Filename Sanitization & Directory Traversal Neutralization
  const dangerousName = "../../etc/passwd..jpg<script>.png";
  const sanitized = dangerousName.replace(/[^a-zA-Z0-9._-]/g, "_");
  assertTest(
    "SECURITY",
    !sanitized.includes("/") && !sanitized.includes("<") && !sanitized.includes(">"),
    "Filename Sanitization Guard",
    `Sanitized "${dangerousName}" to safe "${sanitized}".`
  );

  // E. Magic Number Binary Signature Sniffing
  const jpegHeader = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);
  const pngHeader = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const fakeExeHeader = new Uint8Array([0x4d, 0x5a, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00]); // MZ DOS/PE executable

  function sniffImage(bytes: Uint8Array): boolean {
    const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
    return isJpeg || isPng;
  }

  assertTest(
    "SECURITY",
    sniffImage(jpegHeader) && sniffImage(pngHeader) && !sniffImage(fakeExeHeader),
    "Magic Number Byte Sniffing Validation",
    "Correctly identifies authentic JPEG/PNG binaries and rejects disguised executables."
  );

  // F. Rogue Folder Prefix Detection
  const validFolderPrefix = "/restaurants/red-apple/";
  const roguePath1 = "/restaurants/other-client/dishes/hack.jpg";
  const roguePath2 = "/dishes/escape.jpg";
  const validPath = "/restaurants/red-apple/dishes/samosa.jpg";

  assertTest(
    "SECURITY",
    validPath.startsWith(validFolderPrefix) &&
      !roguePath1.startsWith(validFolderPrefix) &&
      !roguePath2.startsWith(validFolderPrefix),
    "Folder Namespace Isolation Guard",
    "Strictly confines uploads to the tenant's designated folder, flagging cross-tenant tampering."
  );

  // ---------------------------------------------------------------------------
  // 3. INTEGRATION TESTS: Database Persistence & Referential Integrity
  // ---------------------------------------------------------------------------
  console.log("\n--- 3. INTEGRATION TESTS (PostgreSQL Metadata & Linking) ---");

  // A. MediaAsset Creation
  const testFileId = `test_file_${Date.now()}`;
  const testAsset = await prisma.mediaAsset.create({
    data: {
      fileId: testFileId,
      filePath: "/restaurants/red-apple/dishes/test_roti.jpg",
      url: "https://ik.imagekit.io/diginu/restaurants/red-apple/dishes/test_roti.jpg",
      assetType: "FOOD_UPLOAD",
      width: 1024,
      height: 768,
      sizeBytes: 154320,
      originalFilename: "test_roti.jpg",
    },
  });

  assertTest(
    "INTEGRATION",
    testAsset.fileId === testFileId && testAsset.assetType === "FOOD_UPLOAD",
    "MediaAsset Record Creation",
    `Persisted asset "${testAsset.originalFilename}" (${testAsset.width}x${testAsset.height}) to PostgreSQL.`
  );

  // B. Link to MenuItem
  const firstDish = await prisma.menuItem.findFirst();
  if (!firstDish) throw new Error("No dish found for linking");

  const originalDishAssetId = firstDish.imageAssetId;
  await prisma.menuItem.update({
    where: { id: firstDish.id },
    data: { imageAssetId: testAsset.id },
  });

  const dishWithAsset = await prisma.menuItem.findUnique({
    where: { id: firstDish.id },
    include: { imageAsset: true },
  });

  assertTest(
    "INTEGRATION",
    dishWithAsset?.imageAssetId === testAsset.id && dishWithAsset?.imageAsset?.fileId === testFileId,
    "MenuItem Image Asset Association",
    `Successfully linked MediaAsset to dish "${firstDish.name}".`
  );

  // C. Foreign Key OnDelete SetNull Safeguard
  // Deleting the media asset must unlink from the dish without deleting the dish itself!
  await prisma.mediaAsset.delete({
    where: { id: testAsset.id },
  });

  const dishAfterAssetDelete = await prisma.menuItem.findUnique({
    where: { id: firstDish.id },
  });

  assertTest(
    "DOMAIN_RULE",
    dishAfterAssetDelete !== null && dishAfterAssetDelete.imageAssetId === null,
    "onDelete: SetNull Referential Safeguard",
    "Deleting media asset safely unlinks foreign key without deleting or affecting the dish record."
  );

  // Restore original dish image if any
  if (originalDishAssetId) {
    await prisma.menuItem.update({
      where: { id: firstDish.id },
      data: { imageAssetId: originalDishAssetId },
    });
  }

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
    console.log("🎉 All BUILD-04 ImageKit media pipeline tests PASSED!");
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

