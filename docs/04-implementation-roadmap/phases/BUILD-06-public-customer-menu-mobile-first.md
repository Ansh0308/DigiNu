# BUILD-06: Public Customer Menu (Mobile-First)

**Phase ID:** BUILD-06  
**Phase Name:** Public Customer Menu (Mobile-First Experience)  
**Status:** PENDING — Awaiting BUILD-03 Completion & Developer Authorization  
**Effort Estimate:** Large (4–5 days)  
**Depends On:** BUILD-03 (Menu CRUD), BUILD-04 (ImageKit Media Pipeline recommended for assets)  
**Next Phase:** BUILD-07 (QR Code Generation) & BUILD-08 (Testing & Deployment)  

---

## A. Phase Overview

| Field | Detail |
|:---|:---|
| **Phase ID** | BUILD-06 |
| **Objective** | Build the complete public-facing dining experience: edge-cached public menu API route, restaurant hero header with live status, sticky scroll-spy category navigation pill bar, responsive food item cards, dietary filter chips, sliding dish detail drawer (bottom sheet), real-time client-side search, sold-out visual treatment, outside-operating-hours banner, and offline fallback banner. |
| **Business Value** | The core product interface experienced by every seated diner. Lightning-fast mobile loading (< 1.5s on 4G) and intuitive thumb-zone navigation directly drive guest satisfaction, eliminate paper printing costs, and ensure restaurants maintain a modern, professional hospitality brand. |
| **Scope** | Public menu route `/`; `GET /api/public/menu`; `RestaurantHero.tsx`; `CategoryNav.tsx`; `DietaryFilterStrip.tsx`; `SearchBar.tsx`; `MenuItemCard.tsx`; `DishDetailDrawer.tsx`; `OperatingHoursBadge.tsx`; `OfflineNotice.tsx`; safe area inset handling. |
| **Prerequisites** | BUILD-03 complete (categories and items exist in DB); ImageKit pipeline working for dish images; global design tokens loaded in `globals.css`. |
| **Dependencies** | BUILD-03, BUILD-04 |

---

## B. Source Documentation

1. `e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md`
2. `e:\Freelance\DigiNu\docs\01-product-definition\01-product-requirements-document.md` — Section 4.1 (`FR-MENU-*`)
3. `e:\Freelance\DigiNu\docs\01-product-definition\02-user-stories-and-acceptance-criteria.md` — Section 2.1 (`US-CUST-*`)
4. `e:\Freelance\DigiNu\docs\02-technical-architecture\04-api-and-integration-contracts.md` — Section 4.1 (`GET /api/public/menu`)
5. `e:\Freelance\DigiNu\docs\03-design-system\08-customer-screen-specifications.md` — `SCR-CUST-01` through `SCR-CUST-06`
6. `e:\Freelance\DigiNu\docs\03-design-system\07-component-library-specification.md` — Customer Components
7. `e:\Freelance\DigiNu\docs\03-design-system\10-interaction-and-motion-guidelines.md` — Scroll-spy, Drawer physics
8. All 5 global SKILL.md files; All 5 project-local SKILL.md files

---

## C. Features Included

- Build public endpoint `GET /api/public/menu` with edge caching headers (`Cache-Control: public, s-maxage=60, stale-while-revalidate=300`)
- Payload data sanitization: strictly omit owner emails, password hashes, internal IDs, and draft categories/items
- Server component landing page `src/app/page.tsx` rendering restaurant branding, operating status, and menu layout
- Build `src/components/public/RestaurantHero.tsx`:
  - Restaurant logo, name, cuisine tags, address, and live operating hours indicator (Open Now / Closed)
  - Theme preset background mapping (`--color-canvas`, `--color-primary`)
- Build `src/components/public/CategoryNav.tsx`:
  - Sticky horizontal scroll pill bar snapping to active category
  - `IntersectionObserver` bidirectional scroll-spy tracking visible category sections
  - Smooth scroll anchor behavior on tap with header offset compensation
- Build `src/components/public/DietaryFilterStrip.tsx`:
  - 1-tap client-side filter pills: Vegetarian (`VEG`), Vegan (`VGN`), Gluten-Free (`GF`), Halal (`HAL`), Dairy-Free (`DF`), Nut-Free (`NF`), Spicy
  - Active count indicator and quick reset button
