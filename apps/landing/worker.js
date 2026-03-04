/**
 * Cloudflare Workers entry point for the Ozzyl Landing Remix app.
 *
 * Pattern: Remix v2 + Cloudflare Workers (not Pages)
 * The vite build produces build/server/index.js which is the Remix server build.
 * We wrap it with a standard Workers fetch handler.
 */
import { createRequestHandler } from '@remix-run/cloudflare';
// @ts-ignore - this is the Remix server build output
import * as build from './build/server/index.js';
const handleRequest = createRequestHandler(build, process.env.NODE_ENV);
export default {
    async fetch(request, env, ctx) {
        try {
            return await handleRequest(request, {
                cloudflare: { env, ctx },
                env,
            });
        }
        catch (error) {
            console.error(error);
            return new Response('Internal Server Error', { status: 500 });
        }
    },
};
