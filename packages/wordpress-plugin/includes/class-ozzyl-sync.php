<?php
/**
 * Ozzyl WooCommerce Sync
 *
 * Bridges WooCommerce orders/products with the Ozzyl Commerce Platform API.
 * Handles both automatic sync (via WooCommerce action hooks) and manual sync
 * triggered from the admin settings page.
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ozzyl_Sync — WooCommerce ↔ Ozzyl bidirectional sync.
 *
 * @since 1.0.0
 */
class Ozzyl_Sync {

	/** @var Ozzyl_API API client instance. */
	private Ozzyl_API $api;

	/**
	 * Construct and wire up WooCommerce hooks.
	 *
	 * @since 1.0.0
	 * @param Ozzyl_API $api Initialised API client.
	 */
	public function __construct( Ozzyl_API $api ) {
		$this->api = $api;

		// Only hook WooCommerce events when auto-sync is enabled.
		if ( '1' === get_option( 'ozzyl_sync_auto', '0' ) ) {
			$this->register_woocommerce_hooks();
		}

		// REST endpoint for manual sync triggers from admin JS.
		add_action( 'rest_api_init', array( $this, 'register_sync_routes' ) );
	}

	// ── WooCommerce event hooks ───────────────────────────────────────────────

	/**
	 * Register WooCommerce action hooks for automatic sync.
	 *
	 * @since 1.0.0
	 */
	private function register_woocommerce_hooks(): void {
		// New order created.
		add_action( 'woocommerce_new_order', array( $this, 'on_new_order' ), 10, 1 );

		// Order status changed (e.g. pending → processing).
		add_action( 'woocommerce_order_status_changed', array( $this, 'on_order_status_changed' ), 10, 4 );

		// Product saved / updated.
		add_action( 'woocommerce_update_product', array( $this, 'on_product_updated' ), 10, 1 );
	}

	/**
	 * Handle a newly created WooCommerce order.
	 *
	 * @since 1.0.0
	 * @param int $order_id WooCommerce order ID.
	 */
	public function on_new_order( int $order_id ): void {
		$order = wc_get_order( $order_id );
		if ( ! $order instanceof WC_Order ) {
			return;
		}

		$payload = $this->map_wc_order_to_ozzyl( $order );

		error_log( sprintf( '[Ozzyl] Syncing new WooCommerce order #%d to Ozzyl.', $order_id ) );

		/**
		 * Fires before a WooCommerce order is synced to Ozzyl.
		 *
		 * @since 1.0.0
		 * @param int                  $order_id WooCommerce order ID.
		 * @param array<string,mixed>  $payload  Data to be sent to Ozzyl.
		 */
		do_action( 'ozzyl_before_order_sync', $order_id, $payload );

		// Note: Ozzyl API receives orders via webhooks from WC.
		// This hook fires do_action so site-specific code can forward the order.
		do_action( 'ozzyl_wc_order_created', $order_id, $payload, $order );
	}

	/**
	 * Handle a WooCommerce order status change.
	 *
	 * @since 1.0.0
	 * @param int       $order_id   WooCommerce order ID.
	 * @param string    $old_status Previous status slug (without 'wc-' prefix).
	 * @param string    $new_status New status slug.
	 * @param WC_Order  $order      WooCommerce order object.
	 */
	public function on_order_status_changed( int $order_id, string $old_status, string $new_status, WC_Order $order ): void {
		error_log( sprintf( '[Ozzyl] WooCommerce order #%d status changed: %s → %s', $order_id, $old_status, $new_status ) );

		$payload = $this->map_wc_order_to_ozzyl( $order );
		$payload['status'] = $this->map_wc_status_to_ozzyl( $new_status );

		/**
		 * Fires when a WooCommerce order status changes, with the mapped Ozzyl payload.
		 *
		 * @since 1.0.0
		 * @param int                  $order_id   WooCommerce order ID.
		 * @param string               $old_status Previous WC status.
		 * @param string               $new_status New WC status.
		 * @param array<string,mixed>  $payload    Mapped Ozzyl order data.
		 * @param WC_Order             $order      WooCommerce order object.
		 */
		do_action( 'ozzyl_wc_order_status_changed', $order_id, $old_status, $new_status, $payload, $order );
	}

