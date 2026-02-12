import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { handleChatAction } from '~/services/merchant-chat.server';
import { handleAiChatAction, handleAiChatLoader } from '~/services/ai-chat.server';
import { handleVisitorChatAction } from '~/services/visitor-chat.server';
import { handleAgentChatAction } from '~/services/agent-chat.server';

/**
 * Unified AI Orchestrator Endpoint
 *
 * Channels:
 * - super_admin: /api/ai/chat
 * - merchant/customer/marketing: /api/chat
 * - visitor: /api/visitor-chat
 * - omnichannel: /api/agent/chat
 */

function buildForwardHeaders(request: Request) {
  const headers = new Headers();
  const cookie = request.headers.get('cookie');
  if (cookie) headers.set('cookie', cookie);
  const authorization = request.headers.get('authorization');
  if (authorization) headers.set('authorization', authorization);
  return headers;
}

function buildJsonRequest(original: Request, body: unknown) {
  const headers = buildForwardHeaders(original);
  headers.set('Content-Type', 'application/json');
  return new Request(original.url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

function buildFormRequest(original: Request, formData: FormData) {
  const headers = buildForwardHeaders(original);
  return new Request(original.url, {
    method: 'POST',
    headers,
    body: formData,
  });
}

export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const channel = url.searchParams.get('channel');
  const mode = url.searchParams.get('mode');

  if (!channel || mode !== 'history') {
    return json({ error: 'Not found' }, { status: 404 });
  }

  // History currently lives in /api/ai/chat loader
  if (channel === 'super_admin' || channel === 'merchant') {
    return handleAiChatLoader({ request, context } as LoaderFunctionArgs);
  }

  return json({ messages: [] });
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  // Rate limiting: 30 requests per minute per IP
  const kv = context.cloudflare.env.AI_RATE_LIMIT;
  if (kv) {
    const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `ai_chat:${ip}:${Math.floor(Date.now() / 60000)}`; // per minute
    const countStr = await kv.get(rateLimitKey);
    const count = countStr ? parseInt(countStr, 10) : 0;
    
    if (count >= 30) {
      return json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 });
    }
    
    await kv.put(rateLimitKey, (count + 1).toString(), { expirationTtl: 60 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let payload: any = {};
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { channel } = payload;
  if (!channel) {
    return json({ error: 'Channel is required' }, { status: 400 });
  }

  switch (channel) {
    case 'visitor': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { channel: _, ...body } = payload;
      const nextRequest = buildJsonRequest(request, body);
      return handleVisitorChatAction({ request: nextRequest, context } as ActionFunctionArgs);
    }

    case 'merchant':
    case 'customer':
    case 'marketing': {
      const formData = new FormData();
      if (payload.message) formData.append('message', String(payload.message));
      if (payload.storeId !== undefined && payload.storeId !== null) {
        formData.append('storeId', String(payload.storeId));
      }
      // Pass customer info for conversation tracking
      if (payload.customerName) formData.append('customerName', String(payload.customerName));
      if (payload.customerPhone) formData.append('customerPhone', String(payload.customerPhone));
      if (payload.customerId) formData.append('customerId', String(payload.customerId));
      const nextRequest = buildFormRequest(request, formData);
      return handleChatAction({ request: nextRequest, context } as ActionFunctionArgs);
    }

    case 'super_admin': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { channel: _, ...body } = payload;
      const nextRequest = buildJsonRequest(request, body);
      return handleAiChatAction({ request: nextRequest, context } as ActionFunctionArgs);
    }

    case 'omnichannel': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { channel: _, ...body } = payload;
      const nextRequest = buildJsonRequest(request, body);
      return handleAgentChatAction({ request: nextRequest, context } as ActionFunctionArgs);
    }
    default:
      return json({ error: 'Unsupported channel' }, { status: 400 });
  }
}

export default function () {}
