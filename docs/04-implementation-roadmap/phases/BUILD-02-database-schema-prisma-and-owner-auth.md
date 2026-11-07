# BUILD-02: Database Schema, Prisma ORM & Owner Authentication

**Phase ID:** BUILD-02  
**Phase Name:** Database Schema, Prisma ORM & Owner Authentication  
**Status:** COMPLETE — APPROVED BY FREELANCER  
**Effort Estimate:** Medium (2–3 days)  
**Depends On:** BUILD-01 (Project Foundation & Design System Setup)  
**Next Phase:** BUILD-03 (Restaurant Profile & Menu Management CRUD)  

> [!NOTE]
> **APPROVED STACK RECONCILIATION (ADR-002 - APPROVED BY FREELANCER):**  
> Under [ADR-002](file:///e:/Freelance/DigiNu/docs/02-technical-architecture/10-adr-002-nextjs16-prisma7-stack-reconciliation.md), this phase executes with **Prisma 7 Stable (`prisma@^7.10.1`)** with `@prisma/adapter-pg` driver adapters, connection configuration in `prisma.config.ts`, Auth.js v5 (`next-auth@^5.0.0-beta.32`), and Next.js 16 network interception via **`src/proxy.ts`** with defense-in-depth authorization on all server actions and API routes. Strict npm version pinning prevents accidental installation of Prisma 8 RC.

---

## A. Phase Overview

| Field | Detail |
|:---|:---|
| **Phase ID** | BUILD-02 |
| **Objective** | Configure Prisma ORM with PostgreSQL, define all 8 single-restaurant database models, run the initial migration, implement the seed script, integrate NextAuth.js v5 with Credentials provider and bcrypt password hashing, configure session middleware for protected admin routes, and build the owner login UI. |
| **Business Value** | The data layer is the backbone of the entire application. Every subsequent phase builds upon these models. Getting the schema right eliminates costly migrations mid-build. The authentication system is the primary security boundary between public diners and private restaurant management. |
| **Scope** | Prisma schema + migration; seed script; NextAuth.js v5 Credentials provider; bcrypt hashing; session cookie configuration; `/admin/login` UI (SCR-ADMIN-01); middleware protecting all `/admin/*` routes; rate limiting on login endpoint. |
| **Prerequisites** | BUILD-01 complete (Next.js project initialized); `DATABASE_URL` and `DIRECT_URL` available in `.env`; `AUTH_SECRET` generated and in `.env` |
| **Dependencies** | BUILD-01 |

---

## B. Source Documentation

1. `e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md`
2. `e:\Freelance\DigiNu\docs\02-technical-architecture\03-data-model-and-erd.md` — **Primary reference for all models**
3. `e:\Freelance\DigiNu\docs\02-technical-architecture\04-api-and-integration-contracts.md` — Auth endpoint contracts
4. `e:\Freelance\DigiNu\docs\02-technical-architecture\05-security-and-deployment.md` — Session security rules
5. `e:\Freelance\DigiNu\docs\03-design-system\09-admin-screen-specifications.md` — SCR-ADMIN-01 login screen
6. `e:\Freelance\DigiNu\docs\03-design-system\04-design-tokens.json` — Design tokens for login form
7. `e:\Freelance\DigiNu\docs\04-implementation-roadmap\03-engineering-workflow-and-quality-gates.md`
8. All 5 global SKILL.md files
9. All 5 project-local SKILL.md files

---

## C. Features Included

- Install `prisma`, `@prisma/client`, `next-auth@beta`, `bcryptjs`, `@types/bcryptjs`, `zod`
- Configure `prisma/schema.prisma` with all 8 single-restaurant models
- Run `npx prisma migrate dev --name init` to create initial migration
- Create `prisma/seed.ts` to seed `restaurant_profile` singleton, default `qr_code_config`, and initial `owner_account`
- Configure `src/lib/prisma.ts` as global Prisma Client singleton
- Configure `src/lib/auth.ts` as NextAuth.js v5 Credentials provider
- Implement bcrypt password verification (salt rounds ≥ 12)
- Configure session cookie: HttpOnly, Secure, SameSite=Lax
- Create `src/middleware.ts` to protect all `/admin/*` routes (redirect unauthenticated to `/admin/login`)
- Build Owner Login UI (SCR-ADMIN-01): `src/app/admin/login/page.tsx`
- Implement login form with email, password, "Remember me" checkbox, spinner
- Implement rate limiting on the auth endpoint (5 attempts / 15 min / IP)
- Build logout mechanism (clear session cookie)
- Create `src/types/menu.ts` and `src/types/validation.ts` with base Zod schemas

---

## D. Features Explicitly Excluded

- **NO** restaurant profile forms or UI (BUILD-03)
- **NO** category or food item management (BUILD-03)
- **NO** ImageKit integration (BUILD-04)
- **NO** AI generation (BUILD-05)
- **NO** public customer menu (BUILD-06)
- **NO** admin dashboard overview page content (BUILD-03)
- **NO** password reset functionality (deferred)
- **NO** multi-user/staff roles (V2)

---

## E. Database Changes

### Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model RestaurantProfile {
  id                    String   @id @default(cuid())
  singletonKey          String   @unique @default("RESTAURANT_PROFILE_SINGLETON") @db.VarChar(30)
  name                  String   @db.VarChar(100)
  slug                  String   @db.VarChar(60)
  tagline               String?  @db.VarChar(160)
  aboutStory            String?  @db.Text
  address               String?  @db.VarChar(255)
  phone                 String?  @db.VarChar(30)
  whatsapp              String?  @db.VarChar(30)
  currencyCode          String   @default("USD") @db.VarChar(3)
  currencySymbol        String   @default("$") @db.VarChar(5)
  currencyPosition      String   @default("PREFIX") @db.VarChar(6)
  themePreset           String   @default("warm-cream") @db.VarChar(30)
  primaryColor          String   @default("#C85A32") @db.VarChar(7)
  accentColor           String   @default("#F59E0B") @db.VarChar(7)
  logoAssetId           String?
  bannerAssetId         String?
  aiCreditsBalance      Int      @default(30)
  aiCreditsMonthlyLimit Int      @default(30)
  updatedAt             DateTime @updatedAt

  logoAsset   MediaAsset? @relation("LogoAsset", fields: [logoAssetId], references: [id], onDelete: SetNull)
  bannerAsset MediaAsset? @relation("BannerAsset", fields: [bannerAssetId], references: [id], onDelete: SetNull)

  @@map("restaurant_profile")
}

