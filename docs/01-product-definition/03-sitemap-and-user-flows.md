# Sitemap & User Flows — DigiNu

**Document Version:** 1.0  
**Phase:** 01 — Product Definition  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Management System  

---

## 1. System Navigation Architecture & Sitemap

DigiNu features two completely segregated, purpose-built navigation trees:

```
+-----------------------------------------------------------------------------------+
|                                  DIGINU SITEMAP                                   |
+-----------------------------------------------------------------------------------+
| INTERFACE A: PUBLIC CUSTOMER MENU (Read-Only)                                     |
|                                                                                   |
| ├── /r/:restaurant-slug                    [Branded Menu View / Landing]          |
| │    ├── #category-:id                     [In-Page Sticky Category Jump Target]  |
| │    ├── ?search=:query                    [Filtered In-Page Search Results]      |
| │    └── (Drawer / Modal)                  [Food Item Detail, Allergens & Story]  |
| └── /r/:restaurant-slug/not-found          [Polite Inactive/Invalid Tenant Screen]|
|                                                                                   |
| INTERFACE B: PRIVATE OWNER DASHBOARD (Authenticated)                              |
|                                                                                   |
| ├── /admin/login                           [Owner Sign-In & Password Reset]       |
| ├── /admin                                 [Operational Dashboard & Quick Stats]  |
| ├── /admin/profile                         [Restaurant Branding, Logo & Hours]    |
| ├── /admin/categories                      [Category CRUD & Reordering List]      |
| ├── /admin/items                           [Food Item List, Filters & 86 Toggles] |
| │    ├── /admin/items/new                  [Create New Food Item Form]            |
| │    └── /admin/items/:id/edit             [Edit Item & Embedded AI Image Studio] |
| ├── /admin/media                           [Restaurant Image Asset Library]       |
| └── /admin/qr-code                         [QR Code Generator & Vector Export]    |
+-----------------------------------------------------------------------------------+
```

---

## 2. Core User Flows

### Flow 1: Customer Scans QR Code & Browses Menu

This flow represents 99% of user interactions across the platform. It must be blisteringly fast, require zero account creation, and have zero blockers.

```mermaid
flowchart TD
    Start(["Diner scans Table QR Code"]) --> Scan["Camera opens https://diginu.app/r/bella-italia"]
    Scan --> Resolve["Edge Router resolves tenant: 'bella-italia'"]
    Resolve --> CacheCheck{"Menu in CDN Cache?"}
    CacheCheck -- Yes --> RenderFast["Render Mobile Web Menu (< 1.5s)"]
    CacheCheck -- No --> QueryDB["Fetch published categories & dishes"] --> SetCache["Set Edge Cache"] --> RenderFast

    RenderFast --> ViewHero["View Restaurant Logo, Banner & Hours Badge"]
    ViewHero --> ActionChoice{"Diner Action"}

    ActionChoice -->|"Option A: Category Tap"| TapCat["Tap Sticky Category Pill (e.g. 'Pizzas')"]
    TapCat --> SmoothScroll["Viewport smoothly scrolls to #category-pizzas"]

    ActionChoice -->|"Option B: Search / Filter"| UseSearch["Type keyword or tap [Pure Veg] filter"]
    UseSearch --> InstantFilter["Client-side instant filter updates cards"]

    ActionChoice -->|"Option C: Dish Inspection"| TapDish["Tap Dish Card (e.g. 'Truffle Burrata')"]
    TapDish --> OpenDrawer["Open Bottom Sheet: Full Photo, Allergens & Notes"]
    OpenDrawer --> CloseDrawer["Dismiss Modal -> Return to Menu Position"]

    SmoothScroll --> DinerOrder(["Diner verbally places order with Waitstaff"])
    InstantFilter --> DinerOrder
    CloseDrawer --> DinerOrder
```

---

### Flow 2: Owner Creates and Publishes a Food Item

Enables restaurant owners or floor managers to introduce a new dish with pricing, categorization, and dietary classifications.

