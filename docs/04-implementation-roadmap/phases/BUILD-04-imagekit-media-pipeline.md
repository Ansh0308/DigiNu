# BUILD-04: ImageKit Media Pipeline

**Phase ID:** BUILD-04  
**Phase Name:** ImageKit Media Pipeline  
**Status:** PENDING — Awaiting BUILD-03 Completion & Developer Authorization  
**Effort Estimate:** Medium (2–3 days)  
**Depends On:** BUILD-03 (Restaurant Profile & Menu Management CRUD)  
**Next Phase:** BUILD-05 (AI Food Image Generation)  

---

## A. Phase Overview

| Field | Detail |
|:---|:---|
| **Phase ID** | BUILD-04 |
| **Objective** | Implement the complete ImageKit media pipeline: HMAC-SHA1 upload authentication token generation, direct client-side upload from browser to ImageKit CDN, metadata persistence to `media_assets` database table, and media library browser with gallery and filter tabs. |
| **Business Value** | Enables restaurant owners to attach real food photography to dishes and upload their logo/banner, transforming text-only menus into visually rich, commercially compelling digital experiences. Photography is proven to increase order value and customer satisfaction. |
| **Scope** | HMAC auth endpoint; direct client upload component; media confirm endpoint; logo/banner upload in profile; food image attachment in item form; media library screen (SCR-ADMIN-07). |
| **Prerequisites** | BUILD-03 complete; `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`, `IMAGEKIT_FOLDER_PREFIX` environment variables configured |
| **Dependencies** | BUILD-03 |

---

## B. Source Documentation

1. `e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md`
2. `e:\Freelance\DigiNu\docs\02-technical-architecture\04-api-and-integration-contracts.md` — Sections 4.4 (ImageKit endpoints)
3. `e:\Freelance\DigiNu\docs\02-technical-architecture\03-data-model-and-erd.md` — `media_assets` entity
4. `e:\Freelance\DigiNu\docs\02-technical-architecture\05-security-and-deployment.md` — Section 3.1 ImageKit Upload Security
5. `e:\Freelance\DigiNu\docs\03-design-system\09-admin-screen-specifications.md` — SCR-ADMIN-07
6. `e:\Freelance\DigiNu\docs\03-design-system\12-imagery-and-asset-guidelines.md` — ImageKit URL recipes
7. `e:\Freelance\DigiNu\docs\03-design-system\04-design-tokens.json`
8. All 5 global SKILL.md files; All 5 project-local SKILL.md files

---

## C. Features Included

- Install `imagekit` (server SDK) package
- Create `src/lib/imagekit.ts` — ImageKit server SDK adapter singleton
- Build `GET /api/admin/media/imagekit-auth` — HMAC-SHA1 signature endpoint
- Build `POST /api/admin/media/confirm` — Persist `media_assets` record after successful upload
- Build `ImageKitUploader.tsx` client component with drag-and-drop + file browser upload
- Integrate uploader into SCR-ADMIN-03 (logo + banner upload slots)
- Integrate uploader into SCR-ADMIN-06 (food item image, Upload tab)
- Build Media Library screen (SCR-ADMIN-07) with filter tabs and grid gallery
- Implement server-side MIME type validation (magic number check) before HMAC is issued
- Wire image selection from media library into food item form (Media Library tab)
- Implement image deletion (delete from `media_assets` DB; ImageKit deletion optional [TO CONFIRM: whether to call ImageKit delete API or leave orphaned until manual cleanup])

---

## D. Features Explicitly Excluded

- **NO** AI image generation (BUILD-05)
- **NO** public customer menu rendering (BUILD-06)
- **NO** QR code studio (BUILD-07)
- **NO** per-client ImageKit account provisioning (architecture uses central account with folder isolation)
- **NO** image cropping UI (beyond what ImageKit URL transforms provide)
- **NO** video upload support (images only)

---

## E. Database Changes

**No new models** — `media_assets` table created in BUILD-02. This phase fills it with real records.

**Operations:**
- `mediaAsset.create()` — after successful ImageKit upload
- `mediaAsset.findMany()` — media library listing
- `restaurantProfile.update({ logoAssetId, bannerAssetId })` — link branding assets
- `menuItem.update({ imageAssetId })` — link food photo
- `mediaAsset.delete()` — remove record (and optionally trigger ImageKit API delete)

