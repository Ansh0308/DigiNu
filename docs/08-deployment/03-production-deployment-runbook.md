# DigiNu — Step-by-Step Production Deployment Runbook

**Document ID:** `DEP-03`  
**Phase:** BUILD-08 (Testing, Security Audit & Client Deployment)  
**Target Provider:** Railway (Next.js 16 + Managed PostgreSQL 16)  
**Audience:** Freelance Developer & Agency Operator  
**Tone:** Beginner-Friendly, Exact, Step-by-Step  

---

## Stage 1: Local Pre-Flight Verification

Before touching cloud infrastructure, verify that the local repository compiles cleanly and passes all automated tests.

1. **Verify TypeScript Compilation:**
   ```powershell
   npx tsc --noEmit
   ```
   *Expected output:* Returns cleanly with zero errors (exit code 0).

2. **Verify ESLint:**
   ```powershell
   npm run lint
   ```
   *Expected output:* Returns cleanly with zero warnings or errors.

3. **Verify All Test Suites:**
   ```powershell
   npm test
   ```
   *Expected output:* All 74 tests across BUILD-02 through BUILD-07 pass (100% green).

4. **Verify Production Build:**
   ```powershell
   npm run build
   ```
   *Expected output:* Next.js Turbopack generates 23 static and dynamic routes successfully in `.next`.

---

## Stage 2: GitHub Repository Preparation & Push

Railway deploys directly from your private GitHub repository.

1. **Check Git Status:**
   ```powershell
   git status
   ```
   *Check:* Verify that `.env` is NOT tracked. Only source code and documentation should be listed.

2. **Push Local Commits to GitHub:**
   In your terminal, execute:
   ```powershell
   git push origin main
   ```
   *If prompted:* Authenticate via your browser or Personal Access Token (PAT).
   *Verification:* Open `https://github.com/Ansh0308/DigiNu` in your browser. Confirm that the latest commits (`f5bb8eb` and `1f1ec2c`) appear on branch `main`.

---

## Stage 3: Railway Account & Project Setup

