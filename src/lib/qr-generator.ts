import QRCode from "qrcode";
import sharp from "sharp";
import { prisma } from "@/lib/prisma";

export interface ContrastCheckResult {
  ratio: number;
  isReliable: boolean;
  warning?: string;
}

export interface QRGeneratorOptions {
  foregroundColor?: string;
  backgroundColor?: string;
  embedLogo?: boolean;
  logoBuffer?: Buffer | null;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  dotStyle?: string;
}

/**
 * Convert a 6-character hex color to RGB tuple.
 */
function hexToRgb(hex: string): [number, number, number] {
  const sanitized = hex.replace("#", "").trim();
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return [r, g, b];
}

/**
 * Calculate relative luminance according to WCAG 2.1 specs.
 */
function getRelativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two hex colors.
 */
export function calculateContrastRatio(fgHex: string, bgHex: string): number {
  try {
    const [r1, g1, b1] = hexToRgb(fgHex);
    const [r2, g2, b2] = hexToRgb(bgHex);
    const l1 = getRelativeLuminance(r1, g1, b1);
    const l2 = getRelativeLuminance(r2, g2, b2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    const ratio = (lighter + 0.05) / (darker + 0.05);
    return Math.round(ratio * 100) / 100;
  } catch {
    return 1.0;
  }
}

/**
 * Validate scannability contrast guardrail (threshold: 7:1 ratio).
 */
export function isContrastReliable(fgHex: string, bgHex: string): ContrastCheckResult {
  const ratio = calculateContrastRatio(fgHex, bgHex);
  const isReliable = ratio >= 7.0;
  return {
    ratio,
    isReliable,
    warning: isReliable
      ? undefined
      : `Warning: Contrast ratio is ${ratio.toFixed(1)}:1 (recommended >= 7.0:1). Low contrast may prevent older smartphone cameras from scanning this code.`,
  };
}

/**
 * Return the restaurant's canonical public menu URL.
 * DigiNu MVP enforces ONE restaurant-wide QR code per deployment.
 * Strictly NO table parameters, session tokens, or redirects.
 */
export function getCanonicalMenuUrl(): string {
  const rawUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  try {
    const parsed = new URL(rawUrl);
    // Strip trailing slashes and query parameters for clean determinism
    return `${parsed.protocol}//${parsed.host}`;
  } catch {
    return "http://localhost:3000";
  }
}

/**
 * Fetch restaurant logo buffer from database media asset if configured.
 */
export async function getRestaurantLogoBuffer(): Promise<Buffer | null> {
  try {
    const profile = await prisma.restaurantProfile.findFirst({
      include: { logoAsset: true },
    });

    if (!profile?.logoAsset?.url) {
      return null;
    }

    const res = await fetch(profile.logoAsset.url);
    if (!res.ok) {
      return null;
    }

    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error) {
    console.error("[QRGenerator] Failed to fetch restaurant logo:", error);
    return null;
  }
}

/**
 * Generate scalable SVG vector representation of the QR Code.
 * Embeds restaurant center logo if requested with a protective white circular buffer.
 */
export async function generateQRSvg(
  url: string,
  options: QRGeneratorOptions = {}
): Promise<string> {
  const {
    foregroundColor = "#000000",
    backgroundColor = "#FFFFFF",
    embedLogo = true,
    logoBuffer = null,
    errorCorrectionLevel = "H",
  } = options;

  // Generate base SVG
  let svgString = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel,
    margin: 2,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
  });

  // If logo embedding is enabled and a buffer is available, composite center logo
  if (embedLogo && logoBuffer) {
    try {
      // Find viewBox or dimensions in the SVG
      const viewBoxMatch = svgString.match(/viewBox="0 0 (\d+) (\d+)"/);
      const widthMatch = svgString.match(/width="(\d+)"/);
      const heightMatch = svgString.match(/height="(\d+)"/);

      const size = viewBoxMatch
        ? parseInt(viewBoxMatch[1], 10)
        : widthMatch
        ? parseInt(widthMatch[1], 10)
        : 330;

      const center = size / 2;
      // Logo area occupies ~20-22% of total matrix width, well within 30% recovery of ECL 'H'
      const badgeRadius = Math.round(size * 0.125);
      const logoSize = Math.round(badgeRadius * 1.6);
      const logoOffset = center - logoSize / 2;

      // Convert logoBuffer to optimized circular PNG data URI
      const circularLogoBuffer = await sharp(logoBuffer)
        .resize(logoSize * 4, logoSize * 4, { fit: "cover" })
        .toFormat("png")
        .toBuffer();

      const logoBase64 = circularLogoBuffer.toString("base64");

      // Inject circular white protective buffer and centered logo before </svg>
      const overlaySvg = `
  <defs>
    <clipPath id="qr-logo-clip">
      <circle cx="${center}" cy="${center}" r="${badgeRadius * 0.85}" />
    </clipPath>
  </defs>
  <circle cx="${center}" cy="${center}" r="${badgeRadius}" fill="#FFFFFF" stroke="${backgroundColor}" stroke-width="${Math.max(1, Math.round(size * 0.008))}" />
  <image href="data:image/png;base64,${logoBase64}" x="${logoOffset}" y="${logoOffset}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid slice" clip-path="url(#qr-logo-clip)" />
</svg>`;

      svgString = svgString.replace("</svg>", overlaySvg);
    } catch (logoError) {
      console.warn("[QRGenerator] Could not overlay logo on SVG, falling back to clean QR:", logoError);
    }
  }

  return svgString.trim();
}

