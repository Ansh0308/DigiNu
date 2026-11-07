# Customer Screen Specifications (Public Digital Menu) — DigiNu

**Document Version:** 1.0  
**Phase:** 03 — UI/UX Design, Branding & Design System  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Screen Catalog Overview

The Public Customer Menu is a mobile-first, zero-install, read-only web application accessible via table QR codes. It consists of 6 core screen states:

* **`SCR-CUST-01`:** Restaurant Menu Landing & Hero Section
* **`SCR-CUST-02`:** Category Navigation & Food Item Listing
* **`SCR-CUST-03`:** Dish Detail Bottom Sheet (Drawer)
* **`SCR-CUST-04`:** Live Search & Dietary Filtering
* **`SCR-CUST-05`:** Sold-Out (86'd) Item Card Presentation
* **`SCR-CUST-06`:** Empty & Outside Operating Hours States

---

## 2. Detailed Screen Specifications

### `SCR-CUST-01`: Restaurant Menu Landing & Hero Section

* **Screen ID:** `SCR-CUST-01`
* **Route:** `/` or `/menu`
* **PRD Mapping:** `FR-MENU-001`, `FR-MENU-002`, `FR-REUSE-001`
* **User Stories:** `US-CUST-001`
* **Primary User Goal:** Orient themselves immediately upon scanning the table QR code, verify restaurant identity, and jump into browsing food.
* **Primary Action:** Tap a category chip or begin scrolling.
* **Information Hierarchy:**
  1. Cover Banner Image (with subtle bottom dark gradient vignette).
  2. Restaurant Logo Avatar (centered or left-aligned, overlapping banner border).
  3. Restaurant Title (H1, 30–36px Display Serif/Sans).
  4. Tagline & Cuisine Classification (e.g. *"Authentic Tuscan Trattoria • Wood-Fired Pizza"*).
  5. Operational Status Badge (Dynamic pill: *"🟢 Open Now • Closes 10:00 PM"* or *"Currently Closed"*).
  6. Action Pills: [📍 Directions / Address], [📞 Call Restaurant], [ℹ️ Story & Wi-Fi].
* **Responsive Layout:**
  - **Mobile (< 768px):** Full-bleed cover banner (220px height) with centered logo avatar (80x80px); text centered with 16px margins.
  - **Tablet & Desktop (>= 768px):** Centered max-w-4xl container; banner height 320px; logo 100x100px.
* **Motion & Entrance:**
  - Banner fades in with gentle scale (0.97 -> 1.0, 450ms).
  - Logo and restaurant title reveal with staggered upward slide (30px offset, 300ms, 100ms stagger).
* **Accessibility:** Semantic `<header>` containing `<h1 itemprop="name">`. Operating status includes `aria-live="polite"`. Phone dialer uses standard `tel:` scheme.

---

### `SCR-CUST-02`: Category Navigation & Food Item Listing

* **Screen ID:** `SCR-CUST-02`
* **Route:** `/` (Main Body)
* **PRD Mapping:** `FR-MENU-003`, `FR-MENU-004`, `FR-MENU-005`
* **User Stories:** `US-CUST-002`, `US-CUST-003`
* **Primary User Goal:** Seamlessly browse dining categories and explore individual dishes with pricing and dietary indicators.
* **Primary Action:** Tap category tab or tap dish card to open detail drawer.
* **Components Required:** `CategoryNav`, `MenuItemCard`, `DietaryBadge`, `SearchBar`.
* **Behavior & Layout:**
  - **Sticky Category Bar:** As user scrolls past the hero, the category bar docks at viewport top (`top: 0`, `z-40`). As the diner scrolls past section headings, the category pill auto-centers horizontally and highlights with `--brand-primary`.
  - **Category Section:** Category title (H2, 22–24px) followed by optional subtitle (e.g., *"Handmade fresh daily using Italian 00 flour"*).
  - **Food Cards:** Rendered in a single-column stack on mobile (12px gap) and 2 columns on tablet/desktop.
  - **Card Content:** 100x100px food photo on left/right, dish title (Semibold 17px), tabular price tag (Bold 17px), 2-line short description, Veg/Non-Veg icon, and dietary chips (`[Gluten-Free]`, `[Chef's Pick]`).
* **Motion & Scroll Physics:**
  - Tapping a category pill smoothly scrolls the viewport to that category with an offset accounting for the sticky bar height (`scroll-margin-top: 64px`).
  - Cards reveal with subtle stagger as they scroll into view (Framer Motion / CSS scroll-driven animations).
* **Performance:** ImageKit responsive WebP images loaded lazily (`loading="lazy"`) with blur-up shimmer placeholders.

---

### `SCR-CUST-03`: Dish Detail Bottom Sheet (Expanded Drawer)

* **Screen ID:** `SCR-CUST-03`
* **Route:** Overlay (Triggered by tapping any food item card)
* **PRD Mapping:** `FR-MENU-006`
* **User Stories:** `US-CUST-003`
* **Primary User Goal:** Inspect high-resolution food photography, full ingredient stories, and allergen advisories before ordering verbally with waitstaff.
* **Primary Action:** Tap close button (`✕`) or drag down to dismiss.
* **Layout Structure:**
  1. Drag Handle indicator (for mobile swipe dismissal).
  2. High-Resolution Food Image (16:9 aspect ratio, 300px height on mobile).
  3. Close Button (`✕`, top right over image, 44x44px touch target).
  4. Dish Title & Formatted Price Tag.
  5. Veg/Non-Veg & Dietary Badges row.
  6. Detailed Culinary Story & Preparation Description.
  7. Allergen Warning Box: Highlighted with gentle warning background and clear list (e.g. *Contains: Shellfish, Eggs, Gluten*).
  8. Preparation Notes (e.g., "Gluten-free pasta can be substituted upon request with your server").
* **Motion Physics:**
  - Drawer animates upward from bottom of screen (`translateY(100%) -> translateY(0)` with `cubic-bezier(0.16, 1, 0.3, 1)` spring curve, 350ms).
  - Backdrop dims to 40% black with `backdrop-blur-sm`.
  - Dismissing animates smoothly down and restores exact scroll position.
* **Accessibility:** `role="dialog"`, `aria-modal="true"`. Escape key dismisses on desktop. Focus trapped while open.

---

### `SCR-CUST-04`: Live Search & Dietary Filtering

* **Screen ID:** `SCR-CUST-04`
* **Route:** Inline Sticky Section
* **PRD Mapping:** `FR-MENU-007`
* **User Stories:** `US-CUST-005`
* **Primary User Goal:** Instantly find dishes matching dietary requirements (e.g., Pure Veg) or specific ingredient cravings (e.g., "truffle").
* **Components Required:** `SearchBar`, `DietaryBadge`.
* **Behavior:**
  - Input field debounces input by 150ms. Client-side regex filters item titles, descriptions, and ingredients without server requests.
  - Quick filter pills: `[🌱 Pure Veg Only]`, `[🌾 Gluten-Free]`, `[⭐ Chef's Picks]`.
  - When filtering is active, categories with zero matching dishes collapse automatically.
  - A clear indicator shows: *"Showing 4 matching dishes for 'garlic'"* with a 1-tap *"Clear Search"* button.
* **Empty State:** If query has 0 matches, displays a friendly illustrated empty state: *"No dishes matched your search. Try searching for a different ingredient."*

---

### `SCR-CUST-05`: Sold-Out (86'd) Item Card Presentation

* **Screen ID:** `SCR-CUST-05`
* **Visual State:** Applied dynamically to `MenuItemCard` when `is_available = false`
* **PRD Mapping:** `FR-MENU-005`
* **User Stories:** `US-CUST-004`
* **Primary User Goal:** Clear, unambiguous awareness of unavailable items to eliminate ordering disappointment.
* **Visual Presentation:**
  - Card opacity reduced to **50%**.
  - A bold, semi-transparent pill overlay sits prominently across the food image: `[🚫 SOLD OUT TODAY]`.
  - Dish title and price remain readable but muted.
  - Card remains tappable to open detail drawer, which displays a prominent notice: *"This dish is currently sold out for today's dining service."*
* **Animation:** When an owner marks an item sold out during service, the card transitions smoothly from 100% to 50% opacity (300ms ease-out).

---

### `SCR-CUST-06`: Empty & Outside Operating Hours States

* **Screen ID:** `SCR-CUST-06`
* **State A: Outside Operating Hours:**
  - If diner opens menu outside venue hours, a warm atmospheric banner at the top notes: *"The restaurant is currently closed for dine-in. Hours today: 12:00 PM – 10:00 PM. Feel free to explore our menu!"*
  - The menu remains **100% browsable**.
* **State B: Inactive / Invalid URL:**
  - Friendly branded screen: *"Restaurant Menu Unavailable. Please check with your server."* Zero raw 404 or 500 errors.

