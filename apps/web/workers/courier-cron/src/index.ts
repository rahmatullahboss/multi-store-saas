/**
 * Courier Status Cron Worker
 *
 * Runs every 30 minutes to sync courier delivery statuses.
 *
 * Supports:
 * - Steadfast (via /status_by_cid/{consignment_id})
 * - Pathao (via /aladdin/api/v1/orders/{consignment_id}/info)
 * - RedX (via /parcel/track/{tracking_id})
 *
 * Flow:
 * 1. Query all stores with courier settings
 * 2. For each store, find orders with active courier bookings
 * 3. Call courier API to get latest status
 * 4. Update order status if changed
 */

interface Env {
  DB: D1Database;
  SAAS_DOMAIN: string;
}

interface OrderRow {
  id: number;
  storeId: number;
  orderNumber: string;
  courierProvider: string;
  courierConsignmentId: string;
  courierStatus: string | null;
  status: string;
}

interface StoreRow {
  id: number;
  name: string;
  courierSettings: string;
}

// ============================================================================
// STATUS MAPS — Map courier-specific statuses to internal order statuses
// ============================================================================

const STEADFAST_STATUS_MAP: Record<string, string> = {
  in_review: 'processing',
  pending: 'processing',
  delivered: 'delivered',
  partial_delivered: 'delivered',
  cancelled: 'cancelled',
  hold: 'processing',
  unknown: 'processing',
};

const PATHAO_STATUS_MAP: Record<string, string> = {
  Pending: 'processing',
  'Pickup Requested': 'processing',
  Picked: 'shipped',
  'In Transit': 'shipped',
  Delivered: 'delivered',
  Returned: 'returned',
  Cancelled: 'cancelled',
};

const REDX_STATUS_MAP: Record<string, string> = {
  'Pending Pickup': 'processing',
  'Picked Up': 'shipped',
  'In Transit': 'shipped',
  'Out for Delivery': 'shipped',
  Delivered: 'delivered',
  Returned: 'returned',
  Cancelled: 'cancelled',
};

// ============================================================================
// COURIER API HELPERS
// ============================================================================

