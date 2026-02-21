import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const baseUrl = process.env.OZZYL_APP_API_BASE || 'https://app.ozzyl.com';
    // Hit Remix action directly - no need for _data parameter
    const upstreamUrl = `${baseUrl.replace(/\/$/, '')}/api/visitor-chat`;

    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': req.headers.get('user-agent') || '',
        'X-Forwarded-For': req.headers.get('x-forwarded-for') || '',
      },
      body: JSON.stringify(body),
    });

    const raw = await upstream.text();
    try {
      const data = JSON.parse(raw);
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
