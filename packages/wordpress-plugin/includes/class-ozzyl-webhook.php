<?php
/**
 * Ozzyl Webhook Receiver
 *
 * Registers a WordPress REST API endpoint at:
 *   POST /wp-json/ozzyl/v1/webhook
 *
 * Verifies the HMAC-SHA256 signature sent in the `Ozzyl-Signature` header,
 * prevents replay attacks (5-minute window), then fires WordPress actions so
 * other code can react to Ozzyl events without modifying this class.
 *
 * Signature header format:
 *   Ozzyl-Signature: t=1706745600,v1=abc123def456...
 *
 * Verification algorithm (mirrors the TypeScript SDK):
 *   payload_to_sign = timestamp + "." + raw_request_body
 *   expected        = HMAC-SHA256( payload_to_sign, webhook_secret )
 *   valid           = hash_equals( expected, v1 ) && |now - t| < 300
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ozzyl_Webhook — REST endpoint and HMAC verifier for incoming Ozzyl webhooks.
 *
 * @since 1.0.0
 */
class Ozzyl_Webhook {

	// ── Constants ─────────────────────────────────────────────────────────────

	/** REST namespace. */
	private const REST_NAMESPACE = 'ozzyl/v1';

	/** REST route. */
	private const REST_ROUTE = '/webhook';

	/** Maximum age of a signature in seconds (replay-attack window). */
	private const SIGNATURE_MAX_AGE = 300;

	/** Transient prefix used for idempotency / deduplication. */
	private const DEDUP_PREFIX = 'ozzyl_wh_seen_';

	/** How long to remember a processed delivery ID (seconds). */
	private const DEDUP_TTL = 600;

	// ── Constructor ───────────────────────────────────────────────────────────

	/**
	 * Register REST route on construction.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_action( 'rest_api_init', array( $this, 'register_route' ) );
	}

	// ── REST route registration ───────────────────────────────────────────────

	/**
	 * Register the /wp-json/ozzyl/v1/webhook endpoint.
	 *
	 * No authentication is required here — we rely exclusively on HMAC
	 * signature verification to authenticate incoming requests.
	 *
	 * @since 1.0.0
	 */
	public function register_route(): void {
		register_rest_route(
			self::REST_NAMESPACE,
			self::REST_ROUTE,
			[
				'methods'             => WP_REST_Server::CREATABLE, // POST only.
				'callback'            => array( $this, 'handle_webhook' ),
				'permission_callback' => '__return_true', // Auth via HMAC signature.
			]
		);
	}

	// ── Webhook handler ───────────────────────────────────────────────────────

