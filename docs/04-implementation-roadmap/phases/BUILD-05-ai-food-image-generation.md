# BUILD-05: AI Food Image Generation (Cloudflare Workers AI)

**Phase ID:** BUILD-05  
**Phase Name:** AI Food Image Generation (Cloudflare Workers AI)  
**Status:** PENDING — Awaiting BUILD-04 Completion & Developer Authorization  
**Effort Estimate:** Medium (2–3 days)  
**Depends On:** BUILD-04 (ImageKit Media Pipeline)  
**Next Phase:** BUILD-08 (Testing, Security Audit & Client Deployment)  

---

## A. Phase Overview

| Field | Detail |
|:---|:---|
| **Phase ID** | BUILD-05 |
| **Objective** | Build the complete AI Food Image Studio: culinary prompt synthesis engine from dish attributes, Cloudflare Workers AI adapter calling `flux-1-schnell` for 1 high-resolution image generation, interactive preview modal with approve/regenerate actions, mandatory human approval workflow persisting the selected image to ImageKit, and AI credit quota enforcement. |
| **Business Value** | The primary commercial differentiator of DigiNu. Independent restaurants rarely have $1,500–$5,000 for professional food photography. This feature enables owners to generate studio-grade culinary imagery in ~3 seconds, dramatically improving menu visual quality and justifying the monthly SaaS subscription. |
| **Scope** | Prompt synthesis engine; Cloudflare Workers AI REST API adapter; `POST /api/admin/ai/generate`; `POST /api/admin/ai/approve`; `AIStudioModal.tsx` component; quota display on overview dashboard; credit decrement on approval. |
| **Prerequisites** | BUILD-04 complete; `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` configured in `.env`; `AI_MODEL_ID="@cf/black-forest-labs/flux-1-schnell"` configured; restaurant has `ai_credits_balance > 0` (seeded in BUILD-02) |
| **Dependencies** | BUILD-04 |

---

## B. Source Documentation

1. `e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md`
2. `e:\Freelance\DigiNu\docs\02-technical-architecture\04-api-and-integration-contracts.md` — Section 4.5 (AI endpoints)
3. `e:\Freelance\DigiNu\docs\02-technical-architecture\01-technology-stack-decisions.md` — Section 5 (AI strategy)
4. `e:\Freelance\DigiNu\docs\02-technical-architecture\03-data-model-and-erd.md` — `ai_generation_logs`
5. `e:\Freelance\DigiNu\docs\03-design-system\09-admin-screen-specifications.md` — SCR-ADMIN-08
6. `e:\Freelance\DigiNu\docs\03-design-system\12-imagery-and-asset-guidelines.md` — AI prompt synthesis formulas
7. `e:\Freelance\DigiNu\docs\03-design-system\10-interaction-and-motion-guidelines.md` — Modal motion
8. All 5 global SKILL.md files; All 5 project-local SKILL.md files

---

## C. Features Included

- Create `src/lib/prompt-synthesizer.ts` — Builds structured culinary photography prompt
- Create `src/lib/ai-generator.ts` — Cloudflare Workers AI REST API adapter
- Build `POST /api/admin/ai/generate` — Checks credits, synthesizes prompt, calls Cloudflare AI, returns base64 preview
- Build `POST /api/admin/ai/approve` — Uploads approved base64 image to ImageKit, creates `media_assets` record, updates `menu_items.imageAssetId`, decrements `ai_credits_balance`, logs to `ai_generation_logs`
- Build `AIStudioModal.tsx` client component:
  - Shows synthesized prompt preview (editable or read-only)
  - Shows AI credit remaining badge
  - Generating state: culinary animation placeholder
  - Preview: 1 high-resolution image with zoom capability
  - Action buttons: "Approve & Apply to Dish" (primary) + "Regenerate New Photo" (secondary)
  - Mandatory gate: modal close without approving discards candidate (no auto-assign)
- Wire "Generate with AI" tab in SCR-ADMIN-06 to open `AIStudioModal`
- Wire credit counter to SCR-ADMIN-02 (dashboard stat tile)
- Implement client-side debounce on "Generate" button (prevent double-click)
- Implement server-side request deduplication/mutex check [TO CONFIRM: in-memory lock for single-deployment]
- Implement 25-second timeout on Cloudflare API call
- Graceful error handling: AI failure does not block dish text saving

---

## D. Features Explicitly Excluded

