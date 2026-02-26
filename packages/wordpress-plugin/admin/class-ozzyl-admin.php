<?php
/**
 * Ozzyl Admin — Settings pages and admin UI
 *
 * Registers the Settings → Ozzyl Commerce admin menu page, handles form
 * submissions, enqueues admin assets, and provides AJAX endpoints used by
 * the settings JS (test connection, register webhook, manual sync).
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ozzyl_Admin — admin settings page and REST/AJAX handlers.
 *
 * @since 1.0.0
 */
class Ozzyl_Admin {

	/** @var Ozzyl_API API client. */
	private Ozzyl_API $api;

	/** @var Ozzyl_Auth Auth / key manager. */
	private Ozzyl_Auth $auth;

	/** @var string Settings page slug. */
	private const PAGE_SLUG = 'ozzyl-commerce';

	/** @var string Option group for settings API. */
	private const OPTION_GROUP = 'ozzyl_settings';

	// ── Constructor ───────────────────────────────────────────────────────────

	/**
	 * Wire up admin hooks.
	 *
	 * @since 1.0.0
	 * @param Ozzyl_API  $api  Initialised API client.
	 * @param Ozzyl_Auth $auth Auth manager.
	 */
	public function __construct( Ozzyl_API $api, Ozzyl_Auth $auth ) {
		$this->api  = $api;
		$this->auth = $auth;

		add_action( 'admin_menu',            array( $this, 'register_menu' ) );
		add_action( 'admin_init',            array( $this, 'register_settings' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'rest_api_init',         array( $this, 'register_admin_rest_routes' ) );
	}

	// ── Menu ──────────────────────────────────────────────────────────────────

	/**
	 * Register the Settings sub-menu page.
	 *
	 * @since 1.0.0
	 */
	public function register_menu(): void {
		add_options_page(
			__( 'Ozzyl Commerce', 'ozzyl-commerce' ),
			__( 'Ozzyl Commerce', 'ozzyl-commerce' ),
			'manage_options',
			self::PAGE_SLUG,
			array( $this, 'render_settings_page' )
		);
	}

	// ── Settings API registration ─────────────────────────────────────────────

	/**
	 * Register settings, sections, and fields via the WordPress Settings API.
	 *
	 * @since 1.0.0
	 */
	public function register_settings(): void {
		// Register option names so they can be saved via options.php.
		register_setting( self::OPTION_GROUP, 'ozzyl_api_key',      [ 'sanitize_callback' => array( $this, 'sanitize_api_key' ) ] );
		register_setting( self::OPTION_GROUP, 'ozzyl_sync_enabled', [ 'sanitize_callback' => 'absint' ] );
		register_setting( self::OPTION_GROUP, 'ozzyl_sync_auto',    [ 'sanitize_callback' => 'absint' ] );

		// ── Section: API Connection ──────────────────────────────────────────
		add_settings_section(
			'ozzyl_section_api',
			__( 'API Connection', 'ozzyl-commerce' ),
			array( $this, 'render_section_api' ),
			self::PAGE_SLUG
		);

		add_settings_field(
			'ozzyl_api_key',
			__( 'API Key', 'ozzyl-commerce' ),
			array( $this, 'render_field_api_key' ),
			self::PAGE_SLUG,
			'ozzyl_section_api'
		);

		add_settings_field(
			'ozzyl_connection_status',
			__( 'Connection Status', 'ozzyl-commerce' ),
			array( $this, 'render_field_connection_status' ),
			self::PAGE_SLUG,
			'ozzyl_section_api'
		);

		add_settings_field(
			'ozzyl_webhook_url',
			__( 'Webhook URL', 'ozzyl-commerce' ),
			array( $this, 'render_field_webhook_url' ),
			self::PAGE_SLUG,
			'ozzyl_section_api'
		);

		// ── Section: WooCommerce Sync ────────────────────────────────────────
		add_settings_section(
			'ozzyl_section_sync',
			__( 'WooCommerce Sync', 'ozzyl-commerce' ),
			array( $this, 'render_section_sync' ),
			self::PAGE_SLUG
		);

		add_settings_field(
			'ozzyl_sync_enabled',
			__( 'Enable Sync', 'ozzyl-commerce' ),
			array( $this, 'render_field_sync_enabled' ),
			self::PAGE_SLUG,
			'ozzyl_section_sync'
		);

		add_settings_field(
			'ozzyl_sync_auto',
			__( 'Auto Sync', 'ozzyl-commerce' ),
			array( $this, 'render_field_sync_auto' ),
			self::PAGE_SLUG,
			'ozzyl_section_sync'
		);
	}

	// ── Sanitize callbacks ────────────────────────────────────────────────────

	/**
	 * Sanitize the API key before storing it.
	 *
	 * @since 1.0.0
	 * @param mixed $value Raw input value.
	 * @return string Sanitized API key.
	 */
	public function sanitize_api_key( mixed $value ): string {
		$key = sanitize_text_field( trim( (string) $value ) );

		// If the user submitted the masked placeholder, keep the existing key.
		if ( str_contains( $key, '****' ) ) {
			return (string) get_option( 'ozzyl_api_key', '' );
		}

		if ( ! empty( $key ) && ! str_starts_with( $key, 'sk_live_' ) && ! str_starts_with( $key, 'sk_test_' ) ) {
			add_settings_error(
				'ozzyl_api_key',
				'ozzyl_invalid_key',
				__( 'Invalid API key format. Keys must start with sk_live_ or sk_test_.', 'ozzyl-commerce' ),
				'error'
			);
			return (string) get_option( 'ozzyl_api_key', '' );
		}

		// Update the API client with the new key immediately.
		if ( ! empty( $key ) ) {
			$this->api->set_api_key( $key );
		}

		return $key;
	}

	// ── Asset enqueueing ──────────────────────────────────────────────────────

	/**
	 * Enqueue admin CSS and JS on the plugin settings page only.
	 *
	 * @since 1.0.0
	 * @param string $hook_suffix Current admin page hook suffix.
	 */
	public function enqueue_assets( string $hook_suffix ): void {
		if ( 'settings_page_' . self::PAGE_SLUG !== $hook_suffix ) {
			return;
		}

		wp_enqueue_style(
			'ozzyl-admin',
			OZZYL_PLUGIN_URL . 'admin/assets/admin.css',
			[],
			OZZYL_VERSION
		);

		wp_enqueue_script(
			'ozzyl-admin',
			OZZYL_PLUGIN_URL . 'admin/assets/admin.js',
			[],
			OZZYL_VERSION,
			true
		);

		wp_localize_script(
			'ozzyl-admin',
			'ozzylAdmin',
			[
				'nonce'       => wp_create_nonce( 'wp_rest' ),
				'restUrl'     => rest_url( 'ozzyl/v1' ),
				'ajaxUrl'     => admin_url( 'admin-ajax.php' ),
				'webhookUrl'  => Ozzyl_Webhook::get_webhook_url(),
				'i18n'        => [
					'testing'         => __( 'Testing connection…', 'ozzyl-commerce' ),
					'connected'       => __( 'Connected ✓', 'ozzyl-commerce' ),
					'failed'          => __( 'Connection failed ✗', 'ozzyl-commerce' ),
					'copying'         => __( 'Copied!', 'ozzyl-commerce' ),
					'syncing'         => __( 'Syncing…', 'ozzyl-commerce' ),
					'syncDone'        => __( 'Sync complete.', 'ozzyl-commerce' ),
					'syncFailed'      => __( 'Sync failed.', 'ozzyl-commerce' ),
					'registeringWh'   => __( 'Registering webhook…', 'ozzyl-commerce' ),
					'whRegistered'    => __( 'Webhook registered ✓', 'ozzyl-commerce' ),
					'whFailed'        => __( 'Webhook registration failed.', 'ozzyl-commerce' ),
				],
			]
		);
	}

	// ── Page rendering ────────────────────────────────────────────────────────

	/**
	 * Render the main settings page.
	 *
	 * @since 1.0.0
	 */
	public function render_settings_page(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_die( esc_html__( 'You do not have permission to access this page.', 'ozzyl-commerce' ) );
		}

		// Determine active tab.
		$active_tab = isset( $_GET['tab'] ) ? sanitize_key( $_GET['tab'] ) : 'settings'; // phpcs:ignore WordPress.Security.NonceVerification

		include OZZYL_PLUGIN_DIR . 'admin/views/settings.php';
	}