model OwnerAccount {
  id           String   @id @default(cuid())
  singletonKey String   @unique @default("OWNER_ACCOUNT_SINGLETON") @db.VarChar(30)
  email        String   @unique @db.VarChar(255)
  passwordHash String   @db.VarChar(255)
  fullName     String   @db.VarChar(100)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("owner_account")
}

model MenuCategory {
  id           String     @id @default(cuid())
  name         String     @db.VarChar(60)
  subtitle     String?    @db.VarChar(160)
  displayOrder Int        @default(0)
  isActive     Boolean    @default(true)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  items        MenuItem[]

  @@index([isActive, displayOrder], name: "idx_categories_display")
  @@map("menu_categories")
}

model MenuItem {
  id                  String   @id @default(cuid())
  categoryId          String
  name                String   @db.VarChar(100)
  shortDescription    String?  @db.VarChar(180)
  detailedDescription String?  @db.Text
  price               Decimal  @db.Decimal(8, 2)
  isVegetarian        Boolean  @default(false)
  dietaryFlags        String[] @default([])
  allergenFlags       String[] @default([])
  isAvailable         Boolean  @default(true)
  isVisible           Boolean  @default(true)
  isFeatured          Boolean  @default(false)
  displayOrder        Int      @default(0)
  imageAssetId        String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  category     MenuCategory      @relation(fields: [categoryId], references: [id], onDelete: Restrict)
  imageAsset   MediaAsset?       @relation("FoodImage", fields: [imageAssetId], references: [id], onDelete: SetNull)
  aiLogs       AIGenerationLog[]

  @@index([categoryId, isVisible, displayOrder], name: "idx_menu_items_display")
  @@map("menu_items")
}

