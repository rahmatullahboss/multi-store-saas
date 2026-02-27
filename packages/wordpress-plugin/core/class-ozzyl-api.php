<?php
/**
 * Ozzyl API Client
 *
 * Wraps all HTTP communication with the Ozzyl Commerce Platform REST API v1.
 * Uses WordPress's wp_remote_request() so proxy settings, SSL verification,
 * and HTTP filters all work as expected in the WordPress environment.
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ozzyl_API — PHP client for the Ozzyl Commerce Platform API v1.
 *
 * Usage:
 *   $api = new Ozzyl_API( get_option('ozzyl_api_key') );
 *
 *   $result = $api->get_products( [ 'limit' => 10, 'published' => true ] );
 *   if ( is_wp_error( $result ) ) { // handle error }
 *   else { // $result is the decoded JSON data array }
 *
 * @since 1.0.0
 */
class Ozzyl_API {

	// ── Constants ─────────────────────────────────────────────────────────────

	/** Default request timeout in seconds. */
	private const TIMEOUT = 15;

	/** Number of automatic retries on 429 / 5xx responses. */
	private const MAX_RETRIES = 2;

	// ── Properties ────────────────────────────────────────────────────────────

	/** @var string Current API key (may be empty if not yet configured). */
	private string $api_key;

	/** @var string Base URL for all API requests. */
	private string $base_url;

	// ── Constructor ───────────────────────────────────────────────────────────

	/**
	 * Construct a new API client.
	 *
	 * @since 1.0.0
	 * @param string $api_key  Ozzyl API key (sk_live_... or sk_test_...).
	 * @param string $base_url Optional override for the API base URL.
	 */
	public function __construct( string $api_key = '', string $base_url = OZZYL_API_BASE ) {
		$this->api_key  = $api_key;
		$this->base_url = rtrim( $base_url, '/' );
	}

	/**
	 * Update the API key at runtime (e.g. after settings are saved).
	 *
	 * @since 1.0.0
	 * @param string $api_key New API key.
	 */
	public function set_api_key( string $api_key ): void {
		$this->api_key = $api_key;
	}

	// ── Public resource methods ───────────────────────────────────────────────

	/**
	 * Retrieve the store associated with the current API key.
	 *
	 * @since 1.0.0
	 * @return array<string,mixed>|WP_Error Store data array on success, WP_Error on failure.
	 */
	public function get_store(): array|WP_Error {
		return $this->request( 'GET', '/store' );
	}

	/**
	 * Test connectivity and API key validity.
	 *
	 * Makes a lightweight call to /store and returns true if the key is valid.
	 *
	 * @since 1.0.0
	 * @return bool True if connection succeeds, false on any error.
	 */
	public function test_connection(): bool {
		$result = $this->get_store();
		return ! is_wp_error( $result );
	}

	/**
	 * List products with optional filtering and pagination.
	 *
	 * Supported params:
	 *   - page      (int)    Page number, 1-indexed. Default 1.
	 *   - limit     (int)    Items per page (1–100). Default 20.
	 *   - search    (string) Full-text search on product titles.
	 *   - published (bool)   Filter by published status.
	 *
	 * @since 1.0.0
	 * @param array<string,mixed> $params Optional query parameters.
	 * @return array<string,mixed>|WP_Error Response envelope on success, WP_Error on failure.
	 */
	public function get_products( array $params = [] ): array|WP_Error {
		$allowed = [ 'page', 'limit', 'search', 'published' ];
		$query   = $this->build_query( $params, $allowed );
		return $this->request( 'GET', '/products' . $query );
	}

	/**
	 * Retrieve a single product by ID.
	 *
	 * @since 1.0.0
	 * @param int|string $product_id Numeric product ID.
	 * @return array<string,mixed>|WP_Error Product data on success, WP_Error on failure.
	 */
	public function get_product( int|string $product_id ): array|WP_Error {
		return $this->request( 'GET', '/products/' . rawurlencode( (string) $product_id ) );
	}

	/**
	 * List orders with optional status filtering and pagination.
	 *
	 * Supported params:
	 *   - limit  (int)    Items to return (1–100). Default 20.
	 *   - status (string) Filter by order status (pending|confirmed|processing|shipped|delivered|cancelled|returned).
	 *
	 * @since 1.0.0
	 * @param array<string,mixed> $params Optional query parameters.
	 * @return array<string,mixed>|WP_Error Response envelope on success, WP_Error on failure.
	 */
	public function get_orders( array $params = [] ): array|WP_Error {
		$allowed = [ 'limit', 'status' ];
		$query   = $this->build_query( $params, $allowed );
		return $this->request( 'GET', '/orders' . $query );
	}

	/**
	 * Retrieve a single order by ID (includes line items).
	 *
	 * @since 1.0.0
	 * @param int|string $order_id Numeric order ID.
	 * @return array<string,mixed>|WP_Error Order data with items on success, WP_Error on failure.
	 */
	public function get_order( int|string $order_id ): array|WP_Error {
		return $this->request( 'GET', '/orders/' . rawurlencode( (string) $order_id ) );
	}