	/**
	 * Handle an incoming webhook POST request.
	 *
	 * Steps:
	 *  1. Read the raw request body (before WP parses it).
	 *  2. Verify HMAC-SHA256 signature.
	 *  3. Deduplicate by delivery ID.
	 *  4. Dispatch WordPress actions based on the event type.
	 *
	 * @since 1.0.0
	 * @param WP_REST_Request $request Incoming REST request.
	 * @return WP_REST_Response
	 */
	public function handle_webhook( WP_REST_Request $request ): WP_REST_Response {
		// ── 1. Read raw body ─────────────────────────────────────────────────
		$raw_body = $request->get_body();

		if ( empty( $raw_body ) ) {
			error_log( '[Ozzyl] Webhook received with empty body.' );
			return new WP_REST_Response( [ 'error' => 'Empty request body.' ], 400 );
		}

		// ── 2. Verify HMAC signature ─────────────────────────────────────────
		$signature_header = $request->get_header( 'Ozzyl-Signature' );

		if ( empty( $signature_header ) ) {
			error_log( '[Ozzyl] Webhook rejected: missing Ozzyl-Signature header.' );
			return new WP_REST_Response( [ 'error' => 'Missing signature.' ], 401 );
		}

		$secret = (string) get_option( 'ozzyl_webhook_secret', '' );

		if ( empty( $secret ) ) {
			error_log( '[Ozzyl] Webhook rejected: webhook secret not configured.' );
			return new WP_REST_Response( [ 'error' => 'Webhook not configured.' ], 500 );
		}

		if ( ! $this->verify_signature( $raw_body, $signature_header, $secret ) ) {
			error_log( '[Ozzyl] Webhook rejected: invalid or expired signature.' );
			return new WP_REST_Response( [ 'error' => 'Invalid signature.' ], 401 );
		}

		// ── 3. Parse JSON payload ────────────────────────────────────────────
		$payload = json_decode( $raw_body, true );

		if ( JSON_ERROR_NONE !== json_last_error() || ! is_array( $payload ) ) {
			error_log( '[Ozzyl] Webhook rejected: invalid JSON payload.' );
			return new WP_REST_Response( [ 'error' => 'Invalid JSON payload.' ], 400 );
		}

		// ── 4. Deduplicate ───────────────────────────────────────────────────
		$delivery_id = sanitize_text_field( $payload['deliveryId'] ?? '' );

		if ( ! empty( $delivery_id ) ) {
			$transient_key = self::DEDUP_PREFIX . hash( 'sha256', $delivery_id );
			if ( get_transient( $transient_key ) ) {
				// Already processed — acknowledge without reprocessing.
				error_log( sprintf( '[Ozzyl] Duplicate webhook delivery ignored: %s', $delivery_id ) );
				return new WP_REST_Response( [ 'ok' => true, 'duplicate' => true ], 200 );
			}
			// Mark as seen.
			set_transient( $transient_key, '1', self::DEDUP_TTL );
		}

		// ── 5. Dispatch event actions ────────────────────────────────────────
		$event_type = sanitize_text_field( $payload['event'] ?? $payload['type'] ?? '' );
		$event_data = $payload['data'] ?? $payload;

		error_log( sprintf( '[Ozzyl] Webhook received: event=%s delivery=%s', $event_type, $delivery_id ) );

		$this->dispatch_event( $event_type, $event_data, $payload );

		return new WP_REST_Response( [ 'ok' => true ], 200 );
	}

	// ── Signature verification ────────────────────────────────────────────────

	/**
	 * Verify an Ozzyl webhook HMAC-SHA256 signature.
	 *
	 * Parses the `t=<timestamp>,v1=<hex>` header format, checks the replay
	 * window (MAX_AGE seconds), then computes and compares the expected HMAC.
	 *
	 * @since 1.0.0
	 * @param string $payload           Raw request body string.
	 * @param string $signature_header  Full value of the Ozzyl-Signature header.
	 * @param string $secret            The webhook secret to sign with.
	 * @return bool True if signature is valid and within the replay window.
	 */
	public function verify_signature( string $payload, string $signature_header, string $secret ): bool {
		if ( empty( $payload ) || empty( $signature_header ) || empty( $secret ) ) {
			return false;
		}

		// Parse: "t=1706745600,v1=abc123..."
		$timestamp  = null;
		$v1_sig     = null;

		$parts = explode( ',', $signature_header );
		foreach ( $parts as $part ) {
			$part = trim( $part );
			$eq   = strpos( $part, '=' );
			if ( false === $eq ) {
				continue;
			}
			$key   = substr( $part, 0, $eq );
			$value = substr( $part, $eq + 1 );

			if ( 't' === $key ) {
				$timestamp = $value;
			} elseif ( 'v1' === $key ) {
				$v1_sig = $value;
			}
		}

		if ( null === $timestamp || null === $v1_sig ) {
			error_log( '[Ozzyl] Signature verification failed: could not parse t= or v1= fields.' );
			return false;
		}

		// Validate timestamp is numeric.
		if ( ! ctype_digit( $timestamp ) ) {
			error_log( '[Ozzyl] Signature verification failed: non-numeric timestamp.' );
			return false;
		}

		// Replay-attack prevention: reject signatures older than MAX_AGE seconds.
		$ts_int = (int) $timestamp;
		$age    = abs( time() - $ts_int );

		if ( $age > self::SIGNATURE_MAX_AGE ) {
			error_log( sprintf( '[Ozzyl] Signature verification failed: timestamp too old (%ds > %ds).', $age, self::SIGNATURE_MAX_AGE ) );
			return false;
		}

		// Compute expected HMAC: sign "${timestamp}.${raw_body}" with the secret.
		$message  = $timestamp . '.' . $payload;
		$expected = hash_hmac( 'sha256', $message, $secret );

		// Timing-safe comparison — prevents timing side-channel attacks.
		if ( ! hash_equals( $expected, $v1_sig ) ) {
			error_log( '[Ozzyl] Signature verification failed: HMAC mismatch.' );
			return false;
		}

		return true;
	}

