# Imagery & Asset Guidelines — DigiNu

**Document Version:** 1.0  
**Phase:** 03 — UI/UX Design, Branding & Design System  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Culinary Visual Aesthetics Standard

In digital dining menus, visual imagery directly dictates customer appetite and dish sales. DigiNu enforces strict photographic quality benchmarks:

* **Camera Perspective:**
  - **Primary: 45-Degree Angled Culinary Macro:** Ideal for dishes with vertical dimension (burgers, stacked pasta, bowls, cocktails). Provides natural diner perspective.
  - **Secondary: Top-Down (Flat-Lay 90-Degree):** Ideal for pizzas, charcuterie platters, mezze spreads, and tapas.
* **Lighting:** Soft, directional window light with natural shadows. Specular highlights on glazes, dressings, and grilled textures. Harsh flash and fluorescent glare are strictly avoided.
* **Plateware & Styling:** Clean artisanal ceramic, textured stoneware, or rustic wood. Food must look fresh, appetizing, and intentionally garnished with micro-herbs, citrus wedges, or cracked pepper.

---

## 2. AI Food Photography Prompt Synthesis Engine

When an owner clicks `[Generate with AI]`, DigiNu transforms raw dish attributes into a structured neural prompt for Cloudflare Workers AI (`flux-1-schnell`):

### 2.1 Prompt Synthesis Formula
```text
[Subject Directive]: Professional commercial food photography of {dish_name}.
[Culinary Context]: {dish_description}, garnished with fresh culinary herbs, served on a high-end artisanal ceramic plate.
[Setting & Lighting]: Cozy upscale restaurant background, soft cinematic natural window lighting, 45-degree angled macro culinary shot, shallow depth of field with creamy bokeh background, glistening textures, subtle culinary steam rising.
[Quality Directives]: 8k resolution, Michelin-star presentation, photorealistic culinary magazine aesthetic.
```

### 2.2 Negative Prompt Directives (Embedded in Adapter)
* *Explicitly Excludes:* Plastic food, cartoon, 3D render, drawing, oversaturated colors, messy plating, distorted utensils, unnatural textures, blur, text, watermark, logo, human hands, human faces.

---

## 3. ImageKit.io URL Transformation Recipes

DigiNu offloads all image compression and responsive resizing to ImageKit edge CDNs via deterministic query parameters:

| Asset Role | Dimensions | Aspect Ratio | ImageKit Transformation Query | Target Payload Size |
| :--- | :--- | :---: | :--- | :---: |
| **Dish Thumbnail** | 400x400px | 1:1 | `?tr=w-400,h-400,fo-auto,f-webp,q-80` | **< 45 KB** |
| **Dish Modal Detail**| 1200x800px | 3:2 | `?tr=w-1200,h-800,f-webp,q-85` | **< 150 KB** |
| **Cover Hero Banner**| 1600x600px | 8:3 | `?tr=w-1600,h-600,f-webp,q-80` | **< 180 KB** |
| **Restaurant Logo** | 200x200px | 1:1 | `?tr=w-200,h-200,fo-auto,f-webp` | **< 20 KB** |
| **Blur-Up Shimmer** | 30x30px | 1:1 | `?tr=w-30,h-30,bl-6,f-webp,q-30` | **< 2 KB** |

---

## 4. Fallback & Placeholder Strategy

To ensure menus never display broken image icons:
1. **Shimmer Skeleton:** While high-resolution WebP images stream, a subtle pulsing grey-beige placeholder (`bg-stone-200 animate-pulse`) occupies the exact aspect ratio, preventing Cumulative Layout Shift (CLS = 0).
2. **Text-First Graceful Degradation:** If a dish has no photo assigned (neither uploaded nor AI-generated), the card renders in a compact, text-first editorial layout with elegant typography and border framing. It does not display a generic "missing camera" placeholder icon.

