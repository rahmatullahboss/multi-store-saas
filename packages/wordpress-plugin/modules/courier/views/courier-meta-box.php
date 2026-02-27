<?php
/**
 * Courier Meta Box Template
 *
 * Displays courier information and status in WC order admin.
 *
 * @package OzzylCommerce\Modules
 * @since   1.0.0
 * @var WC_Order $order Current order object.
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$consignment_id = $order->get_meta( '_ozzyl_courier_consignment_id' );
$courier_name   = $order->get_meta( '_ozzyl_courier_name' );

if ( empty( $consignment_id ) ) {
	?>
	<p><?php esc_html_e( 'No courier booking yet.', 'ozzyl-commerce' ); ?></p>
	<?php
	if ( current_user_can( 'manage_woocommerce' ) && 'processing' === $order->get_status() ) {
		?>
		<form method="post" style="margin-top: 12px;">
			<?php wp_nonce_field( 'ozzyl_courier_manual_book_' . $order->get_id() ); ?>
			<input type="hidden" name="order_id" value="<?php echo esc_attr( $order->get_id() ); ?>" />
			<input type="hidden" name="action" value="ozzyl_courier_manual_book" />
			<button type="submit" class="button button-primary">
				<?php esc_html_e( 'Book Courier Now', 'ozzyl-commerce' ); ?>
			</button>
		</form>
		<?php
	}
} else {
	?>
	<div style="padding: 8px; background-color: #f0f8f0; border-radius: 4px;">
		<p>
			<strong><?php esc_html_e( 'Courier:', 'ozzyl-commerce' ); ?></strong><br />
			<?php echo esc_html( $courier_name ?: __( 'Unknown', 'ozzyl-commerce' ) ); ?>
		</p>

		<p>
			<strong><?php esc_html_e( 'Consignment ID:', 'ozzyl-commerce' ); ?></strong><br />
			<code><?php echo esc_html( $consignment_id ); ?></code>
		</p>

		<?php if ( current_user_can( 'manage_woocommerce' ) ) : ?>
			<form method="post" style="margin-top: 12px;">
				<?php wp_nonce_field( 'ozzyl_courier_refresh_' . $order->get_id() ); ?>
				<input type="hidden" name="order_id" value="<?php echo esc_attr( $order->get_id() ); ?>" />
				<input type="hidden" name="action" value="ozzyl_courier_refresh_status" />
				<button type="submit" class="button">
					<?php esc_html_e( 'Refresh Status', 'ozzyl-commerce' ); ?>
				</button>
			</form>
		<?php endif; ?>
	</div>
	<?php
}
