# BUILD-01: Project Foundation & Design System Setup

**Phase ID:** BUILD-01  
**Phase Name:** Project Foundation & Design System Setup  
**Status:** IN PROGRESS (ADR-002 Approved by Freelancer)  
**Effort Estimate:** Medium (1–2 days)  
**Depends On:** None (First Phase)  
**Next Phase:** BUILD-02 (Database Schema, Prisma ORM & Owner Authentication)  

> [!NOTE]
> **APPROVED STACK RECONCILIATION (ADR-002 - APPROVED BY FREELANCER):**  
> Under [ADR-002](file:///e:/Freelance/DigiNu/docs/02-technical-architecture/10-adr-002-nextjs16-prisma7-stack-reconciliation.md), this phase executes with **Next.js 16 Active LTS (`next@^16.4.5`)**, **React 19 Stable**, **TypeScript 5.9+**, and **Tailwind CSS v4**.

---

## A. Phase Overview

| Field | Detail |
|:---|:---|
| **Phase ID** | BUILD-01 |
| **Objective** | Initialize the production-ready Next.js 16 App Router project with TypeScript strict mode, configure Tailwind CSS v4, implement the complete design token system as CSS custom properties for all 3 theme presets, establish the full directory structure, and create the `.env.example` template. |
| **Business Value** | This phase creates the reusable project template that all restaurant client deployments will clone. Getting the foundation right — strict TypeScript, correct CSS variable architecture, proper directory structure — eliminates structural tech debt across every future client deployment. |
| **Scope** | Project initialization, tooling configuration, design token CSS variables, global CSS, theme preset switching, directory structure, placeholder components, and `.env.example`. |
| **Prerequisites** | Node.js 20+ installed; npm 10+ or pnpm 9+ available; Git initialized in `e:\Freelance\DigiNu\`. |
| **Dependencies** | None — this is the first phase. |

---

## B. Source Documentation

Read these files before starting implementation:

1. `e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md` — Master context
2. `e:\Freelance\DigiNu\docs\02-technical-architecture\01-technology-stack-decisions.md` — Stack decisions
3. `e:\Freelance\DigiNu\docs\02-technical-architecture\06-environments-repository-and-git-plan.md` — Directory structure
4. `e:\Freelance\DigiNu\docs\03-design-system\04-design-tokens.json` — Design tokens (canonical values)
5. `e:\Freelance\DigiNu\docs\03-design-system\05-typography-and-content-style.md` — Typography rules
6. `e:\Freelance\DigiNu\docs\03-design-system\06-layout-grid-and-responsive-rules.md` — Breakpoints
7. `e:\Freelance\DigiNu\docs\03-design-system\03-digital-brand-guidelines.md` — Brand guidelines
8. `e:\Freelance\DigiNu\docs\04-implementation-roadmap\03-engineering-workflow-and-quality-gates.md` — Engineering rules
9. All 5 global SKILL.md files (see Section I)
10. All 5 project-local SKILL.md files (see Section I)

---

## C. Features Included

- Initialize Next.js 16 App Router project (pinned to `next@^16.4.5`) with TypeScript strict mode
- Install and configure Tailwind CSS v4 (`tailwindcss@^4.0.0`, `@tailwindcss/postcss@^4.0.0`) using CSS-first imports in `globals.css`
- Configure ESLint with Next.js recommended rules (`eslint-config-next@^16.4.5`)
- Load Google Fonts: Cormorant Garamond (or Playfair Display), Plus Jakarta Sans via `next/font/google`
- Implement all design tokens as CSS custom properties in `globals.css`
- Create CSS theme preset classes (`.theme-warm-cream`, `.theme-clean-white`, `.theme-midnight-charcoal`)
- Establish complete directory structure as per approved repository plan
- Create `src/app/layout.tsx` with root layout, font variables, theme wrapper
- Create `src/app/globals.css` with Tailwind directives + all CSS variables
- Create placeholder `src/app/page.tsx` (public menu stub)
- Create placeholder `src/app/admin/layout.tsx` (admin layout stub)
- Create `src/app/not-found.tsx` (friendly 404 screen)
- Create `.env.example` with all required variable names (no values)
- Create `tsconfig.json` with strict mode and path aliases (`@/*` → `src/*`)
- Configure `next.config.ts` with security headers and image domain allowlist (ImageKit)
- Create `.gitignore` including `.env`

---

## D. Features Explicitly Excluded

- **NO** database setup or Prisma (BUILD-02)
- **NO** authentication or login UI (BUILD-02)
- **NO** API routes (BUILD-02+)
- **NO** React components beyond structural layout shells
- **NO** actual menu data rendering (BUILD-06)
- **NO** ImageKit integration (BUILD-04)
- **NO** Cloudflare Workers AI (BUILD-05)
- **NO** npm install of Prisma, NextAuth, ImageKit, or QR code packages

---

## E. Database Changes

**None.** No database interaction in this phase.

---

## F. API and Backend Requirements

**None.** No API routes in this phase. Only project configuration files.

---

## G. UI/UX Requirements

### Design Token CSS Variables

All tokens from `docs/03-design-system/04-design-tokens.json` must be mapped to CSS custom properties in `src/app/globals.css`:

```css
:root {
  /* Brand (overridden per-restaurant via restaurant_profile) */
  --brand-primary: #B91C1C;
  --brand-primary-fg: #FFFFFF;
  --brand-accent: #F59E0B;

  /* Dietary Indicators */
  --dietary-veg: #16A34A;
  --dietary-non-veg: #DC2626;

  /* Feedback States */
  --color-success: #16A34A;
  --color-warning: #D97706;
  --color-error: #DC2626;
  --sold-out-opacity: 0.50;

  /* Motion */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-relaxed: 450ms;
  --duration-slow: 600ms;
  --ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1);
  --ease-spring-gentle: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring-snappy: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Theme: Warm Cream (Default) */
