# Typography & Content Style Guidelines — DigiNu

**Document Version:** 1.0  
**Phase:** 03 — UI/UX Design, Branding & Design System  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Typographic Hierarchy Scale

DigiNu uses an 8-level modular typographic hierarchy calibrated specifically for high-contrast mobile screen viewing under diverse ambient dining lighting conditions:

| Role | Font Size | Weight | Line Height | Tracking | Applied Components |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display Hero** | `2.25rem` (36px) | Bold (700) | 1.15 | `-0.025em` | Restaurant Title in Cover Banner |
| **Section Title**| `1.50rem` (24px) | Semibold (600) | 1.25 | `-0.02em` | Category Header (e.g., "Handmade Pastas") |
| **Dish Title** | `1.125rem` (18px)| Semibold (600) | 1.30 | `-0.01em` | Food Card Main Title |
| **Price Tag** | `1.125rem` (18px)| Bold (700) | 1.00 | `0.00em` | Tabular Dish Price (`$18.50`) |
| **Body Copy** | `0.9375rem` (15px)| Regular (400) | 1.50 | `0.00em` | Short Dish Description on Card |
| **Detail Body** | `1.00rem` (16px) | Regular (400) | 1.60 | `0.00em` | Expanded Ingredient Story in Drawer |
| **Category Pill**| `0.875rem` (14px)| Medium (500) | 1.00 | `+0.01em` | Sticky Scroll-Spy Navigation Tabs |
| **Micro Badges** | `0.75rem` (12px) | Semibold (600) | 1.00 | `+0.02em` | Dietary Badges (`[Gluten-Free]`, `[Vegan]`) |

---

## 2. Approved Font Pairings

To maintain aesthetic flexibility across different restaurant categories, DigiNu supports three pre-configured font pairings:

```
+-----------------------------------------------------------------------------------------+
|                               APPROVED FONT PAIRINGS                                    |
+-----------------------------------------------------------------------------------------+
| Preset Name      | Heading Font (Serif/Display) | Body Font (Sans-Serif)  | Character   |
|------------------|------------------------------|-------------------------|-------------|
| **Editorial**    | Cormorant Garamond / Playfair| Plus Jakarta Sans       | Warm, Craft |
| **Contemporary** | Plus Jakarta Sans (Semibold) | Plus Jakarta Sans (Reg) | Clean, Tech |
| **Nocturne**     | Playfair Display             | Outfit Sans             | Moody, Luxe |
+-----------------------------------------------------------------------------------------+
```

### Technical Web-Font Loading Strategy
* Fonts are loaded locally or pre-connected via high-speed CDN with `font-display: swap` to prevent Flash of Invisible Text (FOIT).
* Tabular numbers (`font-variant-numeric: tabular-nums`) are enforced across all prices to guarantee vertical numerical alignment in lists.

---

## 3. Culinary Content & Microcopy Guidelines

### 3.1 Dish Titles
* **Casing:** Title Case (e.g., *"Crispy Salt & Pepper Calamari"*). Never ALL CAPS.
* **Length:** Recommended under 50 characters. Maximum 80 characters.
* **Clarity:** Distinct culinary identity (avoid generic names like *"Fish Dish"*).

### 3.2 Short Descriptions (Food Card Level)
* **Goal:** Stimulate appetite immediately with evocative, sensory keywords (e.g., *flash-fried, slow-simmered, aged 24 months, truffle-infused, wood-fired*).
* **Length Constraint:** Max 160 characters (clamped to 2 lines on mobile screens with smooth text expansion).
* **Example:**
  > *"Tender flash-fried Monterey squid rings, tossed in sea salt, served with house-made smoked garlic aioli and grilled lemon wedge."*

### 3.3 Detailed Story & Ingredients (Expanded Drawer Level)
* **Goal:** Inform curious or allergen-sensitive diners about culinary provenance and cooking method.
* **Length:** 2 to 4 sentences (up to 400 characters).
* **Structure:**
  - Sentence 1: Primary protein / vegetable and source.
  - Sentence 2: Cooking technique and sauce reduction.
  - Sentence 3: Garnishing and plate accompaniments.

### 3.4 Allergen Disclaimers
* **Tone:** Clear, objective, non-alarmist, and compliant with health regulations.
* **Format:**
  > `⚠️ Allergen Notice: Contains Molluscs, Eggs, Gluten. Prepared in a facility that also handles peanuts and dairy.`

### 3.5 Price Formatting Rules
* **Positioning:** Derived from database `restaurant_profile.currency_position` (`PREFIX` vs `SUFFIX`).
  - Prefix Style: `$18.50`, `£14.00`, `₹450`
  - Suffix Style: `16,50 €`, `180 SEK`
* **Zero Decimals Handling:** For currencies with high integer values (e.g., INR ₹, JPY ¥), trailing `.00` is omitted.

