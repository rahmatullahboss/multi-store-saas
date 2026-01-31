/**
 * Logger Usage Examples for Cloudflare Pages
 *
 * This file demonstrates how to use the Axiom logger in your API routes.
 * The logger sends logs to both Axiom (primary) and D1 (backup).
 *
 * Setup Required:
 * 1. Sign up at https://app.axiom.co (free tier: 500GB/month)
 * 2. Create a dataset named "cloudflare-logs"
 * 3. Get API token from Settings > API Tokens
 * 4. Add to Cloudflare Dashboard > Settings > Variables:
 *    - AXION_TOKEN = your-api-token (set as secret)
 * 5. View logs at: https://app.axiom.co
 */

import { json, type ActionFunctionArgs, type LoaderFunctionArgs } from '@remix-run/cloudflare';
import { Logger, createLoggerFromContext } from '~/services/logger.server';

// ============================================================================
// EXAMPLE 1: Basic Usage in Action
// ============================================================================

export async function action({ request, context }: ActionFunctionArgs) {
  // Create logger from Cloudflare context
  const logger = createLoggerFromContext(context);

  // Get request info for logging
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // Log the start of the operation
    await logger.info('Order creation started', {
      path: url.pathname,
      method: request.method,
      userAgent,
      storeId: 123,
    });

    // Your business logic here...
    const orderId = 'order-456';

    // Log successful completion
    await logger.info('Order created successfully', {
      orderId,
      storeId: 123,
      amount: 1500,
    });

    return json({ success: true, orderId });
  } catch (error) {
    // Log errors with full context
    await logger.error(
      'Order creation failed',
      {
        path: url.pathname,
        storeId: 123,
        userId: 456,
      },
      error as Error
    );

    return json({ success: false, error: 'Failed to create order' }, { status: 500 });
  }
}

// ============================================================================
// EXAMPLE 2: Loader with Logging
// ============================================================================

export async function loader({ request, context }: LoaderFunctionArgs) {
  const logger = createLoggerFromContext(context);
  const url = new URL(request.url);

  await logger.info('API data fetch started', {
    path: url.pathname,
    searchParams: url.searchParams.toString(),
  });

  try {
    // Fetch data...
    const data = { products: [] };

    await logger.info('Data fetched successfully', {
      path: url.pathname,
      recordCount: data.products.length,
    });

    return json({ data });
  } catch (error) {
    await logger.error(
      'Data fetch failed',
      {
        path: url.pathname,
      },
      error as Error
    );

    throw error;
  }
}

// ============================================================================
// EXAMPLE 3: Different Log Levels
// ============================================================================

async function exampleLogLevels(logger: Logger) {
  // Debug level (only goes to Axiom, mapped to 'info' in D1)
  await logger.debug('Debugging product query', {
    sql: 'SELECT * FROM products',
    duration: 45,
  });

  // Info level
  await logger.info('User logged in', {
    userId: 123,
    method: 'email',
  });

  // Warning level
  await logger.warn('Low inventory alert', {
    productId: 456,
    stock: 5,
    threshold: 10,
  });

  // Error level
  await logger.error(
    'Payment failed',
    {
      orderId: 789,
      paymentMethod: 'bkash',
      amount: 1500,
    },
    new Error('Insufficient balance')
  );

  // Fatal level (critical errors)
  await logger.fatal(
    'Database connection lost',
    {
      retryCount: 3,
    },
    new Error('Connection timeout')
  );
}

// ============================================================================
// EXAMPLE 4: Logging with PII Filtering
// ============================================================================

async function examplePIIFiltering(logger: Logger) {
  // The logger automatically redacts sensitive fields
  await logger.info('User updated profile', {
    userId: 123,
    email: 'user@example.com',
    password: 'secret123', // This will be redacted to [REDACTED]
    token: 'abc-xyz-123', // This will be redacted
    credit_card: '4111111111111111', // This will be redacted
    name: 'John Doe', // This is fine
  });

  // Log output will have:
  // password: "[REDACTED]"
  // token: "[REDACTED]"
  // credit_card: "[REDACTED]"
}

// ============================================================================
// EXAMPLE 5: Manual Logger Creation (Advanced)
// ============================================================================

async function exampleManualLogger(env: {
  AXION_TOKEN?: string;
  AXION_DATASET?: string;
  DB?: D1Database;
}) {
  // Create logger with custom service name
  const logger = new Logger(env, 'my-custom-service');

  // Use it
  await logger.info('Custom service started', {
    feature: 'payment-gateway',
  });
}

// ============================================================================
// EXAMPLE 6: Production Error Tracking with Sentry
// ============================================================================

async function exampleWithSentry(logger: Logger) {
  try {
    // Some operation that might fail
    throw new Error('Something went wrong');
  } catch (error) {
    // Log to Axiom + D1
    await logger.error(
      'Operation failed',
      {
        operation: 'checkout',
        userId: 123,
      },
      error as Error
    );

    // Sentry will also capture this in production
    // (configured in entry.server.tsx and entry.client.tsx)

    throw error;
  }
}

// ============================================================================
// DASHBOARD ACCESS
// ============================================================================

/**
 * How to view your logs:
 *
 * 1. Axiom Dashboard (Primary - Beautiful UI):
 *    URL: https://app.axiom.co/{your-organization}/cloudflare-logs
 *
 *    Features:
 *    - Real-time log streaming
 *    - Search: `level:error` or `message:"Order created"`
 *    - Filter by time range
 *    - Create charts and alerts
 *    - 30 days retention (free tier)
 *
 * 2. D1 Backup (Fallback - Raw Data):
 *    You can query directly from D1 if needed:
 *
 *    ```sql
 *    -- Get recent errors
 *    SELECT * FROM system_logs
 *    WHERE level = 'error'
 *    AND created_at >= datetime('now', '-1 day')
 *    ORDER BY created_at DESC
 *    LIMIT 100;
 *
 *    -- Get logs by store
 *    SELECT * FROM system_logs
 *    WHERE context LIKE '%"storeId":123%'
 *    ORDER BY created_at DESC;
 *    ```
 */

// ============================================================================
// BEST PRACTICES
// ============================================================================

/**
 * 1. Always use structured logging (objects, not string concatenation)
 *    ✅ Good: logger.info('Order created', { orderId: 123 })
 *    ❌ Bad:  logger.info(`Order created: ${orderId}`)
 *
 * 2. Include context that helps debugging
 *    ✅ Good: { orderId, userId, storeId, path }
 *    ❌ Bad:  { message: 'It failed' }
 *
 * 3. Use appropriate log levels
 *    - debug: Development/testing only
 *    - info: Normal operations
 *    - warn: Recoverable issues
 *    - error: Failed operations
 *    - fatal: System-level failures
 *
 * 4. Don't log sensitive data (the logger auto-redacts common fields)
 *
 * 5. Log at the beginning and end of important operations
 *    - Start: "Payment processing started"
 *    - Success: "Payment completed"
 *    - Error: "Payment failed"
 */
