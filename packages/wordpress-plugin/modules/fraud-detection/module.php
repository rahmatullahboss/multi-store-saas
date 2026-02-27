<?php
/**
 * Fraud Detection Module
 *
 * CRITICAL: This module checks the `decision` field (NOT `success`).
 * Maps fraud decisions to WooCommerce order actions with XSS prevention.
 *
 * @package OzzylCommerce\Modules
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fraud Detection Module
 *
 * @since 1.0.0
 */
class Ozzyl_Module_Fraud_Detection implements OzzylModuleInterface {

	/**
	 * Get the module ID.
	 *
	 * @since 1.0.0
	 */
	public function get_id(): string {
		return 'fraud-detection';
	}

	/**
	 * Get the module name.
	 *
	 * @since 1.0.0
	 */
	public function get_name(): string {
		return __( 'Fraud Detection', 'ozzyl-commerce' );
	}

	/**
	 * Get the module icon.
	 *
	 * @since 1.0.0
	 */
	public function get_icon(): string {
		return '🛡️';
	}

	/**
	 * Get the module description.
	 *
	 * @since 1.0.0
	 */
	public function get_description(): string {
		return __( 'Detect fraudulent orders and verify high-risk purchases with OTP for Cash-on-Delivery (COD) orders.', 'ozzyl-commerce' );
	}

