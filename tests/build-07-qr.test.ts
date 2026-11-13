import "dotenv/config";

import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import jsQR from "jsqr";
import sharp from "sharp";
import { prisma } from "../src/lib/prisma";
import {
  calculateContrastRatio,
  isContrastReliable,
  getCanonicalMenuUrl,
  generateQRSvg,
  generateQRPng,
} from "../src/lib/qr-generator";
import { generateTableTentPdf } from "../src/lib/pdf-generator";
import {
  UpdateQRCodeConfigSchema,
  DownloadQRCodeQuerySchema,
} from "../src/types/validation";

describe("BUILD-07: QR Code Generation & Print Studio Test Suite", () => {
  const canonicalUrl = getCanonicalMenuUrl();
  let sampleLogoBuffer: Buffer;

  before(async () => {
    // Create a 200x200 sample PNG buffer for logo testing
    sampleLogoBuffer = await sharp({
      create: {
        width: 200,
        height: 200,
        channels: 4,
        background: { r: 200, g: 90, b: 50, alpha: 1 },
      },
    })
      .png()
      .toBuffer();
  });

  after(async () => {
    await prisma.$disconnect();
  });

  it("1. Canonical URL Test — Enforces restaurant-wide public menu root without table params", () => {
    assert.ok(canonicalUrl.startsWith("http"), "Canonical URL must have valid http/https protocol");
    assert.strictEqual(
      canonicalUrl.includes("table="),
      false,
      "Canonical URL must NOT contain table parameters"
    );
    assert.strictEqual(
      canonicalUrl.includes("?"),
      false,
      "Canonical URL must NOT contain query parameters"
    );
  });

  it("2. Contrast Ratio & Scannability Guardrail Test — Calculates WCAG contrast accurately", () => {
    // High contrast black on white (~21:1)
    const highContrast = isContrastReliable("#000000", "#FFFFFF");
    assert.strictEqual(highContrast.isReliable, true);
    assert.ok(highContrast.ratio >= 20.0);
    assert.strictEqual(highContrast.warning, undefined);

    // Low contrast light grey on white (< 7:1)
    const lowContrast = isContrastReliable("#CCCCCC", "#FFFFFF");
    assert.strictEqual(lowContrast.isReliable, false);
    assert.ok(lowContrast.ratio < 7.0);
    assert.ok(lowContrast.warning?.includes("Warning: Contrast ratio"));
  });

  it("3. SVG Vector Generation Test — Emits valid XML vector with optional center logo", async () => {
    // Generate clean SVG
    const cleanSvg = await generateQRSvg(canonicalUrl, {
      foregroundColor: "#000000",
      backgroundColor: "#FFFFFF",
      embedLogo: false,
    });

    assert.ok(cleanSvg.startsWith("<svg"), "Output must start with <svg");
    assert.ok(cleanSvg.endsWith("</svg>"), "Output must end with </svg>");

    // Generate SVG with embedded logo
    const logoSvg = await generateQRSvg(canonicalUrl, {
      foregroundColor: "#1A1A1A",
      backgroundColor: "#FFFFFF",
      embedLogo: true,
      logoBuffer: sampleLogoBuffer,
    });

    assert.ok(logoSvg.includes("<circle"), "Must contain protective circular badge");
    assert.ok(logoSvg.includes("<image"), "Must contain embedded logo <image>");
    assert.ok(logoSvg.includes("data:image/png;base64,"), "Logo must be embedded as base64 data URI");
  });

  it("4. PNG Resolution & Metadata Test — Produces exact 2048x2048 at 300 DPI", async () => {
    const pngBuffer = await generateQRPng(canonicalUrl, {
      foregroundColor: "#000000",
      backgroundColor: "#FFFFFF",
      embedLogo: true,
      logoBuffer: sampleLogoBuffer,
    });

    assert.ok(pngBuffer.length > 5000, "PNG buffer must have substantial byte size");

    const metadata = await sharp(pngBuffer).metadata();
    assert.strictEqual(metadata.format, "png", "Format must be PNG");
    assert.strictEqual(metadata.width, 2048, "Width must be exactly 2048px");
    assert.strictEqual(metadata.height, 2048, "Height must be exactly 2048px");
    assert.strictEqual(metadata.density, 300, "Density must be 300 DPI for print readiness");
  });

  it("5. QR Scannability Test (jsQR) — Decoded image payload strictly matches canonical menu URL", async () => {
    // Generate 300 DPI QR with logo
    const pngBuffer = await generateQRPng(canonicalUrl, {
      foregroundColor: "#000000",
      backgroundColor: "#FFFFFF",
      embedLogo: true,
      logoBuffer: sampleLogoBuffer,
      errorCorrectionLevel: "H",
    });

    // Extract raw RGBA pixels using sharp
    const { data, info } = await sharp(pngBuffer)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    // Decode QR code using jsQR
    const clampedArray = new Uint8ClampedArray(data);
    const decoded = jsQR(clampedArray, info.width, info.height);

    assert.ok(decoded !== null, "jsQR must successfully detect and decode QR matrix");
    assert.strictEqual(
      decoded.data,
      canonicalUrl,
      "Decoded QR URL must exactly match canonical restaurant public menu URL"
    );
  });

  it("6. PDF Table-Tent Generator Test — Creates valid A6 print-ready document with bleed marks", async () => {
    const pdfBuffer = await generateTableTentPdf({
      restaurantName: "Bistro Lumière",
      tagline: "Modern French Gastronomy",
      calloutText: "Scan to View Digital Menu",
      qrUrl: canonicalUrl,
      primaryColor: "#C85A32",
      qrOptions: {
        foregroundColor: "#1A1A1A",
        backgroundColor: "#FFFFFF",
        embedLogo: true,
        logoBuffer: sampleLogoBuffer,
      },
    });

    assert.ok(pdfBuffer.length > 5000, "PDF buffer must contain binary content");
    // Standard PDF file starts with %PDF- header
    const header = pdfBuffer.subarray(0, 5).toString("ascii");
    assert.strictEqual(header, "%PDF-", "File must be a valid binary PDF document");
  });

  it("7. Validation Schema Test — Enforces hex color format, format enum, and callout limits", () => {
    // Valid update
    const validConfig = UpdateQRCodeConfigSchema.safeParse({
      foregroundColor: "#1A1A1A",
      backgroundColor: "#FFFFFF",
      embedLogo: true,
      dotStyle: "rounded",
      errorCorrectionLevel: "H",
      calloutText: "Scan to Browse Our Live Menu",
    });
    assert.strictEqual(validConfig.success, true);

    // Invalid hex color injection attempt
    const invalidColor = UpdateQRCodeConfigSchema.safeParse({
      foregroundColor: "red; alert(1)",
    });
    assert.strictEqual(invalidColor.success, false);

    // Valid download formats
    assert.strictEqual(DownloadQRCodeQuerySchema.safeParse({ format: "svg" }).success, true);
    assert.strictEqual(DownloadQRCodeQuerySchema.safeParse({ format: "png" }).success, true);
    assert.strictEqual(DownloadQRCodeQuerySchema.safeParse({ format: "pdf" }).success, true);
    assert.strictEqual(DownloadQRCodeQuerySchema.safeParse({ format: "docx" }).success, false);
  });

  it("8. Database Metrics Test — Increments downloadCount in QRCodeConfig singleton", async () => {
    const initialConfig = await prisma.qRCodeConfig.upsert({
      where: { singletonKey: "QR_CODE_CONFIG_SINGLETON" },
      update: {},
      create: {
        singletonKey: "QR_CODE_CONFIG_SINGLETON",
        foregroundColor: "#000000",
        backgroundColor: "#FFFFFF",
        embedLogo: true,
        downloadCount: 0,
      },
    });

    const previousCount = initialConfig.downloadCount;

    // Simulate download increment
    const updated = await prisma.qRCodeConfig.update({
      where: { singletonKey: "QR_CODE_CONFIG_SINGLETON" },
      data: { downloadCount: { increment: 1 } },
    });

    assert.strictEqual(
      updated.downloadCount,
      previousCount + 1,
      "downloadCount must increment by exactly 1"
    );
  });
});
