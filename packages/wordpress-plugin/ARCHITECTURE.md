# Ozzyl Commerce WordPress Plugin — Module Architecture

## Overview

The Ozzyl Commerce WordPress plugin has been restructured from a flat codebase to a **modular architecture** with proper separation of concerns.

### Design Principles

1. **Module-First**: All new features are implemented as standalone modules
2. **Fail-Safe**: Modules can be independently enabled/disabled without breaking core functionality
3. **Plan-Aware**: Modules respect user's Ozzyl plan and available scopes
4. **Security-First**: All user inputs validated, API responses escaped, nonces enforced
5. **Performance**: Efficient API caching, minimal DB queries, async operations where possible

---

## Directory Structure

```
packages/wordpress-plugin/
├── core/                          # Core module system
│   ├── OzzylModuleInterface.php    # Module contract
│   ├── class-ozzyl-core.php        # Bootstrap & module loader
│   ├── class-ozzyl-api.php         # API client (moved from includes/)
│   ├── class-ozzyl-license.php     # Plan/scope validator
│   └── class-ozzyl-logger.php      # Debug logging
│
├── modules/                       # Feature modules
│   ├── fraud-detection/
│   │   ├── module.php             # Main module class
│   │   ├── class-fraud-hooks.php   # WooCommerce hooks
│   │   ├── assets/
│   │   │   └── checkout.js        # OTP countdown timer
│   │   └── views/
│   │       └── fraud-meta-box.php  # Order admin display
│   │
│   ├── server-tracking/
│   │   ├── module.php             # Conversion event tracking
│   │   └── assets/
│   │       └── tracking.js        # Cookie capture (Meta pixels)
│   │
│   ├── courier/
│   │   ├── module.php             # Auto-dispatch orders
│   │   └── views/
│   │       └── courier-meta-box.php
│   │
│   ├── sms-notifications/
│   │   └── module.php             # Transactional SMS
│   │
│   ├── abandoned-cart/
│   │   └── module.php             # Cart sync & recovery
│   │
│   └── analytics/
│       ├── module.php
│       └── views/
│           └── dashboard-widget.php # Analytics dashboard
│
├── admin/
│   ├── class-ozzyl-admin.php       # Admin settings
│   ├── assets/                     # Styles & scripts
│   └── views/
│       ├── modules.php             # Module management (new!)
│       ├── settings.php            # General settings
│       └── status.php              # Status page
│
├── includes/                      # Legacy (for backward compatibility)
│   ├── class-ozzyl-auth.php
│   ├── class-ozzyl-webhook.php
│   ├── class-ozzyl-sync.php
│   └── class-ozzyl-widget.php
│
├── public/
│   └── class-ozzyl-public.php      # Public-facing features
│
└── ozzyl-commerce.php              # Main entry point
```

---

## Core System

### 1. Module Interface (`OzzylModuleInterface.php`)

All modules must implement this interface:

```php
interface OzzylModuleInterface {
    public function get_id(): string;                // e.g., 'fraud-detection'
    public function get_name(): string;              // Display name
    public function get_icon(): string;              // Emoji icon
    public function get_description(): string;       // Short description
    public function get_required_scope(): string;    // API scope (e.g., 'fraud')
    public function get_min_plan(): string;          // 'free'|'starter'|'pro'|'enterprise'
    public function activate(): void;                // Register hooks
    public function deactivate(): void;              // Remove hooks
    public function render_settings(): void;         // Settings form
    public function get_stats(): array;              // Dashboard stats
}
```

### 2. Core Bootstrap (`class-ozzyl-core.php`)

Singleton that:
- Initializes API client and license validator
- Discovers and loads all modules from `modules/*/module.php`
- Activates modules if enabled in WP options AND plan has required scope
- Provides module registry to admin/public UI

**Key Methods:**
```php
$core = Ozzyl_Core::instance();
$core->get_modules(): OzzylModuleInterface[]
$core->get_module($id): ?OzzylModuleInterface
$core->is_module_active($id): bool
$core->enable_module($id): bool
$core->disable_module($id): bool
$core->deactivate_all(): void
```

