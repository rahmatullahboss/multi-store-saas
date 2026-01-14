---
name: "migrate-store"
description: "Migrate store data from one plan to another (free to pro)"
when_to_use: "When merchant upgrades/downgrades"
allowed-tools: ["Read", "Write", "Bash(wrangler d1:*)"]
---

# Store Migration Process

## Step 1: Backup

1. Run: `wrangler d1 backup create your-db --store-id ${storeId}`

## Step 2: Update Plan

1. Update `stores` table: `plan_tier = 'pro'`
2. Update limits in Redis/KV.

## Step 3: Migrate Data (Limits)

- **Free → Pro**: Unlock hidden items?
- **Pro → Free**: Archive excess products (> 10 limit).

## Step 4: Run Hooks

1. Send email via `Resend`.
2. Update Stripe subscription status.

## Step 5: Verify

1. Check `store.plan_tier` in DB.
2. Verify Store Dashboard shows correct features.
