# Product Requirements Document (PRD) — DigiNu

**Document Version:** 1.0  
**Phase:** 01 — Product Definition  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Management System  
**Product Manager:** Senior Product Management & Technical Solutions Team  

---

## 1. Product Overview & Vision

**DigiNu** is a commercial-grade, reusable, white-label digital restaurant menu management platform. It enables independent restaurants, cafes, diners, and bistros to digitize their physical paper menus into high-speed, mobile-first web menus accessible instantly through table-placed QR codes.

The system provides two dedicated, isolated web interfaces:
1. **Public Customer Menu (Read-Only):** A frictionless, responsive web experience opened via QR scan that allows diners to browse categories, view dishes with appetizing food photography, inspect dietary and allergen tags, verify dish availability, and search items without downloading an app or logging in.
2. **Private Restaurant Owner Dashboard (Authenticated):** A simplified, no-code management portal allowing restaurant operators to independently manage restaurant profile details, categories, dishes, prices, real-time availability (86ing items), table QR codes, and generate realistic food photography options via integrated AI.

DigiNu is engineered as a **reusable commercial platform** that a freelance developer or agency can customize, white-label, and license to multiple local restaurants as a turnkey SaaS offering.

---

## 2. Problem Statement

* **High Re-Printing Costs & Friction:** Updating prices or introducing seasonal dishes on physical menus requires redesigning and reprinting at $200–$1,000+ per print run, taking days to weeks.
* **Inability to Reflect Real-Time Availability:** Daily sold-out dishes cannot be removed from physical menus, causing diner disappointment and waitstaff apologies.
* **Poor Digital Alternatives (Clunky PDFs):** Most small restaurants currently link QR codes to multi-megabyte static PDFs that provide an abysmal mobile UX (pinch-to-zoom, slow loading, unreadable text).
* **Bloated Food Delivery & POS Platforms:** Existing restaurant software (Toast, Square, DoorDash) bundles unwanted online ordering, payment gateways, and commission fees. Restaurants wanting table-side browsing with human waitstaff service have no lightweight, dedicated digital menu solution.
* **Prohibitive Cost of Food Photography:** Independent restaurants cannot afford $1,500–$5,000 commercial culinary photography sessions, leaving their menus text-only and unappetizing.

---

## 3. Product Goals & Success Metrics

### 3.1 Core Goals
* Provide an instantaneous (< 1.5s), zero-friction menu viewing experience for diners on any smartphone.
* Enable restaurant owners to update prices, descriptions, and availability in under 30 seconds from a phone or tablet.
* Deliver an AI food image studio that generates 4–5 realistic culinary image options per dish, saving owners thousands in photography costs.
* Ensure complete multi-tenant reusability so the freelancer can onboard a new restaurant in minutes without code modifications.

### 3.2 Product Success Metrics
* **Customer Menu Load Speed:** Initial render < 1.5 seconds on 4G mobile connections.
* **Time to 86 an Item:** Under 10 seconds for an owner to mark a dish "Sold Out" from their mobile dashboard.
* **AI Generation Adoption:** > 60% of dishes with missing photos populated via the integrated AI food image studio.
* **Zero Operational Leakage:** 100% tenant data isolation with zero cross-tenant data access.

---

## 4. Target Users & Personas

### 4.1 Diner / Restaurant Customer (Anonymous)
* **Context:** Seated at a dining table, smartphone in hand, scanning a table QR code.
* **Needs:** Instant access without app downloads or sign-ups, easy category navigation, high-contrast readability in dim lighting, clear dietary/allergen indicators, and knowing what is currently available before ordering verbally with waitstaff.

### 4.2 Restaurant Owner / Floor Manager (Authenticated User)
* **Context:** Busy hospitality operator managing daily service from an iPad, laptop, or smartphone.
* **Needs:** Simple, jargon-free menu updates, instant toggling of sold-out items during peak rush, ability to upload or generate dish photos easily, and downloading table QR codes.