async function fetchSteadfastStatus(
  apiKey: string,
  secretKey: string,
  consignmentId: string,
  baseUrl: string = 'https://portal.steadfast.com.bd/api/v1'
): Promise<{ courierStatus: string; orderStatus: string } | null> {
  try {
    const response = await fetch(`${baseUrl}/status_by_cid/${consignmentId}`, {
      headers: {
        'Api-Key': apiKey,
        'Secret-Key': secretKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;

    const data = await response.json() as {
      delivery_status?: string;
    };

    const deliveryStatus = data.delivery_status || 'unknown';
    const mappedStatus = STEADFAST_STATUS_MAP[deliveryStatus] || 'processing';

    return { courierStatus: deliveryStatus, orderStatus: mappedStatus };
  } catch (error) {
    console.error(`[COURIER-CRON] Steadfast status fetch failed for ${consignmentId}:`, error);
    return null;
  }
}

async function fetchPathaoStatus(
  credentials: { clientId: string; clientSecret: string; username: string; password: string; baseUrl?: string },
  consignmentId: string
): Promise<{ courierStatus: string; orderStatus: string } | null> {
  try {
    const baseUrl = (credentials.baseUrl || 'https://api-hermes.pathao.com/aladdin/api/v1')
      .replace(/\/+$/, '')
      .replace(/\/orders$/, '');

    // 1. Get access token
    const tokenResponse = await fetch(`${baseUrl}/issue-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        username: credentials.username,
        password: credentials.password,
        grant_type: 'password',
      }),
    });

    if (!tokenResponse.ok) return null;
    const tokenData = await tokenResponse.json() as { access_token: string };

    // 2. Get order status
    const statusResponse = await fetch(`${baseUrl}/orders/${consignmentId}/info`, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: 'application/json',
      },
    });

    if (!statusResponse.ok) return null;

    const statusData = await statusResponse.json() as {
      data: { order_status: string; order_status_slug: string };
    };

    const courierStatus = statusData.data.order_status_slug || statusData.data.order_status || 'Pending';
    const mappedStatus = PATHAO_STATUS_MAP[courierStatus] || 'processing';

    return { courierStatus, orderStatus: mappedStatus };
  } catch (error) {
    console.error(`[COURIER-CRON] Pathao status fetch failed for ${consignmentId}:`, error);
    return null;
  }
}

async function fetchRedXStatus(
  apiKey: string,
  trackingId: string,
  baseUrl: string = 'https://openapi.redx.com.bd/v1.0.0-beta'
): Promise<{ courierStatus: string; orderStatus: string } | null> {
  try {
    const response = await fetch(`${baseUrl}/parcel/track/${trackingId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'API-ACCESS-TOKEN': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) return null;

    const data = await response.json() as {
      current_status?: string;
    };

    const courierStatus = data.current_status || 'Pending Pickup';
    const mappedStatus = REDX_STATUS_MAP[courierStatus] || 'processing';

    return { courierStatus, orderStatus: mappedStatus };
  } catch (error) {
    console.error(`[COURIER-CRON] RedX status fetch failed for ${trackingId}:`, error);
    return null;
  }
}

// ============================================================================
// MAIN SCHEDULED HANDLER
// ============================================================================

export default {
  async scheduled(_event: ScheduledEvent, env: Env, _ctx: ExecutionContext): Promise<void> {
    const startTime = new Date().toISOString();
    console.log('[COURIER-CRON] Starting scheduled task at', startTime);

    let totalUpdated = 0;
    let totalChecked = 0;
    let totalErrors = 0;

    try {
      // 1. Get all stores with courier settings
      const storesResult = await env.DB.prepare(`
        SELECT id, name, courier_settings as courierSettings
        FROM stores
        WHERE courier_settings IS NOT NULL
          AND courier_settings != ''
          AND deleted_at IS NULL
      `).all<StoreRow>();

      const stores = storesResult.results || [];
      console.log(`[COURIER-CRON] Found ${stores.length} stores with courier settings`);

      for (const store of stores) {
        let settings: Record<string, Record<string, string>>;
        try {
          settings = JSON.parse(store.courierSettings);
        } catch {
          console.warn(`[COURIER-CRON] Invalid courier settings for store ${store.id}`);
          continue;
        }

        // 2. Get active courier orders for this store
        //    Only check orders that are NOT in terminal states (delivered, cancelled, returned)
        const ordersResult = await env.DB.prepare(`
          SELECT
            id,
            store_id as storeId,
            order_number as orderNumber,
            courier_provider as courierProvider,
            courier_consignment_id as courierConsignmentId,
            courier_status as courierStatus,
            status
          FROM orders
          WHERE store_id = ?
            AND courier_provider IS NOT NULL
            AND courier_consignment_id IS NOT NULL
            AND courier_consignment_id != ''
            AND status NOT IN ('delivered', 'cancelled', 'returned')
        `).bind(store.id).all<OrderRow>();

        const orders = ordersResult.results || [];
        if (orders.length === 0) continue;

        console.log(`[COURIER-CRON] Checking ${orders.length} active courier orders for store "${store.name}" (${store.id})`);

        for (const order of orders) {
          totalChecked++;

          let statusResult: { courierStatus: string; orderStatus: string } | null = null;

          try {
            // Fetch status based on provider
            if (order.courierProvider === 'steadfast' && settings.steadfast) {
              statusResult = await fetchSteadfastStatus(
                settings.steadfast.apiKey,
                settings.steadfast.secretKey,
                order.courierConsignmentId,
                settings.steadfast.baseUrl
              );
            } else if (order.courierProvider === 'pathao' && settings.pathao) {
              statusResult = await fetchPathaoStatus(
                settings.pathao as unknown as { clientId: string; clientSecret: string; username: string; password: string; baseUrl?: string },
                order.courierConsignmentId
              );
            } else if (order.courierProvider === 'redx' && settings.redx) {
              statusResult = await fetchRedXStatus(
                settings.redx.apiKey,
                order.courierConsignmentId,
                settings.redx.baseUrl
              );
            }
          } catch (error) {
            console.error(`[COURIER-CRON] Error fetching status for order ${order.orderNumber}:`, error);
            totalErrors++;
            continue;
          }

          if (!statusResult) {
            totalErrors++;
            continue;
          }

          // Only update if courier status actually changed
          if (statusResult.courierStatus !== order.courierStatus) {
            console.log(
              `[COURIER-CRON] Order ${order.orderNumber}: ${order.courierStatus} → ${statusResult.courierStatus} (order status: ${order.status} → ${statusResult.orderStatus})`
            );

            await env.DB.prepare(`
              UPDATE orders
              SET courier_status = ?,
                  status = ?,
                  updated_at = ?
              WHERE id = ? AND store_id = ?
            `)
              .bind(
                statusResult.courierStatus,
                statusResult.orderStatus,
                new Date().toISOString(),
                order.id,
                order.storeId
              )
              .run();

            totalUpdated++;
          }
        }
      }

      console.log(
        `[COURIER-CRON] Completed. Checked: ${totalChecked}, Updated: ${totalUpdated}, Errors: ${totalErrors}`
      );
    } catch (error) {
      console.error('[COURIER-CRON] Fatal error:', error);
      throw error;
    }
  },
};
