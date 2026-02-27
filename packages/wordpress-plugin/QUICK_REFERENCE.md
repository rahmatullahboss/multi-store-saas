# WordPress Plugin — Quick Reference Guide

## Core System Access

```php
// Get singleton instance
$core = Ozzyl_Core::instance();

// Access API client
$api = $core->get_api();
$result = $api->get_store();

// Access license validator
$license = $core->get_license();
$plan = $license->get_plan();           // 'free'|'starter'|'pro'|'enterprise'
$has_fraud = $license->has_scope('fraud');
$license->refresh();                    // Force API call

// Access modules
$modules = $core->get_modules();        // All modules
$module = $core->get_module('fraud-detection');
$is_active = $core->is_module_active('fraud-detection');

// Control modules
$core->enable_module('fraud-detection');
$core->disable_module('fraud-detection');
$core->deactivate_all();                // Called on plugin deactivation
```

## Logging

```php
// Only logs when WP_DEBUG is true
Ozzyl_Logger::info('Order processed', ['order_id' => 123]);
Ozzyl_Logger::warning('High risk order', ['score' => 85]);
Ozzyl_Logger::error('API timeout', ['endpoint' => '/fraud/check']);

// Output: [Ozzyl][INFO] Order processed {"order_id":123}
// Check: wp-content/debug.log
```

## Creating a Module

### 1. Create Directory
```bash
mkdir -p packages/wordpress-plugin/modules/my-feature
```

### 2. Create `module.php`
```php
<?php
class Ozzyl_Module_My_Feature implements OzzylModuleInterface {
    
    public function get_id(): string {
        return 'my-feature';
    }

    public function get_name(): string {
        return __('My Feature', 'ozzyl-commerce');
    }

    public function get_icon(): string {
        return '✨';
    }

    public function get_description(): string {
        return __('My feature description', 'ozzyl-commerce');
    }

    public function get_required_scope(): string {
        return 'my_scope';  // Empty string = no special scope needed
    }

    public function get_min_plan(): string {
        return 'starter';  // 'free'|'starter'|'pro'|'enterprise'
    }

    public function activate(): void {
        add_action('woocommerce_payment_complete', [$this, 'on_payment'], 10, 1);
        Ozzyl_Logger::info('My Feature module activated');
    }

    public function deactivate(): void {
        remove_action('woocommerce_payment_complete', [$this, 'on_payment']);
        // Clean up transients, cancel crons, etc.
        Ozzyl_Logger::info('My Feature module deactivated');
    }

    public function render_settings(): void {
        ?>
        <div class="ozzyl-module-settings">
            <h3><?php esc_html_e('My Feature Settings', 'ozzyl-commerce'); ?></h3>
            <form method="post" action="options.php">
                <?php wp_nonce_field('ozzyl_my_feature_nonce'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="ozzyl_my_feature_enabled">
                                <?php esc_html_e('Enable Feature', 'ozzyl-commerce'); ?>
                            </label>
                        </th>
                        <td>
                            <input type="checkbox" 
                                   id="ozzyl_my_feature_enabled"
                                   name="ozzyl_my_feature_enabled"
                                   value="1"
                                   <?php checked(get_option('ozzyl_my_feature_enabled'), '1'); ?> />
                        </td>
                    </tr>
                </table>
                
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }

    public function get_stats(): array {
        global $wpdb;
        
        $count = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->postmeta}
             WHERE meta_key = '_my_feature_processed'"
        );
        
        return [
            'items_processed' => (int) $count,
        ];
    }

    public function on_payment(int $order_id): void {
        $order = wc_get_order($order_id);
        if (!$order) return;

        $core = Ozzyl_Core::instance();
        $api = $core->get_api();

        // Call API
        $result = $api->request('POST', '/my-endpoint', [
            'order_id' => $order->get_id(),
        ]);

        if (is_wp_error($result)) {
            Ozzyl_Logger::error('API error', ['error' => $result->get_error_message()]);
            return;
        }

        // Update order
        $order->update_meta_data('_my_feature_processed', true);
        $order->add_order_note('✅ Feature applied');
        $order->save();
    }
}

// Register at end of file
$core = Ozzyl_Core::instance();
$core->register_module(new Ozzyl_Module_My_Feature());
```

## Common Patterns

### API Call with Error Handling
```php
$core = Ozzyl_Core::instance();
$api = $core->get_api();

$result = $api->request('POST', '/endpoint', ['key' => 'value']);

if (is_wp_error($result)) {
    Ozzyl_Logger::error('API failed', ['error' => $result->get_error_message()]);
    // Handle error gracefully
    return;
}

// Process result
$data = $result['field'] ?? null;
```

### Check Module Status
```php
$core = Ozzyl_Core::instance();

if ($core->is_module_active('fraud-detection')) {
    // Module is active and hooks are registered
}
```

