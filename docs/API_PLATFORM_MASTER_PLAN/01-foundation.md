# Ozzyl API Platform — Part 1: Foundation
> Source: API_PLATFORM_MASTER_PLAN.md v6.0 | Sections 1-3

## 1. Executive Summary

### Vision
আমাদের existing Multi-Store SaaS এর উপরে একটা **API Platform Layer** যোগ করা হবে। যেকোনো WordPress, Shopify, বা custom ওয়েবসাইট আমাদের advanced features subscribe করে use করতে পারবে।

### What We Are Building
```
BEFORE:  Multi-Store SaaS (only our own stores)
AFTER:   Commerce Infrastructure Platform
         → Our stores + WordPress + Shopify + Any website
```

### Analogy
- **Stripe** = Payment infrastructure for the internet
- **Twilio** = Communication infrastructure for the internet
- **Ozzyl** = Commerce infrastructure for Bangladesh 🇧🇩

### Features Available via API
| Feature | Description |
|---------|-------------|
| 🛍️ Product Catalog API | Products, inventory, variants, categories |
| 📦 Order Management API | Create, update, track orders |
| 👤 Customer Analytics | Behavior tracking, segmentation |
| 🤖 AI Recommendations | Vectorize-powered product recommendations |
| 💬 Live Chat Widget | Embeddable chat support widget |
| 📊 Analytics Dashboard | Sales, traffic, conversion data |
| 🚚 Courier Integration | bKash, SSLCommerz payment + courier APIs |
| 📧 Webhook Events | Real-time event notifications |

---

## 2. System Architecture

### Overall System Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                    OZZYL PLATFORM                           │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │  Existing SaaS  │    │     API Platform Layer       │   │
│  │  (Multi-store)  │    │                              │   │
│  │                 │    │  ┌──────────────────────┐    │   │
│  │  • Merchant     │    │  │   API Gateway        │    │   │
│  │    Dashboard    │◄───┤  │   (Hono + CF Worker) │    │   │
│  │  • Storefront   │    │  │                      │    │   │
│  │  • Checkout     │    │  │  Auth → RateLimit →  │    │   │
│  │  • Orders       │    │  │  Scope → Handler     │    │   │
│  │  • Analytics    │    │  └──────────┬───────────┘    │   │
│  └─────────────────┘    │             │                │   │
│                         │  ┌──────────▼───────────┐    │   │
│                         │  │   Integration Layer  │    │   │
│                         │  │                      │    │   │
│                         │  │  • JS SDK (npm)      │    │   │
│                         │  │  • WP Plugin         │    │   │
│                         │  │  • Shopify App       │    │   │
│                         │  │  • Embed Widget      │    │   │
│                         │  └──────────────────────┘    │   │
│                         └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Request Lifecycle (API Key Auth Flow)
```
Client Request
    │
    ▼
[1] Extract Key
    x-api-key: oz_live_abc123...
    │
    ▼
[2] SHA-256 Hash
    never look up raw key
    │
    ▼
[3] KV Cache Check ──HIT──► Return Record (~1ms)
    │MISS
    ▼
[4] D1 Database Lookup (~10ms)
    │
    ▼
[5] Validate: expiry + revocation
    │
    ▼
[6] Scope Check
    required: ["products:read"]
    granted: ["read"] ✓ (hierarchy match)
    │
    ▼
[7] Rate Limit Check (per plan)
    free: 60/min, pro: 1000/min, agency: 10000/min
    │
    ▼
[8] Execute Handler
    │
    ▼
[9] Set Response Headers
    X-RateLimit-Limit: 1000
    X-RateLimit-Remaining: 847
    X-RateLimit-Reset: 1708790460
    │
    ▼
[10] waitUntil: Track usage in D1 (non-blocking)
```

