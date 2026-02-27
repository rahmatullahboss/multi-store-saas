<?php
/**
 * Server-Side Tracking Module (CAPI)
 *
 * Tracks conversion events and syncs with Meta's Conversion API.
 * Also captures cookies for pixel matching.
 *
 * @package OzzylCommerce\Modules
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Server-Side Tracking Module
 *
 * @since 1.0.0
 */
class Ozzyl_Module_Server_Tracking implements OzzylModuleInterface {

	/**
	 * Get the module ID.
	 *
	 * @since 1.0.0
	 */
	public function get_id(): string {
		return 'server-tracking';
	}

	/**
	 * Get the module name.
	 *
	 * @since 1.0.0
	 */
	public function get_name(): string {
		return __( 'Server-Side Tracking', 'ozzyl-commerce' );
	}

	/**
	 * Get the module icon.
	 *
	 * @since 1.0.0
	 */
	public function get_icon(): string {
		return '📊';
	}

	/**
	 * Get the module description.
	 *
	 * @since 1.0.0
	 */
	public function get_description(): string {
		return __( 'Track conversions and send events to Meta Conversion API (CAPI) for accurate attribution and ad optimization.', 'ozzyl-commerce' );
	}

	/**
	 * Get the required API scope.
	 *
	 * @since 1.0.0
	 */
	public function get_required_scope(): string {
		return 'tracking';
	}

	/**
	 * Get the minimum plan tier.
	 *
	 * @since 1.0.0
	 */
	public function get_min_plan(): string {
		return 'free';
	}

	/**
	 * Activate the module.
	 *
	 * @since 1.0.0
	 */
	public function activate(): void {
		// Hook into conversion events.
		add_action( 'woocommerce_payment_complete', [ $this, 'track_purchase' ], 10, 1 );
		add_action( 'woocommerce_add_to_cart', [ $this, 'track_add_to_cart' ], 10, 6 );
		add_action( 'woocommerce_checkout_order_processed', [ $this, 'track_initiate_checkout' ], 10, 3 );

		// Enqueue tracking script for cookie capture.
		add_action( 'wp_footer', [ $this, 'enqueue_tracking_script' ] );

		Ozzyl_Logger::info( 'Server-Side Tracking module activated' );
	}

	/**
	 * Deactivate the module.
	 *
	 * @since 1.0.0
	 */
	public function deactivate(): void {
		remove_action( 'woocommerce_payment_complete', [ $this, 'track_purchase' ] );
		remove_action( 'woocommerce_add_to_cart', [ $this, 'track_add_to_cart' ] );
		remove_action( 'woocommerce_checkout_order_processed', [ $this, 'track_initiate_checkout' ] );
		remove_action( 'wp_footer', [ $this, 'enqueue_tracking_script' ] );

		Ozzyl_Logger::info( 'Server-Side Tracking module deactivated' );
	}

	/**
	 * Track a purchase event.
	 *
	 * Called on woocommerce_payment_complete.
	 *
	 * @since 1.0.0
	 * @param int $order_id Order ID.
	 */
	public function track_purchase( int $order_id ): void {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}

		$core = Ozzyl_Core::instance();
		$api  = $core->get_api();

		$event_data = [
			'type'           => 'Purchase',
			'order_id'       => $order->get_id(),
			'customer_email' => $order->get_billing_email(),
			'customer_phone' => $order->get_billing_phone(),
			'total'          => (float) $order->get_total(),
			'currency'       => $order->get_currency(),
			'items'          => $this->get_order_items_for_tracking( $order ),
		];

		// Add Facebook cookies if captured.
		if ( isset( $_COOKIE['_fbp'] ) ) {
			$event_data['fbp'] = sanitize_text_field( wp_unslash( $_COOKIE['_fbp'] ) );
		}
		if ( isset( $_COOKIE['_fbc'] ) ) {
			$event_data['fbc'] = sanitize_text_field( wp_unslash( $_COOKIE['_fbc'] ) );
		}

		$result = $api->request( 'POST', '/tracking/event', $event_data );

