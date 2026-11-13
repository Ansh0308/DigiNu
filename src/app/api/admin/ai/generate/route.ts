import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { imagekit } from "@/lib/imagekit";
import { GenerateAISchema } from "@/types/validation";
import { checkRateLimit } from "@/lib/rate-limiter";
import { synthesizeCulinaryPrompt } from "@/lib/prompt-synthesizer";
import { generateFoodImage } from "@/lib/ai-generator";
import {
  reserveCredit,
  markGenerating,
  markGenerated,
  refundFailedGeneration,
} from "@/lib/ai-credit-manager";
import { apiError, apiNotFound, apiSuccess, apiUnauthorized, apiValidationError } from "@/lib/api-response";

/**
 * POST /api/admin/ai/generate
 *
 * Initiates an AI culinary photo generation request for a specific dish.
 *
 * DURABLE CREDIT LIFECYCLE:
 * 1. Owner Session Required (Auth.js v5).
 * 2. Rate Limiting (20 generations per 10 minutes per IP).
 * 3. Atomic Durable Credit Reservation: Reserves 1 credit and creates an AIGenerationLog
 *    record with status = "RESERVED" in PostgreSQL. Returns 402 if credits balance <= 0.
 * 4. Transition to "GENERATING".
 * 5. Calls Cloudflare Workers AI FLUX.1-schnell.
 * 6. IF FAILED: Calls refundFailedGeneration() -> atomically refunds 1 credit and marks status = "REFUNDED".
 * 7. IF SUCCESSFUL: Calls markGenerated() -> status = "GENERATED".
 *    INVARIANT: The credit is now PERMANENTLY consumed. Subsequent dismissals or regenerations
 *    will NOT refund this credit.
 * 8. Returns ephemeral preview data URL for client preview.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  // Rate Limiting: 20 AI generations per 10 minutes per IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rateLimit = checkRateLimit(`ai-generate:${ip}`, 20, 10 * 60 * 1000);
  if (!rateLimit.success) {
    return apiError(
      "RATE_LIMIT_EXCEEDED",
      "Too many AI generation attempts. Please wait before generating again.",
      429
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON", 400);
  }

  const parsed = GenerateAISchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { menuItemId } = parsed.data;

  // Verify dish and category existence
  const menuItem = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
    include: { category: true },
  });

  if (!menuItem) {
    return apiNotFound("Menu dish");
  }

  // Synthesize Prompt
  const prompt = synthesizeCulinaryPrompt(menuItem, menuItem.category?.name);

  // Step 1: Durable Atomic Credit Reservation in PostgreSQL
  const reservation = await reserveCredit(menuItemId, prompt);
  if (!reservation.success || !reservation.reservationId) {
    return apiError(
      "INSUFFICIENT_CREDITS",
      "No AI food photography credits remaining in your balance. Contact support to replenish.",
      402
    );
  }

  const reservationId = reservation.reservationId;

  // Step 2: Mark Generating
  await markGenerating(reservationId);

  // Step 3: Dispatch to Cloudflare Workers AI with Exactly-Once Refund Guard
  let result: Awaited<ReturnType<typeof generateFoodImage>>;
  try {
    result = await generateFoodImage(prompt);
  } catch (genError: unknown) {
    const errorText =
      (genError as { message?: string })?.message || "Generation request failed";

    // Exactly-once durable refund in PostgreSQL
    await refundFailedGeneration(reservationId, errorText);

    console.error(`[AI Generation Error] Dish ${menuItemId} failed:`, genError);
    return apiError("AI_GENERATION_FAILED", `${errorText}. Your credit was automatically refunded.`, 502);
  }

  // Step 4: Mark Generated in PostgreSQL with Candidate Integrity Hash
  // INVARIANT: Credit is now PERMANENTLY consumed.
  await markGenerated(reservationId, result.candidateHash);

  // Step 5: Immediately persist image to ImageKit and MediaAsset Library
  const profile = await prisma.restaurantProfile.findFirst({
    select: { slug: true, aiCreditsBalance: true, aiCreditsMonthlyLimit: true },
  });

  const folderPrefix = process.env.IMAGEKIT_FOLDER_PREFIX || profile?.slug || "restaurant";
  const uploadFolder = `/restaurants/${folderPrefix}/ai-generated`;
  const sanitizedDishName = menuItem.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const fileName = `ai_${sanitizedDishName}_${Date.now()}.jpg`;

  let uploadedUrl: string | null = null;
  let mediaAssetId: string | null = null;

  const isRealIK =
    Boolean(process.env.IMAGEKIT_PRIVATE_KEY) &&
    !process.env.IMAGEKIT_PRIVATE_KEY?.includes("sample") &&
    !process.env.IMAGEKIT_PRIVATE_KEY?.includes("sample_private_key");

  if (isRealIK) {
    try {
      const uploadRes = await imagekit.upload({
        file: result.buffer,
        fileName,
        folder: uploadFolder,
        useUniqueFileName: true,
      });

      uploadedUrl = uploadRes.url;

      const asset = await prisma.mediaAsset.create({
        data: {
          fileId: uploadRes.fileId,
          filePath: uploadRes.filePath,
          url: uploadRes.url,
          assetType: "AI_GENERATED",
          width: 1024,
          height: 1024,
          sizeBytes: result.buffer.length,
          originalFilename: fileName,
        },
      });

      mediaAssetId = asset.id;

      // Associate asset with the generation log
      await prisma.aIGenerationLog.update({
        where: { id: reservationId },
        data: { selectedAssetId: asset.id },
      });
    } catch (uploadErr) {
      console.warn("[ImageKit Direct Generation Upload Warning] Failed to upload immediately to ImageKit:", uploadErr);
    }
  }

  // Construct preview URL (prefer ImageKit CDN URL if uploaded, fallback to base64 data URI)
  const base64 = result.buffer.toString("base64");
  const previewUrl = uploadedUrl || `data:${result.mimeType};base64,${base64}`;

  return apiSuccess({
    menuItemId,
    reservationId,
    mediaAssetId,
    promptUsed: prompt,
    previewUrl,
    creditsRemaining: profile?.aiCreditsBalance ?? 0,
    monthlyLimit: profile?.aiCreditsMonthlyLimit ?? 30,
  });
}
