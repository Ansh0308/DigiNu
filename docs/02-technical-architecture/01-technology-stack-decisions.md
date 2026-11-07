# Technology Stack Decisions & Evaluation — DigiNu

**Document Version:** 2.0 (Independent Deployments Revision)  
**Phase:** 02 — Technical Architecture & Data Model  
**Status:** APPROVED BY FREELANCER  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Architectural Model Decision: Independent Deployments

Following stakeholder review, the platform architecture adopts **Option B: Independent Deployments using One Reusable Codebase**.

```
+-----------------------------------------------------------------------------------------+
|                  INDEPENDENT DEPLOYMENT MODEL (ONE REUSABLE CODEBASE)                   |
+-----------------------------------------------------------------------------------------+
|  [ CORE REUSABLE CODEBASE ] ─── (Template / Git Upstream)                               |
|          │                                                                              |
|          ├───> [ Deployment 1: Bella Italia ]  ──> Dedicated DB 1  ──> bella-italia.com |
|          ├───> [ Deployment 2: Tokyo Ramen ]   ──> Dedicated DB 2  ──> tokyo-ramen.com  |
|          └───> [ Deployment 3: Cafe Central ]  ──> Dedicated DB 3  ──> cafecentral.app  |
+-----------------------------------------------------------------------------------------+
```

### Why Independent Deployments?
1. **Absolute Physical Data Isolation:** Restaurant A and Restaurant B have completely separate databases, runtime containers, and environment configurations. Cross-tenant data leakage is physically impossible.
2. **Simplified Application Logic:** Eliminates all complex multi-tenant routing middleware, `WHERE restaurant_id = ?` query filtering, database Row-Level Security (RLS) policies, and platform super-admin overhead.
3. **Independent Client Lifecycles:** An issue, spike in traffic, or custom domain configuration for one restaurant will never impact other restaurant clients.
4. **Clean Commercial Handoff:** If a restaurant client ever wants full ownership of their digital menu, their repository and database can be handed over directly with zero uncoupling effort.

---

## 2. Technology Stack Decision Matrix

