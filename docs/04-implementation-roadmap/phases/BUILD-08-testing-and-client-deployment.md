# BUILD-08: Testing, Security Audit & Client Deployment Workflow

**Phase ID:** BUILD-08  
**Phase Name:** Comprehensive Testing, Security Audit & Repeatable Client Deployment Workflow  
**Status:** IN PROGRESS — Deployment Guides Created, Guided Deployment Initiated  
**Effort Estimate:** Medium (3–4 days)  
**Depends On:** BUILD-05, BUILD-06, BUILD-07 (All functional capabilities complete)  
**Next Phase:** Production Release & Commercial Onboarding of Restaurant 1  

---

## A. Phase Overview

| Field | Detail |
|:---|:---|
| **Phase ID** | BUILD-08 |
| **Objective** | Execute comprehensive automated testing (Vitest unit/integration tests and Playwright end-to-end scenarios), perform an exhaustive security and data isolation audit, achieve Lighthouse performance and WCAG 2.2 AA targets, and document the automated, repeatable independent client onboarding and upstream maintenance workflow. |
| **Business Value** | Hardens the software into a robust, commercially reliable product that a solo freelance developer can confidently deploy to paying restaurant clients without ongoing maintenance emergencies, security breaches, or performance regressions. |
| **Scope** | Vitest test suite; Playwright E2E test suite; security vulnerability audit; Lighthouse performance optimization; client onboarding runbook (`scripts/onboard-client.sh` or `.ps1`); Railway/Coolify production deployment guide; upstream Git synchronization procedure. |
| **Prerequisites** | All functional phases (BUILD-01 through BUILD-07) complete; running local application. |
| **Dependencies** | BUILD-01 through BUILD-07 |

---

## B. Source Documentation

1. `e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md`
2. `e:\Freelance\DigiNu\docs\01-product-definition\05-mvp-and-quality-requirements.md` — Section 3 (Quality & NFRs)
3. `e:\Freelance\DigiNu\docs\02-technical-architecture\05-security-and-deployment.md` — Security and Hosting Strategy
4. `e:\Freelance\DigiNu\docs\02-technical-architecture\06-environments-repository-and-git-plan.md` — Onboarding & Upstream Git Plan
5. `e:\Freelance\DigiNu\docs\03-design-system\11-accessibility-design-checklist.md` — WCAG 2.2 AA Audit
6. `e:\Freelance\DigiNu\docs\03-design-system\14-design-qa-and-handoff-checklist.md` — Design QA Criteria
7. All 5 global SKILL.md files; All 5 project-local SKILL.md files

---

## C. Features Included

- Setup Vitest test runner with React Testing Library and MSW (Mock Service Worker)
- Author unit and integration tests:
  - `src/lib/hours-calculator.test.ts` (boundary conditions: overnight hours, closed days, current open status)
  - `src/lib/prompt-synthesizer.test.ts` (culinary prompt formatting, dietary clauses, negative prompts)
  - `src/lib/sanitizer.test.ts` (verifies complete omission of owner passwords, emails, and draft items)
  - `src/app/api/public/menu/route.test.ts` (caching headers, sanitized payloads, 405 on POST)
  - `src/app/api/admin/items/route.test.ts` (auth enforcement, Zod validation, availability toggling)
  - `src/app/api/admin/ai/route.test.ts` (credit balance checks, 402 on zero balance, atomic transaction)
- Setup Playwright E2E browser test runner
- Author end-to-end user journey tests:
  - `e2e/diner-browse-menu.spec.ts` (loads menu, navigates categories, filters by Vegetarian, opens dish bottom sheet)
  - `e2e/owner-menu-crud.spec.ts` (owner logs in, creates a dish, toggles sold-out 86 status, verifies public menu reflects change)
  - `e2e/qr-code-export.spec.ts` (owner opens QR studio, verifies preview, triggers SVG and PNG downloads)
- Security audit & hardening:
  - Verify session cookies: `HttpOnly`, `SameSite=Lax`, `Secure` (in production)
  - Verify CSRF protection on mutation routes
  - Inspect client JavaScript bundle using `@next/bundle-analyzer` to ensure `CLOUDFLARE_API_TOKEN` and `IMAGEKIT_PRIVATE_KEY` are 100% absent
  - Verify rate limiting on authentication routes (max 5 failed attempts per IP per 15 minutes)
- Performance and Accessibility verification:
  - Execute Lighthouse CI: verify Performance score ≥ 90, FCP < 1.2s, LCP < 1.5s, CLS = 0.00
  - Execute automated accessibility audit via `@axe-core/playwright`: 0 critical or serious violations
- Production deployment automation:
  - Create client onboarding script `scripts/onboard-new-restaurant.ps1`
  - Document deployment guide for Railway/Render PaaS and Coolify self-hosted VPS
  - Document upstream Git synchronization workflow for rolling core bug fixes to independent client repos

