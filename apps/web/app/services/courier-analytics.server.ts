/**
 * Courier Performance Analytics Service
 *
 * Provides analytics and insights for courier delivery performance.
 * Tracks success rates, delivery times, failure reasons, and costs.
 */

import type { Database } from '~/lib/db.server';
import { courierPerformanceLogs, orders, shipments } from '@db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';

export interface CourierMetrics {
  courier: string;
  totalShipments: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  successRate: number;
  avgDeliveryTimeHours: number;
  avgDeliveryCost: number;
  avgAttempts: number;
  failureReasons: Record<string, number>;
  costPerSuccessfulDelivery: number;
}

export interface CourierAnalyticsFilters {
  storeId: number;
  startDate?: Date;
  endDate?: Date;
  courier?: string;
}

/**
 * Get courier performance metrics for a store
 */
export async function getCourierPerformance(
  db: Database,
  filters: CourierAnalyticsFilters
): Promise<CourierMetrics[]> {
  const { storeId, startDate, endDate, courier } = filters;

  const conditions = [eq(courierPerformanceLogs.storeId, storeId)];
  if (startDate) conditions.push(gte(courierPerformanceLogs.createdAt, startDate));
  if (endDate) conditions.push(lte(courierPerformanceLogs.createdAt, endDate));
  if (courier) conditions.push(eq(courierPerformanceLogs.courier, courier));

  const logs = await db.select().from(courierPerformanceLogs).where(and(...conditions));

  // Group by courier and calculate metrics
  const courierMap = new Map<string, (typeof logs)>();

  for (const log of logs) {
    const existing = courierMap.get(log.courier) || [];
    existing.push(log);
    courierMap.set(log.courier, existing);
  }

  const metrics: CourierMetrics[] = [];

  for (const [courierName, courierLogs] of courierMap.entries()) {
    const totalShipments = courierLogs.length;
    const successfulDeliveries = courierLogs.filter((log) => log.isSuccessful === 1).length;
    const failedDeliveries = totalShipments - successfulDeliveries;
    const successRate = totalShipments > 0 ? (successfulDeliveries / totalShipments) * 100 : 0;

    const deliveryTimes = courierLogs
      .filter((log) => log.deliveryTimeHours !== null)
      .map((log) => log.deliveryTimeHours!);
    const avgDeliveryTimeHours =
      deliveryTimes.length > 0
        ? deliveryTimes.reduce((a: number, b: number) => a + b, 0) / deliveryTimes.length
        : 0;

    const deliveryCosts = courierLogs
      .filter((log) => log.deliveryCost !== null)
      .map((log) => log.deliveryCost!);
    const avgDeliveryCost =
      deliveryCosts.length > 0
        ? deliveryCosts.reduce((a: number, b: number) => a + b, 0) / deliveryCosts.length
        : 0;

    const attempts = courierLogs
      .filter((log) => log.attemptCount !== null)
      .map((log) => log.attemptCount!);
    const avgAttempts =
      attempts.length > 0 ? attempts.reduce((a: number, b: number) => a + b, 0) / attempts.length : 1;

    const failureReasons: Record<string, number> = {};
    courierLogs
      .filter((log) => log.failureReason !== null)
      .forEach((log) => {
        const reason = log.failureReason!;
        failureReasons[reason] = (failureReasons[reason] || 0) + 1;
      });

    const totalCost = deliveryCosts.reduce((a: number, b: number) => a + b, 0);
    const costPerSuccessfulDelivery =
      successfulDeliveries > 0 ? totalCost / successfulDeliveries : 0;

    metrics.push({
      courier: courierName,
      totalShipments,
      successfulDeliveries,
      failedDeliveries,
      successRate: Math.round(successRate * 100) / 100,
      avgDeliveryTimeHours: Math.round(avgDeliveryTimeHours * 100) / 100,
      avgDeliveryCost: Math.round(avgDeliveryCost * 100) / 100,
      avgAttempts: Math.round(avgAttempts * 100) / 100,
      failureReasons,
      costPerSuccessfulDelivery: Math.round(costPerSuccessfulDelivery * 100) / 100,
    });
  }

  return metrics.sort((a, b) => b.totalShipments - a.totalShipments);
}

/**
 * Get courier performance summary for dashboard
 */
export async function getCourierPerformanceSummary(db: Database, storeId: number) {
  const metrics = await getCourierPerformance(db, { storeId });

  if (metrics.length === 0) {
    return {
      overallSuccessRate: 0, totalShipments: 0, bestCourier: null, worstCourier: null,
      avgDeliveryTimeHours: 0, totalDeliveryCost: 0,
    };
  }

  const totalShipments = metrics.reduce((sum, m) => sum + m.totalShipments, 0);
  const totalSuccessful = metrics.reduce((sum, m) => sum + m.successfulDeliveries, 0);
  const overallSuccessRate = totalShipments > 0 ? (totalSuccessful / totalShipments) * 100 : 0;

  const qualifiedCouriers = metrics.filter((m) => m.totalShipments >= 5);
  const bestCourier = qualifiedCouriers.length > 0
    ? qualifiedCouriers.reduce((best, c) => c.successRate > best.successRate ? c : best).courier
    : null;
  const worstCourier = qualifiedCouriers.length > 0
    ? qualifiedCouriers.reduce((worst, c) => c.successRate < worst.successRate ? c : worst).courier
    : null;

  const totalDeliveryTime = metrics.reduce((sum, m) => sum + m.avgDeliveryTimeHours * m.totalShipments, 0);
  const avgDeliveryTimeHours = totalShipments > 0 ? totalDeliveryTime / totalShipments : 0;
  const totalDeliveryCost = metrics.reduce((sum, m) => sum + m.avgDeliveryCost * m.totalShipments, 0);

  return {
    overallSuccessRate: Math.round(overallSuccessRate * 100) / 100,
    totalShipments,
    bestCourier,
    worstCourier,
    avgDeliveryTimeHours: Math.round(avgDeliveryTimeHours * 100) / 100,
    totalDeliveryCost: Math.round(totalDeliveryCost * 100) / 100,
  };
}

