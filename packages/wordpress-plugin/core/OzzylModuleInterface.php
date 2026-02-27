<?php
/**
 * Ozzyl Module Interface — Contract for all plugin modules.
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * OzzylModuleInterface — All modules must implement this contract.
 *
 * Modules are optional features that can be individually enabled/disabled
 * and may require specific plan scopes (free, starter, pro, enterprise).
 *
 * @since 1.0.0
 */
interface OzzylModuleInterface {

	/**
	 * Get the module ID (slug).
	 *
	 * @since 1.0.0
	 * @return string Unique module identifier (e.g., 'fraud-detection').
	 */
	public function get_id(): string;

	/**
	 * Get the module display name.
	 *
	 * @since 1.0.0
	 * @return string Human-readable module name (e.g., 'Fraud Detection').
	 */
	public function get_name(): string;

	/**
	 * Get the module icon (emoji or icon code).
	 *
	 * @since 1.0.0
	 * @return string Icon emoji or Unicode character (e.g., '🛡️').
	 */
	public function get_icon(): string;

	/**
	 * Get the module description.
	 *
	 * @since 1.0.0
	 * @return string Short description of what the module does.
	 */
	public function get_description(): string;

	/**
	 * Get the required API scope for this module.
	 *
	 * @since 1.0.0
	 * @return string Scope name (e.g., 'fraud', 'tracking', 'courier').
	 *                 Empty string means no special scope required (free tier).
	 */
	public function get_required_scope(): string;

	/**
	 * Get the minimum plan tier required to use this module.
	 *
	 * @since 1.0.0
	 * @return string One of: 'free', 'starter', 'pro', 'enterprise'.
	 */
	public function get_min_plan(): string;

	/**
	 * Activate the module.
	 *
	 * Called when:
	 * 1. Module is enabled in settings AND
	 * 2. User's plan includes the required scope.
	 *
	 * Implementation should:
	 * - Register WooCommerce hooks (add_action, add_filter)
	 * - Initialize any required database tables or options
	 * - Schedule any WP Cron jobs
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function activate(): void;

	/**
	 * Deactivate the module.
	 *
	 * Called when:
	 * 1. Plugin is deactivated, OR
	 * 2. Module is disabled in settings.
	 *
	 * Implementation MUST:
	 * - Call remove_action() / remove_filter() for every hook registered in activate()
	 * - Cancel any scheduled WP Cron jobs with wp_clear_scheduled_hook()
	 * - Delete any transients with delete_transient()
	 *
	 * Implementation MUST NOT:
	 * - Delete WP options (user settings are preserved)
	 * - Delete database tables
	 * - Delete order meta or customer data
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function deactivate(): void;

	/**
	 * Render the module settings form.
	 *
	 * Called by the admin panel when the module is accessible.
	 * Implementation should output HTML for configuration inputs.
	 *
	 * @since 1.0.0
	 * @return void Outputs HTML directly (use wp_nonce_field() for security).
	 */
	public function render_settings(): void;

	/**
	 * Get module statistics for the dashboard.
	 *
	 * @since 1.0.0
	 * @return array<string,mixed> Associative array of stats.
	 *                              Example: ['orders_blocked' => 34, 'saved_revenue' => 82400]
	 */
	public function get_stats(): array;
}
