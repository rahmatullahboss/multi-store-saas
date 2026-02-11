import { json } from '@remix-run/cloudflare';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/cloudflare';
import { handleVisitorChatAction } from '~/services/visitor-chat.server';

/**
 * Public API endpoint for Ozzyl AI visitor chat
 * No authentication required - for marketing landing page visitors
 * 
 * Actions:
 * - 'register': Create a new visitor (Lead Capture)
 * - 'chat': Send message and get AI response (History Persistence)
 * 
 * Rate limited by Cloudflare
 * 
 * NOTE: We handle POST requests in both loader and action to bypass Remix's
 * CSRF protection for cross-origin requests from the landing page.
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Handle OPTIONS preflight and POST requests to bypass CSRF check
export async function loader({ request, context }: LoaderFunctionArgs) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method === 'POST') {
    const response = await handleVisitorChatAction({ request, context } as ActionFunctionArgs);
    const headers = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
    return new Response(response.body, { status: response.status, headers });
  }

  return json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
}

// Keep action for same-origin requests (e.g., from admin panel)
export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
  }

  const response = await handleVisitorChatAction({ request, context } as ActionFunctionArgs);
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { status: response.status, headers });
}


export default function() {}
