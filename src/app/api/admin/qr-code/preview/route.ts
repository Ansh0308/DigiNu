import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiUnauthorized, apiError } from "@/lib/api-response";
import {
  generateQRSvg,
  getCanonicalMenuUrl,
  getRestaurantLogoBuffer,
  isContrastReliable,
} from "@/lib/qr-generator";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/qr-code/preview
 * Returns dynamic SVG QR code preview, canonical target URL, contrast validation, and configuration.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  try {
    // Retrieve or seed QRCodeConfig singleton
    let config = await prisma.qRCodeConfig.findUnique({
      where: { singletonKey: "QR_CODE_CONFIG_SINGLETON" },
    });

    if (!config) {
      config = await prisma.qRCodeConfig.create({
        data: {
          singletonKey: "QR_CODE_CONFIG_SINGLETON",
          foregroundColor: "#000000",
          backgroundColor: "#FFFFFF",
          embedLogo: true,
          dotStyle: "rounded",
          errorCorrectionLevel: "H",
          calloutText: "Scan to View Digital Menu",
          downloadCount: 0,
        },
      });
    }

    const targetUrl = getCanonicalMenuUrl();
    const logoBuffer = config.embedLogo ? await getRestaurantLogoBuffer() : null;

    const qrSvg = await generateQRSvg(targetUrl, {
      foregroundColor: config.foregroundColor,
      backgroundColor: config.backgroundColor,
      embedLogo: config.embedLogo,
      logoBuffer,
      errorCorrectionLevel: (config.errorCorrectionLevel as "L" | "M" | "Q" | "H") || "H",
      dotStyle: config.dotStyle,
    });

    const contrast = isContrastReliable(config.foregroundColor, config.backgroundColor);

    return apiSuccess({
      qrSvg,
      targetUrl,
      contrast,
      config,
    });
  } catch (error) {
    console.error("[QRCodePreview] Error generating preview:", error);
    return apiError("INTERNAL_ERROR", "Failed to generate QR preview", 500);
  }
}

