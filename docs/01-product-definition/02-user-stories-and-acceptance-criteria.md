# User Stories & Acceptance Criteria — DigiNu

**Document Version:** 1.0  
**Phase:** 01 — Product Definition  
**Status:** DRAFT — REVIEW REQUIRED  
**Project:** DigiNu — Reusable QR-Based Digital Restaurant Menu Management System  

---

## 1. Overview & Conventions

This document specifies the core user journeys, acceptance criteria, and edge-case handling for DigiNu. 

**Structure:**
* **User Story:** `As a [persona], I want [capability], so that [business value / outcome].`
* **Acceptance Criteria:** Structured in BDD `Given / When / Then` syntax.
* **Negative & Edge Cases:** Validation failures, unauthorized access, empty states, and network resilience.

---

## 2. Customer User Stories (Public Digital Menu)

### US-CUST-001: Instant Table Menu Access via QR Scan
* **User Story:** As a dining customer, I want to scan a table QR code with my smartphone camera, so that I can immediately view the restaurant's live digital menu without downloading an app or creating an account.
* **Acceptance Criteria:**
  - **Scenario 1 (Successful Scan):**
    - **Given** a diner points their phone camera at a valid DigiNu table QR code,
    - **When** they tap the recognized notification banner,
    - **Then** the mobile browser opens `https://diginu.app/r/{restaurant-slug}` and renders the restaurant branding, cover banner, and categories in under 1.5 seconds.
  - **Scenario 2 (Invalid or Inactive Slug):**
    - **Given** a customer navigates to an invalid or deactivated restaurant slug,
    - **When** the page resolves,
    - **Then** the system displays a friendly "Restaurant Menu Unavailable" screen with a contact link rather than a raw 404/500 error.

### US-CUST-002: Smooth Category Browsing & Sticky Navigation
* **User Story:** As a dining customer, I want to jump between menu categories using a sticky navigation bar, so that I can quickly find the section I want without endless scrolling.
* **Acceptance Criteria:**
  - **Scenario 1 (Category Tap Navigation):**
    - **Given** a diner is viewing the public menu,
    - **When** they tap a category pill (e.g., *"Artisanal Pizzas"*),
    - **Then** the viewport smoothly scrolls to that category section and highlights the active category tab.
  - **Scenario 2 (Scroll-Spy Auto Highlighting):**
    - **Given** a diner scrolls manually through the menu,
    - **When** a new category section enters the upper viewport,
    - **Then** the sticky category bar auto-highlights the corresponding tab and auto-centers the pill horizontally.

### US-CUST-003: Inspecting Food Item Details & Allergens
* **User Story:** As a customer with dietary restrictions, I want to inspect high-resolution food photography, ingredient descriptions, and allergen warnings, so that I can make a safe and informed dining choice.
* **Acceptance Criteria:**
  - **Scenario 1 (Item Detail Modal Expansion):**
    - **Given** a customer is browsing dishes,
    - **When** they tap on a food item card (e.g., *"Crispy Calamari"*),
    - **Then** an expanded bottom sheet or modal opens showing full-width photography, detailed description, preparation notes, and an explicit allergen checklist (e.g., *Contains Molluscs, Gluten*).
  - **Scenario 2 (Dismissing Detail View):**
    - **Given** the detail modal is active,
    - **When** the diner taps the close button (`✕`) or taps outside the modal,
    - **Then** the modal closes smoothly, restoring the exact scroll position on the menu.