### 4.3 Freelancer / Platform Super-Admin (System Operator)
* **Context:** Technical consultant onboarding and maintaining multiple restaurant clients.
* **Needs:** Unified codebase, rapid tenant provisioning, configurable branding/themes, and centralized AI usage tracking.

---

## 5. Scope & Explicit Boundary Exclusions

```
+---------------------------------------------------------------------------------+
|                                DIGINU PRD SCOPE                                 |
+---------------------------------------------------------------------------------+
| IN SCOPE (Menu Catalog & Management)     | EXPLICITLY OUT OF SCOPE (Strict Exclusions)|
|------------------------------------------|--------------------------------------|
| - Read-only public mobile digital menu   | - Shopping cart & checkout           |
| - QR code generation & vector export     | - Online order placement & dispatch  |
| - Category & food item CRUD              | - Payment gateway & transaction fees |
| - Real-time dish availability (Sold Out) | - Kitchen Display System (KDS)       |
| - Dietary badges & allergen checklist    | - Table reservation booking engine   |
| - AI food image generator (4-5 options)  | - Real-time inventory / stock count  |
| - Media library & photo upload           | - Point-of-Sale (POS) hardware sync  |
| - Restaurant profile & white-label theme | - Customer user login or loyalty pts |
| - Authenticated owner admin dashboard    | - Waitstaff tip calculation          |
+---------------------------------------------------------------------------------+
```

> **Strict Operational Rule:** Customers use DigiNu exclusively to browse dishes. Orders are placed verbally with restaurant servers.

---

## 6. User Roles & Permissions

| Role | Interface | Authentication | Capabilities |
| :--- | :--- | :--- | :--- |
| **Anonymous Customer** | Public Menu (`/r/:slug`) | None (Unauthenticated) | Read-only access to published menu items, categories, search, filtering, and restaurant contact information. Cannot view draft items or admin endpoints. |
| **Restaurant Owner / Staff** | Owner Dashboard (`/admin`) | Email & Password | Scoped strictly to their single assigned `restaurant_id`. Full CRUD on categories, items, prices, availability, profile, branding, QR codes, and AI generation credits. |
| **Platform Super-Admin** | System Management | Master Auth | Platform-wide oversight for tenant creation, global billing, and system health. |

---

## 7. Functional Requirements

### Module 1: Public Digital Menu (Read-Only)

#### `FR-MENU-001`: Public Menu Resolution by Slug
* **Description:** The system shall resolve and display a restaurant's public digital menu based on its unique URL slug (`/r/:restaurant-slug`).
* **Priority:** Must-have
* **Expected Behavior:** When a user visits the URL, the system identifies the tenant, retrieves published categories and items, and renders the branded menu. If the slug does not exist, a polite "Restaurant Not Found" screen is shown.
* **Acceptance Criteria:**
  - Valid slug loads menu in < 1.5s on 4G.
  - Invalid slug returns 404 fallback page without leaking system stack traces.
* **Dependencies:** Tenant Resolution, Restaurant Profile.

#### `FR-MENU-002`: Restaurant Branding Header & Info
* **Description:** The public menu shall prominently present restaurant identity, cover banner, logo, operational status, and contact links.
* **Priority:** Must-have
* **Expected Behavior:** Displays restaurant logo, cover banner, name, cuisine tagline, open/closed status badge based on operating hours, address with Google Maps link, and phone number with click-to-call.
* **Acceptance Criteria:**
  - Header displays all configured branding assets.
  - Tapping phone triggers device dialer (`tel:`).
* **Dependencies:** `FR-PROF-001`.

#### `FR-MENU-003`: Sticky Scroll-Spy Category Navigation
* **Description:** The public menu shall provide a horizontal sticky navigation bar containing all active categories.
* **Priority:** Must-have
* **Expected Behavior:** As the user scrolls through the menu, the category bar remains fixed at the top of the viewport. Tapping a category smoothly scrolls to that section. The active tab auto-highlights based on the visible menu section.
* **Acceptance Criteria:**
  - Category bar docks to top when scrolled past header.
  - Tapping tab initiates smooth programmatic scroll to section target.
  - Categories containing zero visible items are automatically omitted.
