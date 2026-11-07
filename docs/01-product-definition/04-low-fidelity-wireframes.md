# Low-Fidelity Wireframes — DigiNu

**Document Version:** 1.0  
**Phase:** 01 — Product Definition  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Management System  

---

## 1. Scope & Guidelines

These wireframes illustrate the **structural layout, information hierarchy, and key interaction touchpoints** for the essential screens of DigiNu. 

* **Technology Neutral:** Focuses purely on functional layout, spacing, and controls.
* **No Premature Styling:** Colors, typography, and polish belong strictly to the UI/UX design phase.
* **Dual Interface Representation:** Covers both Public Mobile Menu and Private Admin Dashboard.

---

## 2. Public Customer Menu (Mobile-First Viewports: 360px–430px)

### Screen 1: Public Menu Landing & Sticky Header (`/r/:restaurant-slug`)

```text
+-------------------------------------------------+
| [ 4G 12:45 PM ]                                 |
+-------------------------------------------------+
|                                                 |
|  [===========================================]  |
|  |           RESTAURANT COVER BANNER         |  |
|  [===========================================]  |
|                                                 |
|     +-----------+                               |
|     | [  LOGO ] |   TRATTORIA DA LUIGI          |
|     +-----------+   Authentic Tuscan Cuisine    |
|                                                 |
|  [🟢 Open Now • Closes 10:30 PM]  [ℹ️ Info / Map]|
|  📍 142 Via Roma, Firenze • 📞 (555) 019-2831   |
|-------------------------------------------------|
|  [ 🔍 Search dishes, ingredients...        ]    |
|-------------------------------------------------|
|  [STICKY CATEGORY BAR - HORIZONTALLY SCROLLABLE]|
|  [ All ] [★ Starters] [ Pastas ] [ Pizzas ] [..]|
|-------------------------------------------------|
|                                                 |
|  --- ★ STARTERS & ANTIPASTI ---                 |
|  Handmade fresh daily using authentic recipes   |
|                                                 |
|  +-------------------------------------------+  |
|  | +-------+  Truffle Burrata Bruschetta     |  |
|  | | IMAGE |  Toasted ciabatta, creamy bur-  |  |
|  | | 4:3   |  rata, fresh black truffle.     |  |
|  | +-------+  $14.50                         |  |
|  |            (V) Veg  •  [Gluten-Free Opt]  |  |
|  +-------------------------------------------+  |
|                                                 |
|  +-------------------------------------------+  |
|  | +-------+  Crispy Calamari Fritti         |  |
|  | | IMAGE |  Flash-fried squid with smoked  |  |
|  | | 4:3   |  garlic aioli & grilled lemon.  |  |
|  | +-------+  $16.00                         |  |
|  |            (NV) Non-Veg  •  [Chef's Pick] |  |
|  +-------------------------------------------+  |
|                                                 |
|  +-------------------------------------------+  |
|  | ///////  Prosciutto e Melone              |  |
|  | /IMAGE/  Aged 24mo Parma ham with sweet   |  |
|  | ///////  cantaloupe melon slices.         |  |
|  |          $15.00  [🚫 SOLD OUT TODAY]      |  |
|  |          (NV) Non-Veg (Muted / Greyed Out)|  |
|  +-------------------------------------------+  |
|                                                 |
|  --- FRESH HANDMADE PASTAS ---                  |
|  ...                                            |
+-------------------------------------------------+
```

---

### Screen 2: Food Item Detail Modal / Bottom Drawer (Expanded View)

```text
+-------------------------------------------------+
|                                                 |
|  [===========================================]  |
|  |                                           |  |
|  |       HIGH-RESOLUTION FOOD PHOTOGRAPHY    |  |
|  |       (Aspect Ratio 16:9 or 4:3)          |  |
|  |                                   [ ✕ ]   |  |
|  [===========================================]  |
|                                                 |
|  Crispy Calamari Fritti                         |
|  $16.00                                         |
|  (NV) Non-Vegetarian  •  [Chef's Special]       |
|-------------------------------------------------|
|  DESCRIPTION                                    |
|  Tender Monterey Bay squid rings and tentacles, |
|  lightly dusted in seasoned semolina flour,     |
|  flash-fried to golden perfection. Served with  |
|  house-made smoked garlic aioli and grilled     |
|  charred Sicilian lemon.                        |
|-------------------------------------------------|
|  ALLERGEN INFORMATION                           |
|  ⚠️ Contains: Molluscs, Eggs, Gluten             |
|  (Prepared in a facility that also handles nuts)|
|-------------------------------------------------|
|  DIETARY CLASSIFICATIONS                        |
|  [ Dairy-Free ]  [ Pescatarian ]                |
|                                                 |
|  [            CLOSE DETAIL VIEW               ] |
+-------------------------------------------------+
```

---

## 3. Private Owner Dashboard (Responsive Desktop / Tablet / Mobile)

### Screen 3: Owner Login (`/admin/login`)