### Check Plan & Scope
```php
$core = Ozzyl_Core::instance();
$license = $core->get_license();

if ($license->has_scope('fraud')) {
    // User's plan includes fraud scope
}

if ('pro' === $license->get_plan()) {
    // Pro plan or higher
}
```

### Get Order Stats from Meta
```php
global $wpdb;

// Count orders with specific meta
$count = $wpdb->get_var(
    $wpdb->prepare(
        "SELECT COUNT(*) FROM {$wpdb->postmeta}
         WHERE meta_key = %s AND meta_value = %s",
        '_ozzyl_fraud_decision',
        'block'
    )
);
```

### Admin Settings with Nonce
```php
public function render_settings(): void {
    ?>
    <form method="post" action="options.php">
        <?php wp_nonce_field('ozzyl_my_settings_nonce'); ?>
        
        <input type="checkbox" 
               name="ozzyl_my_option"
               value="1"
               <?php checked(get_option('ozzyl_my_option'), '1'); ?> />
        
        <?php submit_button(); ?>
    </form>
    <?php
}
```

### Escape Output
```php
// HTML escape
echo esc_html($order->get_billing_phone());

// URL escape
echo esc_url($api_url);

// Attribute escape
echo esc_attr($class_name);

// Allow some HTML (for order notes)
echo wp_kses_post($html_content);
```

### Get Order Data
```php
$order = wc_get_order($order_id);

$order->get_id();
$order->get_status();
$order->get_billing_email();
$order->get_billing_phone();
$order->get_billing_first_name();
$order->get_total();
$order->get_currency();
$order->get_items();
$order->get_meta('_custom_key');
$order->get_user();
```

### Update Order Meta
```php
$order->update_meta_data('_my_key', 'value');
$order->add_order_note('✅ Message here', 0, true);  // is_customer_note=true
$order->set_status('on-hold');
$order->save();
```

## Module Settings Storage

### Convention
All module settings are stored as WP options with prefix `ozzyl_module_{id}_`:

```php
// Module enabled/disabled
get_option('ozzyl_module_fraud-detection_enabled')  // '0' or '1'

// Module-specific settings
get_option('ozzyl_fraud_check_all_methods')         // '1' or ''
get_option('ozzyl_fraud_fail_closed')               // '1' or ''
get_option('ozzyl_fraud_otp_enabled')               // '1' or ''
```

### Update Settings
```php
update_option('ozzyl_fraud_check_all_methods', '1');

// With sanitization
$value = sanitize_text_field($_POST['field']);
update_option('ozzyl_my_setting', $value);
```

## Security Checklist

- [ ] All user inputs sanitized: `sanitize_text_field()`, `absint()`, `esc_url()`
- [ ] All output escaped: `esc_html()`, `esc_attr()`, `esc_url()`, `wp_kses_post()`
- [ ] Admin forms have nonces: `wp_nonce_field()`, `check_admin_referer()`
- [ ] Capability checks: `current_user_can('manage_options')`
- [ ] No hardcoded API keys or secrets
- [ ] API response validation before processing
- [ ] Database queries use `$wpdb->prepare()` (parameterized)

## File Organization

### For a Complex Module
```
modules/my-feature/
├── module.php                  # Main class
├── class-my-feature-hooks.php  # Optional: WC hooks
├── class-my-feature-api.php    # Optional: API methods
├── assets/
│   ├── my-feature.js
│   └── my-feature.css
└── views/
    └── my-feature-box.php      # Admin meta box
```

### Naming Conventions
- Files: `kebab-case.php`
- Classes: `PascalCase`
- Methods: `snake_case`
- Hooks: `snake_case`
- Options: `snake_case` with module prefix

## Debugging Tips

### Enable Debug Mode
```php
// wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

### Check Debug Log
```bash
tail -f wp-content/debug.log | grep '\[Ozzyl\]'
```

### WP-CLI Helpers
```bash
# Check option
wp option get ozzyl_module_fraud-detection_enabled

# Set option
wp option update ozzyl_module_fraud-detection_enabled 1

# Run PHP
wp eval 'echo Ozzyl_Core::instance()->get_license()->get_plan();'

# Check transients
wp transient get ozzyl_license_cache
wp transient delete ozzyl_license_cache
```

### Test API Connection
```php
$core = Ozzyl_Core::instance();
$api = $core->get_api();

if ($api->test_connection()) {
    echo 'API connection OK';
} else {
    echo 'API connection FAILED';
}
```

## Resources

- **ARCHITECTURE.md** — Comprehensive architecture guide
- **RESTRUCTURING_SUMMARY.md** — What was changed and why
- **WordPress Plugin Handbook** — https://developer.wordpress.org/plugins/
- **WooCommerce Hooks Reference** — https://woocommerce.github.io/code-reference/hooks/
- **Ozzyl API Docs** — https://app.ozzyl.com/api-docs

---

_Quick Reference v1.0.0 — 2026-02-24_