	// ── Section callbacks ─────────────────────────────────────────────────────

	/**
	 * Render API Connection section description.
	 *
	 * @since 1.0.0
	 */
	public function render_section_api(): void {
		echo '<p>' . esc_html__( 'Enter your Ozzyl API key to connect this WordPress site to your Ozzyl Commerce store.', 'ozzyl-commerce' ) . ' ';
		printf(
			'<a href="%s" target="_blank" rel="noopener noreferrer">%s</a>',
			esc_url( 'https://app.ozzyl.com/settings/developer' ),
			esc_html__( 'Get your API key →', 'ozzyl-commerce' )
		);
		echo '</p>';
	}

	/**
	 * Render WooCommerce Sync section description.
	 *
	 * @since 1.0.0
	 */
	public function render_section_sync(): void {
		if ( ! class_exists( 'WooCommerce' ) ) {
			echo '<p class="ozzyl-notice ozzyl-notice--warning">';
			esc_html_e( 'WooCommerce is not installed or active. Sync features are unavailable.', 'ozzyl-commerce' );
			echo '</p>';
		} else {
			echo '<p>' . esc_html__( 'Configure how WooCommerce products and orders sync with your Ozzyl store.', 'ozzyl-commerce' ) . '</p>';
		}
	}

	// ── Field callbacks ───────────────────────────────────────────────────────