/**
 * Generate 300 DPI high-resolution PNG buffer (2048×2048) of the QR Code.
 */
export async function generateQRPng(
  url: string,
  options: QRGeneratorOptions = {}
): Promise<Buffer> {
  const {
    foregroundColor = "#000000",
    backgroundColor = "#FFFFFF",
    embedLogo = true,
    logoBuffer = null,
    errorCorrectionLevel = "H",
  } = options;

  const targetDimension = 2048;

  // Generate base PNG buffer at 2048x2048
  const baseQrBuffer = await QRCode.toBuffer(url, {
    type: "png",
    width: targetDimension,
    margin: 2,
    errorCorrectionLevel,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
  });

  if (!embedLogo || !logoBuffer) {
    // Return base QR with 300 DPI density metadata
    return await sharp(baseQrBuffer)
      .withMetadata({ density: 300 })
      .toBuffer();
  }

  try {
    // Dimensions for badge & logo overlay
    // Badge radius: 240px (diameter 480px, ~23% of 2048)
    const badgeDiameter = 480;
    const badgeRadius = badgeDiameter / 2;
    const logoDimension = 380;

    // Create white protective circular badge
    const badgeSvg = Buffer.from(`
      <svg width="${badgeDiameter}" height="${badgeDiameter}">
        <circle cx="${badgeRadius}" cy="${badgeRadius}" r="${badgeRadius}" fill="#FFFFFF" />
      </svg>
    `);

    // Create rounded circular mask for the logo
    const logoMaskSvg = Buffer.from(`
      <svg width="${logoDimension}" height="${logoDimension}">
        <circle cx="${logoDimension / 2}" cy="${logoDimension / 2}" r="${logoDimension / 2}" fill="#FFFFFF" />
      </svg>
    `);

    // Process logo: resize, apply circular mask
    const circularLogo = await sharp(logoBuffer)
      .resize(logoDimension, logoDimension, { fit: "cover" })
      .composite([{ input: logoMaskSvg, blend: "dest-in" }])
      .toFormat("png")
      .toBuffer();

    // Composite circular badge and circular logo onto the QR PNG
    const centerOffset = Math.round((targetDimension - badgeDiameter) / 2);
    const logoOffset = Math.round((targetDimension - logoDimension) / 2);

    const compositedBuffer = await sharp(baseQrBuffer)
      .composite([
        { input: badgeSvg, top: centerOffset, left: centerOffset },
        { input: circularLogo, top: logoOffset, left: logoOffset },
      ])
      .withMetadata({ density: 300 })
      .toBuffer();

    return compositedBuffer;
  } catch (error) {
    console.warn("[QRGenerator] Could not overlay logo on PNG, returning clean 300 DPI QR:", error);
    return await sharp(baseQrBuffer)
      .withMetadata({ density: 300 })
      .toBuffer();
  }
}
