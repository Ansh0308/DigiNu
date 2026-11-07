# Design Context Readback & Upstream Traceability — DigiNu

**Document Version:** 1.0  
**Phase:** 03 — UI/UX Design, Branding & Design System  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Upstream Traceability & Context Synthesis

DigiNu is designed based on three previously established phases of commercial and technical discovery:

```
+-----------------------------------------------------------------------------------------+
|                               DESIGN INPUT BASELINE                                     |
+-----------------------------------------------------------------------------------------+
| PHASE 00: DISCOVERY & COMMERCIAL STRATEGY                                               |
| - Target Audience: Local independent restaurants, bistros, cafes, bars.                |
| - Commercial Model: Setup fee ($300-$750) + Monthly SaaS retainer ($29-$49/mo).        |
| - Primary Problem: Outdated, expensive paper menus & terrible pinch-to-zoom PDFs.       |
|                                                                                         |
| PHASE 01: PRODUCT REQUIREMENTS DOCUMENT (PRD)                                           |
| - Public Customer Menu: Mobile-first, read-only, sticky category spy bar, live search,  |
|   Veg/Non-Veg indicators, allergen tags, 86 sold-out overlays, dish detail bottom sheet.|
| - Owner Dashboard: Authenticated CRUD for categories, items, prices, 1-tap 86 toggle,  |
|   branding theme settings, ImageKit uploads, and table QR code vector exports.          |
|                                                                                         |
| PHASE 02: TECHNICAL ARCHITECTURE & DATA MODEL                                           |
| - Architecture: Independent client deployments using one reusable Next.js 15 codebase.  |
| - Database: Dedicated PostgreSQL per restaurant via Prisma ORM (no restaurant_id bloat).|
| - Media: ImageKit.io with folder segregation (/restaurants/{slug}/).                    |
| - AI Engine: Cloudflare Workers AI (flux-1-schnell, Apache 2.0 license, 1 image/run).   |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Upstream Conflicts & Architectural Reconciliations

| Area | Phase 01 PRD Baseline | Phase 02 Final Architecture | Phase 03 Design Resolution | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Product Delivery Model** | Multi-tenant platform with shared database and path `/r/:slug`. | **Independent deployments** per restaurant with dedicated PostgreSQL database. | Public menu is designed for the root domain (`/` or `/menu`) of the restaurant's custom domain, while supporting path routing if desired. | `[CONFIRMED]` |
| **AI Variation Batching** | Generate 4–5 variations simultaneously per generation run. | Generate **1 high-resolution image per generation** (~250 Neurons) to reduce latency and save quota. | **Flexible Design:** Primary UI presents 1 image with "Approve" and "Regenerate" buttons. Modal layout is architected to gracefully scale to a 2x2 grid if batching is enabled. | `[TO CONFIRM]` |
| **Tenant Scoping in UI** | Dashboard required restaurant switcher and multi-tenant scoping. | Single-restaurant dedicated dashboard. | Admin UI removes tenant selectors; focuses entirely on the single restaurant's catalog and profile. | `[CONFIRMED]` |

---

## 3. Screen Mapping Matrix

The complete catalog of screens to be designed in Phase 03:

### 3.1 Public Customer Menu (Mobile-First)

| Screen ID | Screen Name | Route | Core User Goal | Mapped PRD Requirement |
| :--- | :--- | :--- | :--- | :--- |
| **`SCR-CUST-01`** | **Public Menu Landing & Hero** | `/` or `/menu` | View restaurant identity, banner, hours, and jump into dining catalog. | `FR-MENU-001`, `FR-MENU-002` |
| **`SCR-CUST-02`** | **Category Navigation & Dish Grid** | `/` (Main Body) | Smoothly browse categories via sticky scroll-spy bar and explore dish cards. | `FR-MENU-003`, `FR-MENU-004` |
| **`SCR-CUST-03`** | **Dish Detail Bottom Sheet (Drawer)** | Overlay / Modal | Inspect high-res food photo, full culinary story, allergens, and dietary tags. | `FR-MENU-006` |
| **`SCR-CUST-04`** | **Live Search & Dietary Filter View** | Inline Filter | Instant search by keyword and filter by [Pure Veg], [Gluten-Free], [Chef's Special]. | `FR-MENU-007` |
| **`SCR-CUST-05`** | **Sold-Out (86'd) Item Display** | Card State | Clearly distinguish unavailable dishes (50% opacity, badge) without confusion. | `FR-MENU-005` |
| **`SCR-CUST-06`** | **Empty & Inactive States** | Error / Notice | Friendly message when restaurant is outside operating hours or zero search matches. | `FR-MENU-001` |

### 3.2 Private Restaurant Owner Dashboard (SaaS Admin)

| Screen ID | Screen Name | Route | Core User Goal | Mapped PRD Requirement |
| :--- | :--- | :--- | :--- | :--- |
| **`SCR-ADMIN-01`**| **Owner Login & Session Gate** | `/admin/login` | Securely authenticate into local restaurant management dashboard. | `FR-AUTH-001`, `FR-AUTH-002` |
| **`SCR-ADMIN-02`**| **Operational Overview Dashboard** | `/admin` | View operational health tiles (active items, sold-out items, AI credit balance). | `FR-ITEM-004`, `FR-AI-006` |
| **`SCR-ADMIN-03`**| **Restaurant Profile & Branding** | `/admin/profile` | Customize restaurant name, logo, cover image, theme preset, colors, and hours. | `FR-PROF-001` to `FR-PROF-004` |
| **`SCR-ADMIN-04`**| **Category Management Studio** | `/admin/categories`| Create, edit, reorder (drag-and-drop), and toggle seasonal category visibility. | `FR-CAT-001` to `FR-CAT-003` |
| **`SCR-ADMIN-05`**| **Food Item Catalog & 86 Hub** | `/admin/items` | Browse all dishes, search, filter by category, and toggle 1-tap 86 availability. | `FR-ITEM-001`, `FR-ITEM-004` |
| **`SCR-ADMIN-06`**| **Create / Edit Food Item Form** | `/admin/items/new` | Input dish name, price, description, dietary tags, allergens, and assign photo. | `FR-ITEM-001` to `FR-ITEM-003` |
| **`SCR-ADMIN-07`**| **ImageKit Media Library** | `/admin/media` | Browse uploaded photos and AI assets with direct client drag-and-drop upload. | `FR-ITEM-002`, `FR-PROF-002` |
| **`SCR-ADMIN-08`**| **AI Food Image Studio (Signature UI)** | Modal / Studio | Synthesize culinary prompt, generate realistic photo, preview, approve & apply. | `FR-AI-001` to `FR-AI-005` |
| **`SCR-ADMIN-09`**| **Table QR Code Studio** | `/admin/qr-code` | Live QR preview with centered logo, styling controls, and vector SVG/PNG export. | `FR-QR-001` to `FR-QR-003` |

---

## 4. Strict Scope Guardrails Reaffirmed

The following capabilities are **strictly prohibited** from all visual designs, wireframes, and prototypes:
* ❌ NO shopping carts, cart drawers, or bag icons.
* ❌ NO checkout screens, order confirmation dialogs, or delivery address inputs.
* ❌ NO payment gateway UI (Stripe, Apple Pay, credit card inputs).
* ❌ NO kitchen order displays (KDS), order progress tickers, or driver tracking.
* ❌ NO POS cash register screens, bill splitting, or tip calculation widgets.
* ❌ NO diner user accounts, customer login forms, or loyalty point badges.

Diners use DigiNu exclusively to browse dishes. Orders are communicated verbally to restaurant servers.

