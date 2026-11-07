# MVP Prioritization & Quality Requirements (NFRs) — DigiNu

**Document Version:** 1.0  
**Phase:** 01 — Product Definition  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Management System  

---

## 1. Feature Classification Matrix

To ensure disciplined execution for a solo freelance developer, all capabilities are strictly triaged into three clear buckets:

```
+-----------------------------------------------------------------------------------+
|                            FEATURE CLASSIFICATION MATRIX                          |
+-----------------------------------------------------------------------------------+
| BUCKET 1: MVP (First Commercial Release — Sellable to Restaurants)                |
| BUCKET 2: POST-MVP / V2 (Commercial Enhancements & Refinements)                   |
| BUCKET 3: EXPLICITLY OUT OF SCOPE (Strict Prohibitions)                           |
+-----------------------------------------------------------------------------------+
```

### Bucket 1: MVP (Commercial Release 1.0)
* **Public Mobile Menu:** Instant load via `/r/:slug`, sticky category scroll-spy bar, food cards with photography, price, description, Veg/Non-Veg indicators, dietary tags, allergen checklist, real-time "Sold Out" styling, expanded dish modal, and debounced text search.
* **Owner Authentication:** Email/password login with secure session cookies, rate-limiting, and password reset.
* **Restaurant Profile & Theming:** Custom logo, cover banner, primary brand color picker, background presets (Clean White, Warm Cream, Midnight Charcoal), currency configuration, and operating hours.
* **Category CRUD:** Create, edit, reorder, and toggle visibility.
* **Food Item CRUD:** Create, edit, delete, category assignment, price management, dietary tags, allergens, and one-tap `Available` vs `Sold Out (86)` toggle.
* **AI Food Image Studio:** Synthesized culinary prompt, generation of **4 to 5 variations**, side-by-side preview, manual owner approval, persistent storage, and quota tracking.
* **Manual Asset Uploads:** Direct photo uploads from device with automatic WebP transcoding.
* **Table QR Code Studio:** Permanent URL QR generation with centered logo embedding and SVG/PNG vector downloads.
* **Multi-Tenant Isolation:** Single shared database with strict tenant scoping (`restaurant_id`).

### Bucket 2: Post-MVP / Version 2
* **Table-Specific QR Codes:** Table parameter routing (`?table=12`) displaying table numbers on customer header.
* **Multi-Language Menu Localization:** Dual-language toggle (e.g., English / Spanish).
* **Bulk Menu Import / Export:** CSV/Excel template upload for onboarding 80+ dishes in one click.
* **Menu Analytics (Privacy-Preserving):** Daily QR scan counters, most-viewed categories, and top-searched keywords.
* **Multi-User Staff Permissions:** Separate logins for floor staff (availability toggle only) vs. owner (full pricing/settings access).
* **Custom Subdomains / Domains:** Mapping `menu.restaurant.com` to DigiNu tenant.

### Bucket 3: Explicitly Out of Scope
* ❌ Shopping cart, checkout, and digital payment gateways (Stripe Checkout for diners).
* ❌ Online food ordering, delivery dispatch, and SMS delivery tracking.
* ❌ Kitchen Display Systems (KDS) and Kitchen Order Tickets (KOT).
* ❌ Point of Sale (POS) hardware sync and fiscal cash register integration.
* ❌ Raw ingredient inventory tracking and automated stock decrementing.
* ❌ Table reservation booking systems.
* ❌ Customer login accounts, loyalty points, or consumer tracking.

---

## 2. Non-Functional Quality Requirements (NFRs)

### 2.1 Mobile-First Responsiveness
* **Viewport Support:** 100% fluid responsive rendering across 360px to 430px smartphone viewports (iPhone SE through modern Pro Max and Galaxy devices).
* **Touch Ergonomics:** All clickable elements (category pills, filter toggles, buttons, cards) must have a minimum touch target of 44x44px.
* **Orientation:** Seamless reflow on orientation change (portrait to landscape) without layout clipping.

### 2.2 Performance & Asset Loading
* **Page Load Budget:** Public digital menu must achieve First Contentful Paint (FCP) in < 1.0s and Largest Contentful Paint (LCP) in < 1.8s over a standard 4G mobile connection. `[TO CONFIRM: Benchmarking environment]`
* **Image Optimization:** All uploaded or AI-generated food images must be transcoded to modern **WebP** format. Thumbnails must be capped at 400x400px (< 50KB), and full-size modal images capped at 1200x800px (< 180KB).
* **Zero Layout Shift:** Image containers must use fixed aspect-ratio placeholders (shimmer skeletons) to ensure Cumulative Layout Shift (CLS) is < 0.1.
* **Edge Caching:** Public menu JSON payloads must be cached at the edge with stale-while-revalidate headers (`s-maxage=60, stale-while-revalidate=300`) to absorb dinner-rush traffic surges.

### 2.3 Accessibility & Visual Comfort (WCAG 2.1 AA)
* **Contrast Compliance:** Minimum contrast ratio of 4.5:1 for body text and 3:1 for large headers against background colors across all theme presets.
* **Low-Light Readability:** High contrast and distinct typography allow diners to comfortably read dish names and prices in dimly lit dining rooms without phone flashlights.
* **Screen Reader Support:** All food images must have programmatic `alt` attributes derived from dish name and ingredients.

### 2.4 Secure Authentication & Authorization
* **Password Hashing:** Passwords hashed with bcrypt (salt rounds >= 12) or Argon2id.
* **Session Integrity:** Authentication cookies must have flags: `HttpOnly`, `Secure`, `SameSite=Lax`.
* **Tenant Isolation:** Every administrative mutation and query must explicitly filter by `restaurant_id = session.tenant_id`. Cross-tenant queries are blocked at the database layer.

### 2.5 Privacy & Regulatory Posture
* **Anonymous Diners:** Zero personal identifiable information (PII) is collected from diners.
* **No Cookie Consent Overhead:** Because no tracking or advertising cookies are used on the public menu, disruptive GDPR/CCPA cookie banners are completely avoided.
* **Owner Confidentiality:** Restaurant owner email and payment data are isolated and never exposed publicly.

### 2.6 Reliability & Graceful Degradation
* **Decoupled Architecture:** The public customer menu must remain 100% operational and readable even if external AI generation providers or image storage systems experience upstream downtime.
* **Database Resiliency:** Database connection pooling must be configured to prevent connection starvation during peak concurrent diner browsing.

### 2.7 Maintainability & Scalability
* **Single Codebase Asset:** All tenant customization must be driven by database configuration tokens (colors, logo, currency, layout) rather than separate code branches.
* **AI Provider Abstraction:** AI generation must be encapsulated behind a modular service adapter, allowing the platform owner to switch upstream vendors without refactoring application logic.

### 2.8 AI Failure Handling & Quota Safeguards
* **Timeout Threshold:** External AI generation requests must time out after 25 seconds `[TO CONFIRM]`, returning a polite error message to the owner.
* **Concurrency Locking:** Rapid repeated clicks on the "Generate" button are prevented via client-side debouncing and server-side request mutex locks.
* **Quota Enforcement:** Monthly generation counts are decremented atomically, preventing over-consumption beyond tenant limits.

