# ADR-002: Upgrade Baseline to Next.js 16 Active LTS and Prisma 7 Stable

**Document Version:** 1.1  
**Status:** APPROVED BY FREELANCER  
**Date:** November 2026  
**Deciders:** Freelance Lead Architect / Solution Architect  
**Consulted:** Antigravity AI Development Environment  

---

## 1. Context & Problem Statement

In the Phase 02 Technical Architecture baseline, the full-stack technology stack was specified around **Next.js 15 (App Router)** and **Prisma ORM 6**, targeting React 19 stable compatibility. 

During the pre-implementation audit for BUILD-01, official registry verification and documentation review identified that:
1. **Next.js 16** is the **Active LTS** release line (`v16.4.5` released October 2026), whereas Next.js 15 has entered Maintenance LTS.
2. **Prisma 7** is the current production **Stable** line (`v7.10.1`), while Prisma 8 is currently in Release Candidate (`8.0.0-rc.33`).
3. Running on modern Node.js 24 LTS runtime (`v24.14.0+`) with long-term commercial client deployments benefits significantly from starting directly on the Active LTS release, avoiding immediate deprecation technical debt within months of client launch.

This ADR approves upgrading the project foundation baseline to **Next.js 16 Active LTS** and **Prisma 7 Stable**, documenting all architectural adjustments, configuration paradigms, and breaking changes.

---

## 2. Decision Matrix: Previous Baseline vs. Approved Baseline

> [!CAUTION]
> **CRITICAL NPM TAG WARNING FOR PRISMA:**  
> The `latest` tag on the npm registry for `prisma` points to `8.0.0-rc.33` (Release Candidate).  
> **NEVER install `prisma` or `@prisma/client` without strict version pinning!**  
> Always run `npm install prisma@^7.10.1` and `npm install @prisma/client@^7.10.1` to prevent accidental unvetted major RC installations.

| Component | Previous Baseline (Phase 02 Baseline) | Approved Baseline (ADR-002) | Version Constraint | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Full-Stack Framework** | Next.js 15 (App Router) | **Next.js 16 (App Router)** | `next@^16.4.5` | `APPROVED BY FREELANCER` |
| **React Runtime** | React 19 Stable | **React 19 Stable** | `react@^19.0.0`, `react-dom@^19.0.0` | `APPROVED BY FREELANCER` |
| **TypeScript** | TypeScript 5.x | **TypeScript 5.9+** | `typescript@^5.9.0` (or compatible 5.x) | `APPROVED BY FREELANCER` |
| **Node.js Runtime** | Node.js 20+ | **Node.js 24 LTS** | Node.js `v24.14.0+` | `APPROVED BY FREELANCER` |
| **Styling** | Tailwind CSS v4 (or v3) | **Tailwind CSS v4** | `tailwindcss@^4.0.0`, `@tailwindcss/postcss@^4.0.0` | `APPROVED BY FREELANCER` |
| **Database ORM** | Prisma 6 (`prisma-client-js`) | **Prisma 7 Stable (`prisma-client`)** | `prisma@^7.10.1`, `@prisma/client@^7.10.1` | `APPROVED BY FREELANCER` |
| **Database Driver Adapter** | Native Rust Engine (Engine embedded) | **`@prisma/adapter-pg` + `pg`** | `@prisma/adapter-pg@^7.10.1`, `pg@^8.13.0` | `APPROVED BY FREELANCER` |
| **Authentication** | NextAuth.js v5 (`5.0.0-beta.25`) | **Auth.js v5 (`5.0.0-beta.32`+)** *(Beta Notice)* | `next-auth@^5.0.0-beta.32` | `APPROVED BY FREELANCER` |
| **Network Interception** | `src/middleware.ts` | **`src/proxy.ts` (Next.js 16 standard)** | File convention: `proxy.ts` | `APPROVED BY FREELANCER` |
| **Authorization Enforcement** | Network middleware check | **Defense-in-Depth:** `proxy.ts` + Server-side session checks in every Server Action & API Route | Independent checks | `APPROVED BY FREELANCER` |

---

## 3. Rationale for Change

1. **Commercial Longevity & Maintenance Horizon:**
   Next.js 16 will receive active security patches and platform feature enhancements throughout 2027–2028. Starting a greenfield commercial platform on Maintenance LTS (Next.js 15) forces a major framework upgrade on independent client deployments shortly after delivery.
2. **Prisma 7 TypeScript Architecture:**
   Prisma 7 replaces the heavy native Rust binary query engine with a modular, lightweight TypeScript client coupled with standard PostgreSQL driver adapters (`@prisma/adapter-pg`). This significantly improves serverless cold-start times on Railway/Render/Coolify and eliminates binary glibc/musl compatibility headaches across Linux deployment containers.
3. **Turbopack Default in Next.js 16:**
   Next.js 16 establishes Turbopack as the default compiler for both local development and production builds, yielding 2–4x faster compilation cycles for solo developers.
4. **Prisma 8 RC Rejection:**
   Prisma 8 (`8.0.0-rc.33`) is an unreleased Release Candidate. Adhering to strict commercial stability rules, Prisma 8 RC is rejected for the production MVP in favor of the battle-tested Prisma 7 stable line (`7.10.1`).
5. **Defense-in-Depth Authorization:**
   While Next.js 16 renames `middleware.ts` to `src/proxy.ts` for edge request routing and early redirection, application security mandates that authorization is **independently validated** in every Server Action and API Route handler. The network proxy must never be the sole line of defense against unauthorized mutations.
6. **Auth.js v5 Beta Compatibility Verification:**
   Auth.js v5 (`next-auth@^5.0.0-beta.32`) remains in beta status. It is thoroughly verified for Next.js 16 App Router compatibility and credentials authentication. Any minor API shifts are isolated in `src/lib/auth.ts` and `src/proxy.ts`.