### 3. License Validator (`class-ozzyl-license.php`)

Validates user's plan and available scopes by calling `GET /api/v1/store`:

```php
$license = $core->get_license();
$plan = $license->get_plan();           // 'free'|'starter'|'pro'|'enterprise'
$has_fraud = $license->has_scope('fraud'); // true/false
$license->refresh();                    // Force API call, skip cache
```

**Caching**: Results cached in WP transient `ozzyl_license_cache` for 1 hour.

### 4. API Client (`class-ozzyl-api.php`)

Moved from `includes/` to `core/` for better organization. Unchanged functionality.

### 5. Logger (`class-ozzyl-logger.php`)

Simple static logging utility (logs only when `WP_DEBUG` is true):

```php
Ozzyl_Logger::info('Order processed', ['order_id' => 123]);
Ozzyl_Logger::warning('Suspicious activity', ['reason' => 'high_risk_score']);
Ozzyl_Logger::error('API timeout', ['endpoint' => '/fraud/check']);
```

Format: `[Ozzyl][LEVEL] message {json_context}`

---

## Modules Overview

### Fraud Detection (`fraud-detection/module.php`)

**Required Scope**: `fraud`  
**Min Plan**: `starter`

**Features:**
- Checks orders for fraud via `POST /api/v1/fraud/check`
- **CRITICAL**: Checks `$result['decision']` field (NOT `success`)
- Maps decisions to WooCommerce actions:
  - `allow` → Proceed silently
  - `verify` → Trigger COD OTP flow
  - `hold` → Order on-hold with note
  - `block` → Order cancelled, notify merchant
- Fail-closed on API timeout (configurable)
- COD OTP verification with countdown timer
- Admin order meta box showing risk score & signals

**Settings:**
- Check all payment methods (not just COD)
- Fail-closed strategy on API error
- Enable/disable COD OTP verification

**CRITICAL BUG FIX:**
The original C4 bug was checking `$result['success']` which doesn't exist in the API response. The module now correctly checks `$result['decision']`.

### Server-Side Tracking (`server-tracking/module.php`)

**Required Scope**: `tracking`  
**Min Plan**: `free`

**Features:**
- Tracks conversion events:
  - `Purchase` (on `woocommerce_payment_complete`)
  - `AddToCart` (on `woocommerce_add_to_cart`)
  - `InitiateCheckout` (on `woocommerce_checkout_order_processed`)
- Captures Meta/Facebook cookies (`_fbp`, `_fbc`) for CAPI
- Auto-detects caching plugins (WP Rocket, W3TC)

**JavaScript** (`tracking.js`):
- Captures cookies before checkout
- Stores in sessionStorage
- Adds hidden form fields for server transmission

### Courier Integration (`courier/module.php`)

**Required Scope**: `courier`  
**Min Plan**: `starter`

**Features:**
- Auto-dispatch orders to courier on `woocommerce_order_status_processing`
- Idempotency check: skips if already dispatched
- Single default courier (Phase 1)
- API: `POST /api/v1/courier/book`
- Order notes with consignment ID
- Admin meta box showing status & refresh button

**Settings:**
- Enable/disable auto-dispatch
- Default courier provider (pathao, redx, steadfast, etc.)

### SMS Notifications (`sms-notifications/module.php`)

**Required Scope**: `sms`  
**Min Plan**: `starter`

**Triggers** (each independently toggleable):
- Order placed
- Order confirmed (processing)
- Courier booked
- Order delivered

**Implementation:**
- Gets customer phone from order
- Normalizes phone number
- `POST /api/v1/sms/send` with type='transactional'
- Phone masked in logs for privacy

### Abandoned Cart (`abandoned-cart/module.php`)

**Required Scope**: `abandoned_cart`  
**Min Plan**: `pro`

