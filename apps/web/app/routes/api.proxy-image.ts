import type { LoaderFunctionArgs } from 'react-router';

const DEFAULT_CACHE_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days at edge

function isAllowedImageHost(hostname: string) {
  // Prevent SSRF/open-proxy abuse. Expand this list intentionally.
  if (hostname === 'images.unsplash.com') return true;
  if (hostname.endsWith('.r2.dev')) return true;
  if (hostname.endsWith('.ozzyl.com')) return true;
  return false;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const imageUrl = url.searchParams.get('url');
  // NOTE: We keep these params for forward-compat, but we DO NOT use CF Image Resizing here
  // because it may require paid features. Images should be optimized client-side before upload.
  // const width = Number(url.searchParams.get('w') || 0);
  // const height = Number(url.searchParams.get('h') || 0);
  // const quality = Number(url.searchParams.get('q') || 75);

  if (!imageUrl) {
    return new Response('Missing url parameter', { status: 400 });
  }

  try {
    const parsed = new URL(imageUrl);
    if (parsed.protocol !== 'https:') {
      return new Response('Only https URLs are allowed', { status: 400 });
    }
    if (!isAllowedImageHost(parsed.hostname)) {
      return new Response('Image host not allowed', { status: 403 });
    }

    const referer = request.headers.get('referer') || '';
    const origin = request.headers.get('origin') || '';
    const allowedRefererPattern = /^https?:\/\/(.*\.)?ozzyl\.com/;
    // Require at least one of referer or origin to be from a trusted source.
    // Empty referer alone is not sufficient — origin must also be absent (e.g. same-origin navigations).
    const hasReferer = referer.length > 0;
    const hasOrigin = origin.length > 0;
    const isFromTrustedSource =
      (!hasReferer && !hasOrigin) || // direct server-to-server / same-origin (no headers at all)
      (hasReferer && allowedRefererPattern.test(referer)) ||
      (hasOrigin && allowedRefererPattern.test(origin));

    if (!isFromTrustedSource) {
      return new Response('Forbidden', { status: 403 });
    }

    const imageResponse = await fetch(parsed.toString(), {
      // Wrangler/Workers typing for `cf` varies; cast to keep strict TS happy.
      cf: { cacheEverything: true, cacheTtl: DEFAULT_CACHE_TTL_SECONDS } as any,
      headers: {
        // Preserve Accept so origin can content-negotiate (e.g. WebP/AVIF).
        accept: request.headers.get('accept') || '*/*',
      },
    } as any);
    
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
        'Access-Control-Allow-Origin': 'https://ozzyl.com',
        'Cache-Control': `public, s-maxage=${DEFAULT_CACHE_TTL_SECONDS}, max-age=86400, stale-while-revalidate=604800`,
      },
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response('Failed to proxy image', { status: 500 });
  }
}


export default function() {}
