# 08 — Key Decisions, Assumptions & Open Questions

**Document Version:** 1.0  
**Phase:** 00 — Product Discovery  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Major Architectural Decisions Log

| Decision ID | Area | Choice Made / Recommended | Alternatives Considered | Rationale | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEC-01** | Platform Architecture | **Shared Multi-Tenant Platform with Row-Level Security** | Independent Single-Tenant Deployments | Managing 30+ separate deployments as a solo freelancer is operationally unviable. Multi-tenancy provides instant onboarding and unified updates at 10x lower hosting cost. | `[RECOMMENDATION]` |
| **DEC-02** | URL Structure | **Path-based routing (`/r/:restaurant-slug`)** | Subdomains (`:slug.diginu.app`) or Custom Domains | Path-based routing requires zero complex wild-card DNS or SSL certificate provisioning during initial onboarding, drastically reducing setup friction. Subdomains can be added in V2. | `[CONFIRMED]` |
| **DEC-03** | AI Image Engine | **Multi-Provider Adapter (Google Imagen 3 / OpenAI DALL-E / Flux.1)** | Hardcoded single vendor | Protects against vendor lock-in, pricing shifts, or temporary outages. Enables switching providers via configuration. | `[RECOMMENDATION]` |
| **DEC-04** | Image Processing | **Server-side WebP transcoding & cloud object storage (S3/R2)** | Local disk storage or third-party image hosting | Ensures consistent sub-second loading on mobile devices regardless of the original image upload size. | `[CONFIRMED]` |
| **DEC-05** | Real-Time Sync | **Polling / Optimistic UI / Cache-Busting HTTP** | Complex WebSockets | Digital menus change infrequently (prices/availability updated a few times a day). Overengineering WebSockets adds connection overhead without user benefit. Short HTTP revalidation is optimal. | `[RECOMMENDATION]` |

---

## 2. Core Assumptions Documented

* **ASM-01 [ASSUMPTION]:** Restaurant customers have smartphones capable of scanning standard QR codes via native camera apps without downloading specialized scanner apps.
* **ASM-02 [ASSUMPTION]:** Restaurant venues have adequate mobile cellular connectivity (4G/5G) or guest Wi-Fi to support loading web menus.
* **ASM-03 [ASSUMPTION]:** Restaurant owners prefer simplicity and speed over complex multi-tier role-based access control (a single owner login per restaurant is sufficient for MVP).
* **ASM-04 [ASSUMPTION]:** Commercial AI image generation costs (~$0.02 to $0.05 per generated image) are financially viable when bundled into the freelancer's monthly retainer or sold in credit packs.
* **ASM-05 [ASSUMPTION]:** Waitstaff in client restaurants will continue to physically take orders at the table; the digital menu serves purely as an informational, appetite-stimulating catalog.

---

## 3. Open Questions & Ambiguities to Resolve `[TO CONFIRM]`

The following questions must be reviewed and answered by the product stakeholder before finalizing technical architecture in Phase 01:

### 3.1 AI Generation Strategy & Commercials
1. **Q1 [TO CONFIRM]:** Should the AI food image generator create all 4–5 variations simultaneously in a single parallel batch request, or should it generate 2 initial variations with a "Generate 2 More" button to conserve API costs?
2. **Q2 [TO CONFIRM]:** How should AI generation credits be metered in the MVP? Should each restaurant receive a fixed pool of credits per calendar month (e.g., 30 credits/mo), or will the freelancer manually manage credit allocation?
3. **Q3 [TO CONFIRM]:** Do you have a preferred AI image provider already configured with API billing (e.g., Google Cloud Vertex AI, OpenAI, Replicate), or should the architecture remain provider-agnostic until Phase 01?

### 3.2 Tenant Management & Super-Admin Capabilities
4. **Q4 [TO CONFIRM]:** For the MVP, will new restaurant onboarding be handled via a "Master Admin" dashboard accessed by you (the freelancer), or should onboarding be scripted via database seeds / CLI?
5. **Q5 [TO CONFIRM]:** When a restaurant's monthly subscription expires or is paused, should their public QR menu display a friendly "Menu Temporarily Unavailable" notice, or fall back to a basic static mode?

### 3.3 Menu Hierarchy & Dish Options
6. **Q6 [TO CONFIRM]:** Do food items require sub-options or size variants for MVP (e.g., *Small $12 / Large $18* or *Choice of Dressing: Ranch / Vinaigrette*), or is a single base price per item sufficient for the initial commercial release?
7. **Q7 [TO CONFIRM]:** Are calories/nutritional information required for any target clients, or should they be treated as optional custom fields?

---

## 4. Next Steps & Recommended Path Forward

1. Review and validate the 10 discovery documents under `docs/00-discovery/`.
2. Confirm the open questions above regarding AI provider preference and dish sizing options.
3. Upon explicit approval, advance to **Phase 01: Product Requirements Document (PRD) & Solution Architecture**.

