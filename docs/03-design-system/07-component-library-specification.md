# Component Library Specification — DigiNu

**Document Version:** 1.0  
**Phase:** 03 — UI/UX Design, Branding & Design System  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Component Architecture Overview

DigiNu's UI is constructed from atomic, accessible, responsive components built with **React 19, TypeScript, and Tailwind CSS**.

```
+-----------------------------------------------------------------------------------------+
|                                DIGINU COMPONENT SUITE                                   |
+-----------------------------------------------------------------------------------------+
| PUBLIC CUSTOMER MENU COMPONENTS            | OWNER ADMIN DASHBOARD COMPONENTS           |
|--------------------------------------------|--------------------------------------------|
| 1. `RestaurantHero`                        | 9. `AdminSidebar`                          |
| 2. `CategoryNav` (Sticky Scroll-Spy)       | 10. `StatCard` (Animated Metric Tile)      |
| 3. `MenuItemCard` (Anatomy & Badges)       | 11. `AvailabilityToggle` (1-Tap 86 Switch) |
| 4. `ItemDetailDrawer` (Expanded Bottom Sheet)| 12. `AIStudioModal` (Signature UI)       |
| 5. `SearchBar` (Live Filter & Chips)       | 13. `ImageKitUploader` (Drag-and-Drop)     |
| 6. `DietaryBadge` & Allergen Tag           | 14. `CategoryReorderList` (Drag / Arrows)  |
| 7. `LoadingSkeleton` (Shimmer Placeholders)| 15. `QRPreviewCard` (Vector Studio)        |
| 8. `EmptyState` (Search & Operational)     | 16. `ToastNotification` (Floating Alert)   |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Public Customer Menu Components

### 2.1 Component: `RestaurantHero`
* **Purpose:** Introduces the restaurant's visual brand, operational status, and contact links immediately upon QR scan.
* **Variants:**
  - `DefaultWithBanner`: High-aspect cover image with centered logo avatar and details below.
  - `CompactHeader`: Subtle minimalist header without cover image (used in minimalist themes).
* **Props:** `name: string`, `tagline?: string`, `logoUrl?: string`, `bannerUrl?: string`, `isOpen: boolean`, `hoursText: string`, `phone?: string`, `address?: string`.
* **Interactive States:**
  - "Open Now" / "Closed" badge: Subtle green pulsing dot for open; muted grey for closed.
  - Tapping phone icon triggers device dialer (`tel:`).
* **Motion:** Hero banner reveals with a subtle zoom-out opacity fade (0.95 -> 1.0, 500ms).

---

### 2.2 Component: `CategoryNav` (Sticky Scroll-Spy)
* **Purpose:** Enables instant category hopping and visual orientation while scrolling.
* **Behavior:**
  - Docks smoothly at `top: 0` when the user scrolls past the hero banner.
  - Horizontal chip row with `-mx-4 px-4` touch scrolling.
  - Active category tab auto-highlights with the restaurant's primary brand color.
  - Tapping a tab triggers smooth programmatic scroll to that category's anchor.
* **Accessibility:** `role="tablist"`, with `aria-selected="true"` on the active category. Keyboard navigable with Arrow Left / Right.

---

### 2.3 Component: `MenuItemCard`
* **Purpose:** The core appetite touchpoint displaying food photography, dish title, price, description, and dietary tags.
* **Variants:**
  - `HorizontalMedia`: Image on left or right (100x100px), title and price alongside. Ideal for casual dining.
  - `HeroCard`: Full-width 16:9 prominent image with text below. Ideal for artisanal burgers, pizzas, cocktails.
* **Interactive States:**
  - **Normal Active:** Subtle card scale on hover (`scale-[1.01]`, 200ms ease-out). Tapping opens `ItemDetailDrawer`.
  - **Sold Out (86):** 50% opacity overlay applied across the entire card, with a bold high-contrast `[Sold Out Today]` badge over the image. Card remains tappable to view ingredients.
* **Price Presentation:** Formatted with tabular numbers to prevent jitter (`font-variant-numeric: tabular-nums`).

---

### 2.4 Component: `ItemDetailDrawer` (Expanded Bottom Sheet)
* **Purpose:** Expands from the bottom of mobile viewports when a dish is tapped, providing high-resolution photography, preparation story, and complete allergen advisory.
* **Props:** `item: MenuItem`, `isOpen: boolean`, `onClose: () => void`.
* **Motion Physics:** Smooth spring entrance from bottom (`translateY(100%) -> translateY(0)` with `springGentle` curve).
* **Dismissal:** Tap close button (`✕`), tap backdrop overlay, or swipe down gesture on mobile drag handle.
* **Accessibility:** `role="dialog"`, `aria-modal="true"`. Focus trapped within drawer while active; returns focus to triggering card upon dismissal.

---

### 2.5 Component: `SearchBar` & Dietary Filter Chips
* **Purpose:** Instant client-side dish filtering without server round-trips.
* **Features:**
  - Debounced input field (150ms debounce) matching titles, descriptions, and ingredients.
  - Clear icon (`✕`) appears when text is entered to restore full menu in 1 tap.
  - Quick filter chips: `[🌱 Pure Veg Only]`, `[🌾 Gluten-Free]`, `[⭐ Chef's Picks]`.
* **Animation:** Filtered cards animate into place via smooth FLIP layout transitions.

---

### 2.6 Component: `DietaryBadge`
* **Purpose:** Unmistakable visual dietary classification.
* **Variants:**
  - `VegIcon`: Classic green square border with green filled circle inside (14x14px).
  - `NonVegIcon`: Classic dark red/brown square border with filled circle inside (14x14px).
  - `DietaryChip`: Rounded pill badge (`text-xs font-semibold px-2 py-0.5`) for `Vegan`, `Gluten-Free`, `Halal`, `Dairy-Free`.
  - `SpicyLevel`: Rendered with 1 to 3 animated chili pepper glyphs (`🌶️`).

---

## 3. Owner Dashboard Components (`/admin`)

### 3.1 Component: `AvailabilityToggle` (1-Tap 86 Switch)
* **Purpose:** Enables floor managers to 86 sold-out dishes in 1 tap during busy service.
* **Visual States:**
  - `Available (Active)`: Emerald Green track (`bg-emerald-600`) with white toggle thumb on right.
  - `Sold Out (86)`: Subtle Slate Grey track (`bg-stone-300 dark:bg-stone-700`) with thumb on left.
* **Micro-Motion:** Toggle thumb snaps with snappy spring physics (`scale-[1.1]` during slide, 150ms).
* **Touch Target:** Minimum 44x44px invisible touch target wrapping the visual switch for effortless mobile operation.

---

### 3.2 Component: `AIStudioModal` (Signature UI)
* **Purpose:** Flagship culinary image generator modal.
* **Workflows Supported:**
  1. **Idle State:** Displays dish title, synthesized prompt preview, and remaining monthly credits.
  2. **Generating State:** Animated culinary cooking / glowing ambient state ("Chef AI is preparing your plating..."). Generation button is disabled and debounced.
  3. **Preview State:** Displays the generated high-resolution photo with zoom preview, **"Approve & Apply to Dish"** primary button, and **"Regenerate"** alternative button.
  4. **Approval Success:** Smooth transition showing image saved and linked to dish.

---

### 3.3 Component: `ImageKitUploader`
* **Purpose:** Direct client drag-and-drop photo upload to ImageKit CDN.
* **Features:**
  - Dropzone supporting JPG, PNG, WebP up to 5MB.
  - Instant client-side image preview before upload.
  - Progress bar during HMAC upload.
  - Rejection alert if file is non-image or exceeds 5MB.

---

### 3.4 Component: `CategoryReorderList`
* **Purpose:** Reordering menu categories via drag-and-drop or accessible up/down buttons.
* **Features:**
  - Tactile grab handle (`:::`) for mouse and touch dragging.
  - Up and Down arrow buttons for keyboard and screen-reader accessibility.
  - Instant visibility toggle switch (`Active` vs. `Hidden/Seasonal`).

---

### 3.5 Component: `QRPreviewCard`
* **Purpose:** Interactive preview and export studio for table QR codes.
* **Features:**
  - Real-time SVG rendering of QR code linked to canonical restaurant URL.
  - Center logo toggle with automatic error correction level H.
  - One-click export buttons: `[⬇️ Download Vector SVG]`, `[⬇️ Download 300 DPI PNG]`, `[⬇️ Table-Tent PDF]`.

