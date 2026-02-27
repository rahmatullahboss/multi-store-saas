<?php
/**
 * Analytics Module
 *
 * Displays Ozzyl analytics in WordPress dashboard widget.
 *
 * @package OzzylCommerce\Modules
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Analytics Module
 *
 * @since 1.0.0
 */
class Ozzyl_Module_Analytics implements OzzylModuleInterface {

	/**
	 * Get the module ID.
	 *
	 * @since 1.0.0
	 */
	public function get_id(): string {
		return 'analytics';
	}

	/**
	 * Get the module name.
	 *
	 * @since 1.0.0
	 */
	public function get_name(): string {
		return __( 'Analytics', 'ozzyl-commerce' );
	}

	/**
	 * Get the module icon.
	 *
	 * @since 1.0.0
	 */
	public function get_icon(): string {
		return '📈';
	}

	/**
	 * Get the module description.
	 *
	 * @since 1.0.0
	 */
	public function get_description(): string {
		return __( 'View Ozzyl analytics and insights in your WordPress dashboard.', 'ozzyl-commerce' );
	}

	/**
	 * Get the required API scope.
	 *
	 * @since 1.0.0
	 */
	public function get_required_scope(): string {
		return 'analytics';
	}

	/**
	 * Get the minimum plan tier.
	 *
	 * @since 1.0.0
	 */
	public function get_min_plan(): string {
		return 'free';
	}

	/**
	 * Activate the module.
	 *
	 * @since 1.0.0
	 */
	public function activate(): void {
		add_action( 'wp_dashboard_setup', [ $this, 'register_dashboard_widget' ] );

		Ozzyl_Logger::info( 'Analytics module activated' );
	}

	/**
	 * Deactivate the module.
	 *
	 * @since 1.0.0
	 */
	public function deactivate(): void {
		remove_action( 'wp_dashboard_setup', [ $this, 'register_dashboard_widget' ] );

		Ozzyl_Logger::info( 'Analytics module deactivated' );
	}

	/**
	 * Register WP dashboard widget.
	 *
	 * @since 1.0.0
	 */
	public function register_dashboard_widget(): void {
		wp_add_dashboard_widget(
			'ozzyl_analytics',
			__( 'Ozzyl Analytics', 'ozzyl-commerce' ),
			[ $this, 'render_dashboard_widget' ]
		);
	}

	/**
	 * Render dashboard widget content.
	 *
	 * @since 1.0.0
	 */
	public function render_dashboard_widget(): void {
		require OZZYL_PLUGIN_DIR . 'modules/analytics/views/dashboard-widget.php';
	}

	/**
	 * Render module settings form.
	 *
	 * @since 1.0.0
	 */
	public function render_settings(): void {
		?>
		<div class="ozzyl-module-settings">
			<h3><?php esc_html_e( 'Analytics Settings', 'ozzyl-commerce' ); ?></h3>
			<p>
				<?php esc_html_e( 'Analytics are displayed in the WordPress dashboard. No additional configuration needed.', 'ozzyl-commerce' ); ?>
			</p>
		</div>
		<?php
	}

	/**
	 * Get module statistics.
	 *
	 * @since 1.0.0
	 */
	public function get_stats(): array {
		return [
			'dashboard_views' => 0,
		];
	}
}

// Register the module.
$core = Ozzyl_Core::instance();
$core->register_module( new Ozzyl_Module_Analytics() );