**ImageKit Folder Structure:**
```
/restaurants/{IMAGEKIT_FOLDER_PREFIX}/
├── branding/            ← logos + banners
│   ├── logo.jpg
│   └── banner.jpg
├── dishes/              ← owner-uploaded food photos
│   └── calamari_xyz.jpg
└── ai-generated/        ← AI-approved food photos (BUILD-05)
    └── truffle-pasta_ai.webp
```

---

## F. API and Backend Requirements

### `GET /api/admin/media/imagekit-auth`

**Purpose:** Generate HMAC-SHA1 authentication parameters for direct client-side upload to ImageKit.  
**Authentication:** Owner session required.  
**Implementation (`src/app/api/admin/media/imagekit-auth/route.ts`):**

```typescript
import ImageKit from 'imagekit'
import { auth } from '@/lib/auth'

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
})

export async function GET(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ success: false, error: { code: 'UNAUTHORIZED' } }, { status: 401 })

  const folderPrefix = process.env.IMAGEKIT_FOLDER_PREFIX
  const uploadFolder = `/restaurants/${folderPrefix}/dishes`

  const authParams = imagekit.getAuthenticationParameters()
  return Response.json({
    success: true,
    data: {
      token: authParams.token,
      expire: authParams.expire,
      signature: authParams.signature,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      uploadFolder,
    },
  })
}
```

**Security notes:**
- `IMAGEKIT_PRIVATE_KEY` is NEVER sent to client — only used server-side to generate HMAC
- `expire` timestamp limits auth token validity to ~30 minutes
- `uploadFolder` restricts uploads to the restaurant's designated folder only

### `POST /api/admin/media/confirm`

**Purpose:** After successful direct upload to ImageKit, record asset metadata in `media_assets`.  
**Request body Zod schema:**
```typescript
const ConfirmUploadSchema = z.object({
  fileId: z.string().min(1).max(100),
  filePath: z.string().min(1).max(255),
  url: z.string().url().max(500),
  assetType: z.enum(['LOGO', 'BANNER', 'FOOD_UPLOAD', 'AI_GENERATED']),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sizeBytes: z.number().int().positive(),
  originalFilename: z.string().min(1).max(255),
})
```
**Response:** 201 Created with created `MediaAsset` object including generated `id`.

**Client-side direct upload flow:**
1. Client requests auth params from `/api/admin/media/imagekit-auth`
2. Client uploads directly to ImageKit API (bypassing Next.js server)
3. ImageKit returns `{ fileId, url, width, height, filePath }`
4. Client POSTs confirmation to `/api/admin/media/confirm`
5. Server saves `media_assets` record
6. Client receives `assetId` and can link to dish/profile

---

## G. UI/UX Requirements

### ImageKitUploader Component (`src/components/admin/ImageKitUploader.tsx`)

Client Component with:
- Drag-and-drop zone: `"Drag photo here or click to browse"`
- File type restriction: `accept=".jpg,.jpeg,.png,.webp"`
- Max file size client-side check: 5MB warning before attempting upload
- Upload states:
  - **Idle:** Upload icon + instruction text
  - **Uploading:** Progress spinner + "Uploading..." text
  - **Success:** Thumbnail preview with ✓ checkmark overlay
  - **Error:** Error message with retry button
- After success: Display image preview (via ImageKit URL with `tr:w-200,h-200,c-maintain_ratio,f-webp`)
- "Remove Photo" button: 44×44px target, removes from form state only (server delete separate)

### SCR-ADMIN-07: Media Library Screen

- **Route:** `/admin/media`
- **Layout:** Full-width grid gallery
- **Top section:** Drag-and-drop upload zone (same `ImageKitUploader` component)
- **Filter tabs:** `All Media`, `Food Photography`, `AI Generated`, `Logos & Banners`
- **Gallery grid:** 4 columns desktop, 2 columns mobile
- Each item shows:
  - ImageKit thumbnail (200×200px, WebP via `tr:w-200,h-200,c-at_max,f-webp`)
  - On hover/focus: overlay with resolution info, file size, and "Select" button
  - For food photos: dish name it's attached to
- **Select action:** When called from item form Media Library tab → returns selected asset to parent form
- **Delete action:** Confirmation dialog before deleting from DB

### Integration into SCR-ADMIN-03 (Profile)
- Logo upload slot: 1:1 aspect ratio crop preview (200×200px), `assetType: 'LOGO'`, folder: `/branding/`
- Banner upload slot: 3:1 landscape preview (600×200px), `assetType: 'BANNER'`, folder: `/branding/`
- After upload confirm: `PATCH /api/admin/profile` with `logoAssetId` or `bannerAssetId`