model MediaAsset {
  id               String   @id @default(cuid())
  fileId           String   @unique @db.VarChar(100)
  filePath         String   @db.VarChar(255)
  url              String   @db.VarChar(500)
  assetType        String   @db.VarChar(30)
  width            Int
  height           Int
  sizeBytes        Int
  originalFilename String   @db.VarChar(255)
  createdAt        DateTime @default(now())

  menuItems      MenuItem[]          @relation("FoodImage")
  logoProfiles   RestaurantProfile[] @relation("LogoAsset")
  bannerProfiles RestaurantProfile[] @relation("BannerAsset")
  aiLogs         AIGenerationLog[]   @relation("SelectedAsset")

  @@index([assetType], name: "idx_media_assets_type")
  @@map("media_assets")
}

model OperatingHours {
  id        String  @id @default(cuid())
  dayOfWeek Int     @unique
  openTime  String  @default("11:00") @db.VarChar(5)
  closeTime String  @default("22:00") @db.VarChar(5)
  isClosed  Boolean @default(false)

  @@map("operating_hours")
}

model QRCodeConfig {
  id              String   @id @default(cuid())
  singletonKey    String   @unique @default("QR_CODE_CONFIG_SINGLETON") @db.VarChar(30)
  foregroundColor String   @default("#000000") @db.VarChar(7)
  embedLogo       Boolean  @default(true)
  dotStyle        String   @default("rounded") @db.VarChar(20)
  downloadCount   Int      @default(0)
  updatedAt       DateTime @updatedAt

  @@map("qr_code_config")
}

model AIGenerationLog {
  id                String   @id @default(cuid())
  menuItemId        String
  promptSynthesized String   @db.Text
  providerModel     String   @db.VarChar(60)
  neuronsConsumed   Int      @default(250)
  selectedAssetId   String?
  createdAt         DateTime @default(now())

  menuItem      MenuItem    @relation(fields: [menuItemId], references: [id], onDelete: Cascade)
  selectedAsset MediaAsset? @relation("SelectedAsset", fields: [selectedAssetId], references: [id], onDelete: SetNull)

  @@index([createdAt], name: "idx_ai_logs_created")
  @@map("ai_generation_logs")
}
```

> [!NOTE]
> **Singleton Database Constraints & Invariants:**
> - `RestaurantProfile`, `OwnerAccount`, and `QRCodeConfig` each define a `singletonKey String @unique @default("...")` column. Because PostgreSQL enforces uniqueness across non-null values, attempting to insert a second record causes a unique constraint violation (`P2002`), guaranteeing single-tenant isolation and single-owner MVP invariants directly at the database engine level.
> - For `OperatingHours`, `dayOfWeek Int @unique` (0–6, Sunday–Saturday) guarantees that no duplicate weekday entries can exist, while database seeding and application validation guarantee that all 7 weekdays are populated.
```

### Database Indexes (add as `@@index` in schema or via raw SQL migration)
```sql
-- Active categories display order
CREATE INDEX idx_categories_display ON menu_categories(is_active, display_order);
-- Visible food items display
CREATE INDEX idx_menu_items_display ON menu_items(category_id, is_visible, display_order);
-- Dietary GIN indexes
CREATE INDEX idx_menu_items_dietary ON menu_items USING GIN (dietary_flags);
CREATE INDEX idx_menu_items_allergens ON menu_items USING GIN (allergen_flags);
-- Media type lookup
CREATE INDEX idx_media_assets_type ON media_assets(asset_type);
-- AI generation history
CREATE INDEX idx_ai_logs_created ON ai_generation_logs(created_at);
```

---

## F. API and Backend Requirements

### Authentication — NextAuth.js v5