### File Structure (New Files to Create)
```
apps/web/
├── server/
│   ├── api/
│   │   ├── v1/
│   │   │   ├── index.ts              ← API v1 router
│   │   │   ├── products.ts           ← Products endpoints
│   │   │   ├── orders.ts             ← Orders endpoints
│   │   │   ├── customers.ts          ← Customers endpoints
│   │   │   ├── analytics.ts          ← Analytics endpoints
│   │   │   ├── recommendations.ts    ← AI recommendations
│   │   │   └── webhooks.ts           ← Webhook management
│   │   └── public/
│   │       └── index.ts              ← Public (no auth) endpoints
│   ├── middleware/
│   │   ├── api-key-auth.ts           ← API key middleware
│   │   ├── rate-limit.ts             ← Rate limiting
│   │   ├── usage-tracker.ts          ← Usage tracking
│   │   └── scopes.ts                 ← Scope definitions
│   └── services/
│       ├── api-key-generator.ts      ← Key generation
│       ├── webhook-dispatcher.ts     ← Webhook delivery
│       └── usage-aggregator.ts       ← Usage aggregation
├── app/routes/
│   ├── app.developer.tsx             ← Developer dashboard
│   ├── app.developer.api-keys.tsx    ← API key management
│   ├── app.developer.webhooks.tsx    ← Webhook management
│   ├── app.developer.usage.tsx       ← Usage analytics
│   └── api.widget.[storeId].ts       ← Widget serving endpoint
packages/
├── sdk/                              ← @ozzyl/sdk npm package
│   ├── src/
│   │   ├── index.ts
│   │   ├── client.ts
│   │   ├── resources/
│   │   │   ├── products.ts
│   │   │   ├── orders.ts
│   │   │   └── analytics.ts
│   │   └── types.ts
│   ├── package.json
│   └── tsup.config.ts
└── widget/                           ← Embeddable widget
    ├── src/
    │   ├── loader.ts                 ← Async loader snippet
    │   └── widget.ts                 ← Main widget code
    └── package.json
```


---

## 3. Database Schema

### Migration File: `apps/web/migrations/0020_api_platform.sql`

> ⚠️ **Before running**: Check current migration count with:
> ```bash
> ls apps/web/migrations/ | sort | tail -1
> ```
> Rename file to next available number (e.g., `0021_api_platform.sql`) to avoid conflicts.

