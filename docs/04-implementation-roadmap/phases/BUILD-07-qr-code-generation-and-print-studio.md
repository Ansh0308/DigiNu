# BUILD-07: QR Code Generation & Print Studio

**Phase ID:** BUILD-07  
**Phase Name:** QR Code Generation & Print Studio  
**Status:** COMPLETE — Quality Gates & Full Verification Passed (Awaiting Developer Approval)  
**Effort Estimate:** Small (1–2 days)  
**Depends On:** BUILD-06 (Public Customer Menu verified)  
**Next Phase:** BUILD-08 (Testing, Security Audit & Client Deployment)  

---

## A. Phase Overview

| Field | Detail |
|:---|:---|
| **Phase ID** | BUILD-07 |
| **Objective** | Build the QR Code Studio: generate a deterministic, permanent QR code encoding the restaurant's public menu URL, provide live dashboard preview with color and logo embedding controls, track download metrics, and export print-ready assets in three formats: infinite-resolution SVG, 300 DPI high-resolution PNG (2048×2048), and print-ready A6 table-tent PDF with trim marks. |
| **Business Value** | The physical bridge connecting restaurant guests to the digital platform. High-quality vector and print assets enable the freelancer to offer branded acrylic table tents, wooden blocks, and window decals as high-margin physical upsells ($100–$250 per venue). |
| **Scope** | `src/lib/qr-generator.ts`; `GET /api/admin/qr-code/preview`; `GET /api/admin/qr-code/download`; `PATCH /api/admin/qr-code/config`; `QRPreviewCard.tsx`; QR Studio screen (SCR-ADMIN-09). |
| **Prerequisites** | BUILD-06 complete; `NEXT_PUBLIC_APP_URL` configured in `.env`; `qr_code_config` table seeded in BUILD-02. |
| **Dependencies** | BUILD-06 |

---

## B. Source Documentation

1. `e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md`
2. `e:\Freelance\DigiNu\docs\01-product-definition\01-product-requirements-document.md` — Section 4.7 (`FR-QR-*`)
3. `e:\Freelance\DigiNu\docs\01-product-definition\02-user-stories-and-acceptance-criteria.md` — Section 2.7 (`US-QR-*`)
4. `e:\Freelance\DigiNu\docs\02-technical-architecture\04-api-and-integration-contracts.md` — Section 4.6 (QR endpoints)
5. `e:\Freelance\DigiNu\docs\03-design-system\09-admin-screen-specifications.md` — SCR-ADMIN-09 (QR Studio)
6. All 5 global SKILL.md files; All 5 project-local SKILL.md files

---

## C. Features Included

- Create `src/lib/qr-generator.ts`:
  - Deterministic QR generation using `qrcode` library
  - Error correction level `H` (High, 30% error recovery) ensuring QR scans reliably even with center logo embedding
  - SVG vector string generation
  - PNG buffer generation at 2048×2048 pixels (300 DPI)
  - Center logo composite logic with circular white boundary buffer
- Create `src/lib/pdf-generator.ts`:
  - A6 table-tent PDF template (105mm × 148mm) using `pdfkit`
  - Restaurant name in Playfair Display, tagline, center QR code, "Scan to browse our digital menu" callout, and 3mm printer bleed marks
- Build `GET /api/admin/qr-code/preview`:
  - Returns dynamic SVG string and current configuration settings
- Build `GET /api/admin/qr-code/download?format=svg|png|pdf`:
  - Generates requested asset, sets `Content-Disposition: attachment; filename="{slug}-menu-qr.{format}"`, and increments `download_count` in `qr_code_config`
- Build `PATCH /api/admin/qr-code/config`:
  - Updates foreground color, background color, center logo toggle, and custom callout text
