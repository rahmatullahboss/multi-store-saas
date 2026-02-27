# Ozzyl WooCommerce Power Layer — Full Plan

**Version:** 1.0  
**Date:** 2026-02-27  
**Status:** Draft v3 — 3 Rounds Adversarial Review Complete (46 issues fixed)  
**Author:** Ozzyl Engineering Team

---

## Table of Contents

1. [Vision & Positioning](#1-vision--positioning)
2. [Current System Audit](#2-current-system-audit)
3. [Feature Gap Analysis](#3-feature-gap-analysis)
4. [Plugin Architecture](#4-plugin-architecture)
5. [Module Specifications](#5-module-specifications)
6. [Backend API Plan](#6-backend-api-plan)
7. [Pricing Model](#7-pricing-model)
8. [Build Timeline](#8-build-timeline)
9. [Testing Strategy](#9-testing-strategy)
10. [Open Questions & Risks](#10-open-questions--risks)

---

## 1. Vision & Positioning

### The Problem

WooCommerce has 5+ million active stores. Bangladesh-এর বেশিরভাগ established e-commerce merchant WooCommerce ব্যবহার করে। তারা platform switch করতে চায় না — কিন্তু WooCommerce-এর বাইরে তাদের দরকার:

- COD fraud prevention (বাংলাদেশে COD fraud সবচেয়ে বড় সমস্যা)
- Server-side Facebook/Google pixel (ad blocker bypass)
- Courier auto-dispatch (Pathao, Steadfast, RedX)
- Bangla SMS notifications
- Abandoned cart recovery

### The Solution

> **"আপনার WooCommerce store-এ fraud detection, server-side pixel, Pathao auto-dispatch আর SMS notification — একটাই plugin-এ।"**

Ozzyl WooCommerce Power Layer = Ozzyl-এর সব power features, WooCommerce-এর উপরে layer হিসেবে। Merchant তাদের existing store রাখে, শুধু plugin install করে Ozzyl-এর features পায়।

### Comparable Products (Bangladesh Market)

| Product | What it does | Price |
|---|---|---|
| Shohoz / local SMS gateways | SMS only | ৳৫-৮/SMS |
| Pathao merchant app | Courier only, manual | Free (commission) |
| Local fraud blacklist groups | Manual FB groups | Free (unreliable) |
| 4-5 separate WP plugins | Each feature separately | ৳৫,০০০+/mo total |
| **Ozzyl Power Layer** | **Fraud + CAPI + Courier + SMS — একটাই plugin** | **৳৯৯০/mo** |

> **Note:** Klaviyo, Route, etc. are not used in Bangladesh. Real comparison is against the cost of buying 4-5 separate local tools — which is more expensive and harder to manage.

---

## 2. Current System Audit

### Backend Services Already Built

| Service | File | API Endpoint | Status |
|---|---|---|---|
| Fraud Detection | `fraud-engine.server.ts` | `/api/fraud-check` | ✅ Full |
| Facebook CAPI | `facebook-capi.server.ts` | `/api/track-events` | ✅ Full |
| Courier — Pathao | `pathao.server.ts` | `/api/courier/pathao` | ✅ Full |
| Courier — Steadfast | `steadfast.server.ts` | `/api/courier/steadfast` | ✅ Full |
| Courier — RedX | `redx.server.ts` | `/api/courier/redx` | ✅ Full |
| SMS/Messaging | `messaging.server.ts` | Internal | ✅ Full |
| Abandoned Cart | `abandonedCarts` table | `/app/abandoned-carts` | ✅ Full |
| Push Notifications | `push.server.ts` | `/api/push/*` | ✅ Full |
| Analytics | `analytics.server.ts` | `/api/v1/analytics/*` | ✅ Full |
| Automations | `automation.server.ts` | `/api/cron/*` | ✅ Full |
| Loyalty/Points | `loyalty.server.ts` | Internal | ✅ Full |
| AI Visitor Chat | `visitor-chat.server.ts` | `/api/visitor-chat` | ✅ Full |
| AB Testing | `abTesting.server.ts` | Internal | ✅ Full |

### Current WordPress Plugin Status

| Feature | Current Plugin | Gap |
|---|---|---|
| WooCommerce product sync | ✅ Basic | Needs improvement |
| Order export to Ozzyl | ✅ Basic | Needs improvement |
| Fraud detection | ❌ Missing | Build from scratch |
| Facebook CAPI | ❌ Missing | Build from scratch |
| Courier dispatch | ❌ Missing | Build from scratch |
| SMS notifications | ❌ Missing | Build from scratch |
| Abandoned cart | ❌ Missing | Build from scratch |
| Analytics widget | ❌ Missing | Build from scratch |
| Module toggle UI | ❌ Missing | Build from scratch |

### Critical Bug Found (Already Fixed)

- `OZZYL_API_BASE` was `https://api.ozzyl.com/v1` → Fixed to `https://app.ozzyl.com/api/v1`
- Analytics params `from/to/days` → Fixed to `period` enum with backward compat

---

## 3. Feature Gap Analysis

### Features to Build NOW (High Impact)

| Feature | Why Important | Effort | Revenue Impact |
|---|---|---|---|
| **Fraud Detection Module** | #1 pain point for BD merchants | 3 days | 🔴 High |
| **Facebook CAPI Module** | Ad cost reduction, better ROAS | 2 days | 🔴 High |
| **Courier Auto-Dispatch** | Saves 30 min/day per merchant | 3 days | 🔴 High |
| **SMS Notifications** | Bangladesh-এ WhatsApp/SMS সবচেয়ে effective | 2 days | 🟡 Medium |
| **Abandoned Cart Sync** | 15-20% revenue recovery | 2 days | 🟡 Medium |
| **Analytics Dashboard Widget** | Merchant retention | 1 day | 🟢 Low |

### Features to Build LATER (Future Roadmap)

| Feature | Why | When |
|---|---|---|
| **WhatsApp Business API** | Higher open rate than SMS | Phase 3 (WABA approval ~8 weeks) |
| **Review Collection** | Post-delivery auto-request | Phase 2 |
| **GST/VAT Invoice Generator** | Bangladesh tax compliance | Phase 2 |
| **Competitor Price Alert** | Merchant competitive intelligence | Phase 3 |
| **AI Product Description** | SEO + content automation | Phase 3 |

### Features in Ozzyl NOT Applicable to WooCommerce

| Feature | Why Not Applicable |
|---|---|
| Store Builder / Theme System | WooCommerce handles this |
| Checkout flow | WooCommerce handles this |
| Payment gateway (bKash/Nagad) | WC has own gateways |
| Product management UI | WC admin handles this |

---

## 4. Plugin Architecture

### Directory Structure

```
ozzyl-commerce/
│
├── ozzyl-commerce.php           ← Main entry, version, module loader
├── uninstall.php                ← Clean removal
├── readme.txt                   ← WordPress.org listing
│
├── core/
│   ├── class-ozzyl-core.php     ← Bootstrap, DI container
│   ├── class-ozzyl-api.php      ← HTTP client (retry, backoff, timeout)
│   ├── class-ozzyl-license.php  ← Plan/scope validation via API
│   └── class-ozzyl-logger.php   ← Debug logging to WP debug.log
│
├── modules/
│   ├── fraud-detection/
│   │   ├── module.php           ← Implements OzzylModuleInterface
│   │   ├── class-fraud-hooks.php ← WC checkout hooks
│   │   └── views/
│   │       └── fraud-meta-box.php ← Order risk badge in WC admin
│   │
│   ├── server-tracking/
│   │   ├── module.php
│   │   ├── class-facebook-capi.php
│   │   ├── class-google-server.php
│   │   └── assets/
│   │       └── tracking.js      ← Client cookie capture (fbp, fbc)
│   │
│   ├── courier/
│   │   ├── module.php
│   │   ├── class-courier-dispatch.php
│   │   └── views/
│   │       └── courier-meta-box.php ← Booking UI in WC order page
│   │
│   ├── sms-notifications/
│   │   ├── module.php
│   │   └── class-sms-sender.php
│   │
│   ├── abandoned-cart/
│   │   ├── module.php
│   │   └── class-cart-tracker.php ← Tracks WC sessions
│   │
│   └── analytics/
│       ├── module.php
│       └── views/
│           └── dashboard-widget.php ← WP dashboard summary card
│
├── admin/
│   ├── class-ozzyl-admin.php
│   └── views/
│       ├── modules.php          ← App-store style module toggle UI
│       ├── settings.php         ← API key, store connection
│       └── status.php           ← Connection health check
│
└── languages/
    └── ozzyl-commerce.pot       ← i18n template
```

### Module Interface Contract

```php
interface OzzylModuleInterface {
    // Identification
    public function get_id(): string;      // e.g., 'fraud-detection'
    public function get_name(): string;    // e.g., 'Fraud Detection'
    public function get_icon(): string;    // e.g., '🛡️'
    public function get_description(): string;

    // Access control
    public function get_required_scope(): string; // e.g., 'fraud'
    public function get_min_plan(): string;        // 'free'|'starter'|'pro'

    // Lifecycle
    public function activate(): void;     // Register WC hooks
    public function deactivate(): void;   // MUST: remove_action/remove_filter, cancel scheduled events, delete transients

    // Admin UI
    public function render_settings(): void; // Settings form
    public function get_stats(): array;      // Module usage stats for card
}
```

**Deactivate Contract — Required Cleanup per Module:**

Every module's `deactivate()` MUST clean up:

```php
public function deactivate(): void {
    // 1. Remove all WC action/filter hooks registered in activate()
    remove_action('woocommerce_checkout_process', [$this->hooks, 'check_fraud']);
    remove_action('add_meta_boxes', [$this->hooks, 'register_meta_box']);

    // 2. Cancel any WP Cron events scheduled by this module
    wp_clear_scheduled_hook('ozzyl_fraud_sync');

    // 3. Delete module-specific transients (NOT settings — merchant may re-enable)
    delete_transient('ozzyl_fraud_stats_cache');

    // 4. Do NOT delete merchant settings on deactivate — only on uninstall
    // Settings are preserved so re-enabling works seamlessly
}
```

> **Rule:** Deactivate = pause. Uninstall = wipe. `uninstall.php` handles full data removal.

### Module Loader Flow

```
ozzyl-commerce.php → OzzylCore::init()
    │
    ├── Load API client (always)
    ├── Validate API key (cached 1 hour in WP transients)
    ├── Fetch plan/scopes from Ozzyl API (cached 1 hour)
    │
    └── For each module:
        ├── Is it enabled in WP options?
        ├── Does current plan have required scope?
        └── YES → module->activate() → register WC hooks
```

---

## 5. Module Specifications

### Module 1: Fraud Detection 🛡️

**Scope required:** `fraud`  
**Min plan:** Starter  
**WC hooks used:**
- `woocommerce_checkout_process` — block risky orders
- `woocommerce_order_status_changed` — re-check on status change
- `add_meta_boxes` — risk badge in order admin

**Flow:**
```
Customer submits checkout
    │
    ▼
POST /api/v1/fraud/check
{
  phone: "01711234567",
  order_total: 2500,
  payment_method: "cod",
  ip_address: "103.x.x.x",
  user_agent: "...",
  items_count: 3
}
    │
    ▼
Response: { risk_score: 85, decision: "block", signals: [...] }
    │
    ├── score < 40  → Allow (silent)
    ├── score 40-70 → Hold (mark order "On Hold", notify merchant)
    └── score > 70  → Block (wc_add_notice error, checkout stops)
```

**API Timeout Behavior (Fail-Closed by Default):**

> ⚠️ **Security Decision:** Default behavior on API timeout/error is **fail-closed** (hold the order), NOT fail-open. A fail-open policy is exploitable — an attacker can deliberately trigger timeouts to bypass fraud detection.

```php
// Merchant-configurable in settings:
// Option: "On API error" → [Hold Order ● (default)] / [Allow Order ○]

$timeout_behavior = get_option('ozzyl_fraud_timeout_behavior', 'hold'); // 'hold' | 'allow'

if ( is_wp_error($result) ) {
    OzzylLogger::warning('Fraud API timeout', ['order_id' => $order_id]);
    if ( $timeout_behavior === 'hold' ) {
        // Default: hold the order, merchant reviews manually
        $order->update_status('on-hold', 'Ozzyl: Fraud API unavailable — held for manual review.');
        wc_add_notice(__('Your order is being reviewed. We will confirm shortly.', 'ozzyl-commerce'), 'notice');
        // Stop checkout but don't show "blocked" — UX friendly
    }
    // 'allow': silently pass (merchant accepts the risk explicitly)
}
```

**COD OTP Verification (Phase 1 — Critical for Bangladesh):**

COD fake orders are Bangladesh's #1 fraud vector. OTP verification at checkout reduces fake COD by ~60%.

```
Customer selects COD payment
    │
    ▼
POST /api/v1/fraud/otp/send  { phone: "01711234567" }
    │
    ▼
Customer enters OTP in checkout form
    │
    ▼
POST /api/v1/fraud/otp/verify { phone: "...", otp: "1234" }
    │
    ├── Valid   → Checkout proceeds
    └── Invalid → wc_add_notice error, re-enter OTP
```

Settings: Merchant can enable/disable COD OTP independently of fraud scoring.

**OTP Rate Limiting (Required — Prevents SMS Abuse):**

> ⚠️ Without rate limiting, attackers can use the OTP endpoint to send unlimited SMS to any number — costing merchant money and harassing customers.

```typescript
// Backend: /api/v1/fraud/otp/send
// Rate limits (enforced via KV):
const LIMITS = {
  perPhone:   { max: 5,  window: '1h'  },  // 5 OTPs per phone per hour
  perStore:   { max: 100, window: '1h' },  // 100 OTPs per store per hour
  perIP:      { max: 10,  window: '1h' },  // 10 OTPs per IP per hour
};

// OTP properties:
// - 4-digit numeric (Bangla-friendly)
// - Expires in 10 minutes
// - Max 3 verification attempts (then invalidate)
// - Stored in KV (not D1) — auto-expires, no cleanup needed
```

**Error messages (merchant-facing):**
```
429 Too Many Requests → "OTP limit reached. Try again in 1 hour."
400 Invalid OTP       → "OTP সঠিক নয়। আবার চেষ্টা করুন। (X attempts remaining)"
410 OTP Expired       → "OTP মেয়াদ শেষ। নতুন OTP নিন।"
```

**Admin UI:**
- Order list: colored badge (🟢 Safe / 🟡 Review / 🔴 High Risk)
- Order detail: meta box with score, signals, [Approve] [Block] buttons
- Settings: threshold configuration, auto-block toggle

**Critical Implementation Note — API Response Shape (C4):**

> 🔴 **Ship-blocking bug discovered in review:** The existing PHP plugin checks `$result['success']` but the fraud API never returns a `success` field. Every fraud check silently exits — all orders pass regardless of risk score.

**Correct PHP integration:**
```php
// ❌ WRONG — API never returns 'success' field
if ( ! $result || empty( $result['success'] ) ) return;

// ✅ CORRECT — check for 'decision' field
if ( ! $result || empty( $result['decision'] ) ) {
    // API error — apply fail-closed behavior
    $timeout_behavior = get_option( 'ozzyl_fraud_timeout_behavior', 'hold' );
    if ( $timeout_behavior === 'hold' ) {
        $order->update_status( 'on-hold', 'Ozzyl: Fraud API unavailable — held for review.' );
    }
    return;
}

// Map decision to action
switch ( $result['decision'] ) {
    case 'block':
        wc_add_notice( __( 'Your order could not be completed. Please contact us.', 'ozzyl-commerce' ), 'error' );
        throw new Exception( 'Order blocked by fraud detection.' );
    case 'verify':
        // Trigger COD OTP flow (see OTP spec below)
        $this->initiate_otp_verification( $order, $result );
        break;
    case 'hold':
        $order->update_status( 'on-hold', 'Ozzyl: Order flagged for review. Score: ' . esc_html( $result['risk_score'] ) );
        break;
    case 'allow':
    default:
        // Proceed silently
        break;
}
```

**Add to Testing Strategy — required test case:**
```
[ ] PHP integration: verify response shape mapping
    → Mock API returning { decision: 'block', risk_score: 85 } → checkout blocked
    → Mock API returning { decision: 'allow', risk_score: 20 } → checkout succeeds
    → Mock API returning {} (empty) → fail-closed behavior triggered
    → Mock API timeout → fail-closed behavior triggered
```

**Output Escaping — XSS Prevention (H4):**
```php
// ❌ WRONG — XSS vector in order notes
$signals_text = implode( ', ', array_column( $result['signals'], 'type' ) );
$order->add_order_note( 'Signals: ' . $signals_text );

// ✅ CORRECT — always escape API data before rendering
$signals_text = implode( ', ', array_map(
    fn($s) => esc_html( $s['type'] ?? 'unknown' ),
    $result['signals'] ?? []
) );
$order->add_order_note( 'Ozzyl Fraud Signals: ' . $signals_text );
```

---

### Module 2: Server-Side Tracking 📊

**Scope required:** `tracking`  
**Min plan:** Starter  
**WC hooks used:**
- `woocommerce_payment_complete` — Purchase event
- `woocommerce_add_to_cart` — AddToCart event
- `woocommerce_checkout_order_processed` — InitiateCheckout event
- `wp_footer` — inject cookie capture JS

**Facebook CAPI Events:**
```
PageView        → Every page load (via JS + server)
ViewContent     → Product page visit
AddToCart       → Add to cart action
InitiateCheckout → Checkout start
Purchase        → Payment complete (SERVER-SIDE, 100% reliable)
```

**Google Server-Side:**
```
purchase        → GA4 conversion event
```

**Why valuable:** Browser-side pixels miss 30-40% of events due to ad blockers. Server-side fires 100% of the time.

**WPRocket / Caching Plugin Conflict Resolution:**

> ⚠️ `tracking.js` captures `_fbp` and `_fbc` cookies before checkout. If WPRocket defers this script, cookies will be missing on Purchase events — breaking attribution.

**Solution:**
```php
// Exclude ozzyl tracking.js from WPRocket defer/minify
add_filter('rocket_excluded_defer_js', function($excluded) {
    $excluded[] = 'ozzyl-tracking';  // script handle
    return $excluded;
});

add_filter('rocket_exclude_js', function($excluded) {
    $excluded[] = plugins_url('modules/server-tracking/assets/tracking.js', OZZYL_PLUGIN_FILE);
    return $excluded;
});
```

This is auto-applied when WPRocket is detected (`class_exists('WP_Rocket')`). Merchant does not need to configure anything. Same pattern applied for W3 Total Cache and LiteSpeed Cache.

---

### Module 3: Courier Auto-Dispatch 🚚

**Scope required:** `courier`  
**Min plan:** Starter  
**WC hooks used:**
- `woocommerce_order_status_processing` — auto-book shipment
- `woocommerce_order_status_changed` — sync status updates

**Multi-Courier Priority & Routing (H2 — Required Spec):**

> ⚠️ If a merchant configures both Pathao AND Steadfast, the system must have a clear selection rule. Undefined behavior leads to duplicate bookings or wrong courier selection.

```
Selection logic (in order of priority):
1. Order-level override: merchant manually selects courier in WC order page
2. Zone-based routing: admin configures rules (e.g., Dhaka → Pathao, outside → Steadfast)
3. Default courier: single courier set as default in Ozzyl settings
4. Fallback: first configured courier alphabetically (deterministic)

MVP (Phase 1): Only option 3 (single default) — one active courier at a time.
Phase 2: Zone-based routing rules UI.
```

**Idempotency Guard (H1 — Prevents Duplicate Shipments):**

> ⚠️ WooCommerce retries webhooks on timeout. Without idempotency, a slow fraud check (500ms) can trigger the status change webhook twice → two shipments booked for same order.

```php
// Before booking, check if already dispatched
$existing_consignment = $order->get_meta( '_ozzyl_courier_consignment_id' );
if ( ! empty( $existing_consignment ) ) {
    $order->add_order_note( 'Ozzyl: Courier already booked — skipping duplicate dispatch. ID: ' . esc_html( $existing_consignment ) );
    return;
}
// Proceed with booking only if no existing consignment
```

**RedX Area ID Resolution (H7 — Not Hardcoded):**

> ⚠️ Hardcoding `delivery_area_id: 1` sends all RedX orders to Dhaka Zone 1. Orders to Chittagong, Sylhet, Rangpur will fail delivery.

```
Resolution strategy:
1. Merchant configures default delivery area in Ozzyl settings (dropdown from RedX area list)
2. Backend caches RedX area list: GET /api/v1/courier/redx/areas
3. Order shipping district → mapped to RedX area_id via lookup table
4. Default: merchant's configured area (not hardcoded 1)
```

**Flow:**
```
Order → "Processing" status
    │
    ├── Check idempotency (_ozzyl_courier_consignment_id exists?) → skip if yes
    ▼
POST /api/v1/courier/book
{
  courier: "pathao",          ← from merchant settings
  recipient_name: "...",
  recipient_phone: "...",
  delivery_address: "...",
  weight_kg: 0.5,
  cod_amount: 2500,
  wc_order_id: 1234
}
    │
    ▼
{ tracking_id: "PT-123456" }
    │
    ├── Save as WC order meta: _ozzyl_tracking_id
    ├── Add order note: "📦 Pathao booked — Tracking: PT-123456"
    └── Optional: Send SMS to customer with tracking link
```

**Admin Meta Box on Order Page:**
```
[Ozzyl Courier]
Courier: Pathao
Tracking: PT-123456
Status: In Transit
[Refresh Status] [View on Pathao]
```

---

### Module 4: SMS Notifications 💬

**Scope required:** `sms`  
**Min plan:** Pro  
**Trigger events:**

| Trigger | Message (Bangla) |
|---|---|
| Order placed | `আপনার অর্ডার #১২৩৪ পাওয়া গেছে। ধন্যবাদ!` |
| Order confirmed | `আপনার অর্ডার #১২৩৪ confirm হয়েছে।` |
| Courier booked | `আপনার পার্সেল Pathao-তে দেওয়া হয়েছে। ট্র্যাকিং: PT-123456` |
| Out for delivery | `আজ আপনার পার্সেল ডেলিভারি হবে।` |
| Delivered | `পার্সেল পৌঁছেছে। Review দিন: [link]` |
| Abandoned cart | `আপনার কার্টে পণ্য রয়ে গেছে। অর্ডার করুন: [link]` |

**Settings:** Merchant can enable/disable each trigger, edit message templates.

**Unsubscribe / Opt-Out Mechanism (M4 — Required for PDPA Compliance):**

> ⚠️ Bangladesh PDPA draft (expected 2026) will require opt-out for marketing SMS. Abandoned cart reminders are marketing messages — customers never explicitly consented.

```
Every abandoned cart SMS MUST include opt-out instruction:
"এই নম্বরে আর SMS না পেতে STOP লিখুন: 01XXXXXXXXX"

Backend handles STOP replies:
POST /api/v1/sms/opt-out { phone: "01711234567", store_id: 123 }
→ Adds phone to store's SMS suppression list
→ No further marketing SMS sent to this number for this store
→ Transactional SMS (order status) still sent (not marketing)
```

**SMS Category: Transactional vs Marketing:**
```
Transactional (always send, no opt-out needed):
  - Order placed confirmation
  - Courier booked + tracking number
  - Out for delivery
  - Delivered

Marketing (respect opt-out):
  - Abandoned cart reminders
  - Review request after delivery
```

---

### Module 5: Abandoned Cart Recovery 🛒

**Scope required:** `abandoned_cart`  
**Min plan:** Starter  
**How it works:**
- WC cart session data → sync to Ozzyl on `woocommerce_cart_updated` hook (real-time, not cron)
- Ozzyl backend tracks sessions > 1 hour with no purchase
- Sends SMS/Push reminder
- Dashboard shows recovered revenue

**WP Cron Problem & Solution:**

> ⚠️ WP Cron is pseudo-cron — it only fires on HTTP requests. Low-traffic stores may go hours without a cron trigger. Do NOT rely on WP Cron for abandoned cart detection.

**Solution: Event-driven sync via WC hooks (real-time):**
```php
// Fire on every cart update — no cron needed
add_action('woocommerce_cart_updated', [OzzylAbandonedCart::class, 'sync_cart']);
add_action('woocommerce_checkout_order_processed', [OzzylAbandonedCart::class, 'mark_converted']);

// sync_cart() sends:
// POST /api/v1/cart/sync
// { session_id, customer_phone, customer_email, items, total, updated_at }

// mark_converted() sends:
// POST /api/v1/cart/sync { session_id, converted: true }
```

**Reminder timing** (handled by Ozzyl backend scheduler, NOT WP Cron):
```
t+1h  → First SMS reminder
t+24h → Second SMS reminder (if not purchased)
t+48h → Final reminder + optional discount code
```

**Note for merchant:** "Ozzyl handles reminder scheduling on our servers — your WordPress site doesn't need to be online for reminders to send."

---

### Module 6: Analytics Dashboard Widget 📈

**Scope required:** `analytics`  
**Min plan:** Free  

**Data Collection on Free Plan:**

> ⚠️ Decision: Does free tier collect analytics data or just show a preview?

**Answer: YES — data is collected from day 1 (free tier), but display is limited.**

Rationale: If we don't collect data on free tier, merchants who upgrade will see empty charts for their historical period — terrible UX and a conversion killer. Collect everything, gate the display.

```
Free tier  → Data collected ✅ | Full dashboard shown ❌ (preview/blurred)
Starter+   → Data collected ✅ | Full dashboard shown ✅
```

**Free tier WP Dashboard widget shows:**
```
[Ozzyl Analytics — Preview Mode]
Revenue:     ৳██,███   ↑ ██%   [Unlock →]
Orders:      ███                [Unlock →]
Avg Order:   ৳███               [Unlock →]
Fraud Blocked: collecting data...

[🔓 Upgrade to Starter — ৳৯৯০/মাস to unlock your data]
```

**Starter+ WP Dashboard widget shows:**
```
[Ozzyl Analytics — Last 30 Days]
Revenue:     ৳1,24,500   ↑ 12%
Orders:      234          ↑ 8%
Avg Order:   ৳532
Fraud Blocked: 12 orders  ৳28,400 saved
[View Full Dashboard →]
```

---

## 6. Backend API Plan

### Endpoint Strategy — Existing vs New

> ⚠️ **Important:** `/api/fraud-check` already exists in `apps/web/app/routes/api.fraud-check.ts` (internal, session-auth). Do NOT duplicate. Strategy:

| Existing Endpoint | Status | v1 Strategy |
|---|---|---|
| `/api/fraud-check` | Internal, session-auth | Refactor core logic into shared `fraud-engine.server.ts` service (already done). v1 route calls same service via API-key auth. |
| `/api/courier/pathao` | Internal, session-auth | Same pattern — shared service, new v1 wrapper |
| `/api/track-events` | Internal | New v1 endpoint calls `facebook-capi.server.ts` directly |

**Rule:** Never duplicate business logic. v1 routes are thin wrappers over existing services with API-key auth instead of session auth.

### New v1 Endpoints Required

```
# Fraud
POST   /api/v1/fraud/check              ← Wrapper over fraud-engine.server.ts
GET    /api/v1/fraud/events             ← Fraud log for WC merchant
POST   /api/v1/fraud/blacklist          ← Add to blacklist from WC
DELETE /api/v1/fraud/blacklist/:phone   ← Remove from blacklist
POST   /api/v1/fraud/otp/send           ← COD OTP send (NEW)
POST   /api/v1/fraud/otp/verify         ← COD OTP verify (NEW)

# Tracking
POST   /api/v1/tracking/event           ← Wrapper over facebook-capi.server.ts

# Courier
POST   /api/v1/courier/book             ← Wrapper over courier-dispatch.server.ts
GET    /api/v1/courier/:tracking_id     ← Status check
POST   /api/v1/courier/sync             ← Bulk status refresh

# SMS
POST   /api/v1/sms/send                 ← Wrapper over messaging.server.ts

# Abandoned Cart
POST   /api/v1/cart/sync                ← Sync WC cart sessions
GET    /api/v1/cart/abandoned           ← Get abandoned carts

# WooCommerce Webhook Receiver
POST   /api/v1/wc/webhook               ← Receive & verify WC events (see auth below)
```

### WooCommerce Webhook Authentication

> ⚠️ **Security Critical:** WooCommerce sends `X-WC-Webhook-Signature` header (HMAC-SHA256 of payload using WC secret). This MUST be verified — without it, anyone can POST fake events to manipulate orders.

```typescript
// apps/web/server/api/v1/routes/wc-webhook.ts
wcWebhookRouter.post('/', async (c) => {
  const signature = c.req.header('X-WC-Webhook-Signature');
  const body      = await c.req.text(); // raw body for HMAC
  const secret    = c.var.apiKey.wcWebhookSecret; // stored per store

  // Verify HMAC-SHA256
  const expected = await crypto.subtle.sign(
    'HMAC',
    await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']),
    new TextEncoder().encode(body)
  );
  const expectedB64 = btoa(String.fromCharCode(...new Uint8Array(expected)));

  if (expectedB64 !== signature) {
    return c.json({ error: 'Invalid webhook signature' }, 401);
  }

  // Parse and process event
  const event = JSON.parse(body);
  // handle: order.created, order.paid, order.completed, customer.created
});
```

**Plugin side — Step-by-Step Setup Flow for Merchant:**

```
Step 1: Merchant goes to Ozzyl Settings → Webhook tab
        → Plugin shows: "Your Webhook URL: https://app.ozzyl.com/api/v1/wc/webhook"
        → Plugin shows: "Your Webhook Secret: [Copy]" (auto-generated per store)

Step 2: Merchant goes to WooCommerce → Settings → Advanced → Webhooks → Add Webhook
        → Name: "Ozzyl Sync"
        → Status: Active
        → Topic: Select All (or: Order Created, Order Updated, Customer Created)
        → Delivery URL: [paste from Step 1]
        → Secret: [paste from Step 1]
        → API Version: WP REST API Integration v3
        → [Save Webhook]

Step 3: Plugin auto-verifies the webhook on next page load
        → GET /api/v1/wc/webhook/verify → { verified: true }
        → Settings page shows: "✅ Webhook connected"
```

**Auto-setup option (recommended UX):** If merchant grants WooCommerce REST API access (via OAuth), plugin can create the webhook automatically — zero manual steps. This should be the default flow.

### API Key Scopes (Database Change)

```sql
-- Add to api_keys table
ALTER TABLE api_keys ADD COLUMN scopes            TEXT DEFAULT 'analytics';
ALTER TABLE api_keys ADD COLUMN plan              TEXT DEFAULT 'free';
ALTER TABLE api_keys ADD COLUMN wc_webhook_secret TEXT DEFAULT NULL;

-- Scope values:
-- free:    'analytics'
-- starter: 'analytics,fraud,tracking,courier,abandoned_cart'
-- pro:     'analytics,fraud,tracking,courier,abandoned_cart,sms,automation'
```

### Authentication Flow

```
WC Plugin → API Key in header: Authorization: Bearer sk_live_xxx
                │
                ▼
         Hono Middleware
         api-key-auth.ts
                │
         Check scope for route
                │
         ┌──────┴──────┐
         ▼             ▼
      Authorized    403 Insufficient
                    scope → Upgrade CTA
```

---

## 7. Pricing Model

| Plan | Price | Scopes | Target |
|---|---|---|---|
| **Free** | ৳০/মাস | Analytics (preview/limited) | Try করার জন্য |
| **Starter** | ৳৯৯০/মাস | + Fraud + COD OTP + CAPI + Courier + Abandoned Cart | Small-medium merchants |
| **Pro** | ৳২,৪৯০/মাস | + SMS + Automation + Priority Support | Growing stores |
| **Enterprise** | Custom | All + dedicated support + custom integrations | Large merchants |

> **Pricing Rationale (v2 — post adversarial review):**
> - Courier moved from Pro → Starter. Bangladesh merchants value courier dispatch highly — locking it behind Pro would kill conversions.
> - COD OTP added to Starter (not Pro) — it's the #1 pain point and must be accessible.
> - Free tier now shows analytics in **preview mode** (blurred data, upgrade CTA) — not full data. This creates desire without giving full value away.

### Free Tier — Preview Mode (Not Full Access)

```
[Ozzyl Analytics — Preview]
Revenue:    ৳██,███   [Unlock to see →]
Orders:     ███        [Unlock to see →]
Fraud:      █ orders blocked this month
            [Upgrade to Starter to see details]

[Start Free Trial — ৳৯৯০/মাস]
```

This is the "jobs to be done" model — show merchants *that* there's value, not *what* the value is. Converts better than showing full data for free.

### Upsell Flow

When a merchant tries to enable a locked module:
```
[🔒 Upgrade to Pro — ৳২,৪৯০/মাস]
→ Opens ozzyl.com/pricing?ref=wc-plugin&module=sms
```

This creates an **in-plugin upgrade funnel** — merchant doesn't need to visit the website, the upgrade CTA is right inside WordPress admin.

---

## 8. Build Timeline

| Week | Phase | Deliverables | Buffer |
|---|---|---|---|
| **Week 1** | Backend API | Scopes in DB, COD OTP endpoints, fraud/tracking/courier/sms/cart v1 wrappers, WC webhook with HMAC auth | 1 day buffer |
| **Week 2** | Plugin Core + Fraud | Module architecture, Core loader, Fraud Detection + COD OTP module | 1 day buffer |
| **Week 3** | Tracking + Courier | Facebook CAPI module (with WPRocket compat), Courier auto-dispatch module | 2 day buffer (WC compat issues expected) |
| **Week 4** | SMS + Cart + UI | SMS module, Abandoned cart (event-driven), Module cards admin UI, upgrade CTAs | 1 day buffer |
| **Week 5** | QA Round 1 | Compatibility matrix (WP 6.5+WC 8.x+PHP 8.1), plugin conflict testing (WPRocket, Yoast, Elementor) | Full week — no features |
| **Week 6** | Bug Fixes + QA Round 2 | Fix issues from Week 5, retest, security review | 2 day buffer |
| **Week 7** | Release | Final ZIP, readme, docs, WordPress.org submission prep | — |

> **Timeline Rationale (v2 — post adversarial review):**  
> Original 5-week plan had zero buffer. WooCommerce compatibility testing alone requires a full week. PHP version quirks (7.4 vs 8.2), caching plugin conflicts, and HMAC webhook debugging each take 1-2 extra days. Real timeline: **7 weeks** for a production-quality release.

### Parallel Workstreams

```
Backend (Hono)               Plugin (PHP)                Admin UI (PHP/JS)
──────────────               ────────────                ─────────────────
Week 1: All v1 endpoints     Week 2: Core + Fraud+OTP    Week 4: Module cards
Week 2: Fraud+OTP APIs       Week 3: CAPI + Courier       Week 4: Settings UI
Week 3: Courier + Tracking   Week 4: SMS + Cart           Week 4: Upgrade CTAs
Week 4: SMS + Cart APIs      Week 5-6: QA + Bug fixes     Week 6: UI polish
```

---

## 9. Testing Strategy

### Compatibility Matrix

| WordPress | WooCommerce | PHP | Priority |
|---|---|---|---|
| 6.5 | 8.x | 8.1 | 🔴 Must pass |
| 6.6 | 9.x | 8.2 | 🔴 Must pass |
| 6.4 | 7.x | 8.0 | 🟡 Should pass |
| 6.3 | 7.x | 7.4 | 🟢 Nice to have |

### Test Cases Per Module

**Fraud Detection:**
- [ ] Low-risk order → checkout succeeds silently
- [ ] Medium-risk order → held, merchant notified
- [ ] High-risk order → blocked with user-facing error
- [ ] API timeout → **fail-closed** (hold order, log warning, notify merchant)
- [ ] Blacklist add/remove from WC order page

**Server Tracking:**
- [ ] Purchase event fires on payment complete
- [ ] Event includes hashed PII (email, phone)
- [ ] fbp/fbc cookies captured correctly
- [ ] Works with ad blocker active (server-side)

**Courier:**
- [ ] Auto-dispatch fires on "Processing" status
- [ ] Tracking ID saved to order meta
- [ ] Order note added with tracking info
- [ ] Manual dispatch from order page works
- [ ] API failure → graceful error, no silent failure

**SMS:**
- [ ] Each trigger sends correct template
- [ ] Merchant can disable individual triggers
- [ ] Custom templates saved correctly
- [ ] No duplicate sends on retry

### Plugin Conflict Testing

Must test with:
- Yoast SEO (very common)
- WPRocket (caching — affects our JS)
- Elementor (page builder)
- WooCommerce Subscriptions
- WPML (multilingual)

---

## 10. Data Privacy & Legal Compliance

### What Data Flows to Ozzyl Backend

| Data Type | Where Stored | Retention |
|---|---|---|
| Customer phone (hashed SHA-256) | Ozzyl D1 (Cloudflare edge) | 90 days |
| Customer email (hashed SHA-256) | Ozzyl D1 | 90 days |
| IP address | Ozzyl D1 (fraud events only) | 30 days |
| Order total, items count | Ozzyl D1 | 1 year |
| Cart session (items, total) | Ozzyl D1 | 7 days |
| Raw PII (name, address) | **Never sent to Ozzyl** | N/A |

### Bangladesh Legal Context

- **Digital Security Act 2018**: Covers cybercrime but not explicit data residency requirements yet.
- **Personal Data Protection Act (draft)**: Expected to pass in 2026 — will require data processing consent.
- **Cloudflare Edge Location**: Data may be processed in Singapore/Tokyo edge nodes. No Bangladesh-specific data residency requirement currently.

### Merchant Consent Flow (Required)

```
Plugin activation → Merchant shown:
"By connecting to Ozzyl, order and customer data (hashed)
will be processed by Ozzyl servers to enable fraud detection
and tracking features. No raw personal data is shared.
[Accept & Connect] [Cancel]"
```

### Minimum Privacy Requirements Before Release

- [ ] Privacy policy page at `ozzyl.com/privacy` covers WC plugin data
- [ ] `readme.txt` discloses data sent to external service (WordPress.org requirement)
- [ ] Consent checkbox shown on first plugin activation
- [ ] Data deletion endpoint: `DELETE /api/v1/store/data` — purges all store data on request

---

## 11. Open Questions & Risks

### Questions (Resolved)

1. **COD OTP verification** — ✅ **Decision: Phase 1.** BD's #1 fraud vector. Included in Starter plan.

2. **WhatsApp Business API** — ✅ **Decision: SMS first, WABA Phase 3.**
   - WABA approval: ~8 weeks + Meta BSP partnership required
   - Minimum monthly message volume: 1,000+ (small merchants won't qualify)
   - Bangladesh SMS delivery rate is already 95%+
   - **Phase 3 plan:** Partner with a local BSP (e.g., Infobip BD) for WABA access

3. **WordPress.org listing** — ✅ **Decision: Submit after Woo.com review.** WP.org submission requires 8-12 weeks and specific compliance requirements (see Section 12). Submit to Woo.com first — approved plugins get fast-tracked on WP.org.

4. **WooCommerce Marketplace** — ✅ **Decision: Yes, target for Phase 2.** Requires ~4-6 week review process. Start submission at Week 5 (during QA).

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| WC API breaking changes | Medium | High | Version lock + test matrix |
| Fraud API latency (H3) | Medium | High | Use async hook (`woocommerce_checkout_order_created`) not synchronous process hook. Target P95 < 300ms. |
| `fraudchecker.link` SPOF (C1) | Medium | High | 24h KV cache. Degraded-mode alert. Fallback: score without external signal. |
| Auto-global-blacklist abuse (C3) | Low | Critical | Quorum of 3+ stores required before global promotion. |
| SMS gateway downtime | Medium | Medium | Retry queue + fallback gateway + Transactional/Marketing split |
| Steadfast session cookie expiry (C6) | High | Medium | Credential expiry detection + merchant alert email |
| D1 `fraudIpEvents` growth (M6) | High | Medium | Weekly cleanup cron: delete rows older than 30 days |
| Settings KV cache stale (M7) | Low | Low | All writes via `saveUnifiedStorefrontSettingsWithCacheInvalidation()` |
| WordPress.org rejection (M8) | Medium | Medium | Full submission checklist in Section 12. Submit Woo.com first. |
| Merchant data privacy | Low | High | Never store PII in WP DB. SHA-256 hash only. Consent on activation. |
| Webhook secret plaintext (H10) | Low | High | AES-256 encrypt `wc_webhook_secret` at rest using Cloudflare secret key. |
| Quota race condition free-tier (H6) | Medium | Low | Atomic D1 increment with WHERE clause guard. |

---

---

## 12. Risks — Critical Details (Round 3 Additions)

### C1: fraudchecker.link — Undisclosed Single Point of Failure

`fraud-engine.server.ts` Signal 8 calls `fraudchecker.link` — an informal Bangladesh-market fraud data service. It adds up to +40 points to risk score. **Risks:**
- No documented SLA
- Uses fake browser User-Agent (`Mozilla/5.0...`) — scraping, not official API
- At scale (1,000+ stores), IP may get rate-limited or blocked

**Mitigation in plan:**
- 24h KV cache already implemented — reduces call frequency significantly
- Degraded-mode: if service unavailable, score without Signal 8 (document the -40 point impact to merchants)
- Add merchant-visible alert: "External fraud signal unavailable — scores may be lower today"
- Explore official partnership with fraudchecker.link or alternative BD fraud data provider

### C2: CORS Policy Fix

Fraud API must NOT use `Access-Control-Allow-Origin: *`. Server-to-server APIs require no CORS. Add to backend security checklist:
```
Access-Control-Allow-Origin: (removed — server-to-server only)
```

### C3: Global Blacklist — Quorum Rule

Auto-global-blacklist promotion requires **quorum of 3+ independent stores** blocking the same phone number before it affects all stores. Implementation:
```sql
-- Only promote to global after 3+ stores independently block
SELECT COUNT(DISTINCT store_id) as store_count
FROM fraud_blacklist
WHERE phone_hash = ? AND store_id IS NOT NULL
HAVING store_count >= 3
→ Then insert with store_id = NULL (global)
```

### C5: OTP Rate Limiting — Phone Normalization

All OTP KV keys MUST use `normalizePhone()` output. Test all formats hit same bucket:
- `+8801711234567` → `01711234567`
- `8801711234567` → `01711234567`
- `01711234567` → `01711234567`
- `1711234567` → `01711234567`

### C6: Steadfast Session Cookie Dependency

Steadfast fraud check uses scraped session cookies. This is documented as **"unofficial/advanced"** integration:
- Add credential expiry detection (HTTP 401/403 response → merchant alert)
- Alert message: "Steadfast fraud signal unavailable — please refresh credentials in Ozzyl settings"
- Track as technical debt — pursue official Steadfast API access

### H3: Async Fraud Check

Use `woocommerce_checkout_order_created` (fires after order saved to DB) instead of `woocommerce_checkout_process` (synchronous, blocks PHP thread). Flow:
```
Checkout submitted → Order saved (status: pending) → Async fraud check
    │
    ├── Low risk  → Auto-confirm (status: processing)
    ├── Medium    → Hold for review (status: on-hold)
    └── High risk → Cancel + notify merchant
```
Customer sees: "Your order has been received and is being processed." — no hang.

### H10: Webhook Secret Encryption

```typescript
// Store encrypted:
const encrypted = await encryptAES256(webhookSecret, env.WC_WEBHOOK_ENCRYPTION_KEY);
await db.update(apiKeys).set({ wcWebhookSecret: encrypted });

// Decrypt only at verification time:
const secret = await decryptAES256(apiKey.wcWebhookSecret, env.WC_WEBHOOK_ENCRYPTION_KEY);
```

### M6: fraudIpEvents Cleanup Cron

Add to `workers/courier-cron/`:
```sql
-- Weekly cleanup (run every Sunday 02:00 BD time)
DELETE FROM fraud_ip_events WHERE created_at < datetime('now', '-30 days');
DELETE FROM fraud_events WHERE created_at < datetime('now', '-90 days');
```

---

## 13. Success KPIs (Post-Launch — Week 8+)

| KPI | Target | How Measured |
|---|---|---|
| Plugin activation rate | >60% of connected WC stores activate ≥1 module | Ozzyl analytics |
| Fraud prevention rate | >15% of COD orders flagged (BD baseline) | `fraud_events` table |
| False positive rate | <2% legitimate orders incorrectly held | Merchant approval rate on held orders |
| Fraud API P95 latency | <300ms | Cloudflare analytics |
| Courier dispatch success rate | >95% first attempt | `courier_bookings` table |
| SMS delivery rate | >92% | SMS gateway delivery reports |
| Abandoned cart recovery rate | >8% of reminded carts convert | `cart_sessions` table |
| Free → Starter conversion | >15% within 30 days | License upgrade events |
| Monthly churn rate | <5% | Subscription cancellations |
| WP.org rating | >4.5 stars | WordPress.org listing |

### QA Pass/Fail Gate (Week 5)

```
✅ PASS = Release proceeds:
  - 0 Critical bugs
  - <3 High bugs (none in fraud/courier core)
  - Fraud API P95 < 300ms (load: 50 concurrent checkouts)
  - All compatibility matrix combinations pass checkout flow
  - False positive rate < 2% on 100-order test set
  - WP plugin validator: 0 errors, <5 warnings

❌ FAIL = 1-week delay + retest
```

---

## Appendix: Admin UI Mockup

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ Ozzyl Commerce — Modules              [Connected ✓]      │
│  Plan: Starter  |  Store: myshop.com  |  [Upgrade to Pro]   │
├──────────────────────────┬──────────────────────────────────┤
│ 🛡️ Fraud Detection       │ 📊 Server-Side Tracking          │
│ [Toggle: ON  ●]          │ [Toggle: ON  ●]                  │
│ 34 orders blocked/month  │ Facebook CAPI + Google           │
│ ৳82,400 saved            │ 99.2% event match rate           │
│ [Configure]              │ [Configure]                      │
├──────────────────────────┼──────────────────────────────────┤
│ 🛒 Abandoned Cart        │ 📈 Analytics Widget              │
│ [Toggle: OFF ○]          │ [Toggle: ON  ●]                  │
│ Recover lost revenue      │ Shows in WP Dashboard           │
│ [Enable]                 │ [Configure]                      │
├──────────────────────────┼──────────────────────────────────┤
│ 🚚 Courier Manager       │ 💬 SMS Notifications             │
│ 🔒 Pro Plan Required     │ 🔒 Pro Plan Required             │
│ Pathao · Steadfast · RedX│ Bangla SMS templates             │
│ [Upgrade to Pro →]       │ [Upgrade to Pro →]               │
└──────────────────────────┴──────────────────────────────────┘
```