.theme-warm-cream, [data-theme="warm-cream"] {
  --canvas-bg: #FAF8F5;
  --surface-card: #FFFFFF;
  --surface-border: #EFECE6;
  --text-primary: #1C1917;
  --text-muted: #78716C;
}

/* Theme: Clean White */
.theme-clean-white, [data-theme="clean-white"] {
  --canvas-bg: #FFFFFF;
  --surface-card: #F9FAFB;
  --surface-border: #E5E7EB;
  --text-primary: #111827;
  --text-muted: #6B7280;
}

/* Theme: Midnight Charcoal */
.theme-midnight-charcoal, [data-theme="midnight-charcoal"] {
  --canvas-bg: #0F0F11;
  --surface-card: #18181B;
  --surface-border: #27272A;
  --text-primary: #F4F4F5;
  --text-muted: #A1A1AA;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0ms !important;
    transition-duration: 0ms !important;
    transform: none !important;
  }
}
```

### Typography (via next/font/google)
- **Editorial Serif:** `Cormorant_Garamond` with weights 400, 500, 600, 700; variable `--font-editorial`
- **Humanist Sans:** `Plus_Jakarta_Sans` with weights 400, 500, 600, 700; variable `--font-sans`
- Apply via CSS: `font-family: var(--font-sans);` as body default; editorial headlines use `var(--font-editorial)`

### Tailwind Configuration (tailwind.config.ts)
Map design tokens to Tailwind theme extensions so utility classes reference CSS variables:
```ts
theme: {
  extend: {
    colors: {
      'brand-primary': 'var(--brand-primary)',
      'canvas': 'var(--canvas-bg)',
      'surface': 'var(--surface-card)',
      'text-primary': 'var(--text-primary)',
      'text-muted': 'var(--text-muted)',
    },
    fontFamily: {
      editorial: ['var(--font-editorial)', 'Georgia', 'serif'],
      sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
    },
    transitionTimingFunction: {
      'spring-gentle': 'cubic-bezier(0.16, 1, 0.3, 1)',
      'spring-snappy': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    },
  },
}
```

### next.config.ts Security Headers
```ts
const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; img-src 'self' data: https://ik.imagekit.io; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; script-src 'self'; frame-ancestors 'none';"
  },
];
```

### Image Domains (next.config.ts)
```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'ik.imagekit.io' },
  ],
}
```

---

## H. Step-by-Step Execution Plan

1. **Initialize Next.js 15 Project**
   ```bash
   npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-git
   ```
   Accept defaults. Do NOT reinitialize git (repo already initialized).

2. **Verify TypeScript Strict Mode**
   Open `tsconfig.json`. Confirm `"strict": true` is set. Add if missing.

3. **Install Google Fonts via next/font**
   Edit `src/app/layout.tsx` to import `Cormorant_Garamond` and `Plus_Jakarta_Sans` from `next/font/google`. Apply as CSS variables to `<html>` element.

4. **Configure globals.css**
   Replace auto-generated Tailwind boilerplate. Add all CSS custom property declarations as specified in Section G. Preserve Tailwind directives (`@tailwind base; @tailwind components; @tailwind utilities;`).

5. **Configure tailwind.config.ts**
   Add custom color tokens, font families, transition timing functions as specified in Section G.

6. **Configure next.config.ts**
   Add security headers, image remote patterns for ImageKit, and any Next.js 15 specific settings (`experimental.reactCompiler` if applicable [TO CONFIRM]).

7. **Create Directory Structure**
   Create all directories as per `docs/02-technical-architecture/06-environments-repository-and-git-plan.md`. Empty placeholder files (`.gitkeep` or minimal exports) to preserve directory structure in git.

8. **Create Root Layout (src/app/layout.tsx)**
   - Import fonts, apply CSS variable classes
   - Semantic `<html lang="en">` with font variables
   - `<body>` with theme class (read from `restaurant_profile.theme_preset` — for now, hardcode `theme-warm-cream` as default, will be DB-driven in BUILD-03/06)

9. **Create Stub Public Page (src/app/page.tsx)**
   Server Component returning `<div>DigiNu — Public Menu (Coming in BUILD-06)</div>`. This prevents 404 on root route.

10. **Create Admin Layout Stub (src/app/admin/layout.tsx)**
    Server Component stub with basic admin container div. Navigation sidebar added in BUILD-03.

11. **Create Friendly 404 (src/app/not-found.tsx)**
    Server Component: Branded screen with DigiNu logo area, message "Restaurant Menu Unavailable", zero stack traces.

12. **Create .env.example**
    Copy the template from `docs/02-technical-architecture/06-environments-repository-and-git-plan.md` Section 2. No actual values.

13. **Verify .gitignore**
    Confirm `.env`, `.env.local`, `node_modules/`, `.next/` are all in `.gitignore`.

14. **Run Build Verification**
    ```bash
    npm run build
    npm run dev
    ```
    Confirm zero TypeScript errors, zero ESLint violations, build succeeds.

15. **Run Type Check**
    ```bash
    npx tsc --noEmit
    ```
    Zero errors required before phase completion.

---

## I. Global Skill Usage

### 1. `ui-ux-pro-max`
**Apply for:** Design token implementation quality, Tailwind configuration correctness, font loading, and CSS variable architecture.
```bash
python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "design system css variables tailwind" --domain style
python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "typography font pairing food restaurant" --domain typography
```

### 2. `frontend-design`
**Apply for:** Verifying the CSS variable approach for theme switching is idiomatic, font pairing rationale, and ensuring the aesthetic foundation matches the Modern Editorial Dining direction from Phase 03.

### 3. `code-review`
**Apply for:** Review `next.config.ts` security headers for completeness. Review `tsconfig.json` strict mode settings. Review `.env.example` for missing variables.

### 4. `documentation-spec-writing`
**Apply for:** Ensuring `.env.example` has clear comments for every variable. Ensuring `README.md` development setup section is accurate for new developers.

### 5. `accessibility-review`
**Apply for:** Verifying the `not-found.tsx` 404 screen meets WCAG 2.2 AA standards. Ensuring `lang="en"` is set on `<html>`. Verifying reduced-motion CSS is correctly scoped.

---

## J. Testing Requirements

No application features to test in this phase. Verification is build-based:

1. **Build Test:** `npm run build` must complete with zero errors
2. **Type Check:** `npx tsc --noEmit` must complete with zero errors  
3. **Lint Check:** `npm run lint` must complete with zero violations
4. **Dev Server:** `npm run dev` must start and serve root route at localhost:3000
5. **CSS Variable Spot Check:** Open browser DevTools → Computed Styles on `<html>` → Confirm all `--brand-primary`, `--canvas-bg`, `--text-primary` etc. are present
6. **Font Loading:** Inspect Network tab → Confirm Cormorant Garamond and Plus Jakarta Sans are loading from Google Fonts CDN with `display: swap`
7. **Theme Class Test:** Temporarily add `.theme-midnight-charcoal` to `<body>` → Confirm CSS variables switch correctly → Revert

---

## K. Security and Quality Checks

| Check | Verification |
|:---|:---|
| `.env` in `.gitignore` | `git check-ignore .env` returns `.env` |
| No hardcoded API keys | `grep -r "sk-" src/` returns no results |
| No hardcoded restaurant data | `grep -ri "bella.italia\|trattoria\|restaurant name" src/` returns no results |
| CSP Header configured | Inspect `next.config.ts` for `Content-Security-Policy` |
| X-Frame-Options set | Inspect `next.config.ts` for `DENY` |
| TypeScript strict | `tsconfig.json` contains `"strict": true` |
| No `any` types | `grep -r ": any" src/` returns no results (or only justified exceptions) |

---

## L. Documentation Updates

After BUILD-01 completes:
- [ ] Update `docs/PROJECT_CONTEXT_INDEX.md`: Add BUILD-01 completion status
- [ ] Update `docs/04-implementation-roadmap/00-master-implementation-roadmap.md`: Mark BUILD-01 as COMPLETE
- [ ] Update `docs/02-technical-architecture/06-environments-repository-and-git-plan.md`: Verify directory structure matches what was created

---

## M. Acceptance Criteria

**Given** a fresh clone of the DigiNu repository,  
**When** the developer runs `npm install && npm run build`,  
**Then** the build succeeds with zero TypeScript errors, zero ESLint violations, and the development server starts.

**Given** the root route `/` is visited in a browser,  
**When** no restaurant data is in the database,  
**Then** a stub page renders without crashing (not a blank white screen, not a 500 error).

**Given** the browser DevTools Computed Styles panel is open on the `<html>` element,  
**When** the page loads with `theme-warm-cream` class,  
**Then** `--canvas-bg` resolves to `#FAF8F5` and `--brand-primary` resolves to `#B91C1C`.

