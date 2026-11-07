# Phase 02 Architecture Approval Checklist — DigiNu

**Document Version:** 2.0 (Independent Deployments Revision)  
**Phase:** 02 — Technical Architecture & Data Model  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Architectural Review Checklist

This checklist verifies that all technical decisions and design specifications comply with the approved **Independent Deployments** architecture:

### 1.1 Product Delivery Model & Isolation
- [x] **Independent Deployments Approved:** Confirmed one reusable codebase powering independent application and database deployments per restaurant.
- [x] **Removal of Multi-Tenant Complexity:** Removed `restaurant_id` columns from operational tables (`menu_categories`, `menu_items`, `media_assets`, `operating_hours`, `qr_code_config`, `ai_generation_logs`).
- [x] **Removal of Row-Level Security (RLS):** Physical database isolation replaces logical RLS, guaranteeing zero cross-tenant leakage.
- [x] **Removal of Super-Admin Portal:** Central tenant-management dashboard eliminated from MVP; replaced with scripted onboarding (`prisma/seed.ts`).
- [x] **Singleton Restaurant Profile:** `restaurants` table replaced with `restaurant_profile` single-row configuration entity.

### 1.2 Technology Stack & Commercial Hosting
- [x] **Full-Stack Modular Monolith:** Next.js 15 (App Router, TypeScript) selected for rapid maintainability by a solo freelancer.
- [x] **PostgreSQL & Prisma ORM:** Retained for strict relational integrity, foreign key cascading (`ON DELETE RESTRICT`), and automated migrations.
- [x] **Commercial Hosting Compliance:** Vercel Hobby commercial prohibition explicitly noted; cost model designed around Railway/Render PaaS ($10/mo) or Coolify VPS ($1.50–$3/mo).

### 1.3 Image Storage (ImageKit.io)
- [x] **Folder-Segregated Media Strategy:** Evaluated and recommended a central ImageKit account with dedicated client folders (`/restaurants/{slug}/...`).
- [x] **Direct Browser Uploads:** Secure HMAC-SHA1 signatures generated on server (`/api/admin/media/imagekit-auth`).
- [x] **Binary Decoupling:** Image binaries stored on ImageKit CDN; database stores only references.
- [x] **Free-Tier Limits Verified:** 3 GB DAM storage, 20 GB bandwidth verified; upgrade path to $9/mo Lite plan documented.

### 1.4 AI Food Image Generation (1 Image per Run)
- [x] **1 Image Generation Approved:** Architecture generates **exactly 1 high-resolution image per generation** (~250 Neurons), reducing latency to 3–4s and cutting token consumption by 75%.
- [x] **Provider & License:** Cloudflare Workers AI (`@cf/black-forest-labs/flux-1-schnell`) under an **Apache 2.0 commercial license**.
- [x] **Free Quota Verified:** 10,000 Neurons/day free allocation yields **40 free image generations per day** (~1,200/month free) across all deployments.
- [x] **Mandatory Human Approval:** Generated image is previewed; owner clicks "Approve & Apply" or "Regenerate".

### 1.5 Data Model & API Contracts
- [x] **Conceptual ERD:** 8 simplified relational tables without multi-tenant foreign key bloat.
- [x] **REST API Contracts:** Standardized endpoints (`GET /api/public/menu`, `/api/admin/*`) with Zod validation.
- [x] **Sequence Diagrams:** 4 Mermaid diagrams reflecting single-tenant architecture and 1-image AI workflow.

### 1.6 Reusable Client Onboarding & Upstream Updates
- [x] **Repeatable Onboarding Workflow:** Documented 6-step setup (Template repo -> Dedicated DB -> Configure `.env` -> `prisma migrate` & `seed` -> Deploy).
- [x] **Upstream Sync Workflow:** Documented Git upstream merging process for pushing core improvements to client deployments.

---

## 2. Document Status Confirmation

* All Phase 02 technical architecture documents have been updated under `docs/02-technical-architecture/` and marked as **`DRAFT — REVIEW REQUIRED`**.
* **Zero code written:** No application code, database migrations, npm packages, or external infrastructure accounts have been provisioned in this phase.
