# Project Rules & Agent Memory

These rules are strict constraints for the Multi Store SaaS project.

## Core Agent Memory

- **Multi-tenant hostname → shop_id resolver**: KV cache + D1 fallback; enforce `shop_id` scoping in all queries.
- **Capability-based gating**: `store_enabled` + `home_entry` (not mutually exclusive modes).
- **Builder engine unified**: Pages + templates use same section registry; draft/published snapshot; public reads published only.
- **Reorder correctness**: `orderedIds` → batch update without UNIQUE conflicts; versioning/optimistic lock.
- **Server-side Zod validation**: Mandatory for all writes; `props_json` safe parse/stringify.
- **Pricing service**: Server-side; money in integer cents; cart/order snapshots.
- **Checkout/order idempotency**: Use `idempotency_key`; inventory reserve/release.
- **Payment abstraction**: COD/Stripe/SSLCommerz/bKash; webhook verify + dedupe.
- **BD order form**: Configurable fields + Dhaka/outside shipping + anti-spam.
- **Remix patterns**: Loader/action intent pattern; optimistic UI + revalidate.
- **KV caching**: For published JSON; invalidate on publish.
- **R2 assets**: Signed uploads + asset metadata.
- **Tests**: unit/integration/e2e; every fix adds regression test.
- **Security**: Sanitization, authz, rate limiting; avoid arbitrary scripts.
- **Debug workflow**: Logs + audit entries; recent git diff analysis; small PRs.
