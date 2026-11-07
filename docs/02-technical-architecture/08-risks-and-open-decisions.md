# Technical Risks, Hosting Costs & Decisions Log — DigiNu

**Document Version:** 2.0 (Independent Deployments Revision)  
**Phase:** 02 — Technical Architecture & Data Model  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Architectural Decisions Log

| Decision ID | Area | Choice Made / Approved | Rationale | Status |
| :--- | :--- | :--- | :--- | :---: |
| **DEC-01** | Platform Model | **Independent Deployments with One Reusable Codebase** | Eliminates SaaS multi-tenant complexity. Physical database isolation guarantees zero cross-tenant data leakage. | `[CONFIRMED]` |
| **DEC-02** | Database & ORM | **Dedicated PostgreSQL Database per Restaurant with Prisma ORM** | Schema is free of `restaurant_id` columns, compound tenant indexes, and row-level security. Relational integrity strictly enforced. | `[CONFIRMED]` |
| **DEC-03** | AI Batching Strategy | **1 High-Resolution Image Generation per Request** | Consumes ~250 Neurons (vs ~1,000 for 4 variations); drops generation latency from 15s to 3–4s; simplifies owner UX. | `[CONFIRMED]` |
| **DEC-04** | AI Primary Provider | **Cloudflare Workers AI (`flux-1-schnell`)** | Free tier (10,000 Neurons/day = ~40 free images/day); Apache 2.0 commercial license; photorealistic food quality. | `[CONFIRMED]` |
| **DEC-05** | Image Management | **ImageKit.io (Folder-Segregated `/restaurants/{slug}/`)** | Offloads all image resizing and WebP transformations to edge CDN; direct browser upload via server HMAC signatures. | `[CONFIRMED]` |
| **DEC-06** | Pricing Sizing Options | **Single Base Price per Item for MVP** | Keeps MVP schema and UI minimal. Sizing variants (Small/Large) deferred to Version 2. | `[CONFIRMED]` |
| **DEC-07** | Client Onboarding | **Repeatable Automated Onboarding via CLI & Database Seed** | Setup via `prisma/seed.ts` and environment variables; no master super-admin portal needed for MVP. | `[CONFIRMED]` |

---

## 2. Realistic Commercial Hosting & Cost Model

> [!IMPORTANT]
> **Commercial Hosting Compliance:** Vercel Hobby tier is restricted to non-commercial personal projects. The cost calculations below utilize commercial-compliant hosting: Managed PaaS (Railway / Render) and Self-Managed VPS with Coolify.

### 2.1 Per-Restaurant Infrastructure Breakdown

```
+-----------------------------------------------------------------------------------------+
|                           INDEPENDENT DEPLOYMENT COST MODEL                             |
+-----------------------------------------------------------------------------------------+
| Cost Component             | Railway / Render (PaaS)      | Hetzner VPS + Coolify       |
|----------------------------|------------------------------|-----------------------------|
| Web App Runtime (Next.js)  | $5.00 / month                | Included in VPS             |
| Dedicated PostgreSQL DB    | $5.00 / month                | Included in VPS             |
| ImageKit Storage & CDN     | $0.00 (Free Tier < 20GB)     | $0.00 (Free Tier < 20GB)    |
| Cloudflare Workers AI      | $0.00 (Free Tier < 10k/day)  | $0.00 (Free Tier < 10k/day) |
| Domain / DNS               | $0.00 (Cloudflare DNS Free)  | $0.00 (Cloudflare DNS Free) |
|----------------------------|------------------------------|-----------------------------|
| Total Cost Per Restaurant  | ~$10.00 / month              | ~$1.50 – $3.00 / month      |
+-----------------------------------------------------------------------------------------+
```

### 2.2 Cost Scaling Scenarios (1, 5, and 10 Restaurants)

