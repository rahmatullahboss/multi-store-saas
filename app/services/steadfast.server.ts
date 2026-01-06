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
 */

// Types
export interface SteadfastCredentials {
  apiKey: string;
  secretKey: string;
  baseUrl?: string; // Default: https://portal.packzy.com/api/v1
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

// Status mapping to our order status
export const STEADFAST_STATUS_MAP: Record<string, string> = {
  'pending': 'processing',
  'in_review': 'processing',
  'delivered': 'delivered',
  'cancelled': 'cancelled',
  'partial_delivered': 'delivered',
  'hold': 'processing',
  'unknown': 'processing',
};

/**
 * Create Steadfast API client
 */
export function createSteadfastClient(credentials: SteadfastCredentials) {
  const baseUrl = credentials.baseUrl || 'https://portal.packzy.com/api/v1';

  /**
   * Make API request with auth headers
   */
  async function apiRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Api-Key': credentials.apiKey,
        'Secret-Key': credentials.secretKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Steadfast API error: ${error}`);
    }

    const data: T & { status?: number; message?: string } = await response.json();
    
    // Steadfast wraps responses in a status/message structure
    if (data.status && data.status !== 200) {
      throw new Error(data.message || 'Steadfast API error');
    }

    return data;
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
     * Create a new order
     */
    async createOrder(order: SteadfastCreateOrderRequest): Promise<SteadfastOrder> {
      const result = await apiRequest<{
        status: number;
        consignment: SteadfastOrder;
      }>('/create_order', {
        method: 'POST',
        body: JSON.stringify(order),
      });
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
  };
}

// Export type
export type SteadfastClient = ReturnType<typeof createSteadfastClient>;
