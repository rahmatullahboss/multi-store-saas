<?php
/**
 * Ozzyl Core Bootstrap
 *
 * Loads the module system, validates licenses, and coordinates module activation/deactivation.
 *
 * @package OzzylCommerce
 * @since   1.0.0
 */

// Prevent direct file access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Ozzyl_Core — Main module coordinator.
 *
 * Responsibilities:
 * 1. Load API client
 * 2. Load license validator
 * 3. Discover and register all modules
 * 4. Activate modules if: enabled in WP options AND plan has required scope
 * 5. Provide module registry to admin/public UI
 *
 * Usage:
 *   $core = Ozzyl_Core::instance();
 *   $modules = $core->get_modules();
 *   $api = $core->get_api();
 *
 * @since 1.0.0
 */
final class Ozzyl_Core {

	/** @var Ozzyl_Core|null Singleton instance. */
	private static ?Ozzyl_Core $instance = null;

	/** @var Ozzyl_API API client. */
	private Ozzyl_API $api;

	/** @var Ozzyl_License License validator. */
	private Ozzyl_License $license;

	/** @var OzzylModuleInterface[] Registered modules indexed by ID. */
	private array $modules = [];

	/** @var array<string,bool> Module enabled/disabled state. */
	private array $module_states = [];

	// ── Singleton ──────────────────────────────────────────────────────────

	/**
	 * Return (or create) the singleton instance.
	 *
	 * @since 1.0.0
	 * @return Ozzyl_Core
	 */
	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/** Private constructor — use ::instance(). */
	private function __construct() {
		$this->init();
	}

	// ── Initialization ─────────────────────────────────────────────────────

	/**
	 * Initialize core subsystems and load modules.
	 *
	 * @since 1.0.0
	 */
	private function init(): void {
		// Initialize API client from stored API key.
		$api_key      = get_option( 'ozzyl_api_key', '' );
		$this->api    = new Ozzyl_API( $api_key );
		$this->license = new Ozzyl_License( $this->api );

		// Load all modules.
		$this->load_modules();

		// Activate enabled modules.
		$this->activate_enabled_modules();
	}

	/**
	 * Discover and register all available modules.
	 *
	 * Looks in the modules/ directory for module.php files and loads them.
	 *
	 * @since 1.0.0
	 */
	private function load_modules(): void {
		$modules_dir = OZZYL_PLUGIN_DIR . 'modules';

		if ( ! is_dir( $modules_dir ) ) {
			Ozzyl_Logger::warning( 'Modules directory not found', [ 'path' => $modules_dir ] );
			return;
		}

		// Scan for module directories.
		$module_dirs = array_filter(
			scandir( $modules_dir ),
			function ( $item ) use ( $modules_dir ) {
				return '.' !== $item
					&& '..' !== $item
					&& is_dir( $modules_dir . '/' . $item )
					&& file_exists( $modules_dir . '/' . $item . '/module.php' );
			}
		);

		foreach ( $module_dirs as $module_dir ) {
			$module_path = $modules_dir . '/' . $module_dir . '/module.php';
			require_once $module_path;

			// The module.php file should instantiate and register the module via $this->register_module().
		}

		Ozzyl_Logger::info( 'Modules loaded', [ 'count' => count( $this->modules ) ] );
	}

	/**
	 * Register a module (called by module.php files during load_modules()).
	 *
	 * @since 1.0.0
	 * @param OzzylModuleInterface $module Module instance.
	 */
	public function register_module( OzzylModuleInterface $module ): void {
		$module_id                      = $module->get_id();
		$this->modules[ $module_id ]    = $module;
		$this->module_states[ $module_id ] = false; // Default to inactive.
	}

	/**
	 * Activate all enabled modules (those enabled in WP options AND have required plan scope).
	 *
	 * @since 1.0.0
	 */
	private function activate_enabled_modules(): void {
		foreach ( $this->modules as $module ) {
			$module_id = $module->get_id();

			// Check if enabled in settings.
			$enabled = (bool) get_option( 'ozzyl_module_' . $module_id . '_enabled', false );
			if ( ! $enabled ) {
				Ozzyl_Logger::info( 'Module disabled in settings', [ 'module' => $module_id ] );
				continue;
			}

			// Check if plan has required scope.
			$required_scope = $module->get_required_scope();
			if ( ! empty( $required_scope ) && ! $this->license->has_scope( $required_scope ) ) {
				Ozzyl_Logger::warning(
					'Module scope not available in plan',
					[
						'module' => $module_id,
						'required_scope' => $required_scope,
						'plan' => $this->license->get_plan(),
					]
				);
				continue;
			}

			// Activate the module.
			try {
				$module->activate();
				$this->module_states[ $module_id ] = true;
				Ozzyl_Logger::info( 'Module activated', [ 'module' => $module_id ] );
			} catch ( Exception $e ) {
				Ozzyl_Logger::error(
					'Module activation failed',
					[
						'module' => $module_id,
						'error' => $e->getMessage(),
					]
				);
			}
		}
	}