- Build `QRStudio.tsx` page (SCR-ADMIN-09):
  - Interactive live QR code preview reflecting color choices
  - Toggle switch: "Embed Restaurant Logo"
  - Color picker: Foreground (default `#1A1A1A`) and Background (default `#FFFFFF`)
  - Format download cards: SVG (vector), PNG (300 DPI), PDF (table-tent)
  - Scannability verification prompt with mobile phone instructions

---

## D. Features Explicitly Excluded

- **NO table-specific dynamic ordering URLs (`?table=5` deferred to Version 2)**
- **NO third-party dynamic QR tracking subscription services (Bitly, Beaconstac)**
- **NO print-on-demand dropshipping integration**
- **NO customer data capture upon scanning**

---

## E. Database Changes

No schema modifications. Uses existing table created in BUILD-02:
```prisma
model QRCodeConfig {
  id              String   @id @default(cuid())
  foregroundColor String   @default("#1A1A1A")
  backgroundColor String   @default("#FFFFFF")
  logoEnabled     Boolean  @default(true)
  calloutText     String   @default("Scan to View Digital Menu")
  downloadCount   Int      @default(0)
  updatedAt       DateTime @updatedAt

  @@map("qr_code_config")
}
```

---

## F. API and Backend Requirements

### 1. `GET /api/admin/qr-code/preview`
* **Access:** Authenticated Owner session required
* **Response (200 OK):**
```json
{
  "qrSvg": "<svg xmlns=...></svg>",
  "targetUrl": "https://bistrolumiere.com/",
  "config": {
    "foregroundColor": "#1A1A1A",
    "backgroundColor": "#FFFFFF",
    "logoEnabled": true,
    "calloutText": "Scan to View Digital Menu",
    "downloadCount": 14
  }
}
```

### 2. `GET /api/admin/qr-code/download`
* **Query Params:** `format=svg|png|pdf` (validated via Zod)
* **Response (200 OK):** Binary stream with appropriate MIME type:
  - SVG: `image/svg+xml`
  - PNG: `image/png`
  - PDF: `application/pdf`
* **Side Effect:** Increments `downloadCount` in `qr_code_config`

### 3. `PATCH /api/admin/qr-code/config`
* **Body:**
```json
{
  "foregroundColor": "#1A1A1A",
  "backgroundColor": "#FFFFFF",
  "logoEnabled": true,
  "calloutText": "Scan to Explore Our Culinary Creations"
}
```

---

## G. UI/UX Requirements

* **Screen:** SCR-ADMIN-09 (QR Code Studio)
* **Preview Card:** Centered white canvas with subtle border (`#EFECE6`), high-contrast rendering, and real-time update when color or logo settings toggle.
* **Download Buttons:** 3 distinct action cards with format badge, recommended use case ("Vector Print / Web / Table Tent"), and download icon.
* **Contrast Warning:** If selected foreground and background colors produce a contrast ratio < 7:1, display a visible amber alert: *"Warning: Low contrast may prevent older smartphone cameras from scanning this code."*

---

## H. Step-by-Step Execution Plan

1. Install `qrcode`, `@types/qrcode`, `pdfkit`, and `@types/pdfkit`.
2. Create `src/lib/qr-generator.ts` with SVG and PNG generation methods using Error Correction Level `H`.
3. Implement center logo composite logic using `sharp` or direct SVG `<image>` overlay with circular white background mask.
4. Create `src/lib/pdf-generator.ts` constructing A6 table-tent layout with print crop marks.
5. Build route handler `GET /api/admin/qr-code/preview`.
6. Build route handler `GET /api/admin/qr-code/download` with file streaming and download count increment.
7. Build route handler `PATCH /api/admin/qr-code/config` with Zod color hex validation.
8. Build `src/components/admin/QRPreviewCard.tsx` with live canvas rendering.
9. Build `src/app/admin/qr-studio/page.tsx` integrating preview, configuration toggles, and download buttons.
10. Test scanning generated QR codes with iOS Camera and Android Google Lens apps from both screen and printed paper.

---

## I. Global Skill Usage