* **Dependencies:** `FR-CAT-002`.

#### `FR-MENU-004`: Food Item Card Display & Anatomy
* **Description:** Each dish shall be displayed within a structured visual card.
* **Priority:** Must-have
* **Expected Behavior:** Each card displays: food image (WebP format with fallback placeholder), item title, formatted price with configured currency symbol, short description, Veg/Non-Veg icon, and dietary tags.
* **Acceptance Criteria:**
  - Price is correctly formatted per restaurant configuration (e.g., `$14.50` or `14,50 €`).
  - Missing image dishes render in an elegant text-first layout without broken icon artifacts.
* **Dependencies:** `FR-ITEM-002`, `FR-PROF-003`.

#### `FR-MENU-005`: Real-Time Sold Out (86'd) Status
* **Description:** Items marked as "Sold Out" shall remain visible on the public menu but styled with a distinct unavailable state.
* **Priority:** Must-have
* **Expected Behavior:** Sold-out items display with a muted semi-transparent opacity and an unmistakable `Sold Out Today` badge.
* **Acceptance Criteria:**
  - Sold-out items cannot be confused with available items.
  - Sold-out state reflects within one page refresh of owner updating it.
* **Dependencies:** `FR-ITEM-004`.

#### `FR-MENU-006`: Food Item Detail Modal / Expanded View
* **Description:** Tapping a food item card opens an expanded detail bottom sheet or modal.
* **Priority:** Should-have
* **Expected Behavior:** Displays high-resolution full-width image, full culinary description, preparation notes, complete allergen warning list, and dietary classifications.
* **Acceptance Criteria:**
  - Modal opens smoothly without page reload.
  - Dismissible via tap outside, drag down, or close button (`✕`).
* **Dependencies:** `FR-MENU-004`.

#### `FR-MENU-007`: Live Client-Side Menu Search & Filtering
* **Description:** Diners shall be able to search menu items by keyword and filter by dietary preference.
* **Priority:** Should-have
* **Expected Behavior:** A search bar filters dishes instantaneously across item names, descriptions, and ingredients without server round-trips. Quick filter chips (`[Pure Veg]`, `[Gluten-Free]`, `[Chef's Special]`) filter displayed cards.
* **Acceptance Criteria:**
  - Search results update in real-time as user types (debounced).
  - Empty search results show a friendly "No matching dishes found" state with a reset button.
* **Dependencies:** `FR-MENU-004`.

---

### Module 2: Owner Authentication & Authorization

#### `FR-AUTH-001`: Secure Owner Login
* **Description:** Restaurant owners shall authenticate with email and password to access the private dashboard.
* **Priority:** Must-have
* **Expected Behavior:** Submitting valid credentials issues a secure HTTP-Only session cookie and redirects the user to `/admin`.
* **Acceptance Criteria:**
  - Passwords hashed with bcrypt/Argon2.
  - Invalid credentials return a generic "Invalid email or password" error without leaking user existence.
  - Rate limiting blocks IP after 5 consecutive failed attempts for 15 minutes.
* **Dependencies:** None.

#### `FR-AUTH-002`: Protected Admin Routes & Session Termination
* **Description:** Unauthenticated requests to `/admin` or administrative APIs must be rejected.
* **Priority:** Must-have
* **Expected Behavior:** Visiting `/admin` without a valid session redirects to `/admin/login`. Logging out terminates the session and invalidates the session cookie.
* **Acceptance Criteria:**
  - Direct API calls to admin endpoints without valid auth return `401 Unauthorized`.
  - Logging out immediately terminates access.
* **Dependencies:** `FR-AUTH-001`.

---

### Module 3: Restaurant Profile & Branding Management

