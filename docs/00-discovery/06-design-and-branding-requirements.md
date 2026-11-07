# 06 — Design System & Branding Requirements

**Document Version:** 1.0  
**Phase:** 00 — Product Discovery  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Dual-Experience Design Philosophy

DigiNu requires two visually distinct yet cohesive design languages:

```
+-----------------------------------------------------------------------------------+
|                            DUAL DESIGN ARCHITECTURE                               |
+-----------------------------------------------------------------------------------+
| Experience A: Public Customer Menu        | Experience B: Owner Admin Dashboard   |
|-------------------------------------------|---------------------------------------|
| Target: Diner on Mobile at Table          | Target: Restaurant Owner / Floor Mgr  |
| Aesthetic: High-end, Appetizing, Elegant  | Aesthetic: Clean, Functional, Fast    |
| Density: Visual, spacious, image-forward  | Density: Data-efficient, organized    |
| Form Factor: 95% Smartphone (iOS/Android) | Form Factor: Desktop, Tablet & Mobile |
| Branding: 100% White-Labeled to Venue     | Branding: Clean Neutral Studio Theme  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Public Menu UX & Visual Standards

### 2.1 Mobile-First Ergonomics & Thumb Zone `[CONFIRMED]`
* **Single-Handed Navigation:** Core navigation elements (category pills, search trigger, filter toggles, item detail dismissals) are anchored within comfortable reach of the mobile thumb zone.
* **Sticky Category Navigation:** The category bar docks smoothly at the top upon scrolling, displaying horizontally scrollable pills with active indicators.
* **Haptic & Visual Feedback:** Buttons, pills, and expandable cards provide subtle, tactile touch responses (active scale transforms and color shifts) without distracting animations.

### 2.2 Culinary Visual Hierarchy & Card Styles `[CONFIRMED]`
* **Image Dominance:** Food photography must be treated with premier visual prominence. Aspect ratios should be consistent (4:3 or 1:1), with gentle rounded corners (`rounded-xl` or `12px`) and subtle drop shadows (`shadow-sm`).
* **Typographic Contrast:**
  * Dish Title: Semibold, high-contrast, legible in dim restaurant lighting.
  * Price: Clear, distinct, formatted with appropriate currency glyph.
  * Description: Muted neutral tone (e.g., `#4B5563` on white), readable at 14px with generous line height (1.5).
* **Dietary Badges & Micro-Copy:**
  * Universal Veg / Non-Veg icons displayed adjacent to dish titles.
  * Allergen and dietary pills rendered in subtle pastel backgrounds with bold text to avoid visual noise while preserving instant readability.

---

## 3. Private Owner Dashboard UX Standards `[CONFIRMED]`

* **Zero-Learning-Curve UI:** Restaurant owners are busy culinary professionals, not tech-savvy administrators. Forms must be concise, auto-saving where appropriate, and free of cryptic developer jargon.
* **Touch-Friendly on Tablets & Phones:** Floor managers frequently update menus on iPads or their personal iPhones. All tap targets are at least 44x44 points.
* **Clear State Indicators:**
  * Visual toggles for `Available` (Bright Green) vs. `Sold Out` (Subtle Muted Grey).
  * Prominent loading spinners and cooking animations during AI image generation.
  * Destructive action safeguards (explicit confirmation modal before deleting a dish or category).

---

## 4. White-Label Theming & Customization Architecture `[CONFIRMED]`

To maintain a single codebase while giving each restaurant an authentic, custom-branded experience, the UI dynamically consumes a tenant design token payload:

```json
{
  "theme": {
    "primaryColor": "#C0392B",
    "primaryColorContrast": "#FFFFFF",
    "accentColor": "#F39C12",
    "backgroundPreset": "clean-white",
    "fontPairing": "modern-sans",
    "cardLayout": "standard-horizontal",
    "logoUrl": "https://cdn.diginu.app/logos/bella-italia.webp",
    "coverUrl": "https://cdn.diginu.app/covers/bella-italia.webp"
  }
}
```

### 4.1 Configurable Design Tokens
1. **Primary Brand Color:** Dynamic CSS variable `--color-brand-primary` mapped to category tabs, buttons, accent borders, and highlights.
2. **Background Presets:**
   * **Clean White:** `#FFFFFF` canvas with crisp `#111827` typography. Ideal for modern cafes, brunch spots, and daytime bistros.
   * **Warm Cream / Linen:** `#FAF8F5` canvas with rich `#292524` warm-charcoal typography. Ideal for Italian trattorias, bakeries, and artisanal spots.
   * **Midnight Charcoal:** `#121212` canvas with crisp `#F9FAFB` typography. Ideal for upscale steakhouses, cocktail lounges, and evening dining.
3. **Typography Presets:**
   * **Modern Sans:** Inter / Plus Jakarta Sans (Clean, legible, contemporary).
   * **Classic Editorial Serif:** Playfair Display / Cormorant Garamond headings paired with Inter body (Upscale, traditional dining).
4. **Card Layout Modes `[RECOMMENDATION]`:**
   * **Horizontal Media Card (Default):** Image on left (or right), text and price alongside. Highly space-efficient for large menus.
   * **Full-Width Hero Card:** Large prominent image on top with text below. Ideal for cafes or cocktail bars with fewer, visually striking items.

---

## 5. Responsive Breakpoint Matrix

| Viewport Category | Screen Width Range | Target Devices & Scenarios |
| :--- | :--- | :--- |
| **Mobile Compact** | 360px – 390px | iPhone SE, standard Android smartphones (primary customer menu viewport). |
| **Mobile Standard** | 391px – 430px | iPhone 14/15/16 Pro Max, modern Samsung Galaxy (optimal public menu experience). |
| **Tablet Portrait** | 768px – 834px | iPad Mini, iPad Air (used by restaurant managers on the floor). |
| **Desktop / Laptop**| 1024px – 1920px| Laptops and desktop screens used for intensive initial menu setup by owner or freelancer. |

---

## 6. Accessibility & Lighting Considerations (WCAG 2.1 AA)

* **Contrast Compliance:** Minimum contrast ratio of 4.5:1 for body text and 3:1 for large headings against background colors across all theme presets.
* **Low-Light Restaurant Usability:** High contrast ensures diners in candlelit or dimly lit evening restaurants can effortlessly read descriptions and prices without straining or turning on phone flashlights.
* **Alternative Text:** All food imagery generates programmatic `alt` text incorporating dish name and key ingredients for screen readers.
* **Clear Touch Targets:** Minimum button and link dimension of 44px x 44px for easy mobile interaction.

