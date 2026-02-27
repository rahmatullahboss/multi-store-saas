<?php
/**
 * Admin Modules Management Page
 *
 * App-store style module cards with enable/disable toggles.
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Check capability.
if ( ! current_user_can( 'manage_options' ) ) {
	wp_die( esc_html__( 'You do not have permission to access this page.', 'ozzyl-commerce' ) );
}

$core     = Ozzyl_Core::instance();
$modules  = $core->get_modules();
$license  = $core->get_license();

?>

<div class="wrap">
	<h1><?php esc_html_e( 'Ozzyl Modules', 'ozzyl-commerce' ); ?></h1>

	<div class="notice notice-info">
		<p>
			<?php
			printf(
				/* translators: 1: Current plan. 2: Settings link. */
				wp_kses_post( __( 'Current Plan: <strong>%1$s</strong> | <a href="%2$s">Settings</a>', 'ozzyl-commerce' ) ),
				esc_html( ucfirst( $license->get_plan() ) ),
				esc_url( admin_url( 'options-general.php?page=ozzyl-commerce' ) )
			);
			?>
		</p>
	</div>

	<div class="ozzyl-modules-grid">
		<?php foreach ( $modules as $module ) : ?>
			<?php
			$module_id       = $module->get_id();
			$is_active       = $core->is_module_active( $module_id );
			$is_enabled      = (bool) get_option( 'ozzyl_module_' . $module_id . '_enabled', false );
			$required_scope  = $module->get_required_scope();
			$has_scope       = empty( $required_scope ) || $license->has_scope( $required_scope );
			$min_plan        = $module->get_min_plan();
			$can_enable      = $has_scope;
			$stats           = $module->get_stats();
			?>

			<div class="ozzyl-module-card <?php echo $can_enable ? '' : 'ozzyl-module-locked'; ?>">
				<div class="ozzyl-module-header">
					<div class="ozzyl-module-icon">
						<?php echo esc_html( $module->get_icon() ); ?>
					</div>
					<div class="ozzyl-module-title">
						<h3><?php echo esc_html( $module->get_name() ); ?></h3>
						<?php if ( ! $can_enable ) : ?>
							<span class="ozzyl-module-badge"><?php echo esc_html( ucfirst( $min_plan ) ); ?> Plan</span>
						<?php endif; ?>
					</div>
				</div>

				<p class="ozzyl-module-description">
					<?php echo esc_html( $module->get_description() ); ?>
				</p>

				<?php if ( ! empty( $stats ) ) : ?>
					<div class="ozzyl-module-stats">
						<?php foreach ( $stats as $label => $value ) : ?>
							<div class="ozzyl-stat">
								<span class="ozzyl-stat-label"><?php echo esc_html( ucwords( str_replace( '_', ' ', $label ) ) ); ?></span>
								<span class="ozzyl-stat-value"><?php echo esc_html( $value ); ?></span>
							</div>
						<?php endforeach; ?>
					</div>
				<?php endif; ?>

				<div class="ozzyl-module-actions">
					<?php if ( $can_enable ) : ?>
						<form method="post" action="" style="display: inline;">
							<?php wp_nonce_field( 'ozzyl_module_toggle_' . $module_id ); ?>
							<input type="hidden" name="module_id" value="<?php echo esc_attr( $module_id ); ?>" />
							<input type="hidden" name="action" value="<?php echo $is_enabled ? 'disable' : 'enable'; ?>" />

							<button
								type="submit"
								class="button <?php echo $is_enabled ? 'button-secondary' : 'button-primary'; ?>"
							>
								<?php echo $is_enabled ? esc_html__( 'Disable', 'ozzyl-commerce' ) : esc_html__( 'Enable', 'ozzyl-commerce' ); ?>
							</button>
						</form>

						<?php if ( $is_enabled ) : ?>
							<a href="<?php echo esc_url( admin_url( 'options-general.php?page=ozzyl-modules&tab=' . $module_id ) ); ?>" class="button">
								<?php esc_html_e( 'Settings', 'ozzyl-commerce' ); ?>
							</a>
						<?php endif; ?>
					<?php else : ?>
						<a
							href="<?php echo esc_url( 'https://app.ozzyl.com/pricing?ref=wc-plugin&module=' . $module_id ); ?>"
							target="_blank"
							class="button button-primary"
						>
							<?php esc_html_e( 'Upgrade Plan', 'ozzyl-commerce' ); ?>
						</a>
					<?php endif; ?>
				</div>
			</div>
		<?php endforeach; ?>
	</div>
</div>

<style>
	.ozzyl-modules-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
		margin-top: 20px;
	}

	.ozzyl-module-card {
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 20px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
	}

	.ozzyl-module-card:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		border-color: #4F46E5;
	}

	.ozzyl-module-card.ozzyl-module-locked {
		opacity: 0.7;
		background-color: #f9f9f9;
	}

	.ozzyl-module-header {
		display: flex;
		gap: 12px;
		margin-bottom: 16px;
		align-items: flex-start;
	}

	.ozzyl-module-icon {
		font-size: 32px;
		line-height: 1;
	}

	.ozzyl-module-title {
		flex: 1;
	}

	.ozzyl-module-title h3 {
		margin: 0 0 4px 0;
		font-size: 16px;
		color: #1a1a1a;
	}

	.ozzyl-module-badge {
		display: inline-block;
		background-color: #ffc107;
		color: #1a1a1a;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 11px;
		font-weight: bold;
		text-transform: uppercase;
	}

	.ozzyl-module-description {
		color: #666;
		font-size: 13px;
		margin: 0 0 12px 0;
		line-height: 1.5;
	}

	.ozzyl-module-stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		margin: 12px 0;
		padding: 8px 0;
		border-top: 1px solid #eee;
		border-bottom: 1px solid #eee;
	}

	.ozzyl-stat {
		text-align: center;
	}

	.ozzyl-stat-label {
		display: block;
		font-size: 11px;
		color: #999;
		text-transform: uppercase;
		margin-bottom: 4px;
	}

	.ozzyl-stat-value {
		display: block;
		font-size: 18px;
		font-weight: bold;
		color: #1a1a1a;
	}

	.ozzyl-module-actions {
		display: flex;
		gap: 8px;
		margin-top: 12px;
	}

	.ozzyl-module-actions form {
		flex: 1;
	}

	.ozzyl-module-actions .button {
		width: 100%;
		display: block;
	}

	.ozzyl-module-actions a {
		flex: 1;
		text-align: center;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
