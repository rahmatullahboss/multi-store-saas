/**
 * Ozzyl Commerce — Public Widget Loader
 *
 * Loaded on the front end when an [ozzyl_store] shortcode or block is present.
 * Responsibilities:
 *  - Auto-resize the Ozzyl iframe based on postMessage events from the embed.
 *  - Handle cross-origin communication between WordPress and the Ozzyl storefront.
 *  - Smooth scroll to the iframe when the embed signals navigation.
 *
 * No external dependencies. Vanilla JS only.
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

/* global ozzylWidget */

( function () {
	'use strict';

	// ── Config ───────────────────────────────────────────────────────────────

	const config = window.ozzylWidget || {};

	/** Trusted origins for postMessage events. */
	const TRUSTED_ORIGINS = [
		'https://ozzyl.com',
		'https://api.ozzyl.com',
	];

	// Dynamically add store-specific origins from site URL.
	if ( config.siteUrl ) {
		const origin = new URL( config.siteUrl ).origin;
		if ( ! TRUSTED_ORIGINS.includes( origin ) ) {
			TRUSTED_ORIGINS.push( origin );
		}
	}

	// ── Helpers ───────────────────────────────────────────────────────────────

	/**
	 * Return true if an event origin is trusted.
	 *
	 * Allows any *.ozzyl.com subdomain.
	 *
	 * @param {string} origin
	 * @returns {boolean}
	 */
	function isTrustedOrigin( origin ) {
		if ( TRUSTED_ORIGINS.includes( origin ) ) {
			return true;
		}
		// Allow all *.ozzyl.com subdomains.
		try {
			const url = new URL( origin );
			return url.hostname.endsWith( '.ozzyl.com' );
		} catch {
			return false;
		}
	}

	/**
	 * Find the iframe element that sent a postMessage event.
	 *
	 * @param {MessageEvent} event
	 * @returns {HTMLIFrameElement|null}
	 */
	function findIframeBySource( event ) {
		const iframes = document.querySelectorAll( '.ozzyl-store-iframe' );
		for ( const iframe of iframes ) {
			if ( iframe.contentWindow === event.source ) {
				return iframe;
			}
		}
		return null;
	}

	/**
	 * Smoothly scroll the page so the iframe wrapper is in view.
	 *
	 * @param {HTMLIFrameElement} iframe
	 */
	function scrollToIframe( iframe ) {
		const wrapper = iframe.closest( '.ozzyl-widget-wrapper' );
		const target  = wrapper || iframe;
		target.scrollIntoView( { behavior: 'smooth', block: 'start' } );
	}

	// ── postMessage handler ───────────────────────────────────────────────────

	/**
	 * Handle messages from the embedded Ozzyl iframe.
	 *
	 * Supported message types (sent by the Ozzyl storefront):
	 *
	 *   { type: 'ozzyl:resize',    height: number }
	 *     → Resize the iframe to the given pixel height.
	 *
	 *   { type: 'ozzyl:navigate',  path: string }
	 *     → The user navigated within the embed (for analytics/scroll).
	 *
	 *   { type: 'ozzyl:cart_updated', count: number }
	 *     → Cart item count changed; update any cart badge on the host page.
	 *
	 *   { type: 'ozzyl:checkout_complete', orderId: string }
	 *     → Order was placed successfully.
	 *
	 *   { type: 'ozzyl:ready' }
	 *     → Iframe finished loading and is ready to receive messages.
	 *
	 * @param {MessageEvent} event
	 */
	function onMessage( event ) {
		// Security: ignore untrusted origins.
		if ( ! isTrustedOrigin( event.origin ) ) {
			return;
		}

		const data = event.data;

		// Ignore non-object or non-Ozzyl messages.
		if ( ! data || typeof data !== 'object' || ! String( data.type ).startsWith( 'ozzyl:' ) ) {
			return;
		}

		const iframe = findIframeBySource( event );

		switch ( data.type ) {

			case 'ozzyl:resize': {
				const height = parseInt( data.height, 10 );
				if ( iframe && ! isNaN( height ) && height >= 100 ) {
					iframe.style.height = height + 'px';
				}
				break;
			}

			case 'ozzyl:navigate': {
				// Optional: scroll to the embed on navigation events.
				if ( iframe && data.scroll ) {
					scrollToIframe( iframe );
				}
				// Dispatch a custom DOM event so theme JS can react.
				document.dispatchEvent( new CustomEvent( 'ozzyl:navigate', {
					detail: { path: data.path, origin: event.origin },
					bubbles: true,
				} ) );
				break;
			}

			case 'ozzyl:cart_updated': {
				const count = parseInt( data.count, 10 ) || 0;
				// Update cart badge elements (common selectors for WooCommerce themes).
				const cartBadges = document.querySelectorAll(
					'.cart-contents-count, .woocommerce-cart-count, [data-ozzyl-cart-count]'
				);
				cartBadges.forEach( function ( el ) {
					el.textContent = count;
					el.setAttribute( 'data-ozzyl-cart-count', String( count ) );
				} );
				// Dispatch custom event.
				document.dispatchEvent( new CustomEvent( 'ozzyl:cart_updated', {
					detail: { count },
					bubbles: true,
				} ) );
				break;
			}

			case 'ozzyl:checkout_complete': {
				document.dispatchEvent( new CustomEvent( 'ozzyl:checkout_complete', {
					detail: { orderId: data.orderId },
					bubbles: true,
				} ) );
				break;
			}

			case 'ozzyl:ready': {
				// Acknowledge: send site info back to the iframe.
				if ( iframe && iframe.contentWindow ) {
					iframe.contentWindow.postMessage( {
						type:      'ozzyl:host_info',
						siteUrl:   config.siteUrl  || window.location.origin,
						pageUrl:   window.location.href,
						version:   config.version  || '1.0.0',
					}, event.origin );
				}
				break;
			}

			default:
				// Unknown message type — silently ignore.
				break;
		}
	}

	// ── Init ─────────────────────────────────────────────────────────────────

	/**
	 * Initialise the widget loader.
	 */
	function init() {
		// Listen for postMessages from Ozzyl iframes.
		window.addEventListener( 'message', onMessage, false );

		// Set initial iframe heights from the data attribute if provided.
		document.querySelectorAll( '.ozzyl-store-iframe' ).forEach( function ( iframe ) {
			// Make iframes slightly taller than their container on mobile if needed.
			if ( window.innerWidth < 480 && parseInt( iframe.height, 10 ) > 600 ) {
				iframe.style.height = '480px';
			}
		} );
	}

	// Run on DOMContentLoaded or immediately if already loaded.
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', init );
	} else {
		init();
	}

} )();