```mermaid
flowchart TD
    OwnerLogin(["Owner logged in at /admin"]) --> NavItems["Navigate to 'Food Items' (/admin/items)"]
    NavItems --> ClickNew["Click '+ Add New Dish'"]
    ClickNew --> OpenForm["Open Dish Creation Form"]
    OpenForm --> InputDetails["Fill Required Fields:<br>- Title (e.g. 'Crispy Calamari')<br>- Category (e.g. 'Starters')<br>- Price (e.g. '16.50')"]
    InputDetails --> SelectTags["Configure Attributes:<br>- Veg / Non-Veg Toggle<br>- Dietary Chips (Gluten-Free, etc.)<br>- Allergen Checklist"]
    
    SelectTags --> ImageChoice{"Image Sourcing Method"}
    ImageChoice -->|"Option 1: Upload"| UploadPhoto["Upload photo from phone/camera -> Auto WebP"]
    ImageChoice -->|"Option 2: Library"| PickLibrary["Choose from previously uploaded media"]
    ImageChoice -->|"Option 3: AI Studio"| TriggerAI["Launch AI Food Image Studio (Flow 3)"]
    ImageChoice -->|"Option 4: None"| SkipImage["Proceed without image (Text-first layout)"]

    UploadPhoto --> SaveAction["Click 'Save Dish'"]
    PickLibrary --> SaveAction
    TriggerAI --> SaveAction
    SkipImage --> SaveAction

    SaveAction --> Validate{"Backend Validation"}
    Validate -- Valid --> Persist["Write to DB with restaurant_id scope"]
    Validate -- Errors --> HighlightErrors["Display inline field error messages"] --> InputDetails
    Persist --> Toast["Show 'Dish created successfully' toast"]
    Toast --> LivePublicMenu(["Dish immediately visible on Public Menu"])
```

---

### Flow 3: Owner Generates and Selects an AI Food Image

The flagship differentiator: Generating 4–5 hyper-realistic culinary options from dish details with a mandatory human approval step.

```mermaid
flowchart TD
    StartAI(["Owner editing dish in Dashboard"]) --> ClickGen["Click 'Generate with AI'"]
    ClickGen --> QuotaCheck{"Check Tenant Quota"}
    
    QuotaCheck -- "0 Credits" --> ShowQuotaErr["Show 'Monthly limit reached — Contact Admin'"]
    QuotaCheck -- "Credits Available" --> LockUI["Debounce button & show Cooking Animation"]
    
    LockUI --> BackendPrompt["Backend synthesizes culinary prompt<br>(Lighting, Plateware, Macro angle, Negative constraints)"]
    BackendPrompt --> CallAI["Invoke AI Provider for 4-5 Variations"]
    CallAI --> ReturnBatch["Receive 4-5 Candidate Image Buffers"]
    ReturnBatch --> OpenModal["Open Side-by-Side Comparison Modal"]
    
    OpenModal --> Inspect{"Owner Review"}
    Inspect -->|"Zoom In"| InspectFull["Inspect plating details & texture"] --> Inspect
    Inspect -->|"Regenerate"| Rebatch["Click 'Regenerate' (Uses 1 credit)"] --> BackendPrompt
    Inspect -->|"Cancel"| CancelDismiss["Close modal (No changes applied, candidates purged)"]
    
    Inspect -->|"Select Best"| ClickApprove["Click 'Select This Image' on Candidate #3"]
    ClickApprove --> ProcessImage["Transcode Candidate #3 to WebP<br>(Generate 400x400 thumbnail & 1200x800 full-res)"]
    ProcessImage --> PermanentStorage["Persist to permanent restaurant media bucket"]
    ProcessImage --> AttachItem["Update food_item record with new image URL"]
    ProcessImage --> DeductCredit["Decrement tenant monthly credit counter by 1"]
    ProcessImage --> DiscardTemp["Purge unselected temporary candidate images"]
    DiscardTemp --> Success(["Selected AI Image published to Public Menu"])
```

---

### Flow 4: Owner Generates and Downloads Print-Ready QR Codes

Enables owners to produce table displays that link permanently to their digital menu.

```mermaid
flowchart TD
    StartQR(["Owner navigates to /admin/qr-code"]) --> FetchSlug["System retrieves canonical slug: 'bella-italia'"]
    FetchSlug --> Encode["Encode permanent URL: https://diginu.app/r/bella-italia"]
    Encode --> RenderPreview["Render live dynamic vector QR preview"]
    
    RenderPreview --> Customize{"Optional Customization"}
    Customize -->|"Embed Logo"| ToggleLogo["Embed restaurant square logo into center matrix"]
    Customize -->|"Brand Color"| PickColor["Apply Primary Brand Color to QR pixels"]
    Customize -->|"Default"| KeepStandard["Keep high-contrast classic black & white"]

    ToggleLogo --> ExportChoice{"Owner selects Export Format"}
    PickColor --> ExportChoice
    KeepStandard --> ExportChoice

    ExportChoice -->|"Option A: Vector SVG"| ExportSVG["Download high-precision vector .svg<br>(For commercial print shops, banners, signage)"]
    ExportChoice -->|"Option B: 300 DPI PNG"| ExportPNG["Download 2048x2048px 300 DPI raster .png<br>(For office printing, flyers, social media)"]
    ExportChoice -->|"Option C: Table Tent PDF"| ExportPDF["Download ready-to-print 4x6 / A6 table card<br>(Includes logo, QR code, and 'Scan to View Menu')"]

    ExportSVG --> PhysicalTables(["Table cards printed & placed on dining tables"])
    ExportPNG --> PhysicalTables
    ExportPDF --> PhysicalTables
```
