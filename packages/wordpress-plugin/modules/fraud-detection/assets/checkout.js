/**
 * Fraud Detection Checkout Script
 *
 * Handles:
 * - OTP field visibility based on payment method
 * - OTP submission and verification
 * - Countdown timer (10 minutes)
 * - Resend OTP functionality with rate limiting
 *
 * @package OzzylCommerce\Modules
 * @since   1.0.0
 */

(function ($) {
	'use strict';

	const OTP_TIMEOUT_MINUTES = 10;
	const OTP_FIELD_ID = '#ozzyl-otp-field';
	const OTP_INPUT_ID = '#ozzyl_otp';
	const RESEND_BUTTON_ID = '#ozzyl-otp-resend';
	const TIMER_ID = '#ozzyl-otp-timer';

	let otpTimerInterval = null;
	let otpExpiryTime = null;
	let resendCooldown = 0;

	/**
	 * Initialize OTP checkout flow.
	 */
	function init() {
		// Show/hide OTP field based on payment method selection.
		$document.on('change', 'input[name="post_data[payment_method]"]', updateOTPFieldVisibility);

		// Handle OTP verification on checkout submit.
		$document.on('checkout_place_order', handleOTPVerification);

		// Handle resend OTP button.
		$(RESEND_BUTTON_ID).on('click', handleResendOTP);

		// Check initial payment method.
		updateOTPFieldVisibility();
	}

	/**
	 * Show/hide OTP field based on selected payment method.
	 */
	function updateOTPFieldVisibility() {
		const paymentMethod = $('input[name="payment_method"]:checked').val();

		if ('cod' === paymentMethod) {
			// Show OTP field.
			$(OTP_FIELD_ID).slideDown(200);
			startOTPTimer();
		} else {
			// Hide OTP field.
			$(OTP_FIELD_ID).slideUp(200);
			stopOTPTimer();
			$(OTP_INPUT_ID).val(''); // Clear input.
		}
	}

	/**
	 * Start the OTP countdown timer (10 minutes).
	 */
	function startOTPTimer() {
		stopOTPTimer(); // Clear any existing timer.

		otpExpiryTime = Date.now() + OTP_TIMEOUT_MINUTES * 60 * 1000;
		updateTimer();

		otpTimerInterval = setInterval(updateTimer, 1000);
	}

	/**
	 * Update the OTP timer display.
	 */
	function updateTimer() {
		if (!otpExpiryTime) {
			return;
		}

		const now = Date.now();
		const remaining = Math.max(0, otpExpiryTime - now);

		if (0 === remaining) {
			stopOTPTimer();
			$(TIMER_ID).text('OTP expired. Please request a new one.');
			$(OTP_INPUT_ID).prop('disabled', true);
			return;
		}

		const minutes = Math.floor(remaining / 60000);
		const seconds = Math.floor((remaining % 60000) / 1000);
		const display = sprintf('OTP expires in %d:%02d', minutes, seconds);

		$(TIMER_ID).text(display);
	}

	/**
	 * Stop the OTP countdown timer.
	 */
	function stopOTPTimer() {
		if (otpTimerInterval) {
			clearInterval(otpTimerInterval);
			otpTimerInterval = null;
		}
	}

	/**
	 * Handle OTP verification before order submission.
	 *
	 * @param {Event} e Checkout event.
	 * @return {boolean} True to proceed, false to block checkout.
	 */
	function handleOTPVerification(e) {
		const paymentMethod = $('input[name="payment_method"]:checked').val();

		if ('cod' !== paymentMethod) {
			return true; // Not COD, no OTP needed.
		}

		const otp = $(OTP_INPUT_ID).val().trim();

		if (!otp) {
			alert('Please enter the OTP sent to your phone.');
			return false;
		}

		// Submit OTP verification to API.
		const orderId = $('input[name="post_data[post_ID]"]').val();

		$.ajax({
			url: ozzylFraudData.restUrl,
			type: 'POST',
			contentType: 'application/json',
			dataType: 'json',
			data: JSON.stringify({
				order_id: parseInt(orderId) || 0,
				otp: otp,
			}),
			headers: {
				'X-WP-Nonce': ozzylFraudData.nonce,
			},
			success: function (response) {
				if (response.success) {
					// OTP verified, proceed with checkout.
					return true;
				} else {
					alert('OTP verification failed: ' + (response.message || 'Unknown error'));
					return false;
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				alert('OTP verification error: ' + textStatus);
				return false;
			},
		});

		return false; // Block submission until verification completes.
	}

	/**
	 * Handle resend OTP button click.
	 */
	function handleResendOTP(e) {
		e.preventDefault();

		// Check cooldown.
		if (resendCooldown > 0) {
			alert(
				sprintf(
					'Please wait %d seconds before requesting a new OTP.',
					resendCooldown
				)
			);
			return;
		}

		// Call API to resend OTP.
		$.ajax({
			url: ozzylFraudData.ajaxUrl,
			type: 'POST',
			dataType: 'json',
			data: {
				action: 'ozzyl_fraud_resend_otp',
				nonce: ozzylFraudData.nonce,
			},
			success: function (response) {
				if (response.success) {
					alert('OTP resent to your phone.');
					startOTPTimer(); // Reset the countdown.
					setResendCooldown(60); // 60-second cooldown.
				} else {
					alert('Error: ' + (response.data || 'Failed to resend OTP'));
				}
			},
			error: function (jqXHR, textStatus, errorThrown) {
				alert('Resend OTP error: ' + textStatus);
			},
		});
	}

	/**
	 * Set resend button cooldown (seconds).
	 */
	function setResendCooldown(seconds) {
		resendCooldown = seconds;
		$(RESEND_BUTTON_ID).prop('disabled', true);

		const cooldownInterval = setInterval(function () {
			resendCooldown--;

			if (0 === resendCooldown) {
				clearInterval(cooldownInterval);
				$(RESEND_BUTTON_ID).prop('disabled', false);
			} else {
				$(RESEND_BUTTON_ID).text(
					sprintf(
						'Resend OTP (%d)',
						resendCooldown
					)
				);
			}
		}, 1000);
	}

	/**
	 * Simple sprintf-like function for string formatting.
	 */
	function sprintf(format) {
		let args = Array.prototype.slice.call(arguments, 1);
		let i = 0;
		return format.replace(/%[sd]/g, function () {
			return args[i++];
		});
	}

	// Initialize when document is ready.
	$(document).ready(init);
})(jQuery);
