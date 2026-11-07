# Engineering Workflow & Quality Gates — DigiNu Phase 04

**Document Version:** 1.0  
**Phase:** 04 — Implementation Planning  
**Status:** IN PROGRESS  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Platform  

---

## 1. Before-Coding Checklist (Every Antigravity Session)

Before writing any application code in a new Antigravity IDE session, the developer **MUST** complete the following steps in order:

### Step 1: Load Master Context
- [ ] Read `e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md` (the master index)
- [ ] Confirm current phase and all previously approved phases

### Step 2: Load Global Skills
In every session, explicitly instruct the IDE to read all 5 global SKILL.md files:
- [ ] `C:\Users\USER\.gemini\config\skills\ui-ux-pro-max\SKILL.md`
- [ ] `C:\Users\USER\.gemini\config\skills\frontend-design\SKILL.md`
- [ ] `C:\Users\USER\.gemini\config\skills\code-review\SKILL.md`
- [ ] `C:\Users\USER\.gemini\config\skills\documentation-spec-writing\SKILL.md`
- [ ] `C:\Users\USER\.gemini\config\skills\accessibility-review\SKILL.md`

### Step 3: Load Project-Local Skills
- [ ] `e:\Freelance\DigiNu\.agents\skills\diginu-business-rules\SKILL.md`
- [ ] `e:\Freelance\DigiNu\.agents\skills\diginu-architecture-conventions\SKILL.md`
- [ ] `e:\Freelance\DigiNu\.agents\skills\diginu-design-rules\SKILL.md`
- [ ] `e:\Freelance\DigiNu\.agents\skills\diginu-test-and-review\SKILL.md`
- [ ] `e:\Freelance\DigiNu\.agents\skills\diginu-deployment-release\SKILL.md`

### Step 4: Load Phase-Specific Source Documents
- [ ] Read the Phase Execution Document for the current BUILD phase:
  `e:\Freelance\DigiNu\docs\04-implementation-roadmap\phases\BUILD-0X-[name].md`
- [ ] Read all source documents listed in Section B of the Phase Execution Document

### Step 5: Verify Current State
- [ ] Run `git -C e:\Freelance\DigiNu status -s` to confirm working tree state
- [ ] Review the Phase Execution Document's "Definition of Done" to understand what must be true before the phase is complete
- [ ] Confirm you are NOT jumping ahead: only the current authorized phase should be implemented

---

## 2. During-Implementation Rules

### 2.1 Architecture Rules (Non-Negotiable)

| Rule | Enforcement |
|:---|:---|
| **Independent Deployment Model** | Zero multi-tenancy code. No `restaurant_id` on operational tables. One DB per restaurant. |
| **TypeScript Strict Mode** | `strict: true` in tsconfig.json. No `any` types permitted. |
| **Next.js App Router Only** | No Pages Router (`/pages/`) directory. Use `app/` exclusively. |
| **Server Components Default** | All components are Server Components by default. Add `'use client'` only when required (event listeners, hooks, browser APIs). |
| **API Route Pattern** | Public: `/api/public/*` (read-only, edge-cached). Admin: `/api/admin/*` (authenticated mutations). |
| **No Hardcoded Branding** | Zero hardcoded restaurant names, colors, slugs, or domain names in source code. All from DB or ENV. |
| **Environment Variable Naming** | Server-only: `IMAGEKIT_PRIVATE_KEY`, `CLOUDFLARE_API_TOKEN`. Public: `NEXT_PUBLIC_*` prefix only for truly public values. |
| **Response Envelope Format** | All API responses: `{ success: boolean, data: T \| null, error: { code: string, message: string } \| null }` |
| **No Raw SQL** | Use Prisma query methods exclusively. Raw SQL only when explicitly justified (e.g., bulk reorder with `updateMany`). |

### 2.2 Design & UI Rules