**Given** the `.theme-midnight-charcoal` class is applied to the root element,  
**When** inspecting computed styles,  
**Then** `--canvas-bg` resolves to `#0F0F11` and `--text-primary` resolves to `#F4F4F5`.

---

## N. Definition of Done

Before this phase is considered complete and before BUILD-02 begins, ALL of the following must be true:

- [ ] `npm run build` succeeds with zero errors
- [ ] `npx tsc --noEmit` succeeds with zero TypeScript errors
- [ ] `npm run lint` succeeds with zero ESLint violations
- [ ] `npm run dev` starts and root route renders without crashing
- [ ] All CSS custom properties from `04-design-tokens.json` are present in `globals.css`
- [ ] All 3 theme presets (warm-cream, clean-white, midnight-charcoal) have correct CSS variables
- [ ] Google Fonts (Cormorant Garamond + Plus Jakarta Sans) load correctly in browser
- [ ] `next.config.ts` has security headers and ImageKit image domain
- [ ] `.env.example` has all 14 required variable names with descriptive comments
- [ ] `.env` and `.env.local` are confirmed in `.gitignore`
- [ ] Directory structure matches `docs/02-technical-architecture/06-environments-repository-and-git-plan.md`
- [ ] `not-found.tsx` exists and renders a user-friendly message (no stack traces)
- [ ] Zero hardcoded restaurant names, colors, or data in source code

