import React from "react";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { QRStudio } from "@/components/admin/QRStudio";
import {
  generateQRSvg,
  getCanonicalMenuUrl,
  getRestaurantLogoBuffer,
} from "@/lib/qr-generator";

export const metadata: Metadata = {
  title: "Table QR Code Studio | DigiNu Admin",
  description: "Customize, preview, and download print-ready table QR codes for your digital restaurant menu.",
};

export const dynamic = "force-dynamic";

export default async function QRStudioPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

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

  const profile = await prisma.restaurantProfile.findFirst({
    include: { logoAsset: true },
  });

  const targetUrl = getCanonicalMenuUrl();
  const logoBuffer = config.embedLogo ? await getRestaurantLogoBuffer() : null;

  const initialSvg = await generateQRSvg(targetUrl, {
    foregroundColor: config.foregroundColor,
    backgroundColor: config.backgroundColor,
    embedLogo: config.embedLogo,
    logoBuffer,
    errorCorrectionLevel: (config.errorCorrectionLevel as "L" | "M" | "Q" | "H") || "H",
    dotStyle: config.dotStyle,
  });

  return (
    <QRStudio
      initialConfig={{
        id: config.id,
        foregroundColor: config.foregroundColor,
        backgroundColor: config.backgroundColor,
        embedLogo: config.embedLogo,
        dotStyle: config.dotStyle,
        errorCorrectionLevel: config.errorCorrectionLevel,
        calloutText: config.calloutText,
        downloadCount: config.downloadCount,
      }}
      initialTargetUrl={targetUrl}
      initialSvg={initialSvg}
      profile={
        profile
          ? {
              name: profile.name,
              primaryColor: profile.primaryColor,
              logoAsset: profile.logoAsset ? { url: profile.logoAsset.url } : null,
            }
          : null
      }
    />
  );
}
