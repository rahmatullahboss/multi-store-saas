/**
 * Order Processor Service
 * 
 * Helper functions to interact with OrderProcessor Worker (with Durable Objects)
 * Provides instant order processing without Queues
 * 
 * Architecture:
 * - Main App (Pages) -> Service Binding -> Order Processor Worker -> Durable Object
 */

interface OrderTask {
  type: 'email' | 'webhook' | 'inventory' | 'notification';
  payload: Record<string, unknown>;
}

interface ProcessResult {
  success: boolean;
  results?: Array<{ type: string; success: boolean; error?: string }>;
  taskIds?: string[];
  error?: string;
}

/**
 * Get base URL for Order Processor service
 */
function getOrderProcessorUrl(storeId: number, path: string): string {
  return `/do/${storeId}${path}`;
}

/**
 * Process order tasks immediately (synchronous)
 * Use this when you need results right away
 */
export async function processOrderTasksSync(
  env: Env,
  orderId: number,
  storeId: number,
  tasks: OrderTask[]
): Promise<ProcessResult> {
  if (!env.ORDER_PROCESSOR_SERVICE) {
    // Fallback: process directly without DO
    console.log('Falling back to direct processing (no ORDER_PROCESSOR_SERVICE)');
    return await processTasksDirectly(env, orderId, storeId, tasks);
  }

  try {
    const response = await env.ORDER_PROCESSOR_SERVICE.fetch(
      `https://order-processor${getOrderProcessorUrl(storeId, '/process')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, storeId, tasks }),
      }
    );

    return await response.json() as ProcessResult;
  } catch (error) {
    console.error('OrderProcessor error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Enqueue order tasks for background processing (async)
 * Use this when you don't need immediate results
 * Tasks will be processed by Durable Object alarm
 */
export async function enqueueOrderTasks(
  env: Env,
  orderId: number,
  storeId: number,
  tasks: OrderTask[]
): Promise<ProcessResult> {
  if (!env.ORDER_PROCESSOR_SERVICE) {
    // Fallback: process directly without DO
    console.log('Falling back to direct processing (no ORDER_PROCESSOR_SERVICE)');
    return await processTasksDirectly(env, orderId, storeId, tasks);
  }

  try {
    const response = await env.ORDER_PROCESSOR_SERVICE.fetch(
      `https://order-processor${getOrderProcessorUrl(storeId, '/enqueue')}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, storeId, tasks }),
      }
    );

    return await response.json() as ProcessResult;
  } catch (error) {
    console.error('OrderProcessor enqueue error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get processor status (pending/failed task counts)
 */
export async function getProcessorStatus(
  env: Env,
  storeId: number
): Promise<{ pending: number; failed: number } | null> {
  if (!env.ORDER_PROCESSOR_SERVICE) return null;

  try {
    const response = await env.ORDER_PROCESSOR_SERVICE.fetch(
      `https://order-processor${getOrderProcessorUrl(storeId, '/status')}`
    );
    return await response.json() as { pending: number; failed: number };
  } catch (error) {
    console.error('OrderProcessor status error:', error);
    return null;
  }
}

/**
 * Retry all failed tasks
 */
export async function retryFailedTasks(
  env: Env,
  storeId: number
): Promise<ProcessResult> {
  if (!env.ORDER_PROCESSOR_SERVICE) {
    return { success: false, error: 'ORDER_PROCESSOR_SERVICE not available' };
  }

  try {
    const response = await env.ORDER_PROCESSOR_SERVICE.fetch(
      `https://order-processor${getOrderProcessorUrl(storeId, '/retry')}`,
      { method: 'POST' }
    );
    return await response.json() as ProcessResult;
  } catch (error) {
    console.error('OrderProcessor retry error:', error);
    return { success: false, error: String(error) };
  }
}

/**
 * Fallback: Process tasks directly without Durable Object
 * Used when DO binding is not available (local dev, etc.)
 */
async function processTasksDirectly(
  env: Env,
  orderId: number,
  storeId: number,
  tasks: OrderTask[]
): Promise<ProcessResult> {
  const results: Array<{ type: string; success: boolean; error?: string }> = [];

  for (const task of tasks) {
    try {
      switch (task.type) {
        case 'email':
          await sendEmailDirect(env, task.payload);
          break;
        case 'webhook':
          await sendWebhookDirect(task.payload);
          break;
        case 'inventory':
          // Log for now
          console.log(`[Inventory] Order ${orderId}: ${JSON.stringify(task.payload)}`);
          break;
        case 'notification':
          console.log(`[Notification] Order ${orderId}: ${JSON.stringify(task.payload)}`);
          break;
      }
      results.push({ type: task.type, success: true });
    } catch (error) {
      results.push({ 
        type: task.type, 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  return { success: true, results };
}

async function sendEmailDirect(env: Env, payload: Record<string, unknown>): Promise<void> {
  const { to, subject, html } = payload as { to: string; subject: string; html: string };
  
  if (!env.RESEND_API_KEY) {
    console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: 'noreply@ozzyl.com', to, subject, html }),
  });

  if (!response.ok) {
    throw new Error(`Email failed: ${response.status}`);
  }
}

async function sendWebhookDirect(payload: Record<string, unknown>): Promise<void> {
  const { url, payload: webhookPayload } = payload as { 
    url: string; 
    payload: Record<string, unknown>;
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webhookPayload),
  });

  if (!response.ok) {
    throw new Error(`Webhook failed: ${response.status}`);
  }
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Send order confirmation email via Durable Object
 */
export async function sendOrderConfirmationEmail(
  env: Env,
  orderId: number,
  storeId: number,
  customerEmail: string,
  orderDetails: {
    orderNumber: string;
    total: number;
    currency: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }
): Promise<void> {
  const html = `
    <h1>অর্ডার নিশ্চিত হয়েছে!</h1>
    <p>অর্ডার নম্বর: <strong>${orderDetails.orderNumber}</strong></p>
    <p>মোট: ${orderDetails.currency} ${orderDetails.total}</p>
    <h3>আইটেম:</h3>
    <ul>
      ${orderDetails.items.map(item => 
        `<li>${item.name} x ${item.quantity} - ${orderDetails.currency} ${item.price}</li>`
      ).join('')}
    </ul>
    <p>ধন্যবাদ!</p>
  `;

  await enqueueOrderTasks(env, orderId, storeId, [{
    type: 'email',
    payload: {
      to: customerEmail,
      subject: `অর্ডার নিশ্চিত - ${orderDetails.orderNumber}`,
      html,
    },
  }]);
}

/**
 * Send merchant notification for new order
 */
export async function notifyMerchantNewOrder(
  env: Env,
  orderId: number,
  storeId: number,
  merchantEmail: string,
  orderSummary: string
): Promise<void> {
  await enqueueOrderTasks(env, orderId, storeId, [{
    type: 'email',
    payload: {
      to: merchantEmail,
      subject: `নতুন অর্ডার! #${orderId}`,
      html: `<h1>নতুন অর্ডার এসেছে!</h1><p>${orderSummary}</p>`,
    },
  }]);
}

/**
 * Trigger order webhooks
 */
export async function triggerOrderWebhooks(
  env: Env,
  orderId: number,
  storeId: number,
  webhooks: Array<{ url: string; secret?: string }>,
  orderData: Record<string, unknown>
): Promise<void> {
  const tasks: OrderTask[] = webhooks.map(webhook => ({
    type: 'webhook',
    payload: {
      url: webhook.url,
      payload: { event: 'order.created', orderId, storeId, data: orderData },
      secret: webhook.secret,
    },
  }));

  await enqueueOrderTasks(env, orderId, storeId, tasks);
}