---

## O. Review and Approval Gate

Before proceeding to BUILD-02, the developer must:

1. Run all verification commands and confirm passing status
2. Open the application in a browser and visually verify font rendering and CSS variables
3. Inspect the browser network tab and confirm Google Fonts are loading with `display: swap`
4. Open the `.env.example` and verify every required credential has a descriptive comment
5. Review `next.config.ts` security headers with the `code-review` skill
6. **Explicitly authorize** the AI IDE to proceed to BUILD-02

---

## P. Complete AI IDE Execution Prompt

```markdown
# DigiNu — BUILD-01: Project Foundation & Design System Setup

## Your Role
You are a Senior Full-Stack Engineer and UI Systems Architect implementing the production-grade project foundation for DigiNu — a Reusable QR-Based Digital Restaurant Menu Platform.

## MANDATORY STEP 1: READ ALL CONTEXT BEFORE WRITING ANY CODE

Read these files IN ORDER before writing any code:

**Master Context:**
- e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md

**Global Skills (read all 5 SKILL.md files):**
- C:\Users\USER\.gemini\config\skills\ui-ux-pro-max\SKILL.md
- C:\Users\USER\.gemini\config\skills\frontend-design\SKILL.md
- C:\Users\USER\.gemini\config\skills\code-review\SKILL.md
- C:\Users\USER\.gemini\config\skills\documentation-spec-writing\SKILL.md
- C:\Users\USER\.gemini\config\skills\accessibility-review\SKILL.md

**Project-Local Skills (read all 5 SKILL.md files):**
- e:\Freelance\DigiNu\.agents\skills\diginu-business-rules\SKILL.md
- e:\Freelance\DigiNu\.agents\skills\diginu-architecture-conventions\SKILL.md
- e:\Freelance\DigiNu\.agents\skills\diginu-design-rules\SKILL.md
- e:\Freelance\DigiNu\.agents\skills\diginu-test-and-review\SKILL.md
- e:\Freelance\DigiNu\.agents\skills\diginu-deployment-release\SKILL.md

**Phase Source Documents:**
- e:\Freelance\DigiNu\docs\02-technical-architecture\01-technology-stack-decisions.md
- e:\Freelance\DigiNu\docs\02-technical-architecture\06-environments-repository-and-git-plan.md
- e:\Freelance\DigiNu\docs\03-design-system\04-design-tokens.json
- e:\Freelance\DigiNu\docs\03-design-system\05-typography-and-content-style.md
- e:\Freelance\DigiNu\docs\03-design-system\06-layout-grid-and-responsive-rules.md
- e:\Freelance\DigiNu\docs\04-implementation-roadmap\phases\BUILD-01-project-foundation-and-design-system.md

## IMPLEMENTATION INSTRUCTIONS

### Technology Stack (Exact Versions)
- Next.js 15 (App Router, TypeScript) — pinned to `next@^15.5.0` (or latest stable `15.x`)
- React 19 (`react@^19.0.0`, `react-dom@^19.0.0`)
- Tailwind CSS v4 (`tailwindcss@^4.0.0`, `@tailwindcss/postcss@^4.0.0`) using CSS-first configuration via `@import "tailwindcss";` in `globals.css` (or Tailwind CSS v3 `^3.4.0` with `tailwind.config.ts` fallback)
- TypeScript 5.x (`typescript@^5.7.0`) with `strict: true`
- ESLint with Next.js recommended rules (`eslint-config-next@^15.5.0`)
- Node.js 20+ (Active LTS)

### Architecture Rules (Non-Negotiable)
1. App Router ONLY — no Pages Router (`/pages/`) directory ever
2. TypeScript strict mode — `strict: true` in tsconfig.json, zero `any` types
3. Zero hardcoded restaurant names, colors, slugs, or domain names in source code
4. All theme colors as CSS custom properties, never hardcoded hex in JSX or component CSS
5. Server Components by default — only add `'use client'` when strictly required (event handlers, browser APIs, hooks)
6. Mobile-first CSS — all Tailwind classes written mobile-first with responsive modifiers for larger viewports

### Directory Structure to Create
Follow EXACTLY the structure in `docs/02-technical-architecture/06-environments-repository-and-git-plan.md`:
```
e:\Freelance\DigiNu\
├── prisma/                    (create empty with .gitkeep)
│   ├── migrations/
│   └── seed.ts (stub only)
├── public/
│   └── placeholders/          (create empty with .gitkeep)
├── src/
│   ├── app/
│   │   ├── layout.tsx         (root layout with fonts + theme)
│   │   ├── globals.css        (Tailwind + ALL CSS variables)
│   │   ├── page.tsx           (public menu stub)
│   │   ├── not-found.tsx      (friendly 404)
│   │   └── admin/
│   │       ├── layout.tsx     (admin shell stub)
│   │       ├── page.tsx       (dashboard stub)
│   │       └── login/
│   │           └── page.tsx   (login stub)
│   ├── components/
│   │   ├── public/            (empty with .gitkeep)
│   │   ├── admin/             (empty with .gitkeep)
│   │   └── ui/                (empty with .gitkeep)
│   ├── lib/                   (empty with .gitkeep)
│   └── types/                 (empty with .gitkeep)
├── .env.example
├── .gitignore                 (must include .env, .env.local, node_modules/, .next/)
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

