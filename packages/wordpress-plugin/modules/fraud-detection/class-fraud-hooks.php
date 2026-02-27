<?php
/**
 * Fraud Detection WooCommerce Hooks
 *
 * Handles COD OTP flow, checkout field rendering, and order meta box display.
 *
 * @package OzzylCommerce\Modules
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fraud Detection Checkout & Admin Hooks
 *
 * @since 1.0.0
 */
class Ozzyl_Fraud_Hooks {

	/**
	 * Constructor — register hooks.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		// Checkout field display.
		add_action( 'woocommerce_checkout_after_order_review', [ $this, 'maybe_show_otp_field' ] );

		// Admin order meta box.
		add_action( 'add_meta_boxes', [ $this, 'register_fraud_meta_box' ] );

		// Enqueue checkout scripts.
		add_action( 'wp_enqueue_scripts', [ $this, 'enqueue_checkout_scripts' ] );
	}

	/**
	 * Show OTP field in checkout for high-risk COD orders.
	 *
	 * Only displays if:
	 * - Payment method is COD
	 * - OTP is enabled in settings
	 * - Order is marked for verification
	 *
	 * @since 1.0.0
	 */
	public function maybe_show_otp_field(): void {
		if ( ! is_checkout() ) {
			return;
		}

		// Check if payment method is COD.
		$chosen_method = WC()->session->get( 'chosen_payment_method' );
		if ( 'cod' !== $chosen_method ) {
			return;
		}

		// Check if OTP verification is enabled.
		$otp_enabled = get_option( 'ozzyl_fraud_otp_enabled' );
		if ( ! $otp_enabled ) {
			return;
		}

		// If this was flagged for verification, show the field.
		// (In a real scenario, this would be checked against current cart/order context)
		?>
		<div id="ozzyl-otp-field" style="display: none;" class="woocommerce-form__group">
			<p class="form-row">
				<label for="ozzyl_otp">
					<?php esc_html_e( 'Enter verification code sent to your phone:', 'ozzyl-commerce' ); ?>
				</label>
				<input
					type="text"
					class="input-text"
					name="ozzyl_otp"
					id="ozzyl_otp"
					placeholder="<?php esc_attr_e( 'Enter OTP', 'ozzyl-commerce' ); ?>"
					autocomplete="off"
				/>
			</p>
			<p id="ozzyl-otp-timer" class="description" style="text-align: center;">
				<?php esc_html_e( 'OTP expires in 10 minutes', 'ozzyl-commerce' ); ?>
			</p>
			<button
				type="button"
				id="ozzyl-otp-resend"
				class="button"
				style="width: 100%; margin-top: 10px;"
			>
				<?php esc_html_e( 'Resend OTP', 'ozzyl-commerce' ); ?>
			</button>
		</div>
		<?php
	}

	/**
	 * Register fraud detection meta box in WooCommerce order admin.
	 *
	 * @since 1.0.0
	 */
	public function register_fraud_meta_box(): void {
		if ( ! function_exists( 'wc_get_order' ) ) {
			return;
		}

		add_meta_box(
			'ozzyl_fraud_detection',
			__( 'Ozzyl Fraud Detection', 'ozzyl-commerce' ),
			[ $this, 'render_fraud_meta_box' ],
			'woocommerce_page_wc-orders',
			'side',
			'high'
		);
	}

	/**
	 * Render fraud detection meta box content.
	 *
	 * Shows risk score badge, signals, and action buttons.
	 *
	 * @since 1.0.0
	 * @param WC_Order $order Order object.
	 */
	public function render_fraud_meta_box( WC_Order $order ): void {
		require OZZYL_PLUGIN_DIR . 'modules/fraud-detection/views/fraud-meta-box.php';
	}

	/**
	 * Enqueue checkout scripts for OTP handling.
	 *
	 * @since 1.0.0
	 */
	public function enqueue_checkout_scripts(): void {
		if ( ! is_checkout() ) {
			return;
		}

		wp_enqueue_script(
			'ozzyl-fraud-checkout',
			OZZYL_PLUGIN_URL . 'modules/fraud-detection/assets/checkout.js',
			[ 'jquery' ],
			OZZYL_VERSION,
			true
		);

		wp_localize_script(
			'ozzyl-fraud-checkout',
			'ozzylFraudData',
			[
				'ajaxUrl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( 'ozzyl_fraud_nonce' ),
				'restUrl' => rest_url( 'ozzyl/v1/fraud/otp/verify' ),
			]
		);
	}
}

// Instantiate hooks if fraud module is active.
if ( get_option( 'ozzyl_module_fraud-detection_enabled' ) ) {
	new Ozzyl_Fraud_Hooks();
}
