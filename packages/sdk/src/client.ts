/**
 * @ozzyl/sdk — OzzylClient
 *
 * The main entry point for all API interactions.
 * Instantiate once with your API key, then use the resource namespaces.
 *
 * @example
 * ```ts
 * import { Ozzyl } from '@ozzyl/sdk';
 *
 * const ozzyl = new Ozzyl('sk_live_your_api_key_here');
 *
 * const { data: products } = await ozzyl.products.list();
 * const order = await ozzyl.orders.get('1001');
 * const store = await ozzyl.store.get();
 * ```
 */

import {
  OzzylAuthError,
  OzzylError,
  OzzylNotFoundError,
  OzzylRateLimitError,
  OzzylValidationError,
} from './errors.js';
import type { OzzylClientOptions } from './types.js';
import { ProductsResource } from './resources/products.js';
import { OrdersResource } from './resources/orders.js';
import { AnalyticsResource } from './resources/analytics.js';
import { WebhooksResource } from './resources/webhooks.js';
import { StoreResource } from './resources/store.js';
import { EventsResource } from './resources/events.js';
import { version as SDK_VERSION } from '../package.json';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_BASE_URL = 'https://api.ozzyl.com/v1';
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_TIMEOUT_MS = 30_000;

/** Minimum backoff delay in ms before the first retry. */
const RETRY_BASE_DELAY_MS = 500;

/** HTTP status codes that are safe to retry automatically. */
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

/** Docs base URL for error messages. */
const DOCS_BASE_URL = 'https://ozzyl.com/docs/api';

// ─── HttpClient interface (used by resource classes) ──────────────────────────

/**
 * Internal HTTP transport interface injected into every resource class.
 * Exported so resource classes can import it without a circular dependency.
 */
export interface HttpClient {
  get<T>(path: string): Promise<T>;
  post<T, B>(path: string, body: B, options?: { idempotencyKey?: string }): Promise<T>;
  patch<T, B>(path: string, body: B): Promise<T>;
  put<T, B>(path: string, body: B): Promise<T>;
  delete(path: string): Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Exponential backoff delay: `base * 2^attempt` + small jitter (up to 100ms).
 * Capped at 10 seconds.
 */
function backoffMs(attempt: number): number {
  const exponential = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
  const jitter = Math.random() * 100;
  return Math.min(exponential + jitter, 10_000);
}

/** Resolve the docs URL for a given error code or path. */
function docsUrl(slug: string): string {
  return `${DOCS_BASE_URL}/errors#${slug}`;
}

/** Sleep for `ms` milliseconds (edge-compatible via Promise + setTimeout). */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── OzzylClient ─────────────────────────────────────────────────────────────

/**
 * The Ozzyl Commerce Platform API client.
 *
 * Create one instance per application and reuse it — it is safe to share
 * across requests in serverless / edge environments.
 *
 * **API key modes**
 * - Keys prefixed `sk_live_` target production data.
 * - Keys prefixed `sk_test_` target test/sandbox data (if supported by your plan).
 *
 * @example
 * ```ts
 * import { Ozzyl } from '@ozzyl/sdk';
 *
 * // Minimal — uses all defaults
 * const ozzyl = new Ozzyl('sk_live_your_api_key_here');
 *
 * // Custom options
 * const ozzyl = new Ozzyl('sk_live_your_api_key_here', {
 *   baseUrl: 'https://api.ozzyl.com/v1', // default
 *   maxRetries: 3,                        // default
 *   timeout: 30_000,                      // default (30s)
 * });
 * ```
 */
export class Ozzyl implements HttpClient {
  // ── Public resource namespaces ──────────────────────────────────────────────

  /** Access product data in your store. */
  readonly products: ProductsResource;

  /** Access order data in your store. */
  readonly orders: OrdersResource;

  /** Access analytics data for your store. */
  readonly analytics: AnalyticsResource;

  /** Manage webhook endpoints. */
  readonly webhooks: WebhooksResource;

  /** Access store information. */
  readonly store: StoreResource;

  /** Access webhook delivery event logs. */
  readonly events: EventsResource;