**File:** `src/lib/auth.ts`
```typescript
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = LoginSchema.safeParse(credentials)
        if (!parsed.success) return null
        const owner = await prisma.ownerAccount.findUnique({
          where: { email: parsed.data.email },
        })
        if (!owner || !owner.isActive) return null
        const valid = await bcrypt.compare(parsed.data.password, owner.passwordHash)
        if (!valid) return null
        return { id: owner.id, email: owner.email, name: owner.fullName }
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: { signIn: '/admin/login' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string
      return session
    },
  },
})
```

### Middleware (`src/middleware.ts`)
```typescript
import { auth } from '@/lib/auth'

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')
  const isLoginPage = req.nextUrl.pathname === '/admin/login'
  if (isAdminRoute && !isLoginPage && !req.auth) {
    return Response.redirect(new URL('/admin/login', req.url))
  }
})

export const config = {
  matcher: ['/admin/:path*'],
}
```

### Rate Limiting
Implement IP-based rate limiting on the login endpoint using an in-memory store (acceptable for single-tenant deployment) or `@upstash/ratelimit` if Redis is available. Limit: 5 attempts per 15 minutes per IP.

### Seed Script (`prisma/seed.ts`)
Seeds:
1. `RestaurantProfile` singleton with values from ENV vars (`RESTAURANT_NAME`, `RESTAURANT_SLUG`)
2. `OwnerAccount` with hashed `INITIAL_OWNER_PASSWORD` (bcrypt, 12 rounds)
3. `QRCodeConfig` singleton (default settings)
4. `OperatingHours` — 7 records (Mon–Sun) with default 11:00–22:00 open

---

## G. UI/UX Requirements

### SCR-ADMIN-01: Owner Login Screen

**Route:** `/admin/login`  
**Design Reference:** `docs/03-design-system/09-admin-screen-specifications.md` → SCR-ADMIN-01

```
Layout: Centered auth card on --canvas-bg background
Card: max-w-sm, border border-[--surface-border], rounded-xl, shadow-modal, p-8

Elements (top to bottom):
1. DigiNu wordmark / icon (centered, 48px)
2. Restaurant name from ENV (subtitle, --text-muted)
3. H1: "Welcome back" (--text-primary, font-editorial, text-2xl)
4. Email field: label "Email Address", input type="email", autocomplete="username"
5. Password field: label "Password", input type="password", autocomplete="current-password"
   - Password reveal/hide toggle button (44×44px target)
6. "Remember me for 14 days" checkbox
7. "Sign In" primary button (full-width, bg-[--brand-primary], text-[--brand-primary-fg])
   - Loading state: spinner icon + "Signing in..." text, disabled
8. "Forgot password?" link (--text-muted, text-sm)

Error States:
- Invalid credentials: Inline alert above button, role="alert"
  "Invalid email or password"
- Rate limited: "Too many attempts. Please wait 15 minutes."
- Generic server error: "Something went wrong. Please try again."

Focus Styles: ring-2 ring-[--brand-primary] ring-offset-2 on all interactive elements
```

**Accessibility Requirements:**
- All form fields have explicit `<label for="...">` associations
- Error messages use `role="alert"` and `aria-live="assertive"`
- Password toggle button has `aria-label="Show password"` / `aria-label="Hide password"`
- "Sign In" button has `aria-busy="true"` during loading state

**Motion:**
- Card entrance: fade-in + translateY(16px → 0), 300ms, ease-out-cubic
- Error message: appear with opacity 0→1, 200ms

---

## H. Step-by-Step Execution Plan

1. **Install Dependencies**
   ```bash
   npm install prisma @prisma/client next-auth@beta bcryptjs zod
   npm install -D @types/bcryptjs
   ```

2. **Initialize Prisma**
   ```bash
   npx prisma init --datasource-provider postgresql
   ```

3. **Write Prisma Schema**
   Replace generated `prisma/schema.prisma` with the complete schema from Section E.

4. **Run Initial Migration**
   ```bash
   npx prisma migrate dev --name init
   ```
   Verify migration SQL is generated correctly.

