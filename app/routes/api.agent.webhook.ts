
import { json, LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql, desc } from 'drizzle-orm';
import * as schema from '../../db/schema';
import { processMessage } from '~/services/agent.server';

interface Env {
  DB: D1Database;
  AI: any;
  VECTORIZE: any;
  META_VERIFY_TOKEN: string;
  META_ACCESS_TOKEN: string;
  MIMO_API_KEY?: string;
  OPENROUTER_API_KEY?: string;
}

// Helper to find agent by different platform IDs using JSON path
// Note: We use raw sql because Drizzle's query builder doesn't support json_extract easily in filters without sql operator
async function findAgentByPlatformId(db: any, platform: 'whatsapp' | 'messenger' | 'instagram', id: string) {
  let query;
  if (platform === 'whatsapp') {
    query = sql`json_extract(${schema.agents.platformConfig}, '$.whatsapp_phone_id') = ${id}`;
  } else if (platform === 'messenger') {
    query = sql`json_extract(${schema.agents.platformConfig}, '$.fb_page_id') = ${id}`;
  } else {
    query = sql`json_extract(${schema.agents.platformConfig}, '$.instagram_id') = ${id}`;
  }

  const agent = await db.select().from(schema.agents).where(query).limit(1).get();
  return agent;
}

// Verify Webhook (GET)
export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env as unknown as Env;
  const url = new URL(request.url);
  
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === env.META_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
};

// Handle Incoming Events (POST)
export const action = async ({ request, context }: ActionFunctionArgs) => {
  const env = context.cloudflare.env as unknown as Env;
  
  try {
    const payload = await request.json();
    
    // Process in background to avoid timeouts (Remix context.waitUntil)
    (context as any).waitUntil(processWebhookEvent(payload, env));
    
    return json({ status: 'received' });
  } catch (error) {
    console.error('Webhook Error:', error);
    return json({ status: 'error' }, { status: 500 });
  }
};

async function processWebhookEvent(payload: any, env: Env) {
  const db = drizzle(env.DB, { schema });

  // Handle WhatsApp
  if (payload.object === 'whatsapp_business_account') {
    for (const entry of payload.entry) {
      for (const change of entry.changes) {
        if (change.field === 'messages' && change.value.messages) {
          const phoneNumberId = change.value.metadata.phone_number_id;
          for (const message of change.value.messages) {
             if (message.type === 'text') {
                 await handleMessage(
                     db, env, 
                     'whatsapp', 
                     phoneNumberId, 
                     message.from, 
                     message.text.body,
                     change.value.contacts?.[0]?.profile?.name || 'Unknown'
                 );
             }
          }
        }
      }
    }
  }

  // Handle Messenger / Instagram (Check 'object' type)
  if (payload.object === 'page' || payload.object === 'instagram') {
    for (const entry of payload.entry) {
        if (entry.messaging) {
            for (const event of entry.messaging) {
                if (event.message && !event.message.is_echo && event.message.text) {
                    const platform = payload.object === 'instagram' ? 'instagram' : 'messenger';
                    const accountId = entry.id; // Page ID or IG Account ID
                    
                    await handleMessage(
                        db, env, 
                        platform, 
                        accountId, 
                        event.sender.id, 
                        event.message.text, 
                        'User' // Name not always available immediately
                    );
                }
            }
        }
    }
  }
}

async function handleMessage(
    db: any, 
    env: Env, 
    platform: 'whatsapp' | 'messenger' | 'instagram', 
    platformId: string, 
    senderId: string, 
    text: string,
    senderName: string
) {
    // 1. Find Agent
    const agent = await findAgentByPlatformId(db, platform, platformId);
    if (!agent || !agent.isActive) return;

    // 2. Find/Create Conversation
    let conversation = await db.query.conversations.findFirst({
        where: platform === 'whatsapp' 
            ? eq(schema.conversations.customerPhone, senderId) 
            : eq(schema.conversations.customerFbId, senderId)
    });

    if (!conversation) {
        const result = await db.insert(schema.conversations).values({
            agentId: agent.id,
            customerPhone: platform === 'whatsapp' ? senderId : null,
            customerFbId: platform !== 'whatsapp' ? senderId : null,
            customerName: senderName,
            status: 'active',
            lastMessageAt: new Date(),
        }).returning();
        conversation = result[0];
    } else {
        // Update timestamp
        await db.update(schema.conversations)
            .set({ lastMessageAt: new Date() })
            .where(eq(schema.conversations.id, conversation.id));
    }

    // 3. Save User Message
    await db.insert(schema.messages).values({
        conversationId: conversation.id,
        role: 'user',
        content: text
    });

    // 4. Process with AI
    // Note: agent.server.ts processMessage fetches history from DB. 
    // Since we just inserted the message, it will be included. 
    // We rely on processMessage to handle the prompting correctly.
    const aiResponse = await processMessage(agent.id, text, conversation.id, env);
    
    // 5. Save Assistant Message
    await db.insert(schema.messages).values({
        conversationId: conversation.id,
        role: 'assistant',
        content: aiResponse.text
    });

    // 6. Send Response
    // Get Access Token overrides if any
    const platformConfig = JSON.parse(agent.platformConfig || '{}');
    const accessToken = platformConfig.access_token || env.META_ACCESS_TOKEN; // Allow override or global

    if (platform === 'whatsapp') {
        const whatsappPhoneId = platformConfig.whatsapp_phone_id || platformId;
        await sendWhatsAppMessage(senderId, aiResponse.text, whatsappPhoneId, accessToken);
    } else {
        await sendMessengerMessage(senderId, aiResponse.text, accessToken);
    }
}

async function sendWhatsAppMessage(to: string, text: string, phoneId: string, token: string) {
    const response = await fetch(`https://graph.facebook.com/v21.0/${phoneId}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: to,
            type: 'text',
            text: { body: text }
        })
    });
    if (!response.ok) {
        console.error('WhatsApp Send Failed', await response.text());
    }
}

async function sendMessengerMessage(recipientId: string, text: string, token: string) {
    const response = await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text: text }
        })
    });
    if (!response.ok) {
        console.error('Messenger Send Failed', await response.text());
    }
}
