# Multi-tenant Payment Policy and Gateway Rollout

Last updated: 2026-02-12

## Implemented now

1. Plan-based payment policy is enforced in both UI and API.
- `free`: only `cod` + manual `bkash`
- `starter/premium/business`: `cod`, `bkash`, `nagad`, `rocket`, and future `stripe`

2. Server-side enforcement is active in order creation.
- File: `apps/web/app/routes/api.create-order.ts`
- Block code: `PAYMENT_METHOD_BLOCKED_BY_PLAN`

3. Payment settings are restricted for free stores.
- File: `apps/web/app/routes/app.settings.payment.tsx`
- Free plan cannot save Nagad/Rocket configs.

4. Platform fee snapshot is now calculated and stored in order `pricingJson`.
- Keys: `platformFeeRate`, `platformFeeAmount`, `merchantNetAmount`
- This supports future payout and commission enforcement without backfill ambiguity.

5. Paid plans now support hosted SSLCommerz checkout.
- Checkout method: `sslcommerz`
- API initializes SSLCommerz session and returns `paymentRedirectUrl`.
- IPN webhook verifies payment using SSLCommerz Validation API before marking order as paid.

6. Admin payout calculation now uses per-order fee snapshots.
- Route: `app.admin.payouts`
- Source of truth: `orders.pricing_json -> $.platformFeeAmount`

## Why this design

- Enforcing at API level prevents frontend bypass.
- Storing fee snapshot at order time keeps finance audit-safe even if plan fee rates change later.
- Multi-tenant isolation remains store-scoped (`store_id`) in all payment paths.

## Future gateway integration path (paid plans)

1. Add provider adapters with a common interface:
- `createPaymentIntent`
- `verifyCallback`
- `verifyWebhook`
- `mapProviderStatusToOrderStatus`

2. Use webhook-first payment confirmation:
- Never mark as paid from redirect URL alone.
- Verify signature + provider API status before state transition.

3. Add encrypted store-level provider credentials for paid stores.

4. Add transaction ledger table (order-level gateway events + retries + idempotency).

## Required environment variables

- `SSLCOMMERZ_STORE_ID`
- `SSLCOMMERZ_STORE_PASSWORD`
- `SSLCOMMERZ_LIVE` (`true`/`1` for production, otherwise sandbox endpoints)

## Primary documentation references

- Stripe Connect overview: https://docs.stripe.com/connect
- Stripe webhooks: https://docs.stripe.com/webhooks
- bKash developer docs: https://developer.bka.sh/docs
- bKash webhooks: https://developer.bka.sh/docs/webhooks
- SSLCommerz docs: https://developer.sslcommerz.com/doc/v4/index.html
- Shopify manual payment methods model: https://help.shopify.com/en/manual/payments/manual-payments