| Rule | Reference |
|:---|:---|
| **Design Tokens First** | Use `--brand-primary`, `--canvas-bg`, `--surface-card` CSS variables. Never hardcode hex values in JSX/CSS. |
| **Typography Pairing** | Cormorant Garamond / Playfair Display (editorial serif) + Plus Jakarta Sans (humanist sans) |
| **Default Primary Color** | `#B91C1C` (Terracotta Red) — overridden per-restaurant by `restaurant_profile.primary_color` |
| **Touch Targets** | All interactive elements ≥ 44×44px. Verified with accessibility-review skill. |
| **Motion Principle** | GPU-only transforms (`transform`, `opacity`). Never animate `width`, `height`, `top`, `left`. |
| **Reduced Motion** | All animations wrapped with `@media (prefers-reduced-motion: reduce)` fallback (0ms, no transform). |
| **Mobile-First Breakpoints** | Base: 360px; sm: 430px; md: 768px; lg: 1024px. No max-width-only rules. |
| **Image Aspect Ratios** | Food cards: 1:1 (100×100px). Banners: 3:1. Dish modals: 16:9 (300px height). Always reserve space (CLS < 0.1). |
| **WCAG 2.2 AA** | Contrast ≥ 4.5:1 for body text. ≥ 3:1 for large text. All images have `alt` text. |

### 2.3 Security Rules

| Rule | Implementation |
|:---|:---|
| **Input Validation** | Every API route uses Zod schema validation before processing. Invalid input → 422 response. |
| **Auth Guard** | All `/api/admin/*` routes check `auth()` from NextAuth before proceeding. No session → 401. |
| **Rate Limiting** | Login endpoint: 5 attempts / 15 min / IP. Public menu: 120 req/min/IP. AI generate: 10 req/min/session. |
| **MIME Validation** | Uploaded files validated by magic number (not file extension). Reject non-JPEG/PNG/WebP. |
| **Secret Isolation** | `CLOUDFLARE_API_TOKEN` and `IMAGEKIT_PRIVATE_KEY` never referenced in `NEXT_PUBLIC_*` variables or client components. |
| **CSP Headers** | `Content-Security-Policy` header configured in `next.config.ts`. |
| **No Eval / Dangerous HTML** | Zero use of `dangerouslySetInnerHTML` with user-provided content. Use sanitization library if HTML rendering is needed. |

### 2.4 Testing Rules During Implementation

- Write tests alongside code, not after phase completion
- Each API route must have at minimum: success case test, auth failure test, invalid input test
- Each database mutation test uses a test database or mocked Prisma client
- Run `npm run type-check` before considering any feature complete
- Run `npm run lint` to verify no ESLint violations
- Run `npm test` to confirm all unit tests pass

---

## 3. After-Implementation Checklist (Before Phase Approval)

After completing all implementation steps in a BUILD phase:

### Code Quality
- [ ] `npx tsc --noEmit` — Zero TypeScript errors
- [ ] `npm run lint` — Zero ESLint violations
- [ ] `npm run build` — Successful production build (no build errors)
- [ ] `npm test` — All unit and integration tests pass

### Accessibility
- [ ] Run accessibility-review skill audit on all new components in this phase
- [ ] Verify contrast ratios using browser DevTools for all 3 theme presets
- [ ] Keyboard navigation works for all interactive elements (Tab, Enter, Escape)
- [ ] All images have descriptive `alt` attributes

### Design Compliance
- [ ] Run ui-ux-pro-max search for any design domain concerns: `python "%USERPROFILE%/.gemini/config/skills/ui-ux-pro-max/scripts/search.py" "mobile menu" --domain ux`
- [ ] All touch targets ≥ 44×44px verified
- [ ] Design tokens used exclusively (no hardcoded hex values in components)
- [ ] All 3 theme presets (`clean-white`, `warm-cream`, `midnight-charcoal`) render correctly

### Security
- [ ] Run code-review skill on all new API routes
- [ ] Auth middleware present on all `/api/admin/*` routes
- [ ] No secrets logged to console or included in client bundles
- [ ] Rate limiting configured for all sensitive endpoints

