import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const baseUrl = process.env.OZZYL_APP_API_BASE || 'https://app.ozzyl.com';
    const upstreamUrl = `${baseUrl.replace(/\/$/, '')}/api/ai-orchestrator`;
    const internalKey = process.env.OZZYL_INTERNAL_API_KEY || '';

    // Inject channel:'visitor' so the orchestrator routes correctly
    const forwardBody = { channel: 'visitor', ...body };

    const doFetch = () =>
      fetch(upstreamUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          // Use real origin (in orchestrator ALLOWED_ORIGINS) — NOT app.ozzyl.com
          Origin: 'https://ozzyl.com',
          Referer: 'https://ozzyl.com/',
          'User-Agent': 'OzzylLandingProxy/1.0',
          // Internal key for Cloudflare WAF skip rule
          ...(internalKey ? { 'X-Internal-Key': internalKey } : {}),
          // Forward visitor IP for rate-limiting
          'X-Forwarded-For': req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '',
        },
        body: JSON.stringify(forwardBody),
        cache: 'no-store',
      });

    let upstream = await doFetch();

    // Retry once if Cloudflare challenge detected
    if (upstream.status === 403 || upstream.status === 503) {
      const peek = await upstream.text();
      if (peek.includes('<!DOCTYPE html>') || peek.includes('challenge-platform')) {
        await new Promise((r) => setTimeout(r, 1500));
        upstream = await doFetch();
      } else {
        // Not a challenge page — return the original error
        try {
          const data = JSON.parse(peek);
          return NextResponse.json(data, { status: upstream.status });
        } catch {
          return NextResponse.json(
            { error: peek || 'Upstream error' },
            { status: upstream.status }
          );
        }
      }
    }

    const raw = await upstream.text();
    const contentType = upstream.headers.get('content-type') || '';

    // Cloudflare managed challenge or other HTML response from upstream
    if (contentType.includes('text/html') || raw.startsWith('<!DOCTYPE html>')) {
      console.error('[visitor-chat proxy] Cloudflare challenge detected. Add WAF skip rule for X-Internal-Key header.');
      return NextResponse.json(
        { error: 'Service temporarily unavailable. Please try again shortly.' },
        { status: 503 }
      );
    }

    try {
      const data = JSON.parse(raw) as any;

      // Normalize possible payload shapes so the client always gets `response`.
      if (typeof data?.response !== 'string' && typeof data?.data?.response === 'string') {
        data.response = data.data.response;
      }

      return NextResponse.json(data, { status: upstream.status });
    } catch {
      return NextResponse.json(
        { error: raw || 'Upstream returned non-JSON response' },
        { status: upstream.status || 502 }
      );
    }
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
