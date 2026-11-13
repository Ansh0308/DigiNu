import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UpdateQRCodeConfigSchema } from "@/types/validation";
import {
  apiSuccess,
  apiUnauthorized,
  apiValidationError,
  apiError,
} from "@/lib/api-response";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/admin/qr-code/config
 * Updates the restaurant's QR code styling, logo embed preference, and callout text.
 */
export async function PATCH(request: NextRequest) {
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

  const parsed = UpdateQRCodeConfigSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  try {
    const updated = await prisma.qRCodeConfig.upsert({
      where: { singletonKey: "QR_CODE_CONFIG_SINGLETON" },
      update: {
        ...(parsed.data.foregroundColor && { foregroundColor: parsed.data.foregroundColor }),
        ...(parsed.data.backgroundColor && { backgroundColor: parsed.data.backgroundColor }),
        ...(typeof parsed.data.embedLogo === "boolean" && { embedLogo: parsed.data.embedLogo }),
        ...(parsed.data.dotStyle && { dotStyle: parsed.data.dotStyle }),
        ...(parsed.data.errorCorrectionLevel && {
          errorCorrectionLevel: parsed.data.errorCorrectionLevel,
        }),
        ...(parsed.data.calloutText && { calloutText: parsed.data.calloutText }),
      },
      create: {
        singletonKey: "QR_CODE_CONFIG_SINGLETON",
        foregroundColor: parsed.data.foregroundColor || "#000000",
        backgroundColor: parsed.data.backgroundColor || "#FFFFFF",
        embedLogo: parsed.data.embedLogo ?? true,
        dotStyle: parsed.data.dotStyle || "rounded",
        errorCorrectionLevel: parsed.data.errorCorrectionLevel || "H",
        calloutText: parsed.data.calloutText || "Scan to View Digital Menu",
        downloadCount: 0,
      },
    });

    return apiSuccess({ config: updated });
  } catch (error) {
    console.error("[QRCodeConfig] Error updating configuration:", error);
    return apiError("INTERNAL_ERROR", "Failed to update QR configuration", 500);
  }
}