---

## D. Features Explicitly Excluded

- **NO complex Kubernetes or Docker Swarm orchestration**
- **NO distributed tracing or enterprise APM tools (Datadog, New Relic)**
- **NO automated billing or Stripe webhook verification (deferred to Version 2)**
- **NO multi-tenant cross-database analytics**

---

## E. Database Changes

No schema modifications. Verify that `prisma migrate deploy` executes cleanly on an empty database and `prisma db seed` creates all necessary initial records.

---

## F. API and Backend Requirements

- Verify all 12 operational API routes respond with standardized status codes and envelopes.
- Verify that every route under `/api/admin/*` strictly rejects unauthenticated requests with `401 Unauthorized`.
- Verify that invalid payloads return `400 Bad Request` with structured Zod error messages.

---

## G. UI/UX Requirements

- Full visual audit across mobile (360px, 390px, 430px), tablet (768px), and desktop (1024px+) viewports.
- Confirm all 16 atomic components from Phase 03 match token values and exhibit correct hover/focus/active states.
- Confirm reduced-motion media query disables animations across all components.

---

## H. Step-by-Step Execution Plan

1. Install Vitest, `@testing-library/react`, `@testing-library/jest-dom`, and MSW:
   ```bash
   npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom msw
   ```
2. Configure `vitest.config.ts` and author all unit/integration tests for libraries and API routes.
3. Install Playwright:
   ```bash
   npm install -D @playwright/test @axe-core/playwright
   npx playwright install --with-deps chromium
   ```
4. Author Playwright test suites covering diner browsing and owner management journeys.
5. Run `@next/bundle-analyzer` to verify zero secret leakage into client-side chunks.
6. Run Lighthouse CI on public menu page; optimize any identified image or asset bottlenecks.
7. Run axe-core accessibility tests; remediate any focus or contrast deficiencies.
8. Create `scripts/onboard-new-restaurant.ps1` automating:
   - Environment variable templating
   - Prisma migration execution (`npx prisma migrate deploy`)
   - Initial database seeding (`npx prisma db seed`)
   - ImageKit client folder provisioning
9. Perform a complete dry-run deployment to a fresh Railway/Render PostgreSQL database and app container.
10. Finalize the developer handoff checklist and verify project readiness.

---

## I. Global Skill Usage

| Skill | Application in BUILD-08 |
|:---|:---|
| **`code-review`** | Comprehensive security and quality review of the entire codebase: check for N+1 queries in Prisma calls, verify transaction boundaries, ensure no secrets leaked in client bundles, and review error handling. |
| **`accessibility-review`** | Execute automated axe-core scans and conduct manual keyboard traversal audits across all customer and admin screens. |
| **`documentation-spec-writing`** | Author the complete production deployment guide, client onboarding runbook, and upstream maintenance manual. |
| **`ui-ux-pro-max`** | Run `python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "production readiness checklist" --domain ux`. Audit UX polish and state transitions. |
| **`frontend-design`** | Perform final visual QA to ensure typography, spacing, and micro-interactions adhere strictly to the Modern Editorial Dining aesthetic. |

---

## J. Testing Requirements

* **Unit Test Suite:** 100% pass rate across all utility functions and calculation engines.
* **API Integration Suite:** All 12 API routes tested with both valid and invalid payloads.
* **E2E Playwright Suite:** Diner journey, Owner menu CRUD, and QR code export scenarios pass green in headless Chromium.
* **Accessibility Suite:** Zero violations reported by `@axe-core/playwright`.

---

## K. Security and Quality Checks

- Session Cookie Security: `HttpOnly`, `SameSite=Lax`, `Secure` verified.
- Secret Leakage Check: `git grep -i "token\|secret\|key"` confirms zero hardcoded credentials.
- SQL Injection Defense: 100% of database queries use Prisma parameterized inputs.
- Cross-Site Scripting (XSS): All user-entered menu strings sanitized before DOM rendering.

---

## L. Documentation Updates

- Update `docs/PROJECT_CONTEXT_INDEX.md` marking BUILD-08 and Phase 04 complete.
- Update `README.md` with production deployment badges and quick-start instructions.

---

## M. Acceptance Criteria

```gherkin
Scenario: Automated test suite execution
  Given the developer executes `npm test` and `npx playwright test`
  When all test runners complete
  Then 100% of unit, integration, and E2E test cases pass without errors
  And the axe-core accessibility scan reports 0 violations

Scenario: Fresh client database onboarding dry-run
  Given a new, completely empty PostgreSQL database
  When the developer runs `scripts/onboard-new-restaurant.ps1`
  Then all 8 Prisma tables are created cleanly without errors
  And the seed script creates the restaurant profile, owner login, default hours, and starter menu
  And logging in with the seeded credentials immediately opens the populated dashboard
```

