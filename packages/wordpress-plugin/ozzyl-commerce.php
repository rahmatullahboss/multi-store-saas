<?php
/**
 * Plugin Name: Ozzyl Commerce
 * Plugin URI: https://ozzyl.com/wordpress
 * Description: Connect your WordPress/WooCommerce store to the Ozzyl Commerce Platform — the Shopify of Bangladesh. Sync products and orders, receive real-time webhooks, and embed your Ozzyl storefront directly in WordPress.
 * Version: 1.0.0
 * Author: Ozzyl
 * Author URI: https://ozzyl.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: ozzyl-commerce
 * Domain Path: /languages
 * Requires at least: 6.0
 * Requires PHP: 8.0
 * WC requires at least: 8.0
 * WC tested up to: 9.0
 *
 * @package OzzylCommerce
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// ── Plugin constants ──────────────────────────────────────────────────────────

define( 'OZZYL_VERSION',     '1.0.0' );
define( 'OZZYL_PLUGIN_FILE', __FILE__ );
define( 'OZZYL_PLUGIN_DIR',  plugin_dir_path( __FILE__ ) );
define( 'OZZYL_PLUGIN_URL',  plugin_dir_url( __FILE__ ) );
define( 'OZZYL_PLUGIN_BASE', plugin_basename( __FILE__ ) );
define( 'OZZYL_API_BASE',    'https://api.ozzyl.com/v1' );
define( 'OZZYL_MIN_PHP',     '8.0' );
define( 'OZZYL_MIN_WP',      '6.0' );

// ── PHP version gate ──────────────────────────────────────────────────────────

if ( version_compare( PHP_VERSION, OZZYL_MIN_PHP, '<' ) ) {
	add_action( 'admin_notices', function () {
		printf(
			'<div class="notice notice-error"><p>%s</p></div>',
			sprintf(
				/* translators: 1: Required PHP version. 2: Current PHP version. */
				esc_html__( 'Ozzyl Commerce requires PHP %1$s or higher. Your site is running PHP %2$s. Please upgrade PHP to use this plugin.', 'ozzyl-commerce' ),
				esc_html( OZZYL_MIN_PHP ),
				esc_html( PHP_VERSION )
			)
		);
	} );
	return;
}

// ── Autoload includes ─────────────────────────────────────────────────────────

require_once OZZYL_PLUGIN_DIR . 'includes/class-ozzyl-api.php';
require_once OZZYL_PLUGIN_DIR . 'includes/class-ozzyl-auth.php';
require_once OZZYL_PLUGIN_DIR . 'includes/class-ozzyl-webhook.php';
require_once OZZYL_PLUGIN_DIR . 'includes/class-ozzyl-sync.php';
require_once OZZYL_PLUGIN_DIR . 'includes/class-ozzyl-widget.php';
require_once OZZYL_PLUGIN_DIR . 'admin/class-ozzyl-admin.php';
require_once OZZYL_PLUGIN_DIR . 'public/class-ozzyl-public.php';

// ── Activation / Deactivation / Uninstall ────────────────────────────────────

register_activation_hook( __FILE__, array( 'Ozzyl_Commerce', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'Ozzyl_Commerce', 'deactivate' ) );

// ── HPOS compatibility declaration ────────────────────────────────────────────

add_action( 'before_woocommerce_init', function() {
	if ( class_exists( \Automattic\WooCommerce\Utilities\FeaturesUtil::class ) ) {
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility(
			'custom_order_tables',
			__FILE__,
			true
		);
	}
} );

// ── Bootstrap ─────────────────────────────────────────────────────────────────

/**
 * Main plugin class — singleton bootstrap.
 *
 * @since 1.0.0
 */
final class Ozzyl_Commerce {

	/** @var Ozzyl_Commerce|null Singleton instance. */
	private static ?Ozzyl_Commerce $instance = null;

	/** @var Ozzyl_API API client instance. */
	public Ozzyl_API $api;

	/** @var Ozzyl_Auth Auth / key manager. */
	public Ozzyl_Auth $auth;

	/** @var Ozzyl_Webhook Webhook receiver. */
	public Ozzyl_Webhook $webhook;

	/** @var Ozzyl_Sync|null WooCommerce sync (loaded only when WC is active). */
	public ?Ozzyl_Sync $sync = null;

	/** @var Ozzyl_Widget Shortcode widget. */
	public Ozzyl_Widget $widget;

	/** @var Ozzyl_Admin Admin screens (admin-only). */
	public ?Ozzyl_Admin $admin = null;

	/** @var Ozzyl_Public Public-facing functionality. */
	public Ozzyl_Public $public;

	// ── Singleton ─────────────────────────────────────────────────────────────

