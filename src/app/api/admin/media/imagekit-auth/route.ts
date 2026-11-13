import { type NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { imagekit } from "@/lib/imagekit";
import { checkRateLimit } from "@/lib/rate-limiter";
import { apiError, apiSuccess, apiUnauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

const ALLOWED_FOLDER_TYPES = ["branding", "dishes", "ai-generated"] as const;
type FolderType = (typeof ALLOWED_FOLDER_TYPES)[number];

/**
 * GET /api/admin/media/imagekit-auth
 *
 * Generates temporary HMAC-SHA1 authentication parameters for client-side direct uploads.
 *
 * CRITICAL SECURITY INVARIANTS:
 * 1. Requires valid owner session.
 * 2. Rate limited (max 60 signature requests per 15 minutes per IP).
 * 3. IMAGEKIT_PRIVATE_KEY is used exclusively server-side to sign the token and is NEVER returned.
 * 4. Token has a 30-minute expiration timestamp.
 * 5. Folder parameter is strictly validated against an allowed whitelist.
 * 6. Upload folder is strictly scoped to the restaurant's folder namespace:
 *    /restaurants/{folderPrefix}/{branding | dishes | ai-generated}
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized("Session required to generate ImageKit upload signature");
  }

  // Rate Limiting: 60 auth token requests per 15 minutes per IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  const rateLimit = checkRateLimit(`imagekit-auth:${ip}`, 60, 15 * 60 * 1000);
  if (!rateLimit.success) {
    return apiError("RATE_LIMIT_EXCEEDED", "Too many signature requests. Please try again later.", 429);
  }

  const { searchParams } = new URL(request.url);
  const rawFolder = searchParams.get("folder") || "dishes";
  const targetFolderType: FolderType = ALLOWED_FOLDER_TYPES.includes(rawFolder as FolderType)
    ? (rawFolder as FolderType)
    : "dishes";

  const profile = await prisma.restaurantProfile.findFirst({
    select: { slug: true },
  });

  const folderPrefix = process.env.IMAGEKIT_FOLDER_PREFIX || profile?.slug || "restaurant";
  const uploadFolder = `/restaurants/${folderPrefix}/${targetFolderType}`;

  // ImageKit generates token, expire timestamp, and HMAC-SHA1 signature
  const authParams = imagekit.getAuthenticationParameters();

  return apiSuccess({
    token: authParams.token,
    expire: authParams.expire,
    signature: authParams.signature,
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
    uploadFolder,
  });
}

