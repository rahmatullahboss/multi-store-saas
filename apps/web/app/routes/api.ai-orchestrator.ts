import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { json } from '@remix-run/cloudflare';
import { handleChatAction } from '~/routes/api.chat';
import { handleAiChatAction, handleAiChatLoader } from '~/routes/api.ai.chat';
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

export async function loader({ request }: LoaderFunctionArgs) {
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

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

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
      const { channel: _c, ...body } = payload;
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
      const nextRequest = buildFormRequest(request, formData);
      return handleChatAction({ request: nextRequest, context } as ActionFunctionArgs);
    }

    case 'super_admin': {
      const { channel: _c, ...body } = payload;
      const nextRequest = buildJsonRequest(request, body);
      return handleAiChatAction({ request: nextRequest, context } as ActionFunctionArgs);
    }

    case 'omnichannel': {
      const { channel: _c, ...body } = payload;
      const nextRequest = buildJsonRequest(request, body);
      return handleAgentChatAction({ request: nextRequest, context } as ActionFunctionArgs);
    }

    default:
      return json({ error: 'Unsupported channel' }, { status: 400 });
  }
}
