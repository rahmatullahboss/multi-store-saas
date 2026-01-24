/**
 * Order Processor Worker
 * 
 * Separate worker that exports the OrderProcessor Durable Object
 * This allows Pages Functions to use DO via service binding
 */

import { DurableObject } from "cloudflare:workers";

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
  error?: string;
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
        error TEXT
      )
    `);
    this.sql.exec(`CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status)`);
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

  async alarm(): Promise<void> {
    console.log('OrderProcessor alarm triggered');

    const pendingTasks = this.sql.exec(
      `SELECT * FROM tasks WHERE status = 'pending' ORDER BY created_at ASC LIMIT 10`
    ).toArray() as unknown as Array<{
      id: string; order_id: number; store_id: number;
      type: string; payload: string; attempts: number; created_at: string;
    }>;

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
        this.sql.exec(`UPDATE tasks SET status = 'completed', last_attempt = ? WHERE id = ?`,
          new Date().toISOString(), task.id);
      } catch (error) {
        const newAttempts = task.attempts + 1;
        if (newAttempts >= 3) {
          this.sql.exec(`UPDATE tasks SET status = 'failed', attempts = ?, last_attempt = ?, error = ? WHERE id = ?`,
            newAttempts, new Date().toISOString(), String(error), task.id);
        } else {
          this.sql.exec(`UPDATE tasks SET attempts = ?, last_attempt = ?, error = ? WHERE id = ?`,
            newAttempts, new Date().toISOString(), String(error), task.id);
        }
      }
    }

    // Check for more pending
    const remaining = this.sql.exec(`SELECT COUNT(*) as count FROM tasks WHERE status = 'pending'`).one() as { count: number } | null;
    if (remaining && remaining.count > 0) {
      await this.ctx.storage.setAlarm(Date.now() + 1000);
    }

    // Cleanup old completed (>7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    this.sql.exec(`DELETE FROM tasks WHERE status = 'completed' AND created_at < ?`, weekAgo);
  }

  private async executeTask(task: OrderTask): Promise<void> {
    console.log(`Executing task: ${task.type} for order ${task.orderId}`);

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
  }

  private async sendEmail(task: OrderTask): Promise<void> {
    const { to, subject, html } = task.payload as { to: string; subject: string; html: string };

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
      body: JSON.stringify({ from: 'noreply@ozzyl.com', to, subject, html }),
    });

    if (!response.ok) throw new Error(`Email failed: ${response.status}`);
  }

  private async sendWebhook(task: OrderTask): Promise<void> {
    const { url, payload, secret } = task.payload as { url: string; payload: Record<string, unknown>; secret?: string };
    const body = JSON.stringify(payload);
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    if (secret) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
      headers['X-Webhook-Signature'] = btoa(String.fromCharCode(...new Uint8Array(signature)));
    }

    const response = await fetch(url, { method: 'POST', headers, body });
    if (!response.ok) throw new Error(`Webhook failed: ${response.status}`);
  }

  private async updateInventory(task: OrderTask): Promise<void> {
    const { productId, quantity } = task.payload as { productId: number; quantity: number };
    console.log(`[Inventory] Reduce product ${productId} by ${quantity}`);
    // TODO: D1 update via this.env.DB
  }

  private async sendNotification(task: OrderTask): Promise<void> {
    const { title, body } = task.payload as { title: string; body: string };
    console.log(`[Notification] ${title}: ${body}`);
    // TODO: Web push implementation
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
