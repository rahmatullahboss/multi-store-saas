<?php
/**
 * Admin settings page view.
 *
 * Variables available from Ozzyl_Admin::render_settings_page():
 *   $active_tab (string) — current tab key: 'settings' | 'status' | 'shortcodes'
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?>
<div class="wrap ozzyl-admin-wrap">

	<!-- Header -->
	<div class="ozzyl-admin-header">
		<div class="ozzyl-admin-header__logo">
			<svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
				<rect width="32" height="32" rx="8" fill="#4F46E5"/>
				<path d="M8 22L16 10L24 22H8Z" fill="white" opacity="0.9"/>
			</svg>
			<h1><?php esc_html_e( 'Ozzyl Commerce', 'ozzyl-commerce' ); ?></h1>
		</div>
		<p class="ozzyl-admin-header__tagline">
			<?php esc_html_e( 'Connect WordPress to the Ozzyl Commerce Platform', 'ozzyl-commerce' ); ?>
		</p>
	</div>

	<!-- Tab navigation -->
	<nav class="ozzyl-admin-tabs nav-tab-wrapper" aria-label="<?php esc_attr_e( 'Settings tabs', 'ozzyl-commerce' ); ?>">
		<a
			href="<?php echo esc_url( admin_url( 'options-general.php?page=ozzyl-commerce&tab=settings' ) ); ?>"
			class="nav-tab <?php echo 'settings' === $active_tab ? 'nav-tab-active' : ''; ?>"
		>
			<?php esc_html_e( 'Settings', 'ozzyl-commerce' ); ?>
		</a>
		<a
			href="<?php echo esc_url( admin_url( 'options-general.php?page=ozzyl-commerce&tab=status' ) ); ?>"
			class="nav-tab <?php echo 'status' === $active_tab ? 'nav-tab-active' : ''; ?>"
		>
			<?php esc_html_e( 'Connection Status', 'ozzyl-commerce' ); ?>
		</a>
		<a
			href="<?php echo esc_url( admin_url( 'options-general.php?page=ozzyl-commerce&tab=shortcodes' ) ); ?>"
			class="nav-tab <?php echo 'shortcodes' === $active_tab ? 'nav-tab-active' : ''; ?>"
		>
			<?php esc_html_e( 'Shortcodes', 'ozzyl-commerce' ); ?>
		</a>
	</nav>

	<?php settings_errors( 'ozzyl_api_key' ); ?>

	<!-- ── Tab: Settings ──────────────────────────────────────────────────── -->
	<?php if ( 'settings' === $active_tab ) : ?>
	<div class="ozzyl-tab-content">
		<form method="post" action="options.php" id="ozzyl-settings-form">
			<?php
			// settings_fields() already outputs a nonce field (_wpnonce) for the
			// 'ozzyl_settings' option group, which WordPress validates in options.php.
			// We also output a named nonce for any direct callers of set_api_key()
			// or regenerate_webhook_secret() that pass $verify_nonce = true.
			// SECURITY S-4: Explicit nonce for Ozzyl-specific admin actions.
			settings_fields( 'ozzyl_settings' );
			wp_nonce_field( 'ozzyl_save_settings', 'ozzyl_nonce' );
			do_settings_sections( 'ozzyl-commerce' );
			submit_button( __( 'Save Settings', 'ozzyl-commerce' ) );
			?>
		</form>
	</div>

	<!-- ── Tab: Status ────────────────────────────────────────────────────── -->
	<?php elseif ( 'status' === $active_tab ) : ?>
	<div class="ozzyl-tab-content">
		<?php include OZZYL_PLUGIN_DIR . 'admin/views/status.php'; ?>
	</div>

	<!-- ── Tab: Shortcodes ────────────────────────────────────────────────── -->
	<?php elseif ( 'shortcodes' === $active_tab ) : ?>
	<div class="ozzyl-tab-content">
		<h2><?php esc_html_e( 'Available Shortcodes', 'ozzyl-commerce' ); ?></h2>
		<p><?php esc_html_e( 'Use these shortcodes to embed your Ozzyl store on any page or post.', 'ozzyl-commerce' ); ?></p>

		<table class="widefat ozzyl-shortcodes-table">
			<thead>
				<tr>
					<th><?php esc_html_e( 'Shortcode', 'ozzyl-commerce' ); ?></th>
					<th><?php esc_html_e( 'Description', 'ozzyl-commerce' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>[ozzyl_store]</code></td>
					<td><?php esc_html_e( 'Embed the full Ozzyl storefront with default settings.', 'ozzyl-commerce' ); ?></td>
				</tr>
				<tr>
					<td><code>[ozzyl_store type="products"]</code></td>
					<td><?php esc_html_e( 'Embed the product listing page only.', 'ozzyl-commerce' ); ?></td>
				</tr>
				<tr>
					<td><code>[ozzyl_store type="product" id="42"]</code></td>
					<td><?php esc_html_e( 'Embed a single product by its Ozzyl product ID.', 'ozzyl-commerce' ); ?></td>
				</tr>
				<tr>
					<td><code>[ozzyl_store type="cart"]</code></td>
					<td><?php esc_html_e( 'Embed the shopping cart.', 'ozzyl-commerce' ); ?></td>
				</tr>
				<tr>
					<td><code>[ozzyl_store height="800" theme="dark"]</code></td>
					<td><?php esc_html_e( 'Custom height (px) and color theme (light/dark/auto).', 'ozzyl-commerce' ); ?></td>
				</tr>
			</tbody>
		</table>

		<h3><?php esc_html_e( 'Shortcode Parameters', 'ozzyl-commerce' ); ?></h3>
		<table class="widefat ozzyl-shortcodes-table">
			<thead>
				<tr>
					<th><?php esc_html_e( 'Parameter', 'ozzyl-commerce' ); ?></th>
					<th><?php esc_html_e( 'Values', 'ozzyl-commerce' ); ?></th>
					<th><?php esc_html_e( 'Default', 'ozzyl-commerce' ); ?></th>
					<th><?php esc_html_e( 'Description', 'ozzyl-commerce' ); ?></th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><code>type</code></td>
					<td><code>store, products, product, cart, orders</code></td>
					<td><code>store</code></td>
					<td><?php esc_html_e( 'What to embed.', 'ozzyl-commerce' ); ?></td>
				</tr>
				<tr>
					<td><code>id</code></td>
					<td><?php esc_html_e( 'Any numeric ID', 'ozzyl-commerce' ); ?></td>
					<td><em><?php esc_html_e( 'none', 'ozzyl-commerce' ); ?></em></td>
					<td><?php esc_html_e( 'Product ID when type="product".', 'ozzyl-commerce' ); ?></td>
				</tr>
				<tr>
					<td><code>height</code></td>
					<td><?php esc_html_e( '200 – 2000', 'ozzyl-commerce' ); ?></td>
					<td><code>600</code></td>
					<td><?php esc_html_e( 'Iframe height in pixels.', 'ozzyl-commerce' ); ?></td>
				</tr>
				<tr>
					<td><code>theme</code></td>
					<td><code>light, dark, auto</code></td>
					<td><code>light</code></td>
					<td><?php esc_html_e( 'Color theme for the embedded store.', 'ozzyl-commerce' ); ?></td>
				</tr>
				<tr>
					<td><code>title</code></td>
					<td><?php esc_html_e( 'Any text', 'ozzyl-commerce' ); ?></td>
					<td><code><?php esc_html_e( 'Ozzyl Store', 'ozzyl-commerce' ); ?></code></td>
					<td><?php esc_html_e( 'Accessible iframe title (for screen readers).', 'ozzyl-commerce' ); ?></td>
				</tr>
			</tbody>
		</table>

		<div class="ozzyl-gutenberg-notice">
			<h3><?php esc_html_e( 'Gutenberg Block', 'ozzyl-commerce' ); ?></h3>
			<p>
				<?php esc_html_e( 'The "Ozzyl Store Embed" block is also available in the block editor under the Embed category.', 'ozzyl-commerce' ); ?>
			</p>
		</div>
	</div>
	<?php endif; ?>

</div><!-- .ozzyl-admin-wrap -->