### CSS Variables (globals.css)
Implement ALL design tokens from `docs/03-design-system/04-design-tokens.json` as CSS custom properties:

**:root block** must contain:
- `--brand-primary: #C85A32` (Warm Terracotta, overridden per-restaurant dynamically)
- `--brand-primary-hover: #B04A24`
- `--brand-primary-fg: #FFFFFF`
- `--brand-accent: #F59E0B`
- `--dietary-veg: #16A34A`
- `--dietary-non-veg: #DC2626`
- `--color-success: #16A34A`
- `--color-warning: #D97706`
- `--color-error: #DC2626`
- `--color-info: #2563EB`
- `--sold-out-opacity: 0.50`
- All motion duration tokens (--duration-instant through --duration-slow)
- All easing tokens (--ease-out-cubic, --ease-in-out-cubic, --ease-spring-gentle, --ease-spring-snappy)

**Three theme preset classes** (each overrides --canvas-bg, --surface-card, --surface-border, --text-primary, --text-muted):
- `.theme-warm-cream` → #FAF8F5, #FFFFFF, #EFECE6, #1C1917, #78716C
- `.theme-clean-white` → #FFFFFF, #F9FAFB, #E5E7EB, #111827, #6B7280
- `.theme-midnight-charcoal` → #0F0F11, #18181B, #27272A, #F4F4F5, #A1A1AA