/**
 * Log courier performance from shipment data
 */
export async function logCourierPerformance(db: Database, data: {
  storeId: number;
  courier: string;
  shipmentId: number;
  orderId: number;
  status: string;
  deliveryTimeHours?: number;
  attemptCount?: number;
  failureReason?: string;
  deliveryCost?: number;
  isSuccessful: boolean;
  pickedUpAt?: Date;
  deliveredAt?: Date;
}): Promise<void> {
  await db.insert(courierPerformanceLogs).values({
    storeId: data.storeId,
    courier: data.courier,
    shipmentId: data.shipmentId,
    orderId: data.orderId,
    status: data.status,
    deliveryTimeHours: data.deliveryTimeHours,
    attemptCount: data.attemptCount,
    failureReason: data.failureReason,
    deliveryCost: data.deliveryCost,
    isSuccessful: data.isSuccessful ? 1 : 0,
    pickedUpAt: data.pickedUpAt,
    deliveredAt: data.deliveredAt,
  });
}

/**
 * Update courier performance when shipment is delivered
 */
export async function updateShipmentDelivery(
  db: Database,
  shipmentId: number,
  deliveryData: {
    deliveredAt: Date;
    pickedUpAt: Date;
    attemptCount: number;
    deliveryCost?: number;
    failureReason?: string;
  },
  expectedStoreId?: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const shipmentResults = await db
      .select({
        shipmentId: shipments.id,
        orderId: shipments.orderId,
        courier: shipments.courier,
        status: shipments.status,
        storeId: orders.storeId,
      })
      .from(shipments)
      .innerJoin(orders, eq(orders.id, shipments.orderId))
      .where(eq(shipments.id, shipmentId))
      .limit(1);
    const shipment = shipmentResults[0];

    if (!shipment) {
      return { success: false, error: 'Shipment not found' };
    }

    if (typeof expectedStoreId === 'number' && shipment.storeId !== expectedStoreId) {
      return { success: false, error: 'Shipment does not belong to current store' };
    }

    const deliveryTimeHours = Math.round(
      (deliveryData.deliveredAt.getTime() - deliveryData.pickedUpAt.getTime()) / (1000 * 60 * 60)
    );

    // Update shipment record
    await db
      .update(shipments)
      .set({
        deliveredAt: deliveryData.deliveredAt,
        deliveryTimeHours,
        attemptCount: deliveryData.attemptCount,
        deliveryCost: deliveryData.deliveryCost,
        failureReason: deliveryData.failureReason,
        isSuccessful: deliveryData.failureReason ? 0 : 1,
        updatedAt: new Date(),
      })
      .where(eq(shipments.id, shipmentId));

    // Create performance log
    await db.insert(courierPerformanceLogs).values({
      storeId: shipment.storeId,
      courier: shipment.courier || 'unknown',
      shipmentId,
      orderId: shipment.orderId,
      status: shipment.status,
      deliveryTimeHours,
      attemptCount: deliveryData.attemptCount,
      deliveryCost: deliveryData.deliveryCost,
      failureReason: deliveryData.failureReason,
      isSuccessful: deliveryData.failureReason ? 0 : 1,
      pickedUpAt: deliveryData.pickedUpAt,
      deliveredAt: deliveryData.deliveredAt,
    });

    return { success: true };
  } catch (error) {
    console.error('Error in updateShipmentDelivery:', error);
    return { success: false, error: 'Database operation failed' };
  }
}

/**
 * Get courier performance trends over time
 */
export async function getCourierPerformanceTrends(db: Database, storeId: number, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const logs = await db.select().from(courierPerformanceLogs)
    .where(and(
      eq(courierPerformanceLogs.storeId, storeId),
      gte(courierPerformanceLogs.createdAt, startDate)
    ));

  const trendsMap = new Map<string, { courier: string; shipments: number; successful: number; totalDeliveryTime: number }[]>();

  for (const log of logs) {
    const date = log.createdAt?.toISOString().split('T')[0] || 'unknown';
    const existing = trendsMap.get(date) || [];

    let courierEntry = existing.find((e) => e.courier === log.courier);
    if (!courierEntry) {
      courierEntry = { courier: log.courier, shipments: 0, successful: 0, totalDeliveryTime: 0 };
      existing.push(courierEntry);
    }

    courierEntry.shipments++;
    if (log.isSuccessful === 1) courierEntry.successful++;
    if (log.deliveryTimeHours !== null) courierEntry.totalDeliveryTime += log.deliveryTimeHours;

    trendsMap.set(date, existing);
  }

  const trends: Array<{ date: string; courier: string; shipments: number; successRate: number; avgDeliveryTime: number }> = [];

  for (const [date, entries] of trendsMap.entries()) {
    for (const entry of entries) {
      trends.push({
        date,
        courier: entry.courier,
        shipments: entry.shipments,
        successRate: entry.shipments > 0 ? Math.round((entry.successful / entry.shipments) * 100 * 100) / 100 : 0,
        avgDeliveryTime: entry.shipments > 0 ? Math.round((entry.totalDeliveryTime / entry.shipments) * 100) / 100 : 0,
      });
    }
  }

  return trends.sort((a, b) => a.date.localeCompare(b.date));
}