> [!NOTE]
> **APPROVED STACK RECONCILIATION (ADR-002 - APPROVED BY FREELANCER):**  
> An upgrade from Next.js 15 (Maintenance LTS) to **Next.js 16 Active LTS (`next@^16.4.5`)** and from Prisma 6 to **Prisma 7 Stable (`prisma@^7.10.1`)** with `@prisma/adapter-pg` has been formally approved in [ADR-002](file:///e:/Freelance/DigiNu/docs/02-technical-architecture/10-adr-002-nextjs16-prisma7-stack-reconciliation.md). The table below reflects the approved baseline.

| Technology Layer | Evaluated Options | Advantages | Disadvantages | Realistic Cost Profile | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Full-Stack Framework** | **Next.js 16 (App Router)** [APPROVED] vs. Next.js 15 vs. Remix | Unified full-stack TypeScript monolith; Server Components (RSC); Turbopack default; proxy.ts network interception; Active LTS. | Requires understanding React Server vs Client boundaries. | Free / Open Source | **Next.js 16.4+ (App Router, TypeScript 5.9+)** *(Approved via ADR-002)* |
| **Styling & Theming** | **Tailwind CSS v4 + CSS Variables** vs. Styled-Components | Zero runtime CSS overhead; responsive utility classes; dynamic CSS variables enable instant color and theme preset changes via database configuration. | Requires standardizing theme tokens. | Free / Open Source | **Tailwind CSS v4 + Lucide Icons** |
| **Database Engine** | **PostgreSQL** vs. SQLite / Turso vs. MongoDB | Native relational integrity (`ON DELETE RESTRICT/CASCADE`), foreign keys, decimal precision for prices, JSONB for flexible config, supported across all cloud providers. | Slightly heavier than SQLite for tiny sites. | $0–$5/mo per client database | **PostgreSQL (v15+)** |
| **ORM / Data Access** | **Prisma 7 Stable** [APPROVED] vs. Prisma 6 vs. Drizzle ORM | Compile-time type safety; declarative schema; TypeScript client with `@prisma/adapter-pg`; config in `prisma.config.ts`. Strict pin: `prisma@^7.10.1`. | Driver adapter required in v7. | Free / Open Source | **Prisma ORM 7.x (`@prisma/adapter-pg`)** *(Approved via ADR-002)* |
| **Authentication** | **NextAuth.js (Auth.js v5)** vs. Supabase Auth vs. Custom JWT | Lightweight session cookies with `HttpOnly`, `SameSite=Lax`, and `Secure` flags; built-in CSRF protection; integrates via `proxy.ts`. Defense-in-depth on all server actions. (Beta status noted). | Credentials provider requires custom password hashing logic. | Free / Open Source | **NextAuth.js v5 (`5.0.0-beta.32`+) (Credentials Provider)** |
| **Image Storage & CDN** | **ImageKit.io** vs. AWS S3 + sharp vs. Cloudflare R2 | Official approved service. Built-in dynamic URL transformations (`tr:w-400,h-400,f-webp`), direct client upload with HMAC signatures, global CDN. | Hard 20GB bandwidth cutoff on Free Tier. | $0 Free (3GB DAM, 20GB BW); $9/mo Lite | **ImageKit.io (Folder-Segregated or Per-Client)** |
| **AI Culinary Engine** | **Cloudflare Workers AI (`flux-1-schnell`)** vs. OpenAI DALL-E 3 | Free tier (10,000 Neurons/day = ~40 free generations/day); Apache 2.0 commercial model license; photorealistic food textures; < 4s generation. | Daily free cap resets at 00:00 UTC. | $0 Free; $0.011/1k Neurons overage | **Cloudflare Workers AI (`flux-1-schnell`)** |
| **QR Code Engine** | **`qrcode` + `pdfkit`** vs. External QR API | Client-side dynamic preview with logo; server-side vector SVG, 300 DPI PNG, and table-tent PDF rendering. | None; zero external API dependencies. | Free / Open Source | **`qrcode` & `pdfkit`** |
| **Production Hosting** | **Railway / Render / VPS (Coolify)** vs. Vercel Pro | **Commercial license compliant**; low per-container cost ($5/mo per service); allows bundling app + Postgres cleanly. *(Note: Vercel Hobby prohibits commercial use)*. | Requires basic PaaS setup. | $5–$10/mo per restaurant | **Railway / Render (PaaS) or Coolify (VPS)** |

---

## 3. Database & ORM Selection Justification

* **Selected Database:** **PostgreSQL (Dedicated Database per Restaurant)**
* **Selected Data Access Approach:** **Prisma ORM**

### Why PostgreSQL with Prisma?
1. **Relational Hierarchy without Tenant Bloat:** The menu hierarchy is strictly relational: `RestaurantProfile -> Category -> MenuItem -> MediaAsset`. By giving each restaurant its own database, every table is completely free from redundant `restaurant_id` columns, compound tenant indexes, and complex row-level security logic.
2. **Data Integrity:** Foreign keys enforce business rules at the engine level:
   - A dish cannot reference a non-existent category.
   - Deleting a category with active dishes is blocked (`ON DELETE RESTRICT`), preventing accidental menu breakage.
3. **Type Safety & Migrations:** Prisma generates fully typed TypeScript clients matching the schema. When upstream improvements are introduced, `prisma migrate deploy` automatically executes across client databases during deployment.

---

## 4. Image Storage Strategy: ImageKit Evaluation

DigiNu evaluates two approaches for ImageKit media storage across independent deployments:

### Option A: One Central ImageKit Account with Dedicated Client Folders `[RECOMMENDATION]`
* **Structure:** A single master ImageKit account managed by the freelancer. Each restaurant deployment is assigned an isolated folder path: `/restaurants/{restaurant_slug}/`.
* **Security:** Client upload auth tokens are generated on the restaurant's server and strictly bound to their assigned folder.
* **Cost:** Uses the **ImageKit Free Plan** (3 GB DAM storage, 20 GB bandwidth) across the first 5–8 restaurants. When bandwidth approaches 18 GB, the freelancer upgrades to the **Lite Plan ($9/month)**, which is subsidized by client monthly subscriptions.
* **Maintenance:** Freelancer manages 1 ImageKit dashboard, 1 set of keys, and 1 billing profile.

### Option B: Separate ImageKit Accounts per Restaurant
* **Structure:** A new ImageKit account created for each restaurant client.
* **Analysis:** High onboarding friction (registering email/card for each client), 10 separate login dashboards to monitor, and risks violating provider terms if managed under duplicate disposable accounts.

> **Decision:** **Option A (Central ImageKit Account with Folder Segregation)** is recommended. If an enterprise client requests independent asset ownership, the architecture easily supports configuring their own `IMAGEKIT_PUBLIC_KEY` and `IMAGEKIT_PRIVATE_KEY` in their environment variables.

---

## 5. AI Image Generation Strategy: 1 Image per Generation

### Key Decision: 1 Image Generation per Request
To maximize speed, minimize token consumption, and simplify the owner UX, the system generates **exactly 1 high-resolution image per generation request** (instead of 4 variations):
* **Neuron Consumption:** 1 image at 1024x1024 (4–6 steps) consumes **~250 Neurons**.
* **Daily Free Capacity:** Cloudflare's **10,000 free Neurons/day** provides **40 image generations per day** across all deployments sharing the account.
* **Monthly Free Capacity:** **~1,200 food image generations per month** at **$0.00 cost**.
* **Owner Workflow:**
  1. Owner enters dish details and clicks "Generate with AI".
  2. Model returns 1 photorealistic image option in ~3–4 seconds.
  3. Owner reviews the generated image.
  4. Owner clicks **"Approve & Apply to Dish"** (saves to ImageKit) OR clicks **"Regenerate"** if unsatisfied.
* **Shared Provider Account Reality:** If multiple client deployments share the same Cloudflare API token, they draw from the same daily 10,000 Neuron pool. The platform enforces per-deployment monthly quotas (e.g., 30 generations/month) to prevent any single client from exhausting the shared pool.

---

## 6. Commercial Hosting & Cost Implications

> [!IMPORTANT]
> **Vercel Commercial Restriction:** Vercel's Hobby plan explicitly prohibits commercial use. Running client sites on Vercel requires a **Vercel Pro account ($20/month per user)**. 

To keep costs predictable and healthy for a freelance business, we evaluate compliant hosting models:

### Cost Comparison for Independent Deployments

| Scale | Hosting Option 1: PaaS (Railway / Render)<br>*$5/mo app + $5/mo Postgres per client* | Hosting Option 2: Self-Managed VPS (Hetzner / DigitalOcean + Coolify)<br>*$6–$14/mo flat VPS hosting all containers* | Hosting Option 3: Vercel Pro + Serverless DB (Neon)<br>*$20/mo Vercel Pro + $0–$5 DB per client* |
| :--- | :--- | :--- | :--- |
| **1 Restaurant** | **$10 / month** ($5 app + $5 DB) | **$6 / month** (Hetzner CX22 VPS running app + local DB) | **$20 / month** (Vercel Pro flat fee) |
| **5 Restaurants** | **$40 – $50 / month** | **$12 / month** (Hetzner CX32 8GB RAM running 5 apps + 5 DBs) | **$25 – $35 / month** ($20 Pro + Neon overages) |
| **10 Restaurants** | **$80 – $100 / month** | **$20 / month** (Hetzner CPX31 16GB RAM running 10 apps + DBs) | **$45 – $70 / month** |

### Commercial Margin for Freelancer `[RECOMMENDATION]`
Charging each restaurant client a modest **$39 to $49/month** SaaS retainer:
* **For 5 Restaurants:** Client revenue = $195–$245/mo. Infrastructure cost (Railway/VPS) = $12–$50/mo. **Net Profit = $145–$233/month.**
* **For 10 Restaurants:** Client revenue = $390–$490/mo. Infrastructure cost = $20–$100/mo. **Net Profit = $290–$470/month.**