	/**
	 * Return (or create) the singleton instance.
	 *
	 * @since 1.0.0
	 * @return Ozzyl_Commerce
	 */
	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/** Private constructor — use ::instance(). */
	private function __construct() {
		$this->init();
	}

	// ── Initialisation ────────────────────────────────────────────────────────

	/**
	 * Wire up all plugin subsystems.
	 *
	 * @since 1.0.0
	 */
	private function init(): void {
		// Core subsystems (always loaded).
		$this->auth    = new Ozzyl_Auth();
		$this->api     = new Ozzyl_API( $this->auth->get_api_key() );
		$this->webhook = new Ozzyl_Webhook();
		$this->widget  = new Ozzyl_Widget();
		$this->public  = new Ozzyl_Public();

		// Admin screens.
		if ( is_admin() ) {
			$this->admin = new Ozzyl_Admin( $this->api, $this->auth );
		}

		// WooCommerce sync — only when WC is active.
		add_action( 'plugins_loaded', array( $this, 'load_woocommerce_integration' ), 20 );

		// Load plugin text domain.
		add_action( 'init', array( $this, 'load_textdomain' ) );

		// Plugin action links (Settings shortcut on Plugins page).
		add_filter( 'plugin_action_links_' . OZZYL_PLUGIN_BASE, array( $this, 'plugin_action_links' ) );
	}

	/**
	 * Load WooCommerce integration when WC is available.
	 *
	 * @since 1.0.0
	 */
	public function load_woocommerce_integration(): void {
		if ( class_exists( 'WooCommerce' ) ) {
			$this->sync = new Ozzyl_Sync( $this->api );
		}
	}

	/**
	 * Load plugin translations.
	 *
	 * @since 1.0.0
	 */
	public function load_textdomain(): void {
		load_plugin_textdomain(
			'ozzyl-commerce',
			false,
			dirname( OZZYL_PLUGIN_BASE ) . '/languages'
		);
	}

	/**
	 * Add Settings link to the Plugins list table.
	 *
	 * @since 1.0.0
	 * @param array<string,string> $links Existing action links.
	 * @return array<string,string>
	 */
	public function plugin_action_links( array $links ): array {
		$settings_link = sprintf(
			'<a href="%s">%s</a>',
			esc_url( admin_url( 'options-general.php?page=ozzyl-commerce' ) ),
			esc_html__( 'Settings', 'ozzyl-commerce' )
		);
		array_unshift( $links, $settings_link );
		return $links;
	}

	// ── Activation / Deactivation ─────────────────────────────────────────────

	/**
	 * Run on plugin activation.
	 *
	 * @since 1.0.0
	 */
	public static function activate(): void {
		// Enforce minimum WooCommerce version if WC is active.
		if ( class_exists( 'WooCommerce' ) ) {
			$wc_version = defined( 'WC_VERSION' ) ? WC_VERSION : '0';
			if ( version_compare( $wc_version, '8.0', '<' ) ) {
				deactivate_plugins( plugin_basename( OZZYL_PLUGIN_FILE ) );
				wp_die(
					esc_html__( 'Ozzyl Commerce requires WooCommerce 8.0 or higher.', 'ozzyl-commerce' ),
					esc_html__( 'Plugin Activation Error', 'ozzyl-commerce' ),
					[ 'back_link' => true ]
				);
			}
		}

		// Set default options if not already present.
		if ( false === get_option( 'ozzyl_api_key' ) ) {
			add_option( 'ozzyl_api_key', '' );
		}
		if ( false === get_option( 'ozzyl_webhook_secret' ) ) {
			add_option( 'ozzyl_webhook_secret', wp_generate_password( 48, false ) );
		}
		if ( false === get_option( 'ozzyl_sync_enabled' ) ) {
			add_option( 'ozzyl_sync_enabled', '0' );
		}
		if ( false === get_option( 'ozzyl_sync_auto' ) ) {
			add_option( 'ozzyl_sync_auto', '0' );
		}

		// Flush rewrite rules so REST route is registered.
		flush_rewrite_rules();

		if ( defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
			error_log( '[Ozzyl] Plugin activated (v' . OZZYL_VERSION . ').' );
		}
	}

	/**
	 * Run on plugin deactivation.
	 *
	 * @since 1.0.0
	 */
	public static function deactivate(): void {
		flush_rewrite_rules();
		if ( defined( 'WP_DEBUG_LOG' ) && WP_DEBUG_LOG ) {
			error_log( '[Ozzyl] Plugin deactivated.' );
		}
	}
}

/**
 * Global accessor — returns the singleton Ozzyl_Commerce instance.
 *
 * @since 1.0.0
 * @return Ozzyl_Commerce
 */
function ozzyl(): Ozzyl_Commerce {
	return Ozzyl_Commerce::instance();
}

// Kick everything off after all plugins are loaded.
add_action( 'plugins_loaded', 'ozzyl', 5 );
