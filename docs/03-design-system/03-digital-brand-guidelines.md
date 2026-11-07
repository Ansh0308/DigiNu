# Digital Brand Guidelines & White-Label Architecture — DigiNu

**Document Version:** 1.0  
**Phase:** 03 — UI/UX Design, Branding & Design System  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Dual-Brand Architectural Model

DigiNu operates on a strict **Dual-Brand Principle**:

```
+-----------------------------------------------------------------------------------------+
|                                DUAL-BRAND ARCHITECTURE                                  |
+-----------------------------------------------------------------------------------------+
| 1. DIGINU MASTER IDENTITY (Platform Brand)                                              |
| - Target: Freelance developer selling to restaurant owners                              |
| - Touchpoints: Admin Dashboard, QR Code Studio, System Alerts                           |
| - Aesthetic: Neutral, modern, dark slate (#0F172A), crisp indigo accents (#6366F1)      |
|-----------------------------------------------------------------------------------------|
| 2. WHITE-LABEL CLIENT IDENTITY (Tenant Brand)                                           |
| - Target: Diners seated at dining tables                                                |
| - Touchpoints: Public Mobile Menu (/), Table QR Display Cards                           |
| - Aesthetic: 100% white-labeled to the restaurant's logo, colors, and culinary ambiance |
+-----------------------------------------------------------------------------------------+
```

---

## 2. White-Label Customization Boundaries

To ensure the public menu feels authentic to the restaurant while preventing non-technical owners from breaking responsiveness or accessibility, DigiNu enforces strict boundaries:

### 2.1 Invariant System Elements (Non-Configurable by Owner)
These elements are hardcoded into DigiNu's component engine to guarantee production-grade stability:
* **8px Spatial Grid & Rhythm:** Margins, paddings, and card gaps.
* **Responsive Breakpoints:** 360px, 390px, 768px, 1024px.
* **Component Geometry:** 12px rounded card radii (`rounded-xl`), 8px button radii (`rounded-lg`).
* **Motion Physics:** Calibrated spring curves, ease-outs, and staggered entrance timings.
* **WCAG 2.2 AA Contrast Flooring:** Minimum text contrast ratio of 4.5:1 against chosen backgrounds.
* **Zero Ordering/Cart Interactions:** No shopping cart or transaction UI can be injected.

### 2.2 Configurable Tenant Design Tokens (Configured in Database)
Stored in the deployment's `restaurant_profile` table and mapped to CSS variables at runtime:

```css
:root {
  /* Dynamic Restaurant Brand Tokens */
  --brand-primary: #C85A32;          /* Configured Primary Brand Color (Warm Terracotta) */
  --brand-primary-fg: #FFFFFF;       /* Auto-calculated Accessible Contrast Text */
  --brand-primary-hover: #B04A24;    /* Primary Brand Hover Tone */
  --brand-accent: #F59E0B;           /* Secondary Warm Accent */
  
  /* Theme Preset Variables (e.g. Warm Cream) */
  --canvas-bg: #FAF8F5;              /* Canvas Background */
  --surface-card: #FFFFFF;           /* Dish Card Surface */
  --surface-border: #EFECE6;         /* Subtle Hairline Card Border */
  --text-primary: #1C1917;           /* Main Heading & Dish Title */
  --text-muted: #78716C;             /* Dish Description & Microcopy */
  
  /* Typography Pairing Preset */
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Plus Jakarta Sans', sans-serif;
}
```

---

## 3. Brand Asset Specifications

### 3.1 Restaurant Logo
* **Primary Dimensions:** Recommended 400x400px (1:1 aspect ratio).
* **Accepted Formats:** PNG (transparent background preferred), WebP, SVG. Max 2MB.
* **Presentation Modes:** Rendered within a clean circular or rounded-square avatar with a 2px subtle white/neutral border and soft drop shadow (`shadow-md`) to ensure legibility across all banner imagery.

### 3.2 Cover Hero Banner
* **Primary Dimensions:** Recommended 1600x600px (8:3 or 16:9 aspect ratio).
* **Accepted Formats:** JPEG, WebP. Max 5MB (automatically compressed to WebP via ImageKit).
* **Overlay Protection:** A dynamic 35% dark gradient vignette is automatically applied over the bottom half of the cover banner to guarantee white typography and logo contrast regardless of image brightness.

---

## 4. Theme Presets & Color Harmonization

When an owner selects their brand color in the dashboard, the system validates the color and calculates accessible foreground pairings:

```
+-----------------------------------------------------------------------------------------+
|                               THEME PRESET HARMONY MATRIX                               |
+-----------------------------------------------------------------------------------------+
| Preset Key          | Canvas Tone | Surface Card | Primary Text | Default Accent Color  |
|---------------------|-------------|--------------|--------------|-----------------------|
| `clean-white`       | #FFFFFF     | #F9FAFB      | #111827      | #2563EB (Cobalt Blue) |
| `warm-cream`        | #FAF8F5     | #FFFFFF      | #1C1917      | #C85A32 (Terracotta)  |
| `midnight-charcoal` | #0F0F11     | #18181B      | #F4F4F5      | #D97706 (Brushed Gold)|
+-----------------------------------------------------------------------------------------+
```

### Contrast Guardrail Engine
If an owner enters an ultra-light primary color (e.g., `#FFFF00` yellow) that fails WCAG contrast on a white background, the system automatically adjusts the active tab indicator from a text color fill to a solid background pill with dark text, guaranteeing readable category navigation.

