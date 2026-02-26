# Ozzyl API Platform — Part 4: SDK & Integrations
> Source: API_PLATFORM_MASTER_PLAN.md v6.0 | Sections 9-12

## 9. JavaScript SDK (`@ozzyl/sdk`)

> **Pattern**: Stripe SDK style — chainable, typed, framework-agnostic.

### Package Structure

```
packages/ozzyl-sdk/
├── src/
│   ├── index.ts           # Main entry point
│   ├── client.ts          # Core HTTP client
│   ├── resources/
│   │   ├── analytics.ts
│   │   ├── recommendations.ts
│   │   ├── events.ts
│   │   └── webhooks.ts
│   ├── types.ts           # All TypeScript types
│   └── errors.ts          # Typed error classes
├── package.json
└── tsconfig.json
```

### Core Client (`src/client.ts`)

```typescript
export class OzzylClient {
  private readonly baseUrl: string
  private readonly apiKey: string
  private readonly timeout: number

  constructor(config: { apiKey: string; timeout?: number; baseUrl?: string }) {
    if (!config.apiKey) throw new OzzylError('API key is required')
    this.apiKey = config.apiKey
    this.timeout = config.timeout ?? 30_000
    this.baseUrl = config.baseUrl ?? 'https://api.ozzyl.com/v1'
  }

  async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeout)

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'X-SDK-Version': '1.0.0',
          'X-Idempotency-Key': crypto.randomUUID(),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new OzzylAPIError(res.status, err)
      }

      return res.json() as Promise<T>
    } finally {
      clearTimeout(timer)
    }
  }

  // ✅ btoa/atob cross-platform — works in Node.js 16+ and all browsers
  // Node 16 added globalThis.btoa/atob — but for safety, use Buffer fallback
  static toBase64(str: string): string {
    if (typeof btoa !== 'undefined') return btoa(str)
    return Buffer.from(str).toString('base64')
  }

  static fromBase64(str: string): string {
    if (typeof atob !== 'undefined') return atob(str)
    return Buffer.from(str, 'base64').toString('utf-8')
  }
}
```

### Main Entry (`src/index.ts`)

```typescript
import { OzzylClient } from './client'
import { Analytics } from './resources/analytics'
import { Recommendations } from './resources/recommendations'
import { Events } from './resources/events'

export class Ozzyl {
  public readonly analytics: Analytics
  public readonly recommendations: Recommendations
  public readonly events: Events

  constructor(apiKey: string) {
    const client = new OzzylClient({ apiKey })
    this.analytics = new Analytics(client)
    this.recommendations = new Recommendations(client)
    this.events = new Events(client)
  }
}

// Named export for convenience
export const createOzzyl = (apiKey: string) => new Ozzyl(apiKey)

// Re-export types
export type { OzzylConfig, AnalyticsData, Recommendation, OzzylEvent } from './types'
export { OzzylError, OzzylAPIError } from './errors'
```

### Typed Error Classes (`src/errors.ts`)

```typescript
export class OzzylError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OzzylError'
  }
}

export class OzzylAPIError extends OzzylError {
  public readonly status: number
  public readonly code: string
  public readonly requestId: string

  constructor(status: number, body: Record<string, unknown>) {
    super(body.message as string ?? 'API Error')
    this.name = 'OzzylAPIError'
    this.status = status
    this.code = body.code as string ?? 'UNKNOWN'
    this.requestId = body.requestId as string ?? ''
  }
}

export class OzzylRateLimitError extends OzzylAPIError {
  public readonly retryAfter: number

  constructor(status: number, body: Record<string, unknown>) {
    super(status, body)
    this.name = 'OzzylRateLimitError'
    this.retryAfter = (body.retryAfter as number) ?? 60
  }
}

export class OzzylTimeoutError extends OzzylError {
  constructor() {
    super('Request timed out')
    this.name = 'OzzylTimeoutError'
  }
}c readonly retryAfter: number
  constructor(status: number, body: Record<string, unknown>, retryAfter: number) {
    super(status, body)
    this.name = 'OzzylRateLimitError'
    this.retryAfter = retryAfter
  }
}
```

### Usage Examples

```typescript
// Next.js / Node.js
import { Ozzyl } from '@ozzyl/sdk'

const ozzyl = new Ozzyl(process.env.OZZYL_API_KEY!)

// Get analytics
const stats = await ozzyl.analytics.getSummary({ period: '7d' })
console.log(stats.pageViews, stats.orders, stats.revenue)

// Get AI recommendations
const recs = await ozzyl.recommendations.getForProduct('prod_123', { limit: 5 })

// Track event
await ozzyl.events.track({
  name: 'product_viewed',
  properties: { productId: 'prod_123', price: 1500 }
})
```

### Browser / Vanilla JS (CDN)

```html
<!-- CDN embed -->
<script src="https://cdn.ozzyl.com/sdk/v1/ozzyl.min.js"></script>
<script>
  const ozzyl = new Ozzyl('pk_live_xxxx') // Public key only!

  // Track page view
  ozzyl.events.track({ name: 'page_viewed', properties: { url: location.href } })
</script>
```

