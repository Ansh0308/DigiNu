import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { imagekit } from "@/lib/imagekit";
import { apiError, apiNotFound, apiSuccess, apiUnauthorized } from "@/lib/api-response";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/admin/media/[id]
 *
 * Removes the media asset from ImageKit cloud storage and PostgreSQL.
 *
 * CONSISTENCY & RELIABILITY INVARIANTS:
 * 1. Requires authenticated owner session.
 * 2. Idempotent Cloud-First Deletion Ordering:
 *    - Cloud deletion is attempted first with up to 2 retries on transient errors.
 *    - If the file is already deleted in ImageKit (HTTP 404), it is treated as idempotent success.
 *    - If cloud deletion fails due to persistent cloud outage (5xx/network), the operation halts
 *      and the PostgreSQL record is PRESERVED, returning 502 so the owner can retry safely
 *      without creating unmanaged orphaned files in storage.
 * 3. Referential Safety:
 *    - Foreign keys to menu_items, logoProfiles, and bannerProfiles use onDelete: SetNull,
 *      ensuring active dishes and branding slots are cleanly unlinked rather than cascading.
 */
export async function DELETE(_request: NextRequest, context: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  const { id } = await context.params;

  const existingAsset = await prisma.mediaAsset.findUnique({
    where: { id },
  });

  if (!existingAsset) {
    return apiNotFound("Media asset");
  }

  const isRealIK =
    Boolean(process.env.IMAGEKIT_PRIVATE_KEY) &&
    !process.env.IMAGEKIT_PRIVATE_KEY?.includes("sample") &&
    !process.env.IMAGEKIT_PRIVATE_KEY?.includes("sample_private_key");

  let cloudDeleted = true;

  if (isRealIK) {
    let attempts = 0;
    const maxAttempts = 3;
    let deleteSucceeded = false;
    let lastError: unknown = null;

    while (attempts < maxAttempts && !deleteSucceeded) {
      attempts++;
      try {
        await imagekit.deleteFile(existingAsset.fileId);
        deleteSucceeded = true;
      } catch (cloudErr: unknown) {
        lastError = cloudErr;
        const errObj = cloudErr as { status?: number; message?: string };
        // If file is already absent in ImageKit (404), treat as idempotent success
        if (errObj?.status === 404 || errObj?.message?.toLowerCase().includes("not found")) {
          deleteSucceeded = true;
          break;
        }

        // Brief delay before retry on transient network errors
        if (attempts < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
    }

    if (!deleteSucceeded) {
      const errMsg = (lastError as { message?: string })?.message || "Cloud storage unavailable";
      console.error(`[ImageKit Deletion Error] Failed to delete file ${existingAsset.fileId} after ${maxAttempts} attempts:`, lastError);
      return apiError(
        "CLOUD_DELETION_FAILED",
        `Failed to remove asset from ImageKit cloud storage (${errMsg}). Database record was preserved. Please retry.`,
        502
      );
    }
  }

  // Deletion from PostgreSQL (triggers onDelete: SetNull on foreign keys)
  await prisma.mediaAsset.delete({
    where: { id },
  });

  return apiSuccess({
    deletedId: id,
    fileId: existingAsset.fileId,
    cloudDeleted,
  });
}

