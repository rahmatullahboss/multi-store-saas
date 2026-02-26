<?php
/**
 * Admin status page view — Connection Status tab.
 *
 * Loaded by admin/views/settings.php when $active_tab === 'status'.
 * Renders a live status card populated via the /wp-json/ozzyl/v1/admin/status
 * REST endpoint called by admin.js on page load.
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$auth       = ozzyl()->auth;
$has_key    = $auth->is_api_key_valid();
$webhook_id = $auth->get_registered_webhook_id();
$wc_active  = class_exists( 'WooCommerce' );
?>

<div class="ozzyl-status-page" id="ozzyl-status-page">

	<h2><?php esc_html_e( 'Connection Status', 'ozzyl-commerce' ); ?></h2>
	<p><?php esc_html_e( 'Live status of your Ozzyl Commerce connection. Click "Refresh" to re-check.', 'ozzyl-commerce' ); ?></p>
	<button type="button" id="ozzyl-refresh-status" class="button button-secondary">
		<?php esc_html_e( '↻ Refresh Status', 'ozzyl-commerce' ); ?>
	</button>

	<!-- Status cards grid -->
	<div class="ozzyl-status-grid" id="ozzyl-status-grid">

		<!-- API Key -->
		<div class="ozzyl-status-card">
			<div class="ozzyl-status-card__icon">🔑</div>
			<div class="ozzyl-status-card__body">
				<h3><?php esc_html_e( 'API Key', 'ozzyl-commerce' ); ?></h3>
				<?php if ( $has_key ) : ?>
					<span class="ozzyl-badge ozzyl-badge--success"><?php esc_html_e( 'Configured', 'ozzyl-commerce' ); ?></span>
					<p class="ozzyl-status-card__detail">
						<?php echo esc_html( $auth->get_masked_api_key() ); ?>
					</p>
				<?php else : ?>
					<span class="ozzyl-badge ozzyl-badge--error"><?php esc_html_e( 'Not configured', 'ozzyl-commerce' ); ?></span>
					<p class="ozzyl-status-card__detail">
						<a href="<?php echo esc_url( admin_url( 'options-general.php?page=ozzyl-commerce&tab=settings' ) ); ?>">
							<?php esc_html_e( 'Add your API key →', 'ozzyl-commerce' ); ?>
						</a>
					</p>
				<?php endif; ?>
			</div>
		</div>

		<!-- API Connection -->
		<div class="ozzyl-status-card" id="ozzyl-card-connection">
			<div class="ozzyl-status-card__icon">🌐</div>
			<div class="ozzyl-status-card__body">
				<h3><?php esc_html_e( 'API Connection', 'ozzyl-commerce' ); ?></h3>
				<span class="ozzyl-badge ozzyl-badge--pending" id="ozzyl-connection-badge">
					<?php esc_html_e( 'Checking…', 'ozzyl-commerce' ); ?>
				</span>
				<p class="ozzyl-status-card__detail" id="ozzyl-store-name">—</p>
			</div>
		</div>

		<!-- Webhook -->
		<div class="ozzyl-status-card">
			<div class="ozzyl-status-card__icon">🔔</div>
			<div class="ozzyl-status-card__body">
				<h3><?php esc_html_e( 'Webhook', 'ozzyl-commerce' ); ?></h3>
				<?php if ( $webhook_id ) : ?>
					<span class="ozzyl-badge ozzyl-badge--success"><?php esc_html_e( 'Registered', 'ozzyl-commerce' ); ?></span>
					<p class="ozzyl-status-card__detail">
						<?php
						printf(
							/* translators: Webhook ID number. */
							esc_html__( 'Webhook ID: %s', 'ozzyl-commerce' ),
							'<code>' . esc_html( $webhook_id ) . '</code>'
						);
						?>
					</p>
				<?php else : ?>
					<span class="ozzyl-badge ozzyl-badge--warning"><?php esc_html_e( 'Not registered', 'ozzyl-commerce' ); ?></span>
					<p class="ozzyl-status-card__detail">
						<a href="<?php echo esc_url( admin_url( 'options-general.php?page=ozzyl-commerce&tab=settings' ) ); ?>">
							<?php esc_html_e( 'Register from Settings tab →', 'ozzyl-commerce' ); ?>
						</a>
					</p>
				<?php endif; ?>
			</div>
		</div>

		<!-- WooCommerce -->
		<div class="ozzyl-status-card">
			<div class="ozzyl-status-card__icon">🛒</div>
			<div class="ozzyl-status-card__body">
				<h3><?php esc_html_e( 'WooCommerce', 'ozzyl-commerce' ); ?></h3>
				<?php if ( $wc_active ) : ?>
					<span class="ozzyl-badge ozzyl-badge--success"><?php esc_html_e( 'Active', 'ozzyl-commerce' ); ?></span>
					<p class="ozzyl-status-card__detail">
						<?php
						printf(
							/* translators: WooCommerce version number. */
							esc_html__( 'Version %s', 'ozzyl-commerce' ),
							esc_html( defined( 'WC_VERSION' ) ? WC_VERSION : '—' )
						);
						?>
					</p>
				<?php else : ?>
					<span class="ozzyl-badge ozzyl-badge--warning"><?php esc_html_e( 'Not installed', 'ozzyl-commerce' ); ?></span>
					<p class="ozzyl-status-card__detail"><?php esc_html_e( 'Sync features are unavailable.', 'ozzyl-commerce' ); ?></p>
				<?php endif; ?>
			</div>
		</div>

		<!-- Sync -->
		<div class="ozzyl-status-card">
			<div class="ozzyl-status-card__icon">🔄</div>
			<div class="ozzyl-status-card__body">
				<h3><?php esc_html_e( 'Sync', 'ozzyl-commerce' ); ?></h3>
				<?php
				$sync_enabled = $auth->is_sync_enabled();
				$auto_sync    = $auth->is_auto_sync_enabled();
				if ( $sync_enabled ) :
				?>
					<span class="ozzyl-badge ozzyl-badge--success"><?php esc_html_e( 'Enabled', 'ozzyl-commerce' ); ?></span>
					<p class="ozzyl-status-card__detail">
						<?php $auto_sync
							? esc_html_e( 'Auto-sync: ON', 'ozzyl-commerce' )
							: esc_html_e( 'Auto-sync: OFF (manual only)', 'ozzyl-commerce' );
						?>
					</p>
				<?php else : ?>
					<span class="ozzyl-badge ozzyl-badge--warning"><?php esc_html_e( 'Disabled', 'ozzyl-commerce' ); ?></span>
				<?php endif; ?>
			</div>
		</div>

		<!-- System Info -->
		<div class="ozzyl-status-card">
			<div class="ozzyl-status-card__icon">ℹ️</div>
			<div class="ozzyl-status-card__body">
				<h3><?php esc_html_e( 'System Info', 'ozzyl-commerce' ); ?></h3>
				<ul class="ozzyl-status-list">
					<li>
						<strong><?php esc_html_e( 'Plugin:', 'ozzyl-commerce' ); ?></strong>
						<?php echo esc_html( 'v' . OZZYL_VERSION ); ?>
					</li>
					<li>
						<strong><?php esc_html_e( 'WordPress:', 'ozzyl-commerce' ); ?></strong>
						<?php echo esc_html( get_bloginfo( 'version' ) ); ?>
					</li>
					<li>
						<strong><?php esc_html_e( 'PHP:', 'ozzyl-commerce' ); ?></strong>
						<?php echo esc_html( PHP_VERSION ); ?>
					</li>
					<li>
						<strong><?php esc_html_e( 'Webhook URL:', 'ozzyl-commerce' ); ?></strong><br>
						<code style="font-size:11px;word-break:break-all;"><?php echo esc_url( Ozzyl_Webhook::get_webhook_url() ); ?></code>
					</li>
				</ul>
			</div>
		</div>

	</div><!-- .ozzyl-status-grid -->

	<!-- Store details panel (populated by JS after REST call) -->
	<div id="ozzyl-store-details" style="display:none;" class="ozzyl-store-details-panel">
		<h3><?php esc_html_e( 'Connected Store', 'ozzyl-commerce' ); ?></h3>
		<table class="widefat" id="ozzyl-store-table">
			<tbody>
				<tr><th><?php esc_html_e( 'Name', 'ozzyl-commerce' ); ?></th><td id="ozzyl-store-detail-name">—</td></tr>
				<tr><th><?php esc_html_e( 'Subdomain', 'ozzyl-commerce' ); ?></th><td id="ozzyl-store-detail-subdomain">—</td></tr>
				<tr><th><?php esc_html_e( 'Custom Domain', 'ozzyl-commerce' ); ?></th><td id="ozzyl-store-detail-domain">—</td></tr>
				<tr><th><?php esc_html_e( 'Currency', 'ozzyl-commerce' ); ?></th><td id="ozzyl-store-detail-currency">—</td></tr>
				<tr><th><?php esc_html_e( 'Plan', 'ozzyl-commerce' ); ?></th><td id="ozzyl-store-detail-plan">—</td></tr>
				<tr><th><?php esc_html_e( 'Status', 'ozzyl-commerce' ); ?></th><td id="ozzyl-store-detail-status">—</td></tr>
			</tbody>
		</table>
	</div>

</div><!-- .ozzyl-status-page -->