	/**
	 * Handle a WooCommerce product update.
	 *
	 * @since 1.0.0
	 * @param int $product_id WooCommerce product post ID.
	 */
	public function on_product_updated( int $product_id ): void {
		$product = wc_get_product( $product_id );
		if ( ! $product instanceof WC_Product ) {
			return;
		}

		error_log( sprintf( '[Ozzyl] WooCommerce product #%d updated.', $product_id ) );

		$payload = $this->map_wc_product_to_ozzyl( $product );

		/**
		 * Fires when a WooCommerce product is updated.
		 *
		 * @since 1.0.0
		 * @param int                  $product_id WooCommerce product ID.
		 * @param array<string,mixed>  $payload    Mapped Ozzyl product data.
		 * @param WC_Product           $product    WooCommerce product object.
		 */
		do_action( 'ozzyl_wc_product_updated', $product_id, $payload, $product );
	}

	// ── Manual sync: import Ozzyl → WooCommerce ───────────────────────────────

	/**
	 * Import products from Ozzyl into WooCommerce.
	 *
	 * Fetches published products from the Ozzyl API and creates/updates
	 * matching WooCommerce products. Uses post meta `_ozzyl_product_id` to
	 * detect existing imports and update rather than duplicate.
	 *
	 * @since 1.0.0
	 * @param int $limit Max products to import per run (default 50).
	 * @return array{imported:int, updated:int, skipped:int, errors:string[]} Summary.
	 */
	public function import_products( int $limit = 50 ): array {
		$result = [
			'imported' => 0,
			'updated'  => 0,
			'skipped'  => 0,
			'errors'   => [],
		];

		if ( ! class_exists( 'WooCommerce' ) ) {
			$result['errors'][] = __( 'WooCommerce is not active.', 'ozzyl-commerce' );
			return $result;
		}

		$response = $this->api->get_products( [ 'limit' => min( $limit, 100 ), 'published' => true ] );

		if ( is_wp_error( $response ) ) {
			$result['errors'][] = $response->get_error_message();
			error_log( '[Ozzyl] import_products() failed: ' . $response->get_error_message() );
			return $result;
		}

		// The API returns an array of product objects (get_products() returns data[]).
		$products = is_array( $response ) ? array_values( $response ) : [];

		foreach ( $products as $ozzyl_product ) {
			if ( ! is_array( $ozzyl_product ) || empty( $ozzyl_product['id'] ) ) {
				$result['skipped']++;
				continue;
			}

			$ozzyl_id = (int) $ozzyl_product['id'];

			// Check if already imported.
			$existing_posts = get_posts( [
				'post_type'      => 'product',
				'meta_key'       => '_ozzyl_product_id',
				'meta_value'     => $ozzyl_id,
				'posts_per_page' => 1,
				'fields'         => 'ids',
			] );

			$wc_product_id = ! empty( $existing_posts ) ? (int) $existing_posts[0] : 0;

			if ( $wc_product_id > 0 ) {
				// Update existing WooCommerce product.
				$this->update_wc_product( $wc_product_id, $ozzyl_product );
				$result['updated']++;
			} else {
				// Create new WooCommerce product.
				$new_id = $this->create_wc_product( $ozzyl_product );
				if ( is_wp_error( $new_id ) ) {
					$result['errors'][] = sprintf(
						/* translators: 1: Ozzyl product ID. 2: Error message. */
						__( 'Failed to import product #%1$d: %2$s', 'ozzyl-commerce' ),
						$ozzyl_id,
						$new_id->get_error_message()
					);
				} else {
					$result['imported']++;
				}
			}
		}

		error_log( sprintf(
			'[Ozzyl] import_products() complete: imported=%d updated=%d skipped=%d errors=%d',
			$result['imported'],
			$result['updated'],
			$result['skipped'],
			count( $result['errors'] )
		) );

		return $result;
	}

