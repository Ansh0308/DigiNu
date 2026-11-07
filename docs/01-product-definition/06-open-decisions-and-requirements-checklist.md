# Open Decisions, Traceability Matrix & Requirements Checklist — DigiNu

**Document Version:** 1.0  
**Phase:** 01 — Product Definition  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Management System  

---

## 1. Stakeholder Open Decisions & Clarifications Log

The following key business and technical decisions are flagged for confirmation by the product owner before Phase 02 begins:

| Question ID | Decision Item | Current Working Assumption | Impact if Changed | Status |
| :--- | :--- | :--- | :--- | :--- |
| **DEC-Q1** | **AI Generation Batching Strategy** | Generate all 4–5 variations simultaneously in a single parallel batch request. | If changed to 2 initial options + "Generate 2 More", API costs per generation decrease by 50% for satisfied users. | `[TO CONFIRM]` |
| **DEC-Q2** | **AI Provider Account & Billing** | System uses a provider-agnostic adapter. Initial implementation targets Google Imagen 3 or OpenAI DALL-E 3 based on freelancer credentials. | Dictates backend environment variables and SDK dependencies. | `[TO CONFIRM]` |
| **DEC-Q3** | **Dish Sizing & Option Modifiers** | MVP supports a single base price per food item (e.g., Margherita $16). Sizing options (Small $12 / Large $18) deferred to V2. | If needed in MVP, requires adding a child `dish_variants` table in schema design. | `[TO CONFIRM]` |
| **DEC-Q4** | **Tenant Onboarding Mechanism** | Freelancer onboards new restaurants via database seed scripts / CLI commands for MVP. Full master super-admin UI deferred to V2. | Speeds up MVP launch significantly for the freelancer. | `[TO CONFIRM]` |
| **DEC-Q5** | **Monthly AI Quota Allocation** | Default quota of 30 AI generations per month included in standard restaurant subscription tier. | Adjusts initial seed quota in database. | `[TO CONFIRM]` |

---

## 2. Product Risks & Mitigation Checklist

* **[Risk 1] AI API Cost Overrun:** Mitigated via atomic tenant quota checks and double-click mutex locking.
* **[Risk 2] Venue Low-Connectivity:** Mitigated via edge CDN caching, WebP compression (< 50KB thumbnails), and zero-layout-shift skeletons.
* **[Risk 3] Cross-Tenant Data Leakage:** Mitigated via strict database-level Row-Level Security (RLS) policies and automated tenant isolation tests.
* **[Risk 4] Unappetizing AI Outputs:** Mitigated via specialized culinary prompt synthesis with camera angles, lighting directives, and negative constraints, plus mandatory human approval before publishing.

---

## 3. Requirements Traceability Matrix (RTM)

This checklist verifies that every functional requirement is mapped to a user story, acceptance criteria, and specific screen/flow:

