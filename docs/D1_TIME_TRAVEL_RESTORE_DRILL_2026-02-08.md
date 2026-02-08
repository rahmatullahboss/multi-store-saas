# D1 Time Travel Restore Drill (Staging) — 2026-02-08

এই ডকটার উদ্দেশ্য: production incident হলে “DB restore” কাজ করবে কিনা সেটা **staging-এ prove করা**।

## What We Proved

- `wrangler d1 time-travel info` দিয়ে bookmark পাওয়া যায় (last 30 days)।
- `wrangler d1 time-travel restore` দিয়ে staging DB-কে আগের point-in-time এ ফিরিয়ে আনা যায়।
- Restore করার পর নতুন করা table/data সত্যিই চলে যায় (rollback verified)।

## Drill Steps (Copy/Paste)

### 1) Restore point (bookmark) নিন

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
T0=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
echo "T0=$T0"
npx wrangler d1 time-travel info multi-store-saas-db-staging --env staging --timestamp "$T0" --json
```

Output থেকে `bookmark` কপি করুন।

### 2) Controlled change (safe) করুন

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npx wrangler d1 execute multi-store-saas-db-staging --remote --env staging --command \
  "CREATE TABLE IF NOT EXISTS __restore_drill (id INTEGER PRIMARY KEY AUTOINCREMENT, note TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
   INSERT INTO __restore_drill(note) VALUES('drill:before-restore');"
```

Verify:
```bash
npx wrangler d1 execute multi-store-saas-db-staging --remote --env staging --command \
  "SELECT COUNT(*) AS drill_rows FROM __restore_drill;"
```

### 3) Restore করুন

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npx wrangler d1 time-travel restore multi-store-saas-db-staging --env staging --bookmark "<BOOKMARK_FROM_STEP_1>" --json
```

### 4) Restore verify করুন

```bash
cd /Users/rahmatullahzisan/Desktop/Dev/Multi Store Saas/apps/web
npx wrangler d1 execute multi-store-saas-db-staging --remote --env staging --command \
  "SELECT EXISTS(SELECT 1 FROM sqlite_master WHERE type='table' AND name='__restore_drill') AS has_table;"
```

Expected: `has_table = 0`

## Notes

- Restore করার সময় staging DB কিছুক্ষণ unavailable হতে পারে।
- Production restore করার আগে staging-এ এই drill repeat করা উচিত।

