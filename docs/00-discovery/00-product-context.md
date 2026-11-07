# 00 — Product Context & Problem Statement

**Document Version:** 1.0  
**Phase:** 00 — Product Discovery  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  
**Target Audience:** Restaurant Owners, Freelance Solution Architect, Implementation Team  

---

## 1. Executive Summary & Product Vision

**DigiNu** is a commercial-grade, reusable digital restaurant menu platform designed for independent restaurants, cafes, bars, and bistros. The platform replaces traditional paper/laminated menus with dynamic, mobile-first digital menus accessible instantly via table QR codes. 

The product consists of two distinct web experiences:
1. **Public Customer Menu (Read-Only):** A blisteringly fast, responsive web interface accessed via QR scan, allowing diners to explore categories, view vivid food imagery, read descriptions, inspect dietary labels/allergens, and verify item availability without downloading any app or creating an account.
2. **Private Restaurant Owner Dashboard (Authenticated):** A frictionless, no-code administration portal enabling restaurant operators to manage their profile, branding, categories, food items, prices, availability, QR codes, and generate realistic food imagery using integrated AI without technical assistance.

`[CONFIRMED]` The platform is intentionally architected as a **reusable commercial product asset** that a solo freelancer or boutique digital agency can customize, white-label, deploy, and monetize across dozens of local restaurant clients.

---

## 2. Problem Statement

### 2.1 The Pain of Physical Printed Menus for Restaurant Owners
* **Prohibitive Re-printing Costs & Latency:** Whenever food costs change, ingredients shift, or seasonal items are introduced, physical menus must be redesigned, proofed, and reprinted at significant expense ($200–$1,000+ per print run) and turnaround delays (3–10 business days). `[CONFIRMED]`
* **Inability to Reflect Real-Time Availability:** Daily sold-out dishes, "catch of the day", or 86'd items cannot be dynamically removed from physical menus, resulting in disappointed customers and awkward server apologies. `[CONFIRMED]`
* **Visual Limitations:** Physical menus have tight spatial constraints, forcing restaurants to omit high-resolution food photography, detailed ingredient breakdowns, and comprehensive allergen notices. `[CONFIRMED]`
* **Wear and Tear:** Paper and laminated menus degrade rapidly, soil easily, present hygiene concerns, and dilute a restaurant's brand image. `[CONFIRMED]`

### 2.2 The Pain Points of Existing Digital Menu Alternatives
* **Clunky PDF Downloads:** Many restaurants currently stick QR codes linking directly to a 25MB multi-page PDF hosted on cloud drives, delivering an abysmal mobile UX (pinch-to-zoom nightmares, heavy bandwidth usage, illegible tiny fonts). `[CONFIRMED]`
* **Bloated POS / Online Ordering Platforms:** Existing food-tech giants (Toast, Square, DoorDash, Deliverect) force restaurants into full ordering/POS ecosystems that charge heavy transaction commissions (15%–30%), require kitchen ticket display terminals, and demand complex operational overhauls. Most dine-in restaurants simply want a clean, browsable digital menu for table ordering served by human staff. `[CONFIRMED]`
* **High Barrier to Professional Food Photography:** Small and independent restaurants cannot afford $1,500–$5,000 professional culinary photography sessions for their 60+ menu items, leaving their digital presence devoid of visual appetite appeal. `[CONFIRMED]`

---

## 3. Business Model & Freelancer Commercialization

DigiNu is designed specifically as a turnkey B2B service offering for a freelance developer/consultant selling to local dining establishments.

### 3.1 Monetization Models for the Freelancer `[RECOMMENDATION]`
1. **Tiered Setup & Onboarding Fee (One-time):**
   * Digital Menu Setup ($300 – $750 per restaurant): Ingesting initial paper menu, structuring categories, uploading logos, tuning color palette, and generating AI food images for key items.
   * Table QR Kit Delivery (Optional add-on $100 – $250): Designing and delivering print-ready table tents or acrylic QR code stands.
