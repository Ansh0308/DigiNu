# DigiNu — Production Readiness & Pre-Deployment Audit

**Document ID:** `DEP-01`  
**Phase:** BUILD-08 (Testing, Security Audit & Client Deployment)  
**Status:** COMPLETE & VERIFIED  
**Audited Codebase Baseline:** Next.js 16.4.5 (Turbopack) | Prisma 7.10.1 | PostgreSQL 16 | Node.js v24.14.0  

---

## 1. Executive Summary

This production readiness audit independently verifies that the DigiNu codebase is hardened, compliant with single-tenant isolation rules, free of exposed credentials, and ready for deployment to an independent production environment.

| Audit Vector | Target Requirement | Status | Verification Detail |
|:---|:---|:---|:---|
| **Architecture Model** | Option B: 1 independent deployment & DB per venue | **PASS** | No multi-tenant tables, no shared schemas, single-restaurant singleton enforcement. |
| **Type Safety** | Zero TypeScript compilation errors (`tsc --noEmit`) | **PASS** | 0 errors across 100% of application, API routes, and components. |
| **Lint & Style** | Zero ESLint warnings/errors (`npm run lint`) | **PASS** | ESLint clean; Next.js 16/React 19 hooks and rules verified. |
| **Automated Test Suites** | 100% test pass rate across all builds | **PASS** | 74 of 74 tests passing (BUILD-02 through BUILD-07). |
| **Production Build** | Next.js production build (`npm run build`) | **PASS** | Turbopack compiled 23 routes cleanly in 20.2s with zero static/dynamic bailout issues. |
| **Security Headers** | OWASP recommended defensive headers | **PASS** | CSP, `X-Frame-Options: DENY`, `nosniff`, `strict-origin-when-cross-origin` active. |
| **Credential Safety** | Zero hardcoded secret keys or private tokens | **PASS** | `.env` strictly git-ignored; code reads exclusively from `process.env`. |
| **URL Canonicalization** | Permanent public domain root in QR generation | **PASS** | Enforces `NEXT_PUBLIC_APP_URL` without table IDs, session tokens, or redirects. |

---

## 2. Codebase Component & Subsystem Audit

### A. Authentication & Session Management
- **Library:** Auth.js (`next-auth@5.0.0-beta.32`) with Credentials provider.
- **Password Hashing:** `bcryptjs` with salt rounds $\ge 12$.
- **Session Strategy:** Stateless JSON Web Token (`strategy: "jwt"`), 30-day expiration, stored in `HttpOnly`, `SameSite=Lax`, `Secure` cookies.
- **Timing & Enumeration Mitigation:** Login requests on non-existent accounts take identical execution paths to invalid password attempts.
- **Rate Limiting:** Sliding-window rate limiter restricts failed login attempts to 5 per 15-minute window per IP.
- **Reverse Proxy Support:** Configured with `trustHost: true` in `src/lib/auth.ts`, ensuring reverse-proxy deployments (Railway, Render, Coolify) correctly interpret host headers.

### B. Database Schema & Migration Integrity
- **ORM & Driver:** Prisma 7 with `@prisma/adapter-pg` driver adapter.
- **Migration Pipeline:** 6 applied migrations in `prisma/migrations/`:
  1. `20261107120000_init_single_tenant_schema`
  2. `20261107140000_add_singleton_constraints`
  3. `20261107153000_add_operating_hours_check`
  4. `20261107163620_add_ai_log_status_and_lifecycle`
  5. `20261107165134_add_candidate_hash_to_ai_logs`
  6. `20261113071527_add_qr_config_fields`
- **Singleton Constraints:** Database-level `@unique` keys and SQL `CHECK` constraints guarantee only 1 Restaurant Profile, 1 Owner Account, and 1 QR Code Config per database.
- **Safe Production Execution:** Production provisioning must execute `npx prisma migrate deploy` (never `prisma migrate dev`).

### C. ImageKit Cloud CDN Integration
- **Storage Strategy:** Server-side upload bridge (`POST /api/admin/media/upload`) validates MIME magic bytes (JPEG, PNG, WebP) and size limits ($\le 5\text{MB}$) before streaming to ImageKit.
- **Folder Namespacing:** Isolated under `IMAGEKIT_FOLDER_PREFIX` (e.g. `restaurants/{slug}/branding/`, `.../food/`, `.../ai-generated/`).
- **Secret Isolation:** `IMAGEKIT_PRIVATE_KEY` is strictly confined to server-side API routes; client bundles only receive `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` and `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`.

### D. Cloudflare Workers AI Culinary Studio
- **Model:** `@cf/black-forest-labs/flux-1-schnell` via Cloudflare REST API.
- **Credit Lifecycle:** PostgreSQL-backed atomic credit reservation with SHA-256 candidate image hashing.
- **Exactly-Once Refunds:** Failed generations refund atomically; approved or discarded candidates permanently consume credits.
- **Candidate Integrity:** Approvals are cryptographically verified against the server-generated candidate hash, blocking arbitrary browser-supplied payloads.

### E. Public Customer Menu & QR Print Studio
- **Edge Caching:** `GET /api/public/menu` serves `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.
- **Read-Only Invariant:** Customer menu rejects mutation verbs (`POST`, `PUT`, `DELETE`, `PATCH` return `405 Method Not Allowed`).
- **Zero PII Exposure:** Sanitizer excludes owner passwords, email addresses, draft items, and internal audit logs from customer payloads.
- **Deterministic QR Output:**
  - Encodes `NEXT_PUBLIC_APP_URL` without table numbers or redirects.
  - Generates lossless vector SVG with circular logo mask and Error Correction Level `H` (30%).
  - Generates 300 DPI high-res PNG (2048 × 2048 px) with embedded density metadata.
  - Generates print-ready A6 table-tent PDF (105mm × 148mm) with 3mm trim/bleed marks and dynamically calculated text bounding boxes to eliminate overlaps.

---

## 3. Pre-Deployment Configuration Verifications

1. **Production Fallback Checks**:
   - `getCanonicalMenuUrl()` defaults to `process.env.NEXT_PUBLIC_APP_URL`. If unset in production, it falls back to `http://localhost:3000`. **Mandate:** Production environment must explicitly define `NEXT_PUBLIC_APP_URL=https://your-domain.com`.
2. **Build Optimization**:
   - Next.js dynamic API routes enforce `export const dynamic = "force-dynamic"`, preventing Turbopack from attempting static pre-rendering of authenticated endpoints during deployment builds.
3. **Postinstall Prisma Hook**:
   - In production CI/CD containers, running `prisma generate` ensures Prisma Client binaries match the Linux target architecture.