- **NO** batch 4-image generation (approved CDR-001: 1 image per request)
- **NO** side-by-side comparison grid (1-image workflow only; 4-image grid is [TO CONFIRM] optional variant)
- **NO** automatic image assignment without owner click
- **NO** AI prompt editing by the owner (prompt synthesis is fully automated)
- **NO** public customer menu (BUILD-06)
- **NO** QR studio (BUILD-07)
- **NO** automatic credit top-up or Stripe integration (manual admin operation)

---

## E. Database Changes

**No new models** — `ai_generation_logs` and `restaurant_profile` created in BUILD-02.

**Operations on approve:**
```typescript
// 1. Upload buffer to ImageKit
// 2. Create media_assets record
await prisma.mediaAsset.create({ data: { fileId, filePath, url, assetType: 'AI_GENERATED', ... } })

// 3. Link image to menu item
await prisma.menuItem.update({ where: { id: menuItemId }, data: { imageAssetId: newAsset.id } })

// 4. Decrement AI credit (atomic transaction)
await prisma.restaurantProfile.updateMany({
  data: { aiCreditsBalance: { decrement: 1 } }
})

// 5. Log the generation
await prisma.aIGenerationLog.create({ data: { menuItemId, promptSynthesized, providerModel, neuronsConsumed: 250, selectedAssetId: newAsset.id } })
```

**Use a Prisma `$transaction` to ensure credit decrement and log creation are atomic.**

---

## F. API and Backend Requirements

### `POST /api/admin/ai/generate`

**Purpose:** Synthesize culinary prompt, verify credit, call Cloudflare Workers AI for 1 image.

**Request Body:**
```typescript
const GenerateSchema = z.object({
  menuItemId: z.string().cuid(),
})
```

**Processing Logic:**
1. Verify owner session (`auth()`)
2. Fetch dish details: `prisma.menuItem.findUnique({ where: { id }, include: { category: true } })`
3. Fetch `restaurant_profile.aiCreditsBalance`
4. If `aiCreditsBalance <= 0` → return `402 { error: { code: 'INSUFFICIENT_CREDITS', message: 'No AI credits remaining...' } }`
5. Synthesize prompt using `promptSynthesizer.synthesize(item, category)`
6. Call Cloudflare Workers AI REST API (25s timeout)
7. Convert response to base64 string
8. Return `200 { data: { menuItemId, promptUsed, creditsRemaining: balance, previewUrl: "data:image/jpeg;base64,..." } }`
9. NOTE: Credits are NOT decremented on generate — only on approve. This prevents charging for failed/rejected generations.

