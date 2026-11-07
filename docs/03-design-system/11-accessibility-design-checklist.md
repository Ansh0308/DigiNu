# Accessibility Design Checklist (WCAG 2.2 AA Target) — DigiNu

**Document Version:** 1.0  
**Phase:** 03 — UI/UX Design, Branding & Design System  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Accessibility Policy & Target Standard

DigiNu is designed against the **Web Content Accessibility Guidelines (WCAG) 2.2 Level AA**.

> [!NOTE]
> This document specifies the design guidelines, contrast thresholds, and testing checklists required to achieve WCAG 2.2 AA compliance. It serves as an engineering design standard; formal certification requires an empirical post-implementation audit.

---

## 2. Comprehensive Accessibility Checklist

### 2.1 Color & Visual Contrast (WCAG 1.4.3 & 1.4.11)
- [x] **Body Copy Contrast:** All body text (`#1C1917` on `#FAF8F5` or `#111827` on `#FFFFFF`) achieves a contrast ratio >= **7.2:1** (far exceeding the 4.5:1 minimum).
- [x] **Muted Descriptions:** Secondary text (`#78716C`) achieves >= **4.8:1** contrast against white surfaces.
- [x] **Dietary Badges:** Veg (green) and Non-Veg (red/brown) badges use dual coding: distinct shapes (square + circle dot) and explicit text labels (`(V) Veg`, `(NV) Non-Veg`) so information is never conveyed by color alone.
- [x] **Low-Light Dining Legibility:** The "Midnight Charcoal" dark preset provides high-contrast chalk-white typography (`#F4F4F5` on `#0F0F11`, ratio **16.5:1**) preventing eye strain in candlelit dining rooms.

### 2.2 Touch Ergonomics & Target Sizing (WCAG 2.5.8)
- [x] **Minimum Interactive Target:** Every button, tab, search toggle, close icon, and card tap target enforces a minimum interactive bounding box of **44px x 44px**.
- [x] **Target Separation:** Interactive elements (such as adjacent filter pills) maintain a minimum of `8px` spacing to prevent accidental mis-taps on mobile devices.

### 2.3 Keyboard Navigation & Focus Visibility (WCAG 2.4.7 & 2.4.11)
- [x] **Visible Focus Indicator:** All interactive controls display an unambiguous `2px` focus ring with a `2px` offset (`focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500`).
- [x] **Tab Order:** Logical DOM order matches visual layout (Banner -> Navigation Tabs -> Category Sections -> Food Cards).
- [x] **Modal Focus Trap:** Opening the dish detail drawer or AI studio modal locks keyboard focus inside the dialog; pressing `Escape` closes the dialog and restores focus to the triggering element.

### 2.4 Semantic Structure & Screen Readers (WCAG 1.3.1 & 4.1.2)
- [x] **Landmark Hierarchy:**
  - `<header>` (`role="banner"`): Restaurant title and branding.
  - `<nav>` (`role="navigation"`): Sticky category scroll-spy bar.
  - `<main>` (`role="main"`): Culinary catalog divided into `<section aria-labelledby="cat-id">`.
- [x] **Scroll-Spy Tablist:** Category bar uses `role="tablist"`, with individual tabs marked `role="tab"`, `aria-selected="true"`, and keyboard navigable via Arrow keys.
- [x] **Image Alt Text:** All dish imagery generates programmatic `alt` text:
  - Format: `alt="Crispy Calamari Fritti - Flash-fried squid with smoked garlic aioli"`
- [x] **Sold-Out Announcements:** Items marked 86 include programmatic text `<span class="sr-only">Currently sold out</span>` alongside visual badges.

### 2.5 Motion & Cognitive Safety (WCAG 2.2.2 & 2.3.3)
- [x] **Respect for `prefers-reduced-motion`:** All layout shifts, slides, and scaling animations are completely disabled when users have reduced motion enabled in their OS.
- [x] **Zero Flashing Elements:** No component flashes more than 3 times in any 1-second period (eliminating seizure risks).
- [x] **No Time Limits:** Diners browse at their own pace. There are zero session countdowns or expiring screens on the public menu.

