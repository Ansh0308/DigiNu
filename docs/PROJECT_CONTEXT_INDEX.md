# DigiNu — Project Context & Documentation Index

**Last Updated:** November 2026  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform with AI Culinary Studio  
**Approved Architecture Model:** **Option B — Independent Deployments using One Reusable Codebase**  
**Approved Phases:**  
- Phase 00 — Product Discovery: `APPROVED BY FREELANCER`  
- Phase 01 — Product Requirements Document (PRD): `APPROVED BY FREELANCER`  
- Phase 02 — Technical Architecture & Data Model: `APPROVED BY FREELANCER`  
- Phase 03 — Premium UI/UX Design, Branding & Design System: `APPROVED BY FREELANCER`
**Current Phase:** Phase 04 — Implementation Roadmap & Execution  
- BUILD-01: `COMPLETE — APPROVED BY FREELANCER`  
- BUILD-02: `COMPLETE — APPROVED BY FREELANCER`  
- BUILD-03: `COMPLETE — APPROVED BY FREELANCER`  
- BUILD-04: `COMPLETE — APPROVED BY FREELANCER`  
- BUILD-05: `COMPLETE — APPROVED BY FREELANCER`  
- BUILD-06: `COMPLETE — APPROVED BY FREELANCER`  
- BUILD-07: `COMPLETE — APPROVED BY FREELANCER`  
- BUILD-08: `IN PROGRESS — Production Readiness & Client Deployment Guided Workflow`

---