---

## N. Definition of Done

- [ ] Vitest unit and integration test suite complete and passing.
- [ ] Playwright E2E browser tests passing for all primary user journeys.
- [ ] Security audit completed; zero secrets in client bundles; session cookies hardened.
- [ ] Lighthouse Mobile score ≥ 90 (Performance, Accessibility, Best Practices, SEO).
- [ ] Client onboarding automation script tested on a fresh PostgreSQL instance.
- [ ] Production deployment documentation verified and complete.
- [ ] Zero unapproved features (cart, ordering, POS, ERP) introduced.

---

## O. Review and Approval Gate

Deliver the full test reports, security audit log, Lighthouse audit scores, and client onboarding runbook to the developer for final commercial deployment sign-off.

---

## P. Complete AI IDE Execution Prompt

```markdown
You are acting as a Senior DevOps Engineer, QA Lead, and Full-Stack Architect implementing BUILD-08 of DigiNu — Reusable QR-Based Digital Restaurant Menu Platform.

## BEFORE YOU CODE:
1. Read `e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md`
2. Read all 5 global SKILL.md files in `%USERPROFILE%\.gemini\config\skills\`
3. Read all 5 project-local SKILL.md files in `e:\Freelance\DigiNu\.agents\skills\`
4. Read `e:\Freelance\DigiNu\docs\04-implementation-roadmap\phases\BUILD-08-testing-security-audit-and-deployment.md`
5. Read `e:\Freelance\DigiNu\docs\02-technical-architecture\05-security-and-deployment.md`
6. Read `e:\Freelance\DigiNu\docs\02-technical-architecture\06-environments-repository-and-git-plan.md`

## STRICT ARCHITECTURAL & SCOPE RULES:
- INDEPENDENT DEPLOYMENTS: The client onboarding workflow must automate provisioning an independent database and app container for each client.
- ZERO CODE POLLUTION: Do NOT introduce third-party analytics trackers, ordering, checkout, or cart functionality during testing.
- SECRETS HYGIENE: Verify that `CLOUDFLARE_API_TOKEN` and `IMAGEKIT_PRIVATE_KEY` NEVER leak into client-side bundles.

## IMPLEMENTATION STEPS:
1. Install testing packages:
   ```bash
   npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom msw @playwright/test @axe-core/playwright
   npx playwright install --with-deps chromium
   ```
2. Configure `vitest.config.ts` and write unit/integration tests:
   - `src/lib/hours-calculator.test.ts`
   - `src/lib/prompt-synthesizer.test.ts`
   - `src/lib/sanitizer.test.ts`
   - Route tests for `/api/public/menu`, `/api/admin/items`, and `/api/admin/ai/generate`.
3. Configure `playwright.config.ts` and write E2E test scenarios:
   - `e2e/diner-journey.spec.ts`: public menu load, category scroll, dietary filter, dish detail modal.
   - `e2e/owner-journey.spec.ts`: owner login, create dish, toggle sold-out (86), verify change on public menu.
   - `e2e/qr-export.spec.ts`: download SVG and PNG QR codes.
4. Execute security hardening audit:
   - Check NextAuth session cookie attributes (`HttpOnly`, `SameSite=Lax`, `Secure`).
   - Run `@next/bundle-analyzer` to verify zero server-side environment variables in client chunks.
   - Verify rate limiting on authentication routes.
5. Execute accessibility audit:
   - Run `@axe-core/playwright` across public and admin routes; remediate any violations.
6. Create `scripts/onboard-new-restaurant.ps1` (and `.sh` equivalent):
   - Automates `.env` generation from `.env.example`.
   - Runs `npx prisma migrate deploy`.
   - Runs `npx prisma db seed` with custom client parameters.
7. Document the production deployment guide for Railway/Render and Coolify VPS in `docs/04-implementation-roadmap/03-engineering-workflow-and-quality-gates.md`.

## APPLY ALL 5 GLOBAL SKILLS:
- `code-review`: Execute comprehensive code review across all source files; check for memory leaks, N+1 Prisma queries, and error propagation.
- `accessibility-review`: Audit public dining and admin screens against WCAG 2.2 AA.
- `documentation-spec-writing`: Draft the client onboarding runbook and upstream sync guide.
- `ui-ux-pro-max`: Run `python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "performance optimization webp" --domain ux`. Verify image loading and responsive layout stability.
- `frontend-design`: Final aesthetic check ensuring consistent editorial typography and styling.

## VERIFICATION:
```bash
npm test                # All Vitest tests pass
npx playwright test     # All E2E scenarios pass
npm run build           # Production build completes with zero errors
```

## STOP CONDITION:
After all tests pass, security checks are verified, and onboarding scripts are tested, STOP. Present the final readiness report to the developer. The DigiNu platform is now ready for commercial release.
```