**Cloudflare Workers AI Adapter:**
```typescript
// src/lib/ai-generator.ts
export async function generateFoodImage(prompt: string): Promise<Buffer> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/ai/run/${process.env.AI_MODEL_ID}`
  
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 25000) // 25s timeout
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        num_steps: 4,         // Minimum steps for fast generation
        width: 1024,
        height: 1024,
      }),
      signal: controller.signal,
    })
    
    if (!response.ok) {
      throw new Error(`Cloudflare AI error: ${response.status}`)
    }
    
    const imageBuffer = Buffer.from(await response.arrayBuffer())
    return imageBuffer
  } finally {
    clearTimeout(timeout)
  }
}
```

### Culinary Prompt Synthesizer (`src/lib/prompt-synthesizer.ts`)

```typescript
export function synthesizeCulinaryPrompt(item: MenuItem, category: MenuCategory): string {
  const dishName = item.name
  const description = item.shortDescription || item.detailedDescription || ''
  const dietaryContext = item.dietaryFlags.join(', ')
  const categoryName = category.name

  return [
    `Commercial food photography of ${dishName}`,
    description ? `featuring ${description.substring(0, 80)}` : '',
    `professionally plated on a ceramic or stone plate`,
    `45-degree overhead angle, macro culinary lighting`,
    `fresh garnish, artisanal plating, restaurant-quality presentation`,
    `warm natural side lighting, shallow depth of field, food magazine style`,
    dietaryContext ? `(${dietaryContext} dish)` : '',
    `Category: ${categoryName}`,
    `--no plastic, cartoon, blurry, distorted, raw ingredients, artificial looking, watermark, text, logo`,
  ].filter(Boolean).join(', ')
}
```

### `POST /api/admin/ai/approve`

**Purpose:** Upload approved image buffer to ImageKit, link to dish, decrement credit, log.

**Request Body:**
```typescript
const ApproveSchema = z.object({
  menuItemId: z.string().cuid(),
  imageBufferBase64: z.string().min(100), // base64 encoded image
  promptUsed: z.string().min(10),
})
```

**Processing Logic:**
1. Verify owner session
2. Verify `aiCreditsBalance >= 1` (double-check server-side)
3. Convert base64 to Buffer
4. Upload to ImageKit server-side: `imagekit.upload({ file: buffer, fileName, folder: '/restaurants/{slug}/ai-generated/', useUniqueFileName: true })`
5. In Prisma transaction: create `media_assets`, update `menu_items`, decrement `ai_credits_balance`, create `ai_generation_logs`
6. Return `200 { data: { menuItemId, imageAssetId, imageUrl } }`

---

## G. UI/UX Requirements

### SCR-ADMIN-08: AI Food Image Studio Modal

**Trigger:** Click `[✨ Generate with AI]` tab in SCR-ADMIN-06 food item form.

**Modal Structure:**
```
+----------------------------------------------------------+
|  ✨ AI Food Image Studio                              [✕] |
|----------------------------------------------------------|
|  Dish: Truffle Burrata Bruschetta                        |
|  Credits: ████████████░░░ 22 / 30 remaining this month  |
|----------------------------------------------------------|
|  Generated Prompt (read-only):                           |
|  "Commercial food photography of Truffle Burrata..."     |
|----------------------------------------------------------|
|  [GENERATING STATE]                                      |
|  🍳 Chef AI is plating your dish...                      |
|  Animated shimmer placeholder (16:9 aspect ratio)        |
|  "Generating culinary image, please wait ~3 seconds"     |
|                                                          |
|  [PREVIEW STATE - after generation]                      |
|  High-resolution food photo (16:9, min 300px height)     |
|  [🔍 Tap to zoom]                                        |
|                                                          |
|  [⭐ Approve & Apply to Dish]  [🔄 Regenerate New Photo] |
|                                                          |
|  Regenerating uses 0 credits. Approving uses 1 credit.   |
+----------------------------------------------------------+
```

**Motion Requirements (from `docs/03-design-system/10-interaction-and-motion-guidelines.md`):**
- Modal entrance: `translateY(100%) → translateY(0)`, `cubic-bezier(0.16, 1, 0.3, 1)`, 350ms
- Backdrop: opacity 0 → 0.4 black, 200ms
- Preview image fade-in after generation: opacity 0 → 1, 300ms
- Error shake animation: `translateX(-4px → 4px → 0)`, 300ms

**Key Behaviors:**
- Closing modal WITHOUT approving: candidate image is discarded, no DB changes
- Double-clicking "Generate" or "Approve": debounced client-side + disabled while loading
- 0 credits: Approve button disabled; tooltip "No credits remaining. Contact your administrator."
- Generation taking >8s: Show "Still generating... this can take up to 25 seconds"
- Generation timeout (>25s): Toast error "AI generation timed out. Please try again or upload a photo manually."
- Generation API error: Toast error "Could not generate image. Your dish and existing photo are unaffected."

**Accessibility:**
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby="ai-studio-title"`
- Focus trapped within modal while open
- Escape key closes modal (discards candidate without approval)
- "Approve" button: `aria-busy="true"` during approval upload
- Error messages: `role="alert"`, `aria-live="assertive"`

---

## H. Step-by-Step Execution Plan

1. Create `src/lib/prompt-synthesizer.ts` with `synthesizeCulinaryPrompt()` function
2. Create `src/lib/ai-generator.ts` with `generateFoodImage()` Cloudflare REST adapter (25s timeout)
3. Build `POST /api/admin/ai/generate` route handler (verify credits, synthesize, call CF AI, return base64)
4. Build `POST /api/admin/ai/approve` route handler (upload to ImageKit, Prisma transaction)
5. Create `AIStudioModal.tsx` client component (all states: idle, generating, preview, error)
6. Integrate "Generate with AI" action in SCR-ADMIN-06 to open `AIStudioModal` with `menuItemId`
7. After approve: update food item form's `imageAssetId` with the new asset
8. Update SCR-ADMIN-02 dashboard: wire AI credit tile to live `aiCreditsBalance`
9. Test: generate a prompt → verify synthesized text includes dish name, angle, lighting, negatives
10. Test: approve an image → verify ImageKit upload + DB records + credit decrement
11. Test: 0-credit scenario → verify server-side block before calling Cloudflare API
12. Test: simulate timeout → verify graceful error message
13. Run build verification

---

## I. Global Skill Usage

