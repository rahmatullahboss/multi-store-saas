<?php
/**
 * Ozzyl Commerce — Uninstall Script
 *
 * This file is executed automatically by WordPress when the plugin is deleted
 * (not just deactivated) from the Plugins admin screen.
 *
 * Removes ALL data created by this plugin:
 *   - WordPress options (API key, webhook secret, sync settings, etc.)
 *   - Transients (cached store data)
 *   - Post meta added to WooCommerce products (_ozzyl_product_id)
 *   - Deduplication transients (ozzyl_wh_seen_*)
 *
 * IMPORTANT: This file MUST NOT be loaded directly. WordPress will call it
 * after verifying the user has uninstall permission (delete_plugins capability).
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// ── Delete all plugin options ─────────────────────────────────────────────────

$options_to_delete = [
	'ozzyl_api_key',
	'ozzyl_webhook_secret',
	'ozzyl_sync_enabled',
	'ozzyl_sync_auto',
	'ozzyl_registered_webhook_id',
];

foreach ( $options_to_delete as $option ) {
	delete_option( $option );
}

// ── Delete transients ─────────────────────────────────────────────────────────

// Cached store data.
delete_transient( 'ozzyl_store_data' );

// Deduplication transients (ozzyl_wh_seen_*).
// These are stored with a hashed suffix; we query for all of them.
global $wpdb;

$transient_rows = $wpdb->get_col(
	$wpdb->prepare(
		"SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
		$wpdb->esc_like( '_transient_ozzyl_wh_seen_' ) . '%',
		$wpdb->esc_like( '_transient_timeout_ozzyl_wh_seen_' ) . '%'
	)
);

foreach ( $transient_rows as $option_name ) {
	$option_name = sanitize_key( $option_name );
	delete_option( $option_name );
}

// ── Delete WooCommerce product meta ───────────────────────────────────────────

// Remove _ozzyl_product_id meta from all WooCommerce products.
if ( class_exists( 'WooCommerce' ) || function_exists( 'wc_get_products' ) ) {
	// phpcs:disable WordPress.DB.DirectDatabaseQuery
	$wpdb->delete(
		$wpdb->postmeta,
		[ 'meta_key' => '_ozzyl_product_id' ], // phpcs:ignore WordPress.DB.SlowDBQuery
		[ '%s' ]
	);
	// phpcs:enable
}

// ── Log uninstall ─────────────────────────────────────────────────────────────

error_log( '[Ozzyl] Plugin uninstalled — all plugin data removed.' );
