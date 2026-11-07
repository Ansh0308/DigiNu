---
name: diginu-business-rules
description: "Core business rules, product scope guardrails, and domain invariants for the DigiNu Digital Restaurant Menu platform. Enforces read-only dining, 86 availability toggle rules, 1-image AI generation, single-tenant data isolation, and strictly out-of-scope features."
---

# DigiNu Business Rules & Domain Invariants

This skill defines the non-negotiable commercial, domain, and operational rules governing the DigiNu platform. Every AI coding assistant and developer must enforce these rules during implementation.

---

## 1. Product Identity & Purpose

DigiNu is a **reusable QR-based digital restaurant menu management platform** sold by a freelance developer to independent restaurants, bistros, cafes, and bars.

It converts traditional paper and laminated menus into lightning-fast, mobile-first digital menus accessible instantly via table QR codes. It includes a private, authenticated owner dashboard for no-code menu editing and an AI Food Image Studio.

---

## 2. Strict Product Scope Guardrails

### What DigiNu IS (In-Scope):
* **Public Customer Menu:** Mobile-first, read-only digital menu browsing with sticky category navigation, dietary filter tags, and dish detail bottom sheet drawers.
* **Instant Availability ("86") Management:** 1-tap toggle switch enabling restaurant staff to instantly mark sold-out items as unavailable across the customer menu.
* **Menu Catalog CRUD:** Simple, robust management of categories, food items, prices, descriptions, and dietary disclosures.
* **AI Food Photography Studio:** Generates 1 high-resolution culinary photo per request with mandatory human approval before persisting to ImageKit CDN.
* **ImageKit Media Pipeline:** Direct browser image uploads for restaurant logos, hero banners, and manual dish photography.
* **Deterministic QR Code Studio:** Generates high-contrast table QR codes with center logo embedding and exports vector SVG, 300 DPI PNG, and A6 table-tent PDF.
* **Independent Client Deployments:** Each restaurant operates its own dedicated container, isolated PostgreSQL database, environment configuration, and custom domain.

### What DigiNu IS NOT (Strictly Excluded):
* ❌ **NO Shopping Cart, Basket, or Order Summary**
* ❌ **NO Online Order Placement or Delivery Dispatch**
* ❌ **NO Payment Processing, Checkout, or Tip Calculation**
* ❌ **NO Kitchen Display Systems (KDS) or Kitchen Order Tickets (KOT)**
* ❌ **NO Point of Sale (POS) Hardware Synchronization**
* ❌ **NO Raw Ingredient Inventory Tracking or Recipe Costing**
* ❌ **NO Diner Customer Accounts, Login, or Loyalty Points**
* ❌ **NO Table Reservation Booking Engine**

**Rule:** Diners place their orders verbally with table waitstaff. Under no circumstances should cart or checkout code be written.

---

## 3. Operational Domain Rules

### 3.1 Availability & The "86" Switch
* When an item has `is_available = false`, it is considered "86ed" (sold out).
* On the public customer menu, sold-out items remain visible to prevent diners from asking for missing items, but render with **50% opacity**, a prominent **"Sold Out"** red badge, and cannot be expanded to view order options.
* Toggling an item's availability in the owner dashboard updates the database immediately via optimistic UI and reflects on the public menu without requiring a full menu re-save.

### 3.2 AI Image Generation Rules
* The AI engine generates **exactly 1 high-resolution image per generation request** (~250 Neurons on Cloudflare Workers AI) to prevent quota exhaustion and latency spikes.
* **Mandatory Human Approval:** Generated images are never automatically assigned to dishes. The owner must explicitly click "Approve & Apply to Dish". Closing the modal or clicking "Regenerate" discards the preview.
* AI credits are decremented **only upon approval**, not on generation failures or discards.

### 3.3 Public Route Security & Zero Diner Tracking
* The public route `/` and `GET /api/public/menu` are strictly read-only. No mutation HTTP verbs (`POST`, `PUT`, `DELETE`, `PATCH`) are permitted on public endpoints.
* Zero diner tracking: no tracking cookies, analytics pixels, or personally identifiable information (PII) may be collected from diners scanning QR codes. Diners are 100% anonymous.
* Owner emails, password hashes, and draft menu items must be stripped from public API JSON responses.

