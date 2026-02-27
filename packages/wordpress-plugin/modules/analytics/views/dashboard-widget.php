<?php
/**
 * Analytics Dashboard Widget Template
 *
 * Displays summary analytics from Ozzyl API in WordPress dashboard.
 *
 * @package OzzylCommerce\Modules
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$core    = Ozzyl_Core::instance();
$api     = $core->get_api();
$license = $core->get_license();

// Fetch analytics for 30-day period.
$result = $api->get_analytics( [ 'period' => '30d' ] );

if ( is_wp_error( $result ) ) {
	?>
	<p style="color: #d32f2f;">
		<?php esc_html_e( 'Failed to load analytics.', 'ozzyl-commerce' ); ?>
	</p>
	<?php
	return;
}

// Check if user has free plan and show blurred preview.
$plan = $license->get_plan();
$is_free = 'free' === $plan;

?>
<style>
	.ozzyl-analytics-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-bottom: 12px;
	}

	.ozzyl-analytics-card {
		padding: 12px;
		background-color: #f5f5f5;
		border-radius: 4px;
		text-align: center;
	}

	.ozzyl-analytics-card strong {
		display: block;
		font-size: 18px;
		color: #1a1a1a;
		margin: 8px 0;
	}

	.ozzyl-analytics-card small {
		color: #666;
		font-size: 12px;
	}

	.ozzyl-analytics-blur {
		filter: blur(4px);
		position: relative;
	}

	.ozzyl-analytics-blur::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(255, 255, 255, 0.5);
		border-radius: 4px;
	}

	.ozzyl-upgrade-cta {
		background-color: #e3f2fd;
		border-left: 4px solid #1976d2;
		padding: 12px;
		margin-top: 12px;
		border-radius: 2px;
		font-size: 13px;
	}

	.ozzyl-upgrade-cta a {
		color: #1976d2;
		text-decoration: none;
		font-weight: bold;
	}
</style>

<div class="ozzyl-analytics-grid">
	<!-- Orders -->
	<div class="ozzyl-analytics-card <?php echo $is_free ? 'ozzyl-analytics-blur' : ''; ?>">
		<small><?php esc_html_e( 'Total Orders', 'ozzyl-commerce' ); ?></small>
		<strong><?php echo esc_html( (int) ( $result['total_orders'] ?? 0 ) ); ?></strong>
	</div>

	<!-- Revenue -->
	<div class="ozzyl-analytics-card <?php echo $is_free ? 'ozzyl-analytics-blur' : ''; ?>">
		<small><?php esc_html_e( 'Total Revenue', 'ozzyl-commerce' ); ?></small>
		<strong><?php echo esc_html( wc_price( (float) ( $result['total_revenue'] ?? 0 ) ) ); ?></strong>
	</div>

	<!-- Conversion Rate -->
	<div class="ozzyl-analytics-card <?php echo $is_free ? 'ozzyl-analytics-blur' : ''; ?>">
		<small><?php esc_html_e( 'Conversion Rate', 'ozzyl-commerce' ); ?></small>
		<strong><?php echo esc_html( number_format( (float) ( $result['conversion_rate'] ?? 0 ), 2 ) . '%' ); ?></strong>
	</div>

	<!-- Avg Order Value -->
	<div class="ozzyl-analytics-card <?php echo $is_free ? 'ozzyl-analytics-blur' : ''; ?>">
		<small><?php esc_html_e( 'Avg Order Value', 'ozzyl-commerce' ); ?></small>
		<strong><?php echo esc_html( wc_price( (float) ( $result['avg_order_value'] ?? 0 ) ) ); ?></strong>
	</div>
</div>

<?php if ( $is_free ) : ?>
	<div class="ozzyl-upgrade-cta">
		<?php
		printf(
			/* translators: %s: upgrade link */
			wp_kses_post( __( 'Unlock full analytics with a <a href="%s" target="_blank">paid plan</a> →', 'ozzyl-commerce' ) ),
			esc_url( 'https://app.ozzyl.com/pricing?ref=wc-plugin&module=analytics' )
		);
		?>
	</div>
<?php endif; ?>

<p style="text-align: center; margin-top: 12px; font-size: 12px;">
	<a href="<?php echo esc_url( admin_url( 'admin.php?page=ozzyl-analytics' ) ); ?>">
		<?php esc_html_e( 'View full analytics →', 'ozzyl-commerce' ); ?>
	</a>
</p>
