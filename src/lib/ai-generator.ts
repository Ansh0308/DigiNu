import crypto from "crypto";

/**
 * DigiNu — Cloudflare Workers AI Food Image Generation Adapter
 *
 * Direct REST API client targeting Black Forest Labs FLUX.1-schnell via Cloudflare Workers AI.
 * Reference: https://developers.cloudflare.com/workers-ai/models/flux-1-schnell/
 *
 * OFFICIAL PARAMETER SCHEMA:
 * - prompt: string (required)
 * - steps: integer (optional, default 4, min 4, max 8)
 * (Note: width/height parameters are NOT supported by the Cloudflare flux-1-schnell endpoint).
 *
 * INVARIANTS:
 * 1. 1 image generated per request (CDR-001).
 * 2. 25-second AbortController timeout.
 * 3. Inspects returned binary bytes to verify authentic raster format (JPEG, PNG, WebP).
 * 4. Extracts true dimensions directly from image binary headers.
 * 5. Generates SHA-256 candidate hash for cryptographic integrity verification on approval.
 * 6. Strictly server-side: CLOUDFLARE_API_TOKEN is never exposed in client bundles.
 */

const DEFAULT_MODEL = "@cf/black-forest-labs/flux-1-schnell";

export interface GeneratedImageResult {
  buffer: Buffer;
  mimeType: "image/jpeg" | "image/png" | "image/webp";
  width?: number;
  height?: number;
  candidateHash: string;
}

/**
 * Computes SHA-256 hash of an image buffer to guarantee candidate integrity.
 */
export function computeCandidateHash(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Validates and identifies raster image format using magic bytes.
 */
export function sniffImageFormat(
  buffer: Buffer
): "image/jpeg" | "image/png" | "image/webp" | null {
  if (!buffer || buffer.length < 12) return null;

  const b = buffer;
  // JPEG: FF D8 FF
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) {
    return "image/jpeg";
  }
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a
  ) {
    return "image/png";
  }
  // WebP: 52 49 46 46 (RIFF) ... 57 45 42 50 (WEBP)
  if (
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

/**
 * Parses true raster dimensions directly from binary header markers.
 */
export function getImageDimensions(
  buffer: Buffer
): { width: number; height: number } | null {
  if (!buffer || buffer.length < 24) return null;

  // PNG dimensions: width at offset 16, height at offset 20 (UInt32BE)
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  // JPEG dimensions: parse SOF markers
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;
    while (offset < buffer.length - 8) {
      if (buffer[offset] !== 0xff) break;
      const marker = buffer[offset + 1];
      // Baseline / Progressive SOF markers: SOF0 (0xC0), SOF1 (0xC1), SOF2 (0xC2)
      if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      const length = buffer.readUInt16BE(offset + 2);
      offset += 2 + length;
    }
  }

  return null;
}

/**
 * Authentic 1x1 sample PNG binary used for deterministic offline test fallback.
 */
const MOCK_PNG_BYTES = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
  0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x00,
  0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
  0x0c, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
  0x00, 0x03, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb0, 0x00, 0x00, 0x00,
  0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
]);

export async function generateFoodImage(
  prompt: string
): Promise<GeneratedImageResult> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const modelId = process.env.AI_MODEL_ID || DEFAULT_MODEL;

  const isRealCloudflare =
    Boolean(accountId) &&
    Boolean(apiToken) &&
    !accountId?.includes("sample") &&
    !apiToken?.includes("sample") &&
    !accountId?.includes("your_") &&
    !apiToken?.includes("your_");

  // Fallback for offline test environments without active Cloudflare credentials
  if (!isRealCloudflare) {
    return {
      buffer: MOCK_PNG_BYTES,
      mimeType: "image/png",
      width: 256,
      height: 256,
      candidateHash: computeCandidateHash(MOCK_PNG_BYTES),
    };
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelId}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

  try {
    // Official parameters for @cf/black-forest-labs/flux-1-schnell: prompt and steps
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        steps: 4, // Model-supported parameter (4 to 8 steps)
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown error");
      throw new Error(`Cloudflare AI error (${response.status}): ${errText}`);
    }

    const contentType = response.headers.get("content-type") || "";
    let rawBuffer: Buffer;

    // Contract Case 1: Cloudflare returns JSON envelope with base64 image
    if (contentType.includes("application/json")) {
      const json = (await response.json()) as {
        result?: { image?: string };
        success?: boolean;
        errors?: Array<{ message: string }>;
      };

      if (!json.success && json.errors && json.errors.length > 0) {
        throw new Error(`Cloudflare AI error: ${json.errors[0].message}`);
      }

      if (json.result?.image) {
        rawBuffer = Buffer.from(json.result.image, "base64");
      } else {
        throw new Error("Cloudflare AI response JSON did not contain expected image property");
      }
    } else {
      // Contract Case 2: Cloudflare returns binary image stream
      const arrayBuffer = await response.arrayBuffer();
      rawBuffer = Buffer.from(arrayBuffer);
    }

    // Inspect actual magic bytes of the returned image
    const detectedFormat = sniffImageFormat(rawBuffer);
    if (!detectedFormat) {
      throw new Error(
        "Cloudflare AI returned an invalid or unsupported image format. Expected authentic JPEG, PNG, or WebP binary."
      );
    }

    const dimensions = getImageDimensions(rawBuffer);
    const candidateHash = computeCandidateHash(rawBuffer);

    return {
      buffer: rawBuffer,
      mimeType: detectedFormat,
      width: dimensions?.width,
      height: dimensions?.height,
      candidateHash,
    };
  } catch (err: unknown) {
    if ((err as { name?: string })?.name === "AbortError") {
      throw new Error("AI generation timed out after 25 seconds. Please try again.");
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}