### Phase 08: Production Deployment & Maintenance (`docs/08-deployment/`)
* [01-production-readiness-audit.md](file:///e:/Freelance/DigiNu/docs/08-deployment/01-production-readiness-audit.md) — Pre-deployment code audit, type safety, linting, and build verification.
* [02-hosting-provider-comparison.md](file:///e:/Freelance/DigiNu/docs/08-deployment/02-hosting-provider-comparison.md) — Comparative evaluation of Railway vs Render vs Coolify VPS.
* [03-production-deployment-runbook.md](file:///e:/Freelance/DigiNu/docs/08-deployment/03-production-deployment-runbook.md) — Step-by-step beginner-friendly production deployment runbook.
* [04-environment-variables-checklist.md](file:///e:/Freelance/DigiNu/docs/08-deployment/04-environment-variables-checklist.md) — Complete environment variable reference and pre-flight validation.
* [05-production-smoke-test-checklist.md](file:///e:/Freelance/DigiNu/docs/08-deployment/05-production-smoke-test-checklist.md) — 17-point production smoke test and acceptance protocol.
* [06-security-and-maintenance-guide.md](file:///e:/Freelance/DigiNu/docs/08-deployment/06-security-and-maintenance-guide.md) — Security threat defense, pg_dump backup procedures, and upstream Git sync.

---

> [!IMPORTANT]
> **INSTRUCTION FOR FUTURE AI CODING ASSISTANTS & IDE SESSIONS:**  
> Before making changes or beginning any implementation, **always read this index and the approved phase documents below**. Treat Phase 00 (Discovery) and Phase 01 (PRD) as the approved commercial and functional baseline.  
> **ARCHITECTURAL MANDATE:** We are **NOT** building a multi-tenant SaaS application. We maintain **one central reusable codebase** with **independent application and database deployments per restaurant**. The AI food image studio generates **1 image per generation request**. Do not invent out-of-scope features (no online ordering, no cart, no payments, no POS/ERP). Strictly adhere to the single-tenant architecture, data models, and API contracts defined in Phase 02.

---

## 📚 Complete Project Documentation Catalog

### Phase 00: Product Discovery & Strategy (`docs/00-discovery/`)
* [00-product-context.md](file:///e:/Freelance/DigiNu/docs/00-discovery/00-product-context.md) — Product vision, business model, target customers, and strict scope boundaries.
* [01-product-model-and-tenant-strategy.md](file:///e:/Freelance/DigiNu/docs/00-discovery/01-product-model-and-tenant-strategy.md) — Independent deployment vs multi-tenancy trade-off analysis.
* [02-public-digital-menu.md](file:///e:/Freelance/DigiNu/docs/00-discovery/02-public-digital-menu.md) — Customer menu mobile UX, QR entry, category tabs, and search.
* [03-owner-dashboard-and-menu-management.md](file:///e:/Freelance/DigiNu/docs/00-discovery/03-owner-dashboard-and-menu-management.md) — Admin dashboard modules, category/dish CRUD, availability toggle, and QR studio.
* [04-ai-image-generation.md](file:///e:/Freelance/DigiNu/docs/00-discovery/04-ai-image-generation.md) — AI culinary workflow, prompt synthesis, and cost safeguards.
* [05-security-and-privacy.md](file:///e:/Freelance/DigiNu/docs/00-discovery/05-security-and-privacy.md) — Public/private security boundaries, auth, upload sanitization, and diner privacy.
* [06-design-and-branding-requirements.md](file:///e:/Freelance/DigiNu/docs/00-discovery/06-design-and-branding-requirements.md) — Dual design system, white-label theming, and accessibility.
* [07-mvp-and-product-roadmap.md](file:///e:/Freelance/DigiNu/docs/00-discovery/07-mvp-and-product-roadmap.md) — MVP specifications, Version 2 roadmap, and dependency graph.
* [08-open-questions-and-decisions.md](file:///e:/Freelance/DigiNu/docs/00-discovery/08-open-questions-and-decisions.md) — Architectural decisions log, assumptions, and stakeholder questions.
* [09-discovery-readiness.md](file:///e:/Freelance/DigiNu/docs/00-discovery/09-discovery-readiness.md) — Discovery gate check and readiness score (`GREEN`).

---

### Phase 01: Product Definition & PRD (`docs/01-product-definition/`)
* [01-product-requirements-document.md](file:///e:/Freelance/DigiNu/docs/01-product-definition/01-product-requirements-document.md) — Master PRD (`FR-MENU`, `FR-AUTH`, `FR-PROF`, `FR-CAT`, `FR-ITEM`, `FR-AI`, `FR-QR`, `FR-REUSE`, `FR-SEC`).
* [02-user-stories-and-acceptance-criteria.md](file:///e:/Freelance/DigiNu/docs/01-product-definition/02-user-stories-and-acceptance-criteria.md) — BDD `Given / When / Then` acceptance criteria for customer and owner journeys.
* [03-sitemap-and-user-flows.md](file:///e:/Freelance/DigiNu/docs/01-product-definition/03-sitemap-and-user-flows.md) — Navigation sitemap and 4 core Mermaid sequence flows.
* [04-low-fidelity-wireframes.md](file:///e:/Freelance/DigiNu/docs/01-product-definition/04-low-fidelity-wireframes.md) — Structural ASCII wireframes for mobile menu and admin dashboard.
* [05-mvp-and-quality-requirements.md](file:///e:/Freelance/DigiNu/docs/01-product-definition/05-mvp-and-quality-requirements.md) — MVP classification and Non-Functional Quality Requirements (NFRs).
* [06-open-decisions-and-requirements-checklist.md](file:///e:/Freelance/DigiNu/docs/01-product-definition/06-open-decisions-and-requirements-checklist.md) — Requirements Traceability Matrix (RTM) and open decisions log.

---

### Phase 02: Technical Architecture & Data Model (`docs/02-technical-architecture/`)
* [01-technology-stack-decisions.md](file:///e:/Freelance/DigiNu/docs/02-technical-architecture/01-technology-stack-decisions.md) — Independent deployment stack matrix, hosting comparison, ImageKit strategy, and 1-image AI workflow.
* [02-system-architecture.md](file:///e:/Freelance/DigiNu/docs/02-technical-architecture/02-system-architecture.md) — Independent deployment architecture, component diagrams, Edge CDN caching, and workflow diagrams.
* [03-data-model-and-erd.md](file:///e:/Freelance/DigiNu/docs/02-technical-architecture/03-data-model-and-erd.md) — PostgreSQL conceptual ERD in Mermaid, data dictionary, indexes, and single-restaurant schema.
* [04-api-and-integration-contracts.md](file:///e:/Freelance/DigiNu/docs/02-technical-architecture/04-api-and-integration-contracts.md) — REST API contracts, Zod schemas, error envelopes, and 4 sequence diagrams.
* [05-security-and-deployment.md](file:///e:/Freelance/DigiNu/docs/02-technical-architecture/05-security-and-deployment.md) — Physical isolation threat model, session cookies, upload security, and PaaS/VPS hosting.
* [06-environments-repository-and-git-plan.md](file:///e:/Freelance/DigiNu/docs/02-technical-architecture/06-environments-repository-and-git-plan.md) — Project directory layout, `.env.example`, client onboarding guide, and upstream git sync workflow.
* [07-implementation-roadmap-and-traceability.md](file:///e:/Freelance/DigiNu/docs/02-technical-architecture/07-implementation-roadmap-and-traceability.md) — 9 sequenced implementation milestones and full end-to-end RTM.
* [08-risks-and-open-decisions.md](file:///e:/Freelance/DigiNu/docs/02-technical-architecture/08-risks-and-open-decisions.md) — Hosting cost models (1, 5, 10 venues), ImageKit/AI limits, and decisions log.
* [09-phase-02-approval-checklist.md](file:///e:/Freelance/DigiNu/docs/02-technical-architecture/09-phase-02-approval-checklist.md) — Formal Phase 02 approval checklist.
* [10-adr-002-nextjs16-prisma7-stack-reconciliation.md](file:///e:/Freelance/DigiNu/docs/02-technical-architecture/10-adr-002-nextjs16-prisma7-stack-reconciliation.md) — ADR-002: Upgrade Baseline to Next.js 16 Active LTS and Prisma 7 Stable (`APPROVED BY FREELANCER`).

---

### Phase 03: UI/UX Design, Branding & Design System (`docs/03-design-system/`)
* [00-phase-03-overview.md](file:///e:/Freelance/DigiNu/docs/03-design-system/00-phase-03-overview.md) — Design mission, goals, and dual-interface visual governance.
* [01-design-context-readback.md](file:///e:/Freelance/DigiNu/docs/03-design-system/01-design-context-readback.md) — Synthesis of previous phases, screen mappings, and scope boundaries.
* [02-brand-audit-and-visual-direction.md](file:///e:/Freelance/DigiNu/docs/03-design-system/02-brand-audit-and-visual-direction.md) — 3 visual directions (Modern Editorial proposed as default).
* [03-digital-brand-guidelines.md](file:///e:/Freelance/DigiNu/docs/03-design-system/03-digital-brand-guidelines.md) — Master brand identity and white-label customization system.
* [04-design-tokens.json](file:///e:/Freelance/DigiNu/docs/03-design-system/04-design-tokens.json) — Valid semantic design tokens (Color, Typography, Spacing, Motion).
* [05-typography-and-content-style.md](file:///e:/Freelance/DigiNu/docs/03-design-system/05-typography-and-content-style.md) — Modular type scale, font pairings, and culinary copywriting rules.
* [06-layout-grid-and-responsive-rules.md](file:///e:/Freelance/DigiNu/docs/03-design-system/06-layout-grid-and-responsive-rules.md) — Mobile-first viewport breakpoints (360px–1024px) and safe area insets.
* [07-component-library-specification.md](file:///e:/Freelance/DigiNu/docs/03-design-system/07-component-library-specification.md) — 16 atomic components with props, variants, and interactive states.
* [08-customer-screen-specifications.md](file:///e:/Freelance/DigiNu/docs/03-design-system/08-customer-screen-specifications.md) — 6 public menu screens (`SCR-CUST-01` to `SCR-CUST-06`).
* [09-admin-screen-specifications.md](file:///e:/Freelance/DigiNu/docs/03-design-system/09-admin-screen-specifications.md) — 9 owner dashboard screens (`SCR-ADMIN-01` to `SCR-ADMIN-09`).
* [10-interaction-and-motion-guidelines.md](file:///e:/Freelance/DigiNu/docs/03-design-system/10-interaction-and-motion-guidelines.md) — Choreographed motion workflows, spring physics, and reduced-motion rules.
* [11-accessibility-design-checklist.md](file:///e:/Freelance/DigiNu/docs/03-design-system/11-accessibility-design-checklist.md) — WCAG 2.2 AA design checklist (contrast >= 4.5:1, touch targets >= 44px).
* [12-imagery-and-asset-guidelines.md](file:///e:/Freelance/DigiNu/docs/03-design-system/12-imagery-and-asset-guidelines.md) — ImageKit transformation queries and AI prompt synthesis formulas.
* [13-prototype-and-usability-review.md](file:///e:/Freelance/DigiNu/docs/03-design-system/13-prototype-and-usability-review.md) — Heuristic review (NN/g 10 principles) and interactive HTML artifact.
* [14-design-qa-and-handoff-checklist.md](file:///e:/Freelance/DigiNu/docs/03-design-system/14-design-qa-and-handoff-checklist.md) — Engineering handoff criteria and Tailwind config mappings.
* [15-design-decisions-and-skill-register.md](file:///e:/Freelance/DigiNu/docs/03-design-system/15-design-decisions-and-skill-register.md) — Design decisions register and IDE tooling log.
* [16-design-open-questions-and-change-requests.md](file:///e:/Freelance/DigiNu/docs/03-design-system/16-design-open-questions-and-change-requests.md) — Open questions log and AI variation conflict change request.
* [17-phase-03-approval-checklist.md](file:///e:/Freelance/DigiNu/docs/03-design-system/17-phase-03-approval-checklist.md) — Formal Phase 03 design approval checklist.

---

### Phase 04: Implementation Planning & Execution Pack (`docs/04-implementation-roadmap/`)
* [00-master-implementation-roadmap.md](file:///e:/Freelance/DigiNu/docs/04-implementation-roadmap/00-master-implementation-roadmap.md) — Master roadmap: 8 BUILD phases with Mermaid dependency graph, effort estimates, and phase-level definitions of done.
* [01-readiness-and-feature-inventory.md](file:///e:/Freelance/DigiNu/docs/04-implementation-roadmap/01-readiness-and-feature-inventory.md) — Implementation readiness audit, complete feature inventory, external credentials required, and change decision record.
* [02-dependency-and-traceability-matrix.md](file:///e:/Freelance/DigiNu/docs/04-implementation-roadmap/02-dependency-and-traceability-matrix.md) — Full RTM: PRD → User Story → Screen → Entity → API → Phase → Test → Acceptance Gate.
* [03-engineering-workflow-and-quality-gates.md](file:///e:/Freelance/DigiNu/docs/04-implementation-roadmap/03-engineering-workflow-and-quality-gates.md) — Before/during/after coding checklists, git workflow rules, and phase transition quality gates.
* [04-phase-04-approval-checklist.md](file:///e:/Freelance/DigiNu/docs/04-implementation-roadmap/04-phase-04-approval-checklist.md) — Phase 04 completion checklist and readiness status.
* **Phase Execution Documents (`phases/`):**
  * [BUILD-01-project-foundation-and-design-system.md](file:///e:/Freelance/DigiNu/docs/04-implementation-roadmap/phases/BUILD-01-project-foundation-and-design-system.md) — ✅ APPROVED
  * [BUILD-02-database-schema-prisma-and-owner-auth.md](file:///e:/Freelance/DigiNu/docs/04-implementation-roadmap/phases/BUILD-02-database-schema-prisma-and-owner-auth.md) — ✅ APPROVED
  * [BUILD-03-restaurant-profile-and-menu-management.md](file:///e:/Freelance/DigiNu/docs/04-implementation-roadmap/phases/BUILD-03-restaurant-profile-and-menu-management.md) — ✅ APPROVED
  * [BUILD-04-imagekit-media-pipeline.md](file:///e:/Freelance/DigiNu/docs/04-implementation-roadmap/phases/BUILD-04-imagekit-media-pipeline.md) — 🟢 COMPLETE (Live integration verified server-side)
  * [BUILD-05-ai-food-image-generation.md](file:///e:/Freelance/DigiNu/docs/04-implementation-roadmap/phases/BUILD-05-ai-food-image-generation.md) — 🟢 COMPLETE (FLUX.1-schnell inference, candidate hash binding, credit lifecycle verified)
  * [BUILD-06-public-customer-menu-mobile-first.md](file:///e:/Freelance/DigiNu/docs/04-implementation-roadmap/phases/BUILD-06-public-customer-menu-mobile-first.md) — 🟢 COMPLETE (Quality Gates Verified, Awaiting User Review)
  * [BUILD-07-qr-code-generation-and-print-studio.md](file:///e:/Freelance/DigiNu/docs/04-implementation-roadmap/phases/BUILD-07-qr-code-generation-and-print-studio.md) — ⏳ PENDING
  * [BUILD-08-testing-security-audit-and-deployment.md](file:///e:/Freelance/DigiNu/docs/04-implementation-roadmap/phases/BUILD-08-testing-security-audit-and-deployment.md) — ⏳ PENDING

---



* **WHAT WE ARE BUILDING:** A high-speed, mobile-first browsable digital menu for restaurant diners and a private authenticated menu-management dashboard for restaurant owners, featuring ImageKit media storage, vector table QR code generation, and AI-powered food photography (1 high-resolution image per generation).
* **WHAT WE ARE NOT BUILDING:** No shopping carts, no checkout, no payment gateways, no online ordering, no kitchen tickets (KOT/KDS), no POS/ERP integrations, no raw inventory tracking, and no customer login accounts. Diners place their orders verbally with waitstaff.
