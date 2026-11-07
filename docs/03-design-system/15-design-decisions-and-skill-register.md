# Design Decisions & Skill / Tool Register — DigiNu

**Document Version:** 1.0  
**Phase:** 03 — UI/UX Design, Branding & Design System  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Key Design Decisions Register

| Decision ID | Domain | Design Choice / Baseline | Alternatives Evaluated | Rationale & Status |
| :--- | :--- | :--- | :--- | :--- |
| **DES-01** | Visual Direction | **Modern Editorial Dining (`warm-cream`) as Default** | Contemporary Minimal (`clean-white`), Nocturne Luxury (`midnight-charcoal`) | Editorial warmth fits 80% of independent restaurants (trattorias, bistros, gastro-pubs). Other directions remain selectable via theme presets. `[PROPOSED]` |
| **DES-02** | Brand Separation | **Strict Dual-Brand Model** | Co-branding or white-labeling everything | Diners see 100% restaurant identity; owner dashboard uses sleek dark slate studio theme. `[CONFIRMED]` |
| **DES-03** | Menu Layout | **Single-Column Mobile Stack with Sticky Category Scroll-Spy** | Multi-column grid on mobile | Single column provides optimal food photography prominence and comfortable single-handed thumb scrolling. `[CONFIRMED]` |
| **DES-04** | AI Studio UX | **Flexible UI (1-Image Primary Preview + Regenerate/Approve)** | Strict 4-image grid only | Aligns with Phase 02 Cloudflare 1-image baseline (~250 Neurons) while maintaining architectural capability to render a 2x2 grid if batching is enabled. `[TO CONFIRM]` |
| **DES-05** | Sold-Out (86) Presentation | **50% Opacity Overlay + High-Contrast Badge** | Completely hiding sold-out dishes | Keeps the dish in the restaurant repertoire while unequivocally signaling unavailability to diners before ordering. `[CONFIRMED]` |
| **DES-06** | Motion Design | **Spring Physics + GPU-Accelerated Transforms** | Heavy CSS keyframe animations | Calibrated spring curves provide tactile feedback without triggering browser reflow or draining battery. `[CONFIRMED]` |

---

## 2. Design Skills & Tooling Register

### 2.1 Generative UI Skill
* **Usage:** Leveraged the Antigravity `generative_ui` capability to construct an interactive HTML prototype artifact at `C:\Users\USER\.gemini\antigravity\brain\b6897537-f42d-4749-a49e-5dc0b33f67c9/prototype.html`.
* **Features Demonstrated:** Real-time mobile smartphone frame, sticky category bar, food card anatomy, interactive 1-tap 86 availability toggle, and the signature AI Culinary Studio modal.

### 2.2 Design Token Schema Validation Tool
* **Usage:** Validated `04-design-tokens.json` using Node.js JSON parsing to guarantee clean programmatic consumption by Tailwind CSS during development.