### 1. `ui-ux-pro-max`
```bash
python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "modal dialog loading state" --domain ux
python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "AI generation progress animation" --domain ux
```

### 2. `frontend-design`
Apply for the AI Studio modal design: the "Chef AI is plating your dish..." generating state should feel premium and culinary-themed. Animated shimmer skeleton for the loading state.

### 3. `code-review`
Critical review points:
- `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` only used server-side, never in client bundle
- Credit check is server-side before calling Cloudflare API (not client-side only)
- Approve endpoint uses Prisma `$transaction` for atomicity (credit decrement + log creation)
- Double-click protection: client-side debounce AND server-side request locking [TO CONFIRM mechanism]
- 25-second timeout is properly implemented with `AbortController`
- Base64 image buffer size limit checked before ImageKit upload (guard against malformed responses)

### 4. `documentation-spec-writing`
Document: prompt synthesis formula clearly commented in `prompt-synthesizer.ts`. Cloudflare Workers AI API call structure clearly commented in `ai-generator.ts`. The mandatory human approval requirement (AI images NEVER auto-assigned) must be commented in the approve endpoint.

### 5. `accessibility-review`
Full audit of AIStudioModal (SCR-ADMIN-08):
- Focus trap while modal is open
- Escape key closes and discards
- role="dialog" and aria-modal="true"
- aria-labelledby pointing to modal title
- Generating state announced via aria-live="polite"
- Approval button aria-busy during upload
- Error states use role="alert"

---

## J. Testing Requirements

### Unit Tests
1. `synthesizeCulinaryPrompt()`: Returns string containing dish name; Contains "45-degree" or "overhead angle"; Contains negative prompt markers ("--no"); Non-empty description included; Empty description falls back gracefully
2. `GenerateSchema`: Valid menuItemId passes; Non-cuid string fails
3. `ApproveSchema`: Valid body passes; Short base64 fails; Missing menuItemId fails

### Integration Tests
1. `POST /api/admin/ai/generate` — Without auth → 401; With 0 credits → 402; With valid credits → 200 with previewUrl
2. `POST /api/admin/ai/approve` — Valid base64 + menuItemId → 200; `menu_items.imageAssetId` updated; `ai_credits_balance` decremented by 1; `ai_generation_logs` record created

### Manual Tests
1. Generate image → preview appears in modal (not in browser console)
2. Approve → dish image updates in item form
3. Regenerate → new image shown without credit decrement
4. Close without approving → dish image UNCHANGED, credit UNCHANGED
5. 0 credits → "Generate" button is blocked server-side

---

## K. Security and Quality Checks

| Check | Verification |
|:---|:---|
| Cloudflare API token server-side only | `grep -r "CLOUDFLARE_API_TOKEN" src/` → Only in `lib/ai-generator.ts` and `api/admin/ai/*` routes |
| Credit check is server-side | `POST /api/admin/ai/generate` checks `aiCreditsBalance` BEFORE calling Cloudflare API |
| Mandatory approval gate | Generating does NOT decrement credits; only approving does |
| AI image never auto-assigned | Closing modal without approving leaves `menu_items.imageAssetId` unchanged |
| Atomic credit decrement | Prisma `$transaction` wraps credit decrement + log creation |
| Input validation | Both endpoints use Zod schemas; malformed base64 rejected |
| Timeout protection | 25s timeout prevents open connections to Cloudflare API |
| Client debounce | Generate and Approve buttons debounced (disabled during pending requests) |

---

## L. Documentation Updates

- [ ] Update `docs/02-technical-architecture/04-api-and-integration-contracts.md`: Confirm AI endpoint shapes match implementation
- [ ] Update `docs/04-implementation-roadmap/00-master-implementation-roadmap.md`: Mark BUILD-05 complete
- [ ] Add CDR-001 implementation note: 1-image workflow implemented as approved

---

## M. Acceptance Criteria

**Given** an owner clicks "Generate with AI" on a dish with name "Truffle Burrata Bruschetta",  
**When** the generation completes in the AI Studio modal,  
**Then** a food photo preview appears and the synthesized prompt text includes "Truffle Burrata Bruschetta", "45-degree", and negative constraints.

**Given** an owner clicks "Approve & Apply to Dish",  
**When** the approval completes,  
**Then** (1) the image is stored in ImageKit under `/ai-generated/`, (2) `menu_items.imageAssetId` is updated, (3) `ai_credits_balance` is decremented by exactly 1, and (4) an `ai_generation_logs` record exists.

