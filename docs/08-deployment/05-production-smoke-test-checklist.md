# DigiNu — Production Smoke Test Checklist & Acceptance Protocol

**Document ID:** `DEP-05`  
**Phase:** BUILD-08 (Testing, Security Audit & Client Deployment)  
**Target:** Live Production Restaurant Instance  
**Status:** READY FOR VERIFICATION  

---

## 1. Public Diner Experience (Mobile & Desktop Viewports)

Execute these checks on both a desktop browser and an actual smartphone (iOS Safari / Android Chrome):

- [ ] **1.1 Custom Domain & HTTPS Padlock**
  - Navigate to `https://<your-custom-domain>/`.
  - Browser displays valid SSL/TLS certificate (padlock icon) with zero security warnings.
  - HTTP automatically redirects to HTTPS.
- [ ] **1.2 Hero Header & Branding**
  - Restaurant Name, Tagline, and official logo load cleanly from ImageKit CDN.
  - Hero cover banner loads with responsive aspect ratio and subtle gradient overlay.
- [ ] **1.3 Operating Hours Dynamic Pill**
  - Displays accurate status badge (e.g. `● Open Now • Closes at 10:00 PM` or `● Closed • Opens at 11:00 AM`).
  - Clicking the badge opens the 7-day Operating Hours modal showing the complete weekly schedule.
- [ ] **1.4 Category Tab Navigation & Sticky ScrollSpy**
  - Horizontal category bar renders all active menu sections (e.g. Starters, Main Course, Pavbhaji, Desserts, Beverages).
  - Tapping a category smoothly scrolls to the section.
  - Scrolling through the menu updates the active category pill highlight automatically.
- [ ] **1.5 Search & Instant Filtering**
  - Typing a dish name in the search bar filters dishes instantaneously (< 50ms) across all categories.
  - Clearing search restores the full menu view.
- [ ] **1.6 Dietary Filter Chips**
  - Tapping `Veg` filters out non-vegetarian dishes.
  - Tapping `Gluten-Free` isolates certified gluten-free options.
  - Multi-tag active filter count pill updates accurately.
- [ ] **1.7 Sold-Out (86) Item Visual State**
  - Dishes marked 86 by the kitchen display a visible `Sold Out` badge, muted opacity, and disabled tap state.
- [ ] **1.8 Dish Detail Drawer**
  - Tapping an available dish opens the slide-up drawer with high-resolution food photo, dietary badges, full description, price, and allergen icons.
  - Pressing `Escape`, clicking backdrop, or dragging down closes the drawer smoothly.
- [ ] **1.9 Offline Network Resiliency**
  - Disabling Wi-Fi/mobile data triggers the subtle offline banner: *"You are viewing an offline cached menu."* Reconnecting restores live status seamlessly.

---

## 2. Table QR Code & Print Studio Verification

- [ ] **2.1 Live Camera Scannability**
  - Open `/admin/qr-studio` on desktop.
  - Point your physical iPhone or Android camera app at the screen preview.
  - The phone camera instantly prompts to open `https://<your-custom-domain>/` (verifying exact domain matching with zero table parameters).
- [ ] **2.2 SVG Vector Export**
  - Click `Download SVG`. Open downloaded file in Illustrator or browser. Confirm infinite zoom sharpness and centered logo badge.
- [ ] **2.3 300 DPI PNG Export**
  - Click `Download PNG`. Inspect file properties: Dimensions must be `2048 × 2048 pixels`, resolution `300 DPI`.
- [ ] **2.4 A6 Table-Tent PDF Export**
  - Click `Download PDF`. Open downloaded PDF: Confirm restaurant name in Playfair/Times typography, tagline, centered QR, custom callout, and 3mm print shop bleed marks with zero text overlap.
- [ ] **2.5 Download Counter Increment**
  - Verify that each download increments the `Downloads: X` metric in the database and studio header.

---

## 3. Owner Dashboard & Menu Management (`/admin`)

- [ ] **3.1 Authentication & Security**
  - Unauthenticated access to `/admin` or `/admin/*` redirects to `/admin/login`.
  - Submitting incorrect password displays inline error without exposing user existence.
  - Submitting 5 consecutive failed logins locks the IP with `429 Too Many Requests`.
  - Logging in with owner credentials redirects to `/admin` with persistent 30-day session.
- [ ] **3.2 Operational Dashboard (SCR-ADMIN-02)**
  - Metric cards count active dishes, sold-out items, categories, and AI credits accurately.
- [ ] **3.3 One-Tap Availability Toggle (86 Hub)**
  - Toggling a dish to `Sold Out` in `/admin/menu` updates instantly via optimistic UI.
  - Refreshing the public menu in another window confirms the dish immediately displays `Sold Out`.
- [ ] **3.4 Menu Item Creation & Editing**
  - Create a new test dish with title, price, category, and description. Confirm it appears on the public menu.
  - Delete test dish; confirm it is cleanly removed.

---

## 4. Media Pipeline & AI Studio Verification

- [ ] **4.1 ImageKit Direct Upload**
  - In Dish Form, upload a food photo via the direct upload zone.
  - Verify image uploads to ImageKit cloud CDN and generates WebP thumbnails automatically.
- [ ] **4.2 AI Culinary Photography Studio (1-Image Workflow)**
  - Click `✨ Generate with AI` inside a dish form.
  - Prompt preview synthesizes dish ingredients and cuisine style.
  - Click `Generate Image`: Cloudflare FLUX.1 Schnell synthesizes high-res culinary photography.
  - Discarding candidate leaves credits consumed without changing the dish photo.
  - Generating and clicking `⭐ Approve & Apply` updates the dish and permanently consumes 1 credit.

---

## 5. Security & Privacy Inspection

- [ ] **5.1 Public API PII Scrubbing**
  - In browser terminal or curl, inspect `GET /api/public/menu`:
    `curl -s https://<your-domain>/api/public/menu | grep -i "password\|email\|owner\|hash"`
  - Response must return empty (0 owner PII leaked).
- [ ] **5.2 Mutation Protection**
  - Send POST request to public menu:
    `curl -X POST https://<your-domain>/api/public/menu`
  - Returns `405 Method Not Allowed`.