5. **Add Database Indexes**
   Create a second migration or add `@@index` directives in schema for all required indexes.

6. **Create Prisma Client Singleton (`src/lib/prisma.ts`)**
   Standard Next.js global Prisma singleton pattern to prevent connection exhaustion in development.

7. **Configure NextAuth.js v5 (`src/lib/auth.ts`)**
   Full configuration as specified in Section F.

8. **Create API Auth Route (`src/app/api/auth/[...nextauth]/route.ts`)**
   ```typescript
   import { handlers } from '@/lib/auth'
   export const { GET, POST } = handlers
   ```

9. **Create Middleware (`src/middleware.ts`)**
   Session-checking middleware as specified in Section F.

10. **Create Base Zod Schemas (`src/types/validation.ts`)**
    ```typescript
    import { z } from 'zod'
    export const LoginSchema = z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(8, 'Password must be at least 8 characters'),
    })
    // Add more schemas in subsequent phases
    ```

11. **Write Seed Script (`prisma/seed.ts`)**
    Seed all 4 entities as specified in Section F. Ensure script is idempotent (safe to run multiple times).

12. **Configure Seed in package.json**
    ```json
    "prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }
    ```

13. **Build Login UI (`src/app/admin/login/page.tsx`)**
    Server Component with client-side form component. Apply design token classes as specified in Section G.

14. **Implement Login Form Client Component (`src/components/admin/LoginForm.tsx`)**
    Use `signIn` from next-auth/react. Handle loading, error, and rate-limit states.

15. **Run Seed**
    ```bash
    npx prisma db seed
    ```

16. **Test Authentication**
    - Start dev server: `npm run dev`
    - Navigate to `/admin` → verify redirect to `/admin/login`
    - Log in with seeded credentials → verify redirect to `/admin`
    - Log out → verify redirect back to `/admin/login`
    - Attempt invalid credentials → verify error message (no user existence leak)

17. **Run Build Verification**
    ```bash
    npx tsc --noEmit && npm run lint && npm run build
    ```

---

## I. Global Skill Usage

### 1. `ui-ux-pro-max`
```bash
python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "authentication login form" --domain ux
python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "form validation error states" --domain ux
```
Apply UX guidelines for form design, error state placement, and password input patterns.

### 2. `frontend-design`
Apply for the login card visual design — ensure the centered card with editorial typography matches the Modern Editorial Dining aesthetic. Brand color (`--brand-primary`) applied to primary CTA button.

### 3. `code-review`
Review all security-critical code:
- bcrypt salt rounds ≥ 12
- NextAuth.js v5 session JWT configuration
- Middleware correctly redirects unauthenticated requests
- Rate limiting implementation prevents brute force
- No password hash ever included in session token or response

### 4. `documentation-spec-writing`
Verify Prisma schema comments accurately describe each field's purpose. Ensure seed.ts has clear inline comments explaining each seeded record.

