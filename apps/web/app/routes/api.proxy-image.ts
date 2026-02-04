import type { LoaderFunctionArgs } from '@remix-run/cloudflare';

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get('url');
  const width = Number(url.searchParams.get('w') || 0);
  const height = Number(url.searchParams.get('h') || 0);
  const quality = Number(url.searchParams.get('q') || 75);

  if (!imageUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  try {
    const safeWidth = Number.isFinite(width) && width > 0 ? Math.min(Math.floor(width), 2400) : undefined;
    const safeHeight = Number.isFinite(height) && height > 0 ? Math.min(Math.floor(height), 2400) : undefined;
    const safeQuality = Number.isFinite(quality) && quality > 10 ? Math.min(Math.floor(quality), 95) : 75;

    const imageResponse = await fetch(imageUrl, {
      cf: {
        image: {
          width: safeWidth,
          height: safeHeight,
          fit: 'cover',
          quality: safeQuality,
          format: 'auto',
          metadata: 'none',
        },
      },
    });
    
    if (!imageResponse.ok) {
      return new Response(`Failed to fetch image: ${imageResponse.statusText}`, { 
        status: imageResponse.status 
      });
    }

    const contentType = imageResponse.headers.get('content-type') || 'application/octet-stream';
    
    return new Response(imageResponse.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=31536000, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response('Failed to proxy image', { status: 500 });
  }
}
