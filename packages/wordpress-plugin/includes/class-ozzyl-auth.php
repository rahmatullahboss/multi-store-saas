<?php
/**
 * Ozzyl Auth — API key management
 *
 * Handles secure storage and retrieval of the Ozzyl API key and webhook
 * secret using the WordPress Options API. Keys are never exposed in URLs,
 * HTML attributes, or JavaScript.
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ozzyl_Auth — manages API key and webhook secret storage.
 *
 * @since 1.0.0
 */
class Ozzyl_Auth {

	// ── Option keys ──────────────────────────────────────────────────────────

	/** WordPress option name for the API key. */
	private const OPT_API_KEY        = 'ozzyl_api_key';

	/** WordPress option name for the webhook secret. */
	private const OPT_WEBHOOK_SECRET = 'ozzyl_webhook_secret';

	/** WordPress option name for the sync-enabled flag. */
	private const OPT_SYNC_ENABLED   = 'ozzyl_sync_enabled';

	/** WordPress option name for the auto-sync flag. */
	private const OPT_SYNC_AUTO      = 'ozzyl_sync_auto';

	/** WordPress option name for the registered webhook ID (from Ozzyl). */
	private const OPT_WEBHOOK_ID     = 'ozzyl_registered_webhook_id';

	// ── API key ───────────────────────────────────────────────────────────────

	/**
	 * Return the stored API key, or an empty string if not set.
	 *
	 * @since 1.0.0
	 * @return string
	 */
	public function get_api_key(): string {
		return (string) get_option( self::OPT_API_KEY, '' );
	}

	/**
	 * Persist a new API key to the WordPress options table.
	 *
	 * The key is sanitized (whitespace stripped) before saving.
	 * Enforces capability and CSRF nonce checks when called from a form POST
	 * context. Pass $verify_nonce = true whenever this is invoked from an
	 * admin form submission (not from a programmatic/internal call).
	 *
	 * @since 1.0.0
	 * @param string $api_key      Raw API key value from the settings form.
	 * @param bool   $verify_nonce Whether to verify the CSRF nonce and capability.
	 *                             Default false for backward-compat with internal callers.
	 * @return bool True if the value changed (or was added), false if unchanged.
	 */
	public function set_api_key( string $api_key, bool $verify_nonce = false ): bool {
		if ( $verify_nonce ) {
			// SECURITY S-4: Verify capability and nonce before writing any option.
			if ( ! current_user_can( 'manage_options' ) ) {
				wp_die( esc_html__( 'You do not have permission to perform this action.', 'ozzyl-commerce' ) );
			}
			check_admin_referer( 'ozzyl_save_settings', 'ozzyl_nonce' );
		}

		$clean = sanitize_text_field( trim( $api_key ) );
		return update_option( self::OPT_API_KEY, $clean );
	}

	/**
	 * Return true if the API key looks syntactically valid.
	 *
	 * Valid keys start with 'sk_live_' or 'sk_test_' and are at least 20 chars.
	 *
	 * @since 1.0.0
	 * @param string|null $api_key Key to validate. Uses stored key if null.
	 * @return bool
	 */
	public function is_api_key_valid( ?string $api_key = null ): bool {
		$key = $api_key ?? $this->get_api_key();
		if ( empty( $key ) || strlen( $key ) < 20 ) {
			return false;
		}
		return str_starts_with( $key, 'sk_live_' ) || str_starts_with( $key, 'sk_test_' );
	}

	/**
	 * Return a masked version of the API key safe to display in the UI.
	 *
	 * Shows the prefix + first 6 chars + "****" + last 4 chars.
	 * Example: "sk_live_abc123****7xyz"
	 *
	 * @since 1.0.0
	 * @return string Masked key, or empty string if no key is stored.
	 */
	public function get_masked_api_key(): string {
		$key = $this->get_api_key();
		if ( empty( $key ) ) {
			return '';
		}
		$len = strlen( $key );
		if ( $len <= 12 ) {
			return str_repeat( '*', $len );
		}
		return substr( $key, 0, 14 ) . '****' . substr( $key, -4 );
	}

	// ── Webhook secret ────────────────────────────────────────────────────────

