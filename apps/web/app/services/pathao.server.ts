/**
 * Pathao Courier API Service
 * 
 * Documentation: https://merchant.pathao.com/developer/documentation
 * 
 * Features:
 * - Get access token
 * - Get cities and zones
 * - Create order/parcel
 * - Track order
 * - Cancel order
 */

// Types
export interface PathaoCredentials {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  baseUrl?: string; // Default: https://api-hermes.pathao.com
}

interface PathaoTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface PathaoCity {
  city_id: number;
  city_name: string;
}

export interface PathaoZone {
  zone_id: number;
  zone_name: string;
}

export interface PathaoArea {
  area_id: number;
  area_name: string;
  home_delivery_available: boolean;
  pickup_available: boolean;
}

export interface PathaoCreateOrderRequest {
  store_id: number; // Pathao store ID
  merchant_order_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city?: number; // Optional — Pathao auto-resolves from address
  recipient_zone?: number; // Optional — Pathao auto-resolves from address
  recipient_area?: number; // Optional — Pathao auto-resolves from address
  delivery_type: 48 | 12; // 48 = Normal, 12 = On Demand
  item_type: 1 | 2; // 1 = Document, 2 = Parcel
  special_instruction?: string;
  item_quantity: number;
  item_weight: number; // in kg, 0.5 to 10
  amount_to_collect: number; // COD amount, 0 if non-COD
  item_description?: string;
}

export interface PathaoOrder {
  consignment_id: string;
  order_status: string;
  delivery_fee: number;
}

export interface PathaoOrderStatus {
  consignment_id: string;
  order_status: string;
  order_status_slug: string;
  updated_at: string;
}

// Status mapping
export const PATHAO_STATUS_MAP: Record<string, string> = {
  'Pending': 'pending',
  'Pickup Requested': 'processing',
  'Picked': 'shipped',
  'In Transit': 'shipped',
  'Delivered': 'delivered',
  'Returned': 'returned',
  'Cancelled': 'cancelled',
};

/**
 * Create Pathao API client
 */
/**
 * Create Pathao API client
 */
export function createPathaoClient(credentials: PathaoCredentials) {
  // Default to Hermes/Aladdin endpoint if not specified
  // Users can override this with https://api.pathao.com/v1 for standard API
  // or a sandbox URL like https://hermes-api.p-stageenv.xyz/aladdin/api/v1
  // We also strip common suffixes like /orders if the user pasted a specific endpoint
  const baseUrl = (credentials.baseUrl || 'https://api-hermes.pathao.com/aladdin/api/v1')
    .replace(/\/+$/, '') // Strip trailing slashes
    .replace(/\/orders$/, ''); // Strip /orders if user copied full endpoint
  
  let accessToken: string | null = null;
  let tokenExpiry: number = 0;

  /**
   * Get access token (with caching)
   */
  async function getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (accessToken && Date.now() < tokenExpiry) {
      return accessToken;
    }

    const response = await fetch(`${baseUrl}/issue-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: credentials.clientId,
        client_secret: credentials.clientSecret,
        username: credentials.username,
        password: credentials.password,
        grant_type: 'password',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      // Try to parse error as JSON if possible
      try {
        const jsonError = JSON.parse(error);
        throw new Error(`Pathao auth failed: ${jsonError.message || JSON.stringify(jsonError)}`);
      } catch {
        throw new Error(`Pathao auth failed: ${error}`);
      }
    }

    const data: PathaoTokenResponse = await response.json();
    accessToken = data.access_token;
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // 1 min buffer

    return accessToken;
  }

  /**
   * Make authenticated API request
   */
  async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = await getAccessToken();

    // Ensure endpoint starts with /
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const response = await fetch(`${baseUrl}${normalizedEndpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      try {
          const jsonError = JSON.parse(error);
          throw new Error(`Pathao API error: ${jsonError.message || JSON.stringify(jsonError)}`);
      } catch {
          throw new Error(`Pathao API error: ${error}`);
      }
    }

    return response.json();
  }

  return {
    /**
     * Test connection / validate credentials
     */
    async testConnection(): Promise<boolean> {
      try {
        await getAccessToken();
        return true;
      } catch (error) {
        console.error('Pathao connection test failed:', error);
        return false;
      }
    },

    /**
     * Get list of cities
     */
    async getCities(): Promise<PathaoCity[]> {
      const result = await apiRequest<{ data: { data: PathaoCity[] } }>('/city-list');
      return result.data.data;
    },

    /**
     * Get zones for a city
     */
    async getZones(cityId: number): Promise<PathaoZone[]> {
      const result = await apiRequest<{ data: { data: PathaoZone[] } }>(`/cities/${cityId}/zone-list`);
      return result.data.data;
    },

    /**
     * Get areas for a zone
     */
    async getAreas(zoneId: number): Promise<PathaoArea[]> {
      const result = await apiRequest<{ data: { data: PathaoArea[] } }>(`/zones/${zoneId}/area-list`);
      return result.data.data;
    },

    /**
     * Get Pathao stores (merchant's pickup locations)
     */
    async getStores(): Promise<{ store_id: number; store_name: string; store_address: string }[]> {
      const result = await apiRequest<{ data: { data: { store_id: number; store_name: string; store_address: string }[] } }>('/stores');
      return result.data.data;
    },

    /**
     * Create a new order/parcel
     */
    async createOrder(order: PathaoCreateOrderRequest): Promise<PathaoOrder> {
      const result = await apiRequest<{ data: PathaoOrder }>('/orders', {
        method: 'POST',
        body: JSON.stringify(order),
      });
      return result.data;
    },

    /**
     * Get order status
     */
    async getOrderStatus(consignmentId: string): Promise<PathaoOrderStatus> {
      const result = await apiRequest<{ data: PathaoOrderStatus }>(`/orders/${consignmentId}/info`);
      return result.data;
    },

    /**
     * Cancel order (only if not picked up)
     */
    async cancelOrder(consignmentId: string): Promise<boolean> {
      try {
        await apiRequest(`/orders/${consignmentId}/cancel`, {
          method: 'POST',
        });
        return true;
      } catch {
        return false;
      }
    },

    /**
     * Calculate delivery fee
     */
    async calculatePrice(
      storeId: number,
      recipientCity: number,
      recipientZone: number,
      itemWeight: number
    ): Promise<{ price: number; discount: number; final_price: number }> {
      const result = await apiRequest<{ data: { price: number; discount: number; final_price: number } }>(
        '/merchant/price-plan',
        {
          method: 'POST',
          body: JSON.stringify({
            store_id: storeId,
            recipient_city: recipientCity,
            recipient_zone: recipientZone,
            item_weight: itemWeight,
            item_type: 2, // Parcel
            delivery_type: 48, // Normal
          }),
        }
      );
      return result.data;
    },
  };
}

// Export type
export type PathaoClient = ReturnType<typeof createPathaoClient>;