1. **Log in to Railway:**
   - Navigate to [railway.com](https://railway.com).
   - Click **Log In** (top right) and choose **Login with GitHub**.
   - Authorize Railway to access your GitHub repositories.

2. **Create a Dedicated Project for the Restaurant:**
   - On the Railway dashboard, click the **+ New Project** button.
   - Choose **Empty Project** (this gives you full control over service layout).
   - In the project canvas, click on the project name (e.g. `radiant-resonance`) at top left, select **Settings**, and rename the project to the restaurant name:
     - Example: `diginu-red-apple`

---

## Stage 4: Production PostgreSQL Provisioning

1. **Add PostgreSQL Database:**
   - Inside your new project canvas, click **+ Create** or **Add Service**.
   - Select **Database** -> **Add PostgreSQL**.
   - Railway will provision a dedicated PostgreSQL 16 container within 15 seconds.

2. **Obtain Database Connection Strings:**
   - Click on the newly created **PostgreSQL** service card in the canvas.
   - Navigate to the **Variables** tab.
   - You will see two critical connection strings:
     - `DATABASE_URL`: The **private internal URL** (`postgresql://postgres:...@postgres.railway.internal:5432/railway`). Use this inside the Next.js web service for fast, secure zero-latency queries.
     - `DATABASE_PUBLIC_URL`: The **public proxy URL** (`postgresql://postgres:...@roundhouse.proxy.rlwy.net:.../railway`). Use this from your local computer for running the initial migration and seed scripts.

---

## Stage 5: Apply Migrations & Seed Production Database

> [!CAUTION]
> Never run `prisma migrate dev` against a production database. Always execute `prisma migrate deploy` to safely apply pending schema migrations without resetting data.

1. **Apply Migrations from your local terminal:**
   Copy the `DATABASE_PUBLIC_URL` from the Railway PostgreSQL Variables tab, and run:
   ```powershell
   $env:DATABASE_URL="<PASTE_YOUR_DATABASE_PUBLIC_URL_HERE>"
   npx prisma migrate deploy
   ```
   *Expected output:*
   ```text
   Applying migration `20261107120000_init_single_tenant_schema`
   Applying migration `20261107140000_add_singleton_constraints`
   Applying migration `20261107153000_add_operating_hours_check`
   Applying migration `20261107163620_add_ai_log_status_and_lifecycle`
   Applying migration `20261107165134_add_candidate_hash_to_ai_logs`
   Applying migration `20261113071527_add_qr_config_fields`
   All migrations have been successfully applied.
   ```

2. **Execute Initial Production Seed:**
   ```powershell
   npx tsx prisma/seed.ts
   ```
   *Expected output:* Seeds initial Restaurant Profile, 7-day Operating Hours, Menu Categories, Food Dishes, and default Owner Account (`owner@bella-italia.com` or custom).

---

## Stage 6: Deploy Next.js Web Service on Railway

1. **Connect GitHub Repository:**
   - In your Railway project canvas, click **+ Create** -> **GitHub Repo**.
   - Select your repository: `Ansh0308/DigiNu`.
   - Branch: `main`.
   - Railway will immediately create the service and begin building.

2. **Configure Service Settings:**
   - Click on the new web service card in the canvas.
   - Go to the **Settings** tab.
   - Under **Build Command**, leave empty or set:
     `npm run build`
   - Under **Start Command**, leave empty or set:
     `npm start`

3. **Configure Production Environment Variables:**
   - In the web service card, click the **Variables** tab.
   - Click **+ Add Variable** (or **RAW Editor** to paste the block) and configure:

     | Variable Name | Value / Instructions |
     |:---|:---|
     | `DATABASE_URL` | Select **Add Reference** -> Choose `Postgres` -> `DATABASE_URL` (this automatically uses Railway's fast private network) |
     | `AUTH_SECRET` | Generate a 32-byte secret (see command below) |
     | `NEXT_PUBLIC_APP_URL` | Your production URL: `https://<service-name>.up.railway.app` (or custom domain) |
     | `IMAGEKIT_PRIVATE_KEY` | Your restaurant's ImageKit private key |
     | `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | Your restaurant's ImageKit public key |
     | `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | e.g. `https://ik.imagekit.io/<your-id>` |
     | `IMAGEKIT_FOLDER_PREFIX` | `restaurants/red-apple` |
     | `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID |
     | `CLOUDFLARE_API_TOKEN` | Your Cloudflare Workers AI token |
     | `NODE_ENV` | `production` |

   *How to generate a secure `AUTH_SECRET`:*
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. **Trigger Deployment & Monitor Logs:**
   - Go to the **Deployments** tab.
   - Click on the active deployment to view real-time build and runtime logs.
   - Look for: `✓ Compiled successfully` and `▲ Next.js 16 Ready in ... ms`.

---

## Stage 7: Generate Railway Domain & Verify Live Access

1. **Generate Free Railway Domain:**
   - In the web service card, go to **Settings** -> **Networking** -> **Public Networking**.
   - Click **Generate Domain**.
   - Railway will provision a public URL (e.g. `https://diginu-red-apple-production.up.railway.app`).
   - Copy this URL.

2. **Update `NEXT_PUBLIC_APP_URL`:**
   - If using the Railway-generated domain, ensure `NEXT_PUBLIC_APP_URL` in the Variables tab matches this exact URL (without a trailing slash).
   - Railway will automatically re-deploy in ~30 seconds.

3. **Open the Live Public Menu:**
   - Navigate to `https://<your-generated-domain>/` in your browser.
   - Verify that the restaurant hero banner, category tabs, and food items render immediately.

---

## Stage 8: Custom Domain & Automatic HTTPS (Production Client Handover)

When handing the deployment over to a paying restaurant client with their own domain (e.g. `menu.redapplerestaurant.com` or `redappledigital.in`):

1. **Add Custom Domain in Railway:**
   - In the Web Service card, go to **Settings** -> **Networking** -> **Custom Domain**.
   - Enter the client's domain: e.g. `menu.clientdomain.com`.
   - Railway will provide a DNS record:
     - Type: `CNAME`
     - Host / Name: `menu`
     - Target / Value: `<your-project>.up.railway.app`

2. **Add DNS Record in Registrar (GoDaddy, Namecheap, Cloudflare):**
   - Log into the client's domain registrar DNS settings.
   - Add the `CNAME` record provided by Railway.
   - Wait 2–5 minutes for DNS propagation.

3. **Automatic SSL/TLS:**
   - Railway will detect the record, provision a free Let's Encrypt SSL certificate, and switch status to **Active** (Green checkmark).
   - Update `NEXT_PUBLIC_APP_URL` in Railway Variables to `https://menu.clientdomain.com`.

---

## Stage 9: First-Time Owner Account Hardening

Immediately after deployment, rotate the default seed credentials:

1. **Log into Owner Dashboard:**
   - Navigate to `https://<your-domain>/admin/login`.
   - Enter the initial owner credentials.
2. **Verify Security Invariants:**
   - Change the owner password to a strong, high-entropy password.
   - Upload the official restaurant logo (square 1:1) and hero banner (3:1) in `/admin/profile`.
   - Download the high-res QR code and test physical camera scan to confirm immediate redirection to the custom domain.

