<?php
/**
 * Fraud Detection Meta Box Template
 *
 * Displays fraud risk badge, signals, and action buttons in WC order admin.
 *
 * @package OzzylCommerce\Modules
 * @since   1.0.0
 * @var WC_Order $order Current order object.
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Get fraud data from order meta.
$decision = $order->get_meta( '_ozzyl_fraud_decision' );
$score    = $order->get_meta( '_ozzyl_fraud_score' );
$signals  = $order->get_meta( '_ozzyl_fraud_signals' );

// If no fraud data, show placeholder.
if ( ! $decision ) {
	echo '<p>' . esc_html__( 'No fraud check performed for this order.', 'ozzyl-commerce' ) . '</p>';
	return;
}

// Determine risk badge color and icon.
$score_int = (int) $score;
if ( $score_int < 40 ) {
	$badge_color = '#28a745'; // Green
	$badge_icon  = '🟢';
	$badge_label = __( 'Low Risk', 'ozzyl-commerce' );
} elseif ( $score_int < 70 ) {
	$badge_color = '#ffc107'; // Amber
	$badge_icon  = '🟡';
	$badge_label = __( 'Medium Risk', 'ozzyl-commerce' );
} else {
	$badge_color = '#dc3545'; // Red
	$badge_icon  = '🔴';
	$badge_label = __( 'High Risk', 'ozzyl-commerce' );
}
?>

<style>
	.ozzyl-fraud-badge {
		display: inline-block;
		padding: 8px 12px;
		border-radius: 4px;
		background-color: <?php echo esc_attr( $badge_color ); ?>;
		color: white;
		font-weight: bold;
		margin-bottom: 12px;
	}
	.ozzyl-fraud-signals {
		background-color: #f5f5f5;
		padding: 8px;
		border-radius: 4px;
		margin: 12px 0;
		font-size: 13px;
	}
	.ozzyl-fraud-signals li {
		margin: 4px 0;
		list-style: disc inside;
	}
	.ozzyl-fraud-actions {
		margin-top: 12px;
	}
	.ozzyl-fraud-actions button {
		width: 100%;
		padding: 6px;
		margin-bottom: 6px;
		font-size: 12px;
	}
</style>

<div class="ozzyl-fraud-detection-box">
	<!-- Risk Score Badge -->
	<div class="ozzyl-fraud-badge">
		<?php echo esc_html( $badge_icon . ' ' . $badge_label ); ?>
		<?php echo esc_html( sprintf( '(Score: %d)', $score_int ) ); ?>
	</div>

	<!-- Decision Status -->
	<p>
		<strong><?php esc_html_e( 'Decision:', 'ozzyl-commerce' ); ?></strong><br />
		<?php
		$decision_labels = [
			'allow'  => __( 'Allowed', 'ozzyl-commerce' ),
			'verify' => __( 'Requires Verification', 'ozzyl-commerce' ),
			'hold'   => __( 'On Hold', 'ozzyl-commerce' ),
			'block'  => __( 'Blocked', 'ozzyl-commerce' ),
		];
		echo esc_html( $decision_labels[ $decision ] ?? $decision );
		?>
	</p>

	<!-- Fraud Signals List -->
	<?php if ( is_array( $signals ) && ! empty( $signals ) ) : ?>
		<div class="ozzyl-fraud-signals">
			<strong><?php esc_html_e( 'Signals:', 'ozzyl-commerce' ); ?></strong>
			<ul>
				<?php
				foreach ( $signals as $signal ) {
					echo '<li>' . esc_html( $signal ) . '</li>';
				}
				?>
			</ul>
		</div>
	<?php endif; ?>

	<!-- Action Buttons (for 'hold' status) -->
	<?php if ( 'hold' === $decision && current_user_can( 'manage_woocommerce' ) ) : ?>
		<div class="ozzyl-fraud-actions">
			<form method="post" style="display: inline;">
				<?php wp_nonce_field( 'ozzyl_fraud_action_' . $order->get_id() ); ?>
				<input type="hidden" name="order_id" value="<?php echo esc_attr( $order->get_id() ); ?>" />
				<input type="hidden" name="action" value="ozzyl_fraud_approve" />
				<button type="submit" class="button button-primary">
					<?php esc_html_e( 'Approve Order', 'ozzyl-commerce' ); ?>
				</button>
			</form>

			<form method="post" style="display: inline;">
				<?php wp_nonce_field( 'ozzyl_fraud_action_' . $order->get_id() ); ?>
				<input type="hidden" name="order_id" value="<?php echo esc_attr( $order->get_id() ); ?>" />
				<input type="hidden" name="action" value="ozzyl_fraud_block" />
				<button type="submit" class="button button-danger">
					<?php esc_html_e( 'Block Order', 'ozzyl-commerce' ); ?>
				</button>
			</form>
		</div>
	<?php endif; ?>
</div>