### 5. `accessibility-review`
Full audit of the login form (SCR-ADMIN-01):
- All form fields have explicit label associations
- Error messages use `role="alert"`
- Password toggle button has descriptive aria-label
- Color contrast of error red (#DC2626) on card background ≥ 4.5:1
- Touch targets ≥ 44×44px for all interactive elements
- Tab order is logical (email → password → remember me → sign in)

---

## J. Testing Requirements

### Unit Tests (`src/lib/auth.test.ts`)
1. `describe('password hashing')`: bcrypt hash of test password verifies correctly
2. `describe('authorize')`: Valid credentials return user object; Invalid password returns null; Non-existent email returns null; Inactive account returns null

### Integration Tests (`src/app/api/auth/[...nextauth]/route.test.ts`)
1. POST with valid credentials → 200 response with Set-Cookie header
2. POST with invalid credentials → 401, no Set-Cookie header
3. POST with malformed email → 422 validation error
4. POST 5+ times in 15 minutes → 429 rate limit response

### Middleware Tests
1. GET /admin without session cookie → 302 redirect to /admin/login
2. GET /admin with valid session → 200 (passes through)
3. GET /admin/login without session → 200 (accessible)

---

## K. Security and Quality Checks

| Check | Requirement |
|:---|:---|
| bcrypt salt rounds | Minimum 12 (`bcrypt.genSalt(12)`) |
| Session cookie flags | `HttpOnly`, `Secure`, `SameSite=Lax` |
| Session max age | 30 days absolute; idle tokens can be shorter |
| Password never logged | `grep -r "password" src/` → No logging of plaintext password |
| Auth secret in ENV | `AUTH_SECRET` only in `.env`, never in source code |
| Rate limiting | IP-based, 5 attempts per 15 minutes, returns 429 |
| Generic error messages | "Invalid email or password" — never reveals if email exists |
| Seed password change | `INITIAL_OWNER_PASSWORD` is a temporary credential; document that it must be changed after first login |

---

## L. Documentation Updates

- [ ] Update `docs/02-technical-architecture/03-data-model-and-erd.md`: Note if any schema deviations were made
- [ ] Update `docs/04-implementation-roadmap/00-master-implementation-roadmap.md`: Mark BUILD-02 complete
- [ ] Add a note to `docs/02-technical-architecture/06-environments-repository-and-git-plan.md`: Confirm seed command works

---

## M. Acceptance Criteria

**Given** a fresh PostgreSQL database with DATABASE_URL configured,  
**When** `npx prisma migrate dev --name init` is run,  
**Then** all 8 tables are created with correct columns, types, and foreign key constraints.

**Given** `npx prisma db seed` is run,  
**When** the seed completes,  
**Then** `restaurant_profile`, `qr_code_config`, `owner_account`, and 7 `operating_hours` records exist in the database.

**Given** an owner visits `/admin` without a session,  
**When** the page loads,  
**Then** the browser is redirected to `/admin/login` with a 302 response.

**Given** the owner submits the login form with valid email and password,  
**When** the form is submitted,  
**Then** an HttpOnly session cookie is set and the browser is redirected to `/admin`.

**Given** the owner submits invalid credentials 5 consecutive times,  
**When** the 6th attempt is made within 15 minutes,  
**Then** the response is 429 Too Many Requests with message "Too many failed attempts. Please wait 15 minutes."

---

## N. Definition of Done

- [ ] `npx prisma migrate dev` runs clean (zero SQL errors)
- [ ] All 8 database models exist in the database with correct schemas
- [ ] All 6 database indexes created (see Section E)
- [ ] `npx prisma db seed` creates profile, QR config, owner account, and 7 operating hours records
- [ ] Owner login with valid credentials sets an HttpOnly session cookie
- [ ] Owner login with invalid credentials shows "Invalid email or password" (no user existence leak)
- [ ] 5+ failed login attempts within 15 minutes returns 429
- [ ] `/admin` redirects to `/admin/login` when unauthenticated
- [ ] All form fields in login screen have accessible labels
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run lint` — zero ESLint violations
- [ ] `npm run build` — successful production build

---

## O. Review and Approval Gate

Before proceeding to BUILD-03, the developer must:

1. Inspect the database with `npx prisma studio` — verify all 8 tables and seed records
2. Test the full login/logout flow manually in the browser
3. Verify HttpOnly cookie is set (inspect Application → Cookies in DevTools)
4. Confirm rate limiting works by attempting 6+ logins rapidly
5. Run `npx tsc --noEmit && npm run lint && npm run build` and confirm all pass
6. **Explicitly authorize** proceeding to BUILD-03

---

## P. Complete AI IDE Execution Prompt

```markdown
# DigiNu — BUILD-02: Database Schema, Prisma ORM & Owner Authentication

## Your Role
You are a Senior Backend Engineer and Security Architect implementing the complete data layer and authentication system for DigiNu — a Single-Tenant Restaurant Menu Platform.

## MANDATORY STEP 1: READ ALL CONTEXT

**Master Context:**
- e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md

**Global Skills (read all 5 SKILL.md files):**
- C:\Users\USER\.gemini\config\skills\ui-ux-pro-max\SKILL.md
- C:\Users\USER\.gemini\config\skills\frontend-design\SKILL.md
- C:\Users\USER\.gemini\config\skills\code-review\SKILL.md
- C:\Users\USER\.gemini\config\skills\documentation-spec-writing\SKILL.md
- C:\Users\USER\.gemini\config\skills\accessibility-review\SKILL.md

**Project-Local Skills:**
- e:\Freelance\DigiNu\.agents\skills\diginu-business-rules\SKILL.md
- e:\Freelance\DigiNu\.agents\skills\diginu-architecture-conventions\SKILL.md
- e:\Freelance\DigiNu\.agents\skills\diginu-design-rules\SKILL.md
- e:\Freelance\DigiNu\.agents\skills\diginu-test-and-review\SKILL.md
- e:\Freelance\DigiNu\.agents\skills\diginu-deployment-release\SKILL.md

**Phase Source Documents:**
- e:\Freelance\DigiNu\docs\02-technical-architecture\03-data-model-and-erd.md (PRIMARY — read every model carefully)
- e:\Freelance\DigiNu\docs\02-technical-architecture\04-api-and-integration-contracts.md
- e:\Freelance\DigiNu\docs\02-technical-architecture\05-security-and-deployment.md
- e:\Freelance\DigiNu\docs\03-design-system\09-admin-screen-specifications.md (SCR-ADMIN-01)
- e:\Freelance\DigiNu\docs\04-implementation-roadmap\phases\BUILD-02-database-schema-prisma-and-owner-auth.md

## ARCHITECTURE RULES (CRITICAL)

1. **Single-Tenant Architecture:** This is NOT a multi-tenant database. There is NO `restaurant_id` column on `menu_categories`, `menu_items`, `media_assets`, `operating_hours`, `qr_code_config`, or `ai_generation_logs`. Each deployment has its own dedicated database.

2. **Independent Deployments:** The database schema is designed for exactly ONE restaurant. The `restaurant_profile` table is a singleton (maximum 1 row). The `qr_code_config` table is a singleton (maximum 1 row).

3. **TypeScript Strict Mode:** Every function, variable, and return type must be explicitly typed. No `any` types permitted.

4. **bcrypt Salt Rounds:** Use minimum 12 salt rounds for password hashing. This is a security requirement.

5. **Session Security:** NextAuth.js v5 session cookies must have HttpOnly, Secure, and SameSite=Lax flags. JWT strategy (not database sessions).

6. **Generic Auth Errors:** Login failures ALWAYS return "Invalid email or password" — never "Email not found" or "Incorrect password" (prevents user enumeration).

7. **Rate Limiting:** Implement 5 attempts per 15 minutes per IP on the login endpoint. Use in-memory store (Map with TTL cleanup) for single-deployment.

## PACKAGES TO INSTALL

```bash
npm install prisma @prisma/client next-auth@beta bcryptjs zod
npm install -D @types/bcryptjs prisma
```

## PRISMA SCHEMA

The complete schema is defined in Section E of the BUILD-02 phase document. Key rules:
- Use `cuid()` for all IDs (not UUID - Prisma's cuid is compatible)
- Use `Decimal` type for prices (`@db.Decimal(8, 2)`)
- Use `String[]` for `dietaryFlags` and `allergenFlags` arrays
- `MenuCategory → MenuItem`: onDelete Restrict (cannot delete category with items)
- `MenuItem → MediaAsset`: onDelete SetNull (deleting image doesn't delete dish)
- `MenuItem → AIGenerationLog`: onDelete Cascade (deleting dish removes its AI logs)

After writing schema, run:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

## NEXTAUTH.JS V5 CONFIGURATION

Configure `src/lib/auth.ts` with:
- Credentials provider using email + password
- bcrypt.compare for password verification
- Prisma query to find owner by email
- Check `isActive === true` before granting access
- JWT session strategy (not database sessions)
- Session max age: 30 days
- Custom sign-in page: `/admin/login`

The `handlers` export is consumed by `src/app/api/auth/[...nextauth]/route.ts`.
The `auth` export is used by middleware and server components.

## MIDDLEWARE

`src/middleware.ts` must:
1. Use `auth` from NextAuth.js v5
2. Protect ALL paths starting with `/admin`
3. EXCEPT `/admin/login` (must be accessible unauthenticated)
4. Redirect unauthenticated requests to `/admin/login`

## SEED SCRIPT

`prisma/seed.ts` must:
1. Use `upsert` or `findFirst`/`create` pattern to be idempotent
2. Read `RESTAURANT_NAME`, `RESTAURANT_SLUG`, `INITIAL_OWNER_EMAIL`, `INITIAL_OWNER_PASSWORD` from `process.env`
3. Create `RestaurantProfile` singleton with ENV values
4. Hash owner password with `bcrypt.hash(password, 12)` before storing
5. Create `OwnerAccount` with hashed password
6. Create `QRCodeConfig` singleton (default settings)
7. Create 7 `OperatingHours` records (days 0–6, default 11:00–22:00, all open)

## LOGIN UI (SCR-ADMIN-01)

Build `src/app/admin/login/page.tsx` as a Server Component wrapper around a Client Component form.

Design requirements from `docs/03-design-system/09-admin-screen-specifications.md` → SCR-ADMIN-01:
- Centered auth card with border, rounded-xl, shadow-modal
- Apply `--surface-card` as card background, `--canvas-bg` as page background
- Apply design tokens: `--brand-primary` for primary button background
- Use `font-editorial` for the heading
- Email field: `type="email"`, `autocomplete="username"`, explicit `<label>`
- Password field: `type="password"`, `autocomplete="current-password"`, reveal/hide toggle (44px target)
- "Sign In" button: full-width, loading spinner during submission, `aria-busy` when loading
- Error messages: `role="alert"`, `aria-live="assertive"`, appear with 200ms fade-in
- Touch targets: all interactive elements ≥ 44×44px

## APPLY ALL SKILLS

After implementing:

1. **code-review**: Review auth.ts (bcrypt rounds, session config, error handling), middleware.ts (auth guard completeness), rate limiting logic. Confirm no password hash in JWT token.

2. **accessibility-review**: Audit login form — label associations, aria-label on password toggle, role="alert" on errors, tab order, contrast ratios, touch target sizes (≥44px).

3. **ui-ux-pro-max**: Run `python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "authentication login form UX" --domain ux` and apply any form design guidelines.

4. **documentation-spec-writing**: Verify Prisma schema model comments accurately describe each field. Seed.ts comments explain each seeded record.

5. **frontend-design**: Verify login card aesthetic matches Modern Editorial Dining direction.

## VERIFICATION

Run these in order and confirm all pass:
```bash
npx prisma migrate dev --name init   # Must complete with no SQL errors
npx prisma generate                   # Must generate typed Prisma client
npx prisma db seed                    # Must create all seed records
npx tsc --noEmit                      # Must show 0 errors
npm run lint                          # Must show 0 warnings/errors
npm run build                         # Must build successfully
```

Manual testing:
1. Visit /admin → confirm redirect to /admin/login
2. Login with INITIAL_OWNER_EMAIL + INITIAL_OWNER_PASSWORD → confirm redirect to /admin
3. Inspect cookies → confirm HttpOnly session cookie is set
4. Click logout → confirm session cookie is cleared
5. Attempt 6 logins with wrong password → confirm 429 rate limit message on 6th attempt
6. Open Prisma Studio (`npx prisma studio`) → verify all 8 tables exist

## STOP CONDITION

After all verification passes and manual testing is complete, STOP. Present complete results to the developer and await explicit authorization before beginning BUILD-03.

Do NOT create any menu management UI in this phase.
Do NOT create any API routes other than `/api/auth/[...nextauth]/route.ts`.
Do NOT install ImageKit or Cloudflare packages.
```

