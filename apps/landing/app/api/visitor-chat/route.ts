import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const baseUrl = process.env.OZZYL_APP_API_BASE || 'https://app.ozzyl.com';
    const upstreamUrl = `${baseUrl.replace(/\/$/, '')}/api/ai-orchestrator`;

    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': req.headers.get('user-agent') || '',
        'X-Forwarded-For': req.headers.get('x-forwarded-for') || '',
      },
      body: JSON.stringify({ ...body, channel: 'visitor' }),
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
