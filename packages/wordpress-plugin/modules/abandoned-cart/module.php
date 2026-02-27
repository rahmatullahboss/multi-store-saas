<?php
/**
 * Abandoned Cart Module
 *
 * Real-time cart sync and abandoned cart recovery.
 *
 * @package OzzylCommerce\Modules
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Abandoned Cart Module
 *
 * @since 1.0.0
 */
class Ozzyl_Module_Abandoned_Cart implements OzzylModuleInterface {

	/**
	 * Get the module ID.
	 *
	 * @since 1.0.0
	 */
	public function get_id(): string {
		return 'abandoned-cart';
	}

	/**
	 * Get the module name.
	 *
	 * @since 1.0.0
	 */
	public function get_name(): string {
		return __( 'Abandoned Cart Recovery', 'ozzyl-commerce' );
	}

	/**
	 * Get the module icon.
	 *
	 * @since 1.0.0
	 */
	public function get_icon(): string {
		return '🛒';
	}

	/**
	 * Get the module description.
	 *
	 * @since 1.0.0
	 */
	public function get_description(): string {
		return __( 'Track abandoned carts in real-time and send recovery campaigns to recover lost sales.', 'ozzyl-commerce' );
	}

	/**
	 * Get the required API scope.
	 *
	 * @since 1.0.0
	 */
	public function get_required_scope(): string {
		return 'abandoned_cart';
	}

	/**
	 * Get the minimum plan tier.
	 *
	 * @since 1.0.0
	 */
	public function get_min_plan(): string {
		return 'pro';
	}

	/**
	 * Activate the module.
	 *
	 * @since 1.0.0
	 */
	public function activate(): void {
		// Hook into cart updates (real-time, NOT WP Cron).
		add_action( 'woocommerce_cart_updated', [ $this, 'sync_cart' ] );

		// Hook into successful checkout.
		add_action( 'woocommerce_checkout_order_processed', [ $this, 'mark_cart_converted' ], 10, 3 );

		Ozzyl_Logger::info( 'Abandoned Cart module activated' );
	}

	/**
	 * Deactivate the module.
	 *
	 * @since 1.0.0
	 */
	public function deactivate(): void {
		remove_action( 'woocommerce_cart_updated', [ $this, 'sync_cart' ] );
		remove_action( 'woocommerce_checkout_order_processed', [ $this, 'mark_cart_converted' ] );

		Ozzyl_Logger::info( 'Abandoned Cart module deactivated' );
	}

	/**
	 * Sync cart to Ozzyl API (real-time).
	 *
	 * Called on woocommerce_cart_updated.
	 * Sends current cart contents for real-time tracking.
	 *
	 * @since 1.0.0
	 */
	public function sync_cart(): void {
		if ( is_admin() || ! is_user_logged_in() ) {
			return; // Don't sync for guests or admin.
		}

		$cart = WC()->cart;
		if ( ! $cart ) {
			return;
		}

		$customer = wp_get_current_user();

		$cart_data = [
			'customer_id'   => $customer->ID,
			'customer_email' => $customer->user_email,
			'customer_phone' => get_user_meta( $customer->ID, 'billing_phone', true ),
			'items'         => [],
			'total'         => (float) $cart->get_total( 'edit' ),
			'currency'      => get_woocommerce_currency(),
		];

		// Add cart items.
		foreach ( $cart->get_cart() as $item ) {
			$product = $item['data'];
			$cart_data['items'][] = [
				'product_id' => $product->get_id(),
				'name'       => $product->get_name(),
				'quantity'   => $item['quantity'],
				'price'      => (float) $product->get_price(),
			];
		}

		// Send to API.
		$core   = Ozzyl_Core::instance();
		$api    = $core->get_api();
		$result = $api->request( 'POST', '/cart/sync', $cart_data );

		if ( is_wp_error( $result ) ) {
			Ozzyl_Logger::warning(
				'Cart sync failed',
				[ 'customer_id' => $customer->ID, 'error' => $result->get_error_message() ]
			);
		}
	}

	/**
	 * Mark cart as converted when order is placed.
	 *
	 * @since 1.0.0
	 * @param int   $order_id Order ID.
	 * @param array $posted_data Posted form data.
	 * @param WC_Order $order Order object.
	 */
	public function mark_cart_converted( int $order_id, array $posted_data, WC_Order $order ): void {
		$customer = $order->get_user();
		if ( ! $customer ) {
			return;
		}

		$core   = Ozzyl_Core::instance();
		$api    = $core->get_api();
		$result = $api->request( 'POST', '/cart/sync', [
			'customer_id' => $customer->ID,
			'converted'  => true,
			'order_id'   => $order_id,
		] );

		if ( is_wp_error( $result ) ) {
			Ozzyl_Logger::warning(
				'Cart conversion update failed',
				[ 'order_id' => $order_id, 'error' => $result->get_error_message() ]
			);
		}
	}

	/**
	 * Render module settings form.
	 *
	 * @since 1.0.0
	 */
	public function render_settings(): void {
		?>
		<div class="ozzyl-module-settings">
			<h3><?php esc_html_e( 'Abandoned Cart Recovery Settings', 'ozzyl-commerce' ); ?></h3>
			<p>
				<?php esc_html_e( 'This module automatically tracks abandoned carts and enables recovery campaigns. Configuration is available in your Ozzyl dashboard.', 'ozzyl-commerce' ); ?>
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
		return [
			'carts_tracked'   => 0,
			'carts_recovered' => 0,
		];
	}
}

// Register the module.
$core = Ozzyl_Core::instance();
$core->register_module( new Ozzyl_Module_Abandoned_Cart() );
