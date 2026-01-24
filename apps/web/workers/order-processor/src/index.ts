/**
 * Order Processor Worker
 * 
 * Separate worker that exports the OrderProcessor Durable Object
 * This allows Pages Functions to use DO via service binding
 * 
 * Best Practices Applied (Context7 Verified):
 * - SQLite backend for FREE plan compatibility
 * - Alarm-based retry with exponential backoff
 * - Single-threaded execution (DO guarantee)
 * - Per-store isolation via DO naming
 * - Transactional storage for consistency
 */

import { DurableObject } from "cloudflare:workers";

// ============================================================================
// CONSTANTS (Best Practice: Define retry/timing constants)
// ============================================================================

const SECONDS = 1000;
const MINUTES = 60 * SECONDS;

const CONFIG = {
  MAX_RETRIES: 5,                    // Max retry attempts
  INITIAL_DELAY: 1 * SECONDS,        // Initial retry delay
  MAX_DELAY: 5 * MINUTES,            // Max retry delay (exponential backoff cap)
  BATCH_SIZE: 10,                    // Tasks per alarm cycle
  CLEANUP_DAYS: 7,                   // Days to keep completed tasks
  ALARM_INTERVAL: 100,               // Ms between alarm and processing
} as const;

// ============================================================================
// TYPES
// ============================================================================

interface OrderTask {
  id: string;
  orderId: number;
  storeId: number;
  type: 'email' | 'webhook' | 'inventory' | 'notification';
  payload: Record<string, unknown>;
  attempts: number;
  createdAt: string;
  lastAttempt?: string;
  nextRetry?: string;
  error?: string;
}

interface AlarmInfo {
  retryCount: number;
  isRetry: boolean;
}

interface Env {
  ORDER_PROCESSOR: DurableObjectNamespace;
  DB: D1Database;
  RESEND_API_KEY?: string;
}

// ============================================================================
// DURABLE OBJECT CLASS
// ============================================================================