**Given** an owner closes the AI Studio modal without approving,  
**When** the modal is dismissed,  
**Then** `menu_items.imageAssetId` is unchanged and `ai_credits_balance` is unchanged.

**Given** `ai_credits_balance = 0`,  
**When** the owner attempts generation,  
**Then** the server returns 402 and the modal shows "No AI credits remaining. Contact your administrator."

---

## N. Definition of Done

- [ ] Prompt synthesizer produces culinary prompts with dish name, photography directives, and negative constraints
- [ ] Generate endpoint: credits verified server-side before Cloudflare API call
- [ ] Generate endpoint: returns base64 preview URL in < 15s (usually < 5s)
- [ ] AI Studio modal: 3 states work (generating, preview, error)
- [ ] Escape/close without approving: no DB changes made
- [ ] Approve endpoint: Prisma transaction (media_assets + menu_items + credits + logs) is atomic
- [ ] Double-click protection: works on both Generate and Approve buttons
- [ ] 25-second timeout: implemented with AbortController; graceful error message shown
- [ ] API token: confirmed not in client-side bundle via `npx next build` and bundle inspection
- [ ] Credit counter on SCR-ADMIN-02 reflects current `ai_credits_balance`
- [ ] `npx tsc --noEmit` — zero errors; `npm run lint` — zero violations; `npm run build` — success

---

## O. Review and Approval Gate

Before proceeding to BUILD-06:
1. Test full AI generation → preview → approve flow with a real dish
2. Test close without approving → verify no DB changes
3. Test 0-credit scenario via Prisma Studio (temporarily set balance to 0) → verify server-side block
4. Inspect Next.js build output — confirm Cloudflare API token not in client bundle
5. Run `npx tsc --noEmit && npm run lint && npm run build`
6. **Explicitly authorize** BUILD-06

---

## P. Complete AI IDE Execution Prompt

```markdown
# DigiNu — BUILD-05: AI Food Image Generation (Cloudflare Workers AI)

## Your Role
You are a Senior Backend and AI Integration Engineer implementing the AI Food Image Studio for DigiNu. This is the platform's primary commercial differentiator — enabling restaurant owners to generate studio-quality food photography in ~3 seconds.

## MANDATORY STEP 1: READ ALL CONTEXT

**Master Context:** e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md

**Global Skills:** Read all 5 SKILL.md files in C:\Users\USER\.gemini\config\skills\

**Project-Local Skills:** Read all 5 SKILL.md files in e:\Freelance\DigiNu\.agents\skills\

**Phase Source Documents:**
- e:\Freelance\DigiNu\docs\02-technical-architecture\04-api-and-integration-contracts.md (Section 4.5)
- e:\Freelance\DigiNu\docs\02-technical-architecture\01-technology-stack-decisions.md (Section 5)
- e:\Freelance\DigiNu\docs\02-technical-architecture\03-data-model-and-erd.md (ai_generation_logs)
- e:\Freelance\DigiNu\docs\03-design-system\09-admin-screen-specifications.md (SCR-ADMIN-08)
- e:\Freelance\DigiNu\docs\03-design-system\12-imagery-and-asset-guidelines.md
- e:\Freelance\DigiNu\docs\03-design-system\10-interaction-and-motion-guidelines.md
- e:\Freelance\DigiNu\docs\04-implementation-roadmap\phases\BUILD-05-ai-food-image-generation.md

## APPROVED AI CONFIGURATION (CDR-001 — MUST FOLLOW EXACTLY)

Per the approved Change Decision Record CDR-001:
- **1 image generated per request** (NOT 4-5 variations)
- Model: `@cf/black-forest-labs/flux-1-schnell`
- Resolution: 1024×1024
- Steps: 4 (minimum for fast generation ~3-4 seconds)
- Neurons consumed: ~250 per image
- Owner workflow: Generate → Inspect preview → Approve OR Regenerate
- **AI images are NEVER automatically assigned to a dish without explicit owner approval**

## CRITICAL RULES

1. **NO auto-assignment:** Closing the modal without clicking "Approve & Apply" must leave `menu_items.imageAssetId` completely unchanged.

2. **Credits on approve only:** `ai_credits_balance` is decremented ONLY when "Approve & Apply" is clicked. Generating (even multiple times with Regenerate) does NOT use credits.

3. **Server-side credit check:** The generate endpoint checks `aiCreditsBalance >= 1` BEFORE calling Cloudflare API. The client UI can show 0-credit state, but the server is the authoritative gate.

4. **Atomic approve transaction:** The approve endpoint wraps these operations in a Prisma `$transaction`:
   - `mediaAsset.create()`
   - `menuItem.update({ imageAssetId })`
   - `restaurantProfile.updateMany({ aiCreditsBalance: { decrement: 1 } })`
   - `aIGenerationLog.create()`

5. **Cloudflare credentials server-side only:** `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` MUST NEVER appear in the client bundle. Verify this after build.

6. **25-second timeout:** Use `AbortController` to cancel the Cloudflare request after 25 seconds. Return a graceful error message.

## CLOUDFLARE WORKERS AI REST API

Call the REST API directly (do NOT install any Cloudflare SDK package):

```typescript
const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/@cf/black-forest-labs/flux-1-schnell`

const response = await fetch(url, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ prompt, num_steps: 4, width: 1024, height: 1024 }),
  signal: abortController.signal,  // 25-second timeout
})

// Response is an image binary (not JSON)
const buffer = Buffer.from(await response.arrayBuffer())
const base64 = buffer.toString('base64')
const previewUrl = `data:image/jpeg;base64,${base64}`
```