	/**
	 * Export WooCommerce orders to Ozzyl via the WordPress action system.
	 *
	 * Fetches recent WooCommerce orders and fires `ozzyl_wc_order_export`
	 * so site-specific code can forward them to external systems or Ozzyl.
	 *
	 * @since 1.0.0
	 * @param int $limit Max orders to export per run (default 50).
	 * @return array{exported:int, skipped:int, errors:string[]} Summary.
	 */
	public function export_orders( int $limit = 50 ): array {
		$result = [
			'exported' => 0,
			'skipped'  => 0,
			'errors'   => [],
		];

		if ( ! class_exists( 'WooCommerce' ) ) {
			$result['errors'][] = __( 'WooCommerce is not active.', 'ozzyl-commerce' );
			return $result;
		}

		$orders = wc_get_orders( [
			'limit'  => min( $limit, 100 ),
			'status' => [ 'processing', 'completed', 'on-hold' ],
			'orderby'=> 'date',
			'order'  => 'DESC',
		] );

		foreach ( $orders as $order ) {
			if ( ! $order instanceof WC_Order ) {
				$result['skipped']++;
				continue;
			}

			$payload = $this->map_wc_order_to_ozzyl( $order );

			/**
			 * Fires for each WooCommerce order during a manual export.
			 *
			 * @since 1.0.0
			 * @param int                  $order_id WooCommerce order ID.
			 * @param array<string,mixed>  $payload  Mapped Ozzyl order data.
			 * @param WC_Order             $order    WooCommerce order object.
			 */
			do_action( 'ozzyl_wc_order_export', $order->get_id(), $payload, $order );

			$result['exported']++;
		}

		error_log( sprintf(
			'[Ozzyl] export_orders() complete: exported=%d skipped=%d errors=%d',
			$result['exported'],
			$result['skipped'],
			count( $result['errors'] )
		) );

		return $result;
	}

	// ── REST endpoints for admin AJAX ─────────────────────────────────────────

	/**
	 * Register REST API routes for manual sync triggers.
	 *
	 * @since 1.0.0
	 */
	public function register_sync_routes(): void {
		register_rest_route( 'ozzyl/v1', '/sync/import-products', [
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'rest_import_products' ),
			'permission_callback' => array( $this, 'check_admin_permission' ),
		] );

