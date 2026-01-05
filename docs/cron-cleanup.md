# Pending Domain Cleanup - Cron Worker

## Purpose

Clean up domain requests stuck in 'pending' status for more than 48 hours to free up Cloudflare custom hostname slots.

## Why This Matters

Cloudflare for SaaS gives 100 free custom hostnames. If users request domains but never configure DNS, these slots are wasted. This cron job automatically expires and cleans up stale requests.

---

## Implementation Option 1: Cloudflare Cron Trigger

Add to `wrangler.toml`:

```toml
[triggers]
crons = ["0 */6 * * *"]  # Every 6 hours
```

Create `functions/scheduled.ts`:

```typescript
import { cleanupExpiredPendingDomains } from "~/services/subscription.server";

export async function scheduled(
  event: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  ctx.waitUntil(
    cleanupExpiredPendingDomains(env, 48)
      .then((count) =>
        console.log(`[CRON] Cleaned up ${count} expired pending domains`)
      )
      .catch((err) => console.error("[CRON] Cleanup failed:", err))
  );
}
```

---

## Implementation Option 2: Manual Admin Trigger

Create a button in the admin panel that calls the cleanup function:

```typescript
// In routes/api.admin.cleanup-domains.ts
import { cleanupExpiredPendingDomains } from "~/services/subscription.server";

export async function action({ context }: ActionFunctionArgs) {
  // Admin auth check here...

  const cleaned = await cleanupExpiredPendingDomains(
    context.cloudflare.env,
    48
  );
  return json({ success: true, cleanedCount: cleaned });
}
```

---

## Query Preview

This is what the cleanup function does:

```sql
UPDATE stores
SET
  custom_domain_status = 'expired',
  custom_domain_request = NULL,
  updated_at = CURRENT_TIMESTAMP
WHERE
  custom_domain_status = 'pending'
  AND custom_domain_requested_at < (NOW() - INTERVAL 48 HOURS);
```

---

## Monitoring

Add this to your Cloudflare dashboard monitoring:

- Alert if pending domains > 80 (approaching the 100 limit)
- Track cleanup job execution in logs

---

## Environment Variables Needed

| Variable               | Description                                        |
| ---------------------- | -------------------------------------------------- |
| `CLOUDFLARE_API_TOKEN` | Token with "Cloudflare for SaaS > Edit" permission |
| `CLOUDFLARE_ZONE_ID`   | Zone ID of your main domain (digitalcare.site)     |
