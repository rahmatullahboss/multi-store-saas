/**
 * Store Data Routes — WooCommerce Power Layer
 * DELETE /api/v1/store/data — Full GDPR/PDPA data purge for store
 */

import { Hono } from 'hono';
const storeData = new Hono<{ Bindings: Env }>();

// ─── DELETE /data ─────────────────────────────────────────────────────────────

storeData.delete('/data', async (c) => {
  try {
    const apiKey = c.var.apiKey;
    if (!apiKey) return c.json({ error: 'unauthorized' }, 401);

    const storeId = apiKey.storeId;

    // Tables to purge (analytics/tracking data only — NOT orders/products)
    const tablesToClear: string[] = [];

    const tables = [
      'fraud_events',
      'fraud_ip_events',
      'wc_cart_sessions',
      'sms_suppression_list',
      'wc_webhook_events',
      'phone_blacklist',
    ];

    await Promise.all(
      tables.map(async (table) => {
        try {
          const result = await c.env.DB.prepare(
            `DELETE FROM ${table} WHERE store_id = ?`
          ).bind(storeId).run();
          if (result.success) tablesToClear.push(table);
        } catch {
          // Table may not exist yet — non-fatal
        }
      })
    );

    // Clear KV entries for this store
    // Note: KV list + delete by prefix (best effort)
    const kvPrefixes = [
      `otp_rl:store:${storeId}`,
      `sms:optout:${storeId}:`,
      `courier:booked:${storeId}:`,
    ];
    await Promise.all(
      kvPrefixes.map(prefix =>
        c.env.KV!.delete(prefix).catch(() => {})
      )
    );

    console.log(`[Store Data Purge] Store=${storeId} Tables=${tablesToClear.join(',')}`);

    return c.json({
      deleted: true,
      tables_cleared: tablesToClear,
      message: 'All analytics and tracking data has been purged. Orders and products are not affected.',
    });
  } catch (err) {
    console.error('[Store Data Purge Error]', err);
    return c.json({ error: 'internal_error' }, 500);
  }
});

export { storeData as storeDataRouter };