	/**
	 * Get the required API scope.
	 *
	 * @since 1.0.0
	 */
	public function get_required_scope(): string {
		return 'fraud';
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
	 * Registers WooCommerce hooks for fraud checking and COD OTP verification.
	 *
	 * @since 1.0.0
	 */
	public function activate(): void {
		// Hook into order creation (async, NOT checkout_process).
		add_action(
			'woocommerce_checkout_order_created',
			[ $this, 'check_order_fraud' ],
			10,
			1
		);

		// Hook for COD OTP verification endpoint.
		add_action(
			'rest_api_init',
			[ $this, 'register_otp_endpoint' ]
		);

		Ozzyl_Logger::info( 'Fraud Detection module activated' );
	}

	/**
	 * Deactivate the module.
	 *
	 * Removes all registered hooks.
	 *
	 * @since 1.0.0
	 */
	public function deactivate(): void {
		remove_action(
			'woocommerce_checkout_order_created',
			[ $this, 'check_order_fraud' ]
		);

		remove_action(
			'rest_api_init',
			[ $this, 'register_otp_endpoint' ]
		);

		// Clear any transients.
		// (Implement if using temporary fraud score caches.)

		Ozzyl_Logger::info( 'Fraud Detection module deactivated' );
	}

	/**
	 * Check an order for fraud.
	 *
	 * Called on woocommerce_checkout_order_created.
	 * Calls the Ozzyl API to evaluate risk, then takes action based on decision.
	 *
	 * CRITICAL FIX: Check `$result['decision']` NOT `$result['success']`.
	 * The API returns a `decision` field, not `success`.
	 *
	 * Decision values:
	 *   - 'allow'   → Proceed silently
	 *   - 'verify'  → Trigger COD OTP flow
	 *   - 'hold'    → Set order to 'on-hold' with note
	 *   - 'block'   → Cancel order, notify merchant
	 *
	 * @since 1.0.0
	 * @param WC_Order $order Order object.
	 */
	public function check_order_fraud( WC_Order $order ): void {
		// Only check for cash-on-delivery or if explicitly enabled for all methods.
		$payment_method = $order->get_payment_method();
		$check_all_methods = (bool) get_option( 'ozzyl_fraud_check_all_methods', false );

		if ( 'cod' !== $payment_method && ! $check_all_methods ) {
			return;
		}

		// Get API client.
		$core = Ozzyl_Core::instance();
		$api  = $core->get_api();

		// Prepare order data for fraud check.
		$order_data = [
			'order_id'       => $order->get_id(),
			'customer_email' => $order->get_billing_email(),
			'customer_phone' => $order->get_billing_phone(),
			'total'          => (float) $order->get_total(),
			'items_count'    => count( $order->get_items() ),
			'payment_method' => $payment_method,
		];

		// Call fraud check API (POST /api/v1/fraud/check).
		$result = $api->request( 'POST', '/fraud/check', $order_data );

		// Handle API errors with fail-closed default.
		if ( is_wp_error( $result ) ) {
			$fail_closed = get_option( 'ozzyl_fraud_fail_closed', '1' );
			$decision = $fail_closed ? 'hold' : 'allow';

			Ozzyl_Logger::warning(
				'Fraud check API error',
				[
					'order_id' => $order->get_id(),
					'error' => $result->get_error_message(),
					'defaulting_to' => $decision,
				]
			);

			if ( 'hold' === $decision ) {
				$this->hold_order( $order, 'API error — order held for manual review.' );
			}
			return;
		}

		// CRITICAL: Check the `decision` field, NOT `success`.
		$decision = $result['decision'] ?? 'hold';

		// Store fraud data in order meta for admin inspection.
		$order->update_meta_data( '_ozzyl_fraud_decision', $decision );
		$order->update_meta_data( '_ozzyl_fraud_score', (int) ( $result['score'] ?? 0 ) );
		$order->update_meta_data( '_ozzyl_fraud_signals', array_values( $result['signals'] ?? [] ) );
		$order->save();

		Ozzyl_Logger::info(
			'Fraud check completed',
			[
				'order_id' => $order->get_id(),
				'decision' => $decision,
				'score' => $result['score'] ?? 0,
			]
		);

		// Take action based on decision.
		switch ( $decision ) {
			case 'allow':
				// Proceed silently.
				break;

			case 'verify':
				// Trigger COD OTP flow (implementation in class-fraud-hooks.php).
				do_action( 'ozzyl_fraud_trigger_otp', $order );
				break;

			case 'hold':
				$signals = $result['signals'] ?? [];
				$this->hold_order( $order, $signals );
				break;

			case 'block':
				$signals = $result['signals'] ?? [];
				$this->block_order( $order, $signals );
				break;

			default:
				Ozzyl_Logger::warning( 'Unknown fraud decision', [ 'decision' => $decision ] );
				$this->hold_order( $order, 'Unknown fraud decision.' );
		}
	}

	/**
	 * Put an order on hold with a note explaining the fraud signals.
	 *
	 * @since 1.0.0
	 * @param WC_Order           $order   Order object.
	 * @param array<string>|string $signals Fraud signals (array or plain string).
	 */
	private function hold_order( WC_Order $order, $signals ): void {
		$order->set_status( 'on-hold' );

		// Format note with escaped signals.
		$note = __( 'Order placed on hold by Fraud Detection: ', 'ozzyl-commerce' );

		if ( is_array( $signals ) ) {
			$escaped_signals = array_map( 'esc_html', $signals );
			$note .= implode( ', ', $escaped_signals );
		} else {
			$note .= esc_html( $signals );
		}

		$order->add_order_note( $note, 0, true );
		$order->save();

		Ozzyl_Logger::info( 'Order placed on hold', [ 'order_id' => $order->get_id() ] );
	}

	/**
	 * Block an order and cancel it.
	 *
	 * @since 1.0.0
	 * @param WC_Order        $order   Order object.
	 * @param array<string>|string $signals Fraud signals.
	 */
	private function block_order( WC_Order $order, $signals ): void {
		$order->set_status( 'cancelled' );

		// Format note with escaped signals.
		$note = __( 'Order cancelled by Fraud Detection: ', 'ozzyl-commerce' );

		if ( is_array( $signals ) ) {
			$escaped_signals = array_map( 'esc_html', $signals );
			$note .= implode( ', ', $escaped_signals );
		} else {
			$note .= esc_html( $signals );
		}

		$order->add_order_note( $note, 0, true );
		$order->save();

		// Send notification to merchant/admin.
		do_action( 'ozzyl_fraud_order_blocked', $order );

		Ozzyl_Logger::error( 'Order blocked by fraud detection', [ 'order_id' => $order->get_id() ] );
	}

	/**
	 * Register REST endpoint for COD OTP verification.
	 *
	 * Endpoint: POST /wp-json/ozzyl/v1/fraud/otp/verify
	 *
	 * @since 1.0.0
	 */
	public function register_otp_endpoint(): void {
		register_rest_route(
			'ozzyl/v1',
			'/fraud/otp/verify',
			[
				'methods'             => 'POST',
				'callback'            => [ $this, 'handle_otp_verify' ],
				'permission_callback' => '__return_true', // Allow unauthenticated (frontend checkout)
				'args'                => [
					'order_id' => [
						'type'     => 'integer',
						'required' => true,
					],
					'otp'      => [
						'type'     => 'string',
						'required' => true,
					],
				],
			]
		);
	}

	/**
	 * Handle COD OTP verification request.
	 *
	 * Proxies to Ozzyl API and returns the result.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request REST request object.
	 * @return WP_REST_Response
	 */
	public function handle_otp_verify( WP_REST_Request $request ): WP_REST_Response {
		$order_id = (int) $request->get_param( 'order_id' );
		$otp      = sanitize_text_field( $request->get_param( 'otp' ) );

		$order = wc_get_order( $order_id );
		if ( ! $order ) {
			return new WP_REST_Response(
				[ 'success' => false, 'message' => 'Order not found.' ],
				404
			);
		}

		// Proxy to Ozzyl API.
		$core   = Ozzyl_Core::instance();
		$api    = $core->get_api();
		$result = $api->request( 'POST', '/fraud/otp/verify', [
			'order_id' => $order_id,
			'otp'      => $otp,
		] );

		if ( is_wp_error( $result ) ) {
			return new WP_REST_Response(
				[ 'success' => false, 'message' => $result->get_error_message() ],
				400
			);
		}

		// Update order meta with verification result.
		$order->update_meta_data( '_ozzyl_otp_verified', true );
		$order->add_order_note( __( 'COD OTP verified', 'ozzyl-commerce' ), 0, true );
		$order->save();

		return new WP_REST_Response( [ 'success' => true, 'data' => $result ] );
	}

	/**
	 * Render module settings form.
	 *
	 * @since 1.0.0
	 */
	public function render_settings(): void {
		?>
		<div class="ozzyl-module-settings">
			<h3><?php esc_html_e( 'Fraud Detection Settings', 'ozzyl-commerce' ); ?></h3>
			<form method="post" action="options.php">
				<?php wp_nonce_field( 'ozzyl_fraud_settings_nonce' ); ?>

				<table class="form-table">
					<tr>
						<th scope="row">
							<label for="ozzyl_fraud_check_all_methods">
								<?php esc_html_e( 'Check All Payment Methods', 'ozzyl-commerce' ); ?>
							</label>
						</th>
						<td>
							<input
								type="checkbox"
								id="ozzyl_fraud_check_all_methods"
								name="ozzyl_fraud_check_all_methods"
								value="1"
								<?php checked( get_option( 'ozzyl_fraud_check_all_methods' ), '1' ); ?>
							/>
							<p class="description">
								<?php esc_html_e( 'By default, fraud checks only run for COD orders. Enable this to check all payment methods.', 'ozzyl-commerce' ); ?>
							</p>
						</td>
					</tr>

					<tr>
						<th scope="row">
							<label for="ozzyl_fraud_fail_closed">
								<?php esc_html_e( 'Fail-Closed Strategy', 'ozzyl-commerce' ); ?>
							</label>
						</th>
						<td>
							<input
								type="checkbox"
								id="ozzyl_fraud_fail_closed"
								name="ozzyl_fraud_fail_closed"
								value="1"
								<?php checked( get_option( 'ozzyl_fraud_fail_closed', '1' ), '1' ); ?>
							/>
							<p class="description">
								<?php esc_html_e( 'If enabled (recommended), orders are placed on hold when the fraud check API is unavailable. If disabled, orders proceed automatically on API timeout.', 'ozzyl-commerce' ); ?>
							</p>
						</td>
					</tr>

					<tr>
						<th scope="row">
							<label for="ozzyl_fraud_otp_enabled">
								<?php esc_html_e( 'Enable COD OTP Verification', 'ozzyl-commerce' ); ?>
							</label>
						</th>
						<td>
							<input
								type="checkbox"
								id="ozzyl_fraud_otp_enabled"
								name="ozzyl_fraud_otp_enabled"
								value="1"
								<?php checked( get_option( 'ozzyl_fraud_otp_enabled' ), '1' ); ?>
							/>
							<p class="description">
								<?php esc_html_e( 'When enabled, customers placing high-risk COD orders must verify with a one-time password (OTP).', 'ozzyl-commerce' ); ?>
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

		// Count orders on hold due to fraud.
		$held_count = $wpdb->get_var(
			"SELECT COUNT(*) FROM {$wpdb->postmeta}
			 WHERE meta_key = '_ozzyl_fraud_decision'
			 AND meta_value = 'hold'"
		);

		// Count orders blocked.
		$blocked_count = $wpdb->get_var(
			"SELECT COUNT(*) FROM {$wpdb->postmeta}
			 WHERE meta_key = '_ozzyl_fraud_decision'
			 AND meta_value = 'block'"
		);

		return [
			'orders_held'   => (int) $held_count,
			'orders_blocked' => (int) $blocked_count,
			'total_checked' => (int) $held_count + (int) $blocked_count,
		];
	}
}

// Register the module.
$core = Ozzyl_Core::instance();
$core->register_module( new Ozzyl_Module_Fraud_Detection() );
