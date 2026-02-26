/**
 * @ozzyl/sdk — EventsResource
 *
 * Provides access to webhook delivery logs via the Ozzyl API.
 */

import type { HttpClient } from '../client.js';

/**
 * A single webhook delivery log entry.
 * Records whether a webhook delivery attempt succeeded or failed.
 */
export interface WebhookDeliveryLog {
  /** Unique numeric ID of the delivery log entry. */
  id: number;
  /** The webhook endpoint this delivery was sent to. */
  webhookId: number;
  /** The event topic that triggered this delivery, e.g. `"order/created"`. */
  topic: string;
  /** Whether the delivery was considered successful (2xx response). */
  success: boolean;
  /** HTTP status code returned by the endpoint, or `null` if no response. */
  statusCode: number | null;
  /** Response body returned by the endpoint (truncated to 1KB), or `null`. */
  responseBody: string | null;
  /** Delivery duration in milliseconds, or `null` if unavailable. */
  duration: number | null;
  /** ISO 8601 timestamp when the delivery attempt was made. */
  createdAt: string;
}

/**
 * Resource for accessing webhook delivery logs on your Ozzyl store.
 *
 * @example
 * ```ts
 * const ozzyl = new Ozzyl('sk_live_...');
 *
 * // List all delivery logs
 * const logs = await ozzyl.events.list();
 *
 * // Filter by webhook ID
 * const logs = await ozzyl.events.list({ webhookId: 42 });
 * ```
 */
export class EventsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List webhook delivery logs for this store.
   *
   * Required scope: `manage_webhooks`
   *
   * @param params - Optional query parameters.
   * @returns An array of delivery log entries, newest first.
   *
   * @example
   * ```ts
   * // All recent delivery logs
   * const logs = await ozzyl.events.list({ limit: 20 });
   *
   * // Logs for a specific webhook
   * const logs = await ozzyl.events.list({ webhookId: 42, limit: 50 });
   *
   * // Page 2
   * const logs = await ozzyl.events.list({ page: 2, limit: 20 });
   * ```
   */
  async list(params?: {
    /** Filter by webhook endpoint ID. */
    webhookId?: number;
    /** Number of results to return (default: 20). */
    limit?: number;
    /** Page number to fetch (1-indexed, default: 1). */
    page?: number;
  }): Promise<WebhookDeliveryLog[]> {
    const searchParams = new URLSearchParams();

    if (params?.webhookId !== undefined) {
      searchParams.set('webhook_id', String(params.webhookId));
    }
    if (params?.limit !== undefined) {
      searchParams.set('limit', String(params.limit));
    }
    if (params?.page !== undefined) {
      searchParams.set('page', String(params.page));
    }

    const query = searchParams.toString();
    const path = `/events${query ? `?${query}` : ''}`;

    const envelope = await this.http.get<{
      success: true;
      data: WebhookDeliveryLog[];
    }>(path);

    return envelope.data;
  }
}
