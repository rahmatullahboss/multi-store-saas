/**
 * Courier Performance Analytics
 * 
 * Route: /app/analytics/courier
 * 
 * Features:
 * - Courier success rate comparison
 * - Delivery time analytics
 * - Failure reasons breakdown
 * - Cost per delivery analysis
 * - Performance trends over time
 */

import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { useLoaderData } from '@remix-run/react';
import { eq } from 'drizzle-orm';
import { stores } from '@db/schema';
import { requireTenant } from '~/lib/tenant-guard.server';
import { createDb } from '~/lib/db.server';
import { getCourierPerformanceSummary, getCourierPerformance, type CourierMetrics } from '~/services/courier-analytics.server';
import { GlassCard } from '~/components/ui/GlassCard';
import {
  Truck,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Package,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { useState, useMemo } from 'react';

export const meta: MetaFunction = () => {
  return [{ title: 'Courier Analytics - Ozzyl' }];
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const { storeId } = await requireTenant(request, context, {
    requirePermission: 'analytics',
  });

  const db = createDb(context.cloudflare.env.DB);

  // Get store currency
  const storeData = await db
    .select({ currency: stores.currency })
    .from(stores)
    .where(eq(stores.id, storeId))
    .limit(1);

  const currency = storeData[0]?.currency || 'BDT';

  try {
    // Get courier performance summary
    const summary = await getCourierPerformanceSummary(db, storeId);

    // Get detailed metrics
    const metrics = await getCourierPerformance(db, { storeId });

    return json({
      success: true,
      data: {
        summary,
        metrics,
        currency,
      },
    });
  } catch (error) {
    console.error('Error loading courier analytics:', error);
    return json({
      success: false,
      error: 'Failed to load courier analytics',
      data: {
        summary: {
          overallSuccessRate: 0,
          totalShipments: 0,
          bestCourier: null,
          worstCourier: null,
          avgDeliveryTimeHours: 0,
          totalDeliveryCost: 0,
        },
        metrics: [],
        currency,
      },
    });
  }
}

export default function CourierAnalytics() {
  const loaderData = useLoaderData<typeof loader>();
  const { summary, metrics, currency } = loaderData.data;
  const [selectedCourier, setSelectedCourier] = useState<string | null>(null);

  const filteredMetrics = useMemo(() => {
    if (!selectedCourier) return metrics;
    return (metrics as CourierMetrics[]).filter((m: CourierMetrics) => m.courier === selectedCourier);
  }, [metrics, selectedCourier]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Courier Performance Analytics</h1>
          <p className="text-gray-500 mt-1">Track delivery success rates, times, and costs</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-500">Last 30 days</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Success Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary.overallSuccessRate}%</p>
              <div className="flex items-center mt-2">
                {summary.overallSuccessRate >= 80 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600">Excellent</span>
                  </>
                ) : summary.overallSuccessRate >= 60 ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-yellow-600">Good</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600">Needs Improvement</span>
                  </>
                )}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-full">
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Shipments</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{summary.totalShipments}</p>
              <div className="flex items-center mt-2">
                <Package className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">All couriers</span>
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-full">
              <Truck className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Delivery Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {summary.avgDeliveryTimeHours > 0 ? `${summary.avgDeliveryTimeHours}h` : 'N/A'}
              </p>
              <div className="flex items-center mt-2">
                <Clock className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">Hours</span>
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-full">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Delivery Cost</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {currency === 'BDT' ? '৳' : '$'}
                {summary.totalDeliveryCost.toLocaleString()}
              </p>
              <div className="flex items-center mt-2">
                <DollarSign className="w-4 h-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-500">All time</span>
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-full">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Best & Worst Couriers */}
      {(summary.bestCourier || summary.worstCourier) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Best Performing Courier</h3>
            </div>
            <p className="text-3xl font-bold text-green-700 capitalize">{summary.bestCourier || 'N/A'}</p>
            <p className="text-sm text-gray-600 mt-2">Based on success rate (min 5 shipments)</p>
          </GlassCard>

          <GlassCard className="p-6 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Worst Performing Courier</h3>
            </div>
            <p className="text-3xl font-bold text-red-700 capitalize">{summary.worstCourier || 'N/A'}</p>
            <p className="text-sm text-gray-600 mt-2">May need review or replacement</p>
          </GlassCard>
        </div>
      )}

      {/* Courier Comparison Table */}
      <GlassCard className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Courier Performance Comparison</h3>
          </div>
          {metrics.length > 1 && (
            <select
              value={selectedCourier || ''}
              onChange={(e) => setSelectedCourier(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Couriers</option>
              {(metrics as CourierMetrics[]).map((m: CourierMetrics) => (
                <option key={m.courier} value={m.courier}>
                  {m.courier}
                </option>
              ))}
            </select>
          )}
        </div>

        {filteredMetrics.length === 0 ? (
          <div className="text-center py-12">
            <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No courier data available yet</p>
            <p className="text-sm text-gray-400 mt-2">Start shipping orders to see performance metrics</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Courier</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Successful</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Failed</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Success Rate</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avg Time</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avg Cost</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cost/Success</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Avg Attempts</th>
                </tr>
              </thead>
              <tbody>
                {(filteredMetrics as CourierMetrics[]).map((metric: CourierMetrics) => (
                  <tr key={metric.courier} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 capitalize">{metric.courier}</td>
                    <td className="py-3 px-4 text-sm text-gray-700">{metric.totalShipments}</td>
                    <td className="py-3 px-4 text-sm text-green-600">{metric.successfulDeliveries}</td>
                    <td className="py-3 px-4 text-sm text-red-600">{metric.failedDeliveries}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              metric.successRate >= 80
                                ? 'bg-green-500'
                                : metric.successRate >= 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${metric.successRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{metric.successRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {metric.avgDeliveryTimeHours > 0 ? `${metric.avgDeliveryTimeHours}h` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {currency === 'BDT' ? '৳' : '$'}
                      {metric.avgDeliveryCost.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">
                      {currency === 'BDT' ? '৳' : '$'}
                      {metric.costPerSuccessfulDelivery.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{metric.avgAttempts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* Failure Reasons */}
      {selectedCourier && (
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              Failure Reasons - {selectedCourier.charAt(0).toUpperCase() + selectedCourier.slice(1)}
            </h3>
          </div>
          {(() => {
            const courier = (metrics as CourierMetrics[]).find((m: CourierMetrics) => m.courier === selectedCourier);
            if (!courier || Object.keys(courier.failureReasons).length === 0) {
              return (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-gray-600">No failures recorded</p>
                </div>
              );
            }
            return (
              <div className="space-y-3">
                {Object.entries(courier.failureReasons)
                  .sort((a, b) => (b[1] as number) - (a[1] as number))
                  .map(([reason, reasonCount]) => (
                    <div key={reason} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-700 capitalize">{reason.replace(/_/g, ' ')}</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{
                              width: `${((reasonCount as number) / courier.failedDeliveries) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{reasonCount as number}</span>
                      </div>
                    </div>
                  ))}
              </div>
            );
          })()}
        </GlassCard>
      )}
    </div>
  );
}
