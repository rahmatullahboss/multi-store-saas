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

const ALLOWED_ORIGINS = new Set([
  'https://ozzyl.com',
  'https://www.ozzyl.com',
]);

function buildCorsHeaders(request: Request) {
  const origin = request.headers.get('origin');
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : '';
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  });
  if (allowOrigin) headers.set('Access-Control-Allow-Origin', allowOrigin);
  return headers;
}

function withCors(request: Request, response: Response): Response {
  const headers = new Headers(response.headers);
  const cors = buildCorsHeaders(request);
  cors.forEach((value, key) => headers.set(key, value));
  return new Response(response.body, { status: response.status, headers });
}

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
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: buildCorsHeaders(request) });
  }

  const url = new URL(request.url);
  const channel = url.searchParams.get('channel');
  const mode = url.searchParams.get('mode');

  if (!channel || mode !== 'history') {
    return withCors(request, json({ error: 'Not found' }, { status: 404 }));
  }

  // History currently lives in /api/ai/chat loader
  if (channel === 'super_admin' || channel === 'merchant') {
    const response = await handleAiChatLoader({ request, context } as LoaderFunctionArgs);
    return withCors(request, response);
  }

  return withCors(request, json({ messages: [] }));
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: buildCorsHeaders(request) });
  }

  try {
    if (request.method !== 'POST') {
      return withCors(request, json({ error: 'Method not allowed' }, { status: 405 }));
    }

    // Rate limiting: 30 requests per minute per IP
    const kv = context.cloudflare.env.AI_RATE_LIMIT;
    if (kv) {
      const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
      const rateLimitKey = `ai_chat:${ip}:${Math.floor(Date.now() / 60000)}`; // per minute
      const countStr = await kv.get(rateLimitKey);
      const count = countStr ? parseInt(countStr, 10) : 0;
      
      if (count >= 30) {
        return withCors(
          request,
          json({ error: 'Too many requests. Please wait a moment.' }, { status: 429 })
        );
      }
      
      await kv.put(rateLimitKey, (count + 1).toString(), { expirationTtl: 60 });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: any = {};
    try {
      payload = await request.json();
    } catch {
      return withCors(request, json({ error: 'Invalid JSON' }, { status: 400 }));
    }

    const { channel } = payload;
    if (!channel) {
      return withCors(request, json({ error: 'Channel is required' }, { status: 400 }));
    }

    switch (channel) {
      case 'visitor': {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { channel: _, ...body } = payload;
        const nextRequest = buildJsonRequest(request, body);
        const response = await handleVisitorChatAction({ request: nextRequest, context } as ActionFunctionArgs);
        return withCors(request, response);
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
        const response = await handleChatAction({ request: nextRequest, context } as ActionFunctionArgs);
        return withCors(request, response);
      }

      case 'super_admin': {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { channel: _, ...body } = payload;
        const nextRequest = buildJsonRequest(request, body);
        const response = await handleAiChatAction({ request: nextRequest, context } as ActionFunctionArgs);
        return withCors(request, response);
      }

      case 'omnichannel': {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { channel: _, ...body } = payload;
        const nextRequest = buildJsonRequest(request, body);
        const response = await handleAgentChatAction({ request: nextRequest, context } as ActionFunctionArgs);
        return withCors(request, response);
      }

      default:
        return withCors(request, json({ error: 'Unsupported channel' }, { status: 400 }));
    }
  } catch (err) {
    console.error('[ai-orchestrator] Unhandled error:', err);
    return withCors(request, json({ error: 'Internal server error' }, { status: 500 }));
  }
}

export default function () {}
