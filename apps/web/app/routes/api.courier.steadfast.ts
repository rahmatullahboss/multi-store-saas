/**
 * Steadfast Courier API Route
 * 
 * Route: /api/courier/steadfast
 * 
 * Actions:
 * - CHECK_RISK: Analyze customer phone number for fraud risk
 * - BOOK_ORDER: Create shipment and update order
 * - GET_STATUS: Check single order delivery status
 * - CANCEL_ORDER: Mark order as cancelled (DB only — Steadfast cancellation is manual)
 * - SYNC_STATUS: Bulk sync shipment statuses for cron job
 */

import type { ActionFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, inArray } from 'drizzle-orm';
import { orders, customers, stores, shipments } from '@db/schema';
import { getStoreId } from '~/services/auth.server';
import { 
  createSteadfastClient, 
  checkCustomerRisk,
} from '~/services/steadfast.server';
import { getUnifiedStorefrontSettings } from '~/services/unified-storefront-settings.server';

// Types for responses
interface CheckRiskResponse {
  isHighRisk: boolean;
  successRate: number;
  totalOrders: number;
  returnedOrders: number;
  riskScore: number;
}

interface BookOrderResponse {
  success: boolean;
  consignmentId: string;
  trackingCode: string;
}

interface SyncStatusResponse {
  success: boolean;
  updated: number;
  errors: string[];
}