---

## 10. Embeddable Widget

> **Pattern**: Async loader snippet (like Google Analytics / Hotjar) — non-blocking, shadow DOM isolated.

### How It Works

```
1. Merchant adds 1-line snippet to any website
2. Loader script fetches widget bundle async (non-blocking)
3. Widget renders inside Shadow DOM (no CSS conflicts)
4. Widget communicates with Ozzyl API using public key (pk_live_*)
```

### Embed Snippet (copy-paste)

```html
<!-- Ozzyl Commerce Widget — add before </body> -->
<script>
(function(w,d,s,o,f,js,fjs){
  w['OzzylWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
  js=d.createElement(s);fjs=d.getElementsByTagName(s)[0];
  js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
// ✅ Always validate store-id on widget init — fail loudly if missing
// In loader.ts: add this guard before initializing
// const storeId = document.currentScript?.getAttribute('data-store-id')
// if (!storeId) { console.error('[Ozzyl Widget] Missing data-store-id attribute.'); return; }
}(window,document,'script','ozw','https://cdn.ozzyl.com/widget/v1/loader.js'));
ozw('init', { apiKey: 'pk_live_YOUR_PUBLIC_KEY', storeId: 'YOUR_STORE_ID' });
ozw('track', 'page_view');
</script>
```

### Loader Script (`packages/widget/src/loader.ts`)

```typescript
// Async loader — tiny (<1KB), loads main bundle lazily
// Pattern: Google Analytics async snippet style

interface OzzylWidgetConfig {
  apiKey: string
  storeId: string
  locale?: string
  features?: ('recommendations' | 'chat' | 'analytics')[]
}

declare global {
  interface Window {
    OzzylWidget: {
      q?: IArguments[]
      (...args: any[]): void
    }
  }
}

(function() {
  const config: OzzylWidgetConfig = window.__OZZYL_CONFIG__ ?? {}

  // Process queued commands
  const queue = window.OzzylWidget?.q ?? []

  // Load main bundle lazily
  async function loadWidget() {
    const { OzzylWidgetCore } = await import('./widget')
    const widget = new OzzylWidgetCore(config)
    widget.init()

    // Replay queued commands
    for (const args of queue) {
      widget.command(args[0], args[1])
    }

    // Replace queue with real handler
    window.OzzylWidget = (cmd: string, data?: unknown) => widget.command(cmd, data)
  }

  // Load after DOM ready (non-blocking)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadWidget)
  } else {
    loadWidget()
  }
})()
```

### Widget Core (`packages/widget/src/widget.ts`)

```typescript
// Shadow DOM isolated widget — no CSS conflicts with host page
// ✅ Guard: prevent duplicate registration crash on double-load (GTM, etc.)
if (!customElements.get('ozzyl-widget')) {
  customElements.define('ozzyl-widget', OzzylWidgetCore)
}

export class OzzylWidgetCore {
  private shadow: ShadowRoot
  private apiKey: string
  private storeId: string

  constructor(config: OzzylWidgetConfig) {
    this.apiKey  = config.apiKey
    this.storeId = config.storeId
  }

  init() {
    // Create isolated Shadow DOM container
    const host = document.createElement('div')
    host.id = 'ozzyl-widget-host'
    document.body.appendChild(host)

    this.shadow = host.attachShadow({ mode: 'closed' })

    // Inject styles (scoped to shadow DOM — won't leak)
    const style = document.createElement('style')
    style.textContent = `/* widget styles here — isolated */`
    this.shadow.appendChild(style)
  }

  command(cmd: string, data?: unknown) {
    switch (cmd) {
      case 'track':
        this.trackEvent(data as string)
        break
      case 'showRecommendations':
        this.renderRecommendations(data as string)
        break
      case 'init':
        // Already initialized
        break
    }
  }

  private async trackEvent(eventName: string) {
    // Use sendBeacon for reliable fire-and-forget tracking
    const payload = JSON.stringify({
      name: eventName,
      storeId: this.storeId,
      url: location.href,
      referrer: document.referrer,
      timestamp: Date.now(),
    })
    navigator.sendBeacon(
      'https://api.ozzyl.com/v1/events',
      new Blob([payload], { type: 'application/json' })
    )
  }

  private async renderRecommendations(productId: string) {
    const res = await fetch(
      `https://api.ozzyl.com/v1/recommendations?productId=${productId}&limit=4`,
      { headers: { 'Authorization': `Bearer ${this.apiKey}` } }
    )
    const { data } = await res.json()
    // Render into shadow DOM...
  }
}
```

### CSP Compatibility

Add to your Content Security Policy:
```
script-src 'self' https://cdn.ozzyl.com;
connect-src 'self' https://api.ozzyl.com;
```

### Public Key vs Secret Key

| Key Type | Format | Use In | Can Access |
|----------|--------|--------|-----------|
| **Public** | `pk_live_*` | Browser/Widget | Read-only public data |
| **Secret** | `oz_live_*` | Server-side only | All scopes per plan |

> ⚠️ **NEVER** put `oz_live_*` secret keys in browser code or widget embeds.

---

## 11. WordPress Plugin



> **Pattern**: WooCommerce extension style — hooks-based, settings page in WP Admin.

### Plugin Structure

```
ozzyl-commerce/
├── ozzyl-commerce.php          # Main plugin file
├── includes/
│   ├── class-ozzyl-api.php     # API client (PHP)
│   ├── class-ozzyl-analytics.php
│   ├── class-ozzyl-recommendations.php
│   └── class-ozzyl-webhooks.php
├── admin/
│   ├── settings-page.php       # WP Admin settings UI
│   └── dashboard-widget.php    # WP Dashboard widget
├── public/
│   ├── js/ozzyl-embed.js       # Frontend JS
│   └── css/ozzyl.css
├── languages/
│   ├── ozzyl-commerce-bn_BD.po # Bangla translation
│   └── ozzyl-commerce-bn_BD.mo
└── readme.txt                  # WordPress.org listing
```

### Main Plugin File

```php
<?php
/**
 * Plugin Name: Ozzyl Commerce
 * Description: Connect your WordPress/WooCommerce site to Ozzyl Commerce Platform
 * Version: 1.0.0
 * Author: Ozzyl
 * Text Domain: ozzyl-commerce
 * WC requires at least: 7.0
 * WC tested up to: 9.0
 */