	// ── Public accessors ───────────────────────────────────────────────────

	/**
	 * Get the API client instance.
	 *
	 * @since 1.0.0
	 * @return Ozzyl_API
	 */
	public function get_api(): Ozzyl_API {
		return $this->api;
	}

	/**
	 * Get the license validator instance.
	 *
	 * @since 1.0.0
	 * @return Ozzyl_License
	 */
	public function get_license(): Ozzyl_License {
		return $this->license;
	}

	/**
	 * Get all registered modules.
	 *
	 * @since 1.0.0
	 * @return OzzylModuleInterface[] Modules indexed by ID.
	 */
	public function get_modules(): array {
		return $this->modules;
	}

	/**
	 * Get a specific module by ID.
	 *
	 * @since 1.0.0
	 * @param string $module_id Module identifier.
	 * @return OzzylModuleInterface|null Module instance or null if not found.
	 */
	public function get_module( string $module_id ): ?OzzylModuleInterface {
		return $this->modules[ $module_id ] ?? null;
	}

	/**
	 * Check if a module is currently active.
	 *
	 * @since 1.0.0
	 * @param string $module_id Module identifier.
	 * @return bool True if the module is active.
	 */
	public function is_module_active( string $module_id ): bool {
		return $this->module_states[ $module_id ] ?? false;
	}

	/**
	 * Enable a module by ID.
	 *
	 * Stores the enabled state in WP options and activates the module if plan allows.
	 *
	 * @since 1.0.0
	 * @param string $module_id Module identifier.
	 * @return bool True if successfully enabled, false if plan scope not available.
	 */
	public function enable_module( string $module_id ): bool {
		$module = $this->get_module( $module_id );
		if ( null === $module ) {
			return false;
		}

		// Check scope availability.
		$required_scope = $module->get_required_scope();
		if ( ! empty( $required_scope ) && ! $this->license->has_scope( $required_scope ) ) {
			return false;
		}

		// Save to options.
		update_option( 'ozzyl_module_' . $module_id . '_enabled', '1' );

		// Activate if not already active.
		if ( ! $this->is_module_active( $module_id ) ) {
			try {
				$module->activate();
				$this->module_states[ $module_id ] = true;
			} catch ( Exception $e ) {
				Ozzyl_Logger::error( 'Module activation failed', [ 'module' => $module_id ] );
				return false;
			}
		}

		return true;
	}

	/**
	 * Disable a module by ID.
	 *
	 * Deactivates hooks and clears transients, but preserves settings.
	 *
	 * @since 1.0.0
	 * @param string $module_id Module identifier.
	 * @return bool True if successfully disabled.
	 */
	public function disable_module( string $module_id ): bool {
		$module = $this->get_module( $module_id );
		if ( null === $module ) {
			return false;
		}

		// Save to options.
		update_option( 'ozzyl_module_' . $module_id . '_enabled', '0' );

		// Deactivate if active.
		if ( $this->is_module_active( $module_id ) ) {
			try {
				$module->deactivate();
				$this->module_states[ $module_id ] = false;
			} catch ( Exception $e ) {
				Ozzyl_Logger::error( 'Module deactivation failed', [ 'module' => $module_id ] );
				return false;
			}
		}

		return true;
	}

	/**
	 * Deactivate all modules (called on plugin deactivation).
	 *
	 * @since 1.0.0
	 */
	public function deactivate_all(): void {
		foreach ( $this->modules as $module_id => $module ) {
			if ( $this->is_module_active( $module_id ) ) {
				try {
					$module->deactivate();
					$this->module_states[ $module_id ] = false;
				} catch ( Exception $e ) {
					Ozzyl_Logger::error( 'Module deactivation failed', [ 'module' => $module_id ] );
				}
			}
		}
	}
}
