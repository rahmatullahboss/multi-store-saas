/**
 * Ozzyl Server-Side Tracking Script
 *
 * Captures Meta/Facebook cookies (_fbp, _fbc) before checkout.
 * Stores them in sessionStorage for transmission to server.
 *
 * @package OzzylCommerce\Modules
 * @since   1.0.0
 */

(function () {
	'use strict';

	/**
	 * Get a cookie value by name.
	 *
	 * @param {string} name Cookie name.
	 * @return {string|null} Cookie value or null if not found.
	 */
	function getCookie(name) {
		const value = '; ' + document.cookie;
		const parts = value.split('; ' + name + '=');
		if (parts.length === 2) {
			return parts.pop().split(';').shift();
		}
		return null;
	}

	/**
	 * Generate a simple session ID if not already present.
	 *
	 * @return {string} Session ID.
	 */
	function getOrCreateSessionId() {
		let sessionId = sessionStorage.getItem('ozzyl_session_id');
		if (!sessionId) {
			sessionId = 'ozzyl_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
			sessionStorage.setItem('ozzyl_session_id', sessionId);
		}
		return sessionId;
	}

	/**
	 * Initialize tracking.
	 * Capture cookies and store in sessionStorage.
	 */
	function init() {
		// Capture Meta cookies.
		const fbp = getCookie('_fbp');
		const fbc = getCookie('_fbc');
		const sessionId = getOrCreateSessionId();

		// Store in sessionStorage.
		if (fbp) {
			sessionStorage.setItem('ozzyl_fbp', fbp);
		}
		if (fbc) {
			sessionStorage.setItem('ozzyl_fbc', fbc);
		}

		// Expose to window for other scripts if needed.
		window.ozzylTracking = {
			fbp: fbp,
			fbc: fbc,
			sessionId: sessionId,
		};

		// Add hidden form fields to WC checkout form if on checkout page.
		if (document.querySelector('form.checkout')) {
			addHiddenFieldsToCheckout();
		}
	}

	/**
	 * Add hidden input fields to WC checkout form.
	 * These will be transmitted to the server on form submission.
	 */
	function addHiddenFieldsToCheckout() {
		const form = document.querySelector('form.checkout');
		if (!form) {
			return;
		}

		const fbp = sessionStorage.getItem('ozzyl_fbp');
		const fbc = sessionStorage.getItem('ozzyl_fbc');

		if (fbp && !form.querySelector('input[name="_ozzyl_fbp"]')) {
			const fbpInput = document.createElement('input');
			fbpInput.type = 'hidden';
			fbpInput.name = '_ozzyl_fbp';
			fbpInput.value = fbp;
			form.appendChild(fbpInput);
		}

		if (fbc && !form.querySelector('input[name="_ozzyl_fbc"]')) {
			const fbcInput = document.createElement('input');
			fbcInput.type = 'hidden';
			fbcInput.name = '_ozzyl_fbc';
			fbcInput.value = fbc;
			form.appendChild(fbcInput);
		}
	}

	// Initialize when DOM is ready.
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}
})();