#### `FR-PROF-001`: Identity & Contact Management
* **Description:** Owners shall manage their restaurant's profile information.
* **Priority:** Must-have
* **Expected Behavior:** Editable fields: Restaurant Name, Tagline, About Story, Street Address, Google Maps URL, Phone Number, WhatsApp Number, and Social Media links.
* **Acceptance Criteria:**
  - Changes save immediately and propagate to the public menu upon refresh.
  - Phone and URLs are validated for correct syntax.
* **Dependencies:** `FR-AUTH-002`.

#### `FR-PROF-002`: Visual Asset Management (Logo & Banner)
* **Description:** Owners shall upload and crop their restaurant logo and cover banner.
* **Priority:** Must-have
* **Expected Behavior:** Uploader supports JPEG, PNG, and WebP files up to 5MB. Provides preview and cropping tool (1:1 square for logo, wide landscape for cover banner).
* **Acceptance Criteria:**
  - Files validated server-side for valid image MIME types.
  - Non-image files or files > 5MB are rejected with clear error messages.
* **Dependencies:** Storage Pipeline.

#### `FR-PROF-003`: Theme & Localization Settings
* **Description:** Owners shall customize their public menu brand colors, theme preset, and currency.
* **Priority:** Must-have
* **Expected Behavior:** Owner can select:
  - Primary Brand Color (via visual color picker or hex input).
  - Background Theme Preset (`Clean White`, `Warm Cream`, `Midnight Charcoal`).
  - Currency Symbol and placement (`$` Prefix vs `€` Suffix).
* **Acceptance Criteria:**
  - Selected primary color applies dynamically to public menu accents, active tabs, and badges.
  - Contrast check warns owner if primary color fails WCAG readability on chosen background.
* **Dependencies:** `FR-AUTH-002`.

#### `FR-PROF-004`: Operating Hours Configuration
* **Description:** Owners shall configure a 7-day operating schedule.
* **Priority:** Should-have
* **Expected Behavior:** Owner sets open and close times per day of the week, with an "Is Closed" toggle per day. Public menu displays a dynamic "Open Now" or "Closed" badge based on local venue time.
* **Acceptance Criteria:**
  - Schedule validates that closing time is after opening time.
* **Dependencies:** `FR-PROF-001`.

---

### Module 4: Category Management

#### `FR-CAT-001`: Category CRUD Operations
* **Description:** Owners shall create, view, edit, and delete menu categories.
* **Priority:** Must-have
* **Expected Behavior:** A category requires a Name (e.g., "Starters", "Mains") and optional Description/Subtitle. Owners can edit names or delete empty categories.
* **Acceptance Criteria:**
  - Category creation validates that Name is between 2 and 50 characters.
  - Deletion of a category containing dishes prompts owner to reassign or delete items first (cascade safeguard).
* **Dependencies:** `FR-AUTH-002`.

#### `FR-CAT-002`: Category Display Reordering
* **Description:** Owners shall control the display sequence of categories on the public menu.
* **Priority:** Must-have
* **Expected Behavior:** Dashboard provides an intuitive reordering control (drag-and-drop or up/down ordering buttons). The saved sequence dictates the public menu display order.
* **Acceptance Criteria:**
  - Reordered sequence persists to database immediately.
  - Public menu renders categories matching the saved order.
* **Dependencies:** `FR-CAT-001`.

#### `FR-CAT-003`: Category Visibility Toggle
* **Description:** Owners shall toggle category visibility between Active and Hidden.
* **Priority:** Should-have
* **Expected Behavior:** Toggling a category to "Hidden" immediately hides the category and all its contained dishes from the public menu without deleting data. Useful for seasonal sections.
* **Acceptance Criteria:**
  - Hidden category does not appear in public category bar or search.
* **Dependencies:** `FR-CAT-001`.

---

### Module 5: Food Item Management

