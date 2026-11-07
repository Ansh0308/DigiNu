# Environments, Repository & Client Onboarding Plan — DigiNu

**Document Version:** 2.0 (Independent Deployments Revision)  
**Phase:** 02 — Technical Architecture & Data Model  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Reusable Repository Structure

The core repository serves as a **canonical commercial template**. Every client deployment is an isolated instance of this codebase with its own environment variables and database:

```text
DigiNu/
├── .github/
│   └── workflows/
│       └── ci.yml                     # Automated Linting & TypeCheck
├── docs/                              # Project Documentation Repository
│   ├── PROJECT_CONTEXT_INDEX.md       # Master Documentation Index
│   ├── 00-discovery/                  # Phase 00 Discovery Artifacts
│   ├── 01-product-definition/         # Phase 01 PRD & Acceptance Criteria
│   └── 02-technical-architecture/     # Phase 02 Architecture & ERD Specifications
├── prisma/
│   ├── schema.prisma                  # Dedicated Single-Restaurant Schema
│   ├── migrations/                    # Automated Database Migrations
│   └── seed.ts                        # Seed Script (Seeds Profile & Initial Owner)
├── public/
│   ├── favicon.ico
│   └── placeholders/                  # Fallback Dish & Banner Placeholders
├── src/
│   ├── app/                           # Next.js App Router
│   │   ├── layout.tsx                 # Root Layout & Theme Variable Wrapper
│   │   ├── globals.css                # Tailwind Directives & CSS Variables
│   │   ├── page.tsx                   # Public Customer Menu (Default Root Route)
│   │   ├── not-found.tsx              # Friendly 404 Screen
│   │   ├── admin/                     # OWNER ADMIN DOMAIN
│   │   │   ├── layout.tsx             # Admin Navigation Sidebar & Header
│   │   │   ├── page.tsx               # Overview Dashboard & Quick Stats
│   │   │   ├── login/page.tsx         # Owner Authentication Screen
│   │   │   ├── profile/page.tsx       # Restaurant Profile, Branding & Hours
│   │   │   ├── categories/page.tsx    # Category CRUD & Reorder Screen
│   │   │   ├── items/
│   │   │   │   ├── page.tsx           # Dish List with 1-Tap 86 Toggles
│   │   │   │   ├── new/page.tsx       # Create Dish Form
│   │   │   │   └── [id]/edit/page.tsx # Edit Dish & 1-Image AI Studio
│   │   │   ├── media/page.tsx         # Image Asset Gallery
│   │   │   └── qr-code/page.tsx       # QR Code Studio & Vector Export
│   │   └── api/                       # SERVERLESS ROUTE HANDLERS
│   │       ├── auth/[...nextauth]/    # NextAuth Authentication
│   │       ├── public/menu/route.ts   # Edge Cached Public Menu API
│   │       └── admin/
│   │           ├── profile/route.ts
│   │           ├── categories/route.ts
│   │           ├── items/route.ts
│   │           ├── media/
│   │           │   ├── imagekit-auth/route.ts
│   │           │   └── confirm/route.ts
│   │           ├── ai/
│   │           │   ├── generate/route.ts  # 1-Image Generation
│   │           │   └── approve/route.ts   # Approve & Save
│   │           └── qr-code/download/route.ts
│   ├── components/                    # REACT UI COMPONENTS
│   │   ├── public/                    # Customer Menu Components
│   │   │   ├── MenuHeader.tsx
│   │   │   ├── CategoryNav.tsx        # Sticky Scroll-Spy Category Bar
│   │   │   ├── FoodCard.tsx           # Dish Card with Badges & 86 Overlay
│   │   │   ├── DishDetailDrawer.tsx   # Expanded Allergen & Ingredient Sheet
│   │   │   └── LiveSearchBar.tsx      # Client-Side Debounced Filter
│   │   ├── admin/                     # Owner Admin Dashboard Components
│   │   │   ├── StatCard.tsx
│   │   │   ├── AvailabilityToggle.tsx # 1-Tap 86 Switch
│   │   │   ├── AIStudioModal.tsx      # 1-Image Preview & Approval
│   │   │   ├── ImageKitUploader.tsx   # Direct Client ImageKit Uploader
│   │   │   └── QRPreview.tsx          # Real-time QR SVG Preview with Logo
│   │   └── ui/                        # Low-Level Primitives (Buttons, Dialogs)
│   ├── lib/                           # CORE SERVICES & ADAPTERS
│   │   ├── prisma.ts                  # Global Prisma Client Instance
│   │   ├── auth.ts                    # NextAuth Configuration
│   │   ├── imagekit.ts                # ImageKit Server SDK Adapter
│   │   ├── ai-generator.ts            # Cloudflare Workers AI Inference Client
│   │   ├── prompt-synthesizer.ts      # Culinary Prompt Synthesizer
│   │   └── qr-generator.ts            # SVG & 300 DPI PNG Generator
│   ├── types/                         # TYPESCRIPT SCHEMAS & INTERFACES
│   │   ├── menu.ts
│   │   └── validation.ts              # Zod Schemas
├── .env.example                       # Environment Variable Template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

---

## 2. Environment Variables Configuration (`.env.example`)

Configured uniquely per restaurant deployment:

```bash
# ==============================================================================
# DIGINU DEPLOYMENT CONFIGURATION TEMPLATE (PER RESTAURANT)
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. DATABASE CONFIGURATION (Dedicated PostgreSQL)
# ------------------------------------------------------------------------------
# Dedicated PostgreSQL connection string (Railway / Supabase / Neon / Local VPS)
DATABASE_URL="postgresql://user:password@host:5432/diginu_client_db?sslmode=require"
DIRECT_URL="postgresql://user:password@host:5432/diginu_client_db?sslmode=require"

