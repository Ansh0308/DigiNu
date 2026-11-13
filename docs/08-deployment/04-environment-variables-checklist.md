# DigiNu — Production Environment Variables Checklist & Reference

**Document ID:** `DEP-04`  
**Phase:** BUILD-08 (Testing, Security Audit & Client Deployment)  
**Status:** COMPLETE & AUDITED  

---

## 1. Master Environment Variables Specification

Every DigiNu production instance requires the following environment variables. None of these variables should contain default localhost or placeholder strings in production.

| Variable Name | Exposure | Scope per Venue | Purpose | Where to Obtain |
|:---|:---|:---|:---|:---|
| `DATABASE_URL` | **SECRET** | **Unique per Venue** | Connection string to the restaurant's dedicated PostgreSQL 16 database. | Railway PostgreSQL Service -> Variables tab (`DATABASE_URL`). |
| `AUTH_SECRET` | **SECRET** | **Unique per Venue** | 32-byte cryptographic entropy key used by Auth.js to sign session JWTs and cookies. | Generate via `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. |
| `NEXT_PUBLIC_APP_URL` | **PUBLIC** | **Unique per Venue** | Canonical public URL of this restaurant's menu deployment (used for QR encoding and OpenGraph). | Your production domain: `https://menu.restaurant.com` (no trailing slash). |
| `IMAGEKIT_PRIVATE_KEY` | **SECRET** | **Unique or Shared** | Server-side API key for uploading and deleting media assets. | ImageKit Dashboard -> Developer Options -> API Keys. |
| `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY` | **PUBLIC** | **Unique or Shared** | Client-safe public key for ImageKit CDN references. | ImageKit Dashboard -> Developer Options -> API Keys. |
| `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT` | **PUBLIC** | **Unique or Shared** | Base CDN URL for real-time WebP/AVIF transformations. | ImageKit Dashboard -> URL-endpoint (e.g. `https://ik.imagekit.io/<id>`). |
| `IMAGEKIT_FOLDER_PREFIX` | **SECRET** | **Unique per Venue** | Cloud storage directory isolation tag for this specific restaurant venue. | Set to restaurant slug, e.g. `restaurants/red-apple` or `restaurants/bistro-lumiere`. |
| `CLOUDFLARE_ACCOUNT_ID` | **SECRET** | **Shared or Venue** | Cloudflare account identifier powering Workers AI food image synthesis. | Cloudflare Dashboard -> Overview -> Account ID. |
| `CLOUDFLARE_API_TOKEN` | **SECRET** | **Shared or Venue** | Scoped API token with `Workers AI: Read/Edit` permission. | Cloudflare Dashboard -> My Profile -> API Tokens -> Create Custom Token. |
| `AI_MODEL_ID` | **SERVER** | Standard | Specifies the exact text-to-image model endpoint. | Set to `@cf/black-forest-labs/flux-1-schnell` (or leave default). |
| `NODE_ENV` | **SERVER** | Standard | Node execution mode. | Set to `production`. |

---

## 2. Detailed Variable Field Descriptions

### 1. `DATABASE_URL`
- **Visibility:** Server-side only. Never expose to client bundles.
- **Production Format:**
  `postgresql://postgres:<password>@<private-host>:5432/<dbname>`
- **Validation Rule:** Must begin with `postgresql://` or `postgres://`. In Railway, reference the internal private host (`postgres.railway.internal`) for sub-millisecond query latency and zero internet exposure.

### 2. `AUTH_SECRET`
- **Visibility:** Server-side only.
- **Production Format:** 64-character hexadecimal string.
- **Validation Rule:** Must be generated randomly per venue. Do NOT reuse the development secret across paying client venues.

### 3. `NEXT_PUBLIC_APP_URL`
- **Visibility:** Bundled into client JavaScript.
- **Production Format:** `https://yourdomain.com` (strictly `https://`, strictly NO trailing slash `/`).
- **Critical Dependency:** The QR code generator and PDF table-tent generator encode this exact string. If set to localhost in production, physical QR prints will direct diners to `http://localhost:3000` instead of the live digital menu.

### 4. `IMAGEKIT_PRIVATE_KEY`
- **Visibility:** Server-side only.
- **Security Check:** Must NEVER have the `NEXT_PUBLIC_` prefix. Used exclusively in `src/app/api/admin/media/upload/route.ts` and `src/app/api/admin/media/[id]/route.ts`.

### 5. `IMAGEKIT_FOLDER_PREFIX`
- **Visibility:** Server-side only.
- **Production Format:** `restaurants/<restaurant-slug>` (e.g. `restaurants/red-apple`).
- **Purpose:** Even if you use one ImageKit account across multiple client deployments, this folder prefix guarantees that Venue A's dishes are stored in `/restaurants/venue-a/` and Venue B's in `/restaurants/venue-b/`, preventing cross-venue media overwrites.

### 6. `CLOUDFLARE_ACCOUNT_ID` & `CLOUDFLARE_API_TOKEN`
- **Visibility:** Server-side only.
- **Permission Scope:** The API token requires only **Workers AI: Read** (or **Workers AI: Edit**) permission. Do NOT use your global Cloudflare API key.

---

## 3. Pre-Deployment Environment Validation Script

Before finalizing deployment in Railway, execute this pre-flight verification in your local terminal:

```powershell
# Run security check to ensure zero placeholders exist in your active deployment config
npx tsx -e "
const requiredVars = [
  'DATABASE_URL',
  'AUTH_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'IMAGEKIT_PRIVATE_KEY',
  'NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY',
  'NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT',
  'IMAGEKIT_FOLDER_PREFIX',
  'CLOUDFLARE_ACCOUNT_ID',
  'CLOUDFLARE_API_TOKEN'
];
console.log('Checking Production Variable Readiness...');
let valid = true;
for (const v of requiredVars) {
  const val = process.env[v];
  if (!val || val.includes('placeholder') || val.includes('your-')) {
    console.warn('❌ Missing or placeholder variable:', v);
    valid = false;
  } else {
    console.log('✅ Present & Non-Placeholder:', v);
  }
}
if (valid) console.log('🎉 All core production variables configured!');
"
```

