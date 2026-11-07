# Design QA & Developer Handoff Checklist — DigiNu

**Document Version:** 1.0  
**Phase:** 03 — UI/UX Design, Branding & Design System  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Developer Handoff Architecture

To guarantee seamless translation from Phase 03 design specifications into Next.js React code:

* **Token Single-Source of Truth:** All design tokens defined in `04-design-tokens.json` directly map to `tailwind.config.ts` theme extensions and CSS variables in `src/app/globals.css`.
* **Zero Guesswork Components:** Every component in `07-component-library-specification.md` has defined TypeScript interfaces, variant props, and interactive states.
* **Asset Pipeline Alignment:** ImageKit transformation recipes (`?tr=w-400,h-400,f-webp`) are standardized across all image components.

---

## 2. Pre-Development QA Checklist

### 2.1 Design Token & Theming Parity
- [x] **Tailwind Config Mapping:** CSS variables (`--brand-primary`, `--canvas-bg`, `--surface-card`, `--text-primary`) are configured in Tailwind theme.
- [x] **Typography Scale:** Fluid font scale implemented with tabular numbers (`tabular-nums`) for price tags.
- [x] **Radius Consistency:** 12px card border radius (`rounded-xl`) and 8px button radius (`rounded-lg`) maintained across all components.

### 2.2 Component & Layout Verification
- [x] **Public Menu Read-Only Integrity:** 100% verified that zero shopping cart, checkout, or ordering components exist in the design specifications.
- [x] **Mobile-First Viewports:** Component layouts verified down to 360px width (iPhone SE) with zero horizontal overflow or clipping.
- [x] **Sticky Category Scroll-Spy:** Category nav bar offset accounts for safe-area insets (`scroll-margin-top: 64px`).
- [x] **1-Tap 86 Switch:** Availability switch has a minimum 44x44px touch bounding box for effortless mobile operation by restaurant staff.

### 2.3 Motion & Performance Guardrails
- [x] **GPU Acceleration:** All animation specifications exclusively animate `transform` and `opacity`.
- [x] **Reduced Motion Support:** `@media (prefers-reduced-motion: reduce)` rules disable all transforms and replace them with instantaneous opacity transitions.
- [x] **Image Load Performance:** Responsive WebP srcSets and shimmer placeholders prevent Cumulative Layout Shift (CLS = 0).

### 2.4 External Integration Handoff
- [x] **ImageKit Direct Upload:** Signed upload flow documented with HMAC-SHA1 parameters (`signature`, `token`, `expire`) scoped to `/restaurants/{slug}/dishes/`.
- [x] **Cloudflare AI Neural Studio:** 1-image generation workflow (~250 Neurons) documented with prompt synthesis directives and human approval mandate.
- [x] **Vector QR Studio:** SVG vector, 300 DPI PNG, and printable A6 PDF export formats specified.