---

## 4. Key Breaking Changes & Implementation Impact

### 4.1 Next.js 16: `middleware.ts` Renamed to `proxy.ts` & Defense-in-Depth
* **Breaking Change:** In Next.js 16, the network interceptor file convention has been renamed from `middleware.ts` to `proxy.ts` to accurately reflect its network boundary nature and prevent naming confusion with Express/Node middleware.
* **Impact:** 
  - File location: `src/proxy.ts` (at the root of `src/`, parallel to `app/`).
  - Export: `export function proxy(request: NextRequest)` or default export.
  - Route protection for `/admin/:path*` is authored inside `src/proxy.ts` for fast early redirection.
  - **MANDATORY SECURITY RULE:** Every Server Action and API Route under `/api/admin/*` must independently call `await auth()` and verify the session before executing any database operation or privileged business logic.

### 4.2 Prisma 7: Decoupled Configuration via `prisma.config.ts`
* **Breaking Change:** Database connection URLs are **no longer specified inside `schema.prisma`** via `datasource db { url = env("DATABASE_URL") }`. Environment variables and migration paths are managed via a new root configuration file: `prisma.config.ts`.
* **Impact:**
  - Create `prisma.config.ts` using `defineConfig` and `env("DATABASE_URL")`.
  - `schema.prisma` datasource block retains only `provider = "postgresql"`.
  - Generator block updates to `provider = "prisma-client"` with a mandatory `output` parameter (e.g., `output = "./generated/prisma"` or `@prisma/client`).

### 4.3 Prisma 7: Mandatory PostgreSQL Driver Adapter
* **Breaking Change:** The Rust query engine is replaced with direct database driver adapters. Initializing `new PrismaClient()` without an adapter is deprecated.
* **Impact:**
  - Install dependencies: `npm install @prisma/adapter-pg@^7.10.1 pg@^8.13.0 && npm install -D @types/pg@^8.11.0`.
  - `src/lib/prisma.ts` initializes the client using `PrismaPg`:
    ```typescript
    import { Pool } from "pg";
    import { PrismaPg } from "@prisma/adapter-pg";
    import { PrismaClient } from "@prisma/client";

    const connectionString = process.env.DATABASE_URL;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    export const prisma = globalThis.prisma || new PrismaClient({ adapter });
    if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
    ```

### 4.4 Auth.js v5: Proxy Export Pattern & Beta Status
* **Breaking Change:** NextAuth session verification on protected routes integrates with the `proxy.ts` handler convention in Next.js 16.
* **Impact:**
  - `src/proxy.ts` exports Auth.js session checking:
    ```typescript
    import { auth } from "@/lib/auth";
    export const proxy = auth;
    export const config = {
      matcher: ["/admin/:path*"],
    };
    ```
  - Note: `next-auth@^5.0.0-beta.32` is pinned and wrapped cleanly in `src/lib/auth.ts`.

---

## 5. Updated Execution Plan & Commands

### 5.1 BUILD-01 Updated Scope (Project Foundation)
* Initialize project with:
  ```json
  {
    "dependencies": {
      "next": "^16.4.5",
      "react": "^19.0.0",
      "react-dom": "^19.0.0",
      "lucide-react": "^0.475.0"
    },
    "devDependencies": {
      "@tailwindcss/postcss": "^4.0.0",
      "@types/node": "^24.0.0",
      "@types/react": "^19.0.0",
      "@types/react-dom": "^19.0.0",
      "eslint": "^9.0.0",
      "eslint-config-next": "^16.4.5",
      "postcss": "^8.5.0",
      "tailwindcss": "^4.0.0",
      "typescript": "^5.9.0"
    }
  }
  ```
* PostCSS & Tailwind v4: `postcss.config.mjs` with `@tailwindcss/postcss`.
* `src/app/globals.css`: `@import "tailwindcss";` with full token variables and 3 theme presets.
* `next.config.ts`: Security headers and ImageKit remote image allowlist.

### 5.2 BUILD-02 Updated Scope (Database & Authentication)
* Install Prisma 7 and driver adapter (Explicitly pinned, avoiding npm latest tag for v8 RC):
  ```bash
  npm install @prisma/client@^7.10.1 @prisma/adapter-pg@^7.10.1 pg@^8.13.0
  npm install -D prisma@^7.10.1 @types/pg@^8.11.0 dotenv
  ```
* Create `prisma.config.ts`:
  ```typescript
  import "dotenv/config";
  import { defineConfig, env } from "prisma/config";

  export default defineConfig({
    schema: "prisma/schema.prisma",
    migrations: {
      path: "prisma/migrations",
    },
    datasource: {
      url: env("DATABASE_URL"),
    },
  });
  ```
* Create `src/proxy.ts` for Next.js 16 route protection, with independent session checks in every Server Action and API handler.

---

## 6. Official Documentation References

* Next.js 16 Release & Proxy Documentation: https://nextjs.org/docs/app/building-your-application/routing/middleware (proxy convention)
* Next.js 16 Upgrade Guide: https://nextjs.org/docs/app/building-your-application/upgrading/version-16
* Prisma 7 Configuration & Drivers: https://www.prisma.io/docs/orm/more/upgrade-guides/upgrading-versions/upgrading-to-prisma-7
* Prisma Driver Adapters (`@prisma/adapter-pg`): https://www.prisma.io/docs/orm/overview/databases/postgresql
* Auth.js v5 Documentation: https://authjs.dev/getting-started

---

## 7. Status & Review Gate

This ADR is **`APPROVED BY FREELANCER`**. The project baseline is authorized to proceed with Next.js 16 Active LTS and Prisma 7 Stable. Execution authorization for BUILD-01 is granted.