| Scale | Scenario: 1 Restaurant | Scenario: 5 Restaurants | Scenario: 10 Restaurants |
| :--- | :--- | :--- | :--- |
| **Option A: Railway / Render (PaaS)** | **$10 / month**<br>($5 app + $5 DB) | **$50 / month**<br>(5 apps + 5 DBs) | **$100 / month**<br>(10 apps + 10 DBs) |
| **Option B: Self-Managed VPS (Coolify)** | **$6 / month**<br>(Hetzner CX22, 2 vCPU, 4GB RAM) | **$12 / month**<br>(Hetzner CX32, 4 vCPU, 8GB RAM) | **$20 / month**<br>(Hetzner CPX31, 4 vCPU, 16GB RAM) |
| **ImageKit Upgrades (if needed)** | $0 (Free plan 20GB) | $0 (Free plan 20GB) | $9/mo (Lite plan 40GB soft overages) |
| **Cloudflare AI Overages** | $0 (well under 10k/day) | $0 (well under 10k/day) | $0 (well under 10k/day) |
| **Freelancer Client Revenue**<br>(at $39/mo SaaS fee) | **$39 / month** | **$195 / month** | **$390 / month** |
| **Freelancer Net Profit (Option A: PaaS)** | **+$29 / month** | **+$145 / month** | **+$281 / month** |
| **Freelancer Net Profit (Option B: VPS)** | **+$33 / month** | **+$183 / month** | **+$361 / month** |

---

## 3. Free-Tier Calculations & Provider Limits

### 3.1 Cloudflare Workers AI (1 Image per Run)
* **Daily Free Quota:** 10,000 Neurons per day on any Cloudflare account (resets daily at 00:00 UTC).
* **Consumption for 1 Image:** $\approx 249.6\text{ Neurons}$ per 1024x1024 generation at 6 steps.
* **Daily Free Capacity:** $\frac{10,000}{250} = \mathbf{40\text{ image generations per day}}$.
* **Monthly Free Capacity:** $40 \times 30 = \mathbf{1,200\text{ image generations per month}}$ at **$0.00 cost**.
* **Account-Level Sharing:** All client deployments sharing the freelancer's Cloudflare API token draw from this 10,000 daily pool. If 5 restaurants generate 2 dishes a day, they consume only ~2,500 Neurons/day (25% of the free pool).
* **Overage Rate:** If daily quota is exceeded on Workers Paid, cost is only **$0.011 per 1,000 Neurons** (~$0.0028 per additional image).

### 3.2 ImageKit Free Tier
* **Free Plan:** 3 GB DAM storage, 20 GB monthly bandwidth.
* **Cutoff:** Free plan has a hard cutoff at 20 GB.
* **Mitigation:** Freelancer monitors monthly usage; upgrades to Lite plan ($9/mo) with soft overages ($0.50/GB) as total client volume approaches 18 GB.

---

## 4. Technical Risks & Mitigation Log

| Risk ID | Risk Description | Severity | Preventive Architecture Mitigation | Status |
| :--- | :--- | :---: | :--- | :---: |
| **TR-01** | **Shared Cloudflare AI Daily Exhaustion**<br>Multiple clients generating images simultaneously could exhaust the 10,000 daily free neurons. | Medium | Enforce monthly per-deployment credit limits (`ai_credits_balance = 30`); configure Workers Paid ($5/mo) as safety net for tiny overage billing ($0.0028/img). | `[CONFIRMED]` |
| **TR-02** | **ImageKit Free Bandwidth Hard Cutoff**<br>Sudden surge in customer visits reaches 20 GB cap. | High | Set proactive email alerts at 15 GB bandwidth; upgrade to $9/mo Lite plan prior to hitting limit. | `[CONFIRMED]` |
| **TR-03** | **VPS Maintenance Overhead (Option B)**<br>Managing a Linux server requires OS updates and monitoring. | Medium | For clients #1–#5, start on Railway/Render PaaS for zero maintenance. Transition to Coolify VPS once client revenue exceeds $200/month. | `[RECOMMENDATION]` |
| **TR-04** | **Upstream Code Divergence**<br>Editing client code directly could make pulling updates difficult. | High | Strict rule: Never edit core code for a client. All customizations must be configured via environment variables and database seed data. | `[CONFIRMED]` |
