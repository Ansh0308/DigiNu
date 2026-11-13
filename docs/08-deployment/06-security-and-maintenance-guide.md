# DigiNu — Security Architecture & Ongoing Maintenance Guide

**Document ID:** `DEP-06`  
**Phase:** BUILD-08 (Testing, Security Audit & Client Deployment)  
**Status:** COMPLETE & APPROVED  

---

## 1. Security Architecture & Threat Defense Review

### A. Physical Database Isolation (Option B)
- **Zero Cross-Tenant Leakage Risk:** Because each restaurant deployment maintains a completely independent PostgreSQL database container, there is zero possibility of tenant cross-contamination, shared memory data leaks, or cross-tenant SQL injection.
- **Blast Radius Containment:** If one restaurant's deployment or credentials were ever compromised, other client restaurants remain 100% unaffected.

### B. Defensive HTTP Security Headers
Configured in `next.config.ts` and validated on every request:
```typescript
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https://ik.imagekit.io; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

### C. Authentication & Session Security
- **Bcrypt Password Storage:** Salts with 12 rounds; plain-text passwords never touch database persistence.
- **Timing Defense:** Non-existent emails trigger identical cryptographic hash comparisons to prevent user enumeration.
- **Sliding-Window Brute-Force Rate Limiting:** Restricts failed logins to 5 attempts per 15 minutes per IP address.
- **Cookie Flags:** `HttpOnly` (blocks XSS token theft), `SameSite=Lax` (blocks CSRF attacks), `Secure` (enforces HTTPS transmission).

### D. File Upload Security Bridge
- **Magic-Byte Inspection:** Rather than trusting client file extensions or Content-Type headers, the server inspects the first 12 bytes of uploaded buffers for authentic JPEG (`FF D8 FF`), PNG (`89 50 4E 47`), and WebP signatures.
- **Size Enforcements:** Maximum file payload strictly enforced to $\le 5\text{MB}$.
- **Isolated Storage:** Uploaded files stream directly to ImageKit cloud CDN and are never executed on the application host.

---

## 2. Database Backup, Restoration & Disaster Recovery

### A. Automated Railway Backups
- Railway PostgreSQL provides automated daily snapshots.
- Point-in-time restore is available directly in the Railway PostgreSQL card under the **Backups** tab.

### B. Manual Command-Line Backup (pg_dump)
To take an immediate cold backup of a restaurant client's database prior to performing major menu updates:
```powershell
# In PowerShell:
pg_dump "<DATABASE_PUBLIC_URL>" -F c -b -v -f "backup-restaurant-$(Get-Date -Format 'yyyyMMdd-HHmm').dump"
```

### C. Database Restoration Procedure
In the event of accidental dish deletions or emergency restoration:
```powershell
pg_restore -d "<DATABASE_PUBLIC_URL>" --clean --no-owner "backup-restaurant-20261113-1400.dump"
```

---

## 3. Upstream Git Maintenance & Multi-Client Synchronization Workflow

As a freelance developer, you maintain the core DigiNu product in a central repository (`Ansh0308/DigiNu`), while each paying restaurant client has their own independent deployment.

```
+-----------------------------------------------------------------------------------------+
|                              UPSTREAM GIT SYNC WORKFLOW                                 |
+-----------------------------------------------------------------------------------------+
|  [Core Upstream Repo: Ansh0308/DigiNu] (You develop core bug fixes & new features here)  |
|                                    │                                                    |
|           ┌────────────────────────┼────────────────────────┐                           |
|           ▼                        ▼                        ▼                           |
|  [Client 1: Red Apple]   [Client 2: Bistro Lumière]  [Client 3: Spice Garden]            |
|  (Independent Branch/Repo)(Independent Branch/Repo)(Independent Branch/Repo)           |
+-----------------------------------------------------------------------------------------+
```

### Step-by-Step Core Update Rollout to a Client:

When you patch a bug or release a feature in the core DigiNu repository:

1. **Test & Verify in Core:**
   Confirm all 74 tests pass and build succeeds on `Ansh0308/DigiNu` `main`.
2. **Pull Updates into Client Working Copy:**
   ```powershell
   git remote add upstream https://github.com/Ansh0308/DigiNu.git
   git fetch upstream main
   git merge upstream/main
   ```
3. **Resolve Any Client-Specific Conflicts:**
   Client database data and image assets live in their isolated database and ImageKit folder, so code updates merge cleanly without data risk.
4. **Push to Client's Deployment Branch:**
   ```powershell
   git push origin main
   ```
   Railway will automatically build and deploy the update with zero downtime.

---

## 4. Production Monitoring & Health Checks

- **Application Health Endpoint:** `GET /api/public/menu` acts as a fast uptime check for uptime monitoring tools (e.g. UptimeRobot, BetterStack, StatusCake).
- **Log Inspection:** Access real-time production stdout/stderr in Railway dashboard -> Web Service -> **Deployments** -> **View Logs**.
- **Memory & CPU Monitoring:** Railway dashboard provides real-time graphs for RAM and CPU utilization. Set an alert threshold if RAM exceeds 80% (400MB).

