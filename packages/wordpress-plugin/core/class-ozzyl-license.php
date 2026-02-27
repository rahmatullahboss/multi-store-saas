<?php
/**
 * Ozzyl License & Plan Validator
 *
 * Validates the user's plan and available scopes by communicating with the Ozzyl API.
 * Caches results in WP transients for performance.
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ozzyl_License — Validates plan tier and scopes.
 *
 * The Ozzyl API endpoint GET /api/v1/store returns:
 * {
 *   "plan": "starter",
 *   "scopes": ["analytics", "fraud", "tracking", "courier", "abandoned_cart"]
 * }
 *
 * Usage:
 *   $license = new Ozzyl_License( $api_client );
 *   $plan = $license->get_plan();              // "free", "starter", "pro", "enterprise"
 *   $has_fraud = $license->has_scope( 'fraud' ); // true/false
 *   $license->refresh();                       // Force API call, skip cache
 *
 * @since 1.0.0
 */
class Ozzyl_License {

	/** Transient key for caching license data. */
	private const CACHE_KEY = 'ozzyl_license_cache';

	/** Cache duration in seconds (1 hour). */
	private const CACHE_TTL = 3600;

	/** @var Ozzyl_API API client instance. */
	private Ozzyl_API $api;

	/** @var array<string,mixed>|null Cached license data. */
	private ?array $cached_data = null;

	/**
	 * Constructor.
	 *
	 * @since 1.0.0
	 * @param Ozzyl_API $api API client instance.
	 */
	public function __construct( Ozzyl_API $api ) {
		$this->api = $api;
	}

	/**
	 * Get the current plan tier.
	 *
	 * Returns one of: 'free', 'starter', 'pro', 'enterprise'
	 * Defaults to 'free' if the API call fails or returns unexpected data.
	 *
	 * @since 1.0.0
	 * @return string Plan tier identifier.
	 */
	public function get_plan(): string {
		$data = $this->get_cached_data();
		return $data['plan'] ?? 'free';
	}

	/**
	 * Check if the user's plan includes a specific scope.
	 *
	 * @since 1.0.0
	 * @param string $scope Scope name (e.g., 'fraud', 'tracking', 'courier').
	 * @return bool True if the scope is available in the user's plan.
	 */
	public function has_scope( string $scope ): bool {
		$data   = $this->get_cached_data();
		$scopes = $data['scopes'] ?? [];
		return in_array( $scope, $scopes, true );
	}

	/**
	 * Force refresh of license data from the API.
	 *
	 * Invalidates the cache and fetches fresh data from the Ozzyl API.
	 * Called when the user updates their API key or when a cron refresh is triggered.
	 *
	 * @since 1.0.0
	 * @return bool True if refresh succeeded, false on API error.
	 */
	public function refresh(): bool {
		delete_transient( self::CACHE_KEY );
		$this->cached_data = null;

		$data = $this->fetch_from_api();
		if ( null === $data ) {
			Ozzyl_Logger::warning( 'License refresh failed — API error or no API key.' );
			return false;
		}

		Ozzyl_Logger::info( 'License refreshed', [ 'plan' => $data['plan'] ?? 'unknown' ] );
		return true;
	}

	/**
	 * Get cached or fetch license data.
	 *
	 * Attempts to load from WP transient first; if not cached, fetches from API.
	 *
	 * @since 1.0.0
	 * @return array<string,mixed> License data or default fallback.
	 */
	private function get_cached_data(): array {
		if ( null !== $this->cached_data ) {
			return $this->cached_data;
		}

		// Try to load from cache.
		$cached = get_transient( self::CACHE_KEY );
		if ( is_array( $cached ) ) {
			$this->cached_data = $cached;
			return $this->cached_data;
		}

		// Fetch from API.
		$data = $this->fetch_from_api();
		if ( null === $data ) {
			// Fallback: free plan, no scopes.
			$data = [ 'plan' => 'free', 'scopes' => [] ];
		}

		$this->cached_data = $data;
		set_transient( self::CACHE_KEY, $data, self::CACHE_TTL );

		return $this->cached_data;
	}

	/**
	 * Fetch license data from the Ozzyl API.
	 *
	 * Calls GET /api/v1/store and extracts plan and scopes from the response.
	 *
	 * @since 1.0.0
	 * @return array<string,mixed>|null License data array or null on error.
	 */
	private function fetch_from_api(): ?array {
		$result = $this->api->get_store();

		if ( is_wp_error( $result ) ) {
			Ozzyl_Logger::error(
				'Failed to fetch license from API',
				[ 'error' => $result->get_error_message() ]
			);
			return null;
		}

		// Extract plan and scopes from API response.
		$plan   = $result['plan'] ?? 'free';
		$scopes = $result['scopes'] ?? [];

		// Ensure scopes is an array.
		if ( ! is_array( $scopes ) ) {
			$scopes = [];
		}

		return [
			'plan'   => $plan,
			'scopes' => $scopes,
		];
	}
}
