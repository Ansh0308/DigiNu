# System Architecture Document — DigiNu

**Document Version:** 2.0 (Independent Deployments Revision)  
**Phase:** 02 — Technical Architecture & Data Model  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  
**Architect:** Senior Solution Architect & Systems Engineering Team  

---

## 1. Architectural Style & Core Tenets

DigiNu is architected as an **Independent Deployable Full-Stack Monolith** built on **Next.js 15 (App Router, TypeScript)** backed by a **dedicated PostgreSQL database**, **Prisma ORM**, **ImageKit** media management, and **Cloudflare Workers AI** image generation.

### Core Architectural Tenets
1. **One Codebase, Independent Deployments:** A single reusable codebase is maintained. Each restaurant client receives its own independent application deployment, dedicated database, environment configuration, and custom domain.
2. **Absolute Physical Data Isolation:** Cross-tenant data leakage is completely eliminated at the infrastructure level. Every database contains only data belonging to that specific restaurant.
3. **Streamlined Application Logic:** No multi-tenant routing middleware, no `restaurant_id` foreign key clutter in tables, and no row-level security policies.
4. **Focused AI Culinary Workflow:** AI generates **1 high-resolution image per generation** (~250 Neurons), delivering ~3-second response times, reduced token consumption, and simple preview-and-approve UX.
5. **Third-Party Offloading:** Heavy media manipulation, responsive delivery, and format conversions are delegated to **ImageKit CDN**, while culinary photography generation is handled by **Cloudflare Workers AI**.

---

## 2. High-Level System Architecture Diagram (Independent Client Deployment)

```mermaid
flowchart TD
    subgraph Clients["Client Access Tier"]
        DinerPhone["Diner Smartphone<br>(iOS/Android Camera -> Browser)"]
        OwnerLaptop["Restaurant Owner<br>(Desktop / Tablet / Smartphone)"]
    end

    subgraph EdgeCDN["Edge & CDN Acceleration Layer"]
        PublicEdge["Reverse Proxy / Edge CDN<br>(e.g. Cloudflare DNS / Railway Edge)"]
        ImageKitCDN["ImageKit Global CDN<br>(WebP Delivery & Dynamic Transforms)"]
    end

    subgraph DedicatedDeployment["Independent Deployment Instance (e.g. bella-italia.com)"]
        subgraph PublicRoutes["Public Dining Domain (/ or /menu)"]
            PublicSSR["Server Components (RSC)<br>- Fast Static / SSR Rendering<br>- Zero-Bundle Public View"]
            PublicAPI["Public API (/api/public/menu)<br>- In-Memory / Edge Caching"]
        end

        subgraph AdminRoutes["Owner Admin Domain (/admin)"]
            AdminAuth["NextAuth.js Session Guard<br>- HttpOnly Cookie Verification<br>- Local Owner Credentials"]
            AdminUI["React Client Components<br>- Category & Dish Management<br>- 1-Tap 86 Availability Toggle<br>- ImageKit Direct Uploader<br>- 1-Image AI Preview & Approval"]
            AdminAPI["Admin Route Handlers (/api/admin/*)<br>- Input Validation (Zod)<br>- Local Database Mutations"]
        end

        subgraph ServiceAdapters["Internal Core Services"]
            ImageKitService["ImageKit Service Adapter<br>- Signed Upload Tokens<br>- Folder: /restaurants/bella-italia/"]
            AIService["AI Image Generator Adapter<br>- Prompt Synthesis Engine<br>- Cloudflare FLUX.1 Inference (1 Image)"]
            QRService["QR Generation Engine<br>- Vector SVG / 300 DPI PNG / Table-Tent PDF"]
        end

        DedicatedDB[("Dedicated PostgreSQL Database<br>(Isolated Restaurant Schema)")]
    end

    subgraph ExternalCloud["Shared External Cloud Services"]
        ImageKitDAM["ImageKit Media Library<br>(Folder-Segregated DAM)"]
        CloudflareAI["Cloudflare Workers AI<br>(FLUX.1-schnell Neural Engine)"]
    end

    %% Diner Traffic
    DinerPhone -->|"1. Scans Table QR (bella-italia.com)"| PublicEdge
    PublicEdge --> PublicSSR
    PublicSSR -->|"Prisma Query (Dedicated DB)"| DedicatedDB
    DinerPhone -->|"2. Fetches Optimized Dish Photos"| ImageKitCDN

    %% Owner Traffic
    OwnerLaptop -->|"3. Manages Menu (/admin)"| AdminAuth
    AdminAuth --> AdminUI
    AdminUI --> AdminAPI
    AdminAPI -->|"Prisma Mutations"| DedicatedDB

    %% External Integrations
    AdminAPI --> ImageKitService --> ImageKitDAM
    AdminAPI --> AIService --> CloudflareAI
    CloudflareAI -->|"Base64 Buffer (1 Image)"| AIService
    AIService -->|"Upload Approved Image"| ImageKitService
    ImageKitDAM --> ImageKitCDN
```

