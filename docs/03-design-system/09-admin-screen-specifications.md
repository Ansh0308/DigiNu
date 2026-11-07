# Owner Dashboard Screen Specifications — DigiNu

**Document Version:** 1.0  
**Phase:** 03 — UI/UX Design, Branding & Design System  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Owner Dashboard Architecture Overview

The Private Owner Dashboard lives at `/admin` within the restaurant's independent deployment. It provides non-technical restaurant owners, head chefs, and floor managers with a simple, modern SaaS experience.

```
+-----------------------------------------------------------------------------------------+
|                              OWNER DASHBOARD SCREEN SUITE                               |
+-----------------------------------------------------------------------------------------+
| 1. `SCR-ADMIN-01`: Owner Authentication (/admin/login)                                  |
| 2. `SCR-ADMIN-02`: Operational Overview Dashboard (/admin)                             |
| 3. `SCR-ADMIN-03`: Restaurant Profile & Theming (/admin/profile)                        |
| 4. `SCR-ADMIN-04`: Category Management Studio (/admin/categories)                       |
| 5. `SCR-ADMIN-05`: Food Item Catalog & 86 Hub (/admin/items)                            |
| 6. `SCR-ADMIN-06`: Create / Edit Food Item Form (/admin/items/new, /admin/items/:id/edit)|
| 7. `SCR-ADMIN-07`: ImageKit Media Library (/admin/media)                                |
| 8. `SCR-ADMIN-08`: AI Food Image Studio Signature UI (Modal)                            |
| 9. `SCR-ADMIN-09`: Table QR Code Studio (/admin/qr-code)                                |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Detailed Screen Specifications

### `SCR-ADMIN-01`: Owner Authentication Screen

* **Screen ID:** `SCR-ADMIN-01`
* **Route:** `/admin/login`
* **PRD Mapping:** `FR-AUTH-001`, `FR-AUTH-002`
* **Primary User Goal:** Securely log in to manage the restaurant's menu.
* **Layout Structure:**
  - Centered auth card on clean neutral background.
  - DigiNu Brand Logo and restaurant name subtitle.
  - Email Address input field with validation.
  - Password input field with reveal/hide toggle.
  - "Remember me for 14 days" checkbox.
  - "Sign In" primary button with spinner loading state.
  - Self-serve password reset link.
* **Interactions & States:**
  - Focus state: Indigo border ring (`ring-2 ring-indigo-500`).
  - Invalid credentials: Inline alert: *"Invalid email or password"*.
  - Rate-limit lockout: *"Too many failed attempts. Please wait 15 minutes."*
* **Accessibility:** Form fields have explicit `<label for="...">`, autocomplete attributes (`autocomplete="username"`, `autocomplete="current-password"`).

---

### `SCR-ADMIN-02`: Operational Overview Dashboard

* **Screen ID:** `SCR-ADMIN-02`
* **Route:** `/admin`
* **PRD Mapping:** `FR-ITEM-004`, `FR-AI-006`
* **Primary User Goal:** Instant overview of menu health and quick access to core actions.
* **Layout & Metric Tiles:**
  1. Header: *"Welcome back, Chef Mario"* with link to live public menu (`[View Live Menu ↗]`).
  2. Four Metric Health Cards:
     - **Active Dishes:** e.g., `45 Dishes Live` (Green indicator).
     - **Sold Out (86'd):** e.g., `3 Dishes Sold Out` (Amber warning indicator).
     - **Categories:** e.g., `6 Active Categories`.
     - **AI Credits:** e.g., `22 / 30 Credits Remaining` (Progress bar).
  3. Quick Actions Row: `[+ Add Food Item]`, `[+ Add Category]`, `[Download Table QR]`.
  4. Recent Activity Log: Shows last 5 updates (e.g., *"Crispy Calamari marked Sold Out at 1:15 PM"*).
* **Motion:** Metric numbers count up smoothly upon page entrance (Framer Motion, 600ms).

---

### `SCR-ADMIN-03`: Restaurant Profile & Theming Studio

* **Screen ID:** `SCR-ADMIN-03`
* **Route:** `/admin/profile`
* **PRD Mapping:** `FR-PROF-001` to `FR-PROF-004`
* **Primary User Goal:** Customize restaurant branding, hours, colors, and currency without developer assistance.
* **Sections:**
  1. **Identity & Story:** Restaurant Name, Tagline, Story text for info drawer.
  2. **Visual Assets:**
     - Logo Uploader (1:1 square crop preview via ImageKit).
     - Cover Banner Uploader (wide landscape preview with text overlay check).
  3. **Brand Palette & Theming:**
     - Primary Brand Color Picker (with live WCAG contrast calculation).
     - Theme Preset Selector: Interactive radio cards showcasing `Clean White`, `Warm Cream`, and `Midnight Charcoal`.
     - Font Pairing Preset: `Editorial Serif` vs. `Contemporary Sans`.
  4. **Localization & Currency:** Currency selector (`$`, `€`, `£`, `₹`, `C$`) and placement (`Prefix` vs `Suffix`).
  5. **Operating Hours:** 7-day schedule editor with open/close time pickers and "Closed" toggles.
* **Feedback:** Auto-save notification with floating toast: *"Branding updated successfully. Reflecting on live menu."*

---

### `SCR-ADMIN-04`: Category Management Studio

* **Screen ID:** `SCR-ADMIN-04`
* **Route:** `/admin/categories`
* **PRD Mapping:** `FR-CAT-001` to `FR-CAT-003`
* **Primary User Goal:** Organize sections and control the display sequence of categories on customer phones.
* **Layout Structure:**
  - Header with `[+ Add New Category]` button opening creation drawer.
  - Reorderable List:
    - Drag handle icon (`:::`) for smooth mouse/touch drag-and-drop.
    - Category Title & Subtitle.
    - Dish count badge (e.g. `12 items`).
    - Visibility Switch (`Active` vs. `Hidden/Seasonal`).
    - Edit (`✏️`) and Delete (`🗑️`) actions.
* **Interactions & Deletion Safeguard:**
  - Dragging a category provides tactile elevation shadow (`shadow-lg`, scale 1.02).
  - Deleting a category with active dishes triggers a modal: *"Cannot delete category containing 12 dishes. Reassign or delete these items first."*

---

### `SCR-ADMIN-05`: Food Item Catalog & 86 Hub

* **Screen ID:** `SCR-ADMIN-05`
* **Route:** `/admin/items`
* **PRD Mapping:** `FR-ITEM-001`, `FR-ITEM-004`
* **Primary User Goal:** Monitor all dishes, search quickly, and toggle sold-out items (86ing) during service in 1 tap.
* **Layout Structure:**
  - Filter Bar: Search by dish name, filter by Category dropdown, filter by Status (`All`, `Available`, `Sold Out`).
  - Data Table / Card Stream (Responsive):
    - Dish Image Thumbnail (50x50px WebP).
    - Dish Title & Category Name.
    - Price (e.g. `$16.50`).
    - Dietary Tags (`Veg`, `Gluten-Free`).
    - **1-Tap Availability Switch:** Prominent green toggle for `Available` vs grey toggle for `Sold Out (86)`. Tapping updates instantly via optimistic UI.
    - Action Menu: `Edit Dish`, `Replace Image`, `Delete Dish`.
* **Mobile View:** On smartphone viewports, rows collapse into tactile cards with 44px tap targets for instant 1-handed toggling behind the bar or in the kitchen.

---

### `SCR-ADMIN-06`: Create / Edit Food Item Form

* **Screen ID:** `SCR-ADMIN-06`
* **Route:** `/admin/items/new` and `/admin/items/:id/edit`
* **PRD Mapping:** `FR-ITEM-001` to `FR-ITEM-003`, `FR-ITEM-005`
* **Sections:**
  1. **Basic Info:** Name (required), Category dropdown (required), Price numeric input (required).
  2. **Descriptions:** Short description (card level, 160 chars) + Detailed preparation description (expanded modal level).
  3. **Dietary & Allergens:** Veg vs. Non-Veg toggle, Dietary chips (`Vegan`, `Gluten-Free`, `Halal`, `Spicy`), 14-allergen checklist.
  4. **Dish Photography Section:**
     - Current photo preview (or placeholder).
     - Action tabs: `[📁 Upload Photo]`, `[🖼️ Media Library]`, `[✨ Generate with AI]`.
  5. **Actions:** `[Cancel]` and `[Save Food Item]` primary button.

---

### `SCR-ADMIN-07`: ImageKit Media Library

* **Screen ID:** `SCR-ADMIN-07`
* **Route:** `/admin/media`
* **PRD Mapping:** `FR-ITEM-002`, `FR-PROF-002`
* **Primary User Goal:** Centralized repository of all uploaded and AI-generated food imagery.
* **Layout Structure:**
  - Drag-and-drop upload zone at top (`"Drag photos here or browse"`).
  - Filter tabs: `All Media`, `Food Photography`, `AI Generated`, `Logos & Banners`.
  - Grid Gallery: 4 columns on desktop, 2 on mobile.
  - Hovering an image shows resolution, file size, attached dish name, and `[Delete]` button.

---

### `SCR-ADMIN-08`: AI Food Image Studio (Signature UI Modal)

* **Screen ID:** `SCR-ADMIN-08`
* **Trigger:** Click `[✨ Generate with AI]` within Food Item Form.
* **PRD Mapping:** `FR-AI-001` to `FR-AI-006`
* **Primary User Goal:** Generate studio-grade culinary photography for a dish without hiring a photographer.
* **Flexible UI Architecture:**
  - **Prompt Preview Section:** Displays synthesized prompt combining dish title, ingredients, cuisine style, and camera lighting directives.
  - **Credit Status:** e.g., *"22 / 30 AI Credits remaining this month"*.
  - **Generating State:** Animated culinary cooking state with glowing ambient edge border ("Chef AI is plating your dish...").
  - **Preview & Comparison View:**
    - **Primary Mode (1-Image Workflow):** Displays 1 prominent high-resolution food photo with zoom inspection, a primary **`[⭐ Approve & Apply to Dish]`** button, and an alternative **`[🔄 Regenerate New Photo]`** button.
    - **Batch Grid Mode (4-Image Workflow `[TO CONFIRM]`):** If batch generation is enabled, displays a 2x2 comparison grid allowing the owner to select their favorite option before approving.
  - **Mandatory Approval Mandate:** AI images are **never** published without explicit owner approval. Closing the modal discards candidates without modifying the dish.

---

### `SCR-ADMIN-09`: Table QR Code Studio

* **Screen ID:** `SCR-ADMIN-09`
* **Route:** `/admin/qr-code`
* **PRD Mapping:** `FR-QR-001` to `FR-QR-003`
* **Primary User Goal:** Preview and download table QR codes linked permanently to the restaurant's digital menu.
* **Layout Structure:**
  - Left Panel: Live high-resolution vector QR code preview with centered restaurant logo.
  - Right Panel:
    - Target URL display: `https://bella-italia.com/` (Permanent link).
    - Customization Controls: Embed Logo toggle, Primary Brand Color apply toggle, Dot style selector (`rounded`, `classic`).
    - Export Buttons:
      - `[⬇️ Download Vector SVG]` (For commercial printing on acrylic, wood, or banners).
      - `[⬇️ Download 300 DPI PNG]` (For office printing and digital flyers).
      - `[⬇️ Download Table-Tent PDF]` (Pre-formatted printable 4x6 / A6 card).

