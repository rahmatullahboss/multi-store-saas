<?php
/**
 * SMS Notifications Module
 *
 * Sends transactional and marketing SMS to customers at key order events.
 *
 * @package OzzylCommerce\Modules
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * SMS Notifications Module
 *
 * @since 1.0.0
 */
class Ozzyl_Module_SMS_Notifications implements OzzylModuleInterface {

	/**
	 * Get the module ID.
	 *
	 * @since 1.0.0
	 */
	public function get_id(): string {
		return 'sms-notifications';
	}

	/**
	 * Get the module name.
	 *
	 * @since 1.0.0
	 */
	public function get_name(): string {
		return __( 'SMS Notifications', 'ozzyl-commerce' );
	}

	/**
	 * Get the module icon.
	 *
	 * @since 1.0.0
	 */
	public function get_icon(): string {
		return '💬';
	}

	/**
	 * Get the module description.
	 *
	 * @since 1.0.0
	 */
	public function get_description(): string {
		return __( 'Send transactional SMS notifications to customers for order confirmations, shipments, and deliveries.', 'ozzyl-commerce' );
	}

	/**
	 * Get the required API scope.
	 *
	 * @since 1.0.0
	 */
	public function get_required_scope(): string {
		return 'sms';
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
		add_action( 'woocommerce_checkout_order_processed', [ $this, 'send_order_placed_sms' ], 10, 3 );
		add_action( 'woocommerce_order_status_processing', [ $this, 'send_order_confirmed_sms' ], 10, 1 );
		add_action( 'woocommerce_order_status_completed', [ $this, 'send_order_delivered_sms' ], 10, 1 );
		add_action( 'ozzyl_courier_booked', [ $this, 'send_courier_booked_sms' ], 10, 1 );

		Ozzyl_Logger::info( 'SMS Notifications module activated' );
	}

	/**
	 * Deactivate the module.
	 *
	 * @since 1.0.0
	 */
	public function deactivate(): void {
		remove_action( 'woocommerce_checkout_order_processed', [ $this, 'send_order_placed_sms' ] );
		remove_action( 'woocommerce_order_status_processing', [ $this, 'send_order_confirmed_sms' ] );
		remove_action( 'woocommerce_order_status_completed', [ $this, 'send_order_delivered_sms' ] );
		remove_action( 'ozzyl_courier_booked', [ $this, 'send_courier_booked_sms' ] );

		Ozzyl_Logger::info( 'SMS Notifications module deactivated' );
	}

	/**
	 * Send SMS when order is placed.
	 *
	 * @since 1.0.0
	 * @param int   $order_id Order ID.
	 * @param array $posted_data Posted form data.
	 * @param WC_Order $order Order object.
	 */
	public function send_order_placed_sms( int $order_id, array $posted_data, WC_Order $order ): void {
		if ( ! $this->is_trigger_enabled( 'order_placed' ) ) {
			return;
		}

		$this->send_sms( $order, 'order_placed' );
	}

	/**
	 * Send SMS when order is confirmed (processing).
	 *
	 * @since 1.0.0
	 * @param int $order_id Order ID.
	 */
	public function send_order_confirmed_sms( int $order_id ): void {
		if ( ! $this->is_trigger_enabled( 'order_confirmed' ) ) {
			return;
		}

		$order = wc_get_order( $order_id );
		if ( $order ) {
			$this->send_sms( $order, 'order_confirmed' );
		}
	}

	/**
	 * Send SMS when order is delivered.
	 *
	 * @since 1.0.0
	 * @param int $order_id Order ID.
	 */
	public function send_order_delivered_sms( int $order_id ): void {
		if ( ! $this->is_trigger_enabled( 'order_delivered' ) ) {
			return;
		}

		$order = wc_get_order( $order_id );
		if ( $order ) {
			$this->send_sms( $order, 'order_delivered' );
		}
	}

	/**
	 * Send SMS when courier is booked.
	 *
	 * @since 1.0.0
	 * @param WC_Order $order Order object.
	 */
	public function send_courier_booked_sms( WC_Order $order ): void {
		if ( ! $this->is_trigger_enabled( 'courier_booked' ) ) {
			return;
		}

		$this->send_sms( $order, 'courier_booked' );
	}

