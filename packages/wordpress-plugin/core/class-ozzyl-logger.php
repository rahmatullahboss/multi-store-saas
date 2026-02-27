<?php
/**
 * Ozzyl Debug Logger
 *
 * Simple logging utility that respects WordPress WP_DEBUG setting.
 * Only logs when WP_DEBUG is true; silent otherwise.
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ozzyl_Logger — Static logging utility for debug output.
 *
 * Usage:
 *   Ozzyl_Logger::info( 'Order processed', [ 'order_id' => 123 ] );
 *   Ozzyl_Logger::warning( 'Suspicious activity', [ 'reason' => 'high_risk_score' ] );
 *   Ozzyl_Logger::error( 'API timeout', [ 'endpoint' => '/fraud/check' ] );
 *
 * @since 1.0.0
 */
class Ozzyl_Logger {

	/**
	 * Log an informational message.
	 *
	 * @since 1.0.0
	 * @param string              $message Human-readable message.
	 * @param array<string,mixed> $context Optional contextual data.
	 * @return void
	 */
	public static function info( string $message, array $context = [] ): void {
		self::log( 'INFO', $message, $context );
	}

	/**
	 * Log a warning message.
	 *
	 * @since 1.0.0
	 * @param string              $message Human-readable message.
	 * @param array<string,mixed> $context Optional contextual data.
	 * @return void
	 */
	public static function warning( string $message, array $context = [] ): void {
		self::log( 'WARNING', $message, $context );
	}

	/**
	 * Log an error message.
	 *
	 * @since 1.0.0
	 * @param string              $message Human-readable message.
	 * @param array<string,mixed> $context Optional contextual data.
	 * @return void
	 */
	public static function error( string $message, array $context = [] ): void {
		self::log( 'ERROR', $message, $context );
	}

	/**
	 * Internal logging implementation.
	 *
	 * Only logs when WP_DEBUG is true. Formats output as:
	 * [Ozzyl][LEVEL] message {json_context}
	 *
	 * @since 1.0.0
	 * @param string              $level   Log level: INFO, WARNING, ERROR.
	 * @param string              $message Human-readable message.
	 * @param array<string,mixed> $context Contextual data.
	 * @return void
	 */
	private static function log( string $level, string $message, array $context ): void {
		if ( ! defined( 'WP_DEBUG' ) || ! WP_DEBUG ) {
			return;
		}

		$log_message = sprintf(
			'[Ozzyl][%s] %s',
			strtoupper( $level ),
			$message
		);

		if ( ! empty( $context ) ) {
			$log_message .= ' ' . wp_json_encode( $context );
		}

		error_log( $log_message );
	}
}
