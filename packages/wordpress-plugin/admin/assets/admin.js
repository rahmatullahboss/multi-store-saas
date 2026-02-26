/**
 * Ozzyl Commerce — Admin JavaScript
 *
 * Handles:
 *  - Test Connection button
 *  - Copy Webhook URL button
 *  - Auto-Register Webhook button
 *  - Manual sync buttons (import products, export orders)
 *  - Status page live refresh
 *  - API key show/hide toggle
 *
 * Requires: jQuery (loaded by WordPress), ozzylAdmin (localized via wp_localize_script)
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

/* global ozzylAdmin, jQuery */

( function ( $, config ) {
	'use strict';

	// ── Helpers ─────────────────────────────────────────────────────────────

	/**
	 * Make an authenticated REST API request.
	 *
	 * @param {string} method   HTTP method.
	 * @param {string} endpoint Path relative to config.restUrl.
	 * @param {Object} [data]   Request body (for POST).
	 * @returns {jQuery.Deferred}
	 */
	function restRequest( method, endpoint, data ) {
		const opts = {
			url: config.restUrl + endpoint,
			method: method.toUpperCase(),
			beforeSend: function ( xhr ) {
				xhr.setRequestHeader( 'X-WP-Nonce', config.nonce );
			},
		};
		if ( data !== undefined ) {
			opts.contentType = 'application/json';
			opts.data        = JSON.stringify( data );
		}
		return $.ajax( opts );
	}

	/**
	 * Show an inline result message next to a button.
	 *
	 * @param {jQuery} $el      Target element.
	 * @param {string} message  Text to display.
	 * @param {'success'|'error'} type  CSS modifier.
	 * @param {number} [ttl=4000]  Auto-hide delay ms (0 = never).
	 */
	function showResult( $el, message, type, ttl ) {
		$el
			.text( message )
			.removeClass( 'ozzyl-result-success ozzyl-result-error' )
			.addClass( 'ozzyl-result-' + type )
			.show();

		if ( ttl !== 0 ) {
			setTimeout( function () {
				$el.fadeOut( 300 );
			}, ttl || 4000 );
		}
	}

	/**
	 * Set a button into loading state (disable + add class).
	 *
	 * @param {jQuery} $btn
	 * @param {string} label Loading label text.
	 */
	function btnLoading( $btn, label ) {
		$btn
			.data( 'original-text', $btn.text() )
			.text( label )
			.addClass( 'ozzyl-loading' )
			.prop( 'disabled', true );
	}

	/**
	 * Restore a button from its loading state.
	 *
	 * @param {jQuery} $btn
	 */
	function btnDone( $btn ) {
		$btn
			.text( $btn.data( 'original-text' ) || $btn.text() )
			.removeClass( 'ozzyl-loading' )
			.prop( 'disabled', false );
	}

	// ── On DOM ready ─────────────────────────────────────────────────────────

	$( function () {

		// ── API key show/hide toggle ────────────────────────────────────────

		$( '#ozzyl-toggle-key' ).on( 'click', function () {
			const $input = $( '#ozzyl_api_key' );
			const isPassword = $input.attr( 'type' ) === 'password';
			$input.attr( 'type', isPassword ? 'text' : 'password' );
			$( this ).text( isPassword ? 'Hide' : 'Show' );
		} );

		// ── Test connection ─────────────────────────────────────────────────

		$( '#ozzyl-test-connection' ).on( 'click', function () {
			const $btn    = $( this );
			const $dot    = $( '#ozzyl-status-dot' );
			const $label  = $( '#ozzyl-status-text' );
			const $result = $( '#ozzyl-test-result' );

			btnLoading( $btn, config.i18n.testing );
			$dot.removeClass( 'ozzyl-status-connected ozzyl-status-disconnected' )
				.addClass( 'ozzyl-status-checking' );
			$label.text( config.i18n.testing );
			$result.hide();

			restRequest( 'GET', '/admin/test-connection' )
				.done( function ( res ) {
					btnDone( $btn );

					if ( res && res.connected ) {
						$dot.removeClass( 'ozzyl-status-checking' ).addClass( 'ozzyl-status-connected' );
						$label.text( config.i18n.connected );

						const storeName = res.store ? res.store.name : '';
						showResult(
							$result,
							config.i18n.connected + ( storeName ? ' — ' + storeName : '' ),
							'success'
						);
					} else {
						$dot.removeClass( 'ozzyl-status-checking' ).addClass( 'ozzyl-status-disconnected' );
						$label.text( config.i18n.failed );
						showResult( $result, config.i18n.failed, 'error' );
					}
				} )
				.fail( function () {
					btnDone( $btn );
					$dot.removeClass( 'ozzyl-status-checking' ).addClass( 'ozzyl-status-disconnected' );
					$label.text( config.i18n.failed );
					showResult( $result, config.i18n.failed, 'error' );
				} );
		} );

		// ── Copy webhook URL ────────────────────────────────────────────────

		$( '#ozzyl-copy-webhook-url' ).on( 'click', function () {
			const $btn = $( this );
			const url  = $( '#ozzyl-webhook-url' ).val();

			if ( navigator.clipboard && url ) {
				navigator.clipboard.writeText( url ).then( function () {
					const original = $btn.text();
					$btn.text( config.i18n.copying );
					setTimeout( function () {
						$btn.text( original );
					}, 2000 );
				} );
			} else {
				// Fallback: select the text.
				$( '#ozzyl-webhook-url' ).select();
			}
		} );

		// ── Register webhook ────────────────────────────────────────────────

		$( '#ozzyl-register-webhook' ).on( 'click', function () {
			const $btn    = $( this );
			const $result = $( '#ozzyl-webhook-result' );

			if ( ! window.confirm( 'Register this WordPress site as a webhook receiver in your Ozzyl store?' ) ) {
				return;
			}

			btnLoading( $btn, config.i18n.registeringWh );

			restRequest( 'POST', '/admin/register-webhook' )
				.done( function ( res ) {
					btnDone( $btn );
					if ( res && res.success ) {
						showResult( $result, config.i18n.whRegistered, 'success', 0 );
					} else {
						showResult( $result, res.message || config.i18n.whFailed, 'error' );
					}
				} )
				.fail( function () {
					btnDone( $btn );
					showResult( $result, config.i18n.whFailed, 'error' );
				} );
		} );

		// ── Import products ─────────────────────────────────────────────────

		$( '#ozzyl-import-products' ).on( 'click', function () {
			const $btn    = $( this );
			const $result = $( '#ozzyl-sync-result' );

			btnLoading( $btn, config.i18n.syncing );
			$result.hide();

			restRequest( 'POST', '/sync/import-products', { limit: 50 } )
				.done( function ( res ) {
					btnDone( $btn );
					if ( res && res.success ) {
						const msg = 'Imported: ' + res.imported + ' | Updated: ' + res.updated +
							( res.skipped ? ' | Skipped: ' + res.skipped : '' ) +
							( res.errors && res.errors.length ? ' | Errors: ' + res.errors.length : '' );
						showResult( $result, msg, res.errors && res.errors.length ? 'error' : 'success', 0 );
					} else {
						showResult( $result, config.i18n.syncFailed, 'error' );
					}
				} )
				.fail( function () {
					btnDone( $btn );
					showResult( $result, config.i18n.syncFailed, 'error' );
				} );
		} );

		// ── Export orders ───────────────────────────────────────────────────

		$( '#ozzyl-export-orders' ).on( 'click', function () {
			const $btn    = $( this );
			const $result = $( '#ozzyl-sync-result' );

			btnLoading( $btn, config.i18n.syncing );
			$result.hide();

			restRequest( 'POST', '/sync/export-orders', { limit: 50 } )
				.done( function ( res ) {
					btnDone( $btn );
					if ( res && res.success ) {
						const msg = 'Exported: ' + res.exported +
							( res.errors && res.errors.length ? ' | Errors: ' + res.errors.length : '' );
						showResult( $result, msg, res.errors && res.errors.length ? 'error' : 'success', 0 );
					} else {
						showResult( $result, config.i18n.syncFailed, 'error' );
					}
				} )
				.fail( function () {
					btnDone( $btn );
					showResult( $result, config.i18n.syncFailed, 'error' );
				} );
		} );

		// ── Status page: load live status ───────────────────────────────────

		if ( $( '#ozzyl-status-page' ).length ) {
			loadStatus();

			$( '#ozzyl-refresh-status' ).on( 'click', function () {
				loadStatus();
			} );
		}

		/**
		 * Fetch /admin/status and populate the status page cards.
		 */
		function loadStatus() {
			const $badge    = $( '#ozzyl-connection-badge' );
			const $name     = $( '#ozzyl-store-name' );
			const $details  = $( '#ozzyl-store-details' );

			if ( $badge.length ) {
				$badge.text( 'Checking…' )
					.removeClass( 'ozzyl-badge--success ozzyl-badge--error ozzyl-badge--warning' )
					.addClass( 'ozzyl-badge--pending' );
			}

			restRequest( 'GET', '/admin/status' )
				.done( function ( res ) {
					if ( ! res || ! res.success ) {
						return;
					}

					// Connection badge.
					if ( $badge.length ) {
						if ( res.connected ) {
							$badge.text( 'Connected ✓' )
								.removeClass( 'ozzyl-badge--pending ozzyl-badge--error ozzyl-badge--warning' )
								.addClass( 'ozzyl-badge--success' );
						} else {
							$badge.text( 'Not connected' )
								.removeClass( 'ozzyl-badge--pending ozzyl-badge--success ozzyl-badge--warning' )
								.addClass( 'ozzyl-badge--error' );
						}
					}

					// Store name in connection card.
					if ( $name.length && res.store ) {
						$name.text( res.store.name );
					}

					// Store details table.
					if ( res.store && $details.length ) {
						$( '#ozzyl-store-detail-name' ).text( res.store.name || '—' );
						$( '#ozzyl-store-detail-subdomain' ).text( res.store.subdomain || '—' );
						$( '#ozzyl-store-detail-domain' ).text( res.store.customDomain || '—' );
						$( '#ozzyl-store-detail-currency' ).text( res.store.currency || '—' );
						$( '#ozzyl-store-detail-plan' ).text( res.store.planType || '—' );
						$( '#ozzyl-store-detail-status' ).text( res.store.subscriptionStatus || '—' );
						$details.show();
					}
				} )
				.fail( function () {
					if ( $badge.length ) {
						$badge.text( 'Error fetching status' )
							.removeClass( 'ozzyl-badge--pending ozzyl-badge--success ozzyl-badge--warning' )
							.addClass( 'ozzyl-badge--error' );
					}
				} );
		}

	} ); // end DOM ready

} )( jQuery, window.ozzylAdmin || {} );
