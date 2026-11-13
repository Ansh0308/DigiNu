import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { imagekit } from "@/lib/imagekit";
import { ApproveAISchema } from "@/types/validation";
import { isReadyForApproval } from "@/lib/ai-credit-manager";
import { sniffImageFormat, computeCandidateHash } from "@/lib/ai-generator";
import { apiError, apiNotFound, apiSuccess, apiUnauthorized, apiValidationError } from "@/lib/api-response";

/**
 * POST /api/admin/ai/approve
 *
 * Finalizes an owner-approved AI culinary image candidate:
 * 1. Verifies valid PostgreSQL state (status === "GENERATED").
 * 2. Strict Server-Side Image Validation:
 *    - Magic byte sniffing for authentic JPEG, PNG, or WebP binary signatures.
 *    - Rejection of malformed, unexpected, or non-raster payloads.
 *    - Max 5MB file-size ceiling.
 * 3. Uploads image buffer to ImageKit under /restaurants/{prefix}/ai-generated/.
 * 4. Atomic Prisma $transaction:
 *    - Persists MediaAsset (assetType = AI_GENERATED)
 *    - Links MenuItem imageAssetId
 *    - Updates AIGenerationLog status to "APPROVED" and binds selectedAssetId
 * 5. Credit Invariant: No additional generation credit is consumed (consumed at generation).
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON", 400);
  }

  const parsed = ApproveAISchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { menuItemId, reservationId, imageBufferBase64, promptUsed } = parsed.data;

  // Step 1: Verify Reservation State in PostgreSQL
  const ready = await isReadyForApproval(reservationId, menuItemId);
  if (!ready) {
    return apiError(
      "INVALID_RESERVATION_STATE",
      "This generation candidate is not available for approval. It may have been discarded or already approved.",
      400
    );
  }

  // Step 2: Verify Dish Existence
  const dish = await prisma.menuItem.findUnique({
    where: { id: menuItemId },
    select: { id: true, name: true },
  });

  if (!dish) {
    return apiNotFound("Menu dish");
  }

  // Step 3: Server-Side Binary & Magic Byte Validation
  const base64Data = imageBufferBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
  let imageBuffer: Buffer;
  try {
    imageBuffer = Buffer.from(base64Data, "base64");
  } catch {
    return apiError("MALFORMED_IMAGE", "Could not decode image base64 payload", 400);
  }

  if (!imageBuffer || imageBuffer.length === 0) {
    return apiError("INVALID_BUFFER", "Decoded image buffer is empty", 400);
  }

  // Enforce 5MB limit
  const MAX_BYTES = 5 * 1024 * 1024;
  if (imageBuffer.length > MAX_BYTES) {
    return apiError("FILE_TOO_LARGE", "Image buffer exceeds maximum permitted size of 5MB", 400);
  }

  // Strict Magic Byte Sniffing (Do not trust client MIME claims)
  const detectedFormat = sniffImageFormat(imageBuffer);
  if (!detectedFormat) {
    return apiError(
      "INVALID_FORMAT",
      "Image content does not match authentic JPEG, PNG, or WebP binary signatures.",
      400
    );
  }

  const extension = detectedFormat === "image/png" ? "png" : detectedFormat === "image/webp" ? "webp" : "jpg";

  // Step 4: Cryptographic Candidate Integrity Binding Check
  const logRecord = await prisma.aIGenerationLog.findUnique({
    where: { id: reservationId },
    select: { candidateHash: true, selectedAssetId: true },
  });

  if (logRecord?.candidateHash) {
    const submittedHash = computeCandidateHash(imageBuffer);
    if (submittedHash !== logRecord.candidateHash) {
      return apiError(
        "CANDIDATE_INTEGRITY_MISMATCH",
        "Submitted image bytes do not match the authentic server-generated candidate for this reservation.",
        403
      );
    }
  }

  // Check if asset was already uploaded during generation
  let existingAsset = null;
  if (logRecord?.selectedAssetId) {
    existingAsset = await prisma.mediaAsset.findUnique({
      where: { id: logRecord.selectedAssetId },
    });
  }

  // Step 5: Resolve ImageKit Folder & Persistence
  const profile = await prisma.restaurantProfile.findFirst({
    select: { slug: true },
  });
  const folderPrefix = process.env.IMAGEKIT_FOLDER_PREFIX || profile?.slug || "restaurant";
  const uploadFolder = `/restaurants/${folderPrefix}/ai-generated`;
  const sanitizedDishName = dish.name.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const fileName = `ai_${sanitizedDishName}_${Date.now()}.${extension}`;

  const isRealIK =
    Boolean(process.env.IMAGEKIT_PRIVATE_KEY) &&
    !process.env.IMAGEKIT_PRIVATE_KEY?.includes("sample") &&
    !process.env.IMAGEKIT_PRIVATE_KEY?.includes("sample_private_key");

  let uploadedFileId = existingAsset?.fileId || "";
  let uploadedFilePath = existingAsset?.filePath || "";
  let uploadedUrl = existingAsset?.url || "";

  if (!existingAsset) {
    if (isRealIK) {
      try {
        const uploadRes = await imagekit.upload({
          file: imageBuffer,
          fileName,
          folder: uploadFolder,
          useUniqueFileName: true,
        });

        uploadedFileId = uploadRes.fileId;
        uploadedFilePath = uploadRes.filePath;
        uploadedUrl = uploadRes.url;
      } catch (uploadErr) {
        console.error("[ImageKit Upload Error] Failed to persist AI image to ImageKit:", uploadErr);
        return apiError(
          "IMAGEKIT_UPLOAD_FAILED",
          "Failed to upload approved image to cloud storage.",
          502
        );
      }
    } else {
      uploadedFileId = `ik_ai_mock_${Date.now()}`;
      uploadedFilePath = `${uploadFolder}/${fileName}`;
      uploadedUrl = `https://ik.imagekit.io/ansh0308${uploadedFilePath}`;
    }
  }

  // Step 5: Atomic Persistence in PostgreSQL
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Transition reservation status to APPROVED (ensures exactly-once approval)
      const logUpdate = await tx.aIGenerationLog.updateMany({
        where: {
          id: reservationId,
          status: "GENERATED",
          menuItemId,
        },
        data: {
          status: "APPROVED",
          promptSynthesized: promptUsed,
        },
      });

      if (logUpdate.count === 0) {
        throw new Error("RESERVATION_CONCURRENTLY_MODIFIED");
      }

      // 2. Reuse or create MediaAsset record
      let mediaAsset = existingAsset;
      if (!mediaAsset) {
        mediaAsset = await tx.mediaAsset.create({
          data: {
            fileId: uploadedFileId,
            filePath: uploadedFilePath,
            url: uploadedUrl,
            assetType: "AI_GENERATED",
            width: 1024,
            height: 1024,
            sizeBytes: imageBuffer.length,
            originalFilename: fileName,
          },
        });
      }

      // 3. Link image to dish
      const updatedDish = await tx.menuItem.update({
        where: { id: menuItemId },
        data: {
          imageAssetId: mediaAsset.id,
        },
      });

      // 4. Bind selectedAssetId on log
      await tx.aIGenerationLog.update({
        where: { id: reservationId },
        data: {
          selectedAssetId: mediaAsset.id,
        },
      });

      return { mediaAsset, updatedDish };
    });

    return apiSuccess(
      {
        menuItemId: result.updatedDish.id,
        imageAssetId: result.mediaAsset.id,
        imageUrl: result.mediaAsset.url,
      },
      201
    );
  } catch (dbErr: unknown) {
    if (isRealIK) {
      try {
        await imagekit.deleteFile(uploadedFileId);
      } catch (cleanErr) {
        console.error("[ImageKit Cleanup Alert] Failed to remove orphaned AI file after DB failure:", cleanErr);
      }
    }
    const msg = (dbErr as { message?: string })?.message;
    if (msg === "RESERVATION_CONCURRENTLY_MODIFIED") {
      return apiError(
        "INVALID_RESERVATION_STATE",
        "This generation candidate is no longer available for approval.",
        400
      );
    }
    console.error("[AI Approve Error] Database transaction failed:", dbErr);
    throw dbErr;
  }
}