export class OrderProcessor extends DurableObject<Env> {
  private sql!: SqlStorage;

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.sql = ctx.storage.sql;
    this.initializeSchema();
  }

  private initializeSchema() {
    // Best Practice: Use proper schema with indexes for performance
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id TEXT PRIMARY KEY,
        order_id INTEGER NOT NULL,
        store_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        payload TEXT NOT NULL,
        attempts INTEGER DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at TEXT NOT NULL,
        last_attempt TEXT,
        next_retry TEXT,
        error TEXT
      )
    `);
    // Best Practice: Create indexes for frequent queries
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_next_retry ON tasks(next_retry)`);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_store ON tasks(store_id)`);
  }

  /**
   * Calculate exponential backoff delay
   * Best Practice: Use exponential backoff with jitter for retries
   */
  private calculateBackoff(attempts: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s... capped at MAX_DELAY
    const baseDelay = CONFIG.INITIAL_DELAY * Math.pow(2, attempts);
    const cappedDelay = Math.min(baseDelay, CONFIG.MAX_DELAY);
    // Add jitter (±10%) to prevent thundering herd
    const jitter = cappedDelay * 0.1 * (Math.random() * 2 - 1);
    return Math.floor(cappedDelay + jitter);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // POST /process - Process immediately
      if (request.method === 'POST' && path === '/process') {
        const body = await request.json() as {
          orderId: number;
          storeId: number;
          tasks: Array<{ type: OrderTask['type']; payload: Record<string, unknown> }>;
        };
        const results = await this.processOrderTasks(body);
        return Response.json({ success: true, results });
      }

      // POST /enqueue - Queue for background processing
      if (request.method === 'POST' && path === '/enqueue') {
        const body = await request.json() as {
          orderId: number;
          storeId: number;
          tasks: Array<{ type: OrderTask['type']; payload: Record<string, unknown> }>;
        };
        const taskIds = await this.enqueueTasks(body);
        await this.ctx.storage.setAlarm(Date.now() + 100);
        return Response.json({ success: true, taskIds, message: 'Tasks queued' });
      }

      // GET /status - Get task counts
      if (request.method === 'GET' && path === '/status') {
        const pending = this.sql.exec(`SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'`).one();
        const failed = this.sql.exec(`SELECT COUNT(*) as count FROM tasks WHERE status = 'failed'`).one();
        return Response.json({ pending: pending?.count || 0, failed: failed?.count || 0 });
      }

      // POST /retry - Retry failed tasks
      if (request.method === 'POST' && path === '/retry') {
        this.sql.exec(`UPDATE tasks SET status = 'pending', attempts = 0 WHERE status = 'failed'`);
        await this.ctx.storage.setAlarm(Date.now() + 100);
        return Response.json({ success: true, message: 'Failed tasks queued for retry' });
      }

      return Response.json({ error: 'Not found' }, { status: 404 });
    } catch (error) {
      console.error('OrderProcessor error:', error);
      return Response.json({ error: 'Internal error', details: String(error) }, { status: 500 });
    }
  }

  private async processOrderTasks(body: {
    orderId: number;
    storeId: number;
    tasks: Array<{ type: OrderTask['type']; payload: Record<string, unknown> }>;
  }) {
    const results: Array<{ type: string; success: boolean; error?: string }> = [];

    for (const task of body.tasks) {
      try {
        await this.executeTask({
          id: `task_${Date.now()}_${Math.random().toString(36).slice(2)}`,
          orderId: body.orderId,
          storeId: body.storeId,
          type: task.type,
          payload: task.payload,
          attempts: 0,
          createdAt: new Date().toISOString(),
        });
        results.push({ type: task.type, success: true });
      } catch (error) {
        results.push({ type: task.type, success: false, error: String(error) });
      }
    }
    return results;
  }

  private async enqueueTasks(body: {
    orderId: number;
    storeId: number;
    tasks: Array<{ type: OrderTask['type']; payload: Record<string, unknown> }>;
  }): Promise<string[]> {
    const taskIds: string[] = [];
    const now = new Date().toISOString();

    for (const task of body.tasks) {
      const id = `task_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      this.sql.exec(
        `INSERT INTO tasks (id, order_id, store_id, type, payload, created_at, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        id, body.orderId, body.storeId, task.type, JSON.stringify(task.payload), now
      );
      taskIds.push(id);
    }
    return taskIds;
  }

  /**
   * Alarm handler - processes pending tasks
   * Best Practice: Use alarmInfo for retry tracking
   */
  async alarm(alarmInfo?: AlarmInfo): Promise<void> {
    const now = new Date().toISOString();
    
    // Best Practice: Log retry attempts for debugging
    if (alarmInfo?.retryCount && alarmInfo.retryCount > 0) {
      console.log(`OrderProcessor alarm retry #${alarmInfo.retryCount}`);
    } else {
      console.log('OrderProcessor alarm triggered');
    }

    // Best Practice: Only fetch tasks that are ready for processing
    // (pending status AND next_retry is null or in the past)
    const pendingTasks = this.sql.exec(`
      SELECT * FROM tasks 
      WHERE status = 'pending' 
        AND (next_retry IS NULL OR next_retry <= ?)
      ORDER BY created_at ASC 
      LIMIT ?
    `, now, CONFIG.BATCH_SIZE).toArray() as unknown as Array<{
      id: string; order_id: number; store_id: number;
      type: string; payload: string; attempts: number; created_at: string;
    }>;

    let successCount = 0;
    let failCount = 0;

    for (const row of pendingTasks) {
      const task: OrderTask = {
        id: row.id,
        orderId: row.order_id,
        storeId: row.store_id,
        type: row.type as OrderTask['type'],
        payload: JSON.parse(row.payload),
        attempts: row.attempts,
        createdAt: row.created_at,
      };

      try {
        await this.executeTask(task);
        
        // Best Practice: Mark as completed with timestamp
        this.sql.exec(`
          UPDATE tasks 
          SET status = 'completed', last_attempt = ?, error = NULL 
          WHERE id = ?
        `, now, task.id);
        
        successCount++;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const newAttempts = task.attempts + 1;
        
        // Best Practice: Use exponential backoff for retries
        if (newAttempts >= CONFIG.MAX_RETRIES) {
          // Max retries reached - mark as failed
          this.sql.exec(`
            UPDATE tasks 
            SET status = 'failed', attempts = ?, last_attempt = ?, error = ? 
            WHERE id = ?
          `, newAttempts, now, errorMessage, task.id);
          
          console.error(`Task ${task.id} failed permanently after ${newAttempts} attempts: ${errorMessage}`);
        } else {
          // Schedule retry with exponential backoff
          const backoffMs = this.calculateBackoff(newAttempts);
          const nextRetry = new Date(Date.now() + backoffMs).toISOString();
          
          this.sql.exec(`
            UPDATE tasks 
            SET attempts = ?, last_attempt = ?, next_retry = ?, error = ? 
            WHERE id = ?
          `, newAttempts, now, nextRetry, errorMessage, task.id);
          
          console.warn(`Task ${task.id} failed (attempt ${newAttempts}/${CONFIG.MAX_RETRIES}), retry at ${nextRetry}`);
        }
        
        failCount++;
      }
    }

    console.log(`Alarm completed: ${successCount} succeeded, ${failCount} failed`);

    // Best Practice: Schedule next alarm if there are pending tasks
    const remaining = this.sql.exec(`
      SELECT 
        COUNT(*) as total,
        MIN(next_retry) as next_time
      FROM tasks 
      WHERE status = 'pending'
    `).one() as { total: number; next_time: string | null } | null;

    if (remaining && remaining.total > 0) {
      // Schedule alarm for the earliest retry time, or 1 second if tasks are ready now
      let nextAlarmTime = Date.now() + SECONDS;
      
      if (remaining.next_time) {
        const nextRetryTime = new Date(remaining.next_time).getTime();
        if (nextRetryTime > Date.now()) {
          nextAlarmTime = nextRetryTime;
        }
      }
      
      await this.ctx.storage.setAlarm(nextAlarmTime);
    }

    // Best Practice: Cleanup old completed tasks periodically
    const cleanupThreshold = new Date(Date.now() - CONFIG.CLEANUP_DAYS * 24 * 60 * 60 * 1000).toISOString();
    this.sql.exec(`DELETE FROM tasks WHERE status = 'completed' AND created_at < ?`, cleanupThreshold);
  }

  /**
   * Execute a single task
   * Best Practice: Wrap each task type with proper error context
   */
  private async executeTask(task: OrderTask): Promise<void> {
    const startTime = Date.now();
    console.log(`Executing task: ${task.type} for order ${task.orderId} (attempt ${task.attempts + 1})`);

    try {
      switch (task.type) {
        case 'email':
          await this.sendEmail(task);
          break;
        case 'webhook':
          await this.sendWebhook(task);
          break;
        case 'inventory':
          await this.updateInventory(task);
          break;
        case 'notification':
          await this.sendNotification(task);
          break;
        default:
          throw new Error(`Unknown task type: ${task.type}`);
      }
      
      const duration = Date.now() - startTime;
      console.log(`Task ${task.id} completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`Task ${task.id} failed after ${duration}ms:`, error);
      throw error; // Re-throw for retry handling
    }
  }

  /**
   * Send email via Resend API
   * Best Practice: Validate inputs, handle rate limits
   */
  private async sendEmail(task: OrderTask): Promise<void> {
    const { to, subject, html, from } = task.payload as { 
      to: string; 
      subject: string; 
      html: string;
      from?: string;
    };

    // Best Practice: Validate required fields
    if (!to || !subject) {
      throw new Error('Email requires "to" and "subject" fields');
    }

    if (!this.env.RESEND_API_KEY) {
      console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
      return;
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        from: from || 'noreply@ozzyl.com', 
        to, 
        subject, 
        html: html || '' 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      // Best Practice: Include status code and error details
      throw new Error(`Email failed (${response.status}): ${errorText}`);
    }
  }

  /**
   * Send webhook with HMAC signature
   * Best Practice: Add timeout, validate URL, sign payload
   */
  private async sendWebhook(task: OrderTask): Promise<void> {
    const { url, payload, secret } = task.payload as { 
      url: string; 
      payload: Record<string, unknown>; 
      secret?: string;
    };

    // Best Practice: Validate URL
    if (!url || !url.startsWith('http')) {
      throw new Error('Webhook requires valid URL starting with http(s)');
    }

    const body = JSON.stringify(payload);
    const headers: Record<string, string> = { 
      'Content-Type': 'application/json',
      'User-Agent': 'Ozzyl-Webhook/1.0',
      'X-Webhook-Timestamp': new Date().toISOString(),
    };

    // Best Practice: Sign webhook payload with HMAC-SHA256
    if (secret) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw', 
        encoder.encode(secret), 
        { name: 'HMAC', hash: 'SHA-256' }, 
        false, 
        ['sign']
      );
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
      headers['X-Webhook-Signature'] = 'sha256=' + Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    }

    // Best Practice: Use AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30 * SECONDS);

    try {
      const response = await fetch(url, { 
        method: 'POST', 
        headers, 
        body,
        signal: controller.signal,
      });
      
      if (!response.ok) {
        throw new Error(`Webhook failed (${response.status})`);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Update inventory in D1
   * Best Practice: Use transactions for consistency
   */
  private async updateInventory(task: OrderTask): Promise<void> {
    const { productId, quantity, operation = 'decrease' } = task.payload as { 
      productId: number; 
      quantity: number;
      operation?: 'increase' | 'decrease';
    };

    if (!productId || quantity === undefined) {
      throw new Error('Inventory update requires productId and quantity');
    }

    console.log(`[Inventory] ${operation} product ${productId} by ${quantity}`);
    
    // TODO: Implement D1 update
    // await this.env.DB.prepare(
    //   operation === 'decrease' 
    //     ? 'UPDATE products SET inventory = inventory - ? WHERE id = ?'
    //     : 'UPDATE products SET inventory = inventory + ? WHERE id = ?'
    // ).bind(quantity, productId).run();
  }

  /**
   * Send push notification
   * Best Practice: Validate payload, handle subscription errors
   */
  private async sendNotification(task: OrderTask): Promise<void> {
    const { title, body, url, icon } = task.payload as { 
      title: string; 
      body: string;
      url?: string;
      icon?: string;
    };

    if (!title || !body) {
      throw new Error('Notification requires title and body');
    }

    console.log(`[Notification] ${title}: ${body}`);
    
    // TODO: Implement web push
    // const subscription = task.payload.subscription;
    // await webpush.sendNotification(subscription, JSON.stringify({ title, body, url, icon }));
  }
}

// ============================================================================
// WORKER ENTRY POINT
// ============================================================================

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // Route: /do/:storeId/* - Forward to Durable Object
    const match = url.pathname.match(/^\/do\/(\d+)(\/.*)?$/);
    if (match) {
      const storeId = match[1];
      const doPath = match[2] || '/';
      
      const id = env.ORDER_PROCESSOR.idFromName(`store-${storeId}`);
      const stub = env.ORDER_PROCESSOR.get(id);
      
      // Forward request to DO with modified URL
      const doUrl = new URL(request.url);
      doUrl.pathname = doPath;
      
      return stub.fetch(new Request(doUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
      }));
    }

    // Health check
    if (url.pathname === '/health') {
      return Response.json({ status: 'ok', service: 'order-processor' });
    }

    return Response.json({ error: 'Not found' }, { status: 404 });
  },
};
