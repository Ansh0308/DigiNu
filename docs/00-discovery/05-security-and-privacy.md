# 05 — Security, Privacy & Data Protection

**Document Version:** 1.0  
**Phase:** 00 — Product Discovery  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Security Architecture & Threat Model

DigiNu separates its attack surface into two strictly segregated zones:
1. **Public Dining Zone (Untrusted / High Traffic):** Anonymous customers scanning QR codes on public dining tables.
2. **Administrative Zone (Trusted / Restricted):** Authenticated restaurant owners and the freelance super-administrator managing menu data and billing.

```
+-----------------------------------------------------------------------------------------+
|                                    SECURITY BOUNDARIES                                  |
+-----------------------------------------------------------------------------------------+
| Zone A: Public Dining Zone (Read-Only)     | Zone B: Admin Zone (Authenticated)         |
|--------------------------------------------|--------------------------------------------|
| - Unauthenticated access via QR code URL   | - Authenticated via secure credentials     |
| - STRICTLY READ-ONLY endpoints             | - Full CRUD operations over tenant data    |
| - No cookies, no session tokens required   | - HTTP-Only, SameSite, Secure auth cookies |
| - Sanitized public JSON (no emails, no AI  | - Access to AI generation endpoints        |
|   keys, no unpublished drafts)             | - Scoped strictly to authenticated         |
| - Edge cached & rate-limited against DDoS  |   restaurant_id via middleware & RLS       |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Authentication & Authorization Controls `[CONFIRMED]`

### 2.1 Owner Authentication
* **Password Security:** Passwords must meet minimum complexity (min 8 characters, alphanumeric) and are hashed using **Argon2id** or **bcrypt** with appropriate work factors (salt rounds >= 12).
* **Session Management:**
  * Authentication sessions use cryptographically random session tokens stored in `HttpOnly`, `Secure`, `SameSite=Lax` cookies to prevent Cross-Site Scripting (XSS) extraction.
  * Idle sessions expire automatically after 14 days, with absolute expiration at 30 days.
* **Brute-Force Protection:** Rate limiting on `/api/auth/login` (max 5 failed attempts per IP per 15 minutes, with exponential backoff and account lock protection).

### 2.2 Server-Side Authorization & Tenant Isolation `[CONFIRMED]`
* **Zero Trust on Client Input:** The client NEVER dictates `restaurant_id` in mutative requests. The backend derives `restaurant_id` solely from the verified server-side session token.
* **Tenant Scoping Guard:** Every database mutation (`INSERT`, `UPDATE`, `DELETE`) and private query (`SELECT`) enforces an explicit tenant scope:
  ```sql
  -- Example of mandatory tenant scoping policy
  WHERE restaurant_id = session.current_restaurant_id
  ```
* **Super-Admin Separation:** The freelance platform owner has a separate administrative role (`role = 'platform_superadmin'`) providing cross-tenant oversight for onboarding and billing, separated from regular restaurant owner roles.

---

## 3. Public API Protection & Data Sanitization `[CONFIRMED]`

Public endpoints serving the digital menu (e.g., `GET /api/public/menu/:slug`) are strictly read-only and hardened against scraping and data leakage:

### 3.1 Sanitized Public Data Projection
Public payloads return only the bare minimum fields necessary to render the menu. The following fields are **strictly excluded** from public API responses:
* Owner email, owner password hash, and user account records.
* Restaurant billing info, subscription status, and Stripe customer IDs.
* AI generation logs, credit balances, and third-party API configurations.
* Unpublished / Draft food items (`is_visible = false`).
* Internal margin notes, cost of goods, or supplier data.

### 3.2 Anti-Scraping & DDoS Rate Limiting
* Public endpoints are rate-limited (e.g., max 120 requests per minute per IP).
* Aggressive HTTP edge caching (`Cache-Control: public, s-maxage=60, stale-while-revalidate=300`) absorbs traffic spikes, shielding the origin database from table-scan rushes.

---

## 4. File Upload & Asset Security `[CONFIRMED]`

Food photography uploads represent a major threat vector (malicious executable scripts disguised as images, large files causing storage exhaustion).

### 4.1 Strict Upload Validation Pipeline
1. **Client-Side Pre-validation:** Images are checked for size (< 5MB) and previewed locally before upload.
2. **Server-Side MIME & Magic Number Sniffing:** Files are inspected using byte signature analysis (magic numbers) to verify genuine `image/jpeg`, `image/png`, or `image/webp`. File extension spoofing (e.g., `malware.exe.jpg`) is immediately rejected.
3. **EXIF & Privacy Metadata Stripping:** All EXIF metadata (GPS coordinates of where the photo was taken, camera serial numbers, timestamps) is stripped during image processing.
4. **Re-encoding & Compression:** Uploaded images are re-encoded and transformed into optimized WebP formats (a 400x400 thumbnail and a 1200x800 high-res preview). This process inherently neutralizes embedded script payloads.
5. **Secure Cloud Storage:** Images are stored in isolated cloud buckets (Amazon S3 or Cloudflare R2) configured with read-only public CDN delivery and no executable permissions.

---

## 5. AI API Key & Credential Security `[CONFIRMED]`

* **Server-Side Secret Isolation:** AI provider keys (Google Cloud Vertex AI credentials, OpenAI API keys, etc.) reside exclusively in secure server-side environment variables (`.env.local` / secret managers). They are never exposed in browser bundles or client-side JavaScript.
* **Server-Mediated Execution:** The browser never calls the AI provider directly. All AI requests route through authenticated backend endpoints that verify tenant identity, check credit balances, and apply rate limits.
* **Generation Lock (Mutex):** Prevents concurrent generation requests from the same user to avoid accidental double-billing.

---

## 6. Privacy & Regulatory Considerations `[CONFIRMED]`

* **Anonymous Diners:** Diners accessing the menu are 100% anonymous. DigiNu does NOT set tracking cookies, track personal identities, or build cross-restaurant user profiles.
* **No GDPR/CCPA Customer Consent Overhead:** Because no personal identifiable information (PII) is harvested from diners, the public menu requires no disruptive cookie consent popups.
* **Restaurant Owner PII Protection:** Restaurant owners' contact details and account credentials are treated as confidential and never shared with third parties.
* **Audit Trail:** The system logs critical administrative events (e.g., price changes, deletion of food items, login timestamps) to provide accountability for restaurant staff accounts.

