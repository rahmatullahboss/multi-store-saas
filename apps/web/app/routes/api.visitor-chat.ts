import { json } from '~/lib/rr7-compat';
import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';
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

/** Helper to wrap any response with CORS headers */
function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  Object.entries(corsHeaders).forEach(([key, value]) => headers.set(key, value));
  return new Response(response.body, { status: response.status, headers });
}

/** Helper to create a CORS-safe error response */
function corsError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Handle OPTIONS preflight and POST requests to bypass CSRF check
export async function loader({ request, context }: LoaderFunctionArgs) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method === 'POST') {
    try {
      const response = await handleVisitorChatAction({ request, context } as ActionFunctionArgs);
      return withCors(response);
    } catch (err) {
      console.error('[visitor-chat loader] Unhandled error:', err);
      return corsError('Internal server error', 500);
    }
  }

  return json({ error: 'Method not allowed' }, { status: 405, headers: corsHeaders });
}

// Keep action for same-origin requests (e.g., from admin panel)
export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return corsError('Method not allowed', 405);
  }

  try {
    const response = await handleVisitorChatAction({ request, context } as ActionFunctionArgs);
    return withCors(response);
  } catch (err) {
    console.error('[visitor-chat action] Unhandled error:', err);
    return corsError('Internal server error', 500);
  }
}


export default function() {}