#### `FR-ITEM-001`: Food Item Creation & Attribute Editing
* **Description:** Owners shall create, view, edit, and delete food items.
* **Priority:** Must-have
* **Expected Behavior:** Each dish record supports:
  - Name (required, 2–80 chars)
  - Category Assignment (required, dropdown of active categories)
  - Price (required, numeric with 2 decimals)
  - Short Description (optional, max 160 chars)
  - Detailed Description / Ingredients (optional, max 500 chars)
  - Dietary Tags (Veg, Non-Veg, Vegan, Gluten-Free, Halal, Nut-Free, Spicy)
  - Allergen Checklist (14 major allergens)
  - Featured / Chef's Special flag
* **Acceptance Criteria:**
  - Dish cannot be saved without Name, Category, and valid Price >= 0.
  - Changes save and reflect on public menu.
* **Dependencies:** `FR-CAT-001`.

#### `FR-ITEM-002`: Image Sourcing Selection
* **Description:** Owners shall choose between 3 image assignment pathways for each dish.
* **Priority:** Must-have
* **Expected Behavior:** Owner can:
  1. Upload photo directly from phone/laptop.
  2. Select photo from existing restaurant asset library.
  3. Invoke the AI Food Image Generator to generate 4–5 realistic options.
* **Acceptance Criteria:**
  - Selected image attaches to dish record and displays preview in dashboard.
  - Owner can remove or replace existing image at any time.
* **Dependencies:** `FR-ITEM-001`, `FR-AI-001`.

#### `FR-ITEM-003`: Veg / Non-Veg & Dietary Indicators
* **Description:** Owners shall classify dishes with dietary labels.
* **Priority:** Must-have
* **Expected Behavior:** Owner toggles Veg vs. Non-Veg (renders standard green/brown dot icons) and selects applicable dietary tags (Vegan, Gluten-Free, etc.).
* **Acceptance Criteria:**
  - Public menu accurately renders corresponding badge icons on the dish card.
* **Dependencies:** `FR-ITEM-001`.

#### `FR-ITEM-004`: Dish Availability Management (86 Toggle)
* **Description:** Owners shall toggle dish availability between "Available" and "Sold Out".
* **Priority:** Must-have
* **Expected Behavior:** A prominent toggle next to each dish in the dashboard list allows 1-tap switching between Available and Sold Out.
* **Acceptance Criteria:**
  - Toggling updates availability state immediately.
  - Public menu reflects `Sold Out Today` badge on subsequent view.
* **Dependencies:** `FR-ITEM-001`.

#### `FR-ITEM-005`: Item Reordering within Category
* **Description:** Owners shall reorder food items within their assigned category.
* **Priority:** Should-have
* **Expected Behavior:** Simple up/down or drag controls allow owners to place signature dishes at the top of a category list.
* **Acceptance Criteria:**
  - Saved sequence dictates public item ordering within category.
* **Dependencies:** `FR-ITEM-001`.

---

### Module 6: AI-Powered Food Image Generation

#### `FR-AI-001`: Prompt Synthesis from Dish Attributes
* **Description:** The system shall automatically formulate a food-photography prompt using the dish's attributes.
* **Priority:** Must-have
* **Expected Behavior:** When "Generate with AI" is triggered, the backend constructs an appetizing prompt combining dish name, description, ingredients, category, and cuisine style with photography directives (45-degree angle, macro culinary lighting, fresh garnish, ceramic plate).
* **Acceptance Criteria:**
  - Raw user input is never sent unformatted. Prompt synthesizer applies standard negative prompts (excluding plastic, cartoon, blurry, distorted elements).
* **Dependencies:** `FR-ITEM-001`.

#### `FR-AI-002`: Multi-Variation Generation (4–5 Variations)
* **Description:** The system shall generate 4 to 5 distinct visual variations for the dish.
* **Priority:** Must-have
* **Expected Behavior:** The backend invokes the AI image provider and returns 4 to 5 candidate image URLs/buffers for comparison.
* **Acceptance Criteria:**
  - Returns exactly 4 to 5 unique candidate images.
  - Displays progress indicator ("Generating culinary options...") during processing.
* **Dependencies:** `FR-AI-001`, Cloud Storage.