  // ── Private fields ──────────────────────────────────────────────────────────

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly maxRetries: number;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  /** `true` when the API key starts with `sk_test_`. */
  readonly isTestMode: boolean;

  // ── Constructor ─────────────────────────────────────────────────────────────

  /**
   * Create a new Ozzyl API client.
   *
   * @param apiKey - Your Ozzyl API key. Must start with `sk_live_` or `sk_test_`.
   * @param options - Optional configuration overrides.
   * @throws {Error} if `apiKey` is empty or obviously malformed.
   */
  constructor(apiKey: string, options: OzzylClientOptions = {}) {
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      throw new Error(
        '[OzzylSDK] An API key is required. Pass it as the first argument: new Ozzyl("sk_live_...")'
      );
    }

    if (!apiKey.startsWith('sk_live_') && !apiKey.startsWith('sk_test_')) {
      throw new Error(
        `[OzzylSDK] Invalid API key format. Keys must start with "sk_live_" or "sk_test_". ` +
          `Got: "${apiKey.slice(0, 12)}...". ` +
          `Get your key at https://app.ozzyl.com/settings/developer`
      );
    }

    this.apiKey = apiKey;
    this.isTestMode = apiKey.startsWith('sk_test_');
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, '');
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.timeoutMs = options.timeout ?? DEFAULT_TIMEOUT_MS;

    // S4 — Guard against missing fetch at construction time, not at call time
    const fetchImpl = options.fetch ?? globalThis.fetch;
    if (!fetchImpl) {
      throw new Error(
        '[OzzylSDK] No fetch implementation found. Pass options.fetch or upgrade to Node.js 18+.'
      );
    }
    this.fetchImpl = fetchImpl.bind(globalThis);

