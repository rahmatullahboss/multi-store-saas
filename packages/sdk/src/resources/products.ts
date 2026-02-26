/**
 * @ozzyl/sdk — ProductsResource
 *
 * Provides methods to interact with the /products endpoints of the Ozzyl API.
 */

import type { HttpClient } from '../client.js';
import type { ListProductsParams, ListResponse, Product } from '../types.js';

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
 * Resource for managing products in your Ozzyl store.
 *
 * @example
 * ```ts
 * const ozzyl = new Ozzyl('sk_live_...');
 *
 * // List products
 * const { data, pagination } = await ozzyl.products.list({ limit: 10 });
 *
 * // Get a single product
 * const product = await ozzyl.products.get('123');
 * ```
 */
export class ProductsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List products in your store with optional filtering and pagination.
   *
   * Required scope: `read_products`
   *
   * @param params - Optional query parameters for filtering and pagination.
   * @returns A paginated list of products.
   *
   * @example
   * ```ts
   * // All products (page 1, 20 per page by default)
   * const { data, pagination } = await ozzyl.products.list();
   *
   * // Filter published products, 10 per page
   * const { data } = await ozzyl.products.list({ published: true, limit: 10 });
   *
   * // Search by name
   * const { data } = await ozzyl.products.list({ search: 'shirt' });
   *
   * // Paginate to page 3
   * const { data } = await ozzyl.products.list({ page: 3, limit: 20 });
   * ```
   */
  async list(params: ListProductsParams = {}): Promise<ListResponse<Product>> {
    const searchParams = new URLSearchParams();

    if (params.page !== undefined) {
      searchParams.set('page', String(params.page));
    }
    if (params.limit !== undefined) {
      searchParams.set('limit', String(params.limit));
    }
    if (params.search !== undefined) {
      searchParams.set('search', params.search);
    }
    if (params.published !== undefined) {
      searchParams.set('published', params.published ? 'true' : 'false');
    }

    const query = searchParams.toString();
    const path = query ? `/products?${query}` : '/products';

    const envelope = await this.http.get<{
      success: true;
      data: Product[];
      pagination: { page: number; limit: number; hasMore: boolean };
    }>(path);

    const { page, limit, hasMore } = envelope.pagination;
    return {
      data: envelope.data,
      pagination: {
        page,
        limit,
        hasMore,
        /**
         * @note Currently page-based, not cursor-based.
         * Pass this value as `page` for the next page.
         */
        nextCursor: hasMore ? String(page + 1) : undefined,
      },
    };
  }

  /**
   * Retrieve a single product by its numeric ID.
   *
   * Required scope: `read_products`
   *
   * @param id - The numeric product ID (as a string or number).
   * @returns The matching product.
   * @throws {OzzylNotFoundError} if no product with that ID exists in your store.
   *
   * @example
   * ```ts
   * const product = await ozzyl.products.get('42');
   * console.log(product.title, product.price);
   * ```
   */
  async get(id: string | number): Promise<Product> {
    // M11 — Validate ID is a positive integer
    validateId(id, 'Product');
    const envelope = await this.http.get<{ success: true; data: Product }>(
      `/products/${Number(id)}`
    );
    return envelope.data;
  }
}