#### `FR-AI-003`: Interactive Preview & Side-by-Side Comparison
* **Description:** The owner dashboard shall present the generated variations in an interactive comparison interface.
* **Priority:** Must-have
* **Expected Behavior:** Variations are displayed in a responsive grid/carousel with zoom preview capability, allowing the owner to closely inspect plating and texture.
* **Acceptance Criteria:**
  - Owner can click each image to view full-size.
  - Each variation has a clear "Select This Image" button.
* **Dependencies:** `FR-AI-002`.

#### `FR-AI-004`: Human Approval & Image Persistence
* **Description:** The selected AI image shall be approved by the owner and permanently saved.
* **Priority:** Must-have
* **Expected Behavior:** Clicking "Select This Image" downloads/transfers the chosen candidate to permanent cloud storage, transcodes to WebP (thumbnail + high-res), attaches it to the dish, and adds it to the restaurant's media library. Unselected candidate images are discarded.
* **Acceptance Criteria:**
  - AI image is NEVER automatically assigned without explicit owner click.
  - Selected image displays on dish card immediately.
* **Dependencies:** `FR-AI-003`.

#### `FR-AI-005`: Regeneration & Failure Resilience
* **Description:** Owners shall be able to re-run generation, and the system must handle API failures gracefully.
* **Priority:** Must-have
* **Expected Behavior:** If the owner is dissatisfied with the 4 options, a "Regenerate Options" button allows generating a fresh batch. If the AI service fails or times out, a friendly toast error is shown; the dish remains intact and can use manual photo upload.
* **Acceptance Criteria:**
  - AI failure does not block saving dish text or prices.
  - Error message advises owner to try again or upload photo manually.
* **Dependencies:** `FR-AI-002`.

#### `FR-AI-006`: Per-Tenant Quota & Abuse Prevention
* **Description:** The system shall enforce monthly generation credit limits per restaurant tenant.
* **Priority:** Must-have
* **Expected Behavior:** Each generation deduction decrements the tenant's credit counter. When balance reaches 0, the generation button displays "0 Credits Remaining — Contact Administrator".
* **Acceptance Criteria:**
  - Double-click debounce lock prevents accidental parallel generation calls.
  - Quota checks happen server-side before calling external AI APIs.
* **Dependencies:** `FR-AUTH-002`.

---

### Module 7: QR Code Management Studio

#### `FR-QR-001`: Deterministic QR Code Generation
* **Description:** The system shall generate a high-density QR code encoding the canonical public menu URL (`https://diginu.app/r/:slug`).
* **Priority:** Must-have
* **Expected Behavior:** The QR code encodes the restaurant's permanent slug. Because the slug is static, the QR code remains valid indefinitely even when menu items or prices change daily.
* **Acceptance Criteria:**
  - Scanning generated QR code with iOS/Android camera immediately navigates to `/r/:slug`.
* **Dependencies:** `FR-MENU-001`.

#### `FR-QR-002`: Branded QR Customization & Preview
* **Description:** The dashboard shall render a live preview of the QR code with branding options.
* **Priority:** Should-have
* **Expected Behavior:** The QR code preview supports embedding the restaurant's square logo into the center of the QR matrix (with appropriate error correction level H) and applying the restaurant's primary brand color.
* **Acceptance Criteria:**
  - Embedded logo does not impede QR scannability.
  - High contrast ratio preserved (foreground vs white background).
* **Dependencies:** `FR-QR-001`, `FR-PROF-002`.

#### `FR-QR-003`: Multi-Format Print-Ready Export
* **Description:** Owners shall download the QR code in multiple print-ready formats.
* **Priority:** Must-have
* **Expected Behavior:** Owner can download:
  - **Vector SVG:** Infinite scaling for commercial printing on menus, posters, and signs.
  - **High-Resolution PNG (300 DPI):** For office printing and digital graphics.
  - **Printable Table-Tent Card (PDF):** Pre-formatted 4x6 / A6 card with restaurant name and "Scan to view our menu" instruction.
