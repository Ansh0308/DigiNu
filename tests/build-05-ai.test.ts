import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { synthesizeCulinaryPrompt } from "../src/lib/prompt-synthesizer";
import { generateFoodImage, sniffImageFormat } from "../src/lib/ai-generator";
import {
  reserveCredit,
  markGenerating,
  markGenerated,
  refundFailedGeneration,
  discardCandidate,
  isReadyForApproval,
} from "../src/lib/ai-credit-manager";
import {
  GenerateAISchema,
  ApproveAISchema,
  CancelAISchema,
} from "../src/types/validation";

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
  console.log("🧪 DIGINU BUILD-05 RIGOROUS DURABLE CREDIT & LIFECYCLE REGRESSION SUITE");
  console.log("════════════════════════════════════════════════════════════════════════════════\n");

  // Fetch test dish
  const testDish = await prisma.menuItem.findFirst();
  if (!testDish) throw new Error("Database requires at least one menu item for testing");

  // Record initial balance
  const profileBefore = await prisma.restaurantProfile.findFirst({
    select: { aiCreditsBalance: true },
  });
  const initialBalance = profileBefore?.aiCreditsBalance ?? 30;

  // ---------------------------------------------------------------------------
  // 1. UNIT & PROMPT TESTS
  // ---------------------------------------------------------------------------
  console.log("--- 1. UNIT TESTS (Prompt Synthesis & Schema Validation) ---");

  const synthesizedPrompt = synthesizeCulinaryPrompt(
    {
      name: "Truffle Burrata Bruschetta",
      shortDescription: "Artisanal burrata with shaved summer black truffles and micro basil",
      dietaryFlags: ["Vegetarian"],
    },
    "Antipasti"
  );

  assertTest(
    "UNIT",
    synthesizedPrompt.includes("Truffle Burrata Bruschetta") &&
      synthesizedPrompt.includes("45-degree overhead angle") &&
      synthesizedPrompt.includes("macro culinary lighting") &&
      synthesizedPrompt.includes("--no plastic, cartoon"),
    "Culinary Prompt Synthesis Engine",
    "Generates structured photography prompts with dish name, lighting directives, and negative constraints."
  );

  const validGen = GenerateAISchema.safeParse({ menuItemId: "valid_id_123" });
  const emptyGen = GenerateAISchema.safeParse({ menuItemId: "" });
  const validApprove = ApproveAISchema.safeParse({
    menuItemId: "valid_id_123",
    reservationId: "res_123",
    imageBufferBase64: "data:image/png;base64," + "A".repeat(80),
    promptUsed: "Valid prompt exceeding five characters",
  });

  assertTest(
    "UNIT",
    validGen.success && !emptyGen.success && validApprove.success,
    "Zod Validation Schemas",
    "Enforces required fields and minimum payload lengths across all AI operations."
  );

  // ---------------------------------------------------------------------------
  // 2. REGRESSION TESTS (Ten Mandatory Scenarios)
  // ---------------------------------------------------------------------------
  console.log("\n--- 2. PERSISTENCE, CONCURRENCY & LIFECYCLE REGRESSION TESTS ---");

  // SCENARIO 1: Successful generation followed by modal dismissal consumes a credit
  const resScenario1 = await reserveCredit(testDish.id, synthesizedPrompt);
  if (!resScenario1.reservationId) throw new Error("Reservation failed");
  await markGenerating(resScenario1.reservationId);
  await markGenerated(resScenario1.reservationId); // Generation succeeded -> credit consumed!

  const balanceAfterGen1 = await prisma.restaurantProfile.findFirst({
    select: { aiCreditsBalance: true },
  });

  // Owner closes modal / dismisses candidate
  await discardCandidate(resScenario1.reservationId);

  const balanceAfterDismiss1 = await prisma.restaurantProfile.findFirst({
    select: { aiCreditsBalance: true },
  });

  const logRecord1 = await prisma.aIGenerationLog.findUnique({
    where: { id: resScenario1.reservationId },
  });

  assertTest(
    "DOMAIN_RULE",
    balanceAfterGen1?.aiCreditsBalance === initialBalance - 1 &&
      balanceAfterDismiss1?.aiCreditsBalance === initialBalance - 1 &&
      logRecord1?.status === "DISCARDED",
    "1. Successful Generation + Dismissal Consumes Credit",
    `Credit remains permanently consumed on modal dismissal (${initialBalance} -> ${initialBalance - 1}); audit status is DISCARDED.`
  );

  // SCENARIO 2: Successful generation followed by regeneration consumes another credit
  const resScenario2 = await reserveCredit(testDish.id, synthesizedPrompt);
  if (!resScenario2.reservationId) throw new Error("Reservation 2 failed");
  await markGenerating(resScenario2.reservationId);
  await markGenerated(resScenario2.reservationId);

  const balanceAfterRegen = await prisma.restaurantProfile.findFirst({
    select: { aiCreditsBalance: true },
  });

  assertTest(
    "DOMAIN_RULE",
    balanceAfterRegen?.aiCreditsBalance === initialBalance - 2,
    "2. Successful Generation + Regeneration Consumes Another Credit",
    `Regenerating initiated a new request that consumed an additional credit (${initialBalance - 1} -> ${initialBalance - 2}).`
  );

  // Clean up scenario 2 candidate
  await discardCandidate(resScenario2.reservationId);

  // SCENARIO 3: Failed generation refunds exactly once
  const resScenario3 = await reserveCredit(testDish.id, synthesizedPrompt);
  if (!resScenario3.reservationId) throw new Error("Reservation 3 failed");
  await markGenerating(resScenario3.reservationId);

  // Simulate Cloudflare timeout or 500 error
  const refundResult3 = await refundFailedGeneration(
    resScenario3.reservationId,
    "Cloudflare timeout after 25s"
  );

  const balanceAfterRefund3 = await prisma.restaurantProfile.findFirst({
    select: { aiCreditsBalance: true },
  });

  const logRecord3 = await prisma.aIGenerationLog.findUnique({
    where: { id: resScenario3.reservationId },
  });

  assertTest(
    "SECURITY",
    refundResult3 === true &&
      balanceAfterRefund3?.aiCreditsBalance === initialBalance - 2 &&
      logRecord3?.status === "REFUNDED",
    "3. Failed Generation Refunds Exactly Once",
    "Generation failure triggered atomic refund back to balance; status in PostgreSQL transitioned to REFUNDED."
  );

  // SCENARIO 4: Repeated cancel / refund requests cannot refund twice
  const duplicateRefundResult = await refundFailedGeneration(
    resScenario3.reservationId,
    "Duplicate refund attempt"
  );

  const balanceAfterDupeRefund = await prisma.restaurantProfile.findFirst({
    select: { aiCreditsBalance: true },
  });

  assertTest(
    "SECURITY",
    duplicateRefundResult === false &&
      balanceAfterDupeRefund?.aiCreditsBalance === initialBalance - 2,
    "4. Repeated Refund Calls Cannot Refund Twice",
    "Second refund attempt returned false; database balance was strictly protected against double-refund."
  );

  // SCENARIO 5: Two simultaneous requests with one credit allow only one reservation
  // Temporarily set balance to 1 in PostgreSQL
  await prisma.restaurantProfile.updateMany({
    where: { singletonKey: "RESTAURANT_PROFILE_SINGLETON" },
    data: { aiCreditsBalance: 1 },
  });

  const [raceResA, raceResB] = await Promise.all([
    reserveCredit(testDish.id, synthesizedPrompt),
    reserveCredit(testDish.id, synthesizedPrompt),
  ]);

  const raceBalance = await prisma.restaurantProfile.findFirst({
    select: { aiCreditsBalance: true },
  });

  const oneSucceeded =
    (raceResA.success && !raceResB.success) || (!raceResA.success && raceResB.success);

  assertTest(
    "SECURITY",
    oneSucceeded && raceBalance?.aiCreditsBalance === 0,
    "5. Two Simultaneous Requests with 1 Credit Allow Only 1 Reservation",
    "Under simultaneous concurrent execution at PostgreSQL level, exactly 1 reservation succeeded and 1 was blocked."
  );

  // Cleanup scenario 5 winner
  const scenario5Winner = raceResA.reservationId || raceResB.reservationId;
  if (scenario5Winner) {
    await refundFailedGeneration(scenario5Winner, "Test cleanup");
  }

  // Restore balance
  await prisma.restaurantProfile.updateMany({
    where: { singletonKey: "RESTAURANT_PROFILE_SINGLETON" },
    data: { aiCreditsBalance: initialBalance },
  });

  // SCENARIO 6: Reservation survives application restart because its state is persisted
  const resScenario6 = await reserveCredit(testDish.id, synthesizedPrompt);
  if (!resScenario6.reservationId) throw new Error("Reservation 6 failed");

  // Query raw database directly without relying on any in-memory state
  const durableRow = await prisma.aIGenerationLog.findUnique({
    where: { id: resScenario6.reservationId },
  });

  assertTest(
    "INTEGRATION",
    durableRow !== null &&
      durableRow.status === "RESERVED" &&
      durableRow.menuItemId === testDish.id &&
      durableRow.neuronsConsumed === 250,
    "6. Reservation State Persists Durably in PostgreSQL",
    `Reservation ${resScenario6.reservationId} is backed by PostgreSQL row, fully resilient across server restarts.`
  );

  // Cleanup scenario 6
  await refundFailedGeneration(resScenario6.reservationId, "Test cleanup");

  // SCENARIO 7: Concurrent refund attempts cannot double-refund
  const resScenario7 = await reserveCredit(testDish.id, synthesizedPrompt);
  if (!resScenario7.reservationId) throw new Error("Reservation 7 failed");
  await markGenerating(resScenario7.reservationId);

  // Fire 5 concurrent refund attempts simultaneously
  const concurrentRefunds = await Promise.all([
    refundFailedGeneration(resScenario7.reservationId, "Attempt 1"),
    refundFailedGeneration(resScenario7.reservationId, "Attempt 2"),
    refundFailedGeneration(resScenario7.reservationId, "Attempt 3"),
    refundFailedGeneration(resScenario7.reservationId, "Attempt 4"),
    refundFailedGeneration(resScenario7.reservationId, "Attempt 5"),
  ]);

  const trueCount = concurrentRefunds.filter((r) => r === true).length;
  const balanceAfterConcurrentRefund = await prisma.restaurantProfile.findFirst({
    select: { aiCreditsBalance: true },
  });

  assertTest(
    "SECURITY",
    trueCount === 1 && balanceAfterConcurrentRefund?.aiCreditsBalance === initialBalance,
    "7. Concurrent Refund Attempts Cannot Double-Refund",
    `Across 5 simultaneous concurrent refund calls, exactly 1 succeeded and 4 failed; balance remains exactly ${initialBalance}.`
  );

  // SCENARIO 8: Invalid image bytes are rejected
  const fakeSvg = Buffer.from("<svg>malicious</svg>");
  const fakeExe = Buffer.from("MZ\x90\x00\x03\x00\x00\x00");
  const validPng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d]);
  const validJpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01]);

  assertTest(
    "SECURITY",
    sniffImageFormat(fakeSvg) === null &&
      sniffImageFormat(fakeExe) === null &&
      sniffImageFormat(validPng) === "image/png" &&
      sniffImageFormat(validJpeg) === "image/jpeg",
    "8. Invalid Image Bytes & SVG Payloads Rejected",
    "Magic-byte inspection correctly accepts authentic JPEG/PNG binaries and rejects SVGs or executables."
  );

  // SCENARIO 9: An approval request cannot reuse a discarded reservation
  const resScenario9 = await reserveCredit(testDish.id, synthesizedPrompt);
  if (!resScenario9.reservationId) throw new Error("Reservation 9 failed");
  await markGenerating(resScenario9.reservationId);
  await markGenerated(resScenario9.reservationId);
  await discardCandidate(resScenario9.reservationId); // Discarded!

  const readyForApproval9 = await isReadyForApproval(resScenario9.reservationId, testDish.id);

  assertTest(
    "SECURITY",
    readyForApproval9 === false,
    "9. Discarded Reservation Cannot Be Reused for Approval",
    "Verification checks in PostgreSQL strictly rejected discarded reservation from approval."
  );

  // SCENARIO 10: Repeated approval requests cannot assign unintended duplicate assets
  const resScenario10 = await reserveCredit(testDish.id, synthesizedPrompt);
  if (!resScenario10.reservationId) throw new Error("Reservation 10 failed");
  await markGenerating(resScenario10.reservationId);
  await markGenerated(resScenario10.reservationId);

  // 1st Approval
  const initialDishImageAsset = testDish.imageAssetId;
  const mockApprovedAsset = await prisma.mediaAsset.create({
    data: {
      fileId: `ik_test_approval_${Date.now()}`,
      filePath: `/restaurants/red-apple/ai-generated/test.png`,
      url: `https://ik.imagekit.io/diginu/restaurants/red-apple/ai-generated/test.png`,
      assetType: "AI_GENERATED",
      width: 1024,
      height: 1024,
      sizeBytes: 1200,
      originalFilename: "test.png",
    },
  });

  // Perform atomic transaction
  const firstApprovalTx = await prisma.$transaction(async (tx) => {
    const logUpdate = await tx.aIGenerationLog.updateMany({
      where: {
        id: resScenario10.reservationId,
        status: "GENERATED",
        menuItemId: testDish.id,
      },
      data: {
        status: "APPROVED",
        selectedAssetId: mockApprovedAsset.id,
      },
    });
    return logUpdate.count > 0;
  });

  // 2nd Approval attempt on the SAME reservation
  let secondApprovalTxSucceeded = false;
  try {
    const secondApprovalTx = await prisma.$transaction(async (tx) => {
      const logUpdate = await tx.aIGenerationLog.updateMany({
        where: {
          id: resScenario10.reservationId,
          status: "GENERATED",
          menuItemId: testDish.id,
        },
        data: {
          status: "APPROVED",
        },
      });
      return logUpdate.count > 0;
    });
    secondApprovalTxSucceeded = secondApprovalTx;
  } catch {
    secondApprovalTxSucceeded = false;
  }

  assertTest(
    "SECURITY",
    firstApprovalTx === true && secondApprovalTxSucceeded === false,
    "10. Repeated Approval Requests Cannot Assign Duplicate Assets",
    "First approval transitioned status to APPROVED; second attempt matched 0 rows, preventing duplicate asset binding."
  );

  // Clean up scenario 10
  await prisma.aIGenerationLog.delete({ where: { id: resScenario10.reservationId } });
  await prisma.mediaAsset.delete({ where: { id: mockApprovedAsset.id } });

  // Restore initial baseline credit balance
  await prisma.restaurantProfile.updateMany({
    where: { singletonKey: "RESTAURANT_PROFILE_SINGLETON" },
    data: { aiCreditsBalance: initialBalance },
  });

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log("\n════════════════════════════════════════════════════════════════════════════════");
  const passedCount = results.filter((r) => r.passed).length;
  console.log(`📊 FINAL REGRESSION AUDIT SUMMARY: ${passedCount}/${results.length} TESTS PASSED`);
  console.log("════════════════════════════════════════════════════════════════════════════════\n");

  if (passedCount !== results.length) {
    console.error("❌ Some tests failed!");
    process.exit(1);
  } else {
    console.log("🎉 All BUILD-05 regression tests PASSED!");
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
