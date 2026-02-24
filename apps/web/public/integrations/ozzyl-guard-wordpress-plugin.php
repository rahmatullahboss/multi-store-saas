<?php
/**
 * Plugin Name: Ozzyl Guard — COD Fraud Detection
 * Plugin URI:  https://ozzyl.com/guard
 * Description: Protect your WooCommerce store from fake COD orders using Ozzyl Guard AI fraud detection.
 * Version:     1.0.0
 * Author:      Ozzyl
 * Author URI:  https://ozzyl.com
 * License:     GPL-2.0+
 * Text Domain: ozzyl-guard
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * INSTALLATION:
 * 1. Upload this file to /wp-content/plugins/ozzyl-guard/ozzyl-guard.php
 * 2. Activate the plugin in WordPress admin → Plugins
 * 3. Go to WooCommerce → Settings → Ozzyl Guard and enter your API key
 *    (Get your key from: https://app.ozzyl.com/fdaas)
 * ─────────────────────────────────────────────────────────────────────────────
 */

defined('ABSPATH') || exit;

// ── Constants ──────────────────────────────────────────────────────────────
define('OZZYL_GUARD_VERSION', '1.0.0');
define('OZZYL_GUARD_API_URL', 'https://app.ozzyl.com/api/v1/fraud-check');
define('OZZYL_GUARD_OPTION_KEY', 'ozzyl_guard_api_key');
define('OZZYL_GUARD_OPTION_ACTION', 'ozzyl_guard_action'); // 'flag' | 'hold' | 'cancel'
define('OZZYL_GUARD_OPTION_THRESHOLD', 'ozzyl_guard_threshold'); // 'HIGH' | 'CRITICAL'

// ── Settings Page ──────────────────────────────────────────────────────────
add_action('admin_menu', function () {
    add_submenu_page(
        'woocommerce',
        'Ozzyl Guard Settings',
        '🛡️ Ozzyl Guard',
        'manage_options',
        'ozzyl-guard',
        'ozzyl_guard_settings_page'
    );
});

add_action('admin_init', function () {
    register_setting('ozzyl_guard_settings', OZZYL_GUARD_OPTION_KEY, [
        'sanitize_callback' => 'sanitize_text_field',
    ]);
    register_setting('ozzyl_guard_settings', OZZYL_GUARD_OPTION_ACTION, [
        'sanitize_callback' => 'sanitize_text_field',
        'default'           => 'hold',
    ]);
    register_setting('ozzyl_guard_settings', OZZYL_GUARD_OPTION_THRESHOLD, [
        'sanitize_callback' => 'sanitize_text_field',
        'default'           => 'HIGH',
    ]);
});

