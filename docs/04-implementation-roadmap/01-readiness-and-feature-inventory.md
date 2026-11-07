# Implementation Readiness Audit & Feature Inventory — DigiNu Phase 04

**Document Version:** 1.0  
**Phase:** 04 — Implementation Planning  
**Status:** IN PROGRESS  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  
**Prepared:** November 2026  

---

## 1. Implementation Readiness Audit

### 1.1 Repository & Directory Structure

**Audit Date:** November 2026  
**Git Status:** Clean — no uncommitted changes, no staged files, no untracked application code.

```
e:\Freelance\DigiNu\
├── docs/                          ✅ EXISTS — Full documentation across 4 phases
│   ├── PROJECT_CONTEXT_INDEX.md   ✅ EXISTS — Master index with all phase links
│   ├── 00-discovery/              ✅ EXISTS — 10 discovery documents (APPROVED)
│   ├── 01-product-definition/     ✅ EXISTS — 6 PRD documents (APPROVED)
│   ├── 02-technical-architecture/ ✅ EXISTS — 9 architecture documents (APPROVED)
│   ├── 03-design-system/          ✅ EXISTS — 18 design documents (APPROVED)
│   └── 04-implementation-roadmap/ ✅ CREATING NOW — Phase 04 Execution Pack
├── README.md                      ✅ EXISTS — Updated to Phase 04
├── prisma/                        ❌ NOT YET — Created in BUILD-02
├── src/                           ❌ NOT YET — Created in BUILD-01
├── public/                        ❌ NOT YET — Created in BUILD-01
├── .env.example                   ❌ NOT YET — Created in BUILD-01
├── package.json                   ❌ NOT YET — Created in BUILD-01
├── tsconfig.json                  ❌ NOT YET — Created in BUILD-01
├── tailwind.config.ts             ❌ NOT YET — Created in BUILD-01
└── .agents/skills/                ✅ CREATING NOW — Project-local skills
```

**Assessment:** The repository is a documentation-only repository with zero application source code. This is expected and correct — no code should exist prior to BUILD-01.

### 1.2 Global Skills Verification

All 5 global AI development skills are verified present at the correct paths:

| Skill Name | Path | Status |
|:---|:---|:---:|
| `ui-ux-pro-max` | `C:\Users\USER\.gemini\config\skills\ui-ux-pro-max\SKILL.md` | ✅ VERIFIED |
| `frontend-design` | `C:\Users\USER\.gemini\config\skills\frontend-design\SKILL.md` | ✅ VERIFIED |
| `code-review` | `C:\Users\USER\.gemini\config\skills\code-review\SKILL.md` | ✅ VERIFIED |
| `documentation-spec-writing` | `C:\Users\USER\.gemini\config\skills\documentation-spec-writing\SKILL.md` | ✅ VERIFIED |
| `accessibility-review` | `C:\Users\USER\.gemini\config\skills\accessibility-review\SKILL.md` | ✅ VERIFIED |

**Search Tool Command (ui-ux-pro-max):**
```bash
python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "<query>" --domain <domain>
```

### 1.3 Project-Local Skills Recommendation

**Recommendation:** CREATE project-local skills **before BUILD-01 begins**.