**Features:**
- Real-time cart sync (NOT WP Cron)
- `POST /api/v1/cart/sync` on every cart update
- Marks cart as converted on order placement
- Captures customer phone/email from WC session

### Analytics (`analytics/module.php`)

**Required Scope**: `analytics`  
**Min Plan**: `free`

**Features:**
- WordPress dashboard widget
- Shows 30-day summary via `GET /api/v1/analytics/summary?period=30d`
- Free plan: blurred preview with upgrade CTA
- Starter+: full data

---

## Module Lifecycle

### 1. **Registration** (plugin load)

```php
// In modules/fraud-detection/module.php (end of file):
$core = Ozzyl_Core::instance();
$core->register_module(new Ozzyl_Module_Fraud_Detection());
```

### 2. **Activation Check** (plugin init)

For each module:
1. Check if enabled in WP options: `ozzyl_module_{id}_enabled`
2. Check if plan has required scope
3. Call `activate()` if both conditions met

### 3. **Runtime** (hooks registered)

Module's `activate()` method registers all WooCommerce hooks.

### 4. **Deactivation** (admin toggle or plugin deactivation)

Module's `deactivate()` method:
- Removes all hooks (`remove_action`, `remove_filter`)
- Cancels WP Cron jobs (`wp_clear_scheduled_hook`)
- Deletes transients (`delete_transient`)
- **MUST NOT** delete WP options or DB tables

### 5. **Admin Management** (`admin/views/modules.php`)

Merchants can:
- View all available modules as app-store cards
- Toggle enable/disable (respects plan scopes)
- See module stats (orders blocked, SMS sent, etc.)
- Access module settings form
- See upgrade CTA for locked modules

---

## Security Practices

### Input Validation

All user inputs validated with Zod or sanitization functions:

```php
$phone = sanitize_text_field($input);
$number = absint($input);
$url = esc_url($input);
```

### Output Escaping

All dynamic content escaped before output:

```php
// When outputting fraud signals (from API response):
foreach ($signals as $signal) {
    echo '<li>' . esc_html($signal) . '</li>';
}

// Order notes (already escaped before saving):
$order->add_order_note(esc_html($message));
```

### Nonce Protection

All admin forms protected:

```php
wp_nonce_field('ozzyl_fraud_settings_nonce');
check_admin_referer('ozzyl_fraud_settings_nonce');
```

### Capability Checks

Admin actions require proper capabilities:

```php
if (!current_user_can('manage_woocommerce')) {
    wp_die('Unauthorized');
}
```

### Multi-Tenancy (Future)

When supporting multiple stores:
- All queries filtered by `store_id`
- API key scoped to single store
- Webhook validation per store

---

## Development Guide

### Creating a New Module

1. **Create module directory:**
   ```bash
   mkdir -p packages/wordpress-plugin/modules/my-feature
   ```

2. **Create `module.php`:**
   ```php
   <?php
   class Ozzyl_Module_My_Feature implements OzzylModuleInterface {
       public function get_id(): string { return 'my-feature'; }
       public function get_name(): string { return __('My Feature', 'ozzyl-commerce'); }
       public function get_icon(): string { return '✨'; }
       public function get_description(): string { return __('...', 'ozzyl-commerce'); }
       public function get_required_scope(): string { return 'my_scope'; }
       public function get_min_plan(): string { return 'starter'; }
       public function activate(): void {
           add_action(...);
       }
       public function deactivate(): void {
           remove_action(...);
       }
       public function render_settings(): void { ?>
           <!-- form HTML -->
       <?php }
       public function get_stats(): array { return [...]; }
   }

   // Register at end of file
   $core = Ozzyl_Core::instance();
   $core->register_module(new Ozzyl_Module_My_Feature());
   ```

3. **Register hooks carefully:**
   - Use action/filter names that won't conflict
   - Store module-scoped data in order meta or options
   - Always use `remove_action` in deactivate

4. **Create settings form** (in `render_settings()`)
   - Wrap options with `ozzyl_module_{id}_` prefix
   - Use `wp_nonce_field()` for security
   - Call `current_user_can('manage_options')` check