### Integration into SCR-ADMIN-06 (Item Form)
- Upload tab: `ImageKitUploader` component, `assetType: 'FOOD_UPLOAD'`, folder: `/dishes/`
- After upload confirm: `imageAssetId` stored in form state, saved with item on form submit
- Shows current image preview if `imageAssetId` already set

### ImageKit URL Transformation Recipes (from `docs/03-design-system/12-imagery-and-asset-guidelines.md`)
```
Food thumbnail (card): ?tr=w-200,h-200,c-at_max,f-webp,q-85
Food full (modal):      ?tr=w-800,h-600,c-at_max,f-webp,q-90
Logo (header):          ?tr=w-200,h-200,c-maintain_ratio,f-webp
Banner (hero):          ?tr=w-1200,h-400,c-at_max,f-webp,q-85
Admin thumbnail:        ?tr=w-100,h-100,c-at_max,f-webp,q-80
```

---

## H. Step-by-Step Execution Plan

1. Install `npm install imagekit`
2. Create `src/lib/imagekit.ts` with singleton ImageKit server instance
3. Build `GET /api/admin/media/imagekit-auth` route handler
4. Build `POST /api/admin/media/confirm` route handler with `ConfirmUploadSchema`
5. Create `ImageKitUploader.tsx` client component with drag-and-drop and upload states
6. Test direct upload flow: Request auth → Upload to ImageKit → Confirm to backend → Verify `media_assets` record created
7. Integrate `ImageKitUploader` into SCR-ADMIN-03 for logo upload (branding folder)
8. Integrate `ImageKitUploader` into SCR-ADMIN-03 for banner upload (branding folder)
9. Wire logo/banner `assetId` to `PATCH /api/admin/profile`
10. Integrate `ImageKitUploader` into SCR-ADMIN-06 (Upload tab, dishes folder)
11. Build Media Library page (SCR-ADMIN-07) with grid gallery and filter tabs
12. Implement asset selection from media library into SCR-ADMIN-06 (Media Library tab)
13. Implement asset deletion (DB record + optional ImageKit API call)
14. Test MIME validation: Attempt to upload a `.txt` file renamed to `.jpg` → verify rejection
15. Run build verification

---

## I. Global Skill Usage

### 1. `ui-ux-pro-max`
```bash
python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "file upload drag drop media gallery" --domain ux
python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "image upload progress states" --domain ux
```

### 2. `frontend-design`
Apply for the media library grid aesthetic: clean, editorial photography grid. Upload zone styling — generous padding, dashed border in `--surface-border`, upload icon in `--text-muted`.

### 3. `code-review`
Review `imagekit-auth` route handler:
- `IMAGEKIT_PRIVATE_KEY` only referenced server-side (not in any `NEXT_PUBLIC_*` variable)
- HMAC token expire time is in the future (not past)
- Upload folder is correctly scoped to `IMAGEKIT_FOLDER_PREFIX`
- `confirm` endpoint validates all required fields before DB insert
- File type validation is based on actual file content, not extension

### 4. `documentation-spec-writing`
Document the two-step upload flow in code comments: auth → direct upload → confirm. This non-obvious pattern should have clear inline documentation.

### 5. `accessibility-review`
- Upload zone: keyboard-activatable (Enter/Space to open file picker)
- Upload zone: `aria-label="Upload photo — drag and drop or click to browse"`
- Progress state: `aria-live="polite"` for upload status announcements
- Error state: `role="alert"` for upload failure messages
- Delete button: `aria-label="Delete [filename]"` for each gallery item

---

## J. Testing Requirements

### Unit Tests
1. `ConfirmUploadSchema`: Valid body passes; missing `fileId` fails; invalid `assetType` fails; invalid URL fails
2. ImageKit singleton: Instance created with correct env vars

### Integration Tests
1. `GET /api/admin/media/imagekit-auth` — Without auth → 401; With auth → 200 with token/expire/signature/publicKey/uploadFolder
2. `POST /api/admin/media/confirm` — Valid body → 201 with created asset; Duplicate fileId → 409 or upsert handling; Missing field → 422
3. Media library: `GET /admin/media` loads without crashing; Gallery fetches assets from DB

### Upload Flow Test (Manual)
1. Upload a valid JPEG → Verify ImageKit URL in `media_assets.url`
2. Upload a file >5MB → Verify client-side rejection before upload attempt
3. Upload a fake image (`.txt` renamed to `.jpg`) → Verify server rejection

