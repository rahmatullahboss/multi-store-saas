# Integration Best Practices — Ozzyl SaaS Platform

> Research compiled from Context7 (Stripe, Shopify, WordPress, OpenAPI, TypeScript, Hono docs)
> Last Updated: 2026-02

---

## Table of Contents

1. [WordPress Plugin Development](#1-wordpress-plugin-development)
2. [JavaScript SDK Design](#2-javascript-sdk-design)
3. [Shopify App Development](#3-shopify-app-development)
4. [Webhook Best Practices](#4-webhook-best-practices)
5. [Embeddable JavaScript Widget](#5-embeddable-javascript-widget)
6. [Developer Experience (DX)](#6-developer-experience-dx)

---

## 1. WordPress Plugin Development

### File Structure

```
my-saas-plugin/
├── my-saas-plugin.php          # Main plugin file (plugin header)
├── includes/
│   ├── class-plugin.php        # Core plugin class (singleton)
│   ├── class-api-client.php    # SaaS API HTTP client
│   ├── class-settings.php      # Admin settings page
│   ├── class-wc-gateway.php    # WooCommerce payment gateway
│   └── class-order-sync.php    # Order sync logic
├── admin/
│   ├── views/
│   │   └── settings-page.php   # Settings HTML template
│   └── class-admin.php
├── assets/
│   ├── js/checkout.js          # Frontend checkout JS
│   └── css/checkout.css
├── languages/
│   └── my-saas-plugin.pot
└── readme.txt
```

### Main Plugin File (Entry Point)

```php
<?php
/**
 * Plugin Name:       MySaaS for WooCommerce
 * Plugin URI:        https://mysaas.com/wordpress
 * Description:       Integrates MySaaS payment/commerce API with WooCommerce.
 * Version:           1.0.0
 * Requires at least: 6.0
 * Requires PHP:      8.1
 * Author:            MySaaS Inc.
 * License:           GPL v2 or later
 * Text Domain:       my-saas-plugin
 * WC requires at least: 7.0
 * WC tested up to:   8.5
 */

defined( 'ABSPATH' ) || exit; // Prevent direct access

define( 'MYSAAS_VERSION',     '1.0.0' );
define( 'MYSAAS_PLUGIN_FILE', __FILE__ );
define( 'MYSAAS_PLUGIN_DIR',  plugin_dir_path( __FILE__ ) );
define( 'MYSAAS_PLUGIN_URL',  plugin_dir_url( __FILE__ ) );

// Declare HPOS (High Performance Order Storage) compatibility
add_action( 'before_woocommerce_init', function () {
    if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
        \Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
            'custom_order_tables', __FILE__, true
        );
    }
});

// Boot plugin after all plugins are loaded (ensures WooCommerce is ready)
add_action( 'plugins_loaded', function () {
    if ( ! class_exists( 'WooCommerce' ) ) {
        add_action( 'admin_notices', function () {
            echo '<div class="error"><p>MySaaS Plugin requires WooCommerce to be installed and active.</p></div>';
        });
        return;
    }
    require_once MYSAAS_PLUGIN_DIR . 'includes/class-plugin.php';
    MySaaS_Plugin::instance();
});

// Activation / Deactivation hooks (must be registered in main file)
register_activation_hook( __FILE__, [ 'MySaaS_Plugin', 'activate' ] );
register_deactivation_hook( __FILE__, [ 'MySaaS_Plugin', 'deactivate' ] );
```

### Core Plugin Singleton Class

```php
<?php
// includes/class-plugin.php

class MySaaS_Plugin {

    private static ?self $instance = null;

    public static function instance(): self {
        if ( is_null( self::$instance ) ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->init_hooks();
    }

    private function init_hooks(): void {
        // Register WooCommerce payment gateway
        add_filter( 'woocommerce_payment_gateways', [ $this, 'add_gateway' ] );

        // Hook into order lifecycle
        add_action( 'woocommerce_order_status_completed', [ $this, 'sync_order_to_saas' ] );
        add_action( 'woocommerce_order_status_refunded',  [ $this, 'handle_refund' ] );

        // Admin settings
        add_action( 'admin_menu', [ $this, 'add_admin_menu' ] );
        add_action( 'admin_init', [ $this, 'register_settings' ] );

        // Enqueue scripts on checkout
        add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_checkout_scripts' ] );

        // REST API endpoint for webhook reception
        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
    }

    public function add_gateway( array $gateways ): array {
        require_once MYSAAS_PLUGIN_DIR . 'includes/class-wc-gateway.php';
        $gateways[] = 'MySaaS_WC_Gateway';
        return $gateways;
    }

    public function sync_order_to_saas( int $order_id ): void {
        require_once MYSAAS_PLUGIN_DIR . 'includes/class-order-sync.php';
        ( new MySaaS_Order_Sync() )->sync( $order_id );
    }

    public function register_rest_routes(): void {
        register_rest_route( 'mysaas/v1', '/webhook', [
            'methods'             => 'POST',
            'callback'            => [ $this, 'handle_webhook' ],
            'permission_callback' => '__return_true', // Auth via HMAC, not WP auth
        ]);
    }

    public function handle_webhook( WP_REST_Request $request ): WP_REST_Response {
        $signature = $request->get_header( 'X-MySaaS-Signature' );
        $body      = $request->get_body();
        $secret    = get_option( 'mysaas_webhook_secret', '' );

        $expected = 'sha256=' . hash_hmac( 'sha256', $body, $secret );

        if ( ! hash_equals( $expected, $signature ) ) {
            return new WP_REST_Response( [ 'error' => 'Invalid signature' ], 401 );
        }

        $payload = json_decode( $body, true );
        do_action( 'mysaas_webhook_received', $payload['event'], $payload );

        return new WP_REST_Response( [ 'received' => true ], 200 );
    }

    public function enqueue_checkout_scripts(): void {
        if ( ! is_checkout() ) return;
        wp_enqueue_script(
            'mysaas-checkout',
            MYSAAS_PLUGIN_URL . 'assets/js/checkout.js',
            [ 'jquery' ],
            MYSAAS_VERSION,
            true  // Load in footer
        );
        wp_localize_script( 'mysaas-checkout', 'MySaaSCheckout', [
            'ajaxUrl'    => admin_url( 'admin-ajax.php' ),
            'publicKey'  => get_option( 'mysaas_public_key' ),
            'nonce'      => wp_create_nonce( 'mysaas-checkout-nonce' ),
        ]);
    }

    public static function activate( bool $network_wide ): void {
        // Create custom DB table for sync log
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        $table = $wpdb->prefix . 'mysaas_sync_log';
        $sql = "CREATE TABLE IF NOT EXISTS $table (
            id BIGINT(20) NOT NULL AUTO_INCREMENT,
            order_id BIGINT(20) NOT NULL,
            event VARCHAR(100) NOT NULL,
            status VARCHAR(20) DEFAULT 'pending',
            attempts INT DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            INDEX idx_order_id (order_id)
        ) $charset_collate;";
        require_once ABSPATH . 'wp-admin/includes/upgrade.php';
        dbDelta( $sql );
        update_option( 'mysaas_db_version', MYSAAS_VERSION );
    }

    public static function deactivate(): void {
        wp_clear_scheduled_hook( 'mysaas_retry_failed_syncs' );
    }
}
```

### WooCommerce Payment Gateway

```php
<?php
// includes/class-wc-gateway.php

class MySaaS_WC_Gateway extends WC_Payment_Gateway {

    public function __construct() {
        $this->id                 = 'mysaas';
        $this->icon               = MYSAAS_PLUGIN_URL . 'assets/images/logo.svg';
        $this->has_fields         = true;          // Show custom fields on checkout
        $this->method_title       = 'MySaaS Pay';
        $this->method_description = 'Accept payments via MySaaS';
        $this->supports           = [ 'products', 'refunds' ];

        $this->init_form_fields();
        $this->init_settings();

        $this->title       = $this->get_option( 'title' );
        $this->description = $this->get_option( 'description' );
        $this->api_key     = $this->get_option( 'api_key' );

        add_action( 'woocommerce_update_options_payment_gateways_' . $this->id,
                    [ $this, 'process_admin_options' ] );
    }

    public function init_form_fields(): void {
        $this->form_fields = [
            'enabled'     => [ 'title' => 'Enable/Disable', 'type' => 'checkbox', 'label' => 'Enable MySaaS Pay', 'default' => 'yes' ],
            'title'       => [ 'title' => 'Title', 'type' => 'text', 'default' => 'MySaaS Pay' ],
            'description' => [ 'title' => 'Description', 'type' => 'textarea', 'default' => 'Pay securely via MySaaS.' ],
            'api_key'     => [ 'title' => 'API Key', 'type' => 'password', 'description' => 'Your MySaaS secret API key.' ],
        ];
    }

    public function payment_fields(): void {
        // Render hosted fields / token field
        echo '<div id="mysaas-card-element"></div>';
        echo '<input type="hidden" id="mysaas_token" name="mysaas_token" />';
    }

    public function process_payment( int $order_id ): array {
        $order = wc_get_order( $order_id );
        $token = sanitize_text_field( $_POST['mysaas_token'] ?? '' );

        if ( empty( $token ) ) {
            wc_add_notice( 'Payment token missing.', 'error' );
            return [ 'result' => 'failure' ];
        }

        $api    = new MySaaS_API_Client( $this->api_key );
        $result = $api->charge([
            'token'    => $token,
            'amount'   => (int) round( $order->get_total() * 100 ),
            'currency' => strtolower( get_woocommerce_currency() ),
            'metadata' => [ 'order_id' => $order_id, 'site' => get_site_url() ],
        ]);

        if ( is_wp_error( $result ) ) {
            wc_add_notice( $result->get_error_message(), 'error' );
            return [ 'result' => 'failure' ];
        }

        $order->payment_complete( $result['charge_id'] );
        $order->add_order_note( 'MySaaS charge ID: ' . $result['charge_id'] );
        WC()->cart->empty_cart();

        return [
            'result'   => 'success',
            'redirect' => $this->get_return_url( $order ),
        ];
    }

    public function process_refund( $order_id, $amount = null, $reason = '' ): bool|WP_Error {
        $order     = wc_get_order( $order_id );
        $charge_id = $order->get_transaction_id();
        $api       = new MySaaS_API_Client( $this->api_key );

        $result = $api->refund([
            'charge_id' => $charge_id,
            'amount'    => (int) round( $amount * 100 ),
            'reason'    => $reason,
        ]);

        if ( is_wp_error( $result ) ) return $result;

        $order->add_order_note( 'Refunded via MySaaS: ' . $result['refund_id'] );
        return true;
    }
}
```

### Key WordPress Hooks Reference

| Hook | Type | When to Use |
|------|------|-------------|
| `plugins_loaded` | Action | Boot plugin, check dependencies |
| `init` | Action | Register post types, taxonomies |
| `admin_menu` | Action | Add settings pages |
| `woocommerce_payment_gateways` | Filter | Register payment gateway class |
| `woocommerce_order_status_completed` | Action | Sync completed order to SaaS |
| `rest_api_init` | Action | Register custom REST endpoints |
| `wp_enqueue_scripts` | Action | Load frontend JS/CSS |
| `register_activation_hook` | Function | DB migrations, defaults on install |

---

## 2. JavaScript SDK Design

### npm Package Structure

```
@ozzyl/sdk/
├── src/
│   ├── index.ts            # Main entry (re-exports everything)
│   ├── client.ts           # OzzylClient class
│   ├── resources/
│   │   ├── products.ts     # Products resource
│   │   ├── orders.ts       # Orders resource
│   │   └── payments.ts     # Payments resource
│   ├── types/
│   │   ├── index.ts        # All public types
│   │   └── responses.ts    # API response shapes
│   └── utils/
│       ├── http.ts         # Fetch wrapper with retry
│       └── errors.ts       # Custom error classes
├── dist/
│   ├── esm/                # ES Module build
│   │   ├── index.js
│   │   └── index.d.ts
│   └── cjs/                # CommonJS build
│       ├── index.cjs
│       └── index.d.cts
├── package.json
├── tsconfig.json
└── tsup.config.ts          # Build tool
```

### package.json — Dual CJS/ESM with Tree-shaking

```json
{
  "name": "@ozzyl/sdk",
  "version": "1.0.0",
  "description": "Official Ozzyl JavaScript/TypeScript SDK",
  "license": "MIT",
  "type": "module",
  "sideEffects": false,
  "exports": {
    ".": {
      "types":   "./dist/esm/index.d.ts",
      "import":  "./dist/esm/index.js",
      "require": "./dist/cjs/index.cjs"
    },
    "./pure": {
      "types":   "./dist/esm/pure.d.ts",
      "import":  "./dist/esm/pure.js",
      "require": "./dist/cjs/pure.cjs"
    }
  },
  "main":   "./dist/cjs/index.cjs",
  "module": "./dist/esm/index.js",
  "types":  "./dist/esm/index.d.ts",
  "files":  ["dist", "README.md"],
  "scripts": {
    "build":     "tsup",
    "typecheck": "tsc --noEmit",
    "test":      "vitest run"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.4.0",
    "vitest": "^1.0.0"
  }
}
```

### tsup.config.ts — Zero-config Dual Build

```typescript
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    pure:  'src/pure.ts',   // Deferred-load entry (like @stripe/stripe-js/pure)
  },
  format:    ['esm', 'cjs'],
  dts:       true,          // Generate .d.ts declaration files
  splitting: true,          // Enable code splitting for tree-shaking
  sourcemap: true,
  clean:     true,
  treeshake: true,
  minify:    false,         // Let consumer's bundler minify
});
```

### Main Client Class

```typescript
// src/client.ts
import { ProductsResource } from './resources/products.js';
import { OrdersResource }   from './resources/orders.js';
import { OzzylAPIError }    from './utils/errors.js';

export interface OzzylClientOptions {
  apiKey:      string;
  baseUrl?:    string;   // Override for self-hosted
  timeout?:    number;   // ms, default 30000
  maxRetries?: number;   // default 2
  store?:      string;   // store slug for multi-tenant
}

export class OzzylClient {
  readonly products: ProductsResource;
  readonly orders:   OrdersResource;
  private readonly opts: Required<OzzylClientOptions>;

  constructor(options: OzzylClientOptions) {
    if (!options.apiKey) throw new Error('Ozzyl: apiKey is required');
    this.opts = {
      apiKey:     options.apiKey,
      baseUrl:    options.baseUrl    ?? 'https://api.ozzyl.com/v1',
      timeout:    options.timeout    ?? 30_000,
      maxRetries: options.maxRetries ?? 2,
      store:      options.store      ?? '',
    };
    const req = this._request.bind(this);
    this.products = new ProductsResource(req);
    this.orders   = new OrdersResource(req);
  }

  async _request<T>(
    method: string,
    path: string,
    body?: unknown,
    idempotencyKey?: string,
  ): Promise<T> {
    const url = `${this.opts.baseUrl}${path}`;
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${this.opts.apiKey}`,
      'Content-Type':  'application/json',
      'X-Ozzyl-Store': this.opts.store,
      'X-SDK-Version': '1.0.0',
    };
    if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;

    let lastError!: Error;

    for (let attempt = 0; attempt <= this.opts.maxRetries; attempt++) {
      if (attempt > 0) {
        // Exponential backoff: 100ms → 200ms → 400ms
        await new Promise(r => setTimeout(r, 100 * 2 ** (attempt - 1)));
      }
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), this.opts.timeout);
      try {
        const res = await fetch(url, {
          method, headers,
          body:   body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(tid);
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new OzzylAPIError(res.status, e?.message ?? 'API Error', e);
        }
        return await res.json() as T;
      } catch (err) {
        clearTimeout(tid);
        lastError = err as Error;
        // Don't retry 4xx (except 429 rate limit)
        if (err instanceof OzzylAPIError && err.status < 500 && err.status !== 429) throw err;
      }
    }
    throw lastError;
  }
}
```

### Resource Pattern (Products)

```typescript
// src/resources/products.ts
import type { Product, ListResponse, CreateProductInput } from '../types/index.js';

type RequestFn = <T>(method: string, path: string, body?: unknown, idempotencyKey?: string) => Promise<T>;

export class ProductsResource {
  constructor(private readonly request: RequestFn) {}

  list(params?: { page?: number; limit?: number; search?: string }) {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return this.request<ListResponse<Product>>('GET', `/products${qs ? '?' + qs : ''}`);
  }

  get(id: string)                            { return this.request<Product>('GET', `/products/${id}`); }
  create(input: CreateProductInput, ik?: string) { return this.request<Product>('POST', '/products', input, ik); }
  update(id: string, input: Partial<CreateProductInput>) { return this.request<Product>('PATCH', `/products/${id}`, input); }
  delete(id: string)                         { return this.request<{ deleted: boolean }>('DELETE', `/products/${id}`); }
}
```

### Custom Error Classes

```typescript
// src/utils/errors.ts
export class OzzylError extends Error {
  constructor(message: string) { super(message); this.name = 'OzzylError'; }
}

export class OzzylAPIError extends OzzylError {
  constructor(
    public readonly status: number,
    message: string,
    public readonly body: unknown = {},
  ) {
    super(message);
    this.name = 'OzzylAPIError';
  }
  get isRateLimited()  { return this.status === 429; }
  get isUnauthorized() { return this.status === 401; }
  get isNotFound()     { return this.status === 404; }
  get isServerError()  { return this.status >= 500; }
}
```

### SDK Usage Examples

```typescript
// ESM / Node.js / Remix / Next.js
import { OzzylClient } from '@ozzyl/sdk';

const ozzyl = new OzzylClient({ apiKey: process.env.OZZYL_SECRET_KEY!, store: 'my-store' });
const products = await ozzyl.products.list({ limit: 20 });

// Idempotent create (safe to retry on network failure)
const order = await ozzyl.orders.create(
  { items: [{ productId: 'prod_123', qty: 1 }] },
  `order-${userId}-${cartHash}`  // Unique idempotency key
);

// CommonJS (older Node / WordPress-bundled scripts)
const { OzzylClient } = require('@ozzyl/sdk');

// Deferred loading (no side effects on import, load SDK lazily)
import { OzzylClient } from '@ozzyl/sdk/pure';
```

---

## 3. Shopify App Development

### App Types Overview

| Type | Use Case | Auth Method |
|------|----------|-------------|
| **Embedded App** | Lives inside Shopify Admin iframe | App Bridge + Token Exchange |
| **Public App** | Listed on Shopify App Store | OAuth 2.0 |
| **Custom App** | Single merchant, private | Admin API token |
| **Theme App Extension** | Adds UI to storefront | No auth needed |

### OAuth Flow (Authorization Code Grant)

```
Merchant clicks "Install" in Shopify App Store
         │
         ▼
1. Shopify → GET https://your-app.com/auth?shop=merchant.myshopify.com&hmac=...&timestamp=...
         │
         ▼
2. Your App verifies HMAC, then redirects merchant to:
   https://merchant.myshopify.com/admin/oauth/authorize
   ?client_id=YOUR_API_KEY
   &scope=read_products,write_orders
   &redirect_uri=https://your-app.com/auth/callback
   &state=RANDOM_NONCE   ← store in session to prevent CSRF
         │
         ▼
3. Merchant approves → Shopify redirects to:
   https://your-app.com/auth/callback?code=AUTH_CODE&shop=...&hmac=...&state=...
         │
         ▼
4. Verify HMAC + state nonce, then POST to exchange code for token:
   POST https://merchant.myshopify.com/admin/oauth/access_token
   { client_id, client_secret, code }
         │
         ▼
5. Store access_token securely (D1 / encrypted KV), register webhooks
```

### OAuth Implementation (Hono + Cloudflare Workers)

```typescript
// server/shopify-oauth.ts
import { Hono } from 'hono';
import { env } from 'hono/adapter';
import crypto from 'node:crypto';

const shopify = new Hono<{ Bindings: { DB: D1Database; KV: KVNamespace } }>();

// Step 1: Begin OAuth
shopify.get('/auth', async (c) => {
  const { SHOPIFY_API_KEY } = env(c);
  const shop  = c.req.query('shop');
  const hmac  = c.req.query('hmac');

  if (!shop || !isValidShopDomain(shop)) {
    return c.text('Invalid shop parameter', 400);
  }

  // Verify Shopify HMAC on initial request
  if (!verifyShopifyHmac(c.req.raw, env(c).SHOPIFY_API_SECRET)) {
    return c.text('HMAC validation failed', 401);
  }

  const state = crypto.randomBytes(16).toString('hex');
  // Store state in KV for CSRF protection (TTL: 5 min)
  await env(c).KV.put(`oauth:state:${state}`, shop, { expirationTtl: 300 });

  const scopes = 'read_products,write_orders,read_customers';
  const redirectUri = `https://your-app.com/auth/callback`;
  const installUrl =
    `https://${shop}/admin/oauth/authorize` +
    `?client_id=${SHOPIFY_API_KEY}` +
    `&scope=${scopes}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&state=${state}`;

  return c.redirect(installUrl);
});

// Step 2: OAuth Callback
shopify.get('/auth/callback', async (c) => {
  const { SHOPIFY_API_KEY, SHOPIFY_API_SECRET } = env(c);
  const { code, shop, state, hmac } = c.req.query();

  // Verify CSRF state
  const storedShop = await env(c).KV.get(`oauth:state:${state}`);
  if (!storedShop || storedShop !== shop) {
    return c.text('Invalid state parameter', 403);
  }
  await env(c).KV.delete(`oauth:state:${state}`);

  // Verify HMAC
  if (!verifyShopifyHmac(c.req.raw, SHOPIFY_API_SECRET)) {
    return c.text('HMAC validation failed', 401);
  }

  // Exchange code for access token
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: SHOPIFY_API_KEY, client_secret: SHOPIFY_API_SECRET, code }),
  });
  const { access_token, scope } = await tokenRes.json() as { access_token: string; scope: string };

  // Store token in D1 (encrypted in production)
  const db = c.env.DB;
  await db.prepare(
    `INSERT INTO shopify_installs (shop, access_token, scope, installed_at)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP)
     ON CONFLICT(shop) DO UPDATE SET access_token=excluded.access_token, scope=excluded.scope`
  ).bind(shop, access_token, scope).run();

  // Register webhooks
  await registerWebhooks(shop, access_token);

  return c.redirect(`https://${shop}/admin/apps/your-app`);
});