function ozzyl_guard_settings_page() {
    $api_key   = get_option(OZZYL_GUARD_OPTION_KEY, '');
    $action    = get_option(OZZYL_GUARD_OPTION_ACTION, 'hold');
    $threshold = get_option(OZZYL_GUARD_OPTION_THRESHOLD, 'HIGH');
    ?>
    <div class="wrap">
        <h1>🛡️ Ozzyl Guard — COD Fraud Detection</h1>
        <p>Powered by <a href="https://ozzyl.com/guard" target="_blank">Ozzyl Guard AI</a>. 
           Get your API key at <a href="https://app.ozzyl.com/fdaas" target="_blank">app.ozzyl.com/fdaas</a>.</p>

        <form method="post" action="options.php">
            <?php settings_fields('ozzyl_guard_settings'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="ozzyl_api_key">API Key</label></th>
                    <td>
                        <input type="password" id="ozzyl_api_key" name="<?= OZZYL_GUARD_OPTION_KEY ?>"
                               value="<?= esc_attr($api_key) ?>" class="regular-text" placeholder="og_live_..." />
                        <p class="description">Get your key from <a href="https://app.ozzyl.com/fdaas" target="_blank">app.ozzyl.com/fdaas</a></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label>Risk Threshold</label></th>
                    <td>
                        <select name="<?= OZZYL_GUARD_OPTION_THRESHOLD ?>">
                            <option value="CRITICAL" <?= selected($threshold, 'CRITICAL', false) ?>>CRITICAL only (score 85+)</option>
                            <option value="HIGH"     <?= selected($threshold, 'HIGH', false) ?>>HIGH or above (score 60+) — Recommended</option>
                            <option value="MEDIUM"   <?= selected($threshold, 'MEDIUM', false) ?>>MEDIUM or above (score 40+)</option>
                        </select>
                        <p class="description">Orders at or above this risk level will be flagged.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><label>Action on Fraud Detection</label></th>
                    <td>
                        <select name="<?= OZZYL_GUARD_OPTION_ACTION ?>">
                            <option value="flag"   <?= selected($action, 'flag', false) ?>>Flag only (add order note)</option>
                            <option value="hold"   <?= selected($action, 'hold', false) ?>>Put on hold (recommended)</option>
                            <option value="cancel" <?= selected($action, 'cancel', false) ?>>Cancel order immediately</option>
                        </select>
                    </td>
                </tr>
            </table>
            <?php submit_button('Save Settings'); ?>
        </form>

        <?php if ($api_key): ?>
        <hr/>
        <h2>Test API Connection</h2>
        <form method="post">
            <?php wp_nonce_field('ozzyl_test_connection'); ?>
            <input type="hidden" name="ozzyl_test" value="1" />
            <?php submit_button('Test with phone: 01700000000', 'secondary'); ?>
        </form>
        <?php
            if (isset($_POST['ozzyl_test']) && wp_verify_nonce($_POST['_wpnonce'], 'ozzyl_test_connection')) {
                $result = ozzyl_guard_check_phone('01700000000', 0, 'cod');
                echo '<pre style="background:#f0f0f0;padding:12px;border-radius:6px;">';
                echo esc_html(json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                echo '</pre>';
            }
        ?>
        <?php endif; ?>
    </div>
    <?php
}

// ── Core: Call Ozzyl Guard API ─────────────────────────────────────────────
function ozzyl_guard_check_phone(string $phone, float $order_total, string $payment_method): ?array {
    $api_key = get_option(OZZYL_GUARD_OPTION_KEY, '');
    if (empty($api_key)) return null;

    $response = wp_remote_post(OZZYL_GUARD_API_URL, [
        'timeout' => 5, // 5 second timeout — don't slow checkout
        'headers' => [
            'Authorization' => 'Bearer ' . $api_key,
            'Content-Type'  => 'application/json',
        ],
        'body' => wp_json_encode([
            'phone'          => $phone,
            'order_total'    => $order_total,
            'payment_method' => $payment_method,
        ]),
    ]);

    if (is_wp_error($response)) {
        error_log('[OzzylGuard] API error: ' . $response->get_error_message());
        return null; // Fail open — don't block orders if API is down
    }

    $body = json_decode(wp_remote_retrieve_body($response), true);
    return is_array($body) ? $body : null;
}

// ── Hook: Check fraud on order creation (COD only) ─────────────────────────
add_action('woocommerce_checkout_order_created', function (WC_Order $order) {
    // Only check COD orders
    if ($order->get_payment_method() !== 'cod') return;

    $phone     = $order->get_billing_phone();
    $total     = (float) $order->get_total();
    $threshold = get_option(OZZYL_GUARD_OPTION_THRESHOLD, 'HIGH');
    $action    = get_option(OZZYL_GUARD_OPTION_ACTION, 'hold');

    if (empty($phone)) return;

    $result = ozzyl_guard_check_phone($phone, $total, 'cod');
    if (!$result || empty($result['success'])) return;

    $risk_level = $result['risk_level'] ?? 'LOW';
    $risk_score = $result['risk_score'] ?? 0;
    $decision   = $result['decision'] ?? 'allow';

    // Risk levels in order of severity
    $levels     = ['LOW' => 1, 'MEDIUM' => 2, 'HIGH' => 3, 'CRITICAL' => 4];
    $order_risk = $levels[$risk_level] ?? 1;
    $min_risk   = $levels[$threshold] ?? 3;

    // Always add meta for reference
    $order->update_meta_data('_ozzyl_risk_score', $risk_score);
    $order->update_meta_data('_ozzyl_risk_level', $risk_level);
    $order->update_meta_data('_ozzyl_decision', $decision);

    $signals_text = '';
    if (!empty($result['signals'])) {
        $signal_list  = array_map(fn($s) => $s['type'], $result['signals']);
        $signals_text = ' Signals: ' . implode(', ', $signal_list) . '.';
    }

    if ($order_risk >= $min_risk) {
        $note = sprintf(
            '🛡️ Ozzyl Guard: Risk %s (score: %d/100).%s',
            $risk_level, $risk_score, $signals_text
        );

        switch ($action) {
            case 'cancel':
                $order->update_status('cancelled', $note);
                break;
            case 'hold':
                $order->update_status('on-hold', $note);
                break;
            case 'flag':
            default:
                $order->add_order_note($note);
                break;
        }
    } else {
        // Low risk — just log it quietly
        $order->add_order_note(
            sprintf('🛡️ Ozzyl Guard: Low risk (score: %d/100). Order approved.', $risk_score)
        );
    }

    $order->save();
}, 10, 1);

// ── Show risk score in WooCommerce order admin ─────────────────────────────
add_action('woocommerce_admin_order_data_after_billing_address', function (WC_Order $order) {
    $score = $order->get_meta('_ozzyl_risk_score');
    $level = $order->get_meta('_ozzyl_risk_level');
    if ($score === '') return;

    $colors = [
        'LOW'      => '#16a34a',
        'MEDIUM'   => '#d97706',
        'HIGH'     => '#ea580c',
        'CRITICAL' => '#dc2626',
    ];
    $color = $colors[$level] ?? '#6b7280';
    echo '<div style="margin-top:12px;padding:8px 12px;background:#f9f9f9;border-left:4px solid ' . esc_attr($color) . ';border-radius:4px;">';
    echo '<strong>🛡️ Ozzyl Guard</strong><br/>';
    echo 'Risk Level: <strong style="color:' . esc_attr($color) . '">' . esc_html($level) . '</strong> ';
    echo '(Score: ' . esc_html($score) . '/100)';
    echo '</div>';
}, 10, 1);
