/**
 * Steadfast Courier API Service
 * 
 * Documentation: https://portal.packzy.com/api/v1
 * 
 * Features:
 * - Create order
 * - Bulk order creation
 * - Check delivery status
 * - Check account balance
 * - Fraud/Risk check using internal order history
 */

import type { DrizzleD1Database } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';

// Types
export interface SteadfastCredentials {
  apiKey: string;
  secretKey: string;
  baseUrl?: string; // Default: https://portal.packzy.com/api/v1
  sessionCookie?: string; // Required for fraud check
  xsrfToken?: string; // Required for fraud check
}

export interface SteadfastCreateOrderRequest {
  invoice: string; // Your order number
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number; // Cash on delivery amount (0 if prepaid)
  note?: string;
}

export interface SteadfastOrder {
  consignment_id: string;
  invoice: string;
  tracking_code: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  cod_amount: number;
  status: string;
  delivery_status: string;
}

export interface SteadfastStatusResponse {
  consignment_id: string;
  invoice: string;
  tracking_code: string;
  delivery_status: string;
  status: string;
}

export interface SteadfastBalanceResponse {
  current_balance: number;
  pending_balance: number;
}

// Risk check result
export interface CustomerRiskResult {
  isHighRisk: boolean;
  successRate: number;
  totalOrders: number;
  returnedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  riskScore: number; // 0-100 (higher = more risky)
}

// Status mapping to our order status
export const STEADFAST_STATUS_MAP: Record<string, string> = {
  'pending': 'processing',
  'in_review': 'processing',
  'delivered': 'delivered',
  'cancelled': 'cancelled',
  'partial_delivered': 'delivered',
  'hold': 'processing',
  'unknown': 'processing',
  'picked': 'shipped',
  'in_transit': 'shipped',
  'out_for_delivery': 'shipped',
  'returned': 'returned',
  // Pickup cancelled variants
  'pickup_cancelled': 'cancelled',
  'pickup_cancel_request': 'cancelled',
  'pickup_cancellation_requested': 'cancelled',
};

// Normalized status for tracking timeline
export const STEADFAST_TIMELINE_STEPS = [
  { key: 'pending', label: 'Order Placed', labelBn: 'অর্ডার প্লেসড' },
  { key: 'picked', label: 'Picked Up', labelBn: 'পিক আপ' },
  { key: 'in_transit', label: 'In Transit', labelBn: 'ট্রানজিটে' },
  { key: 'out_for_delivery', label: 'Out for Delivery', labelBn: 'ডেলিভারিতে' },
  { key: 'delivered', label: 'Delivered', labelBn: 'ডেলিভার্ড' },
];

/**
 * Check customer risk based on their order history
 * Uses internal order data to calculate return rate
 */
export async function checkCustomerRisk(
  phone: string,
  db: DrizzleD1Database<any>,
  storeId?: number
): Promise<CustomerRiskResult> {
  // Import orders schema dynamically to avoid circular imports
  const { orders } = await import('@db/schema');
  
  // Normalize phone number (remove spaces, dashes)
  const normalizedPhone = phone.replace(/[\s-]/g, '');
  
  // Build query conditions
  const conditions = storeId 
    ? and(
        eq(orders.customerPhone, normalizedPhone),
        eq(orders.storeId, storeId)
      )
    : eq(orders.customerPhone, normalizedPhone);
  
  // Fetch all orders for this phone number
  const customerOrders = await db
    .select({
      status: orders.status,
      courierStatus: orders.courierStatus,
    })
    .from(orders)
    .where(conditions);
  
  const totalOrders = customerOrders.length;
  
  if (totalOrders === 0) {
    // New customer - no history
    return {
      isHighRisk: false,
      successRate: 100,
      totalOrders: 0,
      returnedOrders: 0,
      deliveredOrders: 0,
      cancelledOrders: 0,
      riskScore: 0,
    };
  }
  
  // Count outcomes
  // IMPORTANT: Only actual delivery returns (courierStatus = 'returned') count as risky
  // Call cancels (status = 'cancelled' before shipping) are NOT risky
  let deliveredOrders = 0;
  let returnedOrders = 0;  // Actual delivery returns (shipped but came back)
  let cancelledOrders = 0; // Call cancels (cancelled before shipping) - NOT risky
  
  for (const order of customerOrders) {
    const status = order.status?.toLowerCase() || '';
    const courierStatus = order.courierStatus?.toLowerCase() || '';
    
    if (status === 'delivered' || courierStatus === 'delivered') {
      deliveredOrders++;
    } else if (courierStatus === 'returned') {
      // Actual delivery return - this is risky behavior
      returnedOrders++;
    } else if (status === 'cancelled') {
      // Call cancel (before shipping) - NOT risky, customer just changed mind on call
      cancelledOrders++;
    }
  }
  
  // Calculate success rate based on SHIPPED orders only (delivered + returned)
  // Call cancels don't count because they never shipped
  const shippedOrders = deliveredOrders + returnedOrders;
  const successRate = shippedOrders > 0 
    ? Math.round((deliveredOrders / shippedOrders) * 100) 
    : (totalOrders > 0 ? 100 : 100); // If no shipped orders, assume 100% (new customer or all cancelled)
  
  // Calculate return rate based on shipped orders
  const returnRate = shippedOrders > 0 
    ? (returnedOrders / shippedOrders) * 100 
    : 0;
  
  // Risk score: return rate with a minimum of 3 shipped orders for confidence
  const confidenceFactor = Math.min(shippedOrders / 3, 1);
  const riskScore = Math.round(returnRate * confidenceFactor);
  
  // High risk if return rate > 30% (only for shipped orders)
  const isHighRisk = shippedOrders >= 2 && returnRate > 30;
  
  return {
    isHighRisk,
    successRate,
    totalOrders,
    returnedOrders,
    deliveredOrders,
    cancelledOrders,
    riskScore,
  };
}

