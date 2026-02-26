/**
 * @ozzyl/sdk — Error Classes
 *
 * Hierarchy:
 *   OzzylError (base)
 *   ├── OzzylAuthError        (401 / 403)
 *   ├── OzzylRateLimitError   (429)
 *   ├── OzzylNotFoundError    (404)
 *   └── OzzylValidationError  (400)
 */

// ─── Base Error ────────────────────────────────────────────────────────────────

/**
 * Base error class for all Ozzyl SDK errors.
 * Every error carries an HTTP status, machine-readable code, request ID and
 * a link to the relevant docs page for easy debugging.
 */
export class OzzylError extends Error {
  /** HTTP status code returned by the API. */
  readonly status: number;

  /** Machine-readable error code, e.g. `invalid_api_key`. */
  readonly code: string;

  /**
   * The `X-Request-Id` header value from the failed response.
   * Share this with Ozzyl support when filing a bug report.
   */
  readonly requestId: string;

  /** Link to the relevant documentation page for this error. */
  readonly docs: string;

  constructor(
    message: string,
    status: number,
    code: string,
    requestId: string,
    docs: string
  ) {
    super(message);
    this.name = 'OzzylError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.docs = docs;

    // Restore prototype chain (needed when extending built-ins in TypeScript)
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** Human-readable summary for logging. */
  override toString(): string {
    return `${this.name} [${this.status}/${this.code}] ${this.message} (requestId=${this.requestId})`;
  }
}

// ─── Auth Error ────────────────────────────────────────────────────────────────

/**
 * Thrown when the API responds with 401 Unauthorized or 403 Forbidden.
 *
 * Common causes:
 * - Missing or invalid API key
 * - API key has been revoked
 * - Key does not have the required scopes for this operation
 * - API key has expired
 *
 * @example
 * ```ts
 * try {
 *   await ozzyl.products.list();
 * } catch (err) {
 *   if (err instanceof OzzylAuthError) {
 *     console.error('Check your API key — it may be revoked or missing scopes.');
 *   }
 * }
 * ```
 */
export class OzzylAuthError extends OzzylError {
  constructor(
    message: string,
    status: 401 | 403,
    code: string,
    requestId: string,
    docs: string
  ) {
    super(message, status, code, requestId, docs);
    this.name = 'OzzylAuthError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Rate Limit Error ──────────────────────────────────────────────────────────

/**
 * Thrown when the API responds with 429 Too Many Requests.
 *
 * The SDK will automatically retry up to 3 times with exponential backoff
 * before throwing this error, so you only see it when all retries are exhausted.
 *
 * @example
 * ```ts
 * try {
 *   await ozzyl.orders.list();
 * } catch (err) {
 *   if (err instanceof OzzylRateLimitError) {
 *     console.log(`Rate limited. Retry after ${err.retryAfter}s`);
 *     console.log(`Used ${err.used} of ${err.limit} requests`);
 *   }
 * }
 * ```
 */
export class OzzylRateLimitError extends OzzylError {
  /** Number of seconds to wait before retrying. */
  readonly retryAfter: number;

  /** Your plan's request limit for the current window. */
  readonly limit: number;

  /** How many requests you have used in the current window. */
  readonly used: number;

  constructor(
    message: string,
    requestId: string,
    docs: string,
    retryAfter: number,
    limit: number,
    used: number
  ) {
    super(message, 429, 'rate_limit_exceeded', requestId, docs);
    this.name = 'OzzylRateLimitError';
    this.retryAfter = retryAfter;
    this.limit = limit;
    this.used = used;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Not Found Error ───────────────────────────────────────────────────────────

/**
 * Thrown when the API responds with 404 Not Found.
 *
 * @example
 * ```ts
 * try {
 *   const product = await ozzyl.products.get('nonexistent-id');
 * } catch (err) {
 *   if (err instanceof OzzylNotFoundError) {
 *     console.log('Product does not exist');
 *   }
 * }
 * ```
 */
export class OzzylNotFoundError extends OzzylError {
  constructor(message: string, requestId: string, docs: string) {
    super(message, 404, 'not_found', requestId, docs);
    this.name = 'OzzylNotFoundError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ─── Validation Error ──────────────────────────────────────────────────────────

/**
 * Thrown when the API responds with 400 Bad Request due to invalid input.
 * The `fields` map contains per-field validation messages.
 *
 * @example
 * ```ts
 * try {
 *   await ozzyl.webhooks.create({ url: 'not-a-url', events: [] });
 * } catch (err) {
 *   if (err instanceof OzzylValidationError) {
 *     console.log(err.fields);
 *     // { url: ['Must be a valid HTTPS URL'], events: ['At least one event required'] }
 *   }
 * }
 * ```
 */
export class OzzylValidationError extends OzzylError {
  /** Field-level validation errors keyed by field name. */
  readonly fields: Record<string, string[]>;

  constructor(
    message: string,
    requestId: string,
    docs: string,
    fields: Record<string, string[]>
  ) {
    super(message, 400, 'validation_error', requestId, docs);
    this.name = 'OzzylValidationError';
    this.fields = fields;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