- Build `src/components/public/SearchBar.tsx`:
  - Client-side fuzzy substring search against dish title, description, and tags
  - Clear icon button (`aria-label="Clear search"`)
- Build `src/components/public/MenuItemCard.tsx`:
  - 16:9 ImageKit WebP optimized thumbnail (`tr=w-400,h-300,fo-auto,q-80`) with LQIP blurred placeholder
  - Dish name in `Playfair Display`, description truncated to 2 lines, formatted price (`tabular-nums`)
  - Dietary badges and spicy level icons
  - Sold-out state: 50% opacity, grayscale filter, prominent "Sold Out" red badge, non-interactive click handler
- Build `src/components/public/DishDetailDrawer.tsx`:
  - Sliding bottom sheet modal (`max-height: 85vh`) with swipe-down drag gesture
  - Full-resolution hero dish photo with zoom toggle
  - Complete culinary description, price, detailed allergen disclosure list, preparation notes
  - Back/Close button with mobile safe area top padding
- Build `src/components/public/OperatingHoursModal.tsx`:
  - Weekly schedule breakdown modal triggered by clicking operating hours badge
- Build empty and fallback states:
  - `SCR-CUST-04`: Outside Operating Hours banner (menu remains browsable)
  - `SCR-CUST-05`: Search / Filter empty state with 1-tap "Clear Filters" button
  - `SCR-CUST-06`: Offline fallback banner detected via `navigator.onLine`
- White-label discrete footer: "Powered by DigiNu" with subtle external link

---

## D. Features Explicitly Excluded

- **NO shopping cart, basket, or order summary**
- **NO item quantity selectors (+/- buttons)**
- **NO order submission, checkout, or tip calculation**
- **NO online payment gateways (Stripe, PayPal, etc.)**
- **NO customer user accounts, login, or loyalty profile**
- **NO table reservation or booking widget**
- **NO kitchen display or POS synchronization**
- **NO diner tracking cookies or third-party advertising pixels**

---

## E. Database Changes

No schema modifications. Reads exclusively from existing models:
- `restaurant_profile` (branding, hours, status)
- `operating_hours` (weekly opening schedule)
- `menu_categories` (where `is_active = true`)
- `menu_items` (where `is_active = true`)
- `media_assets` (dish thumbnails and logos)

---

## F. API and Backend Requirements

### 1. `GET /api/public/menu`
* **Access:** 100% Public (no auth required)
* **Headers:** `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`
* **Response Shape (200 OK):**
```json
{
  "restaurant": {
    "name": "Bistro Lumière",
    "tagline": "Modern French Provençal Cuisine",
    "logoUrl": "https://ik.imagekit.io/diginu/restaurants/bistro-lumiere/logo.png",
    "bannerUrl": "https://ik.imagekit.io/diginu/restaurants/bistro-lumiere/hero.webp",
    "themePreset": "warm-cream",
    "primaryColor": "#C85A32",
    "currencySymbol": "$",
    "address": "124 King Street, Charleston, SC",
    "phone": "(843) 555-0199",
    "isOpenNow": true,
    "operatingHours": [
      { "dayOfWeek": 1, "openTime": "11:00", "closeTime": "22:00", "isClosed": false }
    ]
  },
  "categories": [
    {
      "id": "cat_123",
      "name": "Starters & Small Plates",
      "description": "Artisanal appetizers prepared fresh daily",
      "displayOrder": 1,
      "items": [
        {
          "id": "item_456",
          "name": "Truffle Burrata",
          "description": "Heirloom tomatoes, balsamic reduction, basil oil, grilled sourdough",
          "price": 18.50,
          "imageUrl": "https://ik.imagekit.io/diginu/restaurants/bistro-lumiere/dishes/burrata.webp?tr=w-400,h-300,fo-auto,q-80",
          "thumbnailUrl": "https://ik.imagekit.io/diginu/restaurants/bistro-lumiere/dishes/burrata.webp?tr=w-100,bl-6",
          "isAvailable": true,
          "dietary": { "isVegetarian": true, "isVegan": false, "isGlutenFree": false, "isHalal": false, "isDairyFree": false, "isNutFree": true, "spicyLevel": 0 },
          "allergens": ["DAIRY", "GLUTEN"]
        }
      ]
    }
  ]
}
```