2. **Monthly/Annual SaaS Maintenance Subscription:**
   * **Basic Tier ($29 – $49/mo):** Hosting, custom subdomain/domain, unlimited customer views, dashboard access for real-time price & menu editing.
   * **Pro Tier ($59 – $99/mo):** Includes 30–50 AI food image generation credits per month, priority support, and multi-language capability (v2).
3. **AI Generation Add-on Packs:**
   * $15 for 20 AI food image generation credits (providing a healthy margin above provider API costs of ~$0.04–$0.08 per image).

### 3.2 Target Customers
* Independent casual dining restaurants, bistros, and gastro-pubs.
* Fast-casual dining and quick-serve table service restaurants.
* Specialty cafes, bakeries, cocktail lounges, and wine bars.
* Multi-cuisine restaurants with frequent seasonal menu updates.
* Multi-location local restaurant owners (single brand, 1–3 outlets).

---

## 4. Value Proposition

### 4.1 For Restaurant Owners
* **Zero Technical Friction:** Update a price or mark an item "Sold Out" in 5 seconds directly from a mobile phone or tablet dashboard.
* **Cost Elimination:** Eliminate recurring printing and laminating bills completely.
* **Instant Culinary Visuals:** Generate realistic, appetizing 4K-quality food photography on demand without hiring photographers or staging food.
* **Brand Elevation:** Present customers with a clean, branded, fluid digital experience tailored to the restaurant's colors and aesthetic.

### 4.2 For Diners (Customers)
* **Instant Zero-Install Access:** Scan a QR code using standard iOS/Android cameras and browse immediately in Mobile Safari/Chrome.
* **Intuitive Browsing:** Quickly jump through categories, search dishes, and filter by Vegetarian, Vegan, Gluten-Free, or Allergens.
* **Visual Appetite Appeal:** View high-definition representations of dishes before ordering from human waitstaff.
* **Accurate Information:** Trust that prices and availability are up to date.

### 4.3 For the Freelancer / Platform Owner
* **High Reusability & Low Marginal Cost:** Build once, deploy or multi-tenant effortlessly, and onboard new clients in under 30 minutes.
* **Predictable Recurring Revenue:** High retention rate; once table QR codes are physically deployed, restaurants rarely churn unless the service fails.

---

## 5. Strict Product Scope Boundaries

To ensure rapid delivery, high reliability, and commercial focus, strict boundaries are enforced.

```
+---------------------------------------------------------------------------------+
|                               DIGINU BOUNDARIES                                 |
+---------------------------------------------------------------------------------+
| IN SCOPE (Digital Menu Platform)         | OUT OF SCOPE (Strictly Excluded)     |
|------------------------------------------|--------------------------------------|
| [CONFIRMED] Public mobile-first menu     | [CONFIRMED] Shopping cart & checkout |
| [CONFIRMED] Table QR code generation     | [CONFIRMED] Online order placement   |
| [CONFIRMED] Category & Food Item CRUD    | [CONFIRMED] Payment gateway / Stripe |
| [CONFIRMED] Real-time item availability  | [CONFIRMED] Order tracking / alerts  |
| [CONFIRMED] Dietary & Allergen tags      | [CONFIRMED] Kitchen Display System   |
| [CONFIRMED] AI-powered food imagery      | [CONFIRMED] Table reservations       |
| [CONFIRMED] Image upload & asset library | [CONFIRMED] Inventory / stock sync   |
| [CONFIRMED] Restaurant branding config   | [CONFIRMED] Staff tip calculation    |
| [CONFIRMED] Secure Owner Admin Auth      | [CONFIRMED] POS / ERP integrations   |
+---------------------------------------------------------------------------------+
```

> **Core Axiom:** DigiNu is a **browsable digital menu platform with administrative management**, NOT an online food delivery, POS, or ordering engine. Customers order directly with their server.