---

## K. Security and Quality Checks

| Check | Verification |
|:---|:---|
| Private key server-side only | `grep -r "IMAGEKIT_PRIVATE_KEY" src/` → Only in `lib/imagekit.ts` and `api/admin/media/imagekit-auth/route.ts`; Never in `NEXT_PUBLIC_*` variables |
| Upload folder scoped | Auth token's `uploadFolder` is `/restaurants/{IMAGEKIT_FOLDER_PREFIX}/dishes` — not `/` or any other path |
| MIME validation | ImageKit automatically validates file types on their end; additionally validate `assetType` field in confirm endpoint |
| File size limit | Client-side 5MB check; ImageKit rejects >25MB by default |
| Auth on all media routes | Both `imagekit-auth` and `confirm` endpoints check session before proceeding |
| No private key in logs | Verify `console.log` statements don't accidentally print the private key |

---

## L. Documentation Updates

- [ ] Update `docs/02-technical-architecture/04-api-and-integration-contracts.md`: Confirm any deviations from documented contracts
- [ ] Update `docs/04-implementation-roadmap/00-master-implementation-roadmap.md`: Mark BUILD-04 complete

---

## M. Acceptance Criteria

**Given** an authenticated owner clicks the logo upload zone,  
**When** they select a valid JPEG under 5MB,  
**Then** the image uploads to ImageKit, a `media_assets` record is created, and the logo preview appears in the profile section.

**Given** an owner attempts to upload a `.txt` file renamed to `.jpg`,  
**When** the upload is submitted,  
**Then** the upload is rejected with an error message "Invalid file type. Please upload a JPEG, PNG, or WebP image."

**Given** `GET /api/admin/media/imagekit-auth` is called without an authenticated session,  
**When** the response is received,  
**Then** the response status is 401 Unauthorized with no HMAC signature included.

**Given** a food item has an image selected from the media library,  
**When** the item form is saved,  
**Then** `menu_items.imageAssetId` is updated with the selected asset's ID.

---

## N. Definition of Done

- [ ] Logo upload: selects file → uploads to ImageKit `/restaurants/{slug}/branding/` → `media_assets` record created → `restaurant_profile.logoAssetId` updated
- [ ] Banner upload: same flow to `/branding/` folder
- [ ] Food image upload: selects file → uploads to `/dishes/` folder → `media_assets` record → available in item form
- [ ] Media Library (SCR-ADMIN-07): loads all assets from DB; filter tabs work
- [ ] Image selection from media library → wired to food item form state
- [ ] Auth check: calling `imagekit-auth` without session → 401
- [ ] `IMAGEKIT_PRIVATE_KEY` confirmed not in any client-side bundle (inspect build output)
- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] `npm run lint` — zero violations
- [ ] `npm run build` — successful build

---

## O. Review and Approval Gate

Before proceeding to BUILD-05:
1. Test full upload flow for logo, banner, and food image
2. Open browser DevTools Network tab — confirm `IMAGEKIT_PRIVATE_KEY` is NEVER sent to client
3. Inspect ImageKit dashboard — confirm files appear in correct folder structure
4. Test file size limit and fake file rejection
5. Run build verification commands
6. **Explicitly authorize** BUILD-05

---

## P. Complete AI IDE Execution Prompt