    // Initialise resource namespaces — pass `this` as the HttpClient
    this.products = new ProductsResource(this);
    this.orders = new OrdersResource(this);
    this.analytics = new AnalyticsResource(this);
    this.webhooks = new WebhooksResource(this);
    this.store = new StoreResource(this);
    this.events = new EventsResource(this);
  }

  // ── HttpClient implementation ───────────────────────────────────────────────

  /**
   * @internal
   * Perform a GET request. Used by resource classes.
   */
  async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  /**
   * @internal
   * Perform a POST request with a JSON body. Used by resource classes.
   */
  async post<T, B>(path: string, body: B, options?: { idempotencyKey?: string }): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  /**
   * @internal
   * Perform a PATCH request with a JSON body. Used by resource classes.
   */
  async patch<T, B>(path: string, body: B): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  /**
   * @internal
   * Perform a PUT request with a JSON body. Used by resource classes.
   */
  async put<T, B>(path: string, body: B): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  /**
   * @internal
   * Perform a DELETE request. Used by resource classes.
   */
  async delete(path: string): Promise<void> {
    await this.request<void>('DELETE', path);
  }

  // ── Core request logic ─────────────────────────────────────────────────────

  /**
   * Execute an HTTP request with automatic retry / backoff.
   * Throws a typed `OzzylError` subclass on failure.
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
    options?: { idempotencyKey?: string }
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: 'application/json',
      'User-Agent': `ozzyl-sdk/${SDK_VERSION}`,
      'X-Ozzyl-Mode': this.isTestMode ? 'test' : 'live',
    };

    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    // S7 — Idempotency key support for POST requests
    if (options?.idempotencyKey) {
      headers['Idempotency-Key'] = options.idempotencyKey;
    }

    let lastError: OzzylError | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      // Back off before retries (not before the first attempt)
      if (attempt > 0) {
        // For 429 responses with a Retry-After header, respect that value.
        // S5 — Cap sleep duration against the configured timeout.
        const retryAfterMs = Math.min(
          lastError instanceof OzzylRateLimitError
            ? lastError.retryAfter * 1_000
            : backoffMs(attempt - 1),
          this.timeoutMs
        );

        await sleep(retryAfterMs);
      }

      let response: Response;

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

        try {
          const requestInit: RequestInit = {
            method,
            headers,
            signal: controller.signal,
          };
          if (body !== undefined) {
            requestInit.body = JSON.stringify(body);
          }
          response = await this.fetchImpl(url, requestInit);
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (fetchError) {
        // Network error or timeout — treat as transient, retry
        const isAbort =
          fetchError instanceof Error && fetchError.name === 'AbortError';
        const networkError = new OzzylError(
          isAbort
            ? `Request timed out after ${this.timeoutMs}ms (${method} ${path})`
            : `Network error: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`,
          0,
          isAbort ? 'request_timeout' : 'network_error',
          '',
          docsUrl('network_error')
        );

        if (attempt < this.maxRetries) {
          lastError = networkError;
          continue;
        }
        throw networkError;
      }

      // ── Parse response ─────────────────────────────────────────────────────

      const requestId = response.headers.get('X-Request-Id') ?? '';

      // 204 No Content (e.g. successful DELETE)
      if (response.status === 204) {
        return undefined as T;
      }

      // Parse body — always JSON from the Ozzyl API
      let json: unknown;
      try {
        json = await response.json();
      } catch {
        // Unparseable body — treat as server error
        const parseError = new OzzylError(
          `Received non-JSON response from API (status ${response.status})`,
          response.status,
          'invalid_response',
          requestId,
          docsUrl('invalid_response')
        );
        if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < this.maxRetries) {
          lastError = parseError;
          continue;
        }
        throw parseError;
      }

      // ── Success ────────────────────────────────────────────────────────────

      if (response.ok) {
        return json as T;
      }

      // ── Error — build typed error ──────────────────────────────────────────

      const errorBody = json as {
        error?: string;
        code?: string;
        fields?: Record<string, string[]>;
        success?: false;
      };

      const errorMessage = errorBody.error ?? `HTTP ${response.status}`;
      const errorCode = errorBody.code ?? 'api_error';

      let typedError: OzzylError;

      if (response.status === 401 || response.status === 403) {
        typedError = new OzzylAuthError(
          errorMessage,
          response.status as 401 | 403,
          errorCode,
          requestId,
          docsUrl('authentication')
        );
      } else if (response.status === 429) {
        const retryAfterHeader = response.headers.get('Retry-After');
        const retryAfter = retryAfterHeader ? parseInt(retryAfterHeader, 10) : 60;
        const limitHeader = response.headers.get('X-RateLimit-Limit');
        const usedHeader = response.headers.get('X-RateLimit-Used');
        const limit = limitHeader ? parseInt(limitHeader, 10) : 0;
        const used = usedHeader ? parseInt(usedHeader, 10) : 0;

        typedError = new OzzylRateLimitError(
          errorMessage,
          requestId,
          docsUrl('rate_limits'),
          retryAfter,
          limit,
          used
        );
      } else if (response.status === 404) {
        typedError = new OzzylNotFoundError(errorMessage, requestId, docsUrl('not_found'));
      } else if (response.status === 400) {
        // S2 — Always throw OzzylValidationError for 400, even without fields
        typedError = new OzzylValidationError(
          errorMessage,
          requestId,
          docsUrl('validation'),
          (errorBody as { fields?: Record<string, string[]> }).fields ?? {}
        );
      } else {
        typedError = new OzzylError(
          errorMessage,
          response.status,
          errorCode,
          requestId,
          docsUrl('errors')
        );
      }

      // Retry on retryable status codes (except auth/404/400 — those are deterministic)
      if (RETRYABLE_STATUS_CODES.has(response.status) && attempt < this.maxRetries) {
        lastError = typedError;
        continue;
      }

      throw typedError;
    }

    // All retries exhausted
    throw lastError!;
  }

  // ── Static utilities ───────────────────────────────────────────────────────

  /**
   * Verify an incoming webhook payload signature from Ozzyl.
   *
   * This is a static method — it does not require an API key and can be called
   * without constructing an `Ozzyl` instance. It works in Cloudflare Workers,
   * Node.js 18+, Deno, and modern browsers (uses the Web Crypto API).
   *
   * **Signature format** (from the `Ozzyl-Signature` header):
   * ```
   * t=1706745600,v1=abc123def456...
   * ```
   * Where `t` is a Unix timestamp and `v1` is the HMAC-SHA256 hex digest of
   * `${t}.${rawBody}` using your webhook secret.
   *
   * **Replay attack prevention**: Signatures older than 5 minutes are rejected.
   *
   * @param rawBody   - The raw request body as a string (do NOT parse as JSON first).
   * @param signature - The full `Ozzyl-Signature` header value.
   * @param secret    - The webhook secret you provided when creating the webhook.
   * @returns `true` if the signature is valid and within the 5-minute window.
   *
   * @example
   * ```ts
   * // Cloudflare Worker / Hono handler
   * app.post('/webhooks/ozzyl', async (c) => {
   *   const rawBody = await c.req.text();
   *   const signature = c.req.header('Ozzyl-Signature') ?? '';
   *   const secret = 'my_webhook_secret';
   *
   *   const isValid = await Ozzyl.verifyWebhookSignature(rawBody, signature, secret);
   *   if (!isValid) {
   *     return c.json({ error: 'Invalid signature' }, 401);
   *   }
   *
   *   const event = JSON.parse(rawBody);
   *   console.log('Received event:', event.type);
   *   return c.json({ ok: true });
   * });
   *
   * // Express.js (Node.js 18+)
   * app.post('/webhooks/ozzyl', express.raw({ type: 'application/json' }), async (req, res) => {
   *   const rawBody = req.body.toString('utf-8');
   *   const signature = req.headers['ozzyl-signature'] ?? '';
   *
   *   const isValid = await Ozzyl.verifyWebhookSignature(rawBody, signature, process.env.WEBHOOK_SECRET!);
   *   if (!isValid) return res.status(401).json({ error: 'Invalid signature' });
   *
   *   const event = JSON.parse(rawBody);
   *   // handle event...
   *   res.json({ ok: true });
   * });
   * ```
   */
  static async verifyWebhookSignature(
    rawBody: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    if (!rawBody || !signature || !secret) return false;

    // Parse header: "t=1706745600,v1=abc123..."
    const parts = signature.split(',');
    let timestamp: string | undefined;
    let v1Signature: string | undefined;

    for (const part of parts) {
      const eqIdx = part.indexOf('=');
      if (eqIdx === -1) continue;
      const key = part.slice(0, eqIdx).trim();
      const value = part.slice(eqIdx + 1).trim();
      if (key === 't') timestamp = value;
      if (key === 'v1') v1Signature = value;
    }

    if (!timestamp || !v1Signature) return false;

    // Replay attack prevention: reject signatures older than 5 minutes
    const signedAt = parseInt(timestamp, 10);
    if (isNaN(signedAt)) return false;

    const nowSeconds = Math.floor(Date.now() / 1_000);
    const fiveMinutes = 5 * 60;
    if (Math.abs(nowSeconds - signedAt) > fiveMinutes) return false;

    // Compute expected HMAC-SHA256: sign `${timestamp}.${rawBody}` with secret
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // C3 — Validate hex format BEFORE comparison to avoid leaking info via exceptions
    if (!/^[0-9a-f]{64}$/.test(v1Signature)) return false;

    const messageToSign = `${timestamp}.${rawBody}`;
    const signatureBuffer = await crypto.subtle.sign(
      'HMAC',
      keyMaterial,
      encoder.encode(messageToSign)
    );

    // C1 — Compare raw bytes (Uint8Array), not hex strings, to avoid length-leaking
    const expected = new Uint8Array(signatureBuffer);
    const provided = Ozzyl._hexToBytes(v1Signature);

    return Ozzyl._timingSafeEqual(expected, provided);
  }

  /**
   * Convert a lowercase hex string to a Uint8Array of bytes.
   * @internal
   */
  private static _hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return bytes;
  }

  /**
   * Constant-time byte comparison.
   * Prevents timing-based side-channel attacks when comparing HMAC signatures.
   * Operates on Uint8Array buffers to avoid any hex-encoding length leakage.
   * @internal
   */
  private static _timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= (a[i] ?? 0) ^ (b[i] ?? 0);
    }
    return diff === 0;
  }
}
