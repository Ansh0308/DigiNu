# Design Open Questions & Change Requests Log — DigiNu

**Document Version:** 1.0  
**Phase:** 03 — UI/UX Design, Branding & Design System  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Upstream Conflict & Change Requests Log

| Change ID | Title | Upstream Conflict Description | Proposed Design Resolution | Status |
| :--- | :--- | :--- | :--- | :---: |
| **`CR-01`** | **AI Generation Batching Strategy** | Phase 01 PRD specified generating 4–5 variations per run. Phase 02 Technical Architecture revised the baseline to **1 image per run** (~250 Neurons) to reduce latency and protect free quota. | Design the AI Studio modal as **flexible**: default view showcases 1 high-res generated photo with instant "Approve & Apply" and "Regenerate" actions. If the stakeholder approves 4-variation batching, the modal expands to a 2x2 grid. | `[TO CONFIRM]` |
| **`CR-02`** | **Default Visual Direction Selection** | Three visual directions proposed (Modern Editorial, Contemporary Minimal, Premium Nocturne). | **Modern Editorial Dining (`warm-cream`)** is proposed as the out-of-the-box default baseline for DigiNu. Other directions remain selectable via the `theme_preset` database setting. | `[PROPOSED]` |
| **`CR-03`** | **Cover Hero Banner Requirement** | Some restaurants may only have a square logo and no wide photography for their cover banner. | The `RestaurantHero` component is designed to gracefully collapse if no cover image is provided, rendering an elegant compact header centered around the logo avatar without broken layouts. | `[CONFIRMED]` |
| **`CR-04`** | **Card Layout Mode Flexibility** | Certain dining concepts (e.g. cocktail bars) benefit from large full-width hero cards, while extensive diner menus benefit from compact horizontal cards. | Architecture supports a `card_layout` preference (`horizontal` vs `hero`) stored in `restaurant_profile`. | `[CONFIRMED]` |

---

## 2. Missing Assets & Client Content Requirements

The design system is prepared with realistic fallback assets and shimmer loaders. However, actual pilot restaurant onboarding requires:

* **Logo Asset:** High-resolution transparent PNG or SVG logo (`CLIENT CONTENT REQUIRED`).
* **Cover Photography:** 1600x600px atmospheric interior or hero dish photograph (`CLIENT CONTENT REQUIRED`).
* **Menu Master Copy:** Verified dish titles, prices, descriptions, and verified allergen advisories from the head chef (`CLIENT CONTENT REQUIRED`).

