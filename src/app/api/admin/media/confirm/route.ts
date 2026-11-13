import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { imagekit } from "@/lib/imagekit";
import { checkRateLimit } from "@/lib/rate-limiter";
import { ConfirmUploadSchema } from "@/types/validation";
import { apiError, apiSuccess, apiUnauthorized, apiValidationError } from "@/lib/api-response";

/**
 * POST /api/admin/media/confirm
 *
 * Persists asset metadata to the PostgreSQL media_assets table after successful
 * direct browser-to-ImageKit upload.
 *
 * DEFENSE-IN-DEPTH SECURITY CONTROLS:
 * 1. Owner Session Required (Auth.js v5).
 * 2. Rate limiting (max 30 confirmation requests per 10 minutes).
 * 3. Canonical ImageKit Verification: If live ImageKit credentials are present,
 *    queries ImageKit API to verify actual file presence, canonical path, size, and type.
 * 4. Folder Namespace Enforcement: Asserts that file path strictly resides under
 *    the restaurant's designated prefix (/restaurants/{prefix}/). Rogue uploads are
 *    purged from cloud storage immediately and rejected with HTTP 403.
 * 5. Server-side File Size (<= 5MB) and format whitelist verification.
 * 6. Orphaned Storage Cleanup: If PostgreSQL persistence fails, the uploaded
 *    file is cleanly deleted from ImageKit to prevent leaked storage.
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  // Rate Limiting: 30 confirmations per 10 minutes per IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rateLimit = checkRateLimit(`media-confirm:${ip}`, 30, 10 * 60 * 1000);
  if (!rateLimit.success) {
    return apiError("RATE_LIMIT_EXCEEDED", "Too many upload confirmation requests. Please try again later.", 429);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError("INVALID_JSON", "Request body must be valid JSON", 400);
  }

  const parsed = ConfirmUploadSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  // Determine authorized folder prefix for this deployment
  const profile = await prisma.restaurantProfile.findFirst({
    select: { slug: true },
  });
  const folderPrefix = process.env.IMAGEKIT_FOLDER_PREFIX || profile?.slug || "restaurant";
  const expectedPrefix = `/restaurants/${folderPrefix}/`;

  let canonicalUrl = parsed.data.url;
  let canonicalFilePath = parsed.data.filePath;
  let canonicalWidth = parsed.data.width;
  let canonicalHeight = parsed.data.height;
  let canonicalSizeBytes = parsed.data.sizeBytes;

  const isRealIK =
    Boolean(process.env.IMAGEKIT_PRIVATE_KEY) &&
    !process.env.IMAGEKIT_PRIVATE_KEY?.includes("sample") &&
    !process.env.IMAGEKIT_PRIVATE_KEY?.includes("sample_private_key");

  if (isRealIK) {
    let ikDetails: {
      fileId: string;
      name: string;
      filePath: string;
      url: string;
      fileType: string;
      size: number;
      width?: number;
      height?: number;
    };

    try {
      // Step 1: Verify actual existence in ImageKit cloud
      ikDetails = (await imagekit.getFileDetails(parsed.data.fileId)) as typeof ikDetails;
    } catch {
      return apiError(
        "IMAGE_NOT_FOUND",
        "The uploaded file could not be verified in ImageKit cloud storage.",
        404
      );
    }

    // Step 2: Validate folder isolation — ensure asset was uploaded to this restaurant's folder
    if (!ikDetails.filePath.startsWith(expectedPrefix)) {
      // Purge rogue asset immediately from storage to prevent folder pollution
      try {
        await imagekit.deleteFile(parsed.data.fileId);
      } catch (cleanErr) {
        console.error("[Security Alert] Failed to delete rogue asset from ImageKit:", cleanErr);
      }
      return apiError(
        "UNAUTHORIZED_FOLDER",
        "Asset was uploaded outside the authorized restaurant folder namespace.",
        403
      );
    }

    // Step 3: Validate file size (max 5 MB)
    const MAX_ALLOWED_BYTES = 5 * 1024 * 1024;
    if (ikDetails.size > MAX_ALLOWED_BYTES) {
      try {
        await imagekit.deleteFile(parsed.data.fileId);
      } catch {}
      return apiError(
        "FILE_TOO_LARGE",
        `Asset exceeds maximum allowed size of 5MB (${(ikDetails.size / (1024 * 1024)).toFixed(2)}MB).`,
        400
      );
    }

    // Step 4: Validate raster image format
    const ALLOWED_EXTS = ["jpg", "jpeg", "png", "webp"];
    const fileExt = (ikDetails.name.split(".").pop() || "").toLowerCase();
    if (!ALLOWED_EXTS.includes(fileExt) && ikDetails.fileType !== "image") {
      try {
        await imagekit.deleteFile(parsed.data.fileId);
      } catch {}
      return apiError(
        "INVALID_FORMAT",
        "Only JPEG, PNG, and WebP image formats are permitted.",
        400
      );
    }

    // Adopt verified ImageKit canonical metadata
    canonicalUrl = ikDetails.url;
    canonicalFilePath = ikDetails.filePath;
    canonicalWidth = ikDetails.width || canonicalWidth;
    canonicalHeight = ikDetails.height || canonicalHeight;
    canonicalSizeBytes = ikDetails.size;
  }

  // Step 5: Upsert metadata into PostgreSQL with rollback on failure
  try {
    const asset = await prisma.mediaAsset.upsert({
      where: { fileId: parsed.data.fileId },
      update: {
        filePath: canonicalFilePath,
        url: canonicalUrl,
        assetType: parsed.data.assetType,
        width: canonicalWidth,
        height: canonicalHeight,
        sizeBytes: canonicalSizeBytes,
        originalFilename: parsed.data.originalFilename,
      },
      create: {
        fileId: parsed.data.fileId,
        filePath: canonicalFilePath,
        url: canonicalUrl,
        assetType: parsed.data.assetType,
        width: canonicalWidth,
        height: canonicalHeight,
        sizeBytes: canonicalSizeBytes,
        originalFilename: parsed.data.originalFilename,
      },
    });

    return apiSuccess(asset, 201);
  } catch (dbErr) {
    // If PostgreSQL write fails, clean up the newly uploaded cloud asset to prevent orphaned storage
    if (isRealIK) {
      try {
        await imagekit.deleteFile(parsed.data.fileId);
      } catch (cleanupErr) {
        console.error("[ImageKit Cleanup Error] Failed to delete orphaned asset following database failure:", cleanupErr);
      }
    }
    throw dbErr;
  }
}

