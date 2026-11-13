import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DownloadQRCodeQuerySchema } from "@/types/validation";
import { apiUnauthorized, apiError, apiValidationError } from "@/lib/api-response";
import {
  generateQRPng,
  generateQRSvg,
  getCanonicalMenuUrl,
  getRestaurantLogoBuffer,
} from "@/lib/qr-generator";
import { generateTableTentPdf } from "@/lib/pdf-generator";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/qr-code/download?format=svg|png|pdf
 * Streams high-resolution print or vector assets and increments download metrics.
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return apiUnauthorized();
  }

  const { searchParams } = new URL(request.url);
  const formatParam = searchParams.get("format");

  const parsed = DownloadQRCodeQuerySchema.safeParse({ format: formatParam });
  if (!parsed.success) {
    return apiValidationError(parsed.error);
  }

  const { format } = parsed.data;

  try {
    const [config, profile] = await Promise.all([
      prisma.qRCodeConfig.findUnique({
        where: { singletonKey: "QR_CODE_CONFIG_SINGLETON" },
      }),
      prisma.restaurantProfile.findFirst({
        include: { logoAsset: true },
      }),
    ]);

    const activeConfig = config || {
      foregroundColor: "#000000",
      backgroundColor: "#FFFFFF",
      embedLogo: true,
      dotStyle: "rounded",
      errorCorrectionLevel: "H",
      calloutText: "Scan to View Digital Menu",
      downloadCount: 0,
    };

    const targetUrl = getCanonicalMenuUrl();
    const restaurantName = profile?.name || "DigiNu Restaurant";
    const restaurantSlug = (profile?.name || "restaurant")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const logoBuffer = activeConfig.embedLogo ? await getRestaurantLogoBuffer() : null;

    // Atomically increment download count
    await prisma.qRCodeConfig.upsert({
      where: { singletonKey: "QR_CODE_CONFIG_SINGLETON" },
      update: { downloadCount: { increment: 1 } },
      create: {
        singletonKey: "QR_CODE_CONFIG_SINGLETON",
        foregroundColor: activeConfig.foregroundColor,
        backgroundColor: activeConfig.backgroundColor,
        embedLogo: activeConfig.embedLogo,
        downloadCount: 1,
      },
    });

    if (format === "svg") {
      const svgString = await generateQRSvg(targetUrl, {
        foregroundColor: activeConfig.foregroundColor,
        backgroundColor: activeConfig.backgroundColor,
        embedLogo: activeConfig.embedLogo,
        logoBuffer,
        errorCorrectionLevel: (activeConfig.errorCorrectionLevel as "L" | "M" | "Q" | "H") || "H",
        dotStyle: activeConfig.dotStyle,
      });

      return new Response(svgString, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Content-Disposition": `attachment; filename="${restaurantSlug}-menu-qr.svg"`,
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    if (format === "png") {
      const pngBuffer = await generateQRPng(targetUrl, {
        foregroundColor: activeConfig.foregroundColor,
        backgroundColor: activeConfig.backgroundColor,
        embedLogo: activeConfig.embedLogo,
        logoBuffer,
        errorCorrectionLevel: (activeConfig.errorCorrectionLevel as "L" | "M" | "Q" | "H") || "H",
      });

      return new Response(new Uint8Array(pngBuffer), {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Content-Disposition": `attachment; filename="${restaurantSlug}-menu-qr-300dpi.png"`,
          "Content-Length": pngBuffer.length.toString(),
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    if (format === "pdf") {
      const pdfBuffer = await generateTableTentPdf({
        restaurantName,
        tagline: profile?.tagline,
        calloutText: activeConfig.calloutText || "Scan to View Digital Menu",
        qrUrl: targetUrl,
        primaryColor: profile?.primaryColor || "#1A1A1A",
        qrOptions: {
          foregroundColor: activeConfig.foregroundColor,
          backgroundColor: activeConfig.backgroundColor,
          embedLogo: activeConfig.embedLogo,
          logoBuffer,
          errorCorrectionLevel: (activeConfig.errorCorrectionLevel as "L" | "M" | "Q" | "H") || "H",
        },
      });

      return new Response(new Uint8Array(pdfBuffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${restaurantSlug}-table-tent-a6.pdf"`,
          "Content-Length": pdfBuffer.length.toString(),
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    return apiError("INVALID_FORMAT", "Unsupported download format", 400);
  } catch (error) {
    console.error("[QRCodeDownload] Failed to generate download:", error);
    return apiError("INTERNAL_ERROR", "Failed to generate download asset", 500);
  }
}

