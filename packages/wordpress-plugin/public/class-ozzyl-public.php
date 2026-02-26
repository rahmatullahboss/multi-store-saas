<?php
/**
 * Ozzyl Public — public-facing functionality
 *
 * Handles front-end concerns that are not part of the shortcode/widget system:
 * - Open Graph / meta tags for pages with Ozzyl product embeds
 * - REST endpoints that the embedded iframe can call cross-origin
 * - iframe postMessage listener registration (via wp_add_inline_script)
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ozzyl_Public — public-facing hooks and REST endpoints.
 *
 * @since 1.0.0
 */
class Ozzyl_Public {

	// ── Constructor ───────────────────────────────────────────────────────────

	/**
	 * Register public hooks.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_public_routes' ) );
		add_action( 'send_headers',  array( $this, 'maybe_add_csp_header' ) );
	}

	// ── Public REST routes ────────────────────────────────────────────────────

	/**
	 * Register public-facing REST routes.
	 *
	 * These routes are designed to be called by the embedded Ozzyl iframe
	 * (postMessage-based cross-origin communication) or by external scripts.
	 * They expose no sensitive data and require no authentication.
	 *
	 * @since 1.0.0
	 */
	public function register_public_routes(): void {
		// Health check — useful for Ozzyl's platform to verify plugin is active.
		register_rest_route( 'ozzyl/v1', '/health', [
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'rest_health' ),
			'permission_callback' => '__return_true',
		] );

		// Plugin info — version and capabilities (no secrets exposed).
		register_rest_route( 'ozzyl/v1', '/info', [
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => array( $this, 'rest_info' ),
			'permission_callback' => '__return_true',
		] );
	}

	/**
	 * REST: health check endpoint.
	 *
	 * @since 1.0.0
	 * @return WP_REST_Response
	 */
	public function rest_health(): WP_REST_Response {
		return new WP_REST_Response( [
			'ok'        => true,
			'plugin'    => 'ozzyl-commerce',
			'timestamp' => time(),
		], 200 );
	}

	/**
	 * REST: plugin capabilities info.
	 *
	 * @since 1.0.0
	 * @return WP_REST_Response
	 */
	public function rest_info(): WP_REST_Response {
		return new WP_REST_Response( [
			'plugin'      => 'ozzyl-commerce',
			'version'     => OZZYL_VERSION,
			'webhook_url' => Ozzyl_Webhook::get_webhook_url(),
		], 200 );
	}

	// ── Meta tags ─────────────────────────────────────────────────────────────

	/**
	 * Add a Content-Security-Policy frame-ancestors header on pages with an Ozzyl embed.
	 *
	 * Runs on the send_headers action so the header is sent before any output.
	 * Only adds the header when the current post has the [ozzyl_store] shortcode or block.
	 *
	 * @since 1.0.0
	 */
	public function maybe_add_csp_header(): void {
		global $post;

		if ( ! $post instanceof WP_Post ) {
			return;
		}

		$has_embed = has_shortcode( $post->post_content, 'ozzyl_store' )
			|| has_block( 'ozzyl/store-embed', $post );

		if ( ! $has_embed ) {
			return;
		}

		// Allow the embedding iframe.
		$origin = $this->get_store_origin();

		// Guard against CRLF injection in the header value.
		$origin = str_replace( [ "\r", "\n" ], '', $origin );

		if ( ! empty( $origin ) ) {
			// Output a frame-ancestors CSP only for pages with embeds.
			// Note: X-Frame-Options is deprecated in favour of CSP frame-ancestors.
			header( 'Content-Security-Policy: frame-ancestors \'self\' ' . $origin );
		}
	}

	// ── Helpers ───────────────────────────────────────────────────────────────

	/**
	 * Return the Ozzyl storefront origin (scheme + host) for CSP headers.
	 *
	 * Uses cached store data if available.
	 *
	 * @since 1.0.0
	 * @return string e.g. "https://my-store.ozzyl.com" or empty string.
	 */
	private function get_store_origin(): string {
		$store_data = get_transient( 'ozzyl_store_data' );

		if ( ! is_array( $store_data ) ) {
			return 'https://*.ozzyl.com';
		}

		$custom_domain = $store_data['customDomain'] ?? '';
		if ( ! empty( $custom_domain ) ) {
			return 'https://' . sanitize_text_field( $custom_domain );
		}

		$subdomain = $store_data['subdomain'] ?? '';
		if ( ! empty( $subdomain ) ) {
			return 'https://' . sanitize_text_field( $subdomain ) . '.ozzyl.com';
		}

		return 'https://*.ozzyl.com';
	}
}