Path: `e:\Freelance\DigiNu\.agents\skills\`

Four project-local skills are being created as part of this Phase 04 deliverable:
1. `diginu-business-rules/SKILL.md` — Scope guardrails, what DigiNu IS and IS NOT
2. `diginu-architecture-conventions/SKILL.md` — Next.js 15, TypeScript strict, directory structure
3. `diginu-design-rules/SKILL.md` — Design tokens, typography, color palette, motion rules
4. `diginu-test-and-review/SKILL.md` — Testing stack, performance budgets, security checklist
5. `diginu-deployment-release/SKILL.md` — Independent deployment workflow and onboarding steps

**Rationale:** Project-local skills persist context-specific guardrails across every Antigravity session without requiring manual copy-paste of rules. They load automatically for sessions opened in the `e:\Freelance\DigiNu\` workspace.

### 1.4 External Credentials & Prerequisite Inventory (Phased Requirements)

The following external accounts and credentials will be required across the implementation phases. None block BUILD-01 (BUILD-01 uses local development and `.env.example`). **No actual values should be stored in this document.**

| Credential | Environment Variable | Where to Obtain | Required For |
|:---|:---|:---|:---|
| PostgreSQL Connection String | `DATABASE_URL` | Railway / Render / Supabase / Local | BUILD-02 |
| PostgreSQL Direct URL | `DIRECT_URL` | Same source as DATABASE_URL | BUILD-02 |
| Auth Secret (32-byte random) | `AUTH_SECRET` | `openssl rand -base64 32` | BUILD-02 |
| ImageKit Public Key | `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | imagekit.io → Developer Options | BUILD-04 |
| ImageKit Private Key | `IMAGEKIT_PRIVATE_KEY` | imagekit.io → Developer Options | BUILD-04 |
| ImageKit URL Endpoint | `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | imagekit.io → URL Endpoint | BUILD-04 |
| Cloudflare Account ID | `CLOUDFLARE_ACCOUNT_ID` | dash.cloudflare.com → Workers & Pages | BUILD-05 |
| Cloudflare API Token | `CLOUDFLARE_API_TOKEN` | dash.cloudflare.com → API Tokens | BUILD-05 |
| Public App URL | `NEXT_PUBLIC_APP_URL` | Your hosting domain (e.g. Railway URL) | BUILD-01 |
| Railway / Render / Coolify Account | (Hosting) | railway.app / render.com / coolify.io | BUILD-08 |

> [!CAUTION]
> **NEVER commit actual credential values to git.** The `.env` file must always be in `.gitignore`. Use `.env.example` for the template only.

---

## 2. Complete Feature Inventory

### 2.1 Feature Inventory Matrix

Every feature extracted from the PRD, mapped to implementation context:

| Req ID | Feature Name | Priority | User Role | Screen ID | DB Entity | API Endpoint | External Integration | Phase |
|:---|:---|:---:|:---|:---|:---|:---|:---|:---:|
| **FR-MENU-001** | Public Menu Resolution | MUST | Customer | SCR-CUST-01 | `restaurant_profile` | `GET /api/public/menu` | None | BUILD-06 |
| **FR-MENU-002** | Branding Header & Info | MUST | Customer | SCR-CUST-01 | `restaurant_profile`, `operating_hours`, `media_assets` | `GET /api/public/menu` | ImageKit CDN | BUILD-06 |
| **FR-MENU-003** | Sticky Scroll-Spy Category Nav | MUST | Customer | SCR-CUST-02 | `menu_categories` | `GET /api/public/menu` | None | BUILD-06 |
| **FR-MENU-004** | Food Item Card Display | MUST | Customer | SCR-CUST-02 | `menu_items`, `media_assets` | `GET /api/public/menu` | ImageKit CDN | BUILD-06 |
| **FR-MENU-005** | Sold-Out 86 Card State | MUST | Customer | SCR-CUST-05 | `menu_items` (`is_available`) | `GET /api/public/menu` | None | BUILD-06 |
| **FR-MENU-006** | Dish Detail Bottom Sheet | SHOULD | Customer | SCR-CUST-03 | `menu_items` | Client State (Drawer) | None | BUILD-06 |
| **FR-MENU-007** | Live Search & Dietary Filter | SHOULD | Customer | SCR-CUST-04 | `menu_items` | Client-Side State | None | BUILD-06 |
| **FR-AUTH-001** | Secure Owner Login | MUST | Owner | SCR-ADMIN-01 | `owner_account` | `POST /api/auth/[...nextauth]` | NextAuth.js v5 | BUILD-02 |
| **FR-AUTH-002** | Protected Routes & Session | MUST | Owner | SCR-ADMIN-01 | `owner_account` | Auth Middleware | NextAuth.js v5 | BUILD-02 |
| **FR-PROF-001** | Identity & Contact Management | MUST | Owner | SCR-ADMIN-03 | `restaurant_profile` | `PATCH /api/admin/profile` | None | BUILD-03 |
| **FR-PROF-002** | Logo & Banner Upload | MUST | Owner | SCR-ADMIN-03, SCR-ADMIN-07 | `media_assets`, `restaurant_profile` | `GET /api/admin/media/imagekit-auth`, `POST /api/admin/media/confirm` | ImageKit.io | BUILD-04 |
| **FR-PROF-003** | Theme & Localization Settings | MUST | Owner | SCR-ADMIN-03 | `restaurant_profile` | `PATCH /api/admin/profile` | None | BUILD-03 |
| **FR-PROF-004** | Operating Hours Configuration | SHOULD | Owner | SCR-ADMIN-03 | `operating_hours` | `PATCH /api/admin/profile/hours` | None | BUILD-03 |
| **FR-CAT-001** | Category CRUD Operations | MUST | Owner | SCR-ADMIN-04 | `menu_categories` | `POST /api/admin/categories`, `PATCH /api/admin/categories/:id`, `DELETE /api/admin/categories/:id` | None | BUILD-03 |
| **FR-CAT-002** | Category Display Reordering | MUST | Owner | SCR-ADMIN-04 | `menu_categories` | `PUT /api/admin/categories/reorder` | None | BUILD-03 |
| **FR-CAT-003** | Category Visibility Toggle | SHOULD | Owner | SCR-ADMIN-04 | `menu_categories` (`is_active`) | `PATCH /api/admin/categories/:id` | None | BUILD-03 |
| **FR-ITEM-001** | Food Item CRUD & Attributes | MUST | Owner | SCR-ADMIN-05, SCR-ADMIN-06 | `menu_items` | `POST /api/admin/items`, `PUT /api/admin/items/:id`, `DELETE /api/admin/items/:id` | None | BUILD-03 |
| **FR-ITEM-002** | Image Sourcing (3 Pathways) | MUST | Owner | SCR-ADMIN-06, SCR-ADMIN-07 | `menu_items`, `media_assets` | `PATCH /api/admin/items/:id` | ImageKit.io | BUILD-04 |
| **FR-ITEM-003** | Veg/Non-Veg & Dietary Tags | MUST | Owner | SCR-ADMIN-06 | `menu_items` | `POST /api/admin/items` | None | BUILD-03 |
| **FR-ITEM-004** | 86 Availability Toggle | MUST | Owner | SCR-ADMIN-05 | `menu_items` (`is_available`) | `PATCH /api/admin/items/:id/availability` | None | BUILD-03 |
| **FR-ITEM-005** | Item Reordering within Category | SHOULD | Owner | SCR-ADMIN-05 | `menu_items` (`display_order`) | `PUT /api/admin/items/reorder` | None | BUILD-03 |
| **FR-AI-001** | Culinary Prompt Synthesis | MUST | Owner | SCR-ADMIN-08 | — | `POST /api/admin/ai/generate` (Backend Logic) | Cloudflare Workers AI | BUILD-05 |
| **FR-AI-002** | 1-Image Generation Workflow | MUST | Owner | SCR-ADMIN-08 | `ai_generation_logs` | `POST /api/admin/ai/generate` | Cloudflare Workers AI (`flux-1-schnell`) | BUILD-05 |
| **FR-AI-003** | Interactive Preview & Approval UI | MUST | Owner | SCR-ADMIN-08 | — | Modal Component | None | BUILD-05 |
| **FR-AI-004** | Human Approval & Image Persistence | MUST | Owner | SCR-ADMIN-08 | `media_assets`, `menu_items`, `ai_generation_logs` | `POST /api/admin/ai/approve` | ImageKit.io | BUILD-05 |
| **FR-AI-005** | Regeneration & Failure Resilience | MUST | Owner | SCR-ADMIN-08 | — | `POST /api/admin/ai/generate` | None | BUILD-05 |
| **FR-AI-006** | Per-Deployment Quota Enforcement | MUST | Owner | SCR-ADMIN-08, SCR-ADMIN-02 | `restaurant_profile` (`ai_credits_balance`) | `POST /api/admin/ai/generate` | None | BUILD-05 |
| **FR-QR-001** | Deterministic QR Code Generation | MUST | Owner | SCR-ADMIN-09 | `qr_code_config` | `GET /api/admin/qr-code/preview` | `qrcode` library | BUILD-07 |
| **FR-QR-002** | Branded QR Customization & Preview | SHOULD | Owner | SCR-ADMIN-09 | `qr_code_config` | `GET /api/admin/qr-code/preview` | `qrcode` library | BUILD-07 |
| **FR-QR-003** | Multi-Format Print-Ready Export | MUST | Owner | SCR-ADMIN-09 | `qr_code_config` | `GET /api/admin/qr-code/download?format=svg\|png\|pdf` | `qrcode`, `pdfkit` | BUILD-07 |
| **FR-REUSE-001** | Zero Hardcoded Restaurant Data | MUST | All | All Screens | All Entities | All Endpoints | None | ALL |
| **FR-REUSE-002** | Physical Database Isolation | MUST | System | Infrastructure | Dedicated DB | Prisma | PostgreSQL | BUILD-02 |
| **FR-SEC-001** | Read-Only Public Dining Route | MUST | System | SCR-CUST-* | — | Middleware | None | BUILD-01 |
| **FR-SEC-002** | Public Payload Data Sanitization | MUST | System | SCR-CUST-* | — | `GET /api/public/menu` | None | BUILD-06 |
| **FR-SEC-003** | File Upload MIME & EXIF Strip | MUST | System | SCR-ADMIN-07 | `media_assets` | ImageKit Direct Upload | ImageKit.io | BUILD-04 |
| **FR-SEC-004** | AI Secret Server-Side Isolation | MUST | System | — | — | `POST /api/admin/ai/*` | Cloudflare Workers AI | BUILD-05 |
| **FR-SEC-005** | Zero Diner Tracking / Privacy | MUST | System | SCR-CUST-* | — | Public Routes | None | BUILD-06 |

### 2.2 Deferred Post-MVP Features (Bucket 2)

These features are explicitly excluded from all 8 BUILD phases:

| Feature | Reason Deferred | Target Version |
|:---|:---|:---:|
| Table-Specific QR Codes (`?table=N`) | Additional DB schema + UI complexity | V2 |
| Multi-Language Menu Localization | Requires i18n library + content management | V2 |
| Bulk CSV Menu Import/Export | Low priority for MVP, adds surface area | V2 |
| Privacy-Preserving Menu Analytics | Requires event pipeline infrastructure | V2 |
| Multi-User Staff Permissions | Requires RBAC logic and additional DB models | V2 |
| Custom Subdomain Mapping UI | Infra configuration, no UI code needed | V2 |

### 2.3 Explicitly Out-of-Scope Features (Bucket 3)

These features must NEVER be implemented in any BUILD phase:

- ❌ Shopping cart, checkout flows, or order placement
- ❌ Payment gateway integrations (Stripe, Razorpay, Square)
- ❌ Kitchen Display Systems (KDS) or Kitchen Order Tickets (KOT)
- ❌ Point-of-Sale (POS) hardware synchronization
- ❌ Raw ingredient inventory or automated stock decrement
- ❌ Table reservation booking engine
- ❌ Customer/diner user accounts or login flows
- ❌ Loyalty points or reward programs
- ❌ SMS/WhatsApp notification dispatch from customer-facing routes
- ❌ Waitstaff tip calculation

---

## 3. Change Decision Record

### CDR-001: AI Image Generation — Batch Count Decision

| Field | Detail |
|:---|:---|
| **Decision ID** | CDR-001 |
| **Subject** | Number of AI images generated per request |
| **Phase 00/01 Original Spec** | Generate 4–5 visual variations per request (PRD `FR-AI-002` as originally written, `DEC-Q1` flagged for confirmation) |
| **Phase 02/03 Approved Revision** | Generate **exactly 1 high-resolution image** per request with a "Regenerate" button for dissatisfied owners |
| **Approved Model** | `@cf/black-forest-labs/flux-1-schnell` via Cloudflare Workers AI |
| **Neuron Cost** | ~250 Neurons per image (1024×1024, 4–6 steps) |
| **Free Daily Capacity** | 10,000 Neurons/day = ~40 images/day across all shared deployments |
| **Monthly Free Capacity** | ~1,200 AI images/month at $0.00 cost |
| **Owner Workflow** | Generate → Inspect Preview → Approve & Apply (or Regenerate) |
| **Mandatory Gate** | AI images are NEVER auto-assigned. Owner must click "Approve & Apply to Dish" |
| **Status** | ✅ APPROVED — This is the canonical implementation specification for BUILD-05 |
| **Impact on PRD** | `FR-AI-002` description updated. SCR-ADMIN-08 primary mode is 1-image with Regenerate button. 4-image grid mode is `[TO CONFIRM]` optional batch variant |
| **Rationale** | Faster response (~3s vs ~12s), lower Neuron consumption per session, simpler UI, cleaner approval UX |

### CDR-002: AI Provider Selection

| Field | Detail |
|:---|:---|
| **Decision ID** | CDR-002 |
| **Subject** | AI image generation provider |
| **Phase 01 Working Assumption** | Provider-agnostic; Google Imagen 3 or OpenAI DALL-E 3 |
| **Phase 02/03 Approved Revision** | **Cloudflare Workers AI (`@cf/black-forest-labs/flux-1-schnell`)** |
| **Rationale** | Free tier (10,000 Neurons/day), Apache 2.0 commercial license, no per-token pricing surprise, ~3s generation, photorealistic food output |
| **Status** | ✅ APPROVED |

### CDR-003: Architecture Model

| Field | Detail |
|:---|:---|
| **Decision ID** | CDR-003 |
| **Subject** | Multi-tenant vs. Independent Deployments |
| **Phase 01 Working Assumption** | Shared database with `restaurant_id` on all operational tables (Phase 01 PRD `FR-REUSE-002` as written) |
| **Phase 02/03 Approved Revision** | **Independent Deployments** — one dedicated PostgreSQL database per restaurant deployment |
| **Impact** | Zero `restaurant_id` columns on operational tables. No Row-Level Security required. Physical data isolation is guaranteed. |
| **Status** | ✅ APPROVED — This is the canonical architecture for all BUILD phases |

---

## 4. Readiness Summary

| Category | Status | Notes |
|:---|:---:|:---|
| Phase 00 — Discovery | ✅ APPROVED | Complete |
| Phase 01 — PRD | ✅ APPROVED | Complete |
| Phase 02 — Architecture | ✅ APPROVED | Complete |
| Phase 03 — Design System | ✅ APPROVED | Complete |
| Phase 04 — Planning | 🔄 IN PROGRESS | This document |
| External Credentials | ⚠️ PENDING | Must be obtained before BUILD-02/04/05 |
| Project-Local Skills | ✅ CREATING | 5 skills created in this phase |
| Application Code | ❌ NOT STARTED | Correct — starts at BUILD-01 |

**Overall Readiness:** 🟡 AMBER → Will be GREEN once external credentials are obtained.