### Documentation
- [ ] Update `PROJECT_CONTEXT_INDEX.md` if new files were created
- [ ] Update phase document with any implementation deviations
- [ ] All new API routes documented with request/response shapes

---

## 4. Git Workflow Rules

> [!IMPORTANT]
> **All git commits require explicit developer authorization. The AI IDE must NEVER auto-commit or auto-push.**

### Commit Rules
1. **Small, Atomic Commits:** One commit per logical change (e.g., "Add Prisma schema models", "Implement GET /api/public/menu route")
2. **Conventional Commits Format:**
   ```
   feat(build-01): initialize Next.js 15 App Router project structure
   feat(build-02): add Prisma schema with 8 single-restaurant models
   fix(build-03): correct category delete cascade safeguard response
   test(build-06): add public menu API route handler tests
   docs(build-04): update API contracts with imagekit-auth endpoint
   ```
3. **Never Auto-Push:** The AI IDE must propose commit messages and await explicit developer approval
4. **Never Force Push:** No `git push --force` on any branch
5. **Never Commit Secrets:** Verify `.env` is in `.gitignore` before every commit
6. **Phase Completion Tag:** When a phase's DoD is met and approved, tag with `git tag build-01-complete` (after developer authorization)

### Branch Strategy
```
main                    ← Core reusable codebase (always stable)
├── client/bella-italia ← Per-client deployment branch
├── client/tokyo-ramen  ← Per-client deployment branch
└── dev                 ← (Optional) Development sandbox before merging to main
```

---

## 5. Quality Gates for Phase Transitions

Each BUILD phase must satisfy its Definition of Done AND pass the following transition gate before the next phase begins:

| Phase Transition | Quality Gate Requirements |
|:---|:---|
| BUILD-01 → BUILD-02 | `npm run build` succeeds. Next.js 15 app starts. CSS variables and design tokens applied. TypeScript strict mode enabled. |
| BUILD-02 → BUILD-03 | `npx prisma migrate dev` runs clean. All 8 models created. Owner login sets HttpOnly cookie. Protected routes redirect unauthenticated requests. |
| BUILD-03 → BUILD-04 | Category + Item CRUD endpoints return correct JSON envelopes. 86 toggle updates availability. Reordering persists to DB. |
| BUILD-04 → BUILD-05 | HMAC signature generation returns correct token/expire/signature. Direct upload to ImageKit succeeds. Asset metadata saved to `media_assets`. |
| BUILD-05 → BUILD-06 | AI generate returns base64 preview. AI approve saves to ImageKit, links to dish, decrements credit. Regenerate works. Quota check blocks at 0 credits. |
| BUILD-06 → BUILD-07 | Public menu renders in < 1.5s. Sold-out items display correctly. Search and filter work client-side. Zero cookies on public response. |
| BUILD-07 → BUILD-08 | QR code scans successfully on iOS and Android. SVG, PNG, PDF download correctly. |
| BUILD-08 → COMPLETE | Lighthouse Performance ≥ 90 (mobile). Zero accessibility violations (axe-core). All Playwright E2E tests pass. Prisma seed works on fresh DB. Owner handoff workflow documented. |

---

## 6. How to Load Context in a New Antigravity Session

### Context Loading Execution Prompt Template

Copy-paste the following at the start of every new Antigravity IDE session for DigiNu:

