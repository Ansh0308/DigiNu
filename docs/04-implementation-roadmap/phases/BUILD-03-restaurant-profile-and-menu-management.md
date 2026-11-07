# BUILD-03: Restaurant Profile & Menu Management (CRUD)

**Phase ID:** BUILD-03  
**Phase Name:** Restaurant Profile & Menu Management (CRUD)  
**Status:** COMPLETE — Quality Gates & Test Suites Verified (Awaiting Developer Approval)  
**Effort Estimate:** Large (4–6 days)  
**Depends On:** BUILD-02 (Database Schema, Prisma ORM & Owner Authentication)  
**Next Phase:** BUILD-04 (ImageKit Media Pipeline)  

---

## A. Phase Overview

| Field | Detail |
|:---|:---|
| **Phase ID** | BUILD-03 |
| **Objective** | Build the complete owner dashboard CRUD: operational overview, restaurant profile settings with branding/theme/hours, category management with drag reordering, food item creation/editing with dietary tags and allergens, and the 1-tap 86 availability toggle. |
| **Business Value** | The core value proposition for restaurant owners. After this phase, an owner can fully manage their digital menu — adding categories, adding dishes with prices and dietary info, toggling sold-out items instantly. The platform becomes commercially usable. |
| **Scope** | 7+ REST API routes; 5 admin dashboard screens; Zod validation for all inputs; optimistic UI for availability toggle; drag-and-drop reordering (or arrow buttons for simplicity); all admin navigation. |
| **Prerequisites** | BUILD-02 complete; authenticated session working; all 8 Prisma models exist |
| **Dependencies** | BUILD-02 |

---

## B. Source Documentation

1. `e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md`
2. `e:\Freelance\DigiNu\docs\02-technical-architecture\04-api-and-integration-contracts.md` — API contracts (sections 4.2, 4.3)
3. `e:\Freelance\DigiNu\docs\02-technical-architecture\03-data-model-and-erd.md` — ERD for all mutations
4. `e:\Freelance\DigiNu\docs\03-design-system\09-admin-screen-specifications.md` — SCR-ADMIN-02 through SCR-ADMIN-06
5. `e:\Freelance\DigiNu\docs\03-design-system\07-component-library-specification.md` — Component specs
6. `e:\Freelance\DigiNu\docs\03-design-system\04-design-tokens.json` — Design tokens
7. `e:\Freelance\DigiNu\docs\03-design-system\10-interaction-and-motion-guidelines.md` — Motion rules
8. `e:\Freelance\DigiNu\docs\01-product-definition\02-user-stories-and-acceptance-criteria.md`
9. All 5 global SKILL.md files; All 5 project-local SKILL.md files

---

## C. Features Included

- Admin navigation sidebar/header with links to all admin sections
- **SCR-ADMIN-02:** Operational Overview Dashboard (metric tiles, quick actions, recent activity)
- **SCR-ADMIN-03:** Restaurant Profile & Theming Studio
  - Identity & Contact form (name, tagline, story, address, phone, WhatsApp)
  - Brand color picker (hex input + visual preview)
  - Theme preset selector (Clean White, Warm Cream, Midnight Charcoal) with radio cards
  - Currency selector and position (prefix/suffix)
  - 7-day operating hours editor with open/close time inputs and "Closed" toggles
- **SCR-ADMIN-04:** Category Management Studio
  - Category list with reordering (up/down arrows or drag-and-drop via `@dnd-kit/core`)
  - Visibility toggle (Active/Hidden)
  - Create category inline form or slide-over drawer
  - Delete with safeguard modal (409 when items exist)
- **SCR-ADMIN-05:** Food Item Catalog & 86 Hub
  - Searchable, filterable dish list with category and status filters
  - 1-tap availability switch (green = Available, grey = Sold Out) with optimistic UI
  - Edit and Delete actions per row
  - Mobile card view for phone/tablet use
