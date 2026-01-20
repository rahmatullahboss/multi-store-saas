# AGENTS.md — Multi Store SaaS

## Communication Style
- Always reply in Banglish: use English letters to express Bangla words; do not use Bangla script.

## Quick Context
- Multi-tenant e-commerce SaaS on Cloudflare (Workers/Pages + D1 + R2 + KV).
- Remix SSR frontend, Hono API backend.
- Separate GrapesJS page-builder worker at `apps/page-builder`.

## Setup & Dev Commands (Main App)
```bash
npm install
npm run dev               # Remix dev server
npm run dev:wrangler      # Cloudflare Pages dev
npm run build             # Production build
npm run deploy            # Pages deploy (main app)
```

## Setup & Dev Commands (Page Builder Worker)
```bash
cd apps/page-builder
npm install
npm run dev               # Remix dev
npm run start             # Wrangler dev (Worker)
npm run deploy            # Manual deploy (builder worker)
```

## Environment Variables (Critical)
Copy `.env.example` to `.env` for local dev and mirror secrets in Cloudflare Dashboard for prod.

Required for smooth local/prod setup:
- `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_DATABASE_ID`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`
- `SESSION_SECRET` (must match main app + builder worker for shared auth)
- `RESEND_API_KEY` (email)
- `OPENROUTER_API_KEY` or provider key for AI features
- Payment gateways as needed (`BKASH_*`, `NAGAD_*`, `STRIPE_*`)
- `APP_URL` (local/prod base URL)

## Database & Storage
```bash
# Local migrations
npm run db:migrate:local

# Production migrations
npm run db:migrate:prod
```

## Testing
```bash
npm run test
npm run e2e
npm run test:all
```

## Deployment Notes
- **Main app** deploys via Cloudflare Pages (`npm run deploy`).
- **Page builder worker** requires manual deploy from `apps/page-builder` (`npm run deploy`).
- Update Cloudflare secrets in the dashboard (not in `wrangler.toml`).

## Coding Guidelines (Project Rules)
- Always scope DB queries by `store_id` (multi-tenant safety).
- Use server-side Zod validation for all writes.
- Use Remix `loader`/`action` patterns; avoid `useEffect` for page data.
- Use Tailwind for styling and `lucide-react` for icons.
- Use `<OptimizedImage />` (avoid raw `<img>` for performance).
- Add regression tests for fixes when feasible.
- Avoid arbitrary scripts; sanitize and rate-limit inputs.

## Builder Rules
- Pages/templates share the unified section registry.
- Published pages should read published JSON only.
- Invalidate KV cache on publish.

## Skills (Context7 References)
- Cloudflare Pages/Workers bindings: configure KV/D1/R2 in `wrangler.toml` and bind in dashboard for prod.
- Use `wrangler pages deploy` for Pages and `wrangler deploy` for the builder worker.
- GrapesJS canvas styles: use `canvas.styles` to inject compiled CSS for correct rendering.

## Helpful Config Files
- Main app: `wrangler.toml`, `package.json`
- Builder: `apps/page-builder/wrangler.toml`, `apps/page-builder/package.json`
- Rules: `.agent/rules/PROJECT_RULES.md`
