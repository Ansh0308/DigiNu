# Layout Grid & Responsive Design Rules — DigiNu

**Document Version:** 1.0  
**Phase:** 03 — UI/UX Design, Branding & Design System  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Mobile-First Responsive Philosophy

Because **95%+ of customer menu traffic originates from table QR code scans on smartphones**, DigiNu is engineered strictly **mobile-first**:

* **Base Viewport:** Designed natively for 390x844px (iPhone 14/15/16) and scaled gracefully down to 360px (iPhone SE) and up to tablets and desktops.
* **Ergonomic Thumb Zone:** Primary navigation controls (sticky category pills, search bar, dietary filters, item detail dismissals) are anchored within comfortable reach of one-handed thumb interaction.
* **Intelligent Adaptation:** The interface does not merely stretch on larger screens; it transitions from a single-column vertical media stream on smartphones into an organized multi-column culinary catalog on tablets and desktops.

---

## 2. Breakpoint Architecture

```
+-----------------------------------------------------------------------------------------+
|                               RESPONSIVE BREAKPOINT SYSTEM                              |
+-----------------------------------------------------------------------------------------+
| Breakpoint Key | Viewport Range  | Target Hardware Devices       | Customer Layout Mode |
|----------------|-----------------|-------------------------------|----------------------|
| `xs` (Compact) | 360px – 389px   | iPhone SE, Small Androids     | 1-Col Compact Stack  |
| `sm` (Standard)| 390px – 430px   | iPhone 15/16, Galaxy S24      | 1-Col Standard Media |
| `md` (Tablet)  | 768px – 1023px  | iPad Mini, iPad Air, Surface  | 2-Column Dish Grid   |
| `lg` (Desktop) | 1024px – 1439px | Laptops, Desktop Browsers     | 2–3 Col Centered Max |
| `xl` (Wide)    | 1440px+         | Ultra-wide Monitors           | Capped at 1200px max |
+-----------------------------------------------------------------------------------------+
```

---

## 3. Customer Menu Grid & Container Rules

### 3.1 Mobile Layout (`xs` to `sm`: 360px–430px)
* **Container Margins (Gutter):** `16px` (`px-4`) on mobile screens.
* **Category Bar Behavior:** Fixed sticky bar at top of screen (`top-0`, `z-40`) with `-mx-4 px-4` horizontal overflow scrolling. Category pills do not wrap; they scroll smoothly with `scrollbar-none` and fade edges.
* **Food Cards:** Single-column stacked cards with a `12px` vertical gap (`space-y-3`).
* **Card Anatomy on Mobile:**
  - Standard Card: 4:3 or 1:1 image (100x100px or full-width 360x200px) paired with title, price, and description.
  - Safe Area Padding: Bottom of menu includes `pb-12` plus `env(safe-area-inset-bottom)` to prevent iOS home indicator clipping.

### 3.2 Tablet & Desktop Layout (`md` to `lg`: 768px+)
* **Container Margins:** `24px` to `32px` (`px-6` to `px-8`).
* **Max Container Width:** Centered container capped at `1152px` (`max-w-6xl mx-auto`).
* **Category Navigation:** Horizontal pill bar with visible scroll arrows, or optional left-anchored sticky index sidebar.
* **Food Cards:** 2-column CSS Grid (`grid grid-cols-1 md:grid-cols-2 gap-5`).

---

## 4. Owner Dashboard Responsive Grid (`/admin`)

The private management dashboard adapts across three form factors:

```
+-----------------------------------------------------------------------------------------+
|                               OWNER DASHBOARD LAYOUT MODES                              |
+-----------------------------------------------------------------------------------------+
| Device Type    | Viewport Width | Sidebar Navigation Mode    | Main Content Area        |
|----------------|----------------|----------------------------|--------------------------|
| **Desktop**    | >= 1024px      | Fixed 260px Left Sidebar   | Fluid Canvas (p-8)       |
| **Tablet**     | 768px–1023px   | Collapsible 72px Icon Bar  | Fluid Canvas (p-6)       |
| **Mobile**     | < 768px        | Off-canvas Slide-out Drawer| Single-Column Stack (p-4)|
+-----------------------------------------------------------------------------------------+
```

* **Mobile Floor Management:** Restaurant owners frequently 86 dishes during service using an iPhone. The dish list displays large 44px tap targets for the `Available` vs `Sold Out` switch directly on mobile screens without requiring horizontal scrolling.

---

## 5. Touch Target & Safe Area Rules

* **Minimum Interactive Touch Target:** `44px x 44px` enforced across all buttons, category chips, search toggles, and modal dismiss buttons.
* **Safe Area Insets:** Applied to all sticky headers and bottom drawers:
  ```css
  .sticky-header {
    padding-top: max(12px, env(safe-area-inset-top));
  }
  .bottom-drawer {
    padding-bottom: max(24px, env(safe-area-inset-bottom));
  }
  ```