/**
 * Create Steadfast API client with retry logic and error handling
 */
export function createSteadfastClient(credentials: SteadfastCredentials) {
  const baseUrl = credentials.baseUrl || 'https://portal.packzy.com/api/v1';
  const DEFAULT_TIMEOUT = 10000; // 10 seconds
  const MAX_RETRIES = 3;

  /**
   * Make API request with auth headers, timeout, and retry logic
   */
  async function apiRequest<T>(
    endpoint: string, 
    options: RequestInit = {},
    retries = MAX_RETRIES
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

    try {
      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Api-Key': credentials.apiKey,
          'Secret-Key': credentials.secretKey,
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = '';
        try {
          const errorBody = await response.json() as Record<string, unknown>;
          // Steadfast returns field-level validation errors like: { errors: { recipient_phone: ["..."] } }
          if (errorBody.errors && typeof errorBody.errors === 'object') {
            const fieldErrors = Object.entries(errorBody.errors as Record<string, string[]>)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
              .join('; ');
            errorDetail = fieldErrors || errorBody.message as string || '';
          } else {
            errorDetail = (errorBody.message as string) || JSON.stringify(errorBody);
          }
        } catch {
          errorDetail = await response.text().catch(() => '');
        }
        throw new Error(`Steadfast API error (${response.status}): ${errorDetail}`);
      }

      const data: T & { status?: number; message?: string } = await response.json();
      
      // Steadfast wraps responses in a status/message structure
      if (data.status && data.status !== 200) {
        throw new Error(data.message || 'Steadfast API error');
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle abort/timeout
      if (error instanceof Error && error.name === 'AbortError') {
        if (retries > 0) {
          // Exponential backoff: wait 1s, 2s, 4s
          const delay = Math.pow(2, MAX_RETRIES - retries) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          return apiRequest<T>(endpoint, options, retries - 1);
        }
        throw new Error('Steadfast API timeout - please try again');
      }
      
      // Retry on network errors
      if (retries > 0 && error instanceof TypeError) {
        const delay = Math.pow(2, MAX_RETRIES - retries) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        return apiRequest<T>(endpoint, options, retries - 1);
      }
      
      throw error;
    }
  }

  return {
    /**
     * Test connection / validate credentials
     */
    async testConnection(): Promise<boolean> {
      try {
        await this.getBalance();
        return true;
      } catch {
        return false;
      }
    },

    /**
     * Get account balance
     */
    async getBalance(): Promise<SteadfastBalanceResponse> {
      const result = await apiRequest<{ 
        status: number; 
        current_balance: number;
        pending_balance: number;
      }>('/get_balance');
      return {
        current_balance: result.current_balance,
        pending_balance: result.pending_balance,
      };
    },

    /**
     * Create a new order (enhanced with better error messages)
     */
    async createOrder(order: SteadfastCreateOrderRequest): Promise<SteadfastOrder> {
      // Validate required fields
      if (!order.recipient_phone) {
        throw new Error('Recipient phone number is required');
      }
      if (!order.recipient_address) {
        throw new Error('Recipient address is required');
      }
      if (!order.invoice) {
        throw new Error('Invoice/Order number is required');
      }

      const result = await apiRequest<{
        status: number;
        consignment: SteadfastOrder;
      }>('/create_order', {
        method: 'POST',
        body: JSON.stringify(order),
      });
      
      if (!result.consignment) {
        throw new Error('Failed to create shipment - no consignment returned');
      }
      
      return result.consignment;
    },

    /**
     * Create bulk orders
     */
    async createBulkOrders(orders: SteadfastCreateOrderRequest[]): Promise<SteadfastOrder[]> {
      const result = await apiRequest<{
        status: number;
        consignments: SteadfastOrder[];
      }>('/create_order/bulk-order', {
        method: 'POST',
        body: JSON.stringify({ data: orders }),
      });
      return result.consignments || [];
    },

    /**
     * Check order status by consignment ID
     */
    async checkStatus(consignmentId: string): Promise<SteadfastStatusResponse> {
      const result = await apiRequest<{
        status: number;
        delivery_status: string;
        consignment_id: string;
        invoice: string;
        tracking_code: string;
      }>(`/status_by_cid/${consignmentId}`);
      return {
        consignment_id: result.consignment_id,
        invoice: result.invoice,
        tracking_code: result.tracking_code,
        delivery_status: result.delivery_status,
        status: result.delivery_status,
      };
    },

    /**
     * Check order status by invoice (your order number)
     */
    async checkStatusByInvoice(invoice: string): Promise<SteadfastStatusResponse> {
      const result = await apiRequest<{
        status: number;
        delivery_status: string;
        consignment_id: string;
        invoice: string;
        tracking_code: string;
      }>(`/status_by_invoice/${invoice}`);
      return {
        consignment_id: result.consignment_id,
        invoice: result.invoice,
        tracking_code: result.tracking_code,
        delivery_status: result.delivery_status,
        status: result.delivery_status,
      };
    },

    /**
     * Check order status by tracking code
     */
    async checkStatusByTrackingCode(trackingCode: string): Promise<SteadfastStatusResponse> {
      const result = await apiRequest<{
        status: number;
        delivery_status: string;
        consignment_id: string;
        invoice: string;
        tracking_code: string;
      }>(`/status_by_trackingcode/${trackingCode}`);
      return {
        consignment_id: result.consignment_id,
        invoice: result.invoice,
        tracking_code: result.tracking_code,
        delivery_status: result.delivery_status,
        status: result.delivery_status,
      };
    },

    /**
     * Get normalized status for our system
     */
    normalizeStatus(steadfastStatus: string): string {
      return STEADFAST_STATUS_MAP[steadfastStatus.toLowerCase()] || 'processing';
    },

    /**
     * Get timeline step index for a status
     */
    getTimelineStepIndex(status: string): number {
      const normalizedStatus = status.toLowerCase();
      const index = STEADFAST_TIMELINE_STEPS.findIndex(step => 
        step.key === normalizedStatus || 
        normalizedStatus.includes(step.key)
      );
      return index >= 0 ? index : 0;
    },

    /**
     * Check external fraud risk using internal Steadfast API (Requires Session Cookie)
     */
    async checkExternalFraud(phone: string): Promise<{ success: number; cancellation: number }> {
      if (!credentials.sessionCookie || !credentials.xsrfToken) {
        throw new Error('Steadfast session credentials (sessionCookie, xsrfToken) required for fraud check. Please configure them in Courier Settings.');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s

      try {
        const response = await fetch(`https://steadfast.com.bd/user/frauds/check/${encodeURIComponent(phone)}`, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': credentials.xsrfToken,
            'Cookie': `steadfast_courier_session=${credentials.sessionCookie}; XSRF-TOKEN=${credentials.xsrfToken}`
          }
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Fraud check failed: ${response.statusText} (${response.status})`);
        }

        const data = await response.json() as { success?: number | string; cancellation?: number | string };
        return {
          success: Number(data.success || 0),
          cancellation: Number(data.cancellation || 0)
        };
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    },
  };
}

// Export type
export type SteadfastClient = ReturnType<typeof createSteadfastClient>;
