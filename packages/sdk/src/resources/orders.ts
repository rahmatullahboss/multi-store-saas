/**
 * @ozzyl/sdk — OrdersResource
 *
 * Provides methods to interact with the /orders endpoints of the Ozzyl API.
 */

import type { HttpClient } from '../client.js';
import type {
  ListOrdersParams,
  ListResponse,
  Order,
  OrderWithItems,
} from '../types.js';

/** Validate that an ID is a positive integer, throw if not. */
function validateId(id: string | number, resource: string): void {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error(
      `[OzzylSDK] ${resource} ID must be a positive integer, got: ${String(id)}`
    );
  }
}

/**
 * Resource for accessing orders in your Ozzyl store.
 *
 * @example
 * ```ts
 * const ozzyl = new Ozzyl('sk_live_...');
 *
 * // List all pending orders
 * const { data } = await ozzyl.orders.list({ status: 'pending' });
 *
 * // Get a single order with its items
 * const order = await ozzyl.orders.get('456');
 * console.log(order.items);
 * ```
 */
export class OrdersResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List orders in your store with optional status filtering.
   *
   * Required scope: `read_orders`
   *
   * @param params - Optional query parameters.
   * @returns A list of orders (without items). Use `get()` to fetch items.
   *
   * @example
   * ```ts
   * // All orders (up to 20)
   * const { data } = await ozzyl.orders.list();
   *
   * // Filter by status
   * const { data } = await ozzyl.orders.list({ status: 'shipped' });
   *
   * // Return up to 50 orders
   * const { data } = await ozzyl.orders.list({ limit: 50 });
   * ```
   */
  async list(params: ListOrdersParams = {}): Promise<ListResponse<Order>> {
    const searchParams = new URLSearchParams();

    if (params.limit !== undefined) {
      searchParams.set('limit', String(params.limit));
    }
    if (params.status !== undefined) {
      searchParams.set('status', params.status);
    }
    if (params.page !== undefined) {
      searchParams.set('page', String(params.page));
    }
    if (params.cursor !== undefined) {
      searchParams.set('cursor', params.cursor);
    }

    const query = searchParams.toString();
    const path = query ? `/orders?${query}` : '/orders';

    const envelope = await this.http.get<{
      success: true;
      count: number;
      data: Order[];
    }>(path);

    // C5 — Infer hasMore from data length vs requested limit
    const requestedLimit = params.limit ?? 20;
    const hasMore = envelope.data.length === requestedLimit;
    const currentPage = params.page ?? 1;

    return {
      data: envelope.data,
      pagination: {
        page: currentPage,
        limit: requestedLimit,
        hasMore,
        nextCursor: hasMore ? String(currentPage + 1) : undefined,
      },
    };
  }

  /**
   * Retrieve a single order by its numeric ID, including all line items.
   *
   * Required scope: `read_orders`
   *
   * @param id - The numeric order ID (as a string or number).
   * @returns The order with its `items` array populated.
   * @throws {OzzylNotFoundError} if no order with that ID exists in your store.
   *
   * @example
   * ```ts
   * const order = await ozzyl.orders.get('1001');
   * console.log(`Order ${order.orderNumber} — ${order.items.length} items`);
   * for (const item of order.items) {
   *   console.log(`  ${item.title} × ${item.quantity} = ${item.total}`);
   * }
   * ```
   */
  async get(id: string | number): Promise<OrderWithItems> {
    // M11 — Validate ID is a positive integer
    validateId(id, 'Order');
    const envelope = await this.http.get<{
      success: true;
      data: OrderWithItems;
    }>(`/orders/${Number(id)}`);
    return envelope.data;
  }
}