	/**
	 * Retrieve analytics summary for a time period.
	 *
	 * Supported params:
	 *   - period (string) One of: today, 7d, 30d, 90d. Default 30d.
	 *
	 * @since 1.0.0
	 * @param array<string,mixed> $params Optional query parameters.
	 * @return array<string,mixed>|WP_Error Analytics summary on success, WP_Error on failure.
	 */
	public function get_analytics( array $params = [] ): array|WP_Error {
		$allowed = [ 'period' ];
		// Map legacy 'days' param to 'period' enum for backward compatibility.
		if ( isset( $params['days'] ) && ! isset( $params['period'] ) ) {
			$days_map = [ 1 => 'today', 7 => '7d', 30 => '30d', 90 => '90d' ];
			$days     = (int) $params['days'];
			$params['period'] = $days_map[ $days ] ?? '30d';
		}
		$query = $this->build_query( $params, $allowed );
		return $this->request( 'GET', '/analytics/summary' . $query );
	}

	/**
	 * List webhook endpoints registered for the store.
	 *
	 * @since 1.0.0
	 * @return array<string,mixed>|WP_Error Webhook list on success, WP_Error on failure.
	 */
	public function get_webhooks(): array|WP_Error {
		return $this->request( 'GET', '/webhooks' );
	}

	/**
	 * Create (register) a new webhook endpoint.
	 *
	 * @since 1.0.0
	 * @param string   $url    The HTTPS URL to receive webhook POSTs.
	 * @param string[] $events Event topics, e.g. ['order/created', 'product/updated'].
	 * @param string   $secret HMAC secret used to sign deliveries.
	 * @return array<string,mixed>|WP_Error Created webhook on success, WP_Error on failure.
	 */
	public function create_webhook( string $url, array $events, string $secret ): array|WP_Error {
		return $this->request( 'POST', '/webhooks', [
			'url'    => $url,
			'events' => $events,
			'secret' => $secret,
		] );
	}

	/**
	 * Delete a webhook endpoint by ID.
	 *
	 * @since 1.0.0
	 * @param int|string $webhook_id Numeric webhook ID.
	 * @return true|WP_Error True on success (204 No Content), WP_Error on failure.
	 */
	public function delete_webhook( int|string $webhook_id ): bool|WP_Error {
		$result = $this->request( 'DELETE', '/webhooks/' . rawurlencode( (string) $webhook_id ) );
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		return true;
	}

	// ── Core HTTP transport ───────────────────────────────────────────────────

