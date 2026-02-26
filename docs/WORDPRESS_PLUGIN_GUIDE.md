# Ozzyl Commerce — WordPress Plugin Guide

> Plugin: `ozzyl-commerce` v1.0.0 | Source: `packages/wordpress-plugin/`  
> Connects WordPress / WooCommerce to the Ozzyl Commerce Platform.

---

## Requirements

| Requirement | Minimum |
|-------------|---------|
| WordPress | 6.0+ |
| PHP | 8.0+ |
| WooCommerce (optional) | 8.0+ |

---

## Installation

### Option A — Manual Upload

1. Download `ozzyl-commerce.zip` from [ozzyl.com/wordpress](https://ozzyl.com/wordpress)
2. In WordPress admin: **Plugins → Add New → Upload Plugin**
3. Upload the zip and click **Install Now**
4. Click **Activate Plugin**

### Option B — From Source

```bash
cd packages/wordpress-plugin
zip -r ozzyl-commerce.zip . --exclude "*.git*"
```

Upload the zip via the WordPress admin as above.

---

## Configuration

### Step 1 — Get Your API Key

1. Log in to [app.ozzyl.com](https://app.ozzyl.com)
2. Go to **Settings → Developer → Create API Key**
3. Select scopes: `read_products`, `read_orders`, `read_store`
4. Copy the key (shown once — starts with `sk_live_`)

### Step 2 — Enter Your API Key

In WordPress admin:

1. Go to **Settings → Ozzyl Commerce**
2. Click the **Connection** tab
3. Paste your API key into **Ozzyl API Key**
4. Click **Test Connection** — you should see a green ✅
5. Click **Save Settings**

### Step 3 — Configure Webhook (Optional)

To receive real-time event notifications from Ozzyl:

1. Copy your **Webhook URL** from the **Connection** tab:
   ```
   https://yoursite.com/wp-json/ozzyl/v1/webhook
   ```
2. In [app.ozzyl.com](https://app.ozzyl.com): **Settings → Webhooks → Add Webhook**
3. Paste the URL, select events (e.g. `order/created`, `product/updated`)
4. Copy the **Secret** from Ozzyl and paste it into the WordPress plugin's **Webhook Secret** field
5. Save both sides

---

## Admin Settings Page

The settings page has three tabs at **Settings → Ozzyl Commerce**:

### Connection Tab

| Field | Description |
|-------|-------------|
| Ozzyl API Key | Your `sk_live_` or `sk_test_` key |
| Webhook Secret | HMAC secret for verifying incoming webhooks |
| Test Connection | Validates the API key against `/api/v1/store` |

### Sync Tab

| Field | Description |
|-------|-------------|
| Enable Sync | Master toggle for WooCommerce ↔ Ozzyl sync |
| Auto-Sync | Automatically sync on WooCommerce product save |
| Sync Now | Manual full sync button |

### Advanced Tab

| Field | Description |
|-------|-------------|
| API Base URL | Override the API endpoint (for staging) |
| Debug Logging | Enable verbose `error_log()` output |

---

## WooCommerce Sync

When WooCommerce is active and sync is enabled, the plugin provides **bidirectional sync** between your WooCommerce store and Ozzyl.

### What syncs

| Direction | Data |
|-----------|------|
| WooCommerce → Ozzyl | Products (title, price, stock, images, SKU) |
| Ozzyl → WooCommerce | Orders (via webhooks: `order/created`, `order/updated`) |

### Trigger a manual sync

```php
// Programmatic sync from your theme or another plugin
$sync = ozzyl()->sync;
if ( $sync ) {
    $result = $sync->sync_all_products();
}
```

### Automatic sync on product save

Enable **Auto-Sync** in the Sync tab — the plugin hooks into `woocommerce_update_product` and `woocommerce_new_product` to push changes automatically.

---

## Shortcode

Embed your Ozzyl storefront anywhere on your WordPress site:

```
[ozzyl_store]
```

**Attributes:**

| Attribute | Default | Description |
|-----------|---------|-------------|
| `store_id` | auto-detected | Override the store ID |
| `theme` | `default` | Widget display theme |
| `limit` | `12` | Number of products to display |

```
[ozzyl_store limit="6" theme="minimal"]
```

---

## Gutenberg Block

The plugin registers an **Ozzyl Store** block available in the Gutenberg editor under the **Widgets** category. It renders the same output as `[ozzyl_store]` and supports the same attributes via the block sidebar.

---

## Webhook Receiver

The plugin registers a REST endpoint that receives signed webhook POSTs from Ozzyl:

```
POST /wp-json/ozzyl/v1/webhook
```

### Security

Every incoming request is verified with HMAC-SHA256 before any processing occurs:

1. Reads the raw request body
2. Parses `Ozzyl-Signature: t=<timestamp>,v1=<hex>` header
3. Rejects signatures older than 5 minutes (replay-attack prevention)
4. Computes `HMAC-SHA256(timestamp + "." + body, webhook_secret)`
5. Constant-time comparison with `hash_equals()`
6. Deduplicates by `deliveryId` using WordPress transients (10-minute window)

### WordPress Actions

After a verified webhook is received, the plugin fires WordPress actions. Hook into them from your theme or plugin:

```php
// Order created
add_action( 'ozzyl_order_created', function( array $order, array $raw ) {
    // $order — the order data object from Ozzyl
    // $raw   — full webhook payload
    error_log( 'New Ozzyl order: ' . $order['orderNumber'] );
}, 10, 2 );

// Order updated
add_action( 'ozzyl_order_updated', function( array $order, array $raw ) {
    // Update your local records, send notifications, etc.
}, 10, 2 );

// Order cancelled
add_action( 'ozzyl_order_cancelled', function( array $order, array $raw ) {
    // Handle cancellation — refund, restock, notify customer
}, 10, 2 );

// Product updated in Ozzyl → sync to WooCommerce
add_action( 'ozzyl_product_updated', function( array $product, array $raw ) {
    // $product — Ozzyl product data
}, 10, 2 );

// Customer created
add_action( 'ozzyl_customer_created', function( array $customer, array $raw ) {
    // Optionally create a WP user
}, 10, 2 );

// Catch-all — fires for every verified webhook event
add_action( 'ozzyl_webhook', function( string $event_type, array $data, array $raw ) {
    error_log( 'Ozzyl event: ' . $event_type );
}, 10, 3 );
```

**All available action hooks:**

| Action | Fires when |
|--------|-----------|
| `ozzyl_order_created` | New order placed |
| `ozzyl_order_updated` | Order status changed |
| `ozzyl_order_cancelled` | Order cancelled |
| `ozzyl_order_delivered` | Order marked delivered |
| `ozzyl_product_created` | New product created in Ozzyl |
| `ozzyl_product_updated` | Product updated in Ozzyl |
| `ozzyl_product_deleted` | Product deleted in Ozzyl |
| `ozzyl_customer_created` | New customer registered |
| `ozzyl_customer_updated` | Customer details updated |
| `ozzyl_webhook` | Every verified event (catch-all) |

---

## PHP API Client

The plugin ships `Ozzyl_API` — a PHP client you can use directly:

```php
// Get the global instance (uses the saved API key)
$api = ozzyl()->api;

// Or instantiate with your own key
$api = new Ozzyl_API( 'sk_live_your_key' );

// Fetch products
$products = $api->get_products( [ 'limit' => 10, 'published' => true ] );
if ( is_wp_error( $products ) ) {
    error_log( $products->get_error_message() );
} else {
    foreach ( $products as $product ) {
        echo $product['title'];
    }
}

// Fetch a single order
$order = $api->get_order( 1001 );

// Fetch analytics (last 7 days)
$stats = $api->get_analytics( [ 'days' => 7 ] );
if ( ! is_wp_error( $stats ) ) {
    echo 'Revenue: ' . $stats['orders']['revenue'];
}

// Test connection
if ( $api->test_connection() ) {
    echo 'Connected!';
}
```

**Available methods:**

| Method | Description |
|--------|-------------|
| `get_store()` | Get store info |
| `test_connection()` | Returns `true` if API key is valid |
| `get_products( $params )` | List products |
| `get_product( $id )` | Get single product |
| `get_orders( $params )` | List orders |
| `get_order( $id )` | Get single order with items |
| `get_analytics( $params )` | Get analytics summary |
| `get_webhooks()` | List webhooks |
| `create_webhook( $url, $events, $secret )` | Register a webhook |
| `delete_webhook( $id )` | Delete a webhook |

All methods return `array|WP_Error` (or `bool|WP_Error` for `delete_webhook`).

The client auto-retries on `429` and `5xx` responses (up to 2 retries with exponential backoff).

---

## Uninstall

Deactivating the plugin stops all hooks but preserves settings. To fully remove:

1. Go to **Plugins → Ozzyl Commerce → Deactivate**
2. Then **Delete**

The `uninstall.php` file removes all stored options (`ozzyl_api_key`, `ozzyl_webhook_secret`, `ozzyl_sync_enabled`, `ozzyl_sync_auto`) from the database on deletion.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "API key not configured" | Go to **Settings → Ozzyl Commerce → Connection** and save your key |
| Test connection fails (401) | Key may be revoked or typed incorrectly — regenerate in Ozzyl dashboard |
| Webhooks not arriving | Check the webhook URL in Ozzyl dashboard matches your site's REST URL |
| Webhook signature rejected | Ensure the secret in WP matches the secret saved in Ozzyl dashboard |
| Sync not working | Confirm WooCommerce 8.0+ is active and **Enable Sync** is toggled on |
| PHP version error | Upgrade to PHP 8.0 or higher |

Enable debug logging via the **Advanced** tab to see detailed `error_log()` output in your server logs.

---

## Further Reading

- [API Reference](./API_REFERENCE.md)
- [5-Minute Quickstart](./API_PLATFORM_QUICKSTART.md)
- [JavaScript SDK Guide](./SDK_GUIDE.md)
