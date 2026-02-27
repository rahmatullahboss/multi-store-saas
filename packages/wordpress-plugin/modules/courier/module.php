<?php
/**
 * Courier Module
 *
 * Auto-dispatch orders to courier providers.
 *
 * @package OzzylCommerce\Modules
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Courier Module
 *
 * @since 1.0.0
 */
class Ozzyl_Module_Courier implements OzzylModuleInterface {

	/**
	 * Get the module ID.
	 *
	 * @since 1.0.0
	 */
	public function get_id(): string {
		return 'courier';
	}

	/**
	 * Get the module name.
	 *
	 * @since 1.0.0
	 */
	public function get_name(): string {
		return __( 'Courier Integration', 'ozzyl-commerce' );
	}

	/**
	 * Get the module icon.
	 *
	 * @since 1.0.0
	 */
	public function get_icon(): string {
		return '🚚';
	}

	/**
	 * Get the module description.
	 *
	 * @since 1.0.0
	 */
	public function get_description(): string {
		return __( 'Automatically dispatch orders to courier providers and track shipments.', 'ozzyl-commerce' );
	}

	/**
	 * Get the required API scope.
	 *
	 * @since 1.0.0
	 */
	public function get_required_scope(): string {
		return 'courier';
	}

	/**
	 * Get the minimum plan tier.
	 *
	 * @since 1.0.0
	 */
	public function get_min_plan(): string {
		return 'starter';
	}

	/**
	 * Activate the module.
	 *
	 * @since 1.0.0
	 */
	public function activate(): void {
		add_action( 'woocommerce_order_status_processing', [ $this, 'auto_dispatch_order' ], 10, 1 );
		add_action( 'add_meta_boxes', [ $this, 'register_courier_meta_box' ] );

		Ozzyl_Logger::info( 'Courier module activated' );
	}

	/**
	 * Deactivate the module.
	 *
	 * @since 1.0.0
	 */
	public function deactivate(): void {
		remove_action( 'woocommerce_order_status_processing', [ $this, 'auto_dispatch_order' ] );
		remove_action( 'add_meta_boxes', [ $this, 'register_courier_meta_box' ] );

		Ozzyl_Logger::info( 'Courier module deactivated' );
	}

	/**
	 * Auto-dispatch order to courier.
	 *
	 * Called on woocommerce_order_status_processing.
	 * Checks for idempotency (consignment already booked) before dispatching.
	 *
	 * @since 1.0.0
	 * @param int $order_id Order ID.
	 */
	public function auto_dispatch_order( int $order_id ): void {
		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return;
		}

		// Check idempotency: has this order already been dispatched?
		$consignment_id = $order->get_meta( '_ozzyl_courier_consignment_id' );
		if ( ! empty( $consignment_id ) ) {
			Ozzyl_Logger::info(
				'Order already dispatched',
				[ 'order_id' => $order_id, 'consignment_id' => $consignment_id ]
			);
			return;
		}

		// Check if auto-dispatch is enabled.
		$auto_dispatch = get_option( 'ozzyl_courier_auto_dispatch', '1' );
		if ( ! $auto_dispatch ) {
			return;
		}

		// Get configured default courier.
		$default_courier = get_option( 'ozzyl_courier_default', '' );
		if ( empty( $default_courier ) ) {
			Ozzyl_Logger::warning(
				'No default courier configured',
				[ 'order_id' => $order_id ]
			);
			return;
		}

		// Prepare order data for dispatch.
		$order_data = [
			'order_id'        => $order->get_id(),
			'customer_name'   => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name(),
			'customer_phone'  => $order->get_billing_phone(),
			'customer_email'  => $order->get_billing_email(),
			'delivery_address' => $order->get_formatted_billing_address(),
			'total_amount'    => (float) $order->get_total(),
			'items_count'     => count( $order->get_items() ),
			'courier'         => $default_courier,
		];

		// Call API to book courier.
		$core   = Ozzyl_Core::instance();
		$api    = $core->get_api();
		$result = $api->request( 'POST', '/courier/book', $order_data );

