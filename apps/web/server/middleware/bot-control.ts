import type { MiddlewareHandler } from 'hono';
import type { TenantContext, TenantEnv } from './tenant';

const VERIFIED_SEARCH_BOT_PATTERNS = [
  /googlebot/i,
  /google-inspectiontool/i,
  /adsbot-google/i,
  /bingbot/i,
  /bingpreview/i,
  /applebot/i,
  /duckduckbot/i,
  /yandex(bot)?/i,
  /baiduspider/i,
];

// Non-essential AI/content scraping bots (SEO-safe to block for most stores)
const BLOCKED_BOT_PATTERNS = [
  /gptbot/i,
  /chatgpt-user/i,
  /ccbot/i,
  /claudebot/i,
  /claude-searchbot/i,
  /anthropic-ai/i,
  /bytespider/i,
  /perplexitybot/i,
  /imagesiftbot/i,
  /omgili/i,
  /amazonbot/i,
  /diffbot/i,
  /petalbot/i,
  /semrushbot/i,
  /ahrefsbot/i,
  /mj12bot/i,
  /dotbot/i,
];

function isVerifiedSearchBot(userAgent: string): boolean {
  return VERIFIED_SEARCH_BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

function isBlockedBot(userAgent: string): boolean {
  return BLOCKED_BOT_PATTERNS.some((pattern) => pattern.test(userAgent));
}

export const botControlMiddleware = (): MiddlewareHandler<{
  Bindings: TenantEnv;
  Variables: TenantContext;
}> => {
  return async (c, next) => {
    const method = c.req.method;
    if (method !== 'GET' && method !== 'HEAD') return next();

    const path = c.req.path;
    if (path.startsWith('/api/')) return next();

    // Keep admin domain fully accessible
    const host = (c.req.header('x-forwarded-host') || c.req.header('host') || '').toLowerCase();
    const saasDomain = (c.env.SAAS_DOMAIN || 'ozzyl.com').toLowerCase();
    if (host === `app.${saasDomain}`) return next();

    const userAgent = c.req.header('user-agent') || '';
    if (!userAgent) return next();

    if (isVerifiedSearchBot(userAgent)) {
      return next();
    }

    if (isBlockedBot(userAgent)) {
      const response = new Response('Forbidden', { status: 403 });
      response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
      response.headers.set('Cache-Control', 'public, max-age=3600');
      return response;
    }

    return next();
  };
};