---

## 3. Component Architecture

```mermaid
flowchart LR
    subgraph UIComponents["Presentation Layer (React 19 / Tailwind CSS)"]
        direction TB
        PublicMenuViews["Public Menu Components<br>- Sticky Category Spy Bar<br>- Food Item Cards with Badges<br>- Dish Detail Drawer (Allergens)<br>- Debounced Search Bar"]
        AdminDashboardViews["Admin Dashboard Components<br>- Metric Health Overview<br>- Category Drag/Reorder List<br>- Dish Edit & 1-Tap 86 Switch<br>- AI 1-Image Studio Modal<br>- QR Studio with Vector Downloads"]
    end

    subgraph BusinessLogic["Business Logic Layer (Server Actions & Route Handlers)"]
        direction TB
        AuthModule["Local Owner Authentication Guard"]
        MenuService["Menu Category & Item Service"]
        MediaManager["ImageKit Upload & CDN Pipeline"]
        AIPromptEngine["Culinary Prompt Synthesizer"]
        QuotaGuard["Local AI Quota Counter"]
    end

    subgraph DataAccess["Data Access Layer (Prisma ORM)"]
        direction TB
        PrismaClient["Prisma Client Instance"]
    end

    UIComponents --> BusinessLogic
    BusinessLogic --> DataAccess
    DataAccess --> DedicatedDB[(Dedicated PostgreSQL)]
```

---

## 4. End-to-End Workflow Diagrams

### 4.1 ImageKit Direct Upload & 1-Image AI Generation Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Owner as Restaurant Owner
    participant Browser as Admin Browser (Client)
    participant Server as DigiNu Deployment Server
    participant CF_AI as Cloudflare Workers AI
    participant IK as ImageKit Engine
    participant DB as Dedicated PostgreSQL

    Note over Owner, DB: Flow A: Direct Photo Upload from Device
    Owner->>Browser: Selects local food image (e.g., photo.jpg)
    Browser->>Server: GET /api/admin/media/imagekit-auth
    Server->>Server: Verify Owner Session
    Server->>Server: Generate HMAC-SHA1 signature, token, expire (folder: /restaurants/{slug}/dishes/)
    Server-->>Browser: Return { token, expire, signature, publicKey }
    Browser->>IK: Direct Upload to ImageKit Upload API
    IK-->>Browser: Upload Success: { fileId, filePath, url, width, height }
    Browser->>Server: POST /api/admin/media/confirm ({ fileId, url, width, height })
    Server->>DB: INSERT INTO media_assets (file_id, url, asset_type, ...)
    Server-->>Browser: 201 Created { assetId }

    Note over Owner, DB: Flow B: AI Culinary Generation (1 Image per Run)
    Owner->>Browser: Clicks "Generate with AI" on Dish Form
    Browser->>Server: POST /api/admin/ai/generate ({ menuItemId })
    Server->>DB: Verify Dish Details & Check Monthly Credit Balance (> 0)
    Server->>Server: Synthesize Culinary Prompt (Lighting, Plating, Macro, Negatives)
    Server->>CF_AI: POST @cf/black-forest-labs/flux-1-schnell (1 Image Generation)
    CF_AI-->>Server: Return 1 High-Resolution Image Buffer (~250 Neurons consumed)
    Server-->>Browser: Return Generated Image Preview (Base64)
    Owner->>Browser: Reviews generated photo
    alt Owner Approves
        Owner->>Browser: Clicks "Approve & Apply to Dish"
        Browser->>Server: POST /api/admin/ai/approve ({ menuItemId, imageBuffer })
        Server->>IK: Upload approved image to /restaurants/{slug}/ai-generated/
        IK-->>Server: Returns { fileId, url }
        Server->>DB: INSERT INTO media_assets (...)
        Server->>DB: UPDATE menu_items SET image_asset_id = :assetId WHERE id = :menuItemId
        Server->>DB: UPDATE restaurant_profile SET ai_credits_balance = ai_credits_balance - 1
        Server-->>Browser: Dish Image Published
    else Owner Wants New Option
        Owner->>Browser: Clicks "Regenerate"
        Browser->>Server: POST /api/admin/ai/generate ({ menuItemId })
    end
