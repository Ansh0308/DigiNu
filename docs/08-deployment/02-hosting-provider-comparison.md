# DigiNu — Hosting Provider Evaluation & Architecture Recommendation

**Document ID:** `DEP-02`  
**Phase:** BUILD-08 (Testing, Security Audit & Client Deployment)  
**Status:** COMPLETE & APPROVED  
**Architecture Model:** Option B — 1 Independent Deployment + 1 PostgreSQL Database per Restaurant  

---

## 1. Evaluation Context & Stack Requirements

DigiNu is architected as an **independent deployment product per restaurant client**. When a restaurant buys the digital menu platform from the freelance developer, they receive their own isolated application container, custom domain, and dedicated database.

**Production Stack Requirements:**
- **Web App:** Next.js 16 (Turbopack, App Router, SSR, Edge caching)
- **Runtime:** Node.js 20+ / Node.js 24
- **Database:** Dedicated PostgreSQL 16 instance with persistent volume
- **ORM:** Prisma 7 with `@prisma/adapter-pg`
- **Auth:** Auth.js v5 (`trustHost: true`)
- **Media CDN:** ImageKit (external)
- **AI Engine:** Cloudflare Workers AI FLUX.1 Schnell (external)

---

## 2. Comprehensive Provider Comparison Matrix

| Evaluation Criteria | Railway (Recommended for Venue 1) | Render | Coolify on Hetzner VPS (Scale Path) |
|:---|:---|:---|:---|
| **1. Next.js 16 & Node 24 Support** | **Full** (Nixpacks auto-detects Node 24 and Next.js 16; zero config) | **Partial** (Node 20/22 native; Node 24 requires custom Dockerfile) | **Full** (Builds via Docker with exact specified Node version) |
| **2. Managed PostgreSQL** | **Native Plugin** (PostgreSQL 16 provisioned in 1 click on private network) | **Managed Service** ($7/mo Starter DB; free DB expires after 30 days) | **Self-Hosted Docker** (Spawns isolated Postgres 16 container per client) |
| **3. Persistent Storage & Backups** | **Yes** (Automated daily backups + point-in-time restore, persistent volume) | **Yes** (Daily backups on paid DB plans) | **Yes** (Automated volume snapshots + S3 backup scripts) |
| **4. Env Variable Management** | **Excellent** (Service-level variables, `.env` bulk import, secret masking) | **Good** (Dashboard env editor + secret files) | **Excellent** (Encrypted env storage per application) |
| **5. Custom Domain & HTTPS** | **Instant & Automated** (Add CNAME/A record, Let's Encrypt SSL auto-issued) | **Automated** (Free auto-renewing SSL certificate) | **Automated** (Built-in Traefik reverse proxy handles Let's Encrypt) |
| **6. GitHub Integration** | **Native** (Auto-deploys on commit to `main`, PR previews optional) | **Native** (Auto-deploy on Git push) | **Native** (Git webhook triggers automatic rebuilds) |
| **7. Real-Time Logs** | **Live Streaming** (Filterable stdout/stderr, deployment history, restart buttons) | **Live Streaming** (Web console logs) | **Live Streaming** (Real-time Docker container stdout/stderr) |
| **8. Monthly Cost per Venue** | **~$5 to $8 / month** (Usage-based RAM + CPU; no idle fee) | **~$14 / month** ($7 Web + $7 DB; free tier sleeps for 50s) | **~$1.00 to $1.50 / venue** (€4.50/mo VPS hosts 3–5 venues) |
| **9. Commercial Terms** | **100% Commercial** (No non-commercial tier traps) | **Commercial on Paid Plans** | **100% Commercial** (You own the underlying server) |
| **10. 1-Click Client Replication** | **Effortless** (Duplicate Project / Template takes < 2 minutes) | **Manual** (Must create Web Service + DB separately per venue) | **Very Easy** (Application cloning in Coolify GUI) |

---

## 3. Deep-Dive Provider Analysis

### A. Railway (Primary Recommendation for First Production Launch)
- **Why It Wins for Venue 1:**
  1. **Zero Cold Starts**: Unlike Render's free tier (which spins down after 15 minutes of inactivity and subjects restaurant diners to a humiliating 50-second page load), Railway containers remain warm 24/7.
  2. **Turnkey Private Network**: The Next.js application communicates with PostgreSQL over Railway's internal private mesh network (`postgres.railway.internal`), preventing database exposure to the public internet.
  3. **Cost Efficiency**: You only pay for actual vCPU and RAM consumed. An idling restaurant menu uses ~150MB RAM; during peak dinner rushes it scales to ~300MB RAM. The total combined cost for 1 Next.js web service and 1 PostgreSQL database typically ranges between **$5 and $8 per month**.
  4. **Rapid Onboarding**: A complete project (Web + Postgres) can be created from GitHub in under 5 minutes without writing Dockerfiles or managing Linux packages.

### B. Render
- **Why It Is Secondary:**
  - Render's free tier PostgreSQL expires after 30 days and deletes all data.
  - Render's free tier web service sleeps after 15 minutes of inactivity.
  - To achieve commercial production reliability, Render requires the $7/month Starter Web Service + $7/month Starter PostgreSQL DB, totaling **$14/month per venue**. This is nearly double Railway's expected cost with no architectural advantage.

### C. Coolify on Hetzner Cloud VPS (The Scale Path for 3+ Venues)
- **Why It Is the Ultimate Profit Maximizer:**
  - Hetzner Cloud offers the `CX22` (2 vCPU AMD, 4 GB RAM, 40 GB NVMe, 20 TB traffic) for **€3.99/month (~$4.35 USD)**.
  - Installing Coolify (open-source PaaS) on this single server provides a web dashboard identical to Railway.
  - A 4 GB RAM server can comfortably run **3 to 5 independent restaurant deployments** (each with its own isolated Next.js container, Postgres container, and custom domain).
  - This reduces the ongoing infrastructure cost to **~$1.00 - $1.50 per restaurant per month**, giving the freelance developer a 98% gross profit margin on hosting retainers.
- **Why Not for Day 1:** Setting up DNS, SSH keys, Ubuntu security updates, firewall rules, and VPS monitoring adds unnecessary friction when the primary goal is getting the first client's menu live today.

---

## 4. Comprehensive Cost Breakdown for Client #1

| Component | Provider / Tier | Monthly Cost (USD) | Notes |
|:---|:---|:---|:---|
| **Next.js Web Service** | Railway (Pro/Usage) | ~$3.50 – $4.50 | 0.25 vCPU, 256MB–512MB RAM |
| **PostgreSQL 16 Database** | Railway Plugin | ~$2.00 – $3.50 | 10 GB persistent storage, private network |
| **Custom Domain** | Namecheap / Cloudflare | ~$0.85 ($10/year) | `.com` or `.in` domain |
| **Media Asset Cloud CDN** | ImageKit Free Tier | **$0.00** | 20 GB bandwidth & 20 GB media included |
| **AI Food Image Generator** | Cloudflare Workers AI | **$0.00** | 10,000 Neurons/day free (~40 FLUX.1 generations/day) |
| **Total Monthly Operating Cost** | | **~$6.50 – $9.00 / mo** | |

### Freelancer Commercial Margin Suggestion:
- **Client Hosting & Maintenance Retainer Fee:** **$35 – $75 / month** (or ₹2,500 – ₹5,000 / month)
- **Developer Net Profit Margin:** **~80% to 88%** on recurring revenue per venue.