| Req ID | Requirement Description | Priority | Mapped User Story | Testable Acceptance Criteria | Associated Screen / Flow |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **`FR-MENU-001`** | Public Menu Resolution by Slug | Must | `US-CUST-001` | Scenario 1 (Valid) & Scenario 2 (404) | Screen 1 / Flow 1 |
| **`FR-MENU-002`** | Restaurant Branding Header & Info | Must | `US-CUST-001` | Scenario 1 (Header assets, hours, contact) | Screen 1 / Flow 1 |
| **`FR-MENU-003`** | Sticky Scroll-Spy Category Nav | Must | `US-CUST-002` | Scenario 1 (Tap jump) & Scenario 2 (Spy highlight) | Screen 1 / Flow 1 |
| **`FR-MENU-004`** | Food Item Card Display & Anatomy | Must | `US-CUST-003` | Scenario 1 (Image, price, title, tags) | Screen 1 / Flow 1 |
| **`FR-MENU-005`** | Real-Time Sold Out (86) Status | Must | `US-CUST-004` | Scenario 1 (50% opacity, badge) | Screen 1 / Flow 1 |
| **`FR-MENU-006`** | Food Item Detail Modal View | Should | `US-CUST-003` | Scenario 1 (Bottom sheet expansion, allergens) | Screen 2 / Flow 1 |
| **`FR-MENU-007`** | Live Client-Side Search & Filter | Should | `US-CUST-005` | Scenario 1 (Veg filter) & Scenario 2 (Keyword search) | Screen 1 / Flow 1 |
| **`FR-AUTH-001`** | Secure Owner Login | Must | `US-OWN-001` | Scenario 1 (Success) & Scenario 2 (Lockout) | Screen 3 / Auth Flow |
| **`FR-AUTH-002`** | Protected Routes & Session Expiry | Must | `US-OWN-002` | Scenario 1 (Persistence) & Scenario 2 (Logout) | Admin Layout / Auth |
| **`FR-PROF-001`** | Profile & Contact Info Management| Must | `US-OWN-003` | Scenario 2 (Address, maps, phone) | Screen 4 / Profile |
| **`FR-PROF-002`** | Logo & Cover Banner Upload | Must | `US-OWN-003` | Scenario 1 (Upload, crop, preview) | Profile / Storage Flow |
| **`FR-PROF-003`** | Brand Theming & Currency Settings | Must | `US-OWN-003` | Scenario 1 (Color picker, theme preset) | Profile / Flow 2 |
| **`FR-PROF-004`** | Operating Hours Configuration | Should | `US-OWN-003` | Scenario 1 (7-day open/close editor) | Profile / Settings |
| **`FR-CAT-001`** | Category CRUD Operations | Must | `US-CAT-001` | Scenario 1 (Create/edit) & Scenario 2 (Validate) | Screen 5 / Categories |
| **`FR-CAT-002`** | Category Display Reordering | Must | `US-CAT-002` | Scenario 1 (Drag/arrow reordering) | Screen 5 / Categories |
| **`FR-CAT-003`** | Category Visibility Toggle | Should | `US-CAT-001` | Scenario 1 (Seasonal hide toggle) | Screen 5 / Categories |
| **`FR-ITEM-001`** | Food Item Creation & Attributes | Must | `US-ITEM-001` | Scenario 1 (Fields validation, tags) | Screen 6 / Flow 2 |
| **`FR-ITEM-002`** | Image Sourcing Selection | Must | `US-ITEM-003` | Scenario 1 (Upload, Library, AI Studio) | Screen 6 / Flow 2 |
| **`FR-ITEM-003`** | Veg/Non-Veg & Dietary Badges | Must | `US-ITEM-001` | Scenario 1 (Green/brown dots, badges) | Screen 6 / Flow 2 |
| **`FR-ITEM-004`** | Item Availability 86 Toggle | Must | `US-ITEM-002` | Scenario 1 (1-tap toggle to Sold Out) | Screen 4, 6 / Flow 2 |
| **`FR-ITEM-005`** | Item Reordering within Category | Should | `US-ITEM-001` | Scenario 1 (Order sequence saved) | Screen 6 / Flow 2 |
| **`FR-AI-001`** | Culinary Prompt Synthesis | Must | `US-AI-001` | Scenario 1 (Prompt formatting & negatives) | Flow 3 / Backend |
| **`FR-AI-002`** | Multi-Variation Batch (4-5) | Must | `US-AI-001` | Scenario 1 (Return 4-5 options) | Screen 7 / Flow 3 |
| **`FR-AI-003`** | Interactive Preview & Zoom | Must | `US-AI-002` | Scenario 1 (Side-by-side inspection) | Screen 7 / Flow 3 |
| **`FR-AI-004`** | Human Approval & WebP Save | Must | `US-AI-002` | Scenario 1 (Explicit approval mandate) | Screen 7 / Flow 3 |
| **`FR-AI-005`** | AI Failure & Timeout Resilience | Must | `US-AI-003` | Scenario 1 (Graceful error handling) | Screen 7 / Flow 3 |
| **`FR-AI-006`** | Monthly Quota & Abuse Prevention | Must | `US-AI-001` | Scenario 2 (Credit lockout, debouncing) | Screen 7 / Flow 3 |
| **`FR-QR-001`** | Deterministic Canonical QR Code | Must | `US-QR-001` | Scenario 1 (Permanent slug encoding) | Screen 8 / Flow 4 |
| **`FR-QR-002`** | Branded Customization & Logo | Should | `US-QR-001` | Scenario 2 (Center logo, color theming) | Screen 8 / Flow 4 |
| **`FR-QR-003`** | Print-Ready SVG / PNG / PDF Export | Must | `US-QR-002` | Scenario 1 (SVG download) & Scenario 2 (PNG) | Screen 8 / Flow 4 |
| **`FR-REUSE-001`**| Zero Hardcoded Tenant Data | Must | All Stories | Config-driven tenant attributes | All Screens |
| **`FR-REUSE-002`**| Database Row-Level Isolation | Must | `US-OWN-001` | Strict `restaurant_id` enforcement | Backend / Database |
| **`FR-SEC-001`** | Read-Only Public Dining Route | Must | `US-CUST-001` | Zero public mutations permitted | Edge / API |
| **`FR-SEC-002`** | Public Payload Data Sanitization | Must | `US-CUST-001` | Strips admin emails, keys, drafts | Public API |
| **`FR-SEC-003`** | File Upload MIME & EXIF Strip | Must | `US-ITEM-003` | Rejects non-images, strips GPS | Upload Pipeline |
| **`FR-SEC-004`** | AI Secret Isolation | Must | `US-AI-001` | API keys remain server-side only | Backend |
| **`FR-SEC-005`** | Zero Diner Tracking & Privacy | Must | `US-CUST-001` | No PII or tracking cookies collected | Public Client |

---

## 4. Phase 01 Gate Verification Summary

- [x] All Phase 00 requirements mapped to functional requirements and user stories.
- [x] Every Must-have requirement has testable Given/When/Then acceptance criteria.
- [x] Complete scope hygiene preserved: No ordering, cart, checkout, payment, KDS, POS, or inventory features included.
- [x] AI food image workflow details multi-variation generation, prompt synthesis, side-by-side preview, mandatory human approval, and graceful failure handling.
- [x] Multi-tenant isolation and white-label theming are formally specified.
- [x] All 6 Phase 01 documents approved by stakeholder.

**Approval Status:** `APPROVED BY FREELANCER`