## PROMPT SYNTHESIS FORMULA

The prompt synthesizer in `src/lib/prompt-synthesizer.ts` must produce:
```
"Commercial food photography of [DISH NAME], [SHORT DESCRIPTION EXCERPT],
professionally plated on a ceramic or stone plate, 45-degree overhead angle,
macro culinary lighting, fresh garnish, artisanal plating, restaurant-quality
presentation, warm natural side lighting, shallow depth of field, food magazine
style, [DIETARY CONTEXT if any], Category: [CATEGORY NAME], --no plastic, cartoon,
blurry, distorted, raw ingredients, artificial looking, watermark, text, logo"
```

## SCR-ADMIN-08: AI STUDIO MODAL

The modal must have 3 visual states:
1. **Generating state:** Shimmer placeholder (16:9 aspect ratio, matches image preview size), "Chef AI is plating your dish..." text, pulsing animation
2. **Preview state:** Actual generated image (displayed from base64 `previewUrl` via `<img>` tag, NOT `next/image`), "Approve & Apply" primary button, "Regenerate" secondary button
3. **Error state:** Error icon, error message toast, "Try Again" button, "Upload Manually" link

Modal animation: slides up from bottom, spring physics: `cubic-bezier(0.16, 1, 0.3, 1)`, 350ms.
Dismiss: Escape key or backdrop click → close WITHOUT approving (zero DB changes).

## APPLY ALL SKILLS

1. **code-review**: Review ai/generate and ai/approve route handlers for: credit check before API call, Cloudflare credentials only server-side, atomic transaction for approve, timeout implementation, double-click protection.

2. **accessibility-review**: Full audit of AIStudioModal: role="dialog", aria-modal="true", aria-labelledby, focus trap, Escape key dismissal, aria-live for generating state, aria-busy on approve button, role="alert" for errors.

3. **ui-ux-pro-max**: Search "AI generation loading state modal" and "image preview approval UX". Apply guidance on loading state design and confirmation CTA patterns.

4. **frontend-design**: The "Chef AI is plating your dish..." state should feel premium, culinary, and exciting — not generic. Pulsing animation or gradient shimmer.

5. **documentation-spec-writing**: Comment the culinary prompt formula. Document why credits are charged on approve (not generate). Document the mandatory approval gate in the approve endpoint.

## VERIFICATION

```bash
npx tsc --noEmit    # 0 errors
npm run lint        # 0 violations
npm run build       # Success
```

Manual testing:
1. Create a dish with name and description
2. Click "Generate with AI" → AI Studio modal opens
3. Confirm generating state appears (shimmer + text)
4. After generation: food photo preview appears
5. Click "Approve & Apply to Dish" → check Prisma Studio: media_assets record created, menu_items.imageAssetId updated, ai_credits_balance decremented by 1, ai_generation_logs record created
6. Click "Regenerate" → new photo generated → verify credit NOT decremented yet
7. Close modal without approving → check Prisma Studio: no changes to dish image or credits
8. Set ai_credits_balance to 0 in Prisma Studio → try generate → verify 402 error response

## STOP CONDITION

After full AI generation → approve → DB verification is complete, STOP. Present results for developer review. Await explicit authorization before BUILD-06. This phase's work (AI generation) can run in parallel with BUILD-06 development (public menu) if the developer chooses, but both must be complete before BUILD-08.
```