	/**
	 * Send SMS to order customer.
	 *
	 * @since 1.0.0
	 * @param WC_Order $order Order object.
	 * @param string   $trigger SMS trigger type.
	 */
	private function send_sms( WC_Order $order, string $trigger ): void {
		$phone = $order->get_billing_phone();
		if ( empty( $phone ) ) {
			Ozzyl_Logger::warning( 'No phone number for SMS', [ 'order_id' => $order->get_id() ] );
			return;
		}

		// Normalize phone number.
		$phone = $this->normalize_phone( $phone );

		$core = Ozzyl_Core::instance();
		$api  = $core->get_api();

		$result = $api->request( 'POST', '/sms/send', [
			'phone'   => $phone,
			'type'    => 'transactional', // or 'marketing'
			'trigger' => $trigger,
			'order_id' => $order->get_id(),
		] );

		if ( is_wp_error( $result ) ) {
			Ozzyl_Logger::warning(
				'SMS send failed',
				[
					'order_id' => $order->get_id(),
					'phone' => $this->mask_phone( $phone ),
					'error' => $result->get_error_message(),
				]
			);
		} else {
			Ozzyl_Logger::info(
				'SMS sent',
				[
					'order_id' => $order->get_id(),
					'trigger' => $trigger,
					'phone' => $this->mask_phone( $phone ),
				]
			);
		}
	}

	/**
	 * Check if a trigger is enabled in settings.
	 *
	 * @since 1.0.0
	 * @param string $trigger Trigger name.
	 * @return bool
	 */
	private function is_trigger_enabled( string $trigger ): bool {
		return (bool) get_option( 'ozzyl_sms_trigger_' . $trigger, '1' );
	}

	/**
	 * Normalize phone number (simple format: remove spaces/dashes).
	 *
	 * @since 1.0.0
	 * @param string $phone Phone number.
	 * @return string Normalized phone.
	 */
	private function normalize_phone( string $phone ): string {
		return preg_replace( '/[^0-9+]/', '', $phone );
	}

	/**
	 * Mask phone number for logging (privacy).
	 *
	 * @since 1.0.0
	 * @param string $phone Phone number.
	 * @return string Masked phone (e.g., +880...1234).
	 */
	private function mask_phone( string $phone ): string {
		if ( strlen( $phone ) > 5 ) {
			return substr( $phone, 0, -4 ) . '****';
		}
		return '****';
	}

	/**
	 * Render module settings form.
	 *
	 * @since 1.0.0
	 */
	public function render_settings(): void {
		?>
		<div class="ozzyl-module-settings">
			<h3><?php esc_html_e( 'SMS Notification Triggers', 'ozzyl-commerce' ); ?></h3>
			<form method="post" action="options.php">
				<?php wp_nonce_field( 'ozzyl_sms_settings_nonce' ); ?>

				<table class="form-table">
					<tr>
						<th scope="row">
							<?php esc_html_e( 'Enable SMS for:', 'ozzyl-commerce' ); ?>
						</th>
						<td>
							<label>
								<input
									type="checkbox"
									name="ozzyl_sms_trigger_order_placed"
									value="1"
									<?php checked( get_option( 'ozzyl_sms_trigger_order_placed', '1' ), '1' ); ?>
								/>
								<?php esc_html_e( 'Order Placed', 'ozzyl-commerce' ); ?>
							</label><br />

							<label>
								<input
									type="checkbox"
									name="ozzyl_sms_trigger_order_confirmed"
									value="1"
									<?php checked( get_option( 'ozzyl_sms_trigger_order_confirmed', '1' ), '1' ); ?>
								/>
								<?php esc_html_e( 'Order Confirmed (Processing)', 'ozzyl-commerce' ); ?>
							</label><br />

							<label>
								<input
									type="checkbox"
									name="ozzyl_sms_trigger_courier_booked"
									value="1"
									<?php checked( get_option( 'ozzyl_sms_trigger_courier_booked', '1' ), '1' ); ?>
								/>
								<?php esc_html_e( 'Courier Booked', 'ozzyl-commerce' ); ?>
							</label><br />

							<label>
								<input
									type="checkbox"
									name="ozzyl_sms_trigger_order_delivered"
									value="1"
									<?php checked( get_option( 'ozzyl_sms_trigger_order_delivered', '1' ), '1' ); ?>
								/>
								<?php esc_html_e( 'Order Delivered', 'ozzyl-commerce' ); ?>
							</label>
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
		// In a real implementation, you'd count SMS sent from order notes or a dedicated log table.
		return [
			'sms_sent' => 0,
		];
	}
}

// Register the module.
$core = Ozzyl_Core::instance();
$core->register_module( new Ozzyl_Module_SMS_Notifications() );
