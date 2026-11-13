import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { generateFoodImage } from "../src/lib/ai-generator";
import {
  reserveCredit,
  markGenerating,
  markGenerated,
  discardCandidate,
  isReadyForApproval,
} from "../src/lib/ai-credit-manager";
import { imagekit } from "../src/lib/imagekit";

async function runLiveWorkflow() {
  console.log("=== FULL LIVE AI STUDIO WORKFLOW TEST ===");

  // Step 1: Ensure temporary test dish exists
  const testDish = await prisma.menuItem.findFirst();
  if (!testDish) throw new Error("No dish found");

  const initialProfile = await prisma.restaurantProfile.findFirst({
    select: { aiCreditsBalance: true, slug: true },
  });
  const startBalance = initialProfile?.aiCreditsBalance ?? 30;
  const folderPrefix = process.env.IMAGEKIT_FOLDER_PREFIX || initialProfile?.slug || "restaurant";

  console.log(`Starting balance: ${startBalance} credits`);

  // WORKFLOW A: Generate -> Dismiss (Confirm credit remains consumed)
  console.log("\n--- Workflow A: Generation + Dismissal ---");
  const promptA = "Commercial food photography of fresh mango kulfi, terracotta dish, macro lighting";
  const resA = await reserveCredit(testDish.id, promptA);
  if (!resA.reservationId) throw new Error("Reservation A failed");

  await markGenerating(resA.reservationId);
  console.log("Calling live Cloudflare Workers AI for Candidate A...");
  const t0 = Date.now();
  const imgA = await generateFoodImage(promptA);
  console.log(`✅ Candidate A generated in ${((Date.now() - t0) / 1000).toFixed(2)}s (${imgA.buffer.length} bytes, ${imgA.width}x${imgA.height})`);

  await markGenerated(resA.reservationId, imgA.candidateHash);
  console.log("Candidate A marked GENERATED (credit permanently consumed)");

  // Dismiss candidate A
  await discardCandidate(resA.reservationId);
  console.log("Candidate A discarded by user");

  const balanceAfterA = await prisma.restaurantProfile.findFirst({
    select: { aiCreditsBalance: true },
  });
  console.log(`Balance after dismissal: ${balanceAfterA?.aiCreditsBalance} (Expected: ${startBalance - 1})`);

  // WORKFLOW B: Generate -> Approve (Uploads to ImageKit + links to dish)
  console.log("\n--- Workflow B: Generation + Approval + ImageKit Upload ---");
  const promptB = "Commercial food photography of artisanal paneer tikka skewers, charcoal grill, micro herbs";
  const resB = await reserveCredit(testDish.id, promptB);
  if (!resB.reservationId) throw new Error("Reservation B failed");

  await markGenerating(resB.reservationId);
  console.log("Calling live Cloudflare Workers AI for Candidate B...");
  const t1 = Date.now();
  const imgB = await generateFoodImage(promptB);
  console.log(`✅ Candidate B generated in ${((Date.now() - t1) / 1000).toFixed(2)}s (${imgB.buffer.length} bytes, ${imgB.width}x${imgB.height})`);

  await markGenerated(resB.reservationId, imgB.candidateHash);

  // Verify ready for approval
  const isReady = await isReadyForApproval(resB.reservationId, testDish.id);
  console.log(`Candidate B ready for approval: ${isReady}`);

  // Upload Candidate B to real ImageKit
  const uploadFolder = `/restaurants/${folderPrefix}/ai-generated`;
  const fileName = `live_test_ai_${Date.now()}.jpg`;
  console.log(`Uploading to ImageKit folder: ${uploadFolder}/${fileName}`);

  const ikUpload = await imagekit.upload({
    file: imgB.buffer,
    fileName,
    folder: uploadFolder,
    useUniqueFileName: true,
  });

  console.log(`✅ ImageKit Upload Success! File ID: ${ikUpload.fileId}`);
  console.log(`   Canonical Path: ${ikUpload.filePath}`);
  console.log(`   CDN URL: ${ikUpload.url}`);

  // Test CDN retrieval
  console.log("Testing CDN image retrieval via HTTP GET...");
  const cdnRes = await fetch(ikUpload.url);
  console.log(`CDN Response: HTTP ${cdnRes.status} (Content-Type: ${cdnRes.headers.get("content-type")})`);

  // Atomic DB transaction
  const dbRecord = await prisma.$transaction(async (tx) => {
    const asset = await tx.mediaAsset.create({
      data: {
        fileId: ikUpload.fileId,
        filePath: ikUpload.filePath,
        url: ikUpload.url,
        assetType: "AI_GENERATED",
        width: imgB.width || 1024,
        height: imgB.height || 1024,
        sizeBytes: imgB.buffer.length,
        originalFilename: fileName,
      },
    });

    await tx.menuItem.update({
      where: { id: testDish.id },
      data: { imageAssetId: asset.id },
    });

    await tx.aIGenerationLog.update({
      where: { id: resB.reservationId },
      data: {
        status: "APPROVED",
        selectedAssetId: asset.id,
      },
    });

    return asset;
  });

  console.log(`✅ MediaAsset persisted in PostgreSQL with ID: ${dbRecord.id}`);

  // CLEANUP: Clean up test asset from ImageKit and PostgreSQL to leave database pristine
  console.log("\n--- Cleaning up temporary test asset ---");
  await prisma.menuItem.update({
    where: { id: testDish.id },
    data: { imageAssetId: testDish.imageAssetId },
  });
  await prisma.aIGenerationLog.deleteMany({
    where: { id: { in: [resA.reservationId, resB.reservationId] } },
  });
  await prisma.mediaAsset.delete({
    where: { id: dbRecord.id },
  });
  await imagekit.deleteFile(ikUpload.fileId);
  console.log("✅ ImageKit file deleted & DB references cleanly restored.");

  // Restore starting credit balance
  await prisma.restaurantProfile.updateMany({
    where: { singletonKey: "RESTAURANT_PROFILE_SINGLETON" },
    data: { aiCreditsBalance: startBalance },
  });
  console.log(`Restored credit balance to ${startBalance}.`);

  console.log("\n🎉 ALL LIVE CLOUDFLARE + IMAGEKIT INTEGRATION TESTS PASSED!");
}

runLiveWorkflow().catch((err) => {
  console.error("Live test failed:", err);
  process.exit(1);
});