```sql
-- ============================================================
-- API PLATFORM TABLES
-- ============================================================

-- API Plans (free, pro, agency, enterprise)
CREATE TABLE IF NOT EXISTS api_plans (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  price_bdt   INTEGER NOT NULL DEFAULT 0,
  req_per_min INTEGER NOT NULL DEFAULT 60,
  req_per_day INTEGER NOT NULL DEFAULT 1000,
  webhook_endpoints INTEGER NOT NULL DEFAULT 3,
  scopes      TEXT NOT NULL DEFAULT '["read"]',  -- JSON array
  features    TEXT NOT NULL DEFAULT '{}',         -- JSON object
  created_at  INTEGER NOT NULL DEFAULT (unixepoch())
);

-- ⚠️ price_bdt stored in PAISA (1 taka = 100 paisa) for precision — same as Stripe's approach
-- Free=৳0, Starter=৳999, Pro=৳2999, Agency=৳9999
INSERT INTO api_plans (id, name, price_bdt, req_per_min, req_per_day, webhook_endpoints, scopes) VALUES
  ('free',    'Free',    0,       60,    1000,   3,   '["read"]'),
  ('starter', 'Starter', 99900,   300,   50000,  5,   '["read","write"]'),
  ('pro',     'Pro',     299900,  1000,  200000, 20,  '["read","write","admin"]'),
  ('agency',  'Agency',  999900,  10000, -1,     100, '["read","write","admin","*"]');
-- Display price: price_bdt / 100 = taka. E.g., 99900 / 100 = ৳999

-- API Subscriptions (which store is on which plan)
CREATE TABLE IF NOT EXISTS api_subscriptions (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  store_id    INTEGER NOT NULL UNIQUE,
  plan_id     TEXT NOT NULL DEFAULT 'free',
  status      TEXT NOT NULL DEFAULT 'active', -- active | suspended | cancelled
  trial_ends_at INTEGER,
  current_period_start INTEGER NOT NULL DEFAULT (unixepoch()),
  current_period_end   INTEGER,
  cancelled_at INTEGER,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES api_plans(id)
);

-- API Keys
CREATE TABLE IF NOT EXISTS api_keys (
  id            TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  store_id      INTEGER NOT NULL,
  name          TEXT NOT NULL,                        -- "Mobile App Key"
  key_hash      TEXT NOT NULL UNIQUE,                 -- SHA-256 of raw key, NEVER store raw
  key_prefix    TEXT NOT NULL,                        -- first 12 chars for display: "oz_live_4a7f"
  environment   TEXT NOT NULL DEFAULT 'live',         -- live | test
  scopes        TEXT NOT NULL DEFAULT '["read"]',     -- JSON array
  plan_id       TEXT NOT NULL DEFAULT 'free',         -- denormalized for fast auth lookup
  allowed_origins TEXT,                               -- JSON array of allowed domains, NULL = any
  expires_at    INTEGER,                              -- unix timestamp, NULL = never
  revoked_at    INTEGER,                              -- NULL = active
  last_used_at  INTEGER,
  total_requests INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES api_plans(id)
);

CREATE INDEX IF NOT EXISTS idx_api_keys_store  ON api_keys(store_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash   ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix);

-- API Usage Logs (raw, 90-day retention)
-- ⚠️ HIGH TRAFFIC WARNING: Direct D1 INSERT per request will bottleneck at ~1M req/day.
-- Production recommendation: Use Cloudflare Analytics Engine for real-time metrics
-- (free, unlimited writes, purpose-built for this use case).
-- D1 table below is for audit trail only — written via batched waitUntil every 100 requests.
-- See Section 17 (Usage Tracking) for Analytics Engine implementation.
CREATE TABLE IF NOT EXISTS api_usage_logs (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  key_id      TEXT NOT NULL,
  store_id    INTEGER NOT NULL,
  endpoint    TEXT NOT NULL,       -- "/v1/products"
  method      TEXT NOT NULL,       -- GET | POST | etc.
  status_code INTEGER NOT NULL,
  latency_ms  INTEGER,
  ip_address  TEXT,
  user_agent  TEXT,
  request_id  TEXT,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_usage_key     ON api_usage_logs(key_id, created_at);
CREATE INDEX IF NOT EXISTS idx_usage_store   ON api_usage_logs(store_id, created_at);

-- API Usage Hourly Aggregates (2-year retention)
CREATE TABLE IF NOT EXISTS api_usage_hourly (
  key_id      TEXT NOT NULL,
  store_id    INTEGER NOT NULL,
  hour_bucket INTEGER NOT NULL,   -- unix timestamp truncated to hour
  total_reqs  INTEGER NOT NULL DEFAULT 0,
  success_reqs INTEGER NOT NULL DEFAULT 0,
  error_reqs  INTEGER NOT NULL DEFAULT 0,
  avg_latency_ms INTEGER,
  PRIMARY KEY (key_id, hour_bucket),
  FOREIGN KEY (key_id) REFERENCES api_keys(id) ON DELETE CASCADE
);

-- Webhook Endpoints (registered by merchants)
CREATE TABLE IF NOT EXISTS webhook_endpoints (
  id          TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  store_id    INTEGER NOT NULL,
  url         TEXT NOT NULL,
  secret      TEXT NOT NULL,       -- HMAC signing secret (store via AES-GCM encrypted in KV, reference only ID here)
  -- ⚠️ D1 does NOT provide at-rest encryption on free/paid plans (only Enterprise).
  -- For production: store encrypted secret in KV, store only a key reference in D1.
  events      TEXT NOT NULL,       -- JSON array: ["order.created", "product.updated"]
  status      TEXT NOT NULL DEFAULT 'active',  -- active | disabled
  failure_count INTEGER NOT NULL DEFAULT 0,
  last_success_at INTEGER,
  last_failure_at INTEGER,
  created_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_webhooks_store ON webhook_endpoints(store_id);

-- Webhook Deliveries (audit log)
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  endpoint_id  TEXT NOT NULL,
  store_id     INTEGER NOT NULL,
  event_type   TEXT NOT NULL,      -- "order.created"
  payload      TEXT NOT NULL,      -- JSON body sent
  response_status INTEGER,
  response_body TEXT,
  attempt_count INTEGER NOT NULL DEFAULT 1,
  delivered_at INTEGER,
  next_retry_at INTEGER,
  status       TEXT NOT NULL DEFAULT 'pending', -- pending | delivered | failed | abandoned
  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (endpoint_id) REFERENCES webhook_endpoints(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_deliveries_endpoint ON webhook_deliveries(endpoint_id, created_at);
CREATE INDEX IF NOT EXISTS idx_deliveries_retry    ON webhook_deliveries(next_retry_at) WHERE status = 'pending';
```

---