```markdown
# DigiNu — BUILD-04: ImageKit Media Pipeline

## Your Role
You are a Senior Backend and Integration Engineer implementing the ImageKit CDN media pipeline for DigiNu. This phase enables restaurant owners to upload food photography and branding assets directly to ImageKit CDN.

## MANDATORY STEP 1: READ ALL CONTEXT

**Master Context:** e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md

**Global Skills:** Read all 5 SKILL.md files in C:\Users\USER\.gemini\config\skills\

**Project-Local Skills:** Read all 5 SKILL.md files in e:\Freelance\DigiNu\.agents\skills\

**Phase Source Documents:**
- e:\Freelance\DigiNu\docs\02-technical-architecture\04-api-and-integration-contracts.md (Section 4.4)
- e:\Freelance\DigiNu\docs\02-technical-architecture\05-security-and-deployment.md (Section 3.1)
- e:\Freelance\DigiNu\docs\02-technical-architecture\03-data-model-and-erd.md (media_assets entity)
- e:\Freelance\DigiNu\docs\03-design-system\09-admin-screen-specifications.md (SCR-ADMIN-07)
- e:\Freelance\DigiNu\docs\03-design-system\12-imagery-and-asset-guidelines.md
- e:\Freelance\DigiNu\docs\04-implementation-roadmap\phases\BUILD-04-imagekit-media-pipeline.md

## CRITICAL SECURITY RULE

The `IMAGEKIT_PRIVATE_KEY` environment variable MUST NEVER:
- Be referenced in any `NEXT_PUBLIC_*` variable
- Be included in any response body
- Be logged to console
- Appear in the client-side JavaScript bundle

It is ONLY used in `src/lib/imagekit.ts` (server-side singleton) and `src/app/api/admin/media/imagekit-auth/route.ts`.

## UPLOAD FLOW (Two-Step Pattern)

The ImageKit direct upload flow has two server roundtrips:

**Step 1: Get Auth Token (server → client)**
Client calls `GET /api/admin/media/imagekit-auth`
Server generates HMAC-SHA1 signature using private key
Server returns: `{ token, expire, signature, publicKey, uploadFolder }`

**Step 2: Direct Upload (client → ImageKit CDN)**
Client uploads directly to `https://upload.imagekit.io/api/v2/files/upload`
Using the token, expire, and signature from Step 1
ImageKit validates the signature and accepts the file
ImageKit returns: `{ fileId, filePath, url, width, height, size }`

**Step 3: Confirm Upload (client → server)**
Client POSTs to `POST /api/admin/media/confirm` with the ImageKit response data
Server creates `media_assets` record in PostgreSQL
Server returns the created asset with its DB `id`

## IMAGEKIT FOLDER STRUCTURE

```
/restaurants/{IMAGEKIT_FOLDER_PREFIX}/
├── branding/     ← Logo + banner uploads (assetType: LOGO or BANNER)
├── dishes/       ← Owner-uploaded food photos (assetType: FOOD_UPLOAD)
└── ai-generated/ ← AI-approved photos (assetType: AI_GENERATED) — created in BUILD-05
```

The `uploadFolder` in the auth token MUST correctly point to the right subfolder based on the upload context (branding vs. dishes).

## IMAGE TRANSFORMATIONS (from docs/03-design-system/12-imagery-and-asset-guidelines.md)

Always append ImageKit transformation parameters when displaying images:
- Food thumbnail: `?tr=w-200,h-200,c-at_max,f-webp,q-85`
- Food hero (item form preview): `?tr=w-800,h-600,c-at_max,f-webp,q-90`
- Logo: `?tr=w-200,h-200,c-maintain_ratio,f-webp`
- Banner: `?tr=w-1200,h-400,c-at_max,f-webp,q-85`
- Admin grid thumbnail: `?tr=w-100,h-100,c-at_max,f-webp,q-80`

Always use `next/image` with `unoptimized={false}` for ImageKit URLs (Next.js handles the loading optimization; ImageKit handles the format/quality transformation via URL params).

## PACKAGES TO INSTALL

```bash
npm install imagekit
```

## APPLY ALL SKILLS

1. **code-review**: Review imagekit-auth route for private key security. Review confirm route for Zod validation completeness. Verify folder scoping is correct.

2. **accessibility-review**: Audit ImageKitUploader component — keyboard activation, aria-labels, progress state announcements, error role="alert".

3. **ui-ux-pro-max**: Search for file upload UX patterns. Apply drag-and-drop zone design guidelines. Verify upload states (idle/uploading/success/error) are clearly communicated.

4. **frontend-design**: Media library grid aesthetic — clean, editorial photo display with consistent thumbnail sizing.

5. **documentation-spec-writing**: Document the two-step upload flow in ImageKitUploader component and both API route handlers with clear comments explaining why the flow works this way.

## VERIFICATION

```bash
npm install imagekit
npx tsc --noEmit    # 0 errors
npm run lint        # 0 violations
npm run build       # Success
```

Manual testing:
1. Upload logo → check ImageKit dashboard → check DB `media_assets` table
2. Upload food photo → verify folder is `/restaurants/{slug}/dishes/`
3. Open browser Network tab during upload → confirm private key is NOT in any request/response
4. Try uploading non-image file → verify rejection
5. Media library page loads and shows uploaded assets
6. Select image from media library → verify it's linked in food item form

## STOP CONDITION

After upload flow is verified end-to-end (upload → ImageKit → confirm → DB → display), STOP. Present results for developer review. Await explicit authorization before BUILD-05.
```

