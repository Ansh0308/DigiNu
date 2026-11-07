---
name: diginu-test-and-review
description: "Quality assurance standards, testing workflows, security review checklists, and accessibility audit guidelines for DigiNu. Enforces Vitest, Playwright, axe-core WCAG 2.2 AA testing, and OWASP security practices."
---

# DigiNu Testing, Quality & Review Standards

This skill defines the testing tools, quality gates, and security audit checklists required before code changes are approved in the DigiNu codebase.

---

## 1. Testing Stack & Responsibilities

| Test Tier | Tooling | Focus Areas | Target Coverage |
|:---|:---|:---|:---:|
| **Unit Tests** | Vitest | Calculation utilities (`hours-calculator`), prompt synthesis, data sanitizers, Zod validation | > 90% logic coverage |
| **Integration Tests** | Vitest + MSW | API route handlers (`/api/public/menu`, `/api/admin/*`), Prisma mock interactions | All critical routes |
| **End-to-End (E2E)** | Playwright | Full diner browsing flow, owner login, menu CRUD, 86 availability toggle, QR export | Primary user journeys |
| **Accessibility (A11y)** | `@axe-core/playwright` | WCAG 2.2 Level AA compliance, contrast ratios, focus rings, keyboard navigation | 0 critical/major issues |
| **Performance** | Lighthouse CI | Mobile 4G loading speed, LCP < 1.5s, CLS = 0.00, FCP < 1.2s | Performance Score ≥ 90 |

---

## 2. Security Audit Checklist (OWASP)

Before completing any implementation phase, verify:

1. **Authentication Enforcement:**
   * Every endpoint under `/api/admin/*` must verify the session token via NextAuth.js.
   * Unauthenticated requests must terminate immediately with `401 Unauthorized`.
2. **Session Cookie Hardening:**
   * Cookies must have flags: `HttpOnly: true`, `SameSite: "lax"`, and `Secure: true` (in production).
3. **Secret Isolation:**
   * `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `IMAGEKIT_PRIVATE_KEY` must **NEVER** be prefixed with `NEXT_PUBLIC_`.
   * Verify using bundle analyzer that no server-side secrets exist in client JavaScript chunks.
4. **Input Sanitization & Injection Defense:**
   * 100% of mutation inputs must be validated by Zod schemas before touching database queries.
   * All database queries must use Prisma parameterized statements (zero raw string interpolation).
   * All user-provided menu descriptions and restaurant names must be sanitized to prevent stored XSS.
5. **Public Route Hygiene:**
   * Verify that `GET /api/public/menu` strips all owner email addresses, password hashes, and draft/inactive menu items.
   * Ensure zero diner cookies or tracking beacons are transmitted.

---

## 3. Accessibility Review Protocol (WCAG 2.2 AA)

1. **Contrast Ratios:**
   * Body text: minimum 4.5:1 against card/canvas background.
   * Large headers (≥ 18pt): minimum 3:1 contrast.
   * UI borders and active toggle states: minimum 3:1 contrast.
2. **Keyboard Navigation:**
   * Category pills and filter chips must be reachable and selectable via Tab and Enter/Space.
   * Bottom sheet drawer must trap focus while open and release focus to the triggering element on Escape.
3. **Screen Reader Semantics:**
   * Category navigation bar must use `role="tablist"` and `aria-selected="true/false"`.
   * Sold-out items must announce their unavailable status clearly via `aria-label`.
   * Form inputs must have persistent visible `<label>` elements (not placeholder-only).

---

## 4. Verification Commands

```bash
# Type check and lint
npx tsc --noEmit
npm run lint

# Run unit and integration tests
npm test

# Run E2E and accessibility tests
npx playwright test

# Production build check
npm run build
```