	/**
	 * Execute an HTTP request against the Ozzyl API.
	 *
	 * - Adds Authorization, Content-Type, and User-Agent headers automatically.
	 * - Retries on 429 (rate limit) and 5xx responses up to MAX_RETRIES times.
	 * - Returns the decoded `data` field from the JSON envelope on success.
	 * - Returns WP_Error with an `ozzyl_api_*` error code on failure.
	 *
	 * @since 1.0.0
	 * @param string               $method  HTTP method: GET, POST, or DELETE.
	 * @param string               $endpoint Path relative to the API base URL (e.g. '/products').
	 * @param array<string,mixed>|null $body   Request body for POST/PATCH. Will be JSON-encoded.
	 * @return array<string,mixed>|WP_Error
	 */
	private function request( string $method, string $endpoint, ?array $body = null ): array|WP_Error {
		if ( empty( $this->api_key ) ) {
			return new WP_Error(
				'ozzyl_api_no_key',
				__( 'Ozzyl API key is not configured. Please add your key in Settings → Ozzyl Commerce.', 'ozzyl-commerce' )
			);
		}

		$url = $this->base_url . $endpoint;

		$args = [
			'method'    => strtoupper( $method ),
			'timeout'   => self::TIMEOUT,
			'sslverify' => true,
			'headers'   => [
				'Authorization' => 'Bearer ' . $this->api_key,
				'Accept'        => 'application/json',
				'User-Agent'    => 'OzzylCommerceWP/' . OZZYL_VERSION . ' WordPress/' . get_bloginfo( 'version' ),
				'X-Ozzyl-Source' => 'wordpress-plugin',
			],
		];

		if ( null !== $body ) {
			$args['headers']['Content-Type'] = 'application/json';
			$args['body']                    = wp_json_encode( $body );
		}

		// Retry loop: attempt up to 1 + MAX_RETRIES times.
		$last_error = null;
		for ( $attempt = 0; $attempt <= self::MAX_RETRIES; $attempt++ ) {
			// Exponential back-off before retries (not before the first attempt).
			if ( $attempt > 0 ) {
				$delay_ms = (int) min( 500 * ( 2 ** ( $attempt - 1 ) ), 5000 );
				usleep( $delay_ms * 1000 );
			}

			$response = wp_remote_request( $url, $args );

			// Network / transport error.
			if ( is_wp_error( $response ) ) {
				$last_error = new WP_Error(
					'ozzyl_api_network',
					sprintf(
						/* translators: 1: HTTP method. 2: Endpoint. 3: Error message. */
						__( '[Ozzyl] Network error on %1$s %2$s: %3$s', 'ozzyl-commerce' ),
						esc_html( $method ),
						esc_html( $endpoint ),
						$response->get_error_message()
					)
				);
				// Retry network errors.
				continue;
			}

			$status_code = (int) wp_remote_retrieve_response_code( $response );
			$raw_body    = wp_remote_retrieve_body( $response );

			// 204 No Content — success with no body (e.g. DELETE).
			if ( 204 === $status_code ) {
				return [];
			}

			// Parse JSON body.
			$decoded = json_decode( $raw_body, true );
			if ( JSON_ERROR_NONE !== json_last_error() ) {
				$last_error = new WP_Error(
					'ozzyl_api_invalid_json',
					sprintf(
						/* translators: HTTP status code. */
						__( '[Ozzyl] Received non-JSON response (HTTP %d).', 'ozzyl-commerce' ),
						$status_code
					)
				);
				if ( $this->is_retryable( $status_code ) ) {
					continue;
				}
				break;
			}

			// Successful response (2xx).
			if ( $status_code >= 200 && $status_code < 300 ) {
				// Return the `data` key if present, otherwise the full decoded body.
				return $decoded['data'] ?? $decoded;
			}

			// ── Error responses ──────────────────────────────────────────────

			$api_message = $decoded['error'] ?? sprintf(
				/* translators: HTTP status code. */
				__( 'Unexpected HTTP status %d from Ozzyl API.', 'ozzyl-commerce' ),
				$status_code
			);

			// 401 / 403 — authentication / authorisation error.
			if ( 401 === $status_code || 403 === $status_code ) {
				error_log( sprintf( '[Ozzyl] Auth error %d on %s %s: %s', $status_code, $method, $endpoint, $api_message ) );
				return new WP_Error(
					'ozzyl_api_auth',
					sprintf(
						/* translators: 1: HTTP status. 2: API error message. */
						__( '[Ozzyl] Authentication failed (HTTP %1$d): %2$s', 'ozzyl-commerce' ),
						$status_code,
						$api_message
					)
				);
			}

			// 404 — resource not found.
			if ( 404 === $status_code ) {
				return new WP_Error(
					'ozzyl_api_not_found',
					sprintf(
						/* translators: Endpoint path. */
						__( '[Ozzyl] Resource not found: %s', 'ozzyl-commerce' ),
						esc_html( $endpoint )
					)
				);
			}

			// 400 — validation error.
			if ( 400 === $status_code ) {
				return new WP_Error(
					'ozzyl_api_validation',
					sprintf(
						/* translators: API error message. */
						__( '[Ozzyl] Validation error: %s', 'ozzyl-commerce' ),
						$api_message
					)
				);
			}

			// 429 / 5xx — retryable.
			$last_error = new WP_Error(
				'ozzyl_api_error_' . $status_code,
				sprintf(
					/* translators: 1: HTTP status. 2: API error message. */
					__( '[Ozzyl] API error (HTTP %1$d): %2$s', 'ozzyl-commerce' ),
					$status_code,
					$api_message
				)
			);

			if ( $this->is_retryable( $status_code ) && $attempt < self::MAX_RETRIES ) {
				error_log( sprintf( '[Ozzyl] Retryable error %d on %s %s (attempt %d).', $status_code, $method, $endpoint, $attempt + 1 ) );
				continue;
			}

			break;
		}

		// All attempts exhausted.
		if ( $last_error instanceof WP_Error ) {
			error_log( sprintf( '[Ozzyl] Request failed after %d attempts: %s %s — %s', self::MAX_RETRIES + 1, $method, $endpoint, $last_error->get_error_message() ) );
			return $last_error;
		}

		return new WP_Error( 'ozzyl_api_unknown', __( '[Ozzyl] Unknown API error.', 'ozzyl-commerce' ) );
	}

	// ── Helpers ───────────────────────────────────────────────────────────────

	/**
	 * Build a URL query string from an array of parameters, allowing only specified keys.
	 *
	 * @since 1.0.0
	 * @param array<string,mixed> $params  Raw parameters.
	 * @param string[]            $allowed Whitelist of allowed parameter names.
	 * @return string Query string with leading '?' or empty string.
	 */
	private function build_query( array $params, array $allowed ): string {
		$clean = [];
		foreach ( $allowed as $key ) {
			if ( isset( $params[ $key ] ) ) {
				$value = $params[ $key ];
				// Booleans → 'true' / 'false'.
				if ( is_bool( $value ) ) {
					$value = $value ? 'true' : 'false';
				}
				$clean[ $key ] = (string) $value;
			}
		}
		return empty( $clean ) ? '' : '?' . http_build_query( $clean );
	}

	/**
	 * Return true for HTTP status codes that should be retried.
	 *
	 * @since 1.0.0
	 * @param int $status HTTP status code.
	 * @return bool
	 */
	private function is_retryable( int $status ): bool {
		return in_array( $status, [ 429, 500, 502, 503, 504 ], true );
	}
}