---

## G. UI/UX Requirements

* **Typography:** `Playfair Display` for restaurant title, section headers, and dish names; `Plus Jakarta Sans` for body, descriptions, prices (`tabular-nums`), and tags.
* **Color Palette:** Mapped to CSS variables:
  * Canvas: `var(--color-canvas)` (`#FDFCF7`)
  * Surface Card: `var(--color-surface)` (`#FFFFFF`)
  * Primary Accent: `var(--color-primary)` (`#C85A32`)
  * Text Primary: `var(--color-text-primary)` (`#1A1A1A`)
  * Text Secondary: `var(--color-text-secondary)` (`#6B635B`)
  * Sold Out Badge: `#DC2626`
* **Mobile Breakpoints:** Single-column layout optimized for 360px–430px viewports; 2-column grid at 768px+ (tablet menus).
* **Safe Areas:** `padding-top: env(safe-area-inset-top)` and `padding-bottom: env(safe-area-inset-bottom)` applied to root viewport and bottom drawer.
* **Motion & Spring Physics:** Bottom sheet drawer entrance using `cubic-bezier(0.16, 1, 0.3, 1)` 300ms transition; pull-to-dismiss drag gesture; `@media (prefers-reduced-motion: reduce)` disables spatial translation and substitutes 100ms fade.

---

## H. Step-by-Step Execution Plan

1. Create public menu route handler `src/app/api/public/menu/route.ts` with Prisma query and edge cache headers.
2. Build data sanitizer in `src/lib/sanitizer.ts` ensuring zero owner info or unpublished data leaks.
3. Build `src/lib/hours-calculator.ts` to compute current `isOpenNow` state from `operating_hours` records.
4. Create public layout `src/app/(public)/layout.tsx` injecting theme CSS variables into the root container.
5. Create public menu page `src/app/(public)/page.tsx` with server-side initial data fetch.
6. Build `RestaurantHero.tsx` component with logo, cuisine tags, and opening status badge.
7. Build `CategoryNav.tsx` with horizontal pill layout, scroll-snap, and click-to-scroll functionality.
8. Implement `useScrollSpy.ts` hook attaching `IntersectionObserver` to each category section.
9. Build `DietaryFilterStrip.tsx` with active filter chips and zero-re-render client state.
10. Build `SearchBar.tsx` with debounced input and clear button.
11. Build `MenuItemCard.tsx` with ImageKit transformed thumbnails, dietary icons, and sold-out visual treatment.
12. Build `DishDetailDrawer.tsx` bottom sheet modal with drag-down dismiss and allergen breakdown.
13. Implement `OperatingHoursModal.tsx` showing the full weekly opening schedule.
14. Add offline banner detection using window online/offline event listeners.
15. Add discrete "Powered by DigiNu" footer with white-label link.
16. Run Lighthouse mobile performance audit to ensure < 1.5s FCP and zero CLS.

---

## I. Global Skill Usage

| Skill | Application in BUILD-06 |
|:---|:---|
| **`ui-ux-pro-max`** | Run `python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "mobile menu scroll spy bottom sheet" --domain ux`. Implement thumb-zone layout recommendations, sticky pill bar active states, and bottom drawer pull gestures. |
| **`frontend-design`** | Ensure the public menu feels like a bespoke culinary publication (warm editorial dining), avoiding generic SaaS card grids or AI slop. Verify `Playfair Display` serif typography paired with crisp `Plus Jakarta Sans` prices. |
| **`code-review`** | Audit `GET /api/public/menu` to verify zero PII leaks, verify edge caching headers, ensure `IntersectionObserver` disconnects on unmount (prevent memory leaks), and check that no ordering or cart logic exists. |
| **`documentation-spec-writing`** | Document the public menu caching architecture, edge cache invalidation strategy, and data sanitization contract in the API docs. |
| **`accessibility-review`** | Full WCAG 2.2 AA audit: check 4.5:1 text contrast on custom brand colors, ensure category pills have `role="tab"` and `aria-selected`, verify bottom sheet has `role="dialog"`, `aria-modal="true"`, focus trap, and Escape key dismissal. |