if (!defined('ABSPATH')) exit;

define('OZZYL_VERSION', '1.0.0');
define('OZZYL_API_BASE', 'https://api.ozzyl.com/v1');

class OzzylCommerce {
  private static $instance = null;

  public static function getInstance(): self {
    if (self::$instance === null) {
      self::$instance = new self();
    }
    return self::$instance;
  }

  private function __construct() {
    add_action('init', [$this, 'init']);
    add_action('wp_enqueue_scripts', [$this, 'enqueueScripts']);
    add_action('admin_menu', [$this, 'addAdminMenu']);

    // WooCommerce hooks
    add_action('woocommerce_order_status_completed', [$this, 'onOrderComplete']);
    add_action('woocommerce_add_to_cart', [$this, 'onAddToCart']);
    add_action('woocommerce_single_product_summary', [$this, 'renderRecommendations'], 35);
  }

  public function onOrderComplete(int $orderId): void {
    $order = wc_get_order($orderId);
    $this->trackEvent('order_completed', [
      'orderId'   => $orderId,
      'total'     => $order->get_total(),
      'currency'  => $order->get_currency(),
      'items'     => count($order->get_items()),
    ]);
  }

  public function renderRecommendations(): void {
    $productId = get_the_ID();
    $apiKey    = get_option('ozzyl_api_key');
    if (!$apiKey) return;

    echo '<div id="ozzyl-recommendations" data-product-id="' . esc_attr($productId) . '"></div>';
  }

  private function trackEvent(string $name, array $props): void {
    $apiKey = get_option('ozzyl_api_key');
    if (!$apiKey) return;

    wp_remote_post(OZZYL_API_BASE . '/events', [
                'timeout' => 15,  // ✅ explicit timeout — prevents WP page hang
                'sslverify' => true,
      'headers' => [
        'Authorization' => 'Bearer ' . $apiKey,
        'Content-Type'  => 'application/json',
      ],
      'body'    => json_encode(['name' => $name, 'properties' => $props]),
      'timeout' => 5,
      'blocking' => false, // Fire and forget
    ]);
  }
}

OzzylCommerce::getInstance();
```

### Webhook Receiver (PHP)

```php
// Receives webhooks FROM Ozzyl (e.g., subscription renewed, alert triggered)
add_action('rest_api_init', function() {
  register_rest_route('ozzyl/v1', '/webhook', [
    'methods'  => 'POST',
    'callback' => 'ozzyl_handle_webhook',
    'permission_callback' => '__return_true',
  ]);
});

function ozzyl_handle_webhook(WP_REST_Request $request): WP_REST_Response {
  $signature = $request->get_header('x-ozzyl-signature');
  $body      = $request->get_body();
  $secret    = get_option('ozzyl_webhook_secret');

  // Verify HMAC signature
  $expected = 'sha256=' . hash_hmac('sha256', $body, $secret);
  if (!hash_equals($expected, $signature)) {
    return new WP_REST_Response(['error' => 'Invalid signature'], 401);
  }

  $event = json_decode($body, true);

  switch ($event['type']) {
    case 'subscription.renewed':
      update_option('ozzyl_subscription_status', 'active');
      break;
    case 'usage.limit_warning':
      // Send admin email warning
      wp_mail(get_option('admin_email'), 'Ozzyl Usage Warning', 'You are near your API limit');
      break;
  }

  return new WP_REST_Response(['received' => true], 200);
}
```

---