	/**
	 * Render the API Key input field.
	 *
	 * @since 1.0.0
	 */
	public function render_field_api_key(): void {
		$masked = $this->auth->get_masked_api_key();
		$has_key = ! empty( $this->auth->get_api_key() );
		?>
		<div class="ozzyl-field-api-key">
			<input
				type="password"
				id="ozzyl_api_key"
				name="ozzyl_api_key"
				class="regular-text"
				value="<?php echo esc_attr( $has_key ? $masked : '' ); ?>"
				placeholder="<?php esc_attr_e( 'sk_live_...', 'ozzyl-commerce' ); ?>"
				autocomplete="new-password"
				spellcheck="false"
			/>
			<button type="button" id="ozzyl-toggle-key" class="button button-secondary" aria-label="<?php esc_attr_e( 'Toggle API key visibility', 'ozzyl-commerce' ); ?>">
				<?php esc_html_e( 'Show', 'ozzyl-commerce' ); ?>
			</button>
		</div>
		<p class="description">
			<?php
			echo wp_kses(
				sprintf(
					/* translators: Link to Ozzyl developer settings. */
					__( 'Your secret API key from %s. Never share this publicly.', 'ozzyl-commerce' ),
					'<a href="' . esc_url( 'https://app.ozzyl.com/settings/developer' ) . '" target="_blank" rel="noopener noreferrer">app.ozzyl.com</a>'
				),
				[ 'a' => [ 'href' => true, 'target' => true, 'rel' => true ] ]
			);
			?>
		</p>
		<?php
	}

	/**
	 * Render the connection status indicator.
	 *
	 * @since 1.0.0
	 */
	public function render_field_connection_status(): void {
		$has_key = $this->auth->is_api_key_valid();
		?>
		<div class="ozzyl-connection-status" id="ozzyl-connection-status">
			<?php if ( $has_key ) : ?>
				<span class="ozzyl-status-dot ozzyl-status-unknown" id="ozzyl-status-dot"></span>
				<span class="ozzyl-status-text" id="ozzyl-status-text"><?php esc_html_e( 'Not tested yet', 'ozzyl-commerce' ); ?></span>
			<?php else : ?>
				<span class="ozzyl-status-dot ozzyl-status-disconnected"></span>
				<span class="ozzyl-status-text"><?php esc_html_e( 'No API key configured', 'ozzyl-commerce' ); ?></span>
			<?php endif; ?>
		</div>
		<?php if ( $has_key ) : ?>
			<button type="button" id="ozzyl-test-connection" class="button button-secondary" style="margin-top:8px;">
				<?php esc_html_e( 'Test Connection', 'ozzyl-commerce' ); ?>
			</button>
			<span id="ozzyl-test-result" style="margin-left:10px;display:none;"></span>
		<?php endif; ?>
		<?php
	}