# ------------------------------------------------------------------------------
# 2. APPLICATION RUNTIME & DOMAIN
# ------------------------------------------------------------------------------
NODE_ENV="production"
# The client's public URL (used for QR code generation and canonical links)
NEXT_PUBLIC_APP_URL="https://bella-italia.com"

# ------------------------------------------------------------------------------
# 3. AUTHENTICATION (NextAuth.js v5)
# ------------------------------------------------------------------------------
# Generate with: openssl rand -base64 32
AUTH_SECRET="your-32-byte-base64-auth-secret-here"
AUTH_TRUST_HOST="true"

# ------------------------------------------------------------------------------
# 4. RESTAURANT INITIAL SEED CONFIGURATION (Used by prisma/seed.ts)
# ------------------------------------------------------------------------------
RESTAURANT_NAME="Bella Italia"
RESTAURANT_SLUG="bella-italia"
INITIAL_OWNER_EMAIL="owner@bella-italia.com"
INITIAL_OWNER_PASSWORD="TemporarySecurePassword123!"

# ------------------------------------------------------------------------------
# 5. IMAGEKIT.IO INTEGRATION (Media Storage & Delivery)
# ------------------------------------------------------------------------------
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="public_sample_key_here"
IMAGEKIT_PRIVATE_KEY="private_sample_key_here"
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/diginu"
# Dedicated folder prefix for this client
IMAGEKIT_FOLDER_PREFIX="bella-italia"

# ------------------------------------------------------------------------------
# 6. CLOUDFLARE WORKERS AI (Neural Food Image Generation)
# ------------------------------------------------------------------------------
CLOUDFLARE_ACCOUNT_ID="your_cloudflare_account_id_here"
CLOUDFLARE_API_TOKEN="your_cloudflare_api_token_here"
AI_MODEL_ID="@cf/black-forest-labs/flux-1-schnell"

# ------------------------------------------------------------------------------
# 7. QUOTA SETTINGS
# ------------------------------------------------------------------------------
MONTHLY_AI_CREDITS="30"
```

---

## 3. Repeatable Client Onboarding Workflow

The operational process for onboarding a new restaurant client in under 15 minutes:

```
New Restaurant = Reuse Codebase + Configure Branding + Initialize DB + Configure Integrations + Deploy
```

```mermaid
sequenceDiagram
    autonumber
    actor Freelancer as Freelancer
    participant Git as GitHub (Template Repo)
    participant Host as Cloud Host (Railway / VPS)
    participant DB as Managed PostgreSQL
    participant App as Client Deployment

    Freelancer->>Git: 1. Create client deployment branch/repo (e.g. client/bella-italia)
    Freelancer->>Host: 2. Create new project: "DigiNu - Bella Italia"
    Freelancer->>DB: 3. Provision dedicated PostgreSQL database
    Freelancer->>Host: 4. Configure environment variables (.env)
    Host->>App: 5. Build application & execute 'prisma migrate deploy'
    Host->>App: 6. Execute 'prisma db seed' (Seeds Profile & Owner Account)
    Host-->>Freelancer: 7. Application Live at https://bella-italia.com
    Freelancer->>App: 8. Verify public menu & download table QR codes
    Freelancer->>Freelancer: 9. Hand over login credentials to Restaurant Owner
```

### Step-by-Step Onboarding Checklist
1. **Repository Setup:**
   - Link client project to the core DigiNu GitHub repository (via a client branch `client/{slug}` or repository template clone).
2. **Database Provisioning:**
   - Create a new PostgreSQL database instance (e.g., on Railway or Coolify).
3. **Environment Configuration:**
   - Populate `.env` with `DATABASE_URL`, `NEXT_PUBLIC_APP_URL`, `AUTH_SECRET`, `RESTAURANT_NAME`, `IMAGEKIT_FOLDER_PREFIX`, and API keys.
4. **Database Initialization:**
   - Run `npx prisma migrate deploy` to create the 8 isolated relational tables.
   - Run `npx prisma db seed` to initialize `restaurant_profile`, default categories, and initial owner credentials.
5. **Deployment & Domain Mapping:**
   - Trigger deployment build.
   - Bind restaurant custom domain (e.g. `menu.bellaitalia.com` or `bella-italia.diginu.app`) with automatic SSL.
6. **QR Code Handover:**
   - Log into `/admin`, verify profile branding, and download the print-ready vector SVG and 300 DPI PNG table QR codes.
   - Hand over owner credentials.

---

## 4. Upstream Update Strategy (Maintaining Reusable Deployments)

When improvements, bug fixes, or new features are developed in the core DigiNu codebase:

```text
[ DigiNu Core Repo (main) ]
         │
         ├─── git merge upstream ───> [ client/bella-italia ] ───> Auto-deploy to Railway
         ├─── git merge upstream ───> [ client/tokyo-ramen ]  ───> Auto-deploy to Railway
         └─── git merge upstream ───> [ client/cafe-central ] ───> Auto-deploy to Railway
```

1. **Central Development:** All bug fixes and feature additions are developed and tested on `main` in the primary DigiNu repository.
2. **Upstream Merging:** To update a client deployment, run:
   ```bash
   git checkout client/bella-italia
   git pull origin main --no-rebase
   git push origin client/bella-italia
   ```
3. **Automated Migration Execution:** The host's deployment command is configured as:
   ```bash
   prisma migrate deploy && next build
   ```
   If the update includes new database columns, Prisma automatically applies the migration without manual SQL execution.