---

## J. Testing Requirements

* **API Route Test:** `GET /api/public/menu` returns sanitized JSON, status 200, correct cache headers, excludes inactive categories/items, excludes owner credentials.
* **Scroll-Spy Unit Test:** Verifies active category state updates when intersection threshold triggers.
* **Client Filter Test:** Verifies selecting "Vegetarian" + "Gluten-Free" filters the item list correctly without page reloads.
* **Sold Out Test:** Verifies unavailable items render with 50% opacity and disabled drawer trigger.
* **Drawer Accessibility Test:** Focus moves inside bottom sheet on open; Escape key closes drawer and returns focus to triggering item card.

---

## K. Security and Quality Checks

- Strict read-only API: public route only responds to `GET`; all mutation methods (`POST`, `PUT`, `DELETE`) return `405 Method Not Allowed`.
- Zero cookie exposure: no session or tracking cookies set on public dining route.
- Cache poisoning protection: query parameters ignored by public menu cache key.
- Strict layout shift prevention: `aspect-ratio: 16/9` enforced on all image wrappers to guarantee `CLS = 0.00`.

---

## L. Documentation Updates

- Update `docs/PROJECT_CONTEXT_INDEX.md` with BUILD-06 completion.
- Update `docs/02-technical-architecture/04-api-and-integration-contracts.md` with final response payload sample.

---

## M. Acceptance Criteria

```gherkin
Scenario: Seated diner opens digital menu on mobile
  Given a diner scans the table QR code and loads the restaurant menu URL
  When the page finishes loading
  Then the restaurant name, logo, and cuisine tags appear within 1.5 seconds on 4G
  And the category navigation pill bar sticks to the top of the viewport on scroll
  And tapping a category pill smoothly scrolls to that category section

Scenario: Diner filters menu by dietary preference
  Given the diner is browsing the public menu
  When the diner taps the "Vegetarian" dietary filter chip
  Then only food items with isVegetarian=true are displayed
  And an active filter counter shows "1 active filter" with a "Clear" button

Scenario: Diner views sold-out item
  Given an item was toggled to sold-out (86) in the owner dashboard
  When the public menu loads
  Then the item card renders with 50% opacity and a "Sold Out" red badge
  And tapping the card displays a subtle toast "Item is currently unavailable" instead of opening the ordering drawer

Scenario: Diner inspects dish details
  Given the diner taps an available food item card
  When the dish detail bottom sheet slides up
  Then the full-resolution photo, complete description, price, and allergen disclosures are displayed
  And dragging down on the sheet handle or pressing Escape dismisses the drawer
```

---

## N. Definition of Done

- [ ] `GET /api/public/menu` implemented with edge caching and zero PII leaks.
- [ ] Landing page renders all 6 screen states (`SCR-CUST-01` to `SCR-CUST-06`).
- [ ] Sticky category bar with scroll-spy smoothly tracks visible category sections.
- [ ] Dietary filter strip filters items instantly client-side without layout jumps.
- [ ] Sold-out items visually distinguished with 50% opacity and red badge.
- [ ] Dish detail bottom sheet drawer functions with swipe-down dismissal and keyboard traps.
- [ ] Mobile responsive layout verified at 360px, 390px, 430px, and 768px.
- [ ] Zero cart, checkout, ordering, or payment code exists in the codebase.
- [ ] WCAG 2.2 AA audit passed (contrast >= 4.5:1, keyboard nav, screen reader labels).

---

## O. Review and Approval Gate

Present the rendered public menu, Lighthouse mobile performance scores, and responsive screen captures to the developer for review. Await explicit approval before moving to BUILD-07.

---

## P. Complete AI IDE Execution Prompt

