<?php
/**
 * Ozzyl Widget — Storefront embedding shortcode and block
 *
 * Provides the [ozzyl_store] shortcode and registers a Gutenberg block
 * for embedding the Ozzyl storefront widget on any WordPress page or post.
 *
 * Shortcode usage:
 *   [ozzyl_store]                           — Embed with defaults
 *   [ozzyl_store height="800" theme="dark"] — Custom height and theme
 *   [ozzyl_store type="products"]           — Products section only
 *   [ozzyl_store type="product" id="42"]    — Single product embed
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ozzyl_Widget — shortcode and block registration for storefront embedding.
 *
 * @since 1.0.0
 */
class Ozzyl_Widget {

	/** @var string[] Allowed embed types. */
	private const ALLOWED_TYPES = [ 'store', 'products', 'product', 'cart', 'orders' ];

	/** @var string[] Allowed theme values. */
	private const ALLOWED_THEMES = [ 'light', 'dark', 'auto' ];

	/** @var int Default iframe height in pixels. */
	private const DEFAULT_HEIGHT = 600;

	/** @var int Minimum allowed iframe height. */
	private const MIN_HEIGHT = 200;

	/** @var int Maximum allowed iframe height. */
	private const MAX_HEIGHT = 2000;

	// ── Constructor ───────────────────────────────────────────────────────────

	/**
	 * Register shortcode and enqueue public assets.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		add_shortcode( 'ozzyl_store', array( $this, 'render_shortcode' ) );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_public_assets' ) );
		add_action( 'init', array( $this, 'register_block' ) );
	}

	// ── Shortcode ─────────────────────────────────────────────────────────────

	/**
	 * Render the [ozzyl_store] shortcode.
	 *
	 * @since 1.0.0
	 * @param array<string,string>|string $atts    Shortcode attributes.
	 * @param string|null                 $content Enclosed content (unused).
	 * @return string HTML output.
	 */
	public function render_shortcode( array|string $atts, ?string $content = null ): string {
		// Merge defaults.
		$atts = shortcode_atts(
			[
				'type'   => 'store',
				'id'     => '',
				'height' => (string) self::DEFAULT_HEIGHT,
				'theme'  => 'light',
				'class'  => '',
				'title'  => __( 'Ozzyl Store', 'ozzyl-commerce' ),
			],
			is_array( $atts ) ? $atts : [],
			'ozzyl_store'
		);

		// Sanitize and validate.
		$type   = in_array( $atts['type'], self::ALLOWED_TYPES, true ) ? $atts['type'] : 'store';
		$theme  = in_array( $atts['theme'], self::ALLOWED_THEMES, true ) ? $atts['theme'] : 'light';
		$height = max( self::MIN_HEIGHT, min( self::MAX_HEIGHT, (int) $atts['height'] ) );
		$id     = preg_replace( '/[^a-zA-Z0-9_-]/', '', $atts['id'] );
		$class  = sanitize_html_class( $atts['class'] );
		$title  = sanitize_text_field( $atts['title'] );

		// Build the widget embed URL.
		$embed_url = $this->build_embed_url( $type, $id, $theme );

		if ( empty( $embed_url ) ) {
			if ( current_user_can( 'manage_options' ) ) {
				return '<p class="ozzyl-error">' . esc_html__( 'Ozzyl Commerce: API key not configured. Please visit Settings → Ozzyl Commerce.', 'ozzyl-commerce' ) . '</p>';
			}
			return '';
		}

		// Build wrapper CSS classes.
		$wrapper_class = 'ozzyl-widget-wrapper ozzyl-theme-' . esc_attr( $theme );
		if ( $class ) {
			$wrapper_class .= ' ' . esc_attr( $class );
		}

		ob_start();
		?>
		<div class="<?php echo esc_attr( $wrapper_class ); ?>" data-ozzyl-type="<?php echo esc_attr( $type ); ?>">
			<iframe
				src="<?php echo esc_url( $embed_url ); ?>"
				width="100%"
				height="<?php echo esc_attr( (string) $height ); ?>"
				frameborder="0"
				scrolling="auto"
				title="<?php echo esc_attr( $title ); ?>"
				loading="lazy"
				allow="clipboard-write; payment"
				class="ozzyl-store-iframe"
				data-ozzyl-embed="true"
			></iframe>
		</div>
		<?php
		return ob_get_clean();
	}

	// ── Gutenberg block ───────────────────────────────────────────────────────

	/**
	 * Register the ozzyl/store-embed Gutenberg block.
	 *
	 * The block is a server-side rendered block that re-uses render_shortcode().
	 *
	 * @since 1.0.0
	 */
	public function register_block(): void {
		if ( ! function_exists( 'register_block_type' ) ) {
			return;
		}

		register_block_type(
			'ozzyl/store-embed',
			[
				'api_version'     => 2,
				'title'           => __( 'Ozzyl Store Embed', 'ozzyl-commerce' ),
				'category'        => 'embed',
				'icon'            => 'store',
				'description'     => __( 'Embed your Ozzyl storefront, product list, or single product.', 'ozzyl-commerce' ),
				'supports'        => [
					'align'  => [ 'wide', 'full' ],
					'html'   => false,
					'anchor' => true,
				],
				'attributes'      => [
					'type'   => [ 'type' => 'string',  'default' => 'store' ],
					'id'     => [ 'type' => 'string',  'default' => '' ],
					'height' => [ 'type' => 'integer', 'default' => self::DEFAULT_HEIGHT ],
					'theme'  => [ 'type' => 'string',  'default' => 'light' ],
					'title'  => [ 'type' => 'string',  'default' => 'Ozzyl Store' ],
				],
				'render_callback' => array( $this, 'render_block' ),
			]
		);
	}