| Skill | Application in BUILD-07 |
|:---|:---|
| **`ui-ux-pro-max`** | Run `python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "export download card layout" --domain ux`. Design clean download asset tiles with file metadata and recommended print use cases. |
| **`frontend-design`** | Ensure the QR studio feels like a professional print design workstation. Add live visual feedback when customizing colors. |
| **`code-review`** | Review QR generation library calls for memory leaks when streaming large 2048x2048 PNG buffers. Ensure error correction level is locked to `H` (30%) when logo embedding is enabled. |
| **`documentation-spec-writing`** | Document the exact print shop specifications (A6 dimensions, 3mm bleed, 300 DPI) in the client handover guide. |
| **`accessibility-review`** | Ensure all download buttons have explicit accessible labels indicating file type and size. Add accessible text describing the live QR code preview. |

---

## J. Testing Requirements

* **Scannability Test:** Generated QR code must decode to the exact canonical URL string `https://[domain]/`.
* **SVG Vector Test:** SVG output contains valid XML tags, scales infinitely without pixelation, and renders center logo correctly.
* **PNG Resolution Test:** Generated PNG buffer is exactly 2048×2048 pixels and 300 DPI.
* **PDF Layout Test:** Generated PDF is valid binary, opens cleanly in Acrobat/Preview, and conforms to A6 dimensions.
* **Download Counter Test:** Downloading any format increments `downloadCount` by exactly 1 in the database.

---

## K. Security and Quality Checks

- Input sanitization: ensure hex color inputs match `/^#[0-9A-Fa-f]{6}$/` to prevent injection into SVG strings.
- Canonical URL enforcement: QR code always encodes the configured `NEXT_PUBLIC_APP_URL` root domain, preventing open redirect manipulation.
- Rate limiting: download endpoint protected by standard session auth to prevent bot exhaustion of PDF generation.

---

## L. Documentation Updates

- Update `docs/PROJECT_CONTEXT_INDEX.md` with BUILD-07 completion.
- Document print shop handoff instructions in `docs/04-implementation-roadmap/03-engineering-workflow-and-quality-gates.md`.

---

## M. Acceptance Criteria

```gherkin
Scenario: Owner previews restaurant QR code
  Given the restaurant owner is logged into the admin dashboard
  When the owner navigates to /admin/qr-studio
  Then a sharp preview of the QR code encoding the public menu URL is displayed
  And the center displays the restaurant's logo surrounded by a protective white border

Scenario: Owner downloads high-res print assets
  Given the owner is in the QR Studio
  When the owner clicks "Download SVG (Infinite Vector)"
  Then an SVG file named "[restaurant-slug]-menu-qr.svg" downloads immediately
  And the download count increments by 1 in the database

Scenario: Owner downloads table-tent PDF
  Given the owner clicks "Download A6 Table Tent (PDF)"
  When the PDF generates
  Then a print-ready A6 document downloads containing the restaurant name, QR code, scan instructions, and 3mm bleed marks
```

---

## N. Definition of Done

- [ ] `qrcode` and `pdfkit` integrated without build errors.
- [ ] SVG, PNG (2048×2048, 300 DPI), and A6 PDF downloads fully operational.
- [ ] Error correction level `H` enforced for all generated codes.
- [ ] Live preview updates dynamically upon changing colors or logo toggle.
- [ ] Download metrics tracked accurately in `qr_code_config`.
- [ ] Physical smartphone camera scan verification passed on iOS and Android.

---

## O. Review and Approval Gate

Review the downloaded SVG, PNG, and PDF outputs on mobile devices and desktop printers. Confirm scannability with the developer before proceeding to BUILD-08.

---

## P. Complete AI IDE Execution Prompt