**Reduced motion** (`@media (prefers-reduced-motion: reduce)`) must zero out all durations and transforms.

### Font Loading (layout.tsx)
```typescript
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google'

const editorialSerif = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-editorial',
  display: 'swap',
})

const humanistSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})
```
Apply both variables to `<html>` element: `className={`${editorialSerif.variable} ${humanistSans.variable} theme-warm-cream`}`

### Security Headers (next.config.ts)
Configure `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.
Configure `images.remotePatterns` to allow `ik.imagekit.io` only.

### .env.example
Create with ALL variables from `docs/02-technical-architecture/06-environments-repository-and-git-plan.md` Section 2. Every variable must have a descriptive comment explaining what it is and how to obtain it. No actual values.

## VERIFICATION STEPS

After implementing all files, run these commands and confirm they all pass:
```bash
npm install
npx tsc --noEmit       # Must show: 0 errors
npm run lint           # Must show: 0 warnings, 0 errors
npm run build          # Must complete successfully
```

Then visually verify:
- Open localhost:3000 — stub page renders
- Open localhost:3000/admin — admin stub renders
- Open localhost:3000/nonexistent — custom 404 renders (not Next.js default)
- Open Browser DevTools → Computed Styles → Verify --brand-primary = #B91C1C on :root

## APPLY GLOBAL SKILLS

1. **ui-ux-pro-max**: Run `python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "design system css variables tailwind" --domain style` and apply any relevant typography/color rules to the CSS variable architecture.

2. **frontend-design**: Verify the aesthetic foundation is consistent with the Modern Editorial Dining direction (Cormorant Garamond for display text, Plus Jakarta Sans for body, warm cream as default theme).

3. **code-review**: Review next.config.ts security headers, tsconfig.json strict settings, and .gitignore completeness.

4. **accessibility-review**: Audit not-found.tsx for WCAG 2.2 AA compliance. Verify `<html lang="en">` is set. Verify reduced-motion CSS is correctly implemented.

5. **documentation-spec-writing**: Verify .env.example comments are clear and complete. All 14 variables documented.

## STOP CONDITION

After BUILD-01 is complete and all verification steps pass, STOP. Present the results to the developer for review and await explicit authorization before beginning BUILD-02.

Do NOT install Prisma, NextAuth, ImageKit, qrcode, or pdfkit packages in this phase.
Do NOT create any API routes in this phase.
Do NOT create any database schemas in this phase.
```