	/**
	 * Server-side render callback for the ozzyl/store-embed block.
	 *
	 * @since 1.0.0
	 * @param array<string,mixed> $attributes Block attributes.
	 * @return string HTML output.
	 */
	public function render_block( array $attributes ): string {
		return $this->render_shortcode( [
			'type'   => $attributes['type']   ?? 'store',
			'id'     => $attributes['id']     ?? '',
			'height' => (string) ( $attributes['height'] ?? self::DEFAULT_HEIGHT ),
			'theme'  => $attributes['theme']  ?? 'light',
			'title'  => $attributes['title']  ?? __( 'Ozzyl Store', 'ozzyl-commerce' ),
		] );
	}

	// ── Asset enqueueing ──────────────────────────────────────────────────────

	/**
	 * Enqueue public-facing CSS and JS when the widget is present on the page.
	 *
	 * Assets are only loaded when needed (shortcode is detected in post content
	 * or when a widget renders).
	 *
	 * @since 1.0.0
	 */
	public function enqueue_public_assets(): void {
		// Only enqueue if the shortcode or block is on the current page.
		if ( ! $this->page_has_ozzyl_embed() ) {
			return;
		}

		wp_enqueue_script(
			'ozzyl-widget',
			OZZYL_PLUGIN_URL . 'public/assets/widget.js',
			[],
			OZZYL_VERSION,
			true // Load in footer.
		);

		wp_localize_script(
			'ozzyl-widget',
			'ozzylWidget',
			[
				'ajaxUrl'    => admin_url( 'admin-ajax.php' ),
				'restUrl'    => rest_url( 'ozzyl/v1' ),
				'siteUrl'    => get_site_url(),
				'pluginUrl'  => OZZYL_PLUGIN_URL,
				'version'    => OZZYL_VERSION,
			]
		);

		// Inline minimal CSS for the widget wrapper.
		wp_add_inline_style(
			'wp-block-library', // Piggyback on a commonly loaded handle.
			$this->get_inline_styles()
		);
	}

	// ── Helpers ───────────────────────────────────────────────────────────────

	/**
	 * Build the embed URL for the Ozzyl widget iframe.
	 *
	 * @since 1.0.0
	 * @param string $type  Embed type (store, products, product, cart, orders).
	 * @param string $id    Optional resource ID (for 'product' type).
	 * @param string $theme Color theme (light, dark, auto).
	 * @return string Fully-qualified embed URL, or empty string if not configured.
	 */
	private function build_embed_url( string $type, string $id, string $theme ): string {
		$api_key = get_option( 'ozzyl_api_key', '' );
		if ( empty( $api_key ) ) {
			return '';
		}

		// Determine the subdomain / custom domain from the stored store data.
		$store_data = get_transient( 'ozzyl_store_data' );

		if ( ! is_array( $store_data ) ) {
			// Attempt a fresh fetch (cached for 1 hour).
			$api      = new Ozzyl_API( $api_key );
			$fetched  = $api->get_store();
			if ( ! is_wp_error( $fetched ) && is_array( $fetched ) ) {
				$store_data = $fetched;
				set_transient( 'ozzyl_store_data', $store_data, HOUR_IN_SECONDS );
			}
		}

		// Determine the base storefront URL.
		$subdomain   = is_array( $store_data ) ? ( $store_data['subdomain'] ?? '' ) : '';
		$custom_domain = is_array( $store_data ) ? ( $store_data['customDomain'] ?? '' ) : '';

		if ( ! empty( $custom_domain ) ) {
			$base_url = 'https://' . $custom_domain;
		} elseif ( ! empty( $subdomain ) ) {
			$base_url = 'https://' . $subdomain . '.ozzyl.com';
		} else {
			// Fallback — cannot build URL without store info.
			return '';
		}

		// Build path based on embed type.
		$path = match ( $type ) {
			'products' => '/products',
			'product'  => ! empty( $id ) ? '/products/' . rawurlencode( $id ) : '/products',
			'cart'     => '/cart',
			'orders'   => '/orders',
			default    => '',
		};

		$args = [
			'embed'  => '1',
			'theme'  => $theme,
			'origin' => rawurlencode( get_site_url() ),
		];

		return $base_url . $path . '?' . http_build_query( $args );
	}

	/**
	 * Determine whether the current page contains an Ozzyl embed.
	 *
	 * @since 1.0.0
	 * @return bool
	 */
	private function page_has_ozzyl_embed(): bool {
		global $post;

		if ( $post instanceof WP_Post ) {
			if ( has_shortcode( $post->post_content, 'ozzyl_store' ) ) {
				return true;
			}
			if ( has_block( 'ozzyl/store-embed', $post ) ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Return minimal inline CSS for the widget wrapper.
	 *
	 * @since 1.0.0
	 * @return string CSS string.
	 */
	private function get_inline_styles(): string {
		return '
.ozzyl-widget-wrapper {
	width: 100%;
	max-width: 100%;
	overflow: hidden;
	border-radius: 8px;
	border: 1px solid #e5e7eb;
	margin: 16px 0;
}
.ozzyl-store-iframe {
	display: block;
	width: 100%;
	border: none;
	min-height: 200px;
	transition: height 0.2s ease;
}
.ozzyl-theme-dark .ozzyl-widget-wrapper {
	border-color: #374151;
}
.ozzyl-error {
	padding: 12px 16px;
	background: #fef2f2;
	border: 1px solid #fecaca;
	border-radius: 6px;
	color: #dc2626;
	font-size: 14px;
}
		';
	}
}