	/**
	 * Render the webhook URL field.
	 *
	 * @since 1.0.0
	 */
	public function render_field_webhook_url(): void {
		$url = Ozzyl_Webhook::get_webhook_url();
		?>
		<div class="ozzyl-webhook-url-wrapper">
			<input
				type="text"
				id="ozzyl-webhook-url"
				class="large-text"
				value="<?php echo esc_url( $url ); ?>"
				readonly
				aria-label="<?php esc_attr_e( 'Webhook endpoint URL', 'ozzyl-commerce' ); ?>"
			/>
			<button type="button" id="ozzyl-copy-webhook-url" class="button button-secondary">
				<?php esc_html_e( 'Copy', 'ozzyl-commerce' ); ?>
			</button>
		</div>
		<p class="description">
			<?php esc_html_e( 'Register this URL in your Ozzyl dashboard to receive real-time event notifications.', 'ozzyl-commerce' ); ?>
		</p>
		<?php if ( $this->auth->is_api_key_valid() ) : ?>
			<button type="button" id="ozzyl-register-webhook" class="button button-secondary" style="margin-top:8px;">
				<?php esc_html_e( 'Auto-Register Webhook in Ozzyl', 'ozzyl-commerce' ); ?>
			</button>
			<span id="ozzyl-webhook-result" style="margin-left:10px;display:none;"></span>
		<?php endif; ?>
		<?php
	}

	/**
	 * Render the sync enabled checkbox.
	 *
	 * @since 1.0.0
	 */
	public function render_field_sync_enabled(): void {
		$enabled = $this->auth->is_sync_enabled();
		$wc_active = class_exists( 'WooCommerce' );
		?>
		<label>
			<input
				type="checkbox"
				name="ozzyl_sync_enabled"
				value="1"
				<?php checked( $enabled ); ?>
				<?php disabled( ! $wc_active ); ?>
			/>
			<?php esc_html_e( 'Enable WooCommerce ↔ Ozzyl product and order sync', 'ozzyl-commerce' ); ?>
		</label>
		<?php if ( $wc_active && $enabled ) : ?>
			<div class="ozzyl-sync-actions" style="margin-top:12px;">
				<button type="button" id="ozzyl-import-products" class="button button-secondary">
					<?php esc_html_e( 'Import Products from Ozzyl', 'ozzyl-commerce' ); ?>
				</button>
				<button type="button" id="ozzyl-export-orders" class="button button-secondary" style="margin-left:8px;">
					<?php esc_html_e( 'Export WooCommerce Orders to Ozzyl', 'ozzyl-commerce' ); ?>
				</button>
				<span id="ozzyl-sync-result" style="margin-left:10px;display:none;"></span>
			</div>
		<?php endif; ?>
		<?php
	}

	/**
	 * Render the auto sync checkbox.
	 *
	 * @since 1.0.0
	 */
	public function render_field_sync_auto(): void {
		$enabled   = $this->auth->is_auto_sync_enabled();
		$wc_active = class_exists( 'WooCommerce' );
		?>
		<label>
			<input
				type="checkbox"
				name="ozzyl_sync_auto"
				value="1"
				<?php checked( $enabled ); ?>
				<?php disabled( ! $wc_active ); ?>
			/>
			<?php esc_html_e( 'Automatically sync orders when WooCommerce order status changes', 'ozzyl-commerce' ); ?>
		</label>
		<p class="description">
			<?php esc_html_e( 'When enabled, WooCommerce order events are forwarded to Ozzyl in real time.', 'ozzyl-commerce' ); ?>
		</p>
		<?php
	}

	// ── REST API routes (admin actions) ───────────────────────────────────────

