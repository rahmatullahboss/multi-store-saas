/**
 * @ozzyl/sdk — WebhooksResource
 *
 * Provides methods to create, list and delete webhook endpoints via the
 * Ozzyl API.
 */

import type { HttpClient } from '../client.js';
import type { CreateWebhookParams, ListResponse, Webhook } from '../types.js';

/** Validate that an ID is a positive integer, throw if not. */
function validateId(id: string | number, resource: string): void {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new Error(
      `[OzzylSDK] ${resource} ID must be a positive integer, got: ${String(id)}`
    );
  }
}

/** Query parameters for `ozzyl.webhooks.list()`. */
export interface ListWebhooksParams {
  /** Number of webhooks per page (default: 50). */
  limit?: number;
  /** Page number to fetch (1-indexed). @default 1 */
  page?: number;
}

/**
 * Resource for managing webhook endpoints on your Ozzyl store.
 *
 * Webhooks let you receive real-time notifications when events occur in your
 * store (orders placed, products updated, etc.). Each delivery is signed with
 * HMAC-SHA256 — use `Ozzyl.verifyWebhookSignature()` to verify payloads.
 *
 * @example
 * ```ts
 * const ozzyl = new Ozzyl('sk_live_...');
 *
 * // Create a webhook
 * const webhook = await ozzyl.webhooks.create({
 *   url: 'https://mysite.com/hooks/ozzyl',
 *   events: ['order/created', 'order/updated'],
 *   secret: 'my_webhook_secret',
 * });
 *
 * // List all webhooks
 * const { data } = await ozzyl.webhooks.list();
 *
 * // Delete a webhook
 * await ozzyl.webhooks.delete('789');
 * ```
 */
export class WebhooksResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all registered webhook endpoints for your store.
   *
   * Required scope: `manage_webhooks`
   *
   * @returns A paginated list of webhook records.
   *
   * @example
   * ```ts
   * const { data: webhooks } = await ozzyl.webhooks.list();
   * for (const wh of webhooks) {
   *   console.log(`${wh.id} — ${wh.url} (active: ${wh.isActive})`);
   * }
   * ```
   */
  async list(params: ListWebhooksParams = {}): Promise<ListResponse<Webhook>> {
    const searchParams = new URLSearchParams();
    if (params.limit !== undefined) {
      searchParams.set('limit', String(params.limit));
    }
    if (params.page !== undefined) {
      searchParams.set('page', String(params.page));
    }
    const query = searchParams.toString();
    const path = query ? `/webhooks?${query}` : '/webhooks';

    const envelope = await this.http.get<{
      success: true;
      data: Webhook[];
    }>(path);

    // C6 — Use requested limit (not result count) for the limit field; infer hasMore
    const requestedLimit = params.limit ?? 50;
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
   * Register a new webhook endpoint.
   *
   * Required scope: `manage_webhooks`
   *
   * @param params - The webhook configuration.
   * @returns The newly created webhook record.
   *
   * @example
   * ```ts
   * const webhook = await ozzyl.webhooks.create({
   *   url: 'https://mysite.com/hooks/ozzyl',
   *   events: ['order/created', 'order/updated', 'order/cancelled'],
   *   secret: 'super_secret_string', // Use this to verify deliveries
   * });
   *
   * console.log(`Webhook ID: ${webhook.id}`);
   * ```
   */
  async create(params: CreateWebhookParams): Promise<Webhook> {
    const envelope = await this.http.post<
      { success: true; data: Webhook },
      CreateWebhookParams
    >('/webhooks', params);
    return envelope.data;
  }

  /**
   * Delete a webhook endpoint by its ID.
   *
   * Once deleted, Ozzyl will stop sending deliveries to that URL immediately.
   *
   * Required scope: `manage_webhooks`
   *
   * @param id - The numeric webhook ID (as a string or number).
   * @returns `void` on success.
   * @throws {OzzylNotFoundError} if no webhook with that ID exists in your store.
   *
   * @example
   * ```ts
   * await ozzyl.webhooks.delete('789');
   * console.log('Webhook removed');
   * ```
   */
  async delete(id: string | number): Promise<void> {
    // M11 — Validate ID is a positive integer
    validateId(id, 'Webhook');
    await this.http.delete(`/webhooks/${Number(id)}`);
  }
}