```text
+-------------------------------------------------+
|                                                 |
|                     DIGINU                      |
|           Restaurant Menu Management            |
|                                                 |
|  +-------------------------------------------+  |
|  |  Sign In to Your Restaurant               |  |
|  |                                           |  |
|  |  Email Address:                           |  |
|  |  [ owner@trattoria.com                  ] |  |
|  |                                           |  |
|  |  Password:                                |  |
|  |  [ ****************                     ] |  |
|  |                                           |  |
|  |  [x] Remember me for 14 days              |  |
|  |                                           |  |
|  |  [             SIGN IN                  ] |  |
|  |                                           |  |
|  |  Forgot password? Reset here              |  |
|  +-------------------------------------------+  |
|                                                 |
+-------------------------------------------------+
```

---

### Screen 4: Operational Dashboard Overview (`/admin`)

```text
+---------------------------------------------------------------------------------+
| DIGINU  | Trattoria Da Luigi  | [View Public Menu ↗]           | [User: Mario ▾]|
|---------+-----------------------------------------------------------------------|
| [Nav]   | DASHBOARD OVERVIEW                                                    |
|         |                                                                       |
| Overview| +----------------+ +----------------+ +---------------+ +-----------+ |
| Profile | | TOTAL DISHES   | | ACTIVE NOW     | | SOLD OUT (86) | | AI CREDITS| |
| Categori| |      48        | |      45        | |       3       | |   22 / 30 | |
| Dishes  | +----------------+ +----------------+ +---------------+ +-----------+ |
| Media   |                                                                       |
| QR Code | QUICK ACTIONS                                                         |
| Settings| [ + Add New Dish ]   [ + Add Category ]   [ Download Table QR ]       |
|         |                                                                       |
|         | RECENT MENU ACTIVITY                                                  |
|         | • Prosciutto e Melone marked [Sold Out] by Mario at 1:15 PM           |
|         | • Truffle Burrata price updated to $14.50 at 11:30 AM                 |
|         | • AI Food Image generated for 'Seafood Risotto' at Yesterday          |
|         |                                                                       |
|         | LIVE MENU HEALTH                                                      |
|         | Public URL: https://diginu.app/r/trattoria-luigi                      |
|         | Operational Status: [🟢 Open Now - Dine In Active]                    |
+---------------------------------------------------------------------------------+
```

---

### Screen 5: Category Management (`/admin/categories`)

```text
+---------------------------------------------------------------------------------+
| DIGINU  | CATEGORY MANAGEMENT                                                   |
|---------+-----------------------------------------------------------------------|
| Overview| Organize dining sections and order of display on customer phones.     |
| Profile |                                                                       |
| Categori| [ + Add New Category ]                                                |
| Dishes  |                                                                       |
| Media   | +-------------------------------------------------------------------+ |
| QR Code | | Order | Category Name        | Items | Status   | Actions         | |
| Settings| |-------+----------------------+-------+----------+-----------------| |
|         | | [:::] | 1. Starters & Tapas  | 8     | [Active] | [Edit] [Delete] | |
|         | | [:::] | 2. Handmade Pastas   | 14    | [Active] | [Edit] [Delete] | |
|         | | [:::] | 3. Wood-Fired Pizzas | 12    | [Active] | [Edit] [Delete] | |
|         | | [:::] | 4. Mains & Grills    | 9     | [Active] | [Edit] [Delete] | |
|         | | [:::] | 5. Desserts          | 5     | [Active] | [Edit] [Delete] | |
|         | | [:::] | 6. Summer Cocktails  | 6     | [Hidden] | [Edit] [Delete] | |
|         | +-------------------------------------------------------------------+ |
|         | (Drag [:::] handle or use arrows to rearrange public display sequence)|
+---------------------------------------------------------------------------------+
```

---

### Screen 6: Food Item Creation & Editing Form (`/admin/items/new`)

```text
+---------------------------------------------------------------------------------+
| DIGINU  | CREATE NEW FOOD ITEM                                                  |
|---------+-----------------------------------------------------------------------|
| Overview| [ ← Back to Items List ]                                              |
| Profile |                                                                       |
| Categori| 1. BASIC INFORMATION                                                  |
| Dishes  | Dish Name:   [ Truffle Mushroom Risotto                             ] |
| Media   | Category:    [ Handmade Pastas                                    ▾ ] |
| QR Code | Price:       [ $ ] [ 22.50   ]                                        |
| Settings|                                                                       |
|         | 2. DESCRIPTIONS                                                       |
|         | Short Summary (visible on dish card, max 160 chars):                  |
|         | [ Creamy carnaroli rice with wild porcini and shaved black truffle  ] |
|         | Detailed Story & Ingredients (visible in expanded view):              |
|         | [ Slow-simmered with vegetable stock, finished with 24-month        ] |
|         | [ Parmigiano Reggiano and white truffle butter.                     ] |
|         |                                                                       |
|         | 3. CLASSIFICATION & ALLERGENS                                         |
|         | Classification: (o) Vegetarian   ( ) Non-Vegetarian                   |
|         | Dietary Badges: [x] Gluten-Free  [ ] Vegan  [ ] Halal  [ ] Spicy      |
|         | Allergen Checklist: [x] Dairy  [ ] Nuts  [ ] Eggs  [ ] Shellfish      |
|         | Operational:    [x] Available Now    [x] Featured / Chef's Special    |
|         |                                                                       |
|         | 4. DISH PHOTOGRAPHY                                                   |
|         | [ Current Image: No Image Assigned ]                                  |
|         | Sourcing Options:                                                     |
|         | [ 📁 Upload from Device ] [ 🖼️ Pick from Library ] [ ✨ GENERATE WITH AI ]
|         |                                                                       |
|         | [ CANCEL ]                                          [ SAVE DISH ITEM ]|
+---------------------------------------------------------------------------------+
```

