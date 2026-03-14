import type { LoaderFunctionArgs } from 'react-router';

export async function loader({ context }: LoaderFunctionArgs) {
  const saasDomain = context.cloudflare.env.SAAS_DOMAIN || 'ozzyl.com';

  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /app
Disallow: /api
Disallow: /checkout
Disallow: /cart

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Claude-SearchBot
Disallow: /

User-agent: PerplexityBot
Disallow: /

User-agent: Bytespider
Disallow: /

Sitemap: https://${saasDomain}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}


export default function() {}
