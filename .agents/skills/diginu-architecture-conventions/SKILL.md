---
name: diginu-architecture-conventions
description: "Architectural guidelines, coding standards, and directory conventions for the DigiNu codebase. Enforces Next.js 15 App Router, TypeScript strict mode, Prisma ORM patterns, single-tenant database isolation, and API contract conventions."
---

# DigiNu Architecture & Engineering Conventions

This skill provides the architectural rules, coding standards, and directory structures required across all DigiNu codebase contributions.

---

## 1. Core Architecture Principles

1. **Independent Deployments (One Reusable Codebase):**
   * We do **NOT** build a multi-tenant SaaS application.
   * There is **no shared multi-tenant database** and **no database Row-Level Security (RLS)**.
   * Each restaurant receives its own dedicated application container, isolated PostgreSQL database, environment configuration, and custom domain.
   * Operational database tables (`menu_categories`, `menu_items`, `media_assets`, `operating_hours`, `qr_code_config`, `ai_generation_logs`) **MUST NOT** include a `restaurant_id` foreign key column.
   * `restaurant_profile` is a single-row singleton configuration entity representing the host venue.

2. **Full-Stack Modular Monolith:**
   * Framework: Next.js 15 (App Router, React 19 Server Components)
   * Language: TypeScript with strict mode enabled (`"strict": true`, `"noImplicitAny": true`)
   * Database ORM: Prisma ORM connecting to PostgreSQL
   * Styling: Tailwind CSS v4 driven by CSS custom properties
   * Media Storage: ImageKit.io for asset hosting, CDN distribution, and real-time transformations
   * AI Culinary Engine: Cloudflare Workers AI calling `@cf/black-forest-labs/flux-1-schnell`

---

## 2. Directory Structure Conventions

```text
src/
├── app/
│   ├── (public)/                 # Customer dining interface
│   │   ├── page.tsx              # Public menu landing (Server Component)
│   │   └── layout.tsx            # Theme CSS variable injection
│   ├── (auth)/                   # Owner authentication
│   │   └── admin/login/page.tsx  # Secure login screen
│   ├── admin/                    # Owner dashboard (Protected routes)
│   │   ├── layout.tsx            # Admin sidebar & header layout
│   │   ├── page.tsx              # Overview & quick stats
│   │   ├── profile/page.tsx      # Restaurant branding & hours
│   │   ├── categories/page.tsx   # Category manager & reordering
│   │   ├── menu/page.tsx         # Item manager & 86 toggles
│   │   ├── media/page.tsx        # Media asset library
│   │   └── qr-studio/page.tsx    # QR code export studio
│   └── api/                      # REST API Route Handlers
│       ├── public/
│       │   └── menu/route.ts     # Edge-cached public dining data
│       └── admin/                # Session-protected mutation routes
│           ├── profile/
│           ├── categories/
│           ├── items/
│           ├── media/
│           ├── ai/
│           └── qr-code/
├── components/
│   ├── ui/                       # Base design system primitives (Button, Input, Badge)
│   ├── public/                   # Customer menu components (Hero, Nav, Card, Drawer)
│   └── admin/                    # Owner dashboard components (Tables, Modals, Forms)
├── lib/
│   ├── prisma.ts                 # Global Prisma client singleton
│   ├── auth.ts                   # NextAuth.js v5 credentials configuration
│   ├── imagekit.ts               # ImageKit SDK & HMAC signature generator
│   ├── ai-generator.ts           # Cloudflare Workers AI REST adapter
│   ├── prompt-synthesizer.ts     # Culinary prompt formatting engine
│   └── qr-generator.ts           # QR code SVG/PNG generation utilities
└── types/                        # Shared TypeScript interfaces & Zod schemas
```

---

## 3. API Contract & Validation Rules

* **Route Segmentation:**
  * Public endpoints: `/api/public/*` (strictly read-only, edge-cached, zero auth required).
  * Protected endpoints: `/api/admin/*` (require valid NextAuth.js session; return `401 Unauthorized` if unauthenticated).
* **Validation:** 100% of incoming request payloads must be validated using **Zod** schemas before executing business logic.
* **Standardized Error Envelope:**
  ```json
  {
    "success": false,
    "error": {
      "code": "VALIDATION_ERROR",
      "message": "Dish price must be a positive number",
      "details": []
    }
  }
  ```

---

## 4. Prisma & Database Conventions

* Always import the global Prisma singleton from `src/lib/prisma.ts`. Never instantiate `new PrismaClient()` inside route handlers or components.
* Deletion Safeguards: Categories with existing menu items must **NOT** be cascade deleted (`onDelete: Restrict`). Attempting to delete a non-empty category returns `409 Conflict`.
* Indexes: Always maintain compound indexes on `[is_active, display_order]` for high-frequency menu browsing queries.
* Migrations: All schema updates must be committed via `npx prisma migrate dev --name <migration_name>` during development and applied via `npx prisma migrate deploy` in production.

