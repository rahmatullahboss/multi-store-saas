/**
 * RedX Courier API Service
 * 
 * Documentation: https://redx.com.bd/developer
 * 
 * Features:
 * - Get delivery areas
 * - Manage pickup stores
 * - Create parcel
 * - Track parcel
 */

// Types
export interface RedXCredentials {
  apiKey: string;
  secretKey: string;
  baseUrl?: string; // Default: https://openapi.redx.com.bd/v1.0.0-beta
}

export interface RedXArea {
  id: number;
  name: string;
  district_id: number;
  district_name: string;
  post_code: string;
}

export interface RedXStore {
  id: number;
  name: string;
  phone: string;
  area_id: number;
  address: string;
}

export interface RedXCreateParcelRequest {
  customer_name: string;
  customer_phone: string;
  delivery_area: string; // Area name
  delivery_area_id: number;
  customer_address: string;
  merchant_invoice_id: string; // Your order number
  cash_collection_amount: number; // COD amount (0 if prepaid)
  parcel_weight: number; // in grams
  instruction?: string;
  value?: number; // Declared value
  parcel_details_json?: Array<{
    name: string;
    category: string;
    value: number;
  }>;
}

export interface RedXParcel {
  tracking_id: string;
  cash_collection_amount: number;
  delivery_fee: number;
  cod_fee: number;
  status: string;
}

export interface RedXTrackingInfo {
  tracking_id: string;
  current_status: string;
  created_at: string;
  updated_at: string;
  events: Array<{
    status: string;
    timestamp: string;
    location?: string;
  }>;
}

// Status mapping to our order status
export const REDX_STATUS_MAP: Record<string, string> = {
  'Pending Pickup': 'processing',
  'Picked Up': 'shipped',
  'In Transit': 'shipped',
  'Out for Delivery': 'shipped',
  'Delivered': 'delivered',
  'Returned': 'returned',
  'Cancelled': 'cancelled',
};

/**
 * Create RedX API client
 */
export function createRedXClient(credentials: RedXCredentials) {
  const baseUrl = credentials.baseUrl || 'https://openapi.redx.com.bd/v1.0.0-beta';

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
        'API-ACCESS-TOKEN': `Bearer ${credentials.apiKey}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`RedX API error: ${error}`);
    }

    return response.json();
  }

  return {
    /**
     * Test connection / validate credentials
     */
    async testConnection(): Promise<boolean> {
      try {
        await this.getAreas();
        return true;
      } catch {
        return false;
      }
    },

    /**
     * Get list of delivery areas
     */
    async getAreas(): Promise<RedXArea[]> {
      const result = await apiRequest<{ areas: RedXArea[] }>('/areas');
      return result.areas || [];
    },

    /**
     * Get pickup stores
     */
    async getStores(): Promise<RedXStore[]> {
      const result = await apiRequest<{ stores: RedXStore[] }>('/pickup/stores');
      return result.stores || [];
    },

    /**
     * Create a new store (pickup location)
     */
    async createStore(store: {
      name: string;
      phone: string;
      area_id: number;
      address: string;
    }): Promise<RedXStore> {
      const result = await apiRequest<{ store: RedXStore }>('/pickup/stores', {
        method: 'POST',
        body: JSON.stringify(store),
      });
      return result.store;
    },

    /**
     * Create a new parcel
     */
    async createParcel(parcel: RedXCreateParcelRequest): Promise<RedXParcel> {
      const result = await apiRequest<RedXParcel>('/parcel', {
        method: 'POST',
        body: JSON.stringify(parcel),
      });
      return result;
    },

    /**
     * Get parcel tracking info
     */
    async trackParcel(trackingId: string): Promise<RedXTrackingInfo> {
      const result = await apiRequest<RedXTrackingInfo>(`/parcel/track/${trackingId}`);
      return result;
    },

    /**
     * Get parcel details
     */
    async getParcel(trackingId: string): Promise<RedXParcel> {
      const result = await apiRequest<RedXParcel>(`/parcel/info/${trackingId}`);
      return result;
    },

    /**
     * Cancel parcel (only if not picked up)
     */
    async cancelParcel(trackingId: string): Promise<boolean> {
      try {
        await apiRequest(`/parcel/cancel/${trackingId}`, {
          method: 'PATCH',
        });
        return true;
      } catch {
        return false;
      }
    },
  };
}

// Export type
export type RedXClient = ReturnType<typeof createRedXClient>;