		register_rest_route( 'ozzyl/v1', '/sync/export-orders', [
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'rest_export_orders' ),
			'permission_callback' => array( $this, 'check_admin_permission' ),
		] );
	}

	/**
	 * REST handler: import products from Ozzyl to WooCommerce.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function rest_import_products( WP_REST_Request $request ): WP_REST_Response {
		$limit  = (int) ( $request->get_param( 'limit' ) ?? 50 );
		$result = $this->import_products( $limit );
		return new WP_REST_Response( array_merge( [ 'success' => true ], $result ), 200 );
	}

	/**
	 * REST handler: export WooCommerce orders to Ozzyl.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request REST request.
	 * @return WP_REST_Response
	 */
	public function rest_export_orders( WP_REST_Request $request ): WP_REST_Response {
		$limit  = (int) ( $request->get_param( 'limit' ) ?? 50 );
		$result = $this->export_orders( $limit );
		return new WP_REST_Response( array_merge( [ 'success' => true ], $result ), 200 );
	}

	/**
	 * Permission callback: require manage_options capability.
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	public function check_admin_permission(): bool {
		return current_user_can( 'manage_options' );
	}

	// ── Data mapping helpers ──────────────────────────────────────────────────

	/**
	 * Map a WooCommerce order to an Ozzyl-compatible data array.
	 *
	 * @since 1.0.0
	 * @param WC_Order $order WooCommerce order object.
	 * @return array<string,mixed>
	 */
	public function map_wc_order_to_ozzyl( WC_Order $order ): array {
		$items = [];
		foreach ( $order->get_items() as $item ) {
			/** @var WC_Order_Item_Product $item */
			$items[] = [
				'title'    => $item->get_name(),
				'quantity' => $item->get_quantity(),
				'price'    => (float) $order->get_item_subtotal( $item, false, false ),
				'total'    => (float) $item->get_total(),
				'sku'      => $item->get_product() ? $item->get_product()->get_sku() : null,
			];
		}

		$shipping_address = [
			'name'     => $order->get_shipping_first_name() . ' ' . $order->get_shipping_last_name(),
			'address1' => $order->get_shipping_address_1(),
			'address2' => $order->get_shipping_address_2(),
			'city'     => $order->get_shipping_city(),
			'state'    => $order->get_shipping_state(),
			'postcode' => $order->get_shipping_postcode(),
			'country'  => $order->get_shipping_country(),
		];

		return [
			'externalId'      => (string) $order->get_id(),
			'orderNumber'     => $order->get_order_number(),
			'status'          => $this->map_wc_status_to_ozzyl( $order->get_status() ),
			'customerName'    => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
			'customerEmail'   => $order->get_billing_email(),
			'customerPhone'   => $order->get_billing_phone(),
			'shippingAddress' => wp_json_encode( $shipping_address ),
			'subtotal'        => (float) $order->get_subtotal(),
			'tax'             => (float) $order->get_total_tax(),
			'shipping'        => (float) $order->get_shipping_total(),
			'total'           => (float) $order->get_total(),
			'paymentMethod'   => $order->get_payment_method(),
			'notes'           => $order->get_customer_note(),
			'items'           => $items,
			'source'          => 'woocommerce',
		];
	}

	/**
	 * Map a WooCommerce product to an Ozzyl-compatible data array.
	 *
	 * @since 1.0.0
	 * @param WC_Product $product WooCommerce product object.
	 * @return array<string,mixed>
	 */
	public function map_wc_product_to_ozzyl( WC_Product $product ): array {
		return [
			'externalId'     => (string) $product->get_id(),
			'title'          => $product->get_name(),
			'description'    => $product->get_description(),
			'price'          => (float) $product->get_price(),
			'compareAtPrice' => $product->get_regular_price() !== $product->get_sale_price()
				? (float) $product->get_regular_price()
				: null,
			'sku'            => $product->get_sku(),
			'inventory'      => $product->managing_stock() ? $product->get_stock_quantity() : null,
			'imageUrl'       => wp_get_attachment_url( $product->get_image_id() ) ?: null,
			'isPublished'    => $product->is_visible(),
			'category'       => implode( ', ', wp_get_post_terms( $product->get_id(), 'product_cat', [ 'fields' => 'names' ] ) ),
			'tags'           => wp_get_post_terms( $product->get_id(), 'product_tag', [ 'fields' => 'names' ] ),
			'source'         => 'woocommerce',
		];
	}

	/**
	 * Map a WooCommerce order status to an Ozzyl order status.
	 *
	 * @since 1.0.0
	 * @param string $wc_status WooCommerce status slug (without 'wc-' prefix).
	 * @return string Ozzyl status string.
	 */
	public function map_wc_status_to_ozzyl( string $wc_status ): string {
		$map = [
			'pending'    => 'pending',
			'on-hold'    => 'pending',
			'processing' => 'processing',
			'completed'  => 'delivered',
			'shipped'    => 'shipped',
			'cancelled'  => 'cancelled',
			'refunded'   => 'returned',
			'failed'     => 'cancelled',
		];
		return $map[ $wc_status ] ?? 'pending';
	}

	// ── WooCommerce product create / update helpers ───────────────────────────

	/**
	 * Create a new WooCommerce simple product from an Ozzyl product array.
	 *
	 * @since 1.0.0
	 * @param array<string,mixed> $ozzyl_product Ozzyl product data.
	 * @return int|WP_Error New WooCommerce product ID on success, WP_Error on failure.
	 */
	private function create_wc_product( array $ozzyl_product ): int|WP_Error {
		$product = new WC_Product_Simple();
		$this->apply_ozzyl_data_to_wc_product( $product, $ozzyl_product );

		$product_id = $product->save();
		if ( ! $product_id ) {
			return new WP_Error( 'ozzyl_wc_save_failed', __( 'Failed to save WooCommerce product.', 'ozzyl-commerce' ) );
		}

		// Store Ozzyl product ID as post meta for future update detection.
		update_post_meta( $product_id, '_ozzyl_product_id', (int) $ozzyl_product['id'] );

		error_log( sprintf( '[Ozzyl] Created WooCommerce product #%d from Ozzyl product #%d.', $product_id, $ozzyl_product['id'] ) );

		return $product_id;
	}

	/**
	 * Update an existing WooCommerce product from Ozzyl data.
	 *
	 * @since 1.0.0
	 * @param int                  $wc_product_id WooCommerce product ID.
	 * @param array<string,mixed>  $ozzyl_product Ozzyl product data.
	 */
	private function update_wc_product( int $wc_product_id, array $ozzyl_product ): void {
		$product = wc_get_product( $wc_product_id );
		if ( ! $product instanceof WC_Product ) {
			return;
		}
		$this->apply_ozzyl_data_to_wc_product( $product, $ozzyl_product );
		$product->save();
		error_log( sprintf( '[Ozzyl] Updated WooCommerce product #%d from Ozzyl product #%d.', $wc_product_id, $ozzyl_product['id'] ) );
	}

	/**
	 * Apply Ozzyl product data fields onto a WC_Product object.
	 *
	 * @since 1.0.0
	 * @param WC_Product           $product       WooCommerce product to mutate.
	 * @param array<string,mixed>  $ozzyl_product Ozzyl product data.
	 */
	private function apply_ozzyl_data_to_wc_product( WC_Product $product, array $ozzyl_product ): void {
		$product->set_name( sanitize_text_field( $ozzyl_product['title'] ?? '' ) );
		$product->set_description( wp_kses_post( $ozzyl_product['description'] ?? '' ) );
		$product->set_regular_price( (string) ( $ozzyl_product['compareAtPrice'] ?? $ozzyl_product['price'] ?? 0 ) );

		if ( ! empty( $ozzyl_product['compareAtPrice'] ) ) {
			$product->set_sale_price( (string) $ozzyl_product['price'] );
		}

		if ( ! empty( $ozzyl_product['sku'] ) ) {
			$product->set_sku( sanitize_text_field( $ozzyl_product['sku'] ) );
		}

		if ( isset( $ozzyl_product['inventory'] ) && null !== $ozzyl_product['inventory'] ) {
			$product->set_manage_stock( true );
			$product->set_stock_quantity( (int) $ozzyl_product['inventory'] );
		}

		$product->set_status( ( $ozzyl_product['isPublished'] ?? false ) ? 'publish' : 'draft' );

		if ( ! empty( $ozzyl_product['seoTitle'] ) ) {
			// Yoast SEO / RankMath — set via meta if plugin is active.
			if ( defined( 'WPSEO_VERSION' ) ) {
				// Will be updated after save via wpseo_save_postdata.
				$product->update_meta_data( '_yoast_wpseo_title', sanitize_text_field( $ozzyl_product['seoTitle'] ) );
				$product->update_meta_data( '_yoast_wpseo_metadesc', sanitize_text_field( $ozzyl_product['seoDescription'] ?? '' ) );
			}
		}
	}
}