	/**
	 * Return the webhook signing secret, generating one if absent.
	 *
	 * @since 1.0.0
	 * @return string
	 */
	public function get_webhook_secret(): string {
		$secret = (string) get_option( self::OPT_WEBHOOK_SECRET, '' );
		if ( empty( $secret ) ) {
			$secret = $this->regenerate_webhook_secret();
		}
		return $secret;
	}

	/**
	 * Generate and persist a fresh webhook secret.
	 *
	 * Uses WordPress's CSPRNG-backed wp_generate_password().
	 * Pass $verify_nonce = true when triggered by an admin form submission
	 * to enforce capability + CSRF checks.
	 *
	 * @since 1.0.0
	 * @param bool $verify_nonce Whether to verify the CSRF nonce and capability.
	 *                           Default false for backward-compat (called from get_webhook_secret on first run).
	 * @return string The newly generated secret.
	 */
	public function regenerate_webhook_secret( bool $verify_nonce = false ): string {
		if ( $verify_nonce ) {
			// SECURITY S-4: Verify capability and nonce before writing any option.
			if ( ! current_user_can( 'manage_options' ) ) {
				wp_die( esc_html__( 'You do not have permission to perform this action.', 'ozzyl-commerce' ) );
			}
			check_admin_referer( 'ozzyl_save_settings', 'ozzyl_nonce' );
		}

		$secret = wp_generate_password( 48, false );
		update_option( self::OPT_WEBHOOK_SECRET, $secret );
		error_log( '[Ozzyl] Webhook secret regenerated.' );
		return $secret;
	}

	// ── Sync settings ─────────────────────────────────────────────────────────

	/**
	 * Return whether WooCommerce sync is enabled.
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	public function is_sync_enabled(): bool {
		return '1' === get_option( self::OPT_SYNC_ENABLED, '0' );
	}

	/**
	 * Enable or disable WooCommerce sync.
	 *
	 * @since 1.0.0
	 * @param bool $enabled New value.
	 */
	public function set_sync_enabled( bool $enabled ): void {
		update_option( self::OPT_SYNC_ENABLED, $enabled ? '1' : '0' );
	}

	/**
	 * Return whether automatic sync (on order events) is enabled.
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	public function is_auto_sync_enabled(): bool {
		return '1' === get_option( self::OPT_SYNC_AUTO, '0' );
	}

	/**
	 * Enable or disable automatic sync.
	 *
	 * @since 1.0.0
	 * @param bool $enabled New value.
	 */
	public function set_auto_sync_enabled( bool $enabled ): void {
		update_option( self::OPT_SYNC_AUTO, $enabled ? '1' : '0' );
	}

	// ── Registered webhook ID ─────────────────────────────────────────────────

	/**
	 * Return the Ozzyl webhook ID that was registered for this WordPress site.
	 *
	 * @since 1.0.0
	 * @return string Numeric ID as string, or empty string if not registered.
	 */
	public function get_registered_webhook_id(): string {
		return (string) get_option( self::OPT_WEBHOOK_ID, '' );
	}

	/**
	 * Persist the Ozzyl webhook ID after successful registration.
	 *
	 * @since 1.0.0
	 * @param string $webhook_id Numeric webhook ID returned by the API.
	 */
	public function set_registered_webhook_id( string $webhook_id ): void {
		update_option( self::OPT_WEBHOOK_ID, sanitize_text_field( $webhook_id ) );
	}

	/**
	 * Clear the stored webhook ID (e.g. after the webhook is deleted).
	 *
	 * @since 1.0.0
	 */
	public function clear_registered_webhook_id(): void {
		delete_option( self::OPT_WEBHOOK_ID );
	}

	// ── Cleanup ───────────────────────────────────────────────────────────────

	/**
	 * Delete all plugin options from the database.
	 *
	 * Called by uninstall.php — should only run when the plugin is fully removed.
	 *
	 * @since 1.0.0
	 */
	public static function delete_all_options(): void {
		delete_option( self::OPT_API_KEY );
		delete_option( self::OPT_WEBHOOK_SECRET );
		delete_option( self::OPT_SYNC_ENABLED );
		delete_option( self::OPT_SYNC_AUTO );
		delete_option( self::OPT_WEBHOOK_ID );
		error_log( '[Ozzyl] All plugin options deleted during uninstall.' );
	}
}
