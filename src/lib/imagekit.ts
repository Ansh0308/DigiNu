import ImageKit from "imagekit";

/**
 * ImageKit Server-Side SDK Singleton
 *
 * CRITICAL SECURITY INVARIANT:
 * IMAGEKIT_PRIVATE_KEY is strictly server-side. It is NEVER exposed to client bundles,
 * logged to the console, or returned in any API response envelope.
 */
export const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
});

/**
 * Returns standard ImageKit URL transformation query string based on design tokens
 */
export function getImageKitTransformUrl(
  baseEndpoint: string,
  filePath: string,
  transformPreset: "food_thumb" | "food_modal" | "logo" | "banner" | "admin_thumb"
): string {
  const cleanEndpoint = baseEndpoint.replace(/\/+$/, "");
  const cleanPath = filePath.replace(/^\/+/, "");

  let tr = "";
  switch (transformPreset) {
    case "food_thumb":
      tr = "tr=w-200,h-200,c-at_max,f-webp,q-85";
      break;
    case "food_modal":
      tr = "tr=w-800,h-600,c-at_max,f-webp,q-90";
      break;
    case "logo":
      tr = "tr=w-200,h-200,c-maintain_ratio,f-webp";
      break;
    case "banner":
      tr = "tr=w-1200,h-400,c-at_max,f-webp,q-85";
      break;
    case "admin_thumb":
      tr = "tr=w-100,h-100,c-at_max,f-webp,q-80";
      break;
  }

  return `${cleanEndpoint}/${cleanPath}?${tr}`;
}