		if ( is_wp_error( $result ) ) {
			$order->add_order_note(
				sprintf(
					'⚠️ %s: %s',
					__( 'Courier booking failed', 'ozzyl-commerce' ),
					esc_html( $result->get_error_message() )
				),
				0,
				true
			);
			Ozzyl_Logger::error(
				'Courier booking failed',
				[ 'order_id' => $order_id, 'error' => $result->get_error_message() ]
			);
			return;
		}

		// Save consignment ID.
		$consignment_id = $result['consignment_id'] ?? null;
		if ( $consignment_id ) {
			$order->update_meta_data( '_ozzyl_courier_consignment_id', $consignment_id );
			$order->update_meta_data( '_ozzyl_courier_name', $default_courier );
			$order->save();

			$order->add_order_note(
				sprintf(
					'✅ %s: %s (#%s)',
					esc_html( $default_courier ),
					__( 'Consignment booked', 'ozzyl-commerce' ),
					esc_html( $consignment_id )
				),
				0,
				true
			);

			do_action( 'ozzyl_courier_booked', $order );

			Ozzyl_Logger::info(
				'Order dispatched',
				[ 'order_id' => $order_id, 'consignment_id' => $consignment_id, 'courier' => $default_courier ]
			);
		}
	}

	/**
	 * Register courier meta box in WC order admin.
	 *
	 * @since 1.0.0
	 */
	public function register_courier_meta_box(): void {
		if ( ! function_exists( 'wc_get_order' ) ) {
			return;
		}

		add_meta_box(
			'ozzyl_courier',
			__( 'Ozzyl Courier', 'ozzyl-commerce' ),
			[ $this, 'render_courier_meta_box' ],
			'woocommerce_page_wc-orders',
			'side',
			'high'
		);
	}

	/**
	 * Render courier meta box.
	 *
	 * @since 1.0.0
	 * @param WC_Order $order Order object.
	 */
	public function render_courier_meta_box( WC_Order $order ): void {
		require OZZYL_PLUGIN_DIR . 'modules/courier/views/courier-meta-box.php';
	}

	/**
	 * Render module settings form.
	 *
	 * @since 1.0.0
	 */
	public function render_settings(): void {
		?>
		<div class="ozzyl-module-settings">
			<h3><?php esc_html_e( 'Courier Settings', 'ozzyl-commerce' ); ?></h3>
			<form method="post" action="options.php">
				<?php wp_nonce_field( 'ozzyl_courier_settings_nonce' ); ?>

				<table class="form-table">
					<tr>
						<th scope="row">
							<label for="ozzyl_courier_auto_dispatch">
								<?php esc_html_e( 'Auto-Dispatch Orders', 'ozzyl-commerce' ); ?>
							</label>
						</th>
						<td>
							<input
								type="checkbox"
								id="ozzyl_courier_auto_dispatch"
								name="ozzyl_courier_auto_dispatch"
								value="1"
								<?php checked( get_option( 'ozzyl_courier_auto_dispatch', '1' ), '1' ); ?>
							/>
							<p class="description">
								<?php esc_html_e( 'Automatically book courier when order status changes to Processing.', 'ozzyl-commerce' ); ?>
							</p>
						</td>
					</tr>

					<tr>
						<th scope="row">
							<label for="ozzyl_courier_default">
								<?php esc_html_e( 'Default Courier', 'ozzyl-commerce' ); ?>
							</label>
						</th>
						<td>
							<input
								type="text"
								id="ozzyl_courier_default"
								name="ozzyl_courier_default"
								value="<?php echo esc_attr( get_option( 'ozzyl_courier_default', '' ) ); ?>"
								placeholder="e.g., pathao, redx, steadfast"
								class="regular-text"
							/>
							<p class="description">
								<?php esc_html_e( 'Default courier provider for auto-dispatch.', 'ozzyl-commerce' ); ?>
							</p>
						</td>
					</tr>
				</table>

				<?php submit_button(); ?>
			</form>
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

		$dispatched = $wpdb->get_var(
			"SELECT COUNT(*) FROM {$wpdb->postmeta}
			 WHERE meta_key = '_ozzyl_courier_consignment_id'"
		);

		return [
			'orders_dispatched' => (int) $dispatched,
		];
	}
}

// Register the module.
$core = Ozzyl_Core::instance();
$core->register_module( new Ozzyl_Module_Courier() );