```markdown
You are acting as a Senior Full-Stack Engineer and Print Production Specialist implementing BUILD-07 of DigiNu — Reusable QR-Based Digital Restaurant Menu Platform.

## BEFORE YOU CODE:
1. Read `e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md`
2. Read all 5 global SKILL.md files in `%USERPROFILE%\.gemini\config\skills\`
3. Read all 5 project-local SKILL.md files in `e:\Freelance\DigiNu\.agents\skills\`
4. Read `e:\Freelance\DigiNu\docs\04-implementation-roadmap\phases\BUILD-07-qr-code-generation-and-print-studio.md`
5. Read `e:\Freelance\DigiNu\docs\03-design-system\09-admin-screen-specifications.md` (SCR-ADMIN-09)

## STRICT ARCHITECTURAL & SCOPE RULES:
- DETERMINISTIC URL: The QR code must encode the exact canonical public menu URL (`NEXT_PUBLIC_APP_URL`).
- HIGH ERROR CORRECTION: Always use Error Correction Level `H` (30% error recovery) so embedding the center logo never breaks camera scanning.
- SCOPE BOUNDARY: Do NOT build dynamic table ordering parameters (`?table=5`), analytics redirects, or third-party QR tracking subscriptions.

## IMPLEMENTATION STEPS:
1. Install dependencies:
   ```bash
   npm install qrcode pdfkit
   npm install -D @types/qrcode @types/pdfkit
   ```
2. Create `src/lib/qr-generator.ts`:
   - `generateQRSvg(url, options)`: Returns scalable SVG string with optional center logo `<image>` and white circle mask.
   - `generateQRPng(url, options)`: Returns 2048×2048 PNG buffer at 300 DPI.
3. Create `src/lib/pdf-generator.ts`:
   - Generates A6 table-tent (105mm × 148mm) PDF using `pdfkit`. Includes restaurant name in Playfair Display, tagline, high-res QR code, "Scan to browse our digital menu" callout, and 3mm trim marks.
4. Build `GET /api/admin/qr-code/preview`:
   - Returns SVG string and current `qr_code_config` from database.
5. Build `GET /api/admin/qr-code/download?format=svg|png|pdf`:
   - Streams requested file format with `Content-Disposition: attachment`.
   - Increments `download_count` in `qr_code_config`.
6. Build `PATCH /api/admin/qr-code/config`:
   - Updates colors and logo toggle with Zod hex color validation.
7. Build `QRStudio.tsx` (SCR-ADMIN-09) in `src/app/admin/qr-studio/page.tsx`:
   - Left pane: live interactive QR preview with color controls.
   - Right pane: 3 download cards (SVG, 300 DPI PNG, A6 Table Tent PDF) with file specs.
   - Contrast guardrail: displays warning if contrast ratio < 7:1.

## APPLY ALL 5 GLOBAL SKILLS:
- `ui-ux-pro-max`: Query `python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "export download card layout" --domain ux`. Build clean, professional asset export cards.
- `frontend-design`: Ensure clean visual hierarchy and tactile download button interactions.
- `code-review`: Review buffer streaming in download route to prevent memory leaks. Verify Error Correction Level `H`.
- `accessibility-review`: Ensure download buttons announce file format and size to screen readers.
- `documentation-spec-writing`: Document print shop guidelines (A6, 300 DPI, bleed) in client onboarding specs.

## VERIFICATION:
```bash
npx tsc --noEmit    # 0 errors
npm run lint        # 0 violations
npm run build       # Success
```
Verify manually:
1. Navigate to `http://localhost:3000/admin/qr-studio`.
2. Verify live QR code displays with center restaurant logo.
3. Download SVG; open in browser/Illustrator; verify infinite vector sharpness.
4. Download PNG; verify image dimensions are exactly 2048×2048.
5. Download PDF; verify clean A6 table-tent layout with crop marks.
6. Scan each output with iPhone Camera and Android camera; confirm immediate redirect to `http://localhost:3000/`.

## STOP CONDITION:
After verifying all 3 download formats and mobile camera scannability, STOP. Await explicit approval before BUILD-08.
```