// HMAC Verification utility
function verifyShopifyHmac(request: Request, secret: string): boolean {
  const url    = new URL(request.url);
  const params = new URLSearchParams(url.search);
  const hmac   = params.get('hmac') ?? '';
  params.delete('hmac');

  // Sort params and build message
  const message = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

  const digest = crypto.createHmac('sha256', secret).update(message).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

function isValidShopDomain(shop: string): boolean {
  return /^[a-zA-Z0-9][a-zA-Z0-9\-]*\.myshopify\.com$/.test(shop);
}
```

### Token Exchange (Modern Embedded App — No Redirect)

```typescript
// For embedded apps using App Bridge — no full-page redirect needed
// Frontend: Get session token from App Bridge
import createApp from '@shopify/app-bridge';
import { getSessionToken } from '@shopify/app-bridge/utilities';

const app = createApp({
  apiKey: 'YOUR_API_KEY',
  host:   new URLSearchParams(location.search).get('host')!,
});

// App Bridge automatically injects Bearer token into fetch headers
const response = await fetch('/api/products', {
  headers: { Authorization: `Bearer ${await getSessionToken(app)}` },
});

// Backend: Exchange session token for offline access token (one-time)
// POST https://{shop}.myshopify.com/admin/oauth/access_token
// {
//   client_id, client_secret,
//   grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
//   subject_token: SESSION_TOKEN,
//   subject_token_type: "urn:ietf:params:oauth:token-type:id_token"
// }
```

### Webhook Registration

```typescript
// Register webhooks after OAuth
async function registerWebhooks(shop: string, accessToken: string) {
  const webhooks = [
    { topic: 'orders/create',   address: 'https://your-app.com/webhooks/orders/create' },
    { topic: 'orders/updated',  address: 'https://your-app.com/webhooks/orders/updated' },
    { topic: 'app/uninstalled', address: 'https://your-app.com/webhooks/app/uninstalled' },
  ];

  for (const wh of webhooks) {
    await fetch(`https://${shop}/admin/api/2024-01/webhooks.json`, {
      method:  'POST',
      headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' },
      body:    JSON.stringify({ webhook: { topic: wh.topic, address: wh.address, format: 'json' } }),
    });
  }
}
```

### App Bridge (Embedded UI)

```typescript
// Shopify Remix App — shopify.server.ts
import { shopifyApp, DeliveryMethod } from '@shopify/shopify-app-remix/server';

const shopify = shopifyApp({
  apiKey:       process.env.SHOPIFY_API_KEY!,
  apiSecretKey: process.env.SHOPIFY_API_SECRET!,
  scopes:       ['read_products', 'write_orders'],
  appUrl:       process.env.SHOPIFY_APP_URL!,
  isEmbeddedApp: true,
  future: {
    unstable_newEmbeddedAuthStrategy: true, // Token exchange, no redirect
  },
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl:    '/webhooks/app/uninstalled',
    },
    ORDERS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl:    '/webhooks/orders/create',
    },
  },
  hooks: {
    afterAuth: async ({ session }) => {
      shopify.registerWebhooks({ session });
    },
  },
});

