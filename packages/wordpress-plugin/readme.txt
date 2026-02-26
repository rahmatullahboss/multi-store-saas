=== Ozzyl Commerce ===
Contributors: ozzyl
Tags: ozzyl, ecommerce, woocommerce, product sync, order sync, bangladesh, storefront, webhook
Requires at least: 6.0
Tested up to: 6.7
Requires PHP: 8.0
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Connect your WordPress/WooCommerce store to the Ozzyl Commerce Platform — the Shopify of Bangladesh.

== Description ==

**Ozzyl Commerce** is the official WordPress plugin for the [Ozzyl Commerce Platform](https://ozzyl.com) — a world-class, multi-tenant e-commerce SaaS built on Cloudflare's global edge network.

With this plugin you can:

* 🔗 **Connect** your WordPress site to your Ozzyl store using a secure API key
* 📦 **Embed** your Ozzyl storefront, product catalogue, or individual products anywhere on your WordPress site using a simple shortcode or Gutenberg block
* 🔔 **Receive real-time webhooks** from Ozzyl — verified with HMAC-SHA256 signatures and protected against replay attacks
* 🔄 **Sync WooCommerce** products and orders bidirectionally with your Ozzyl store
* 📊 **Monitor** your connection status, webhook registration, and sync health from a clean admin dashboard

= Shortcode =

Embed your store anywhere:

`[ozzyl_store]`

Embed a specific section:

`[ozzyl_store type="products" height="800" theme="dark"]`

Embed a single product by ID:

`[ozzyl_store type="product" id="42"]`

= Gutenberg Block =

The **Ozzyl Store Embed** block is available in the block editor under the *Embed* category.

= Webhook Events =

The plugin registers a secure webhook endpoint at:

`https://yoursite.com/wp-json/ozzyl/v1/webhook`

And fires WordPress actions for each verified event:

* `ozzyl_order_created` — A new order was placed in Ozzyl
* `ozzyl_order_updated` — An order status changed
* `ozzyl_order_cancelled` — An order was cancelled
* `ozzyl_order_delivered` — An order was marked delivered
* `ozzyl_product_created` — A new product was added
* `ozzyl_product_updated` — A product was updated
* `ozzyl_product_deleted` — A product was deleted
* `ozzyl_customer_created` — A new customer registered
* `ozzyl_customer_updated` — A customer profile was updated
* `ozzyl_webhook` — Catch-all: fires for every verified event

Example usage in your theme or plugin:

`
add_action( 'ozzyl_order_created', function( $order, $raw_payload ) {
    // Send a custom notification, update CRM, etc.
    error_log( 'New Ozzyl order: ' . $order['orderNumber'] );
}, 10, 2 );
`

= WooCommerce Sync =

When WooCommerce is active and sync is enabled:

* **Import Products** — Pull your Ozzyl product catalogue into WooCommerce (creates or updates)
* **Export Orders** — Push WooCommerce orders to Ozzyl
* **Auto Sync** — Automatically sync order status changes in real time

= Security =

* API key stored encrypted in WordPress options (never exposed in HTML or JS)
* Webhook HMAC-SHA256 verified with timing-safe `hash_equals()`
* Replay attack prevention (5-minute signature window)
* All inputs sanitized, all outputs escaped
* Nonce verification on all admin forms
* Capability checks (`manage_options`) on all admin actions

= Requirements =

* WordPress 6.0+
* PHP 8.0+
* WooCommerce 8.0+ (optional, required for sync features)
* An active [Ozzyl Commerce](https://ozzyl.com) account

== Installation ==

1. Upload the `ozzyl-commerce` folder to the `/wp-content/plugins/` directory, or install directly from the WordPress plugin screen.
2. Activate the plugin via the **Plugins** menu in WordPress.
3. Go to **Settings → Ozzyl Commerce**.
4. Enter your API key from [app.ozzyl.com/settings/developer](https://app.ozzyl.com/settings/developer).
5. Click **Test Connection** to verify.
6. Copy the **Webhook URL** and register it in your Ozzyl dashboard, or click **Auto-Register Webhook** to do it automatically.
7. Add `[ozzyl_store]` to any page or post to embed your storefront.

== Frequently Asked Questions ==

= Where do I get an API key? =

Log in to your Ozzyl dashboard at [app.ozzyl.com](https://app.ozzyl.com), navigate to **Settings → Developer**, and create an API key with the required scopes.

= Is WooCommerce required? =

No. The plugin works standalone for storefront embedding and webhook receiving. WooCommerce is only required for the product/order sync features.

= Is the API key stored securely? =

Yes. The API key is stored in the WordPress options table and is never output in HTML, JavaScript, or anywhere publicly accessible. The admin settings page shows a masked version (`sk_live_abc123****7xyz`).

= How does webhook verification work? =

Ozzyl signs each webhook delivery with HMAC-SHA256. The signature is in the `Ozzyl-Signature` header in the format `t=<unix_timestamp>,v1=<hex_digest>`. The plugin:
1. Parses the timestamp and signature
2. Rejects signatures older than 5 minutes (replay attack prevention)
3. Computes `HMAC-SHA256(timestamp + "." + raw_body, webhook_secret)`
4. Compares with `hash_equals()` (timing-safe)

= Can I react to Ozzyl webhook events in my theme? =

Yes! Add action hooks in your theme's `functions.php`:

`
add_action( 'ozzyl_order_created', function( $order, $payload ) {
    // Your code here
}, 10, 2 );
`

= Does the plugin work with page caching plugins? =

The webhook endpoint (`/wp-json/ozzyl/v1/webhook`) is a POST request and will not be cached by standard caching plugins. Storefront pages with embedded iframes may be cached normally.

= What happens to my data if I uninstall the plugin? =

All plugin data is permanently deleted on uninstall: API key, webhook secret, settings, cached store data, and the `_ozzyl_product_id` meta from WooCommerce products.

== Screenshots ==

1. Settings page — API key and connection status
2. Connection Status tab — live status cards
3. Shortcodes reference tab
4. Ozzyl Store Embed Gutenberg block
5. Embedded storefront on a WordPress page

== Changelog ==

= 1.0.0 =
* Initial release
* PHP API client with retry/backoff logic for 429 and 5xx responses
* Webhook receiver with HMAC-SHA256 verification and replay attack prevention
* WooCommerce bidirectional product/order sync
* [ozzyl_store] shortcode with type, height, theme, id parameters
* Gutenberg block: Ozzyl Store Embed
* Admin settings page with connection test, webhook registration, and manual sync
* Connection Status tab with live status cards
* Auto-register webhook via Ozzyl API
* Proper activation, deactivation, and uninstall hooks
* Full internationalization support

== Upgrade Notice ==

= 1.0.0 =
Initial release of Ozzyl Commerce for WordPress.

== Privacy Policy ==

This plugin communicates with the Ozzyl Commerce Platform API (`https://api.ozzyl.com/v1`) to:

* Verify your API key and retrieve store information
* Register and manage webhook endpoints
* Sync products and orders (if WooCommerce sync is enabled)

No personal data from your WordPress users is sent to Ozzyl automatically by this plugin, except as part of WooCommerce order sync (customer name, email, phone, shipping address — the same data you entered in WooCommerce).

Webhook deliveries from Ozzyl to your site may contain order and customer data from your Ozzyl store.

For Ozzyl's privacy policy, see [ozzyl.com/privacy](https://ozzyl.com/privacy).