	/**
	 * Register admin-only REST routes used by settings page JS.
	 *
	 * @since 1.0.0
	 */
	public function register_admin_rest_routes(): void {
		// Test connection.
		register_rest_route( 'ozzyl/v1', '/admin/test-connection', [
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'rest_test_connection' ),
			'permission_callback' => array( $this, 'check_admin_permission' ),
		] );

		// Register webhook in Ozzyl.
		register_rest_route( 'ozzyl/v1', '/admin/register-webhook', [
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => array( $this, 'rest_register_webhook' ),
			'permission_callback' => array( $this, 'check_admin_permission' ),
		] );

		// Get connection/store status (for status tab).
		register_rest_route( 'ozzyl/v1', '/admin/status', [
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'rest_get_status' ),
			'permission_callback' => array( $this, 'check_admin_permission' ),
		] );
	}

	/**
	 * REST: test API key connection.
	 *
	 * @since 1.0.0
	 * @return WP_REST_Response
	 */
	public function rest_test_connection(): WP_REST_Response {
		$connected = $this->api->test_connection();

		if ( $connected ) {
			$store = $this->api->get_store();
			return new WP_REST_Response( [
				'success'   => true,
				'connected' => true,
				'store'     => is_wp_error( $store ) ? null : $store,
			], 200 );
		}

		return new WP_REST_Response( [
			'success'   => false,
			'connected' => false,
			'message'   => __( 'Connection failed. Please check your API key.', 'ozzyl-commerce' ),
		], 200 );
	}

	/**
	 * REST: auto-register the WordPress webhook URL in Ozzyl.
	 *
	 * @since 1.0.0
	 * @return WP_REST_Response
	 */
	public function rest_register_webhook(): WP_REST_Response {
		$webhook_url    = Ozzyl_Webhook::get_webhook_url();
		$webhook_secret = $this->auth->get_webhook_secret();

		$events = [
			'order/created',
			'order/updated',
			'order/cancelled',
			'order/delivered',
			'product/created',
			'product/updated',
			'product/deleted',
			'customer/created',
			'customer/updated',
		];

		$result = $this->api->create_webhook( $webhook_url, $events, $webhook_secret );

		if ( is_wp_error( $result ) ) {
			return new WP_REST_Response( [
				'success' => false,
				'message' => $result->get_error_message(),
			], 200 );
		}

		// Store the webhook ID for future reference.
		if ( isset( $result['id'] ) ) {
			$this->auth->set_registered_webhook_id( (string) $result['id'] );
		}

		return new WP_REST_Response( [
			'success'    => true,
			'webhook_id' => $result['id'] ?? null,
			'message'    => __( 'Webhook registered successfully.', 'ozzyl-commerce' ),
		], 200 );
	}

	/**
	 * REST: get full connection/store status for the status tab.
	 *
	 * @since 1.0.0
	 * @return WP_REST_Response
	 */
	public function rest_get_status(): WP_REST_Response {
		$has_key      = $this->auth->is_api_key_valid();
		$connected    = $has_key && $this->api->test_connection();
		$store        = $connected ? $this->api->get_store() : null;
		$webhook_id   = $this->auth->get_registered_webhook_id();
		$wc_active    = class_exists( 'WooCommerce' );
		$sync_enabled = $this->auth->is_sync_enabled();
		$auto_sync    = $this->auth->is_auto_sync_enabled();

		return new WP_REST_Response( [
			'success'         => true,
			'has_api_key'     => $has_key,
			'connected'       => $connected,
			'store'           => ( $store && ! is_wp_error( $store ) ) ? $store : null,
			'webhook_id'      => $webhook_id,
			'webhook_url'     => Ozzyl_Webhook::get_webhook_url(),
			'woocommerce'     => $wc_active,
			'sync_enabled'    => $sync_enabled,
			'auto_sync'       => $auto_sync,
			'plugin_version'  => OZZYL_VERSION,
			'php_version'     => PHP_VERSION,
			'wp_version'      => get_bloginfo( 'version' ),
		], 200 );
	}

	/**
	 * Permission callback: require manage_options.
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	public function check_admin_permission(): bool {
		return current_user_can( 'manage_options' );
	}
}