5. **Implement stats** (in `get_stats()`)
   - Query database for module-specific metrics
   - Return associative array of stats
   - Used in admin modules list

---

## API Integration

### Fraud Check Endpoint

```
POST /api/v1/fraud/check
{
  "order_id": 123,
  "customer_email": "user@example.com",
  "customer_phone": "+8801234567890",
  "total": 5000,
  "items_count": 2,
  "payment_method": "cod"
}

Response:
{
  "decision": "hold",  // "allow" | "verify" | "hold" | "block"
  "score": 75,         // Risk score 0-100
  "signals": [
    "high_order_value",
    "new_customer",
    "suspicious_location"
  ]
}
```

### Other Endpoints

- `GET /api/v1/store` — Get plan & scopes (cached 1 hour)
- `POST /api/v1/courier/book` — Book courier
- `POST /api/v1/sms/send` — Send SMS
- `POST /api/v1/cart/sync` — Sync/recover cart
- `GET /api/v1/analytics/summary` — Get analytics
- `POST /api/v1/tracking/event` — Track event

---

## Testing

### Unit Tests

```bash
npm run test -- --run packages/wordpress-plugin/
```

### Manual Testing

1. **Enable debug logging:**
   ```php
   define('WP_DEBUG', true);
   define('WP_DEBUG_LOG', true);
   ```

2. **Check logs:**
   ```bash
   tail -f /wp-content/debug.log | grep Ozzyl
   ```

3. **Test module enable/disable:**
   - Go to Ozzyl → Modules
   - Toggle modules on/off
   - Check hooks are registered/removed via debug log

4. **Test plan restrictions:**
   - Use test API key with `free` plan
   - Try enabling `starter`-required modules
   - Verify locked module CTA works

---

## Backward Compatibility

- Old `includes/` classes still available for legacy code
- `Ozzyl_API` accessible via `$plugin->api` or `Ozzyl_Core::instance()->get_api()`
- Old hooks still fire (e.g., `woocommerce_payment_complete`)
- Old shortcodes still work (`[ozzyl_store]`, etc.)

**Migration Path:**
1. Old features refactored as modules over time
2. Legacy classes kept for 2-3 major versions
3. Deprecation notices logged for old patterns
4. Eventually removed in major version bump

---

## Troubleshooting

### Module not activating

1. Check WP options: `wp option get ozzyl_module_fraud-detection_enabled`
2. Check license: `wp eval 'echo Ozzyl_Core::instance()->get_license()->get_plan();'`
3. Check debug log: `grep '\[Ozzyl\]' /wp-content/debug.log`

### Hooks not firing

1. Verify module active: `Ozzyl_Core::instance()->is_module_active('module-id')`
2. Check hook priority (lower = earlier): `has_action('hook_name')`
3. Debug module initialization in `class-ozzyl-core.php`

### API errors

1. Test API key: `wp eval 'echo Ozzyl_Core::instance()->get_api()->test_connection() ? "OK" : "FAIL";'`
2. Check network connectivity
3. Review API response in debug log

---

## Performance Considerations

### Caching

- License data: 1 hour (WP transient)
- Analytics: 5-10 minutes (if available)
- Store config: 1 hour (if using KV cache)

### Database Queries

- Minimal meta queries (only for order-specific data)
- Batch operations where possible
- Index on `post_id` + `meta_key` for meta queries

### API Calls

- Async where possible (webhooks, background jobs)
- Retry with exponential backoff on 429/5xx
- Timeout after 15 seconds
- Cache results aggressively

---

## References

- **WordPress Plugin Development**: https://developer.wordpress.org/plugins/
- **WooCommerce Hooks**: https://woocommerce.github.io/code-reference/hooks/
- **Ozzyl API Docs**: https://app.ozzyl.com/api-docs
- **Plugin Architecture**: See `.agent/AGENT.md`

---

_Last Updated: 2026-02-24_  
_Architecture Version: 1.0.0_
