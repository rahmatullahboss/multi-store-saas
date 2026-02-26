# Changelog

All notable changes to `@ozzyl/sdk` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-02-24

### Added

- Initial release of `@ozzyl/sdk`
- `OzzylClient` (`new Ozzyl(apiKey, options?)`) with Stripe-style resource namespacing
- **`ozzyl.products`** — `list(params?)`, `get(id)` — full pagination support
- **`ozzyl.orders`** — `list(params?)`, `get(id)` — status filtering, line items
- **`ozzyl.analytics`** — `summary(params?)` — daily breakdown + totals, date range queries
- **`ozzyl.store`** — `get()` — store branding, plan, and subscription info
- **`ozzyl.webhooks`** — `list()`, `create(params)`, `delete(id)` — full webhook lifecycle management
- `Ozzyl.verifyWebhookSignature(body, signature, secret)` — static method for HMAC-SHA256 webhook verification with replay-attack protection (5-minute window)
- Full TypeScript support — every response type exported, zero `any`
- Auto-retry with exponential backoff on `429` and `5xx` responses (configurable, default 3 retries)
- Typed error hierarchy: `OzzylError`, `OzzylAuthError`, `OzzylRateLimitError`, `OzzylNotFoundError`, `OzzylValidationError`
- Edge runtime compatible — Cloudflare Workers, Deno, Node.js 18+, Bun, browsers (Web Crypto API only, no Node.js built-ins)
- Test mode auto-detection from `sk_test_` API key prefix
- ESM + CJS dual build via `tsup`
- 40 unit tests covering all resources, error handling, retry logic, and webhook verification
