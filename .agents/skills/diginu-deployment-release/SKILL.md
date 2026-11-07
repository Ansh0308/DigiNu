---
name: diginu-deployment-release
description: "Deployment procedures, hosting options, environment configuration, database provisioning, and client onboarding workflows for DigiNu independent deployments. Covers Railway, Render, Coolify VPS, ImageKit folder setup, and upstream Git synchronization."
---

# DigiNu Deployment, Release & Client Onboarding

This skill outlines the step-by-step procedures for deploying, provisioning, and maintaining independent DigiNu client installations using the single reusable codebase.

---

## 1. Hosting Architecture & Commercial Viability

DigiNu is deployed independently for each paying restaurant client:

```
+-----------------------------------------------------------------------------------------+
|                    CLIENT DEPLOYMENT TOPOLOGY (PER RESTAURANT)                         |
+-----------------------------------------------------------------------------------------+
| Custom Domain: menu.bistrolumiere.com                                                   |
| App Container: Next.js 15 Node.js Runtime (Railway / Render / Coolify VPS)              |
| Database: Dedicated PostgreSQL Database (Railway / Supabase / Neon)                     |
| Media Assets: ImageKit CDN (/restaurants/{slug}/*)                                      |
| AI Engine: Cloudflare Workers AI (@cf/black-forest-labs/flux-1-schnell)                  |
+-----------------------------------------------------------------------------------------+
```

### Commercial Hosting Compliance:
* **Vercel Hobby Warning:** Vercel's Hobby tier strictly prohibits commercial use. Commercial deployment requires either Vercel Pro ($20/mo per user), a managed PaaS, or a self-hosted VPS.
* **Recommended PaaS:** Railway or Render ($10/month per client: $5 application container + $5 managed PostgreSQL).
* **High-Margin VPS Alternative:** Hetzner or DigitalOcean VPS ($12–$20/mo) running **Coolify**. Can host 5–10 independent restaurant containers and databases, reducing per-client infrastructure cost to $1.50–$3.00/month.

---

## 2. Repeatable 6-Step Client Onboarding Runbook

Whenever onboarding a new restaurant client:

### Step 1: Provision Isolated Database
Create a dedicated PostgreSQL database instance (e.g., on Railway or VPS). Obtain the connection URL:
```text
DATABASE_URL="postgresql://user:password@host:5432/diginu_client_slug?sslmode=require"
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` in the client's deployment environment:
```env
# Application
NEXT_PUBLIC_APP_URL="https://menu.restaurantname.com"
AUTH_SECRET="generated-32-byte-hex-string"
NODE_ENV="production"

# Dedicated Database
DATABASE_URL="postgresql://..."

# Central ImageKit Account (Client Folder Segregation)
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY="public_..."
IMAGEKIT_PRIVATE_KEY="private_..."
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/diginu"
IMAGEKIT_FOLDER="/restaurants/restaurant-slug"

# Shared Cloudflare Workers AI Account
CLOUDFLARE_ACCOUNT_ID="..."
CLOUDFLARE_API_TOKEN="..."
AI_MODEL_ID="@cf/black-forest-labs/flux-1-schnell"

# Initial Restaurant Profile
RESTAURANT_NAME="Restaurant Name"
RESTAURANT_SLUG="restaurant-slug"
INITIAL_OWNER_EMAIL="owner@restaurantname.com"
INITIAL_OWNER_PASSWORD="TemporaryStrongPassword123!"
```

### Step 3: Run Database Migrations
Apply the production database schema:
```bash
npx prisma migrate deploy
```

### Step 4: Seed Initial Client Data
Execute the seed script to create the `restaurant_profile`, initial owner account, operating hours, starter categories, and AI credit allocation:
```bash
npx prisma db seed
```

### Step 5: Deploy Application Container
Deploy the codebase container pointing to the client's environment variables and database. Verify SSL certification and custom domain DNS routing (`CNAME` to container host).

### Step 6: Generate & Deliver Table QR Kit
1. Log in to `/admin` using the seeded initial owner credentials.
2. Upload the restaurant's high-resolution logo and verify primary color theming.
3. Navigate to `/admin/qr-studio` and download the vector SVG and A6 print PDF table tent.
4. Deliver physical acrylic QR table-tents or print files to the restaurant owner.

---

## 3. Upstream Git Maintenance & Update Workflow

Because each restaurant runs as an independent deployment from one central repository:

1. **Central Upstream Repository:** Contains the pristine, white-label DigiNu codebase (`origin/main`).
2. **Client Deployments:** Linked via Git remote to the central repo or automatically deployed from the main branch using environment variables.
3. **Rolling Out Core Improvements:**
   * Push bug fixes, security patches, or new features to the central `main` branch.
   * Client deployments tracking `main` automatically rebuild and redeploy.
   * Because all client-specific data, branding, and images reside in their dedicated database and environment variables, code updates never overwrite restaurant customization.

