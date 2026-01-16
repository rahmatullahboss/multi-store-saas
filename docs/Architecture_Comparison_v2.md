# Architecture Comparison & Upgrade Plan

## 1. Executive Summary

This document outlines the gap analysis between your **Current System** and the **World-Class Blueprint** you provided. It details the critical differences, the risks of the current approach, and the step-by-step plan to upgrade the system without breaking existing functionality.

---

## 2. Default vs. World-Class: The Comparison Matrix

### A. Core Database & Data Types

| Feature          | Current System                     | World-Class Goal                                 | Why it Matters (The "Parthokko")                                                                                                  |
| :--------------- | :--------------------------------- | :----------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **Pricing Data** | `Real` (Float) <br> _(e.g. 10.99)_ | **Integer** (Cents) <br> _(e.g. 1099)_           | **Critical:** Floating point math errors (e.g. `0.1 + 0.2 != 0.3`) cause financial discrepancies in taxes and totals.             |
| **Builder Data** | Single Table (`builder_sections`)  | **Dual Tables** <br> (`_draft` & `_published`)   | **UX/Safety:** Currently, helping a customer edit a live page might break it for visitors instantly. Snapshotting prevents this.  |
| **Store Mode**   | `stores.mode` (Hybrid)             | **Strict Mode Gate** <br> (`landing` vs `store`) | **Scale:** Clear separation prevents "Landing" users from accessing heavy commerce features (Cart, Checkout) until upgrade.       |
| **Checkout**     | Direct Order Creation              | **Checkout Sessions**                            | **Reliability:** Sessions handle "abandoned checkout" recovery and ensure price consistency even if products change mid-checkout. |
| **Idempotency**  | Partial (Transaction ID)           | **Strict Idempotency Keys**                      | **Security:** Prevents double-charging if a user clicks "Pay" twice on a slow network.                                            |

### B. Architecture & Validation

| Feature        | Current System           | World-Class Goal       | Why it Matters                                                                                                        |
| :------------- | :----------------------- | :--------------------- | :-------------------------------------------------------------------------------------------------------------------- |
| **Validation** | Partial (Zod in Builder) | **Zod Everywhere**     | **Security:** Validating ALL inputs (Product create, Cart add, etc.) on the server prevents malicious data injection. |
| **API**        | Remix Action/Loaders     | **Remix + Hono Split** | **Performance:** simple API endpoints (webhooks, public API) run faster and cheaper on Hono than full Remix loaders.  |
| **Images**     | Text URL                 | **R2 Direct + CDM**    | **Speed:** Cloudflare R2 is significantly cheaper and faster than external image hosts or base64 storage.             |

---

## 3. Detailed Upgrade Roadmap

We will follow a phased approach to minimize risk.

### **Phase 0: Foundation (The Database Refactor)**

_Target: 1-2 Days_

1.  **Stop Development:** Pause new feature work.
2.  **Migration 1 (Pricing):** Convert `products.price`, `variants.price`, etc., from `Real` to `Integer`.
    - _Action:_ Backend script to multiply all existing prices by 100.
3.  **Migration 2 (Builder):** Split `builder_sections` into `page_sections_draft` and `page_sections_published`.
4.  **Migration 3 (Commerce):** Create `checkout_sessions` table.
5.  **Schema Update:** Add `mode` and `limits` columns to the `stores` table.

### **Phase 1: Store MVP (Sell Something)**

_Target: 3-5 Days_

1.  **Product Admin:** Update "Add Product" form to use Zod validation and handle Integer pricing (Input 100 -> Save 10000).
2.  **Storefront Renderer:** Update the page renderer to read from `_published` tables only.
3.  **Checkout Flow:**
    - User clicks "Buy" -> Create `checkout_session` (Draft Cart).
    - User enters address -> Update Session.
    - User pays (COD) -> Convert Session to `Order`.

### **Phase 2: BD Commerce Features**

_Target: 3 Days_

1.  **Payment Providers:** Implement the Abstract Payment Interface.
2.  **Gateways:** Add `bKash` (Manual/Merchant) and `SSLCommerz` connectors.
3.  **Shipping:** Add simple "Inside/Outside Dhaka" flat rates logic.

---

## 4. Key Decisions & Recommendations (From Previous Discussion)

To achieve the "Unified System" goal where users start Free and upgrade:

1.  **Free Plan Strategy:** Allow **Store Mode** on Free plans but limit to **5 Products**. This builds habit.
2.  **Branding:** Mandatory "Powered by [YourApp]" footer on Free plans.
3.  **Domains:** Free = `subdomain.app.com`. Paid = Custom Domain (CNAME verified via Cloudflare).

---

## 5. Visualizing the Difference

**Scenario: A User Edits their Home Page**

- **Current System:** User changes "Hero Text". _Instantly_, every visitor sees the new text. If the user makes a typo, the typo is live.
- **New System:** User changes "Hero Text". It saves to **Draft**. Visitors still see the old "Perfect" version. User clicks **"Publish"**. The system takes a _Snapshot_ and updates the **Public** version.

**Scenario: Flash Sale Price Change**

- **Current System:** Admin changes Product A price from $10 to $20. A user who already had it in cart at $10 goes to pay. System might charge $20 (User angry) or error out.
- **New System:** `checkout_session` locked the price at $10 when added. User pays $10. Admin's change only affects _new_ carts.

---

**Approval to Proceed:**
If this roadmap looks correct, I will begin with **Phase 0: Database Schema Refactor**.
