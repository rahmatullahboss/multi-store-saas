import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const baseUrl = process.env.OZZYL_APP_API_BASE || 'https://app.ozzyl.com';
    const upstreamUrl = `${baseUrl.replace(/\/$/, '')}/api/ai-orchestrator`;

    // Inject channel:'visitor' so the orchestrator routes correctly
    const forwardBody = { channel: 'visitor', ...body };

    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': req.headers.get('user-agent') || '',
        'Accept-Language': req.headers.get('accept-language') || '',
        Referer: 'https://app.ozzyl.com/',
        Origin: 'https://app.ozzyl.com',
        'X-Forwarded-For': req.headers.get('x-forwarded-for') || '',
        Cookie: req.headers.get('cookie') || '',
      },
      body: JSON.stringify(forwardBody),
      cache: 'no-store',
    });

    const raw = await upstream.text();
    const contentType = upstream.headers.get('content-type') || '';

    // Cloudflare managed challenge or other HTML response from upstream
    if (contentType.includes('text/html') || raw.startsWith('<!DOCTYPE html>')) {
      return NextResponse.json(
        { error: 'Temporary upstream protection challenge detected. Please try again in a few seconds.' },
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