// ============================================================================
// ACTION HANDLER
// ============================================================================
export async function action({ request, context }: ActionFunctionArgs) {
  const storeId = await getStoreId(request, context.cloudflare.env);
  if (!storeId) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const intent = formData.get('intent') as string;

  const db = drizzle(context.cloudflare.env.DB);

  // ========================================
  // CHECK_RISK - Analyze customer fraud risk
  // ========================================
  if (intent === 'CHECK_RISK') {
    const phone = formData.get('phone') as string;
    
    if (!phone) {
      return json({ error: 'Phone number is required' }, { status: 400 });
    }

    try {
      const riskResult = await checkCustomerRisk(phone, db, storeId);

      // Optionally cache the result in customers table if they exist
      const normalizedPhone = phone.replace(/[\s-]/g, '');
      await db
        .update(customers)
        .set({
          riskScore: riskResult.riskScore,
          riskCheckedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(customers.phone, normalizedPhone),
            eq(customers.storeId, storeId)
          )
        );

      return json<CheckRiskResponse>({
        isHighRisk: riskResult.isHighRisk,
        successRate: riskResult.successRate,
        totalOrders: riskResult.totalOrders,
        returnedOrders: riskResult.returnedOrders,
        riskScore: riskResult.riskScore,
      });
    } catch (error) {
      console.error('Risk check error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Risk check failed' },
        { status: 500 }
      );
    }
  }

  // ========================================
  // CHECK_EXTERNAL_FRAUD - Live check using Steadfast API
  // ========================================
  if (intent === 'CHECK_EXTERNAL_FRAUD') {
    const phone = formData.get('phone') as string;
    
    if (!phone) {
      return json({ error: 'Phone number is required' }, { status: 400 });
    }

    try {
      const settings = await getUnifiedStorefrontSettings(db, storeId, {
        env: context.cloudflare.env,
      });

      // 1. Try to get session cookies from KV (populated by sync.ts using merchant's email+password)
      let sessionCookie: string | undefined;
      let xsrfToken: string | undefined;

      // 2. Load from KV: cookies auto-synced per store using sync.ts
      try {
        const kv = context.cloudflare.env?.STORE_CACHE;
        if (kv) {
          const cachedCredsRaw = await kv.get(`steadfast_credentials_${storeId}`);
          if (cachedCredsRaw) {
            const parsedCreds = JSON.parse(cachedCredsRaw) as { sessionCookie: string; xsrfToken: string };
            sessionCookie = parsedCreds.sessionCookie;
            xsrfToken = parsedCreds.xsrfToken;
          }
        }
      } catch (e) {
        console.error('[FRAUD CHECK] Failed to load Steadfast KV credentials', e);
      }

      if (!sessionCookie || !xsrfToken) {
        return json(
          { error: 'Steadfast session cookies not found. Please enter your Steadfast portal Email & Password in Courier Settings so the system can auto-manage authentication.' },
          { status: 400 }
        );
      }

      const client = createSteadfastClient({
        apiKey: settings.courier?.steadfast?.apiKey || '',
        secretKey: settings.courier?.steadfast?.secretKey || '',
        sessionCookie,
        xsrfToken,
      });
      const riskResult = await client.checkExternalFraud(phone);

      return json({
        success: true,
        data: riskResult,
      });
    } catch (error) {
      console.error('External risk check error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'External risk check failed' },
        { status: 500 }
      );
    }
  }

  // ========================================
  // BOOK_ORDER - Create Steadfast shipment
  // ========================================
  if (intent === 'BOOK_ORDER') {
    const orderId = parseInt(formData.get('orderId') as string);
    
    if (!orderId) {
      return json({ error: 'Order ID is required' }, { status: 400 });
    }

    try {
      // Get order
      const orderResult = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)))
        .limit(1);

      if (!orderResult[0]) {
        return json({ error: 'Order not found' }, { status: 404 });
      }

      const order = orderResult[0];

      // Check if order is cancelled
      if (['cancelled', 'returned'].includes(order.status || '')) {
        return json(
          { error: 'Cannot book courier for cancelled or returned orders. Please activate the order first.' },
          { status: 400 }
        );
      }

      // Check if already shipped
      if (order.courierConsignmentId) {
        return json(
          { error: 'Order already has a shipment' },
          { status: 400 }
        );
      }

      // ========== FRAUD CHECK (Fulfillment Gate) ==========
      if (order.customerPhone) {
        try {
          const { performFraudCheck, parseFraudSettings } = await import('~/services/fraud-engine.server');

          // Get store fraud settings
          const fraudStoreResult = await db
            .select({ fraudSettings: stores.fraudSettings })
            .from(stores)
            .where(eq(stores.id, storeId))
            .limit(1);

          const fraudSettings = parseFraudSettings(fraudStoreResult[0]?.fraudSettings);

          if (fraudSettings.enabled) {
            const assessment = await performFraudCheck({
              phone: order.customerPhone,
              storeId,
              orderTotal: order.total,
              paymentMethod: order.paymentMethod || 'cod',
              shippingAddress: order.shippingAddress as string,
              db,
              orderId,
              settings: fraudSettings,
              // ── Phase 1A: Cloudflare edge signals ──────────────────────────
              // At courier booking time, the merchant is acting server-side,
              // so IP is the merchant's IP — still useful for audit trail.
              ipAddress: request.headers.get('CF-Connecting-IP') || undefined,
              cfCountry: request.headers.get('CF-IPCountry') || undefined,
              cfDeviceType: request.headers.get('CF-Device-Type') || undefined,
              userAgent: request.headers.get('User-Agent') || undefined,
            });

            if (assessment.decision === 'block') {
              return json(
                { 
                  error: `⛔ Fraud detected (Score: ${assessment.clampedScore}/100). This order is blocked. Require prepayment or contact the customer.`,
                  riskScore: assessment.clampedScore,
                  decision: assessment.decision,
                  signals: assessment.signals,
                },
                { status: 403 }
              );
            }

            if (assessment.decision === 'hold') {
              return json(
                { 
                  error: `⚠️ High risk order (Score: ${assessment.clampedScore}/100). Order is on HOLD for manual review. Go to Settings > Fraud Detection to review.`,
                  riskScore: assessment.clampedScore,
                  decision: assessment.decision,
                  signals: assessment.signals,
                },
                { status: 403 }
              );
            }
          }
        } catch (fraudError) {
          // Don't block order if fraud check itself fails
          console.error('[FRAUD] Fraud check error during booking:', fraudError);
        }
      }

      // Get courier settings from unified settings (single source of truth)
      const settings = await getUnifiedStorefrontSettings(db, storeId, {
        env: context.cloudflare.env,
      });
      const courierSettings = settings.courier;
      if (!courierSettings) {
        return json(
          { error: 'Steadfast not configured. Go to Settings > Courier.' },
          { status: 400 }
        );
      }

      if (!courierSettings.steadfast) {
        return json(
          { error: 'Steadfast credentials not configured' },
          { status: 400 }
        );
      }

      // Create Steadfast client
      const client = createSteadfastClient({
        apiKey: courierSettings.steadfast.apiKey || '',
        secretKey: courierSettings.steadfast.secretKey || '',
      });

      // Parse shipping address
      let address = '';
      if (order.shippingAddress) {
        const parsed = typeof order.shippingAddress === 'string'
          ? JSON.parse(order.shippingAddress)
          : order.shippingAddress;
        address = [parsed.address, parsed.city].filter(Boolean).join(', ');
      }

      // Create shipment
      const result = await client.createOrder({
        invoice: order.orderNumber,
        recipient_name: order.customerName || 'Customer',
        recipient_phone: order.customerPhone || '',
        recipient_address: address || 'N/A',
        cod_amount: order.total,
        note: order.notes || undefined,
      });

      // Update order with courier info
      await db
        .update(orders)
        .set({
          courierProvider: 'steadfast',
          courierConsignmentId: result.consignment_id,
          courierStatus: 'booked',
          status: 'processing',
          updatedAt: new Date(),
        })
        .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));

      // Create shipment record
      await db.insert(shipments).values({
        orderId,
        courier: 'steadfast',
        trackingNumber: result.tracking_code,
        status: 'pending',
        courierData: JSON.stringify(result),
        shippedAt: new Date(),
      });

      return json<BookOrderResponse>({
        success: true,
        consignmentId: result.consignment_id,
        trackingCode: result.tracking_code,
      });
    } catch (error) {
      console.error('Book order error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Booking failed' },
        { status: 500 }
      );
    }
  }

  // ========================================
  // SYNC_STATUS - Bulk sync shipment statuses
  // ========================================
  if (intent === 'SYNC_STATUS') {
    try {
      // Get courier settings from unified settings (single source of truth)
      const settings = await getUnifiedStorefrontSettings(db, storeId, {
        env: context.cloudflare.env,
      });
      const courierSettings = settings.courier;
      if (!courierSettings) {
        return json({ error: 'Steadfast not configured' }, { status: 400 });
      }

      if (!courierSettings.steadfast) {
        return json({ error: 'Steadfast credentials not found' }, { status: 400 });
      }

      // Create client
      const client = createSteadfastClient({
        apiKey: courierSettings.steadfast.apiKey || '',
        secretKey: courierSettings.steadfast.secretKey || '',
      });

      // Get all in-transit orders with Steadfast
      const inTransitOrders = await db
        .select({
          id: orders.id,
          consignmentId: orders.courierConsignmentId,
          currentStatus: orders.courierStatus,
        })
        .from(orders)
        .where(
          and(
            eq(orders.storeId, storeId),
            eq(orders.courierProvider, 'steadfast'),
            inArray(orders.status, ['processing', 'shipped'])
          )
        );

      let updated = 0;
      const errors: string[] = [];

      // Check status for each order
      for (const order of inTransitOrders) {
        if (!order.consignmentId) continue;

        try {
          const status = await client.checkStatus(order.consignmentId);
          const normalizedStatus = client.normalizeStatus(status.delivery_status);

          // Only update if status changed
          if (status.delivery_status !== order.currentStatus) {
            await db
              .update(orders)
              .set({
                courierStatus: status.delivery_status,
                status: normalizedStatus as 'processing' | 'shipped' | 'delivered' | 'cancelled',
                updatedAt: new Date(),
              })
              .where(and(eq(orders.id, order.id), eq(orders.storeId, storeId)));

            // Update shipment record
            await db
              .update(shipments)
              .set({
                status: normalizedStatus as 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned',
                courierData: JSON.stringify(status),
                deliveredAt: normalizedStatus === 'delivered' ? new Date() : undefined,
                updatedAt: new Date(),
              })
              .where(eq(shipments.orderId, order.id));

            updated++;
          }
        } catch (error) {
          errors.push(`Order ${order.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      return json<SyncStatusResponse>({
        success: true,
        updated,
        errors,
      });
    } catch (error) {
      console.error('Sync status error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Sync failed' },
        { status: 500 }
      );
    }
  }

  // ========================================
  // GET_STATUS - Get single order status
  // ========================================
  if (intent === 'GET_STATUS') {
    const consignmentId = formData.get('consignmentId') as string;
    
    if (!consignmentId) {
      return json({ error: 'Consignment ID is required' }, { status: 400 });
    }

    try {
      // Get courier settings from unified settings (single source of truth)
      const settings = await getUnifiedStorefrontSettings(db, storeId, {
        env: context.cloudflare.env,
      });
      const courierSettings = settings.courier;
      if (!courierSettings) {
        return json({ error: 'Steadfast not configured' }, { status: 400 });
      }

      if (!courierSettings.steadfast) {
        return json({ error: 'Steadfast credentials not found' }, { status: 400 });
      }

      const client = createSteadfastClient({
        apiKey: courierSettings.steadfast.apiKey || '',
        secretKey: courierSettings.steadfast.secretKey || '',
      });
      const status = await client.checkStatus(consignmentId);

      const deliveryStatus = status.delivery_status?.toLowerCase() || '';
      const isTerminal = deliveryStatus.includes('return') || deliveryStatus.includes('cancel');
      const terminalType = deliveryStatus.includes('return') ? 'returned'
        : deliveryStatus.includes('cancel') ? 'cancelled'
        : undefined;

      return json({
        status: status.delivery_status,
        trackingCode: status.tracking_code,
        normalizedStatus: client.normalizeStatus(status.delivery_status),
        timelineStep: client.getTimelineStepIndex(status.delivery_status),
        isTerminal,
        terminalType,
      });
    } catch (error) {
      console.error('Get status error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Status check failed' },
        { status: 500 }
      );
    }
  }

  // ========================================
  // CANCEL_ORDER - Cancel Steadfast shipment
  // (Steadfast public API has no cancel endpoint — mark in DB and contact support)
  // ========================================
  if (intent === 'CANCEL_ORDER') {
    const consignmentId = formData.get('consignmentId') as string;
    const orderId = parseInt(formData.get('orderId') as string);

    if (!consignmentId || !orderId) {
      return json({ error: 'Consignment ID and Order ID are required' }, { status: 400 });
    }

    try {
      // Steadfast does not expose a public cancel API.
      // We mark the order as cancelled in our DB and instruct the merchant
      // to contact Steadfast support for refund of the delivery charge.
      await db
        .update(orders)
        .set({
          courierStatus: 'cancelled',
          status: 'cancelled',
          updatedAt: new Date(),
        })
        .where(and(eq(orders.id, orderId), eq(orders.storeId, storeId)));

      // Update shipment record
      await db
        .update(shipments)
        .set({
          status: 'returned',
          updatedAt: new Date(),
        })
        .where(eq(shipments.orderId, orderId));

      return json({
        success: true,
        message:
          'Order marked as cancelled. Please contact Steadfast support to cancel the shipment and reclaim the delivery charge. Consignment ID: ' +
          consignmentId,
        manual: true,
      });
    } catch (error) {
      console.error('Steadfast cancel error:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Cancel failed' },
        { status: 500 }
      );
    }
  }

  return json({ error: 'Invalid intent' }, { status: 400 });
}


export default function() {}
