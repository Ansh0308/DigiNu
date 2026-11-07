# Phase 03 Design System & UI/UX Overview — DigiNu

**Document Version:** 1.0  
**Phase:** 03 — UI/UX Design, Branding & Design System  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  
**Design Lead:** Senior Product Designer & Design Systems Architect  

---

## 1. Executive Summary & Design Mission

Phase 03 transforms the approved product requirements (Phase 01 PRD) and single-restaurant technical architecture (Phase 02 Independent Deployments) into a **world-class, visually impressive, animation-rich, mobile-first design system**.

DigiNu is not a generic, static menu template. It is engineered as a **commercial flagship product** that freelance developers can proudly demonstrate to restaurant owners and that diners will love using at their tables.

```
+-----------------------------------------------------------------------------------------+
|                                DIGINU DESIGN PHILOSOPHY                                 |
+-----------------------------------------------------------------------------------------+
| A. Public Customer Menu                   | B. Private Owner Dashboard                  |
| - Mobile-First Smartphone Ergonomics      | - Polished Modern SaaS Studio               |
| - Appetite-Forward Visual Storytelling    | - Zero-Learning-Curve Operational Ergonomics|
| - Tactile, Purposeful Motion Design       | - Real-Time Visual Feedback & Micro-States  |
| - White-Label Theme Adaptability          | - AI Culinary Studio Signature Experience   |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Core Design Objectives

1. **Appetite-Centric Visuals:** Generous, high-resolution food photography, micro-textures, and elegant framing that stimulates diner appetite and elevates perceived culinary value.
2. **Purposeful Motion & Tactile Physics:** Motion is treated as a first-class UX affordance, not mere decoration. Every screen entrance, category jump, card hover, modal expansion, and toggle uses calibrated spring physics and staggered timings.
3. **White-Label Customization Engine:** A clean separation between DigiNu's stable global design tokens (spacing, geometry, elevation, motion) and restaurant-configurable branding tokens (primary/accent colors, theme presets, typography pairings, logo, banner).
4. **Zero-Friction Mobile Accessibility (WCAG 2.2 AA Target):** Touch targets >= 44x44px, minimum contrast ratios >= 4.5:1, screen-reader semantic trees, and comprehensive `prefers-reduced-motion` fallbacks.
5. **Strict Scope Integrity:** The customer experience remains strictly read-only (browsing, dietary/allergen inspection, live search, 86 availability awareness). No carts, checkouts, or ordering mechanics are introduced.

---

## 3. Upstream Alignment & Conflict Resolution

### 3.1 Architecture Confirmation
Phase 03 strictly reflects the approved **Independent Deployments** architecture:
* Every client deployment has its own dedicated application container and isolated PostgreSQL database.
* The customer interface is served at the restaurant's primary domain (e.g. `bella-italia.com`), while the admin dashboard lives at `/admin`.
* All multi-tenant routing, RLS policies, and super-admin concepts have been purged from the design specs.

### 3.2 AI Image Variations Conflict Flag `[TO CONFIRM]`
* **Upstream Conflict Identified:** Phase 01 PRD specified generating 4–5 AI variations, whereas Phase 02 Technical Architecture revised the baseline to **1 high-resolution image per generation** (~250 Neurons) to economize cloud quota and drop latency to 3–4 seconds.
* **Phase 03 Design Solution:** The AI Culinary Studio UI is designed **flexibly**. The primary interface focuses on presenting 1 high-resolution preview with instant **"Approve & Apply"** and **"Regenerate"** actions, while maintaining responsive grid layout capability to support 4 variations if the client upgrades or opts for batch generation.

---

## 4. Phase 03 Documentation Index

This design package is organized into 18 specialized specifications under `docs/03-design-system/`:

1. `00-phase-03-overview.md` — Scope, goals, and design governance.
2. `01-design-context-readback.md` — Complete readback of previous phases, constraints, and screen mappings.
3. `02-brand-audit-and-visual-direction.md` — Visual audit and 3 differentiated design concepts.
4. `03-digital-brand-guidelines.md` — Master brand identity and white-label customization system.
5. `04-design-tokens.json` — Machine-readable semantic design tokens (Color, Type, Space, Motion).
6. `05-typography-and-content-style.md` — Typographic scale, font pairings, and content guidelines.
7. `06-layout-grid-and-responsive-rules.md` — Breakpoints, viewport grids, and container behaviors.
8. `07-component-library-specification.md` — Component specifications, props, states, and variants.
9. `08-customer-screen-specifications.md` — Public customer menu screens, states, and edge cases.
10. `09-admin-screen-specifications.md` — Owner dashboard screens, states, and workflows.
11. `10-interaction-and-motion-guidelines.md` — Choreographed motion tokens, easings, and reduced-motion rules.
12. `11-accessibility-design-checklist.md` — WCAG 2.2 AA contrast, touch targets, and ARIA labels.
13. `12-imagery-and-asset-guidelines.md` — ImageKit transformations, aspect ratios, and AI food photography prompts.
14. `13-prototype-and-usability-review.md` — Visual layout mockups and heuristic design review.
15. `14-design-qa-and-handoff-checklist.md` — Quality assurance criteria for engineering handoff.
16. `15-design-decisions-and-skill-register.md` — Registered design decisions and IDE design tools used.
17. `16-design-open-questions-and-change-requests.md` — Open questions log and formal change requests.
18. `17-phase-03-approval-checklist.md` — Formal Phase 03 completion checklist.