---

### Screen 7: AI Food Image Studio Modal (4–5 Variations Preview)

```text
+---------------------------------------------------------------------------------+
|  ✨ AI CULINARY STUDIO — GENERATE FOOD PHOTOGRAPHY                     [ ✕ Close] |
|---------------------------------------------------------------------------------|
|  Dish: Truffle Mushroom Risotto                                                 |
|  Prompt Synthesized: "Gourmet plating of creamy carnaroli truffle risotto,      |
|  garnished with fresh micro-herbs, 45-degree angle, soft ambient restaurant...  |
|  Credits Remaining: 22 / 30                                                     |
|---------------------------------------------------------------------------------|
|  SELECT PREFERRED VARIATION (Generated 4 Options):                              |
|                                                                                 |
|  +--------------------+  +--------------------+  +--------------------+         |
|  | [ VARIATION #1 ]   |  | [ VARIATION #2 ]   |  | [ VARIATION #3 ]   |         |
|  | Overhead flat-lay  |  | 45-degree macro    |  | Rustic wooden table|         |
|  | with wine glass    |  | glistening truffle |  | with crusty bread  |         |
|  |                    |  |                    |  |                    |         |
|  | [🔍 Zoom]          |  | [🔍 Zoom]          |  | [🔍 Zoom]          |         |
|  | [Select Option 1]  |  | [⭐ SELECT OPTION 2]|  | [Select Option 3]  |         |
|  +--------------------+  +--------------------+  +--------------------+         |
|                                                                                 |
|  +--------------------+  +--------------------+                                 |
|  | [ VARIATION #4 ]   |  | [ REGENERATE ]     |                                 |
|  | Dark slate plate,  |  | Unsatisfied?       |                                 |
|  | dramatic lighting  |  | Generate 4 fresh   |                                 |
|  |                    |  | variations         |                                 |
|  | [🔍 Zoom]          |  |                    |                                 |
|  | [Select Option 4]  |  | [🔄 New Batch]     |                                 |
|  +--------------------+  +--------------------+                                 |
|---------------------------------------------------------------------------------|
|  ⚠️ Rule: Selected image is permanently saved and linked to dish.                |
|  Candidate images not selected are purged automatically.                        |
+---------------------------------------------------------------------------------+
```

---

### Screen 8: QR Code Management Studio (`/admin/qr-code`)

```text
+---------------------------------------------------------------------------------+
| DIGINU  | TABLE QR CODE STUDIO                                                  |
|---------+-----------------------------------------------------------------------|
| Overview| Generate and download commercial print assets for dining tables.      |
| Profile |                                                                       |
| Categori| +-------------------------------+  +--------------------------------+ |
| Dishes  | | LIVE QR CODE PREVIEW          |  | DOWNLOAD PRINT-READY ASSETS    | |
| Media   | |                               |  |                                | |
| QR Code | |       +---------------+       |  | Target Menu URL:               | |
| Settings| |       | █▀▀▀▀▀ █ ▀▀▀▀▀█ |       |  | https://diginu.app/r/luigi    | |
|         | |       | █ ███ █ █ █ ███ |       |  | (Permanent - never breaks)   | |
|         | |       | █ ▀▀▀ [LOGO]▀▀█ |       |  |                                | |
|         | |       | █ ███ █ █ █ █ █ |       |  | [ ⬇️ Download Vector SVG   ]  | |
|         | |       | ▀▀▀▀▀ ▀ ▀▀▀ ▀▀▀ |       |  | For professional printers     | |
|         | |       +---------------+       |  |                                | |
|         | |                               |  | [ ⬇️ Download 300 DPI PNG  ]  | |
|         | | Trattoria Da Luigi            |  | For instant printing/office    | |
|         | | Table Display Edition         |  |                                | |
|         | |                               |  | [ ⬇️ Download Table Tent PDF]  | |
|         | | [x] Embed Restaurant Logo     |  | Pre-formatted A6 card template | |
|         | | [ ] Apply Brand Red Color     |  |                                | |
|         | +-------------------------------+  +--------------------------------+ |
+---------------------------------------------------------------------------------+
```