```

---

### 4.2 Public Menu Data-Fetching & Rendering Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Diner as Customer Smartphone
    participant Edge as Reverse Proxy / CDN
    participant App as Next.js Server Component
    participant DB as Dedicated PostgreSQL
    participant IK_CDN as ImageKit CDN

    Diner->>Edge: GET https://bella-italia.com/ (or /menu)
    alt Cache Hit (Valid < 60s)
        Edge-->>Diner: Deliver Pre-Rendered HTML (< 1.0s FCP)
    else Cache Miss / Revalidation
        Edge->>App: Forward Request
        App->>DB: SELECT * FROM restaurant_profile LIMIT 1
        App->>DB: SELECT * FROM menu_categories WHERE is_active = true ORDER BY display_order
        App->>DB: SELECT * FROM menu_items WHERE is_visible = true ORDER BY display_order
        DB-->>App: Return Local Records
        App->>App: Render HTML with Responsive ImageKit srcSets
        App-->>Edge: Deliver HTML with Cache Headers (s-maxage=60, stale-while-revalidate=300)
        Edge-->>Diner: Deliver Fast Responsive Page
    end
    Diner->>IK_CDN: Fetch WebP Thumbnails (tr:w-400,h-400,f-webp)
    IK_CDN-->>Diner: Instant Cached WebP Delivery (< 45KB per image)
```

---

## 5. Technology Stack Summary (Per-Deployment)

| Component | Selected Technology | Deployment Role |
| :--- | :--- | :--- |
| **Application Framework** | **Next.js 15 (App Router, React 19, TypeScript)** | Unified frontend & backend monolith running in a dedicated container or serverless runtime per restaurant. |
| **Styling & Theming** | **Tailwind CSS + CSS Variables** | Compiled utility styling; restaurant-specific branding colors and theme presets applied via single-row database configuration. |
| **Database Engine** | **PostgreSQL (v15+)** | Dedicated isolated database per restaurant. Zero multi-tenant table pollution. |
| **ORM / Data Access** | **Prisma ORM** | Type-safe queries and automated migrations (`prisma migrate deploy`). |
| **Authentication** | **NextAuth.js v5 (Credentials)** | Secure local owner login with `HttpOnly` session cookies. |
| **Media Service** | **ImageKit.io** | Folder-segregated media storage (`/restaurants/{slug}/...`) with dynamic URL WebP transformations. |
| **AI Neural Engine** | **Cloudflare Workers AI (`flux-1-schnell`)** | High-speed generation of **1 image per run** (~250 Neurons). |
| **QR Code Engine** | **`qrcode` & `pdfkit`** | High-precision vector SVG, 300 DPI PNG, and table-tent PDF cards generated on-demand. |
| **Commercial Hosting** | **Railway / Render (PaaS) or Hetzner VPS (Coolify)** | Commercially compliant application and database hosting. |