- **SCR-ADMIN-06:** Create / Edit Food Item Form
  - Name, Category dropdown, Price numeric input (validation)
  - Short description (160 chars) + Detailed description (500 chars) textareas
  - Veg vs. Non-Veg toggle
  - Dietary flags multi-select (Vegan, Gluten-Free, Halal, Spicy, Nut-Free, Dairy-Free)
  - 14-allergen checklist (FSSAI/EU major allergens)
  - Featured toggle (Chef's Special)
  - Image section placeholder (tab with Upload/Library/AI — tabs present, functionality in BUILD-04/05)
  - Display order field
  - Item visibility toggle (Published/Draft)

---

## D. Features Explicitly Excluded

- **NO** image upload functionality (BUILD-04)
- **NO** AI image generation (BUILD-05)
- **NO** public customer menu (BUILD-06)
- **NO** QR code studio (BUILD-07)
- **NO** ImageKit integration (BUILD-04)
- **NO** multi-user/staff roles (V2)

---

## E. Database Changes

**No new models** — all models created in BUILD-02. This phase only reads/writes to existing tables.

**Operations used:**
- `restaurantProfile.update()` — profile editing
- `operatingHours.updateMany()` — bulk hours update
- `menuCategory.create/update/delete` — category CRUD
- `menuCategory.updateMany()` — bulk `displayOrder` reorder
- `menuItem.create/update/delete` — item CRUD
- `menuItem.update({ data: { isAvailable } })` — 86 toggle
- `menuItem.updateMany()` — bulk `displayOrder` reorder

---

## F. API and Backend Requirements

All routes are authenticated (`/api/admin/*`). Auth guard: check `auth()` from NextAuth before proceeding — return 401 if no session.

### Response Envelope
```typescript
type ApiResponse<T> = {
  success: boolean
  data: T | null
  error: { code: string; message: string } | null
}
```

### Profile API (`src/app/api/admin/profile/route.ts`)

**GET /api/admin/profile**
- Returns complete `RestaurantProfile` singleton
- Excludes no fields (admin-only endpoint)

**PATCH /api/admin/profile**
```typescript
const UpdateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  tagline: z.string().max(160).nullable().optional(),
  aboutStory: z.string().max(2000).nullable().optional(),
  address: z.string().max(255).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
  whatsapp: z.string().max(30).nullable().optional(),
  currencyCode: z.string().length(3).optional(),
  currencySymbol: z.string().max(5).optional(),
  currencyPosition: z.enum(['PREFIX', 'SUFFIX']).optional(),
  themePreset: z.enum(['clean-white', 'warm-cream', 'midnight-charcoal']).optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
})
```

**PATCH /api/admin/profile/hours** (`src/app/api/admin/profile/hours/route.ts`)
```typescript
const UpdateHoursSchema = z.array(z.object({
  dayOfWeek: z.number().min(0).max(6),
  openTime: z.string().regex(/^\d{2}:\d{2}$/),
  closeTime: z.string().regex(/^\d{2}:\d{2}$/),
  isClosed: z.boolean(),
})).length(7)
```

### Categories API (`src/app/api/admin/categories/route.ts`)

**POST /api/admin/categories**
```typescript
const CreateCategorySchema = z.object({
  name: z.string().min(2).max(60),
  subtitle: z.string().max(160).optional(),
  displayOrder: z.number().int().min(0).optional(),
})
```
Response: 201 Created with created category object.

**PUT /api/admin/categories/reorder** (`src/app/api/admin/categories/reorder/route.ts`)
```typescript
const ReorderSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
})
```
Performs `updateMany` to set `displayOrder` for each ID by array index.

**PATCH /api/admin/categories/[id]/route.ts**
```typescript
const UpdateCategorySchema = z.object({
  name: z.string().min(2).max(60).optional(),
  subtitle: z.string().max(160).nullable().optional(),
  isActive: z.boolean().optional(),
})
```

**DELETE /api/admin/categories/[id]/route.ts**
- Before deleting, check `menuItem.count({ where: { categoryId: id } })`
- If count > 0: Return `409 { error: { code: 'CATEGORY_NOT_EMPTY', message: 'Cannot delete category containing dishes...' } }`
- If count === 0: Delete and return `200 { success: true }`

### Items API

**POST/GET /api/admin/items/route.ts**
```typescript
const CreateItemSchema = z.object({
  categoryId: z.string().cuid(),
  name: z.string().min(2).max(100),
  shortDescription: z.string().max(180).optional(),
  detailedDescription: z.string().max(2000).optional(),
  price: z.number().min(0).max(99999.99),
  isVegetarian: z.boolean().default(false),
  dietaryFlags: z.array(z.string()).default([]),
  allergenFlags: z.array(z.string()).default([]),
  isAvailable: z.boolean().default(true),
  isVisible: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  displayOrder: z.number().int().min(0).default(0),
})
```

**PATCH /api/admin/items/[id]/availability/route.ts**
```typescript
const AvailabilitySchema = z.object({
  isAvailable: z.boolean(),
})
```
Returns immediately with updated item. Optimistic UI on the client.

**PUT /api/admin/items/reorder/route.ts**
```typescript
const ReorderItemsSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
})
```

**PATCH /api/admin/items/[id]/route.ts** — Full item update  
**DELETE /api/admin/items/[id]/route.ts** — Delete item (cascade deletes AI logs)

---

## G. UI/UX Requirements

### SCR-ADMIN-02: Operational Overview Dashboard
- 4 metric tiles: "Active Dishes" (green), "Sold Out (86'd)" (amber), "Categories" (neutral), "AI Credits" (progress bar)
- Quick Actions row: `[+ Add Food Item]`, `[+ Add Category]`, `[Download QR Code]`
- Welcome message: "Welcome back, [Owner Full Name]" with link to public menu
- Metric numbers animate up on page entrance (600ms count-up, Framer Motion or CSS counter)
- Apply `--surface-card`, `--canvas-bg`, `--surface-border` tokens throughout

### SCR-ADMIN-03: Profile & Theming Studio
- Tabbed or sectioned layout: Identity | Visual Assets | Brand & Theme | Localization | Hours
- Primary color picker: HTML `<input type="color">` + hex text input, with live preview
- Theme preset: 3 radio cards with visual thumbnail showing color scheme
- Hours editor: 7-row table with day name, isClosed toggle, open time input, close time input
- Auto-save with floating toast notification: "Branding updated. Reflecting on live menu."

### SCR-ADMIN-04: Category Management Studio
- Reorderable list with drag handle icon (`⠿`), 44px drag target
- Elevation shadow on drag (shadow-lg, scale 1.02, 150ms transition)
- Visibility toggle: styled switch (green = Active, grey = Hidden)
- Delete action triggers confirmation modal with item count warning
- "+ Add Category" drawer: slides in from right, min 44px inputs

### SCR-ADMIN-05: Food Item Catalog & 86 Hub
- Filter bar: search text input, category dropdown, status filter (All/Available/Sold Out)
- Each row: dish thumbnail (50×50px), name, category, price, dietary chips, **1-Tap 86 Switch**
- 86 switch: green toggle = Available; grey toggle = Sold Out
  - On toggle: optimistic UI (immediate visual update) + PATCH request
  - On error: revert to previous state + error toast
- Action menu: Edit, Delete per row

### SCR-ADMIN-06: Create/Edit Food Item Form
- Sections: Basic Info, Descriptions, Dietary & Allergens, Image
- Allergen checklist: 14 checkboxes (Celery, Cereals/Gluten, Crustaceans, Eggs, Fish, Lupin, Milk/Dairy, Molluscs, Mustard, Nuts, Peanuts, Sesame, Soya, Sulphites)
- Dietary flags: pill/chip multi-select (Vegan, Gluten-Free, Halal, Spicy, Nut-Free, Dairy-Free, Jain)
- Image section: 3 tabs `[Upload Photo]`, `[Media Library]`, `[Generate with AI]` — tabs present, functionality in BUILD-04/05
- Form validation: inline field-level errors, Zod-based
- Save button: loading state with spinner during API call
- Cancel link: navigates back to `/admin/items`

### Admin Navigation
- Sidebar on tablet/desktop: DigiNu logo, links: Dashboard, Categories, Dishes, Media, QR Code, Profile
- Bottom nav on mobile: 5 icons max
- Active state: `--brand-primary` color on active link
- "View Live Menu ↗" external link in header

---

## H. Step-by-Step Execution Plan

1. Install optional drag-and-drop: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
2. Create admin navigation layout component (sidebar + header structure)
3. Create `AdminNav` client component with active link detection via `usePathname()`
4. Build **GET/PATCH /api/admin/profile** route handler with Zod validation and auth guard
5. Build **PATCH /api/admin/profile/hours** route handler
6. Build **SCR-ADMIN-03** profile form UI (all 5 sections) with auto-save logic
7. Build **POST/GET /api/admin/categories** route handlers
8. Build **PUT /api/admin/categories/reorder** route handler
9. Build **PATCH/DELETE /api/admin/categories/[id]** route handlers
10. Build **SCR-ADMIN-04** category list with reordering and visibility toggle
11. Build **POST/GET /api/admin/items** route handlers
12. Build **PATCH /api/admin/items/[id]/availability** route handler (critical path)
13. Build **PUT /api/admin/items/reorder** and **PATCH/DELETE /api/admin/items/[id]** handlers
14. Build **SCR-ADMIN-05** item catalog with 86 toggle and optimistic UI
15. Build **SCR-ADMIN-06** create/edit form with all sections and validation
16. Build **SCR-ADMIN-02** overview dashboard (fetch metrics server-side)
17. Run full type check, lint, and build verification

---

## I. Global Skill Usage

### 1. `ui-ux-pro-max`
```bash
python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "admin dashboard data table CRUD" --domain ux
python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "form validation error handling" --domain ux
python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "drag and drop list reordering" --domain ux
```

### 2. `frontend-design`
Apply for the admin dashboard aesthetic: clean, professional SaaS feel. Brand color (`--brand-primary`) applied to active nav items, primary buttons, and 86 toggle active state.

### 3. `code-review`
Review all 10+ API route handlers:
- Auth guard present on every admin route
- Zod validation on every input
- Delete safeguard correctly queries item count before deletion
- Reorder operation is atomic (all displayOrder updates succeed or all fail)
- No N+1 queries in item list (use `include: { imageAsset: true }`)

### 4. `documentation-spec-writing`
Verify all Zod schemas have descriptive error messages. API route handlers have clear TSDoc comments.

### 5. `accessibility-review`
Audit all 5 screens:
- All form inputs have explicit `<label>` associations
- Error messages use `role="alert"`
- Drag handles have keyboard alternative (arrow buttons)
- Modals have `role="dialog"`, `aria-modal="true"`, focus trapping
- Touch targets ≥ 44×44px on all interactive elements (especially the 86 toggle)
- Color contrast for status badges meets 4.5:1

---

## J. Testing Requirements

### Unit Tests
1. `CreateItemSchema`: Valid item passes; missing name fails; negative price fails; invalid categoryId format fails
2. `AvailabilitySchema`: `{ isAvailable: false }` passes; missing field fails
3. `ReorderSchema`: Valid array passes; empty array fails; non-cuid strings fail

### Integration Tests
1. `POST /api/admin/categories` — Without auth → 401; With auth + valid body → 201; Duplicate name → 400
2. `DELETE /api/admin/categories/:id` — Category with items → 409; Empty category → 200
3. `PATCH /api/admin/items/:id/availability` — Valid toggle → 200 with updated `isAvailable`; Without auth → 401
4. `PUT /api/admin/categories/reorder` — Valid reorder → updates displayOrder in DB correctly

### UI Tests
1. 86 toggle: Click → optimistic UI update → API resolves → confirmed state maintained
2. 86 toggle: Click → API fails → reverts to previous state → error toast shown
3. Category delete: Category with 3 items → modal shows "Cannot delete, 3 items exist"
4. Form validation: Empty name → inline error; Negative price → inline error

---

## K. Security and Quality Checks

| Check | Verification |
|:---|:---|
| Auth guard on all routes | Every `/api/admin/*` route calls `auth()` and returns 401 if no session |
| Zod validation on all inputs | Every route parses input with Zod before any DB operation |
| SQL injection | Prisma's parameterized queries prevent SQL injection by default; no raw SQL used |
| CSRF protection | NextAuth.js v5 provides CSRF protection via JWT and SameSite cookie |
| Category delete safeguard | itemCount check before delete prevents orphaned items |
| Input length limits | All string fields have `.max()` constraints matching DB column lengths |
| Price validation | price ≥ 0 enforced by Zod schema; Decimal(8,2) enforced by DB |
| No sensitive data leaked | Admin endpoints exclude internal system fields from responses when needed |

---

## L. Documentation Updates

- [ ] Update `docs/02-technical-architecture\04-api-and-integration-contracts.md`: Note any API shape deviations from approved contracts
- [ ] Update `docs/04-implementation-roadmap\00-master-implementation-roadmap.md`: Mark BUILD-03 complete

---

## M. Acceptance Criteria

**Given** an authenticated owner navigates to `/admin/categories`,  
**When** they create a new category with name "Handmade Pastas",  
**Then** the category appears in the list with correct name and a 0-item count badge.

**Given** a category contains 3 food items,  
**When** the owner attempts to delete the category,  
**Then** a 409 error response is returned with message "Cannot delete category containing dishes."

**Given** the owner toggles a dish's availability from Available to Sold Out,  
**When** the toggle is clicked,  
**Then** the toggle immediately updates visually (optimistic UI) and the PATCH request completes within 500ms confirming the change.

**Given** the owner updates the brand primary color to "#2563EB",  
**When** the profile is saved,  
**Then** `restaurant_profile.primaryColor` is "#2563EB" in the database.

---

## N. Definition of Done

- [ ] Admin navigation works for all 5 screens with correct active state
- [ ] Profile CRUD: name, tagline, address, phone, theme, color, currency all save and persist
- [ ] Operating hours: 7-day editor saves correctly; validation rejects close < open time
- [ ] Category CRUD: create, edit, visibility toggle, reorder all work; delete safeguard enforced
- [ ] Item CRUD: create, edit, delete all work; dietary flags and allergen checklist save correctly
- [ ] 86 toggle: optimistic UI update + API confirmation working; error reversion working
- [ ] Item reordering: saved sequence persists to `displayOrder` column
- [ ] All Zod schemas validate inputs correctly (edge case tests pass)
- [ ] Auth guard verified: direct curl to any `/api/admin/*` without session → 401
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run lint` — zero violations
- [ ] `npm run build` — successful build

---

## O. Review and Approval Gate

Before proceeding to BUILD-04:
1. Test full CRUD cycle for categories and items in the browser
2. Verify 86 toggle works with optimistic UI on a real dish
3. Verify category delete safeguard via browser (attempt deleting category with items)
4. Run `npx tsc --noEmit && npm run lint && npm run build`
5. **Explicitly authorize** BUILD-04

---

## P. Complete AI IDE Execution Prompt

```markdown
# DigiNu — BUILD-03: Restaurant Profile & Menu Management CRUD

## Your Role
You are a Senior Full-Stack Engineer building the complete owner management dashboard for DigiNu — a Single-Tenant Restaurant Menu Platform. This phase delivers the core commercial value: restaurant owners can fully manage their menu.

## MANDATORY STEP 1: READ ALL CONTEXT

**Master Context:**
- e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md

**Global Skills (read all 5 SKILL.md files):**
- C:\Users\USER\.gemini\config\skills\ui-ux-pro-max\SKILL.md
- C:\Users\USER\.gemini\config\skills\frontend-design\SKILL.md
- C:\Users\USER\.gemini\config\skills\code-review\SKILL.md
- C:\Users\USER\.gemini\config\skills\documentation-spec-writing\SKILL.md
- C:\Users\USER\.gemini\config\skills\accessibility-review\SKILL.md

**Project-Local Skills:**
- e:\Freelance\DigiNu\.agents\skills\diginu-business-rules\SKILL.md
- e:\Freelance\DigiNu\.agents\skills\diginu-architecture-conventions\SKILL.md
- e:\Freelance\DigiNu\.agents\skills\diginu-design-rules\SKILL.md
- e:\Freelance\DigiNu\.agents\skills\diginu-test-and-review\SKILL.md
- e:\Freelance\DigiNu\.agents\skills\diginu-deployment-release\SKILL.md

**Phase Source Documents:**
- e:\Freelance\DigiNu\docs\02-technical-architecture\04-api-and-integration-contracts.md (sections 4.2, 4.3)
- e:\Freelance\DigiNu\docs\02-technical-architecture\03-data-model-and-erd.md
- e:\Freelance\DigiNu\docs\03-design-system\09-admin-screen-specifications.md (SCR-ADMIN-02 through SCR-ADMIN-06)
- e:\Freelance\DigiNu\docs\03-design-system\07-component-library-specification.md
- e:\Freelance\DigiNu\docs\03-design-system\04-design-tokens.json
- e:\Freelance\DigiNu\docs\03-design-system\10-interaction-and-motion-guidelines.md
- e:\Freelance\DigiNu\docs\04-implementation-roadmap\phases\BUILD-03-restaurant-profile-and-menu-management.md

## CRITICAL ARCHITECTURE RULES

1. **SINGLE-TENANT:** No `restaurant_id` parameter in any API route. This deployment has exactly one restaurant. All queries operate directly on the single set of records.

2. **AUTH GUARD:** Every single `/api/admin/*` route handler MUST call `const session = await auth()` and return `Response.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } }, { status: 401 })` if `!session`.

3. **RESPONSE ENVELOPE:** Every API response follows: `{ success: boolean, data: T | null, error: { code: string, message: string } | null }`

4. **ZOD VALIDATION:** Every API route parses input with a named Zod schema BEFORE any database operation. Invalid input → `422 Unprocessable Content` with field-level error details.

5. **NO HARDCODED BRANDING:** Admin UI uses `--brand-primary`, `--canvas-bg`, `--surface-card`, `--text-primary` CSS variables throughout. Never hardcode hex values in JSX.

6. **OPTIMISTIC UI FOR 86 TOGGLE:** The availability toggle MUST update the UI immediately (before the API call resolves). If the API call fails, revert the UI and show an error toast.

7. **CATEGORY DELETE SAFEGUARD:** Before deleting a category, query `prisma.menuItem.count({ where: { categoryId } })`. If count > 0, return 409 Conflict. The DB also enforces this via `onDelete: Restrict` on the foreign key.

## SCREENS TO IMPLEMENT

Implement in this order:
1. Admin navigation sidebar/header (layout.tsx update)
2. SCR-ADMIN-02: Overview Dashboard (metric counts + quick actions)
3. SCR-ADMIN-03: Restaurant Profile & Theming Studio (5 sections)
4. SCR-ADMIN-04: Category Management Studio (CRUD + reorder)
5. SCR-ADMIN-05: Food Item Catalog & 86 Hub (list + toggle)
6. SCR-ADMIN-06: Create/Edit Food Item Form (full attributes)

## KEY DESIGN TOKENS TO USE

From `docs/03-design-system/04-design-tokens.json`:
- Background: `var(--canvas-bg)` / `bg-[--canvas-bg]`
- Card surface: `var(--surface-card)` / `bg-[--surface-card]`
- Border: `var(--surface-border)` / `border-[--surface-border]`
- Primary text: `var(--text-primary)` / `text-[--text-primary]`
- Muted text: `var(--text-muted)` / `text-[--text-muted]`
- Brand primary: `var(--brand-primary)` / `bg-[--brand-primary]`
- Veg indicator: `#16A34A` (var --dietary-veg)
- Non-veg indicator: `#DC2626` (var --dietary-non-veg)
- Error: `#DC2626` (var --color-error)
- Warning: `#D97706` (var --color-warning)

## 86 TOGGLE IMPLEMENTATION

The availability toggle is a critical UX feature. Implement as:
```typescript
const [isAvailable, setIsAvailable] = useState(initialIsAvailable)

const handleToggle = async () => {
  const newValue = !isAvailable
  setIsAvailable(newValue) // Optimistic update
  try {
    const res = await fetch(`/api/admin/items/${itemId}/availability`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: newValue }),
    })
    if (!res.ok) throw new Error('Failed to update')
  } catch {
    setIsAvailable(!newValue) // Revert on error
    toast.error('Failed to update availability. Please try again.')
  }
}
```

## APPLY ALL SKILLS

1. **ui-ux-pro-max**: Search for admin dashboard UX patterns, form design, error state guidance. Apply all relevant rules to every form field and table component.

2. **accessibility-review**: Audit all 5 screens — form labels, error alerts, modal focus trapping, drag handle keyboard alternatives (arrow buttons), touch targets ≥ 44px on all interactive elements including the 86 toggle switch.

3. **code-review**: Review all 10+ API route handlers for auth guard presence, Zod validation completeness, category delete safeguard, N+1 query prevention (use Prisma `include` not sequential queries), error handling.

4. **frontend-design**: Verify admin UI aesthetic — clean, professional SaaS with the DigiNu brand. Brand primary color (`--brand-primary`) applied consistently to CTAs and active states.

5. **documentation-spec-writing**: API route handlers have TSDoc comments. Component props are typed with descriptive JSDoc.

## VERIFICATION

After all screens and APIs are implemented:
```bash
npx tsc --noEmit    # 0 errors required
npm run lint        # 0 violations required
npm run build       # Build must succeed
```

Manual testing checklist:
1. Create a category → verify it appears in list
2. Create a food item with dietary flags → verify it saves
3. Toggle dish availability → verify optimistic UI + API confirmation
4. Try to delete a category with items → verify 409 error message
5. Reorder categories → refresh page → verify new order persists
6. Edit restaurant profile color → verify saved in DB
7. Set operating hours → verify saved for all 7 days

## SCOPE GUARD: WHAT NOT TO BUILD

Do NOT implement:
- Image upload (BUILD-04)
- AI generation (BUILD-05)
- Public menu (BUILD-06)
- QR code studio (BUILD-07)
- Cart, checkout, ordering, payment, KDS, POS (NEVER)
- Customer accounts or login (NEVER)

The image section in SCR-ADMIN-06 should show 3 tabs (Upload/Library/AI) but they can display a "Coming soon" placeholder message in this phase — the tab UI structure is built, but the functionality is not yet wired.

## STOP CONDITION

After full CRUD is working, 86 toggle is verified, and all build/lint/type checks pass, STOP. Present results for developer review. Await explicit authorization before BUILD-04.
```