	// ── Event dispatcher ──────────────────────────────────────────────────────

	/**
	 * Translate an Ozzyl event type into one or more WordPress actions.
	 *
	 * Third-party code can hook into these actions without modifying this plugin:
	 *
	 *   add_action( 'ozzyl_order_created',   fn( $order, $raw ) => ... );
	 *   add_action( 'ozzyl_order_updated',   fn( $order, $raw ) => ... );
	 *   add_action( 'ozzyl_order_cancelled', fn( $order, $raw ) => ... );
	 *   add_action( 'ozzyl_order_delivered', fn( $order, $raw ) => ... );
	 *   add_action( 'ozzyl_product_created', fn( $product, $raw ) => ... );
	 *   add_action( 'ozzyl_product_updated', fn( $product, $raw ) => ... );
	 *   add_action( 'ozzyl_product_deleted', fn( $product, $raw ) => ... );
	 *   add_action( 'ozzyl_customer_created',fn( $customer, $raw ) => ... );
	 *   add_action( 'ozzyl_customer_updated',fn( $customer, $raw ) => ... );
	 *   add_action( 'ozzyl_webhook',         fn( $event, $data, $raw ) => ... ); // catch-all
	 *
	 * @since 1.0.0
	 * @param string               $event_type  Ozzyl event slug, e.g. 'order/created'.
	 * @param array<string,mixed>  $event_data  The `data` payload for this event.
	 * @param array<string,mixed>  $raw_payload Full decoded webhook payload.
	 */
	private function dispatch_event( string $event_type, array $event_data, array $raw_payload ): void {
		// Map Ozzyl event types → WordPress action tags.
		$action_map = [
			'order/created'   => 'ozzyl_order_created',
			'order/updated'   => 'ozzyl_order_updated',
			'order/cancelled' => 'ozzyl_order_cancelled',
			'order/delivered' => 'ozzyl_order_delivered',
			'product/created' => 'ozzyl_product_created',
			'product/updated' => 'ozzyl_product_updated',
			'product/deleted' => 'ozzyl_product_deleted',
			'customer/created'=> 'ozzyl_customer_created',
			'customer/updated'=> 'ozzyl_customer_updated',
		];

		if ( isset( $action_map[ $event_type ] ) ) {
			/**
			 * Fires when a specific Ozzyl webhook event is received and verified.
			 *
			 * @since 1.0.0
			 * @param array<string,mixed> $event_data  Decoded event data object.
			 * @param array<string,mixed> $raw_payload Full webhook payload.
			 */
			do_action( $action_map[ $event_type ], $event_data, $raw_payload );
		} else {
			error_log( sprintf( '[Ozzyl] Unrecognised webhook event type: %s', $event_type ) );
		}

		/**
		 * Catch-all action — fires for every verified Ozzyl webhook event.
		 *
		 * @since 1.0.0
		 * @param string              $event_type  The event type slug.
		 * @param array<string,mixed> $event_data  Decoded event data object.
		 * @param array<string,mixed> $raw_payload Full webhook payload.
		 */
		do_action( 'ozzyl_webhook', $event_type, $event_data, $raw_payload );
	}

	// ── Helpers ───────────────────────────────────────────────────────────────

	/**
	 * Return the full URL of the webhook receiver endpoint for display in the UI.
	 *
	 * @since 1.0.0
	 * @return string Fully-qualified URL.
	 */
	public static function get_webhook_url(): string {
		return rest_url( self::REST_NAMESPACE . self::REST_ROUTE );
	}
}
