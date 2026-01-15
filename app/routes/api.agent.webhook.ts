
import { json, LoaderFunctionArgs, ActionFunctionArgs } from '@remix-run/cloudflare';
import { drizzle } from 'drizzle-orm/d1';
import { eq, sql, desc, and } from 'drizzle-orm';
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

// 1. Find Agent by ID (Direct Column Match)
async function findAgentByPlatformId(db: any, platform: 'whatsapp' | 'messenger', id: string) {
  if (platform === 'whatsapp') {
    return await db.query.agents.findFirst({
        where: eq(schema.agents.whatsappPhoneId, id)
    });
  } else {
    return await db.query.agents.findFirst({
        where: eq(schema.agents.messengerPageId, id)
    });
  }
}

// Verify Webhook (GET)
export const loader = async ({ request, context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env as unknown as Env;
  const url = new URL(request.url);
  
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  // Verify token from Env (Global verification token for simplicity)
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
    
    // Process in background to avoid timeouts
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

  // Handle Messenger
  if (payload.object === 'page') {
    for (const entry of payload.entry) {
        if (entry.messaging) {
            for (const event of entry.messaging) {
                if (event.message && !event.message.is_echo && event.message.text) {
                    const accountId = entry.id; // Page ID
                    
                    await handleMessage(
                        db, env, 
                        'messenger', 
                        accountId, 
                        event.sender.id, 
                        event.message.text, 
                        'User' // Name not available immediately
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
    platform: 'whatsapp' | 'messenger', 
    platformId: string, 
    senderId: string, 
    text: string,
    senderName: string
) {
    // 1. Find Agent
    const agent = await findAgentByPlatformId(db, platform, platformId);
    if (!agent || !agent.isActive) return;

    // 2. Find/Create Conversation
    let conversation = await db.query.aiConversations.findFirst({
        where: and(
            eq(schema.aiConversations.agentId, agent.id),
            eq(schema.aiConversations.externalId, senderId),
            eq(schema.aiConversations.channel, platform)
        )
    });

    if (!conversation) {
        const result = await db.insert(schema.aiConversations).values({
            agentId: agent.id,
            storeId: agent.storeId,
            channel: platform,
            externalId: senderId,
            customerName: senderName,
            status: 'active',
            lastMessageAt: new Date(),
        }).returning();
        conversation = result[0];
    } else {
        // Update timestamp
        await db.update(schema.aiConversations)
            .set({ lastMessageAt: new Date() })
            .where(eq(schema.aiConversations.id, conversation.id));
    }

    // 3. Process with AI (processMessage handles saving user msg, AI response, credit deduction)
    const aiResponse = await processMessage(agent.id, text, conversation.id, env);
    
    // 4. Send Response via Platform API
    // Note: We need a Merchant implementation of sending messages.
    // Ideally, we should use the merchant's access token if we had stored it.
    // For now, assuming we use a System User token or the merchant provided one.
    // Since we don't have per-merchant Access Token storage in `agents` yet (only IDs), 
    // we might need to rely on the Env token or future implementation.
    
    const accessToken = env.META_ACCESS_TOKEN; 

    if (platform === 'whatsapp') {
        await sendWhatsAppMessage(senderId, aiResponse.text, platformId, accessToken);
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
