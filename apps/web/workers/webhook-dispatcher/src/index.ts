import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { webhooks, webhookDeliveryLogs } from '@ozzyl/db';

interface Env {
  DB: D1Database;
}

interface WebhookPayload {
  topic: string;
  storeId: number;
  payload: Record<string, unknown>;
  webhookId?: number;
}

export default {
  async queue(batch: MessageBatch<WebhookPayload>, env: Env): Promise<void> {
    const db = drizzle(env.DB);
    console.log(`[WebhookDispatcher] Processing batch of ${batch.messages.length} messages`);

    for (const message of batch.messages) {
      try {
        const { topic, storeId, payload, webhookId } = message.body;
        console.log(`[WebhookDispatcher] Processing event: ${topic} for store: ${storeId}`);

        // 1. Find subscribers
        let subscribers;
        if (webhookId) {
          subscribers = await db.select().from(webhooks).where(eq(webhooks.id, webhookId)).all();
        } else {
          subscribers = await db.select().from(webhooks).where(
            and(
              eq(webhooks.topic, topic),
              eq(webhooks.storeId, storeId),
              eq(webhooks.isActive, true)
            )
          ).all();
        }

        if (subscribers.length === 0) {
          console.log(`[WebhookDispatcher] No subscribers for ${topic} (Store ${storeId})`);
          message.ack();
          continue;
        }

        console.log(`[WebhookDispatcher] Found ${subscribers.length} subscribers`);

        // 2. Dispatch to each subscriber
        const deliveryPromises = subscribers.map(async (sub) => {
          try {
            const response = await fetch(sub.url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Ozzyl-Topic': topic,
                'X-Ozzyl-Store-Id': storeId.toString(),
                'X-Ozzyl-Delivery-Id': crypto.randomUUID(),
                // TODO: Add HMAC Signature for webhook authenticity
              },
              body: JSON.stringify(payload)
            });

            const success = response.ok;
            const responseBody = await response.text().catch(() => '');
            console.log(`[WebhookDispatcher] Sent to ${sub.url} -> ${response.status}`);

            // Log result using correct schema columns
            await db.insert(webhookDeliveryLogs).values({
              webhookId: sub.id,
              eventType: topic,
              payload: JSON.stringify(payload),
              statusCode: response.status,
              responseBody,
              success,
              errorMessage: success ? null : responseBody,
              attemptCount: 1,
            });

          } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            console.error(`[WebhookDispatcher] Failed to send to ${sub.url}:`, errorMessage);
            
            await db.insert(webhookDeliveryLogs).values({
              webhookId: sub.id,
              eventType: topic,
              payload: JSON.stringify(payload),
              statusCode: 0,
              responseBody: '',
              success: false,
              errorMessage,
              attemptCount: 1,
            });
          }
        });

        await Promise.all(deliveryPromises);
        message.ack();

      } catch (err) {
        console.error(`[WebhookDispatcher] Batch error:`, err);
        message.retry();
      }
    }
  }
};