### US-CUST-004: Sold-Out Item Awareness (86 Handling)
* **User Story:** As a dining customer, I want to clearly see which items are sold out today, so that I do not attempt to order dishes that the kitchen cannot prepare.
* **Acceptance Criteria:**
  - **Scenario 1 (Viewing 86'd Dish):**
    - **Given** the restaurant kitchen has marked *"Truffle Burrata"* as sold out,
    - **When** a customer views the dish on the public menu,
    - **Then** the dish card displays with a muted 50% opacity overlay and a prominent `[Sold Out Today]` badge.
  - **Scenario 2 (Detail View on Sold Out Item):**
    - **Given** a customer taps a sold-out dish card,
    - **When** the detail drawer opens,
    - **Then** a prominent notice states: *"This item is currently sold out for today's service."*

### US-CUST-005: Live Search & Dietary Filtering
* **User Story:** As a vegetarian customer, I want to filter the menu for vegetarian items and search for specific ingredients, so that I can quickly find dishes matching my preferences.
* **Acceptance Criteria:**
  - **Scenario 1 (Dietary Filter Toggle):**
    - **Given** a diner is on the public menu,
    - **When** they tap the `[Pure Veg]` filter chip,
    - **Then** all non-vegetarian items are hidden instantly, and categories with zero vegetarian options are temporarily collapsed.
  - **Scenario 2 (Search by Keyword):**
    - **Given** a diner types *"garlic"* into the search bar,
    - **When** the input is entered,
    - **Then** the menu filters instantaneously to show all dishes containing "garlic" in the title or description.
  - **Scenario 3 (No Search Results):**
    - **Given** a diner searches for *"sushi"* in an Italian restaurant menu,
    - **When** no matches exist,
    - **Then** the system displays *"No dishes match your search"* with a *"Clear Search"* button.

---

## 3. Owner User Stories (Authentication & Profile)

### US-OWN-001: Secure Owner Authentication
* **User Story:** As a restaurant owner, I want to securely log into my dashboard, so that I can manage my menu while preventing unauthorized public changes.
* **Acceptance Criteria:**
  - **Scenario 1 (Valid Login):**
    - **Given** an owner is on `/admin/login`,
    - **When** they submit their registered email and correct password,
    - **Then** the system validates credentials, sets an HTTP-Only secure session cookie, and redirects them to `/admin`.
  - **Scenario 2 (Invalid Password):**
    - **Given** an owner enters an incorrect password,
    - **When** they click "Sign In",
    - **Then** the system displays *"Invalid email or password"* without revealing whether the email exists.
  - **Scenario 3 (Brute-Force Lockout):**
    - **Given** an IP fails login 5 consecutive times within 15 minutes,
    - **When** a 6th attempt is made,
    - **Then** the request is rejected with *"Too many failed attempts. Please wait 15 minutes."*

### US-OWN-002: Session Persistence & Logout
* **User Story:** As a restaurant owner, I want to remain logged in during my shift and log out when done, so that my account is secure.
* **Acceptance Criteria:**
  - **Scenario 1 (Session Retention):**
    - **Given** a logged-in owner closes their browser,
    - **When** they reopen `/admin` within 14 days,
    - **Then** they remain authenticated without having to re-enter credentials.
  - **Scenario 2 (Explicit Logout):**
    - **Given** an authenticated owner clicks "Sign Out",
    - **When** the action completes,
    - **Then** the session cookie is revoked, and any subsequent visit to `/admin` redirects to `/admin/login`.

### US-OWN-003: Customizing Restaurant Profile & Brand Theming
* **User Story:** As a restaurant owner, I want to customize my restaurant logo, colors, and business hours, so that my public menu reflects my venue's branding.
* **Acceptance Criteria:**
  - **Scenario 1 (Updating Branding):**
    - **Given** an owner is on the Profile Settings page,
    - **When** they pick a new primary brand color (e.g., `#B91C1C`) and choose the "Warm Cream" theme preset,
    - **Then** the changes save successfully, and the public menu immediately reflects the new color and background styling.
  - **Scenario 2 (Updating Contact Details):**
    - **Given** an owner updates their phone number or Google Maps URL,
    - **When** they click "Save Changes",
    - **Then** the system validates URL/phone format and updates public footer links.

---

## 4. Owner User Stories (Category Management)

### US-CAT-001: Creating and Editing Categories
* **User Story:** As a restaurant owner, I want to create and edit menu categories (e.g., Starters, Mains, Desserts), so that my menu is well-organized.
* **Acceptance Criteria:**
  - **Scenario 1 (Create Category):**
    - **Given** an owner is on the Category Management screen,
    - **When** they enter Name: *"Handmade Pastas"* and Subtitle: *"Fresh daily"*, and submit,
    - **Then** the category appears in the dashboard list and is available for item assignment.
  - **Scenario 2 (Empty Name Validation):**
    - **Given** an owner leaves the category name empty,
    - **When** they submit,
    - **Then** the system highlights the field with *"Category name is required."*

### US-CAT-002: Reordering Categories
* **User Story:** As a restaurant owner, I want to change the order of categories, so that high-margin sections appear first on the customer's screen.
* **Acceptance Criteria:**
  - **Scenario 1 (Move Category Up):**
    - **Given** the category list has [Starters, Mains, Drinks],
    - **When** the owner drags *"Drinks"* to the top position,
    - **Then** the new sequence [Drinks, Starters, Mains] saves instantly and updates the public menu category bar.

### US-CAT-003: Deleting Category with Cascade Safeguard
* **User Story:** As a restaurant owner, I want safeguards when deleting a category, so that I do not accidentally delete dishes contained within it.
* **Acceptance Criteria:**
  - **Scenario 1 (Category with Existing Dishes):**
    - **Given** the *"Mains"* category contains 12 active dishes,
    - **When** the owner clicks "Delete Category",
    - **Then** the system shows a warning dialog: *"Cannot delete category containing 12 items. Reassign or delete these dishes first."* and blocks deletion.
  - **Scenario 2 (Empty Category Deletion):**
    - **Given** a category contains 0 dishes,
    - **When** the owner confirms deletion,
    - **Then** the category is removed permanently from the database.

---

## 5. Owner User Stories (Food Item Management)

### US-ITEM-001: Creating Food Item with Pricing & Tags
* **User Story:** As a restaurant owner, I want to add new food items with name, price, description, and dietary tags, so that customers can browse complete dish info.
* **Acceptance Criteria:**
  - **Scenario 1 (Successful Dish Creation):**
    - **Given** an owner fills out Name: *"Margherita Pizza"*, Category: *"Pizzas"*, Price: *"16.50"*, Veg Toggle: *True*,
    - **When** they click "Save Dish",
    - **Then** the dish is created, assigned to the category, and becomes visible on the public menu.
  - **Scenario 2 (Invalid Price Input):**
    - **Given** an owner inputs Price: *"-5.00"* or *"abc"*,
    - **When** they attempt to save,
    - **Then** the system shows an inline error: *"Please enter a valid price greater than or equal to 0."*

### US-ITEM-002: Instant One-Tap Availability Toggle (86 Item)
* **User Story:** As a floor manager during busy service, I want to mark an item as "Sold Out" in 1 tap from my phone, so that diners stop ordering out-of-stock ingredients.
* **Acceptance Criteria:**
  - **Scenario 1 (Toggling to Sold Out):**
    - **Given** an owner views their dish list on a mobile screen,
    - **When** they tap the green `Available` switch next to *"Ribeye Steak"*,
    - **Then** the switch toggles to grey `Sold Out`, updates the database immediately, and the public menu displays the dish with a `Sold Out Today` badge.
  - **Scenario 2 (Restoring Availability):**
    - **Given** fresh supplies arrive the next morning,
    - **When** the owner taps the toggle back to `Available`,
    - **Then** the public menu immediately restores standard active styling.

### US-ITEM-003: Manual Photo Upload & Validation
* **User Story:** As a restaurant owner, I want to upload a photo of my dish from my phone, so that customers see the actual plate presentation.
* **Acceptance Criteria:**
  - **Scenario 1 (Valid Photo Upload):**
    - **Given** an owner selects a 2.5MB JPEG photo from their camera roll,
    - **When** upload completes,
    - **Then** the system transcodes the image to WebP, generates a thumbnail, attaches it to the dish, and displays an image preview.
  - **Scenario 2 (Invalid File Format or Size):**
    - **Given** an owner attempts to upload a PDF file or an image > 5MB,
    - **When** selected,
    - **Then** the system rejects the file with: *"Only JPEG, PNG, or WebP images up to 5MB are supported."*

---

## 6. Owner User Stories (AI Food Image Generation)

### US-AI-001: Generating 4–5 AI Food Image Variations
* **User Story:** As a restaurant owner without professional photography, I want to generate 4–5 realistic culinary image options using AI based on my dish description, so that I can choose the best-looking presentation.
* **Acceptance Criteria:**
  - **Scenario 1 (Successful AI Batch Generation):**
    - **Given** a dish has Name: *"Truffle Mushroom Risotto"* and Description: *"Creamy arborio rice with wild porcini, shaved black truffle, and aged parmesan"*,
    - **When** the owner clicks "Generate with AI",
    - **Then** the button shows a loading spinner ("Chef AI is plating your dish..."), debounces repeated clicks, and renders 4 to 5 distinct high-resolution image variations in a side-by-side preview modal within 15 seconds.
  - **Scenario 2 (Insufficient Credits / Quota Reached):**
    - **Given** a restaurant tenant has used all monthly AI credits (0 balance),
    - **When** the owner views the AI generator,
    - **Then** the button is disabled and displays *"0 Credits Remaining. Contact platform support to add credits."*

### US-AI-002: Previewing and Selecting Preferred Image
* **User Story:** As a restaurant owner, I want to inspect candidate images and select one, so that only an image I personally approve appears on the menu.
* **Acceptance Criteria:**
  - **Scenario 1 (Selection & Persistence):**
    - **Given** 4 candidate variations are displayed,
    - **When** the owner clicks "Select This Image" on Option #2,
    - **Then** Option #2 is saved to permanent storage, attached to the dish record, and displayed on the public menu. Unselected candidates are purged.
  - **Scenario 2 (Human Approval Mandate):**
    - **Given** an AI batch completes,
    - **When** the owner closes the modal without selecting an option,
    - **Then** no AI image is attached to the dish, and previous images remain unchanged.

### US-AI-003: Handling AI Generation Failures Gracefully
* **User Story:** As a restaurant owner, I want clear feedback if the AI service fails, so that I am not blocked from saving my dish details.
* **Acceptance Criteria:**
  - **Scenario 1 (Upstream API Timeout or Error):**
    - **Given** the upstream AI provider is experiencing an outage,
    - **When** the owner clicks "Generate with AI",
    - **Then** after a timeout, the system displays: *"The AI Kitchen is currently busy. Please try again in a few moments or upload a photo manually."*
    - **And** the food item record remains intact and editable.

---

## 7. Owner User Stories (QR Code Management)

### US-QR-001: Generating & Customizing QR Code
* **User Story:** As a restaurant owner, I want to generate a branded table QR code linked to my menu, so that I can print table displays.
* **Acceptance Criteria:**
  - **Scenario 1 (Permanent URL QR Code):**
    - **Given** a restaurant has slug `trattoria-luigi`,
    - **When** the owner visits the QR Code Studio,
    - **Then** the system displays a live QR code encoding `https://diginu.app/r/trattoria-luigi` with the restaurant logo centered.
  - **Scenario 2 (Dynamic Re-Styling):**
    - **Given** an owner changes their brand color to navy blue,
    - **When** they view the QR code,
    - **Then** the QR code foreground updates to navy blue while maintaining high contrast.

### US-QR-002: Exporting Print-Ready Vector & PNG Formats
* **User Story:** As a restaurant owner, I want to download my QR code as a vector SVG and high-res PNG, so that I can send it to my commercial printer.
* **Acceptance Criteria:**
  - **Scenario 1 (SVG Vector Download):**
    - **Given** an owner clicks "Download SVG",
    - **When** triggered,
    - **Then** a crisp scalable vector `.svg` file downloads immediately to the device.
  - **Scenario 2 (300 DPI PNG Download):**
    - **Given** an owner clicks "Download PNG (Print Ready)",
    - **When** triggered,
    - **Then** a high-resolution 2048x2048 PNG at 300 DPI downloads for instant tabletop display printing.