		if ( is_wp_error( $result ) ) {
			Ozzyl_Logger::warning(
				'Failed to track purchase event',
				[ 'order_id' => $order_id, 'error' => $result->get_error_message() ]
			);
		} else {
			Ozzyl_Logger::info( 'Purchase event tracked', [ 'order_id' => $order_id ] );
		}
	}

	/**
	 * Track add-to-cart event.
	 *
	 * Called on woocommerce_add_to_cart.
	 *
	 * @since 1.0.0
	 * @param string $cart_item_key Cart item key.
	 * @param int    $product_id Product ID.
	 * @param int    $quantity Quantity.
	 * @param int    $variation_id Variation ID.
	 * @param array  $variation Variation data.
	 * @param array  $cart_item_data Cart item data.
	 */
	public function track_add_to_cart( string $cart_item_key, int $product_id, int $quantity, int $variation_id, array $variation, array $cart_item_data ): void {
		$product = wc_get_product( $product_id );
		if ( ! $product ) {
			return;
		}

		$core = Ozzyl_Core::instance();
		$api  = $core->get_api();

		$event_data = [
			'type'        => 'AddToCart',
			'product_id'  => $product_id,
			'product_name' => $product->get_name(),
			'quantity'    => $quantity,
			'price'       => (float) $product->get_price(),
			'currency'    => get_woocommerce_currency(),
		];

		$result = $api->request( 'POST', '/tracking/event', $event_data );

		if ( is_wp_error( $result ) ) {
			Ozzyl_Logger::warning(
				'Failed to track add-to-cart event',
				[ 'product_id' => $product_id, 'error' => $result->get_error_message() ]
			);
		}
	}

	/**
	 * Track initiate-checkout event.
	 *
	 * Called on woocommerce_checkout_order_processed.
	 *
	 * @since 1.0.0
	 * @param int   $order_id Order ID.
	 * @param array $posted_data Posted form data.
	 * @param WC_Order $order Order object.
	 */
	public function track_initiate_checkout( int $order_id, array $posted_data, WC_Order $order ): void {
		$core = Ozzyl_Core::instance();
		$api  = $core->get_api();

		$event_data = [
			'type'           => 'InitiateCheckout',
			'order_id'       => $order_id,
			'customer_email' => $order->get_billing_email(),
			'total'          => (float) $order->get_total(),
			'currency'       => $order->get_currency(),
			'items_count'    => count( $order->get_items() ),
		];

		$result = $api->request( 'POST', '/tracking/event', $event_data );

		if ( is_wp_error( $result ) ) {
			Ozzyl_Logger::warning(
				'Failed to track initiate-checkout event',
				[ 'order_id' => $order_id, 'error' => $result->get_error_message() ]
			);
		}
	}

	/**
	 * Enqueue tracking script for client-side cookie capture.
	 *
	 * @since 1.0.0
	 */
	public function enqueue_tracking_script(): void {
		wp_enqueue_script(
			'ozzyl-tracking',
			OZZYL_PLUGIN_URL . 'modules/server-tracking/assets/tracking.js',
			[],
			OZZYL_VERSION,
			true
		);
	}

	/**
	 * Get items formatted for tracking.
	 *
	 * @since 1.0.0
	 * @param WC_Order $order Order object.
	 * @return array<array<string,mixed>>
	 */
	private function get_order_items_for_tracking( WC_Order $order ): array {
		$items = [];
		foreach ( $order->get_items() as $item ) {
			$items[] = [
				'product_id' => $item->get_product_id(),
				'name'       => $item->get_name(),
				'quantity'   => $item->get_quantity(),
				'price'      => (float) $item->get_total() / $item->get_quantity(),
			];
		}
		return $items;
	}

	/**
	 * Render module settings form.
	 *
	 * @since 1.0.0
	 */
	public function render_settings(): void {
		?>
		<div class="ozzyl-module-settings">
			<h3><?php esc_html_e( 'Server-Side Tracking Settings', 'ozzyl-commerce' ); ?></h3>
			<p>
				<?php esc_html_e( 'This module automatically tracks purchase, add-to-cart, and checkout events and sends them to the Ozzyl API for attribution and optimization.', 'ozzyl-commerce' ); ?>
			</p>
			<p>
				<?php esc_html_e( 'No configuration required — events are sent automatically when enabled.', 'ozzyl-commerce' ); ?>
			</p>
		</div>
		<?php
	}

	/**
	 * Get module statistics.
	 *
	 * @since 1.0.0
	 */
	public function get_stats(): array {
		global $wpdb;

		// Count orders with tracking events.
		$tracked_orders = $wpdb->get_var(
			"SELECT COUNT(*) FROM {$wpdb->posts}
			 WHERE post_type = 'shop_order'
			 AND post_date > DATE_SUB(NOW(), INTERVAL 30 DAY)"
		);

		return [
			'tracked_orders' => (int) $tracked_orders,
		];
	}
}

// Register the module.
$core = Ozzyl_Core::instance();
$core->register_module( new Ozzyl_Module_Server_Tracking() );