```markdown
You are a Senior Full-Stack Engineer working on the DigiNu project — a Reusable QR-Based Digital Restaurant Menu Platform with AI Culinary Studio.

STEP 1 — READ MASTER CONTEXT:
Read e:\Freelance\DigiNu\docs\PROJECT_CONTEXT_INDEX.md first. This is the master index for all project documentation.

STEP 2 — READ ALL 5 GLOBAL SKILLS (read SKILL.md files, not just filenames):
1. C:\Users\USER\.gemini\config\skills\ui-ux-pro-max\SKILL.md
2. C:\Users\USER\.gemini\config\skills\frontend-design\SKILL.md
3. C:\Users\USER\.gemini\config\skills\code-review\SKILL.md
4. C:\Users\USER\.gemini\config\skills\documentation-spec-writing\SKILL.md
5. C:\Users\USER\.gemini\config\skills\accessibility-review\SKILL.md

STEP 3 — READ ALL 5 PROJECT-LOCAL SKILLS:
1. e:\Freelance\DigiNu\.agents\skills\diginu-business-rules\SKILL.md
2. e:\Freelance\DigiNu\.agents\skills\diginu-architecture-conventions\SKILL.md
3. e:\Freelance\DigiNu\.agents\skills\diginu-design-rules\SKILL.md
4. e:\Freelance\DigiNu\.agents\skills\diginu-test-and-review\SKILL.md
5. e:\Freelance\DigiNu\.agents\skills\diginu-deployment-release\SKILL.md

STEP 4 — READ CURRENT PHASE DOCUMENT:
Read e:\Freelance\DigiNu\docs\04-implementation-roadmap\phases\BUILD-0X-[name].md
(Replace 0X with the current build phase number)

STEP 5 — BEGIN IMPLEMENTATION:
Follow the Step-by-Step Execution Plan in Section H of the Phase Document.
Apply all skills to every file you create.
Do not proceed to the next phase without developer approval.
```

---

## 7. Skill Application Matrix per Phase

| Phase | ui-ux-pro-max | frontend-design | code-review | documentation-spec-writing | accessibility-review |
|:---:|:---|:---|:---|:---|:---|
| BUILD-01 | Style selection, Tailwind setup, token mapping | Design system foundation, font loading, CSS variables | tsconfig, tailwind config, next.config | README, .env.example, project structure | N/A (no UI yet) |
| BUILD-02 | Auth form design | Login form typography | Auth routes, session handling, rate limiting | Schema comments, seed script docs | Login form WCAG audit |
| BUILD-03 | Admin dashboard layout, category/item forms | Form hierarchy, label design, micro-interactions | CRUD API routes, Zod validators, auth guards | API endpoint documentation | Form labels, error states, 44px targets |
| BUILD-04 | Media library grid, upload drop zone | Drag-and-drop UX, preview cropping | ImageKit auth handler, HMAC signature logic | Media API contracts | Upload zone keyboard accessibility |
| BUILD-05 | AI studio modal design, credit indicator | Modal overlay, loading state animation | AI generate/approve routes, quota checks | AI workflow documentation | Modal focus trapping, ARIA dialog |
| BUILD-06 | Public menu components, food cards, drawer | Editorial food card layout, sticky nav | Public API route, payload sanitization | Public menu render architecture | Full WCAG audit: contrast, alt text, focus |
| BUILD-07 | QR studio layout, download buttons | Print-ready visual design | QR download route, PDF generation | QR format documentation | Download button labels, keyboard activation |
| BUILD-08 | Performance review (LCP, CLS) | Final visual QA across 3 themes | Full security review: auth, CSP, secrets | Deployment guide, handoff docs | Complete accessibility audit with axe-core |

---

## 8. STOP Conditions (Never Proceed Without Developer Approval)

The AI IDE **MUST STOP** and await explicit developer authorization at these points:

1. ✋ After completing any BUILD phase's Definition of Done — present results for review
2. ✋ Before making any git commit — propose the commit message and await approval
3. ✋ Before starting a new phase — confirm the previous phase was approved
4. ✋ When a decision contradicts the approved architecture — flag and await resolution
5. ✋ When implementing anything that resembles cart, ordering, payment, or KDS — STOP immediately, these are out of scope
6. ✋ When `.env` changes are needed — present the changes for review, never auto-modify production environment configs
7. ✋ When a dependency or package version is ambiguous — propose the version and await confirmation