```markdown
You are acting as a Senior Full-Stack Engineer and Mobile UX Specialist implementing BUILD-06 of DigiNu — Reusable QR-Based Digital Restaurant Menu Platform.

## BEFORE YOU CODE:
1. Read `e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md`
2. Read all 5 global SKILL.md files in `%USERPROFILE%\.gemini\config\skills\`
3. Read all 5 project-local SKILL.md files in `e:\Freelance\DigiNu\.agents\skills\`
4. Read `e:\Freelance\DigiNu\docs\04-implementation-roadmap\phases\BUILD-06-public-customer-menu-mobile-first.md`
5. Read `e:\Freelance\DigiNu\docs\03-design-system\08-customer-screen-specifications.md` (`SCR-CUST-01` to `SCR-CUST-06`)
6. Read `e:\Freelance\DigiNu\docs\03-design-system\07-component-library-specification.md`

## STRICT ARCHITECTURAL & SCOPE RULES:
- INDEPENDENT DEPLOYMENT: Read data from the dedicated single-tenant PostgreSQL database.
- READ-ONLY SCOPE: Under NO circumstances build a shopping cart, checkout, order placement, payments, tip calculator, kitchen display, or customer accounts. Diners order verbally with staff.
- ZERO PII LEAKS: Do not leak owner emails, password hashes, or internal IDs in `GET /api/public/menu`.
- PERFORMANCE: The customer menu must load in < 1.5s on 4G. Enforce aspect-ratio on all images to ensure CLS = 0.00.

## IMPLEMENTATION STEPS:
1. Build `GET /api/public/menu` in `src/app/api/public/menu/route.ts`:
   - Fetch `restaurant_profile`, active `operating_hours`, active `menu_categories`, and active `menu_items` with their `media_assets`.
   - Strip all sensitive owner fields.
   - Set cache headers: `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`.
2. Build `src/lib/hours-calculator.ts` calculating `isOpenNow` status from day-of-week and current time.
3. Build public layout `src/app/(public)/layout.tsx` injecting custom CSS variables (`--color-primary`, `--color-canvas`) from the restaurant profile.
4. Build `RestaurantHero.tsx` with logo, name, cuisine badges, and live opening status badge.
5. Build `CategoryNav.tsx` with sticky scroll-snapping pill bar and `IntersectionObserver` scroll-spy.
6. Build `DietaryFilterStrip.tsx` with instant 1-tap client filtering (Veg, Vegan, GF, Halal, Dairy-Free, Nut-Free, Spicy).
7. Build `SearchBar.tsx` with debounced input and clear button.
8. Build `MenuItemCard.tsx` displaying 16:9 ImageKit WebP thumbnails, typography in Playfair Display / Plus Jakarta Sans, price in tabular nums, and 50% opacity sold-out styling.
9. Build `DishDetailDrawer.tsx` sliding bottom sheet modal with drag-to-dismiss, full photo, allergen list, and keyboard traps.
10. Add offline notice and outside-hours banner.
11. Add subtle white-label footer: "Powered by DigiNu".

## APPLY ALL 5 GLOBAL SKILLS:
- `ui-ux-pro-max`: Query `python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "mobile menu sticky scroll spy bottom sheet" --domain ux`. Implement thumb-friendly navigation and bottom sheet pull handles.
- `frontend-design`: Ensure bespoke editorial typography and warm dining aesthetic. Avoid generic AI card layouts.
- `code-review`: Review edge cache headers, ensure `IntersectionObserver` disconnects cleanly, check zero PII leaks.
- `accessibility-review`: Verify WCAG 2.2 AA compliance: 4.5:1 contrast, visible focus rings, ARIA roles (`role="tab"`, `role="dialog"`), Escape key handling.
- `documentation-spec-writing`: Document the public API caching architecture in `docs/`.

## VERIFICATION:
```bash
npx tsc --noEmit    # 0 errors
npm run lint        # 0 violations
npm run build       # Success
```
Verify manually:
1. Open `http://localhost:3000/` in mobile viewport (390px).
2. Verify restaurant branding and active hours badge.
3. Scroll through categories; verify sticky category pill bar tracks active section.
4. Tap dietary filters; verify items filter instantly.
5. Tap an item card; verify bottom sheet drawer slides up with photo and allergens.
6. Toggle an item to sold-out in admin; refresh public menu; verify item shows 50% opacity with "Sold Out" badge.

## STOP CONDITION:
After verifying the complete customer menu mobile experience, STOP. Do not proceed to BUILD-07 until approved.
```