export default shopify;
export const authenticate = shopify.authenticate;
```

---

## 4. Webhook Best Practices

### The Golden Rules

1. **Sign every payload** with HMAC-SHA256 using a shared secret
2. **Verify before processing** — always check signature first, return 200 fast
3. **Use idempotency keys** — webhooks will be retried; never process twice
4. **Return 200 immediately** — do heavy work async (queue / background job)
5. **Reject replays** — check timestamp is within ±5 minutes

### Signing Webhooks (Sender Side — Hono/Cloudflare Worker)

```typescript
// server/webhooks/sender.ts
import { Hono } from 'hono';
import { env } from 'hono/adapter';

async function signPayload(payload: string, secret: string): Promise<string> {
  // Use Web Crypto API (works on Cloudflare Workers edge)
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex   = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return `sha256=${hashHex}`;
}

export async function dispatchWebhook(
  endpoint:       string,
  event:          string,
  payload:        unknown,
  secret:         string,
  idempotencyKey: string,
): Promise<void> {
  const body      = JSON.stringify({ event, data: payload, timestamp: Date.now() });
  const signature = await signPayload(body, secret);

  const response = await fetch(endpoint, {
    method:  'POST',
    headers: {
      'Content-Type':        'application/json',
      'X-Ozzyl-Signature':   signature,
      'X-Ozzyl-Event':       event,
      'X-Ozzyl-Timestamp':   String(Date.now()),
      'X-Ozzyl-Webhook-Id':  idempotencyKey,   // Unique per event occurrence
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Webhook delivery failed: ${response.status}`);
  }
}
```

### Verifying Webhooks (Receiver Side)

```typescript
// Your customer's backend (or your own internal endpoint)
import { Hono } from 'hono';

const app = new Hono();

async function verifySignature(
  body:      string,
  signature: string,
  secret:    string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const expected    = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
  const expectedHex = 'sha256=' + Array.from(new Uint8Array(expected))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  // Timing-safe comparison to prevent timing attacks
  if (expectedHex.length !== signature.length) return false;
  const a = new TextEncoder().encode(expectedHex);
  const b = new TextEncoder().encode(signature);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

app.post('/webhooks/ozzyl', async (c) => {
  const body      = await c.req.text();       // ⚠️ Raw body BEFORE any parsing
  const signature = c.req.header('X-Ozzyl-Signature') ?? '';
  const timestamp = Number(c.req.header('X-Ozzyl-Timestamp') ?? '0');
  const webhookId = c.req.header('X-Ozzyl-Webhook-Id') ?? '';

  // 1. Reject stale webhooks (replay attack prevention, ±5 min window)
  if (Math.abs(Date.now() - timestamp) > 5 * 60 * 1000) {
    return c.text('Timestamp too old', 400);
  }

  // 2. Verify HMAC signature
  const secret = process.env.OZZYL_WEBHOOK_SECRET!;
  if (!(await verifySignature(body, signature, secret))) {
    return c.text('Invalid signature', 401);
  }

  // 3. Check idempotency — skip if already processed
  const alreadyProcessed = await c.env.KV.get(`webhook:processed:${webhookId}`);
  if (alreadyProcessed) {
    return c.json({ received: true, skipped: true }); // 200 OK — idempotent
  }

  // 4. Mark as processed immediately (before async work)
  await c.env.KV.put(`webhook:processed:${webhookId}`, '1', { expirationTtl: 86400 });

  // 5. Parse and dispatch (return 200 fast, process async)
  const payload = JSON.parse(body);
  c.executionCtx.waitUntil(processWebhookEvent(payload));

  return c.json({ received: true });
});

async function processWebhookEvent(payload: { event: string; data: unknown }) {
  switch (payload.event) {
    case 'order.created':   await handleOrderCreated(payload.data);   break;
    case 'order.completed': await handleOrderCompleted(payload.data); break;
    case 'product.updated': await handleProductUpdated(payload.data); break;
    default: console.warn('Unhandled webhook event:', payload.event);
  }
}
```

### Retry Logic with Exponential Backoff (Sender)

```typescript
// Webhook delivery queue with retry (Cloudflare Durable Object or Queue)
interface WebhookJob {
  id:          string;  // Unique webhook ID (idempotency key)
  endpoint:    string;
  event:       string;
  payload:     unknown;
  attempts:    number;
  nextRetryAt: number;  // Unix timestamp ms
}

const MAX_ATTEMPTS   = 5;
const BACKOFF_BASE   = 1000; // 1s
// Retry schedule: 1s → 30s → 10min → 1hr → 6hr

function getNextRetryDelay(attempt: number): number {
  const delays = [1_000, 30_000, 600_000, 3_600_000, 21_600_000];
  return delays[attempt] ?? delays[delays.length - 1];
}

export async function deliverWithRetry(job: WebhookJob, env: Env): Promise<void> {
  try {
    await dispatchWebhook(job.endpoint, job.event, job.payload, env.WEBHOOK_SECRET, job.id);
    // Success — mark delivered in DB
    await env.DB.prepare(`UPDATE webhook_deliveries SET status='delivered', delivered_at=CURRENT_TIMESTAMP WHERE id=?`)
      .bind(job.id).run();
  } catch (error) {
    job.attempts++;
    if (job.attempts >= MAX_ATTEMPTS) {
      // Mark as permanently failed
      await env.DB.prepare(`UPDATE webhook_deliveries SET status='failed', attempts=? WHERE id=?`)
        .bind(job.attempts, job.id).run();
      // Alert via email/Slack
      console.error(`Webhook permanently failed after ${MAX_ATTEMPTS} attempts:`, job.id);
      return;
    }
    // Schedule retry
    job.nextRetryAt = Date.now() + getNextRetryDelay(job.attempts);
    await env.DB.prepare(
      `UPDATE webhook_deliveries SET attempts=?, next_retry_at=?, status='pending' WHERE id=?`
    ).bind(job.attempts, new Date(job.nextRetryAt).toISOString(), job.id).run();
  }
}
```

### Webhook Delivery Schema (D1)

```sql
CREATE TABLE webhook_endpoints (
  id          TEXT PRIMARY KEY,
  store_id    INTEGER NOT NULL,
  url         TEXT NOT NULL,
  secret      TEXT NOT NULL,   -- Encrypted at rest
  events      TEXT NOT NULL,   -- JSON array: ["order.created","product.updated"]
  enabled     INTEGER DEFAULT 1,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE TABLE webhook_deliveries (
  id             TEXT PRIMARY KEY,    -- Idempotency key (UUID)
  endpoint_id    TEXT NOT NULL,
  store_id       INTEGER NOT NULL,
  event          TEXT NOT NULL,
  payload        TEXT NOT NULL,       -- JSON
  status         TEXT DEFAULT 'pending', -- pending | delivered | failed
  attempts       INTEGER DEFAULT 0,
  next_retry_at  DATETIME,
  delivered_at   DATETIME,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (endpoint_id) REFERENCES webhook_endpoints(id) ON DELETE CASCADE
);

CREATE INDEX idx_webhook_deliveries_pending ON webhook_deliveries(status, next_retry_at)
  WHERE status = 'pending';
CREATE INDEX idx_webhook_deliveries_store   ON webhook_deliveries(store_id);
```

---

## 5. Embeddable JavaScript Widget

### How It Works (Intercom/Crisp Pattern)

```
Merchant adds 1 script tag to their website
         │
         ▼
Async loader snippet (< 500 bytes, inline)
  → Creates window.Ozzyl queue stub
  → Injects <script src="https://cdn.ozzyl.com/widget.js"> async
         │
         ▼
widget.js loads (hosted on Cloudflare R2/CDN)
  → Reads window.OzzylConfig (storeId, options)
  → Injects <iframe> or Shadow DOM for isolated UI
  → Processes queued calls
  → Opens WebSocket / SSE for real-time (optional)
```

### Step 1: The Snippet (Goes in Merchant's Site)

This is the critical part — must be tiny, non-blocking, and resilient.

```html
<!-- Ozzyl Widget — paste before </body> -->
<script>
(function(w, d, s, id) {
  // Create stub so merchants can call Ozzyl() before script loads
  w.OzzylConfig = { storeId: 'YOUR_STORE_ID', currency: 'BDT', locale: 'bn' };
  var q = w.Ozzyl = function() { q.queue.push(arguments); };
  q.queue = [];
  q.loaded = false;

  // Inject the main widget script asynchronously (non-blocking)
  var el = d.createElement(s);
  el.async = true;
  el.src   = 'https://cdn.ozzyl.com/widget/v1/widget.js';
  el.id    = id;
  el.crossOrigin = 'anonymous';
  var first = d.getElementsByTagName(s)[0];
  first.parentNode.insertBefore(el, first);
})(window, document, 'script', 'ozzyl-widget-script');

// Merchants can call these even before script loads:
Ozzyl('init');
Ozzyl('track', 'page_view', { url: location.href });
</script>
```

### Step 2: The Widget Script (widget.js — Hosted on CDN)

```typescript
// src/widget/index.ts  — compiled to widget.js
(function() {
  'use strict';

  const CONFIG = window.OzzylConfig ?? {};
  const STORE_ID = CONFIG.storeId;

  if (!STORE_ID) {
    console.warn('[Ozzyl] storeId is required in OzzylConfig');
    return;
  }

  // ─── Shadow DOM for full CSS isolation ──────────────────────────────────
  function createWidget(): ShadowRoot {
    const host = document.createElement('div');
    host.id    = 'ozzyl-widget-host';
    Object.assign(host.style, {
      position: 'fixed',
      bottom:   '20px',
      right:    '20px',
      zIndex:   '2147483647',  // Max z-index
      border:   'none',
    });
    document.body.appendChild(host);

    // Shadow DOM prevents merchant CSS from bleeding in
    const shadow = host.attachShadow({ mode: 'closed' });

    // Inject widget HTML + scoped CSS
    shadow.innerHTML = `
      <style>
        :host { font-family: system-ui, sans-serif; }
        .ozzyl-btn {
          width: 56px; height: 56px; border-radius: 50%;
          background: var(--ozzyl-primary, #4F46E5);
          border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,.2);
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s;
        }
        .ozzyl-btn:hover { transform: scale(1.1); }
        .ozzyl-panel {
          position: absolute; bottom: 70px; right: 0;
          width: 360px; height: 500px; border-radius: 12px;
          background: #fff; box-shadow: 0 8px 32px rgba(0,0,0,.15);
          overflow: hidden; display: none;
        }
        .ozzyl-panel.open { display: block; }
        .ozzyl-frame { width: 100%; height: 100%; border: none; }
      </style>
      <div class="ozzyl-panel" id="panel">
        <iframe class="ozzyl-frame" id="frame"
          src="https://widget.ozzyl.com/panel?store=${STORE_ID}&origin=${encodeURIComponent(location.origin)}"
          allow="payment; camera"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups">
        </iframe>
      </div>
      <button class="ozzyl-btn" id="toggle" aria-label="Open cart">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </button>
    `;

    // Toggle panel open/close
    const toggle = shadow.getElementById('toggle')!;
    const panel  = shadow.getElementById('panel')!;
    toggle.addEventListener('click', () => panel.classList.toggle('open'));

    return shadow;
  }

  // ─── Cross-frame messaging (widget iframe ↔ parent page) ───────────────
  window.addEventListener('message', (event) => {
    // Security: only accept messages from our widget domain
    if (event.origin !== 'https://widget.ozzyl.com') return;

    const { type, data } = event.data ?? {};
    switch (type) {
      case 'OZZYL_CLOSE':      document.getElementById('ozzyl-widget-host')?.remove(); break;
      case 'OZZYL_CART_COUNT': updateBadge(data.count); break;
      case 'OZZYL_NAVIGATE':   window.location.href = data.url; break;
    }
  });

  function updateBadge(count: number) {
    // Update cart badge in parent page if needed
    const badgeEl = document.querySelector('[data-ozzyl-cart-count]');
    if (badgeEl) badgeEl.textContent = String(count);
  }

  // ─── Process queued calls from snippet ────────────────────────────────
  const stub = window.Ozzyl as any;
  const queue: any[][] = stub?.queue ?? [];

  // Replace stub with real implementation
  (window as any).Ozzyl = function(action: string, ...args: any[]) {
    switch (action) {
      case 'init':       createWidget();                             break;
      case 'track':      trackEvent(args[0], args[1]);              break;
      case 'identify':   identifyUser(args[0]);                     break;
      case 'addToCart':  postToFrame({ type: 'ADD_TO_CART', data: args[0] }); break;
    }
  };

  // Replay queued calls
  queue.forEach(args => (window as any).Ozzyl(...args));

  function trackEvent(name: string, props?: Record<string, unknown>) {
    navigator.sendBeacon('https://api.ozzyl.com/v1/analytics/events', JSON.stringify({
      store: STORE_ID, event: name, props, url: location.href, ts: Date.now()
    }));
  }

  function identifyUser(user: { id: string; email?: string }) {
    postToFrame({ type: 'IDENTIFY_USER', data: user });
  }

  function postToFrame(msg: unknown) {
    const frame = document.querySelector('#ozzyl-widget-host')
      ?.shadowRoot?.getElementById('frame') as HTMLIFrameElement | null;
    frame?.contentWindow?.postMessage(msg, 'https://widget.ozzyl.com');
  }

  // Auto-init if storeId is set
  if (STORE_ID) (window as any).Ozzyl('init');

})();
```

### Step 3: Widget Panel (Hosted in iframe)

```typescript
// apps/widget-panel/app/routes/_index.tsx (Remix, served from widget.ozzyl.com)
export async function loader({ request }: LoaderFunctionArgs) {
  const url     = new URL(request.url);
  const storeId = url.searchParams.get('store');
  const origin  = url.searchParams.get('origin');

  if (!storeId) throw new Response('Missing store', { status: 400 });

  // Verify origin is allowed for this store
  const allowed = await isAllowedOrigin(storeId, origin ?? '');
  if (!allowed) throw new Response('Origin not allowed', { status: 403 });

  const store = await getStoreConfig(storeId);
  return json({ store });
}
```

### Step 4: Security Headers for Widget CDN

```typescript
// Cloudflare Worker for cdn.ozzyl.com/widget
export default {
  fetch(request: Request): Response {
    const response = await fetch(request);
    const headers  = new Headers(response.headers);

    // Allow embedding on any origin (widget use case)
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400');
    headers.set('X-Content-Type-Options', 'nosniff');

    // Widget iframe needs these CSP relaxations
    headers.set('Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
    );

    return new Response(response.body, { status: response.status, headers });
  }
};
```

### Merchant API (Tracking)

```javascript
// Merchants call these after snippet loads:
Ozzyl('track', 'product_viewed',   { productId: 'prod_123', name: 'T-Shirt' });
Ozzyl('track', 'add_to_cart',      { productId: 'prod_123', price: 500, currency: 'BDT' });
Ozzyl('identify', { id: 'user_456', email: 'customer@example.com', name: 'Rahim' });
Ozzyl('addToCart', { productId: 'prod_123', qty: 1 });
```

---

## 6. Developer Experience (DX)

### OpenAPI 3.1 Specification Structure

```yaml
# openapi.yaml — Ozzyl Public API
openapi: "3.1.0"

info:
  title:       Ozzyl Commerce API
  version:     "1.0.0"
  description: |
    The Ozzyl API lets you build integrations with our multi-tenant
    commerce platform. All endpoints require Bearer token authentication.

    ## Authentication
    Include your API key as a Bearer token:
    ```
    Authorization: Bearer oz_live_xxxxxxxxxxxx
    ```

    ## Rate Limits
    - 1000 requests/minute per store
    - 429 response when exceeded, with `Retry-After` header

    ## Idempotency
    For POST requests, include `Idempotency-Key: <unique-key>` header
    to safely retry requests without duplicate side-effects.
  contact:
    name:  Ozzyl Developer Support
    url:   https://developers.ozzyl.com
    email: developers@ozzyl.com
  license:
    name: Apache 2.0
    url:  https://www.apache.org/licenses/LICENSE-2.0

servers:
  - url:         https://api.ozzyl.com/v1
    description: Production
  - url:         https://sandbox.api.ozzyl.com/v1
    description: Sandbox (no real charges)

security:
  - BearerAuth: []

tags:
  - name:        Products
    description: Manage your store's product catalog
  - name:        Orders
    description: Order lifecycle management
  - name:        Webhooks
    description: Manage webhook endpoints

paths:
  /products:
    get:
      operationId: listProducts
      summary:     List products
      tags:        [Products]
      parameters:
        - $ref: '#/components/parameters/PageParam'
        - $ref: '#/components/parameters/LimitParam'
        - name:        search
          in:          query
          description: Full-text search across name and description
          schema:      { type: string }
        - name:        status
          in:          query
          schema:      { type: string, enum: [active, draft, archived] }
      responses:
        "200":
          description: Paginated list of products
          content:
            application/json:
              schema:  { $ref: '#/components/schemas/ProductList' }
              example:
                data:       [{ id: "prod_123", name: "T-Shirt", price: 500 }]
                pagination: { page: 1, limit: 20, total: 100 }
        "401": { $ref: '#/components/responses/Unauthorized' }
        "429": { $ref: '#/components/responses/RateLimited' }

    post:
      operationId: createProduct
      summary:     Create a product
      tags:        [Products]
      parameters:
        - name:        Idempotency-Key
          in:          header
          required:    false
          description: Unique key to safely retry without duplicates
          schema:      { type: string, format: uuid }
      requestBody:
        required: true
        content:
          application/json:
            schema:  { $ref: '#/components/schemas/CreateProductInput' }
            example:
              name:        "Eid Special T-Shirt"
              price:       850
              currency:    "BDT"
              description: "Limited edition Eid collection"
              inventory:   100
      responses:
        "201":
          description: Product created
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Product' }
        "400": { $ref: '#/components/responses/ValidationError' }
        "401": { $ref: '#/components/responses/Unauthorized' }

  /products/{id}:
    get:
      operationId: getProduct
      summary:     Get a product
      tags:        [Products]
      parameters:
        - $ref: '#/components/parameters/IdParam'
      responses:
        "200":
          description: Product details
          content:
            application/json:
              schema: { $ref: '#/components/schemas/Product' }
        "404": { $ref: '#/components/responses/NotFound' }

components:
  securitySchemes:
    BearerAuth:
      type:         http
      scheme:       bearer
      bearerFormat: API Key
      description:  "Get your API key from: https://app.ozzyl.com/settings/api"

  parameters:
    IdParam:
      name:        id
      in:          path
      required:    true
      schema:      { type: string, pattern: "^[a-z]+_[a-zA-Z0-9]+$" }
    PageParam:
      name:        page
      in:          query
      schema:      { type: integer, minimum: 1, default: 1 }
    LimitParam:
      name:        limit
      in:          query
      schema:      { type: integer, minimum: 1, maximum: 100, default: 20 }

  schemas:
    Product:
      type:     object
      required: [id, name, price, currency, status, createdAt]
      properties:
        id:          { type: string, example: "prod_abc123" }
        name:        { type: string, example: "Eid Special T-Shirt" }
        price:       { type: integer, description: "Amount in smallest currency unit (paisa)", example: 85000 }
        currency:    { type: string, example: "BDT" }
        status:      { type: string, enum: [active, draft, archived] }
        inventory:   { type: integer, example: 100 }
        description: { type: string }
        images:      { type: array, items: { type: string, format: uri } }
        createdAt:   { type: string, format: date-time }

    CreateProductInput:
      type:     object
      required: [name, price, currency]
      properties:
        name:        { type: string, minLength: 1, maxLength: 255 }
        price:       { type: integer, minimum: 1 }
        currency:    { type: string, default: "BDT" }
        description: { type: string, maxLength: 5000 }
        inventory:   { type: integer, minimum: 0, default: 0 }
        status:      { type: string, enum: [active, draft], default: "draft" }

    ProductList:
      type:     object
      properties:
        data:       { type: array, items: { $ref: '#/components/schemas/Product' } }
        pagination: { $ref: '#/components/schemas/Pagination' }

    Pagination:
      type:     object
      properties:
        page:    { type: integer }
        limit:   { type: integer }
        total:   { type: integer }
        hasNext: { type: boolean }

    Error:
      type:     object
      required: [error, message]
      properties:
        error:   { type: string, example: "validation_error" }
        message: { type: string, example: "name is required" }
        details: { type: array, items: { type: object } }

  responses:
    Unauthorized:
      description: Missing or invalid API key
      content:
        application/json:
          schema:  { $ref: '#/components/schemas/Error' }
          example: { error: "unauthorized", message: "Invalid API key" }
    NotFound:
      description: Resource not found
      content:
        application/json:
          schema:  { $ref: '#/components/schemas/Error' }
          example: { error: "not_found", message: "Product not found" }
    ValidationError:
      description: Request validation failed
      content:
        application/json:
          schema:  { $ref: '#/components/schemas/Error' }
    RateLimited:
      description: Too many requests
      headers:
        Retry-After:
          schema: { type: integer }
          description: Seconds to wait before retrying
      content:
        application/json:
          schema:  { $ref: '#/components/schemas/Error' }
          example: { error: "rate_limited", message: "Too many requests. Retry after 30 seconds." }
```

### SDK Generation from OpenAPI

```bash
# Install openapi-typescript-codegen or @hey-api/openapi-ts (recommended)
npm install -g @hey-api/openapi-ts

# Generate TypeScript SDK from spec
openapi-ts \
  --input  ./openapi.yaml \
  --output ./packages/sdk-generated/src \
  --client fetch

# Or use openapi-generator-cli for multi-language SDKs
# Generates: TypeScript, PHP (WordPress plugin), Python, Ruby (Shopify app)
docker run --rm \
  -v ${PWD}:/local openapitools/openapi-generator-cli generate \
  -i /local/openapi.yaml \
  -g typescript-fetch \
  -o /local/packages/sdk-ts \
  --additional-properties=npmName=@ozzyl/sdk,supportsES6=true

# PHP SDK (for WordPress plugin)
docker run --rm \
  -v ${PWD}:/local openapitools/openapi-generator-cli generate \
  -i /local/openapi.yaml \
  -g php \
  -o /local/packages/sdk-php \
  --additional-properties=packageName=ozzyl-php,invokerPackage=Ozzyl
```

### Serve Interactive Docs (Cloudflare Worker)

```typescript
// Scalar API Reference — modern alternative to Swagger UI
// apps/web/app/routes/api.docs.tsx

export async function loader() {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Ozzyl API Reference</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <script id="api-reference" data-url="/api/openapi.yaml"></script>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

// Serve the spec file
// apps/web/app/routes/api.openapi[.yaml].tsx
export async function loader() {
  const spec = await import('~/openapi.yaml?raw');
  return new Response(spec.default, {
    headers: {
      'Content-Type':                'application/yaml',
      'Access-Control-Allow-Origin': '*',  // Allow SDK generators to fetch it
    }
  });
}
```

### Quick Start Guide Structure (README.md)

```markdown
# Ozzyl API — Quick Start (5 minutes)

## 1. Get Your API Key
1. Sign up at https://app.ozzyl.com
2. Go to Settings → API Keys
3. Click "Create API Key"
4. Copy your key — it starts with `oz_live_` (production) or `oz_test_` (sandbox)

## 2. Install the SDK

npm install @ozzyl/sdk
# or
yarn add @ozzyl/sdk

## 3. Your First API Call

import { OzzylClient } from '@ozzyl/sdk';

const ozzyl = new OzzylClient({
  apiKey: 'oz_test_YOUR_KEY_HERE',
  store:  'your-store-slug',
});

// List your products
const { data: products } = await ozzyl.products.list({ limit: 5 });
console.log(products);

// Create a product
const product = await ozzyl.products.create({
  name:      'My First Product',
  price:     500,  // 500 paisa = 5 BDT
  currency:  'BDT',
  inventory: 10,
});
console.log('Created:', product.id);

## 4. Test Webhooks Locally

# Install the Ozzyl CLI
npm install -g @ozzyl/cli

# Forward webhooks to localhost
ozzyl webhooks listen --forward-to http://localhost:3000/api/webhooks

## 5. Next Steps
- [Full API Reference](https://developers.ozzyl.com/api)
- [WordPress Plugin Guide](https://developers.ozzyl.com/integrations/wordpress)
- [Shopify App Guide](https://developers.ozzyl.com/integrations/shopify)
- [Webhook Events Reference](https://developers.ozzyl.com/webhooks)
```

### DX Checklist

| Category | Best Practice | Priority |
|----------|---------------|----------|
| **Docs** | Interactive API explorer (Scalar/Swagger UI) | 🔴 Must |
| **Docs** | Code examples in every language you support | 🔴 Must |
| **Docs** | Error code reference with fix suggestions | 🔴 Must |
| **SDK** | TypeScript types for all inputs/outputs | 🔴 Must |
| **SDK** | Auto-retry with exponential backoff | 🔴 Must |
| **SDK** | Idempotency key support on mutating ops | 🔴 Must |
| **Auth** | Sandbox/test mode with `oz_test_` prefix | 🔴 Must |
| **DX** | CLI tool for local webhook testing | 🟡 Should |
| **DX** | Postman/Insomnia collection export | 🟡 Should |
| **DX** | SDK changelogs with migration guides | 🟡 Should |
| **DX** | Status page (https://status.ozzyl.com) | 🟡 Should |
| **DX** | API versioning in URL (/v1/, /v2/) | 🟡 Should |
| **DX** | Deprecation notices with 6-month runway | 🟢 Nice |
| **DX** | Generated SDKs for PHP, Ruby, Python | 🟢 Nice |

### API Versioning Strategy

```typescript
// Hono API with versioned routing
import { Hono } from 'hono';

const api = new Hono();

// Mount versioned sub-apps
api.route('/v1', v1Router);
api.route('/v2', v2Router);  // When breaking changes needed

// Version negotiation via Accept header (alternative)
api.use('*', async (c, next) => {
  const version = c.req.header('Accept-Version') ?? 'v1';
  c.set('apiVersion', version);
  await next();
});

// Deprecation headers
api.use('/v1/*', async (c, next) => {
  await next();
  c.res.headers.set('Deprecation', 'true');
  c.res.headers.set('Sunset',      'Sat, 01 Jan 2027 00:00:00 GMT');
  c.res.headers.set('Link',        '<https://api.ozzyl.com/v2>; rel="successor-version"');
});
```

### Error Response Standard

```typescript
// Consistent error shape across all endpoints
interface APIError {
  error:    string;        // Machine-readable code: "validation_error"
  message:  string;        // Human-readable: "name is required"
  details?: ErrorDetail[]; // Field-level errors for validation
  requestId: string;       // For support tickets: "req_abc123"
  docs?:    string;        // Link to relevant docs page
}

interface ErrorDetail {
  field:   string;  // "name"
  code:    string;  // "required"
  message: string;  // "name is required"
}

// Hono error handler
app.onError((err, c) => {
  const requestId = crypto.randomUUID();
  console.error({ requestId, error: err.message, path: c.req.path });

  if (err instanceof OzzylValidationError) {
    return c.json({
      error:     'validation_error',
      message:   'Request validation failed',
      details:   err.details,
      requestId,
      docs:      'https://developers.ozzyl.com/errors#validation_error',
    }, 400);
  }

  return c.json({
    error:     'internal_error',
    message:   'An unexpected error occurred',
    requestId,
    docs:      'https://developers.ozzyl.com/errors#internal_error',
  }, 500);
});
```

---

## Summary: Integration Priority Matrix

| Integration | Effort | Impact | Priority |
|-------------|--------|--------|----------|
| **Webhook system** | Medium | 🔴 Critical | Build first |
| **JS SDK** | Medium | 🔴 Critical | Build with API |
| **OpenAPI spec** | Low | 🔴 Critical | Write alongside API |
| **Embeddable widget** | High | 🟡 High | After core API stable |
| **WordPress plugin** | Medium | 🟡 High | Major distribution channel in BD |
| **Shopify app** | High | 🟡 High | Merchant acquisition channel |
| **PHP SDK (auto-gen)** | Low | 🟢 Medium | Auto-generate from OpenAPI |
| **CLI tool** | Medium | 🟢 Medium | After SDK is stable |

---

*Research sources: Context7 (Stripe SDK, Shopify Dev Docs, WordPress Hooks, Hono, OpenAPI Spec 3.1, TypeScript 5.x)*
*Compiled for Ozzyl — The Shopify of Bangladesh 🇧🇩*
