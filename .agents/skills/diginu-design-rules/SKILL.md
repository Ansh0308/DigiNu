---
name: diginu-design-rules
description: "Visual identity, design tokens, typography, motion, and component rules for DigiNu. Enforces Modern Editorial Dining styling, CSS custom property theming, Playfair Display typography, GPU-accelerated motion, and mobile-first responsive guidelines."
---

# DigiNu Design Rules & Visual Standards

This skill governs the visual styling, typography, motion physics, and component standards of the DigiNu platform. It translates the approved Phase 03 design system into strict development rules.

---

## 1. Aesthetic Direction: Modern Editorial Dining

The default visual identity is **Concept 1: Modern Editorial Dining**. The interface evokes a high-end culinary publication or bespoke printed menu: warm alabaster canvases, crisp typography, subtle shadows, and intentional whitespace.

### Core Token Palette:
* **Primary Accent (Warm Terracotta):** `--color-primary` = `#C85A32`
* **Primary Accent Hover:** `--color-primary-hover` = `#B04A24`
* **Canvas Base (Warm Alabaster):** `--color-canvas` = `#FDFCF7`
* **Surface Card (Crisp White):** `--color-surface` = `#FFFFFF`
* **Text Primary (Deep Charcoal):** `--color-text-primary` = `#1A1A1A`
* **Text Secondary (Slate Muted):** `--color-text-secondary` = `#6B635B`
* **Border Subtle:** `--color-border` = `#EFECE6`
* **Status Available:** `--color-status-available` = `#16A34A`
* **Status Sold Out (86):** `--color-status-sold-out` = `#DC2626`

---

## 2. White-Label Theming System

* **Never Hardcode Restaurant Branding:** Public customer pages must consume colors, fonts, and logos from CSS custom properties injected dynamically at root runtime based on `restaurant_profile`.
* **Theme Presets:**
  1. `warm-cream` (Default): `#FDFCF7` canvas, `#C85A32` terracotta accent.
  2. `clean-white`: `#FFFFFF` canvas, `#0F172A` deep navy/slate accent.
  3. `midnight-charcoal`: `#121214` dark canvas, `#E2E8F0` crisp silver text, `#E11D48` crimson accent.

---

## 3. Typographic Scale & Pairing

* **Headings & Display:** `Playfair Display` (serif)
  * Used for restaurant name, hero titles, category headers, and dish names.
  * Expresses artisanal craft, tradition, and culinary sophistication.
* **Body, Prices & UI:** `Plus Jakarta Sans` (geometric sans-serif)
  * Used for descriptions, ingredient lists, dietary badges, prices, and dashboard controls.
  * Exceptionally legible on low-resolution mobile screens under harsh ambient restaurant lighting.
* **Price Formatting:** Always apply `font-variant-numeric: tabular-nums` (Tailwind class `tabular-nums`) to ensure price numerals align vertically without jitter.

---

## 4. Mobile Layout & Thumb-Zone Ergonomics

* **Mobile-First Priority:** Customer menu is designed strictly for single-handed smartphone browsing (360px–430px).
* **Touch Targets:** Minimum touch target size for interactive controls (category pills, filter chips, item cards, drawer close buttons) is **44×44 CSS pixels**.
* **Safe Area Insets:** All fixed and sticky elements must apply iOS safe area insets:
  ```css
  padding-top: max(16px, env(safe-area-inset-top));
  padding-bottom: max(16px, env(safe-area-inset-bottom));
  ```
* **Aspect Ratios:** All dish image wrappers must specify `aspect-ratio: 16/9` (or `aspect-video`) with `overflow: hidden` to eliminate layout shift (CLS = 0.00).

---

## 5. Motion & Animation Physics

* **GPU Transforms Only:** 100% of transitions and animations must animate `transform: translate3d/scale` or `opacity`. Never animate `width`, `height`, `top`, or `margin`.
* **Timing Curves:**
  * Micro-interactions (button press, pill tap): `150ms ease-out`
  * Sheet sliding & modals: `300ms cubic-bezier(0.16, 1, 0.3, 1)` (spring release feel)
* **Reduced Motion:** When `@media (prefers-reduced-motion: reduce)` is active, completely disable spatial translation and substitute 100ms subtle opacity cross-fades.