* **Acceptance Criteria:**
  - Download buttons trigger instantaneous file downloads.
  - Vector SVG scales cleanly without pixelation.
* **Dependencies:** `FR-QR-001`.

---

## 8. Restaurant Customization & Reusability Requirements

* **Zero Hardcoded Data (`FR-REUSE-001`):** All restaurant names, currencies, logos, colors, themes, dishes, and categories reside exclusively in the database. The codebase contains zero restaurant-specific hardcoded values.
* **Tenant Isolation Guarantee (`FR-REUSE-002`):** Every database table storing restaurant data (`categories`, `food_items`, `food_images`, `qr_codes`) contains a mandatory, indexed foreign key `restaurant_id`. All administrative queries and mutations enforce `WHERE restaurant_id = session.current_tenant_id`.
* **Rapid Onboarding (`FR-REUSE-003`):** The system shall allow onboarding a new restaurant in under 5 minutes by provisioning a tenant record and credentials.

---

## 9. Security & Privacy Requirements

* **Read/Write Boundary (`FR-SEC-001`):** Public dining routes are strictly read-only. No mutation endpoints or administrative credentials can be executed or inspected by anonymous diners.
* **Public Data Sanitization (`FR-SEC-002`):** Public JSON payloads omit internal fields (owner email, password hash, subscription status, AI generation logs, and unpublished drafts).
* **File Upload Sanitization (`FR-SEC-003`):** Server validates file magic numbers (JPEG/PNG/WebP), rejects files > 5MB, strips EXIF/GPS metadata, and transcodes to standard WebP.
* **AI Secret Isolation (`FR-SEC-004`):** External AI provider API keys reside strictly in server-side environment variables and are never transmitted to client browsers.
* **Zero Diner Tracking (`FR-SEC-005`):** Diners are 100% anonymous. No tracking cookies or personal identifiable information (PII) are collected from customers scanning table QR codes.

---

## 10. Non-Functional Requirements (NFRs)

* **Performance:** Public menu initial page load (FCP) < 1.0s, Largest Contentful Paint (LCP) < 1.8s on 4G mobile connection. Compressed bundle size < 350KB.
* **Mobile Responsiveness:** 100% fluid responsive presentation across 360px–430px smartphone viewports (iPhone SE through modern Pro Max / Galaxy models) and tablets (768px–1024px).
* **Accessibility:** WCAG 2.1 AA compliant contrast ratio (minimum 4.5:1 for body copy). Touch targets >= 44x44px. Alt tags on all food images.
* **Reliability:** Public menu remains fully readable even if AI generation services or cloud storage uploads are experiencing upstream outages.
* **Maintainability:** Modular architecture allowing independent updates to frontend, backend services, and AI provider adapters.

---

## 11. Dependencies & External Constraints

* **Mobile Web Browsers:** Target modern mobile browsers (Safari on iOS 15+, Chrome on Android 10+).
* **Camera QR Scanner:** Dependent on native smartphone camera QR scanner functionality.
* **AI Image Generation Provider:** Dependent on upstream API availability (Google Imagen 3, OpenAI DALL-E 3, or Flux.1). Provider adapter must isolate system from upstream API changes.
* **Cloud Object Storage:** S3-compatible cloud storage (e.g., AWS S3, Cloudflare R2, or Supabase Storage) for image and QR asset hosting.

---

## 12. MVP Release Criteria

The MVP release is officially ready for commercial deployment when:
1. A restaurant owner can log in, upload their logo, set brand color, create 4 categories, and add 20 dishes with prices and dietary tags.
2. The owner can generate 4–5 AI images for signature dishes, preview them, select one, and see it attached to the dish.
3. The owner can download a high-res vector QR code, scan it with a smartphone camera, and view the live public menu.
4. Toggling an item to "Sold Out" in the dashboard immediately marks it as unavailable on the public menu.
5. A restaurant's admin session cannot access or modify another restaurant's data under any circumstance.
6. The public menu loads smoothly in under 1.5 seconds on a real mobile device without layout shifts.
