# 🏗️ Ozzyl Commerce Infrastructure Platform
## Enterprise-Grade API-as-a-Service — Complete Master Plan

> **Last Updated**: 2026-02-24  
> **Status**: Planning Phase  
> **Owner**: Ozzyl Engineering Team

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Database Schema](#database-schema)
4. [API Key System](#api-key-system)
5. [Public API Routes](#public-api-routes)
6. [Security Architecture](#security-architecture)
7. [JavaScript SDK](#javascript-sdk)
8. [WordPress Plugin](#wordpress-plugin)
9. [Webhook System](#webhook-system)
10. [Business Model & Pricing](#business-model--pricing)
11. [Phased Roadmap](#phased-roadmap)
12. [Developer Experience (DX)](#developer-experience-dx)
13. [Infrastructure & Ops](#infrastructure--ops)
14. [Coding Standards](#coding-standards)

---

## Executive Summary

আমাদের বর্তমান **Multi-store SaaS** এর উপরে একটি **Public API Layer** যোগ করলে এটি পরিণত হবে **"Bangladesh Commerce Infrastructure Platform"** এ।

**ধারণা:** Stripe যেমন payment infrastructure দেয়, আমরা দেব **commerce intelligence infrastructure** — Analytics, AI Recommendations, Abandoned Cart Recovery, Multi-courier, Payments, Chat — সব কিছু API/Plugin হিসেবে যেকোনো সাইটে।

**Target Market:**
- 🇧🇩 বাংলাদেশে ৫০,০০০+ WordPress/WooCommerce সাইট
- হাজারো Shopify merchant যাদের bKash/Nagad integration নেই
- Custom website যাদের analytics/AI tools নেই

**Value Proposition:**
> *"আপনার WordPress বা যেকোনো সাইটে Shopify Plus-level features — মাত্র ৳৯৯৯/মাস এ"*

---

## System Architecture

### Overall System Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         OZZYL PLATFORM                              │
│                                                                     │
│  ┌──────────────────┐    ┌─────────────────────────────────────┐   │
│  │  Existing SaaS   │    │       NEW: Public API Layer          │   │
│  │  (Multi-store)   │    │                                     │   │
│  │                  │    │   api.ozzyl.com/v1/                 │   │
│  │  - Dashboard     │    │   ├── /analytics                    │   │
│  │  - Products      │    │   ├── /recommendations              │   │
│  │  - Orders        │◄───│   ├── /abandoned-cart               │   │
│  │  - Analytics     │    │   ├── /courier                      │   │
│  │  - AI Tools      │    │   ├── /payments                     │   │
│  │  - Campaigns     │    │   ├── /chat                         │   │
│  └──────────────────┘    │   ├── /webhooks                     │   │
│                          │   └── /events                       │   │
│                          └─────────────────────────────────────┘   │
│                                       │                             │
│               ┌───────────────────────┼──────────────────┐         │
│               │                       │                  │         │
│          ┌────▼────┐           ┌──────▼────┐      ┌─────▼─────┐   │
│          │   WP    │           │  Shopify  │      │ Custom JS │   │
│          │ Plugin  │           │    App    │      │    SDK    │   │
│          └─────────┘           └───────────┘      └───────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### New File Structure

```
apps/web/
├── server/
│   ├── api/
│   │   ├── v1/                          ← Public API routes
│   │   │   ├── index.ts                 🆕 Route aggregator
│   │   │   ├── analytics.ts             🆕 Analytics endpoints
│   │   │   ├── recommendations.ts       🆕 AI recommendations
│   │   │   ├── abandoned-cart.ts        🆕 Cart recovery
│   │   │   ├── webhooks.ts              🆕 Webhook management
│   │   │   ├── courier.ts               🆕 Courier rates/tracking
│   │   │   ├── chat.ts                  🆕 Chat/messaging
│   │   │   └── events.ts               🆕 Event tracking
│   │   ├── products.ts                  ✅ exists
│   │   ├── orders.ts                    ✅ exists
│   │   └── stores.ts                    ✅ exists
│   │
│   ├── middleware/
│   │   ├── api-key-auth.ts              🆕 API key validation
│   │   ├── domain-allowlist.ts          🆕 Domain locking
│   │   ├── usage-tracker.ts             🆕 Billing metering
│   │   ├── plan-guard.ts               🆕 Feature gate by plan
│   │   ├── rate-limit.ts               ✅ exists (enhance)
│   │   └── tenant.ts                   ✅ exists
│   │
│   ├── lib/
│   │   ├── api-keys.ts                  🆕 Key generation/hashing
│   │   ├── webhook-dispatcher.ts        🆕 Outbound webhook sender
│   │   └── usage-aggregator.ts          🆕 Usage stats aggregation
│   │
│   └── index.ts                         ✅ exists (add v1 mount)

packages/
├── js-sdk/                              🆕 npm: @ozzyl/sdk
│   ├── src/
│   │   ├── index.ts
│   │   ├── client.ts
│   │   ├── analytics.ts
│   │   ├── recommendations.ts
│   │   ├── cart.ts
│   │   ├── events.ts
│   │   └── widget.ts
│   └── package.json
│
└── wp-plugin/                           🆕 WordPress.org plugin
    ├── ozzyl-commerce.php
    ├── includes/
    │   ├── class-api-client.php
    │   ├── class-woocommerce.php
    │   └── class-widget.php
    └── assets/

apps/web/app/routes/
├── api.v1.products.ts                   ✅ exists
├── api.v1.orders.ts                     ✅ exists
├── api.v1.orders.$id.ts                 ✅ exists
├── api.v1.analytics.ts                  🆕
├── api.v1.recommendations.ts            🆕
├── api.v1.abandoned-cart.ts             🆕
├── api.v1.webhooks.ts                   🆕
├── api.v1.events.ts                     🆕
└── app.settings.developer.tsx           ✅ exists (enhance)
```

### Request Lifecycle

```
Third-party site request
         │
         ▼
[1] Cloudflare WAF (DDoS/Bot protection)
         │
         ▼
[2] Hono Server (apps/web/server/index.ts)
         │
         ▼
[3] API Key Auth Middleware
    ├── Extract Bearer token
    ├── Hash & DB lookup
    ├── Check expiry + domain allowlist
    └── Set storeId in context
         │
         ▼
[4] Plan Guard Middleware
    ├── Check active subscription
    ├── Check feature access
    └── Check quota remaining
         │
         ▼
[5] Rate Limit Middleware (per API key)
         │
         ▼
[6] Usage Tracker (async, non-blocking)
         │
         ▼
[7] Route Handler
    └── All DB queries scoped by storeId ← CRITICAL
         │
         ▼
[8] Response + Rate Limit Headers
```

---

## Database Schema

### নতুন Tables (Migration করতে হবে)

```sql
-- ============================================================
-- 1. API Keys
-- ============================================================
CREATE TABLE api_keys (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id        INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  key_hash        TEXT NOT NULL UNIQUE,       -- SHA-256 hash (never store plain)
  key_prefix      TEXT NOT NULL,              -- "ozzyl_live_"
  key_preview     TEXT NOT NULL,              -- "...xK9m" (last 4 chars)
  environment     TEXT NOT NULL DEFAULT 'live', -- 'live' | 'test'
  allowed_domains TEXT,                       -- JSON: ["myshop.com","www.myshop.com"]
  allowed_ips     TEXT,                       -- JSON: ["103.x.x.x"] (optional)
  scopes          TEXT NOT NULL DEFAULT '["read"]', -- JSON: ["read","write","webhooks"]
  is_active       INTEGER NOT NULL DEFAULT 1,
  last_used_at    DATETIME,
  expires_at      DATETIME,                   -- NULL = never expires
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at      DATETIME,
  revoked_by      INTEGER REFERENCES users(id),
  description     TEXT,
  tags            TEXT                        -- JSON: ["wordpress","production"]
);
CREATE INDEX idx_api_keys_store ON api_keys(store_id, is_active);
CREATE INDEX idx_api_keys_hash  ON api_keys(key_hash);

-- ============================================================
-- 2. API Usage (Billing Metering)
-- ============================================================
CREATE TABLE api_usage (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id      INTEGER NOT NULL,
  api_key_id    INTEGER NOT NULL REFERENCES api_keys(id),
  endpoint      TEXT NOT NULL,               -- "/v1/analytics/overview"
  method        TEXT NOT NULL,               -- "GET"
  status_code   INTEGER NOT NULL,
  response_ms   INTEGER,
  request_size  INTEGER,
  response_size INTEGER,
  ip_address    TEXT,
  user_agent    TEXT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_usage_store_date ON api_usage(store_id, created_at);
CREATE INDEX idx_usage_key_date   ON api_usage(api_key_id, created_at);

-- ============================================================
-- 3. Outbound Webhooks
-- ============================================================
CREATE TABLE webhooks (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id        INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  api_key_id      INTEGER REFERENCES api_keys(id),
  url             TEXT NOT NULL,
  events          TEXT NOT NULL,             -- JSON: ["order.created","product.updated"]
  secret          TEXT NOT NULL,             -- HMAC signing secret
  is_active       INTEGER NOT NULL DEFAULT 1,
  failure_count   INTEGER NOT NULL DEFAULT 0,
  last_success_at DATETIME,
  last_failure_at DATETIME,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE webhook_deliveries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  webhook_id    INTEGER NOT NULL REFERENCES webhooks(id),
  event_type    TEXT NOT NULL,
  payload       TEXT NOT NULL,              -- JSON payload
  status        TEXT NOT NULL DEFAULT 'pending', -- pending|delivered|failed
  attempts      INTEGER NOT NULL DEFAULT 0,
  next_retry_at DATETIME,
  response_code INTEGER,
  response_body TEXT,
  delivered_at  DATETIME,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_deliveries_webhook ON webhook_deliveries(webhook_id, status);
CREATE INDEX idx_deliveries_retry   ON webhook_deliveries(next_retry_at, status);

-- ============================================================
-- 4. API Plans & Subscriptions
-- ============================================================
CREATE TABLE api_plans (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,             -- "Starter", "Pro", "Agency"
  slug           TEXT NOT NULL UNIQUE,      -- "starter", "pro", "agency"
  monthly_price  INTEGER NOT NULL,          -- BDT paisa (99900 = ৳999)
  request_limit  INTEGER NOT NULL,          -- requests/month (0 = unlimited)
  webhook_limit  INTEGER NOT NULL DEFAULT 5,
  api_key_limit  INTEGER NOT NULL DEFAULT 3,
  features       TEXT NOT NULL,             -- JSON: ["analytics","recommendations"]
  is_active      INTEGER NOT NULL DEFAULT 1,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE api_subscriptions (
  id                   INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id             INTEGER NOT NULL REFERENCES stores(id),
  plan_id              INTEGER NOT NULL REFERENCES api_plans(id),
  status               TEXT NOT NULL DEFAULT 'active', -- active|cancelled|past_due
  current_period_start DATETIME NOT NULL,
  current_period_end   DATETIME NOT NULL,
  requests_used        INTEGER NOT NULL DEFAULT 0,
  created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_subscriptions_store ON api_subscriptions(store_id, status);

-- ============================================================
-- 5. Seed: Default Plans
-- ============================================================
INSERT INTO api_plans (name, slug, monthly_price, request_limit, webhook_limit, api_key_limit, features) VALUES
  ('Free',    'free',    0,       1000,    2,   1,  '["analytics"]'),
  ('Starter', 'starter', 99900,   50000,   10,  3,  '["analytics","recommendations","abandoned_cart"]'),
  ('Pro',     'pro',     299900,  500000,  50,  10, '["analytics","recommendations","abandoned_cart","ai_tools","courier","chat"]'),
  ('Agency',  'agency',  999900,  0,       200, 50, '["*"]');
```


---

## API Key System

### Key Generation Utility

```typescript
// apps/web/server/lib/api-keys.ts

export interface GeneratedKey {
  plaintext: string;  // Show ONCE to user: "ozzyl_live_abc123...xyz"
  hash: string;       // Store in DB (SHA-256)
  prefix: string;     // "ozzyl_live_"
  preview: string;    // "...xK9m" (last 4 chars)
}

/**
 * Generate a cryptographically secure API key
 * Format: ozzyl_{env}_{32 random bytes as hex}
 * Example: ozzyl_live_a1b2c3d4e5f6789...
 */
export async function generateApiKey(environment: 'live' | 'test' = 'live'): Promise<GeneratedKey> {
  const prefix = `ozzyl_${environment}_`;
  
  // Cloudflare Workers compatible (Web Crypto API)
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const randomPart = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  
  const plaintext = `${prefix}${randomPart}`;
  const hash = await hashApiKey(plaintext);
  const preview = `...${randomPart.slice(-4)}`;
  
  return { plaintext, hash, prefix, preview };
}

/**
 * Hash an API key for DB storage/lookup (SHA-256)
 */
export async function hashApiKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Validate API key format before hashing
 */
export function validateApiKeyFormat(key: string): boolean {
  return /^ozzyl_(live|test)_[a-f0-9]{64}$/.test(key);
}
```

### API Key Auth Middleware

```typescript
// apps/web/server/middleware/api-key-auth.ts

import { Context, MiddlewareHandler } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and } from 'drizzle-orm';
import { apiKeys, apiSubscriptions, apiPlans } from '@db/schema';
import { hashApiKey, validateApiKeyFormat } from '../lib/api-keys';

export const apiKeyAuth = (requiredScope?: string): MiddlewareHandler => {
  return async (c: Context, next) => {
    // 1. Extract key from Authorization header
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ozzyl_')) {
      return c.json({
        error: 'Missing or invalid Authorization header',
        hint: 'Use: Authorization: Bearer ozzyl_live_your_key',
        docs: 'https://docs.ozzyl.com/api/authentication'
      }, 401);
    }

    const plainKey = authHeader.replace('Bearer ', '').trim();

    // 2. Validate format
    if (!validateApiKeyFormat(plainKey)) {
      return c.json({ error: 'Invalid API key format' }, 401);
    }

    const keyHash = await hashApiKey(plainKey);
    const db = drizzle(c.env.DB);

    // 3. DB lookup
    const [keyRecord] = await db
      .select()
      .from(apiKeys)
      .where(and(eq(apiKeys.keyHash, keyHash), eq(apiKeys.isActive, 1)))
      .limit(1);

    if (!keyRecord) {
      return c.json({ error: 'Invalid or revoked API key' }, 401);
    }

    // 4. Check expiry
    if (keyRecord.expiresAt && new Date(keyRecord.expiresAt) < new Date()) {
      return c.json({ error: 'API key has expired' }, 401);
    }

    // 5. Domain allowlist check
    const origin = c.req.header('Origin') || c.req.header('Referer');
    if (keyRecord.allowedDomains && origin) {
      const allowed: string[] = JSON.parse(keyRecord.allowedDomains);
      if (allowed.length > 0) {
        try {
          const originHost = new URL(origin).hostname;
          const isDomainAllowed = allowed.some(d =>
            originHost === d || originHost.endsWith(`.${d}`)
          );
          if (!isDomainAllowed) {
            return c.json({
              error: 'Request origin not allowed for this API key',
              hint: 'Add your domain in Ozzyl Dashboard → Developer → API Keys'
            }, 403);
          }
        } catch {
          return c.json({ error: 'Invalid origin header' }, 400);
        }
      }
    }

    // 6. Scope check
    if (requiredScope) {
      const scopes: string[] = JSON.parse(keyRecord.scopes);
      if (!scopes.includes(requiredScope) && !scopes.includes('*')) {
        return c.json({
          error: `This API key does not have '${requiredScope}' scope`,
          docs: 'https://docs.ozzyl.com/api/scopes'
        }, 403);
      }
    }

    // 7. Check active subscription
    const [subscription] = await db
      .select({ id: apiSubscriptions.id, requestsUsed: apiSubscriptions.requestsUsed, planId: apiSubscriptions.planId })
      .from(apiSubscriptions)
      .where(and(
        eq(apiSubscriptions.storeId, keyRecord.storeId),
        eq(apiSubscriptions.status, 'active')
      ))
      .limit(1);

    if (!subscription) {
      return c.json({
        error: 'No active API subscription',
        hint: 'Subscribe at https://ozzyl.com/pricing/api'
      }, 402);
    }

    // 8. Check quota
    const [plan] = await db
      .select({ requestLimit: apiPlans.requestLimit, features: apiPlans.features })
      .from(apiPlans)
      .where(eq(apiPlans.id, subscription.planId))
      .limit(1);

    if (plan && plan.requestLimit > 0 && subscription.requestsUsed >= plan.requestLimit) {
      return c.json({
        error: 'Monthly request quota exceeded',
        hint: 'Upgrade your plan at https://ozzyl.com/pricing/api',
        quota: { limit: plan.requestLimit, used: subscription.requestsUsed }
      }, 429);
    }

    // 9. Update last_used_at async (non-blocking)
    c.executionCtx?.waitUntil(
      db.update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, keyRecord.id))
        .execute()
    );

    // 10. Set context variables (all downstream handlers use these)
    c.set('apiKeyId', keyRecord.id);
    c.set('storeId', keyRecord.storeId);
    c.set('apiScopes', JSON.parse(keyRecord.scopes));
    c.set('apiEnvironment', keyRecord.environment);
    c.set('planFeatures', plan ? JSON.parse(plan.features) : []);

    return next();
  };
};
```

### Usage Tracker Middleware

```typescript
// apps/web/server/middleware/usage-tracker.ts

import { MiddlewareHandler } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { apiUsage, apiSubscriptions } from '@db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * Tracks API usage for billing metering.
 * Runs AFTER route handler (non-blocking via waitUntil).
 */
export const usageTracker = (): MiddlewareHandler => {
  return async (c, next) => {
    const start = Date.now();
    await next();
    const responseMs = Date.now() - start;

    const apiKeyId = c.get('apiKeyId') as number | undefined;
    const storeId = c.get('storeId') as number | undefined;

    if (!apiKeyId || !storeId) return;

    const url = new URL(c.req.url);

    c.executionCtx?.waitUntil(
      (async () => {
        const db = drizzle(c.env.DB);
        await db.batch([
          // Log usage record
          db.insert(apiUsage).values({
            storeId,
            apiKeyId,
            endpoint: url.pathname,
            method: c.req.method,
            statusCode: c.res.status,
            responseMs,
            ipAddress: c.req.header('cf-connecting-ip') || null,
            userAgent: c.req.header('user-agent') || null,
            createdAt: new Date(),
          }),
          // Increment requests_used counter
          db.update(apiSubscriptions)
            .set({ requestsUsed: sql`requests_used + 1` })
            .where(eq(apiSubscriptions.storeId, storeId)),
        ]);
      })()
    );
  };
};
```


---

## Security Architecture

### Defense in Depth — 7 Layers

```
Third-party request
        │
        ▼
┌─────────────────────────────────┐
│  Layer 1: Cloudflare WAF        │ ← DDoS, bot protection, IP reputation
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│  Layer 2: TLS 1.3               │ ← All traffic encrypted, HSTS
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│  Layer 3: API Key Auth          │ ← SHA-256 hash, expiry, format check
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│  Layer 4: Domain Allowlist      │ ← Origin must match registered domains
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│  Layer 5: Subscription Gate     │ ← Active plan + quota check
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│  Layer 6: Rate Limiting         │ ← Per API key, plan-based limits
└────────────────┬────────────────┘
                 ▼
┌─────────────────────────────────┐
│  Layer 7: Tenant Isolation      │ ← storeId from API key, never from client
└─────────────────────────────────┘
```

### Critical Security Rules

```typescript
// 🔴 RULE 1: storeId সবসময় API key থেকে, কখনো client থেকে নয়
// ❌ WRONG
const storeId = c.req.query('store_id'); // client manipulate করতে পারে!
// ✅ CORRECT
const storeId = c.get('storeId'); // middleware verified করেছে

// 🔴 RULE 2: সব DB queries must be scoped by storeId
// ❌ WRONG
const orders = await db.select().from(ordersTable); // data leak!
// ✅ CORRECT
const orders = await db.select().from(ordersTable)
  .where(eq(ordersTable.storeId, storeId));

// 🔴 RULE 3: Outbound webhooks must be HMAC signed
async function signWebhookPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return 'sha256=' + Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

// 🔴 RULE 4: Webhook replay attack prevention
function isWebhookFresh(timestamp: string, maxAgeMs = 5 * 60 * 1000): boolean {
  return Math.abs(Date.now() - parseInt(timestamp)) < maxAgeMs;
}

// 🔴 RULE 5: API keys never stored in plaintext — SHA-256 only
// 🔴 RULE 6: Plaintext key shown EXACTLY ONCE at creation time
// 🔴 RULE 7: Domain-locked keys — prevent key theft/reuse on other domains
```

### Security Headers for Public API

```typescript
// apps/web/server/middleware/security.ts — extend existing

export const publicApiSecurityHeaders = (): MiddlewareHandler => {
  return async (c, next) => {
    await next();
    c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    c.header('X-Content-Type-Options', 'nosniff');
    c.header('X-Frame-Options', 'DENY');
    c.header('Referrer-Policy', 'no-referrer');
    c.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    // No CSP for API — it's JSON only, not HTML
  };
};
```

### Webhook Signature Verification (for Receivers)

```typescript
// Customers এর site এ এটা দিয়ে webhook verify করবে
// packages/js-sdk/src/webhook.ts

export async function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string,
  timestamp: string | null,
  maxAgeMs = 5 * 60 * 1000
): Promise<{ valid: boolean; error?: string }> {
  if (!signature || !timestamp) {
    return { valid: false, error: 'Missing signature or timestamp' };
  }

  // Replay attack check
  if (Math.abs(Date.now() - parseInt(timestamp)) > maxAgeMs) {
    return { valid: false, error: 'Webhook expired (>5 min old)' };
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  const expected = 'sha256=' + Array.from(new Uint8Array(signatureBytes))
    .map(b => b.toString(16).padStart(2, '0')).join('');

  return { valid: signature === expected };
}
```

---

## Public API Routes

### Route Aggregator

```typescript
// apps/web/server/api/v1/index.ts

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apiKeyAuth } from '../../middleware/api-key-auth';
import { usageTracker } from '../../middleware/usage-tracker';
import { rateLimit } from '../../middleware/rate-limit';
import { analyticsRoutes } from './analytics';
import { recommendationsRoutes } from './recommendations';
import { abandonedCartRoutes } from './abandoned-cart';
import { webhookRoutes } from './webhooks';
import { courierRoutes } from './courier';
import { chatRoutes } from './chat';
import { eventsRoutes } from './events';

const v1 = new Hono();

// Public CORS (domain check হয় API key middleware এ)
v1.use('*', cors({
  origin: '*',
  allowHeaders: ['Authorization', 'Content-Type', 'X-Ozzyl-Version'],
  exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset', 'X-Request-Id'],
}));

// API Key auth — সব v1 routes এ mandatory
v1.use('*', apiKeyAuth());

// Per-key rate limiting
v1.use('*', rateLimit({ limit: 300, windowMs: 60, keyPrefix: 'v1', keyGenerator: (c) => `${c.get('apiKeyId')}` }));

// Usage tracking (billing metering — async, non-blocking)
v1.use('*', usageTracker());

// Version header
v1.use('*', async (c, next) => { await next(); c.header('X-Ozzyl-Version', '2026-02'); });

// Mount feature routes
v1.route('/analytics',       analyticsRoutes);
v1.route('/recommendations', recommendationsRoutes);
v1.route('/abandoned-cart',  abandonedCartRoutes);
v1.route('/webhooks',        webhookRoutes);
v1.route('/courier',         courierRoutes);
v1.route('/chat',            chatRoutes);
v1.route('/events',          eventsRoutes);

// Meta info
v1.get('/', (c) => c.json({
  version: '1.0',
  docs: 'https://docs.ozzyl.com/api',
  status: 'https://status.ozzyl.com',
  endpoints: [
    'GET  /v1/analytics/overview',
    'GET  /v1/analytics/products',
    'GET  /v1/analytics/customers',
    'GET  /v1/recommendations',
    'POST /v1/recommendations/track',
    'POST /v1/abandoned-cart/track',
    'GET  /v1/abandoned-cart',
    'POST /v1/abandoned-cart/:id/recover',
    'POST /v1/webhooks',
    'GET  /v1/webhooks',
    'DELETE /v1/webhooks/:id',
    'GET  /v1/courier/rates',
    'GET  /v1/courier/track/:tracking_id',
    'POST /v1/chat/message',
    'POST /v1/events/track',
  ]
}));

export { v1 as publicApiV1 };
```

### Analytics API

```typescript
// apps/web/server/api/v1/analytics.ts

import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, gte, lte, sql, desc } from 'drizzle-orm';
import { orders, products, storeVisits } from '@db/schema';
import { z } from 'zod';

const analyticsRoutes = new Hono();

// GET /v1/analytics/overview
analyticsRoutes.get('/overview', async (c) => {
  const storeId = c.get('storeId') as number;
  const db = drizzle(c.env.DB);
  const period = c.req.query('period') || 'last_30_days';

  const { from, to } = parsePeriod(period);

  const [revenueResult, ordersResult, visitorsResult] = await db.batch([
    db.select({
      total: sql<number>`COALESCE(SUM(total_amount), 0)`,
    }).from(orders).where(and(
      eq(orders.storeId, storeId),
      eq(orders.status, 'completed'),
      gte(orders.createdAt, from),
      lte(orders.createdAt, to)
    )),
    db.select({
      total: sql<number>`COUNT(*)`,
      completed: sql<number>`SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END)`,
      cancelled: sql<number>`SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END)`,
    }).from(orders).where(and(
      eq(orders.storeId, storeId),
      gte(orders.createdAt, from),
      lte(orders.createdAt, to)
    )),
    db.select({
      total: sql<number>`COUNT(*)`,
      unique: sql<number>`COUNT(DISTINCT visitor_id)`,
    }).from(storeVisits).where(and(
      eq(storeVisits.storeId, storeId),
      gte(storeVisits.createdAt, from),
      lte(storeVisits.createdAt, to)
    )),
  ]);

  const revenue = revenueResult[0]?.total || 0;
  const totalOrders = ordersResult[0]?.total || 0;
  const visitors = visitorsResult[0]?.total || 0;

  return c.json({
    period,
    from: from.toISOString(),
    to: to.toISOString(),
    revenue: {
      total: revenue,
      currency: 'BDT',
    },
    orders: {
      total: totalOrders,
      completed: ordersResult[0]?.completed || 0,
      cancelled: ordersResult[0]?.cancelled || 0,
    },
    visitors: {
      total: visitors,
      unique: visitorsResult[0]?.unique || 0,
    },
    conversion_rate: visitors > 0
      ? `${((totalOrders / visitors) * 100).toFixed(2)}%`
      : '0.00%',
  });
});

// GET /v1/analytics/products?sort=revenue&limit=10
analyticsRoutes.get('/products', async (c) => {
  const storeId = c.get('storeId') as number;
  const db = drizzle(c.env.DB);
  const limit = Math.min(parseInt(c.req.query('limit') || '10'), 100);
  const sort = c.req.query('sort') || 'revenue'; // revenue | orders | views

  const topProducts = await db
    .select({
      id: products.id,
      name: products.name,
      image: products.image,
      price: products.price,
      totalOrders: sql<number>`COUNT(DISTINCT oi.order_id)`,
      totalRevenue: sql<number>`COALESCE(SUM(oi.price * oi.quantity), 0)`,
    })
    .from(products)
    .leftJoin(sql`order_items oi`, sql`oi.product_id = ${products.id}`)
    .where(eq(products.storeId, storeId))
    .groupBy(products.id)
    .orderBy(sort === 'orders'
      ? desc(sql`COUNT(DISTINCT oi.order_id)`)
      : desc(sql`SUM(oi.price * oi.quantity)`))
    .limit(limit);

  return c.json({ products: topProducts });
});

function parsePeriod(period: string): { from: Date; to: Date } {
  const to = new Date();
  const from = new Date();
  switch (period) {
    case 'today':       from.setHours(0, 0, 0, 0); break;
    case 'last_7_days': from.setDate(from.getDate() - 7); break;
    case 'last_30_days': from.setDate(from.getDate() - 30); break;
    case 'last_90_days': from.setDate(from.getDate() - 90); break;
    default:            from.setDate(from.getDate() - 30);
  }
  return { from, to };
}

export { analyticsRoutes };
```

### Recommendations API (AI-powered)

```typescript
// apps/web/server/api/v1/recommendations.ts

import { Hono } from 'hono';

const recommendationsRoutes = new Hono();

// GET /v1/recommendations?product_id=123&strategy=similar&limit=8
recommendationsRoutes.get('/', async (c) => {
  const storeId = c.get('storeId') as number;
  const productId = c.req.query('product_id');
  const customerId = c.req.query('customer_id');
  const strategy = c.req.query('strategy') || 'similar'; // similar|personalized|trending|bought_together
  const limit = Math.min(parseInt(c.req.query('limit') || '8'), 20);

  // Use Vectorize for semantic similarity
  let embedding: number[] | null = null;

  if (productId && c.env.VECTORIZE) {
    const results = await c.env.VECTORIZE.query(
      await getProductEmbedding(productId, storeId, c.env),
      {
        topK: limit + 1, // +1 to exclude self
        filter: { storeId: { $eq: storeId } },
        returnMetadata: 'all',
      }
    );

    const productIds = results.matches
      .filter(m => m.metadata?.productId !== productId)
      .slice(0, limit)
      .map(m => m.metadata?.productId as string);

    return c.json({
      strategy,
      product_id: productId,
      products: productIds.map(id => ({ id })), // Full product fetch from DB in real impl
      request_id: crypto.randomUUID(),
    });
  }

  return c.json({ strategy, products: [], request_id: crypto.randomUUID() });
});

// POST /v1/recommendations/track
recommendationsRoutes.post('/track', async (c) => {
  const storeId = c.get('storeId') as number;
  const body = await c.req.json();
  // Track recommendation clicks/purchases for model improvement
  c.executionCtx?.waitUntil(
    trackRecommendationEvent(storeId, body, c.env)
  );
  return c.json({ success: true });
});

async function getProductEmbedding(productId: string, storeId: number, env: any): Promise<number[]> {
  // Fetch from Vectorize or generate on-demand
  return new Array(768).fill(0); // placeholder
}

async function trackRecommendationEvent(storeId: number, data: any, env: any): Promise<void> {
  // Store event for ML training
}

export { recommendationsRoutes };
```

### Events API (Client-side tracking)

```typescript
// apps/web/server/api/v1/events.ts
// POST /v1/events/track

/*
Supported events:
  product_viewed    { product_id, price, category }
  product_added     { product_id, quantity, price }
  checkout_started  { cart_value, item_count }
  order_completed   { order_id, total, items }
  search_performed  { query, results_count }
  page_viewed       { path, referrer }
*/
```

### Webhook Management API

```typescript
// POST /v1/webhooks — Register a new webhook
// Body:
// {
//   "url": "https://mysite.com/webhooks/ozzyl",
//   "events": ["order.created", "order.updated", "product.updated"],
//   "secret": "optional_custom_secret"
// }

// GET  /v1/webhooks         — List webhooks
// GET  /v1/webhooks/:id     — Get webhook details + delivery stats
// PUT  /v1/webhooks/:id     — Update webhook
// DELETE /v1/webhooks/:id   — Delete webhook
// POST /v1/webhooks/:id/test — Send test event

// Supported Events:
// order.created, order.updated, order.cancelled, order.refunded
// product.created, product.updated, product.deleted, product.low_stock
// customer.created, customer.updated
// abandoned_cart.detected, abandoned_cart.recovered
// payment.received, payment.failed
```


---

## JavaScript SDK

### Package: `@ozzyl/sdk`

```typescript
// packages/js-sdk/src/index.ts
// npm install @ozzyl/sdk

export { Ozzyl } from './client';
export { verifyWebhookSignature } from './webhook';
export type { OzzylConfig, AnalyticsOverview, Recommendation, CartItem } from './types';
```

```typescript
// packages/js-sdk/src/client.ts

export interface OzzylConfig {
  apiKey: string;
  environment?: 'production' | 'sandbox';
  baseUrl?: string;
  timeout?: number;
}

export class Ozzyl {
  private config: Required<OzzylConfig>;

  constructor(config: OzzylConfig) {
    if (!config.apiKey.startsWith('ozzyl_')) {
      throw new Error('Invalid Ozzyl API key format');
    }
    this.config = {
      environment: 'production',
      baseUrl: 'https://api.ozzyl.com',
      timeout: 10000,
      ...config,
    };
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.config.baseUrl}/v1${path}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'X-Ozzyl-Version': '2026-02',
          'X-SDK-Version': '1.0.0',
          ...options.headers,
        },
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: res.statusText }));
        throw new OzzylError(error.error || 'API request failed', res.status, error);
      }

      return res.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ─── Analytics ─────────────────────────────────────────────────
  analytics = {
    overview: (params?: { period?: string }) =>
      this.request<AnalyticsOverview>(`/analytics/overview${params?.period ? `?period=${params.period}` : ''}`),
    products: (params?: { sort?: string; limit?: number }) =>
      this.request<{ products: any[] }>(`/analytics/products?${new URLSearchParams(params as any)}`),
    customers: () =>
      this.request<any>('/analytics/customers'),
  };

  // ─── Recommendations ───────────────────────────────────────────
  recommendations = {
    getSimilar: (params: { productId: string; limit?: number }) =>
      this.request<{ products: Recommendation[] }>(
        `/recommendations?product_id=${params.productId}&strategy=similar&limit=${params.limit || 8}`
      ),
    getPersonalized: (params: { customerId: string; limit?: number }) =>
      this.request<{ products: Recommendation[] }>(
        `/recommendations?customer_id=${params.customerId}&strategy=personalized&limit=${params.limit || 8}`
      ),
    getTrending: (params?: { limit?: number }) =>
      this.request<{ products: Recommendation[] }>(
        `/recommendations?strategy=trending&limit=${params?.limit || 8}`
      ),
    track: (data: { productId: string; event: 'click' | 'purchase'; customerId?: string }) =>
      this.request('/recommendations/track', { method: 'POST', body: JSON.stringify(data) }),
  };

  // ─── Cart Recovery ──────────────────────────────────────────────
  cart = {
    track: (data: { sessionId: string; items: CartItem[]; total: number; customerEmail?: string }) =>
      this.request('/abandoned-cart/track', { method: 'POST', body: JSON.stringify(data) }),
    list: (params?: { status?: string; limit?: number }) =>
      this.request<any>(`/abandoned-cart?${new URLSearchParams(params as any)}`),
    recover: (cartId: string, channel: 'email' | 'sms') =>
      this.request(`/abandoned-cart/${cartId}/recover`, { method: 'POST', body: JSON.stringify({ channel }) }),
  };

  // ─── Events ────────────────────────────────────────────────────
  events = {
    track: (event: string, data: Record<string, unknown>) =>
      this.request('/events/track', { method: 'POST', body: JSON.stringify({ event, data, timestamp: Date.now() }) }),
  };

  // ─── Webhooks ──────────────────────────────────────────────────
  webhooks = {
    list: () => this.request<any>('/webhooks'),
    create: (data: { url: string; events: string[]; secret?: string }) =>
      this.request('/webhooks', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => this.request(`/webhooks/${id}`, { method: 'DELETE' }),
    test: (id: string) => this.request(`/webhooks/${id}/test`, { method: 'POST' }),
  };

  // ─── Courier ───────────────────────────────────────────────────
  courier = {
    getRates: (params: { from: string; to: string; weight: number }) =>
      this.request<any>(`/courier/rates?${new URLSearchParams(params as any)}`),
    track: (trackingId: string) =>
      this.request<any>(`/courier/track/${trackingId}`),
  };

  // ─── Chat Widget ────────────────────────────────────────────────
  chat = {
    init: (options?: { position?: 'bottom-right' | 'bottom-left'; color?: string; autoOpen?: boolean }) => {
      if (typeof window === 'undefined') return;
      (window as any).OzzylConfig = { apiKey: this.config.apiKey, chat: options };
      const script = document.createElement('script');
      script.src = 'https://cdn.ozzyl.com/widget/v1.js';
      script.async = true;
      document.body.appendChild(script);
    },
  };
}

export class OzzylError extends Error {
  constructor(message: string, public status: number, public data: any) {
    super(message);
    this.name = 'OzzylError';
  }
}

export interface AnalyticsOverview {
  period: string;
  revenue: { total: number; currency: string };
  orders: { total: number; completed: number; cancelled: number };
  visitors: { total: number; unique: number };
  conversion_rate: string;
}

export interface Recommendation {
  id: string;
  name: string;
  price: number;
  image: string;
  score: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}
```

### Browser Widget (1-line Embed)

```html
<!-- যেকোনো সাইটে paste করো — ব্যস! -->
<script>
  window.OzzylConfig = {
    apiKey: 'ozzyl_live_xxx',
    features: ['chat', 'recommendations', 'cart-recovery'],
    chat: { position: 'bottom-right', color: '#4F46E5' },
    recommendations: { selector: '#product-recs', limit: 8 },
  };
</script>
<script src="https://cdn.ozzyl.com/widget/v1.js" async></script>
```

### package.json for SDK

```json
{
  "name": "@ozzyl/sdk",
  "version": "1.0.0",
  "description": "Official Ozzyl Commerce API SDK",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "test": "vitest"
  },
  "keywords": ["ozzyl", "ecommerce", "analytics", "bangladesh", "bkash"],
  "license": "MIT"
}
```

---

## WordPress Plugin

```php
<?php
/**
 * Plugin Name:       Ozzyl Commerce
 * Plugin URI:        https://ozzyl.com/wordpress
 * Description:       AI-powered analytics, recommendations & cart recovery for WordPress/WooCommerce
 * Version:           1.0.0
 * Author:            Ozzyl
 * License:           GPL v2 or later
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * WC requires at least: 6.0
 */

if (!defined('ABSPATH')) exit;

define('OZZYL_VERSION', '1.0.0');
define('OZZYL_API_BASE', 'https://api.ozzyl.com/v1');

class OzzylCommerce {
    private string $apiKey;

    public function __construct() {
        $this->apiKey = get_option('ozzyl_api_key', '');

        // Admin settings page
        add_action('admin_menu', [$this, 'addAdminMenu']);
        add_action('admin_init', [$this, 'registerSettings']);

        if (empty($this->apiKey)) return;

        // WooCommerce hooks
        add_action('woocommerce_thankyou',              [$this, 'trackOrder']);
        add_action('woocommerce_add_to_cart',           [$this, 'trackAddToCart']);
        add_action('woocommerce_cart_updated',          [$this, 'trackCartUpdate']);

        // Frontend
        add_action('wp_footer',                         [$this, 'injectWidget']);
        add_action('wp_head',                           [$this, 'injectTracking']);

        // Shortcodes
        add_shortcode('ozzyl_recommendations',          [$this, 'renderRecommendations']);
        add_shortcode('ozzyl_analytics_widget',         [$this, 'renderAnalyticsWidget']);

        // REST API for webhook receiver
        add_action('rest_api_init', [$this, 'registerRestRoutes']);
    }

    // ─── Admin ─────────────────────────────────────────────────────────
    public function addAdminMenu(): void {
        add_options_page('Ozzyl Commerce', 'Ozzyl', 'manage_options', 'ozzyl', [$this, 'renderAdminPage']);
    }

    public function registerSettings(): void {
        register_setting('ozzyl_settings', 'ozzyl_api_key', ['sanitize_callback' => 'sanitize_text_field']);
        register_setting('ozzyl_settings', 'ozzyl_enable_chat',            ['type' => 'boolean']);
        register_setting('ozzyl_settings', 'ozzyl_enable_recommendations', ['type' => 'boolean']);
        register_setting('ozzyl_settings', 'ozzyl_enable_cart_recovery',   ['type' => 'boolean']);
    }

    public function renderAdminPage(): void {
        echo '<div class="wrap">';
        echo '<h1>Ozzyl Commerce Settings</h1>';
        echo '<form method="post" action="options.php">';
        settings_fields('ozzyl_settings');
        echo '<table class="form-table">';
        echo '<tr><th>API Key</th><td>';
        echo '<input type="password" name="ozzyl_api_key" value="' . esc_attr($this->apiKey) . '" class="regular-text" />';
        echo '<p class="description">Get your API key from <a href="https://app.ozzyl.com/settings/developer" target="_blank">Ozzyl Dashboard</a></p>';
        echo '</td></tr>';
        echo '</table>';
        submit_button();
        echo '</form></div>';
    }

    // ─── WooCommerce Tracking ─────────────────────────────────────────
    public function trackOrder(int $orderId): void {
        $order = wc_get_order($orderId);
        if (!$order) return;

        $items = [];
        foreach ($order->get_items() as $item) {
            $items[] = [
                'product_id' => (string) $item->get_product_id(),
                'name'       => $item->get_name(),
                'quantity'   => $item->get_quantity(),
                'price'      => $item->get_total(),
            ];
        }

        $this->apiPost('/events/track', [
            'event'      => 'order.completed',
            'order_id'   => (string) $orderId,
            'total'      => (float) $order->get_total(),
            'currency'   => get_woocommerce_currency(),
            'items'      => $items,
            'customer'   => ['email' => $order->get_billing_email()],
            'timestamp'  => time() * 1000,
        ]);
    }

    public function trackAddToCart(string $cartItemKey): void {
        $cart = WC()->cart;
        $item = $cart->get_cart_item($cartItemKey);
        if (!$item) return;

        $this->apiPost('/events/track', [
            'event'      => 'product_added',
            'product_id' => (string) $item['product_id'],
            'quantity'   => $item['quantity'],
            'price'      => (float) $item['line_total'],
            'session_id' => WC()->session->get_customer_id(),
            'timestamp'  => time() * 1000,
        ]);
    }

    public function trackCartUpdate(): void {
        $cart = WC()->cart;
        $items = [];
        foreach ($cart->get_cart() as $item) {
            $items[] = [
                'product_id' => (string) $item['product_id'],
                'quantity'   => $item['quantity'],
                'price'      => (float) $item['line_total'],
                'name'       => $item['data']->get_name(),
            ];
        }

        if (empty($items)) return;

        $this->apiPost('/abandoned-cart/track', [
            'session_id'     => WC()->session->get_customer_id(),
            'customer_email' => is_user_logged_in() ? wp_get_current_user()->user_email : null,
            'items'          => $items,
            'total'          => (float) $cart->get_total('edit'),
            'currency'       => get_woocommerce_currency(),
        ]);
    }

    // ─── Frontend Widget Injection ────────────────────────────────────
    public function injectWidget(): void {
        if (!get_option('ozzyl_enable_chat', true)) return;
        $apiKey = esc_js($this->apiKey);
        echo "<script>
          window.OzzylConfig = {
            apiKey: '{$apiKey}',
            features: ['chat', 'recommendations', 'cart-recovery']
          };
        </script>
        <script src='https://cdn.ozzyl.com/widget/v1.js' async></script>";
    }

    public function injectTracking(): void {
        global $post;
        if (!$post) return;
        $apiKey = esc_js($this->apiKey);
        echo "<script>
          window.OzzylConfig = window.OzzylConfig || {};
          window.OzzylConfig.apiKey = '{$apiKey}';
          window.OzzylConfig.pageType = '" . esc_js(get_post_type()) . "';
        </script>";
    }

    // ─── Shortcodes ────────────────────────────────────────────────────
    public function renderRecommendations(array $atts): string {
        $atts = shortcode_atts(['limit' => 8, 'strategy' => 'trending'], $atts);
        $data = $this->apiGet('/recommendations?strategy=' . $atts['strategy'] . '&limit=' . $atts['limit']);
        if (!$data || empty($data['products'])) return '';

        $html = '<div class="ozzyl-recommendations"><h3>আপনার পছন্দ হতে পারে</h3><div class="ozzyl-product-grid">';
        foreach ($data['products'] as $product) {
            $html .= '<div class="ozzyl-product-card">';
            $html .= '<img src="' . esc_url($product['image'] ?? '') . '" alt="' . esc_attr($product['name'] ?? '') . '">';
            $html .= '<p>' . esc_html($product['name'] ?? '') . '</p>';
            $html .= '<p>৳' . number_format($product['price'] ?? 0) . '</p>';
            $html .= '</div>';
        }
        $html .= '</div></div>';
        return $html;
    }

    // ─── REST API (Webhook Receiver) ──────────────────────────────────
    public function registerRestRoutes(): void {
        register_rest_route('ozzyl/v1', '/webhook', [
            'methods'  => 'POST',
            'callback' => [$this, 'handleWebhook'],
            'permission_callback' => '__return_true',
        ]);
    }

    public function handleWebhook(\WP_REST_Request $request): \WP_REST_Response {
        $signature = $request->get_header('x-ozzyl-signature');
        $timestamp = $request->get_header('x-ozzyl-timestamp');
        $body      = $request->get_body();
        $secret    = get_option('ozzyl_webhook_secret', '');

        if (!$this->verifySignature($body, $signature, $timestamp, $secret)) {
            return new \WP_REST_Response(['error' => 'Invalid signature'], 401);
        }

        $event = $request->get_json_params();
        do_action('ozzyl_webhook_' . str_replace('.', '_', $event['event'] ?? ''), $event);

        return new \WP_REST_Response(['received' => true]);
    }

    private function verifySignature(string $payload, ?string $signature, ?string $timestamp, string $secret): bool {
        if (!$signature || !$timestamp || !$secret) return false;
        if (abs(time() - (int)$timestamp / 1000) > 300) return false;
        $expected = 'sha256=' . hash_hmac('sha256', $payload, $secret);
        return hash_equals($expected, $signature);
    }

    // ─── API Client ────────────────────────────────────────────────────
    private function apiPost(string $path, array $data): ?array {
        $response = wp_remote_post(OZZYL_API_BASE . $path, [
            'timeout' => 10,
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type'  => 'application/json',
            ],
            'body' => wp_json_encode($data),
        ]);
        if (is_wp_error($response)) return null;
        return json_decode(wp_remote_retrieve_body($response), true);
    }

    private function apiGet(string $path): ?array {
        $response = wp_remote_get(OZZYL_API_BASE . $path, [
            'timeout' => 10,
            'headers' => ['Authorization' => 'Bearer ' . $this->apiKey],
        ]);
        if (is_wp_error($response)) return null;
        return json_decode(wp_remote_retrieve_body($response), true);
    }
}

new OzzylCommerce();
```

---

## Webhook System

### Outbound Webhook Dispatcher

```typescript
// apps/web/server/lib/webhook-dispatcher.ts

import { drizzle } from 'drizzle-orm/d1';
import { eq, and, lte, lt } from 'drizzle-orm';
import { webhooks, webhookDeliveries } from '@db/schema';

export type WebhookEvent =
  | 'order.created' | 'order.updated' | 'order.cancelled' | 'order.refunded'
  | 'product.created' | 'product.updated' | 'product.deleted' | 'product.low_stock'
  | 'customer.created' | 'customer.updated'
  | 'abandoned_cart.detected' | 'abandoned_cart.recovered'
  | 'payment.received' | 'payment.failed';

export interface WebhookPayload {
  id: string;
  event: WebhookEvent;
  created_at: string;
  data: Record<string, unknown>;
  store_id: number;
}

/**
 * Dispatch a webhook event to all registered listeners for a store.
 * Call from route handlers using ctx.waitUntil() for non-blocking delivery.
 */
export async function dispatchWebhookEvent(
  db: ReturnType<typeof drizzle>,
  storeId: number,
  event: WebhookEvent,
  data: Record<string, unknown>,
  env: { DB: D1Database }
): Promise<void> {
  // Find all active webhooks for this store that listen to this event
  const activeWebhooks = await db
    .select()
    .from(webhooks)
    .where(and(
      eq(webhooks.storeId, storeId),
      eq(webhooks.isActive, 1)
    ));

  const listeners = activeWebhooks.filter(w => {
    const events: string[] = JSON.parse(w.events);
    return events.includes(event) || events.includes('*');
  });

  if (listeners.length === 0) return;

  const payload: WebhookPayload = {
    id: `evt_${crypto.randomUUID().replace(/-/g, '')}`,
    event,
    created_at: new Date().toISOString(),
    data,
    store_id: storeId,
  };

  const payloadStr = JSON.stringify(payload);

  // Deliver to all listeners in parallel
  await Promise.allSettled(
    listeners.map(webhook => deliverWebhook(db, webhook, payloadStr, event))
  );
}

async function deliverWebhook(
  db: ReturnType<typeof drizzle>,
  webhook: typeof webhooks.$inferSelect,
  payloadStr: string,
  event: WebhookEvent,
  attempt = 1
): Promise<void> {
  const signature = await signPayload(payloadStr, webhook.secret);
  const timestamp = Date.now();

  try {
    const res = await fetch(webhook.url, {
      method: 'POST',
      headers: {
        'Content-Type':        'application/json',
        'X-Ozzyl-Signature':   signature,
        'X-Ozzyl-Timestamp':   timestamp.toString(),
        'X-Ozzyl-Event':       event,
        'X-Ozzyl-Delivery':    crypto.randomUUID(),
        'User-Agent':          'Ozzyl-Webhooks/1.0',
      },
      body: payloadStr,
      signal: AbortSignal.timeout(10000), // 10s timeout
    });

    await db.insert(webhookDeliveries).values({
      webhookId:    webhook.id,
      eventType:    event,
      payload:      payloadStr,
      status:       res.ok ? 'delivered' : 'failed',
      attempts:     attempt,
      responseCode: res.status,
      responseBody: (await res.text()).slice(0, 500),
      deliveredAt:  res.ok ? new Date() : null,
      createdAt:    new Date(),
    });

    if (res.ok) {
      await db.update(webhooks)
        .set({ lastSuccessAt: new Date(), failureCount: 0 })
        .where(eq(webhooks.id, webhook.id));
    } else {
      await scheduleRetry(db, webhook, payloadStr, event, attempt);
    }
  } catch (error) {
    await scheduleRetry(db, webhook, payloadStr, event, attempt);
  }
}

// Exponential backoff: 1m, 5m, 30m, 2h, 12h
const RETRY_DELAYS = [60, 300, 1800, 7200, 43200];

async function scheduleRetry(
  db: ReturnType<typeof drizzle>,
  webhook: typeof webhooks.$inferSelect,
  payloadStr: string,
  event: WebhookEvent,
  attempt: number
): Promise<void> {
  if (attempt >= RETRY_DELAYS.length) {
    // Max retries reached — disable webhook after 5 failures
    await db.update(webhooks)
      .set({ failureCount: 5, isActive: 0, lastFailureAt: new Date() })
      .where(eq(webhooks.id, webhook.id));
    return;
  }

  const delaySeconds = RETRY_DELAYS[attempt - 1] || 60;
  const nextRetry = new Date(Date.now() + delaySeconds * 1000);

  await db.insert(webhookDeliveries).values({
    webhookId:    webhook.id,
    eventType:    event,
    payload:      payloadStr,
    status:       'pending',
    attempts:     attempt,
    nextRetryAt:  nextRetry,
    createdAt:    new Date(),
  });
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return 'sha256=' + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}
```


---

## Business Model & Pricing

### Pricing Tiers

| Feature | Free | Starter ৳৯৯৯/মাস | Pro ৳২,৯৯৯/মাস | Agency ৳৯,৯৯৯/মাস |
|---------|------|-------------------|-----------------|-------------------|
| API Requests/মাস | ১,০০০ | ৫০,০০০ | ৫,০০,০০০ | Unlimited |
| API Keys | ১ | ৩ | ১০ | ৫০ |
| Webhooks | ২ | ১০ | ৫০ | ২০০ |
| Analytics Dashboard | ✅ | ✅ | ✅ | ✅ |
| AI Recommendations | ❌ | ✅ | ✅ | ✅ |
| Abandoned Cart Recovery | ❌ | ✅ | ✅ | ✅ |
| AI Tools | ❌ | ❌ | ✅ | ✅ |
| Courier Integration | ❌ | ❌ | ✅ | ✅ |
| Chat Widget | ❌ | ❌ | ✅ | ✅ |
| White Label | ❌ | ❌ | ❌ | ✅ |
| Custom CNAME | ❌ | ❌ | ❌ | ✅ |
| SLA | নেই | ৯৯% | ৯৯.৫% | ৯৯.৯% |
| Support | Community | Email | Priority | Dedicated |

### Revenue Projection

```
Month 3:   50 Starter + 10 Pro + 2 Agency
         = ৳49,950 + ৳29,990 + ৳19,998
         = ~৳1 লক্ষ/মাস

Month 6:  200 Starter + 40 Pro + 8 Agency
         = ৳1,99,800 + ৳1,19,960 + ৳79,992
         = ~৳4 লক্ষ/মাস

Month 12: 600 Starter + 120 Pro + 25 Agency
         = ৳5,99,400 + ৳3,59,880 + ৳2,49,975
         = ~৳12 লক্ষ/মাস  🔥

Year 2:  1500+ customers → ৳25-40 লক্ষ/মাস potential 🚀
```

### Go-to-Market Strategy

```
Phase 1 — BD WordPress Community (Month 1-3)
├── Facebook Groups: "WordPress Bangladesh" (50K+ members)
├── Free plugin WordPress.org এ publish করা
├── YouTube tutorial: "WordPress সাইটে bKash Analytics যোগ করুন"
├── BD Tech Bloggers দিয়ে review
└── Free tier দিয়ে hook করা

Phase 2 — Shopify BD Merchants (Month 3-6)
├── Shopify App Store এ submit
├── BD Shopify merchant groups target
├── "Shopify তে বাংলায় chat widget" hook
└── Paid ads: Facebook + Google

Phase 3 — Enterprise & Agency (Month 6-12)
├── Web agency partnership program
├── Revenue share for referring clients
├── White label offering for agencies
└── Direct sales to large BD e-commerce brands
```

### Competitive Advantage

| আমরা | Competitors |
|------|-------------|
| 🇧🇩 Bangladesh-first (bKash, Nagad, local couriers) | Global only |
| Bangla language UI + support | English only |
| Cloudflare Edge — BD তে fast | US/EU servers |
| Integrated with existing store system | Standalone tools |
| Unified dashboard — সব এক জায়গায় | Multiple tools |
| ৳৯৯৯/মাস affordable | $50+/month |

---

## Phased Roadmap

### Phase 1 — Foundation (সপ্তাহ 1-6)
**Goal**: Core infrastructure, কোনো feature নেই শুধু plumbing

```
Week 1-2: Database
  ☐ Migration: api_keys table
  ☐ Migration: api_usage table
  ☐ Migration: webhooks + webhook_deliveries tables
  ☐ Migration: api_plans + api_subscriptions tables
  ☐ Seed: Default plans (Free/Starter/Pro/Agency)

Week 3-4: Auth & Middleware
  ☐ apps/web/server/lib/api-keys.ts (generateApiKey, hashApiKey)
  ☐ apps/web/server/middleware/api-key-auth.ts
  ☐ apps/web/server/middleware/usage-tracker.ts
  ☐ apps/web/server/middleware/plan-guard.ts
  ☐ Rate limit upgrade: per-key (not per-IP) for v1 routes

Week 5-6: Dashboard UI
  ☐ app.settings.developer.tsx — enhance existing page:
      - API key creation form
      - Key list with copy/revoke
      - Usage stats chart
      - Webhook registration
  ☐ API subscription page (upgrade flow)
  ☐ Mount v1 router in server/index.ts:
      app.route('/api/v1', publicApiV1)
```

### Phase 2 — Core Features (সপ্তাহ 7-12)
**Goal**: Analytics + Recommendations দিয়ে MVP launch

```
Week 7-8: Analytics API
  ☐ GET /v1/analytics/overview
  ☐ GET /v1/analytics/products
  ☐ GET /v1/analytics/customers
  ☐ GET /v1/analytics/revenue/chart
  ☐ Tests: Vitest unit tests for all endpoints

Week 9-10: Recommendations + Events
  ☐ GET /v1/recommendations (similar, trending, personalized)
  ☐ POST /v1/recommendations/track
  ☐ POST /v1/events/track
  ☐ Vectorize integration for semantic similarity

Week 11-12: Webhook System
  ☐ apps/web/server/lib/webhook-dispatcher.ts
  ☐ POST /v1/webhooks (register)
  ☐ GET  /v1/webhooks (list)
  ☐ DELETE /v1/webhooks/:id
  ☐ POST /v1/webhooks/:id/test
  ☐ Cron job: retry failed deliveries (existing scheduler)
  ☐ Dispatch from order creation flow

🎯 MILESTONE: Public beta launch — invite 50 beta users
```

### Phase 3 — SDK & WordPress (সপ্তাহ 13-20)
**Goal**: Easy integration, distribution শুরু

```
Week 13-15: JavaScript SDK
  ☐ packages/js-sdk/ scaffold করা
  ☐ Ozzyl class with all modules
  ☐ TypeScript types
  ☐ Browser widget (widget.ts)
  ☐ Build setup (tsup)
  ☐ npm publish: @ozzyl/sdk
  ☐ CDN deploy: cdn.ozzyl.com/widget/v1.js

Week 16-18: WordPress Plugin
  ☐ packages/wp-plugin/ scaffold
  ☐ WooCommerce hooks (order, cart, product)
  ☐ Widget auto-injection
  ☐ Shortcodes (recommendations, analytics)
  ☐ Webhook receiver endpoint
  ☐ Admin settings page
  ☐ WordPress.org submission

Week 19-20: Abandoned Cart + Courier APIs
  ☐ POST /v1/abandoned-cart/track
  ☐ GET  /v1/abandoned-cart
  ☐ POST /v1/abandoned-cart/:id/recover
  ☐ GET  /v1/courier/rates
  ☐ GET  /v1/courier/track/:id
  ☐ Integration with existing courier services (Steadfast, Pathao, RedX)

🎯 MILESTONE: WordPress plugin live on WordPress.org
```

### Phase 4 — Shopify App & Polish (সপ্তাহ 21-28)
**Goal**: Shopify App Store, production-ready

```
Week 21-24: Shopify App
  ☐ Shopify OAuth flow
  ☐ Shopify App Bridge integration
  ☐ Auto-sync orders/products to Ozzyl
  ☐ Embedded analytics dashboard
  ☐ Shopify App Store submission

Week 25-26: Chat API + Widget
  ☐ POST /v1/chat/message
  ☐ Chat widget UI (React, embeddable)
  ☐ CDN deploy: cdn.ozzyl.com/chat/v1.js

Week 27-28: Enterprise Features
  ☐ White label (custom CNAME: api.yourcompany.com)
  ☐ SLA monitoring dashboard
  ☐ Custom rate limit per enterprise customer
  ☐ IP allowlist support
  ☐ Audit log for API key usage

🎯 MILESTONE: Shopify App Store live — full public launch
```

### Phase 5 — Scale & Revenue (Month 7-12)
**Goal**: ৳10 লক্ষ/মাস MRR

```
☐ Billing integration (bKash/SSLCommerz for subscriptions)
☐ Usage-based billing dashboard
☐ Partner/Reseller program
☐ API versioning (v2 planning)
☐ GraphQL API (power users)
☐ Real-time webhooks via WebSockets
☐ AI-powered insights (natural language queries)
☐ Multi-region support (low latency for BD)
```

---

## Developer Experience (DX)

### Documentation Structure

```
docs.ozzyl.com/
├── Getting Started
│   ├── Quick Start (5 minutes)
│   ├── Authentication
│   ├── Making Your First Request
│   └── Error Handling
├── API Reference
│   ├── Analytics
│   ├── Recommendations
│   ├── Abandoned Cart
│   ├── Webhooks
│   ├── Courier
│   ├── Chat
│   └── Events
├── SDKs & Integrations
│   ├── JavaScript SDK
│   ├── WordPress Plugin
│   ├── Shopify App
│   └── REST API (any language)
├── Guides
│   ├── WordPress Integration (Bangla)
│   ├── Shopify Integration
│   ├── React Integration
│   └── Webhook Security
└── Reference
    ├── Rate Limits
    ├── Error Codes
    ├── Changelog
    └── Status Page
```

### Quick Start Guide (5 minutes)

```bash
# Step 1: Install SDK
npm install @ozzyl/sdk

# Step 2: Get your API key
# Ozzyl Dashboard → Settings → Developer → API Keys → Create Key

# Step 3: Make your first request
```

```typescript
import { Ozzyl } from '@ozzyl/sdk';

const ozzyl = new Ozzyl({ apiKey: 'ozzyl_live_your_key_here' });

// আপনার store এর analytics দেখুন
const stats = await ozzyl.analytics.overview({ period: 'last_30_days' });
console.log(`Revenue: ৳${stats.revenue.total}`);
console.log(`Orders: ${stats.orders.total}`);
console.log(`Conversion: ${stats.conversion_rate}`);
```

### Standard API Response Format

```typescript
// সব সফল response এর format
{
  "data": { ... },           // actual data
  "meta": {                  // pagination/context
    "page": 1,
    "per_page": 20,
    "total": 342
  },
  "request_id": "req_abc123" // tracing
}

// সব error response এর format
{
  "error": "Human readable message",
  "code": "MACHINE_READABLE_CODE",  // e.g. RATE_LIMITED, INVALID_KEY
  "docs": "https://docs.ozzyl.com/errors/MACHINE_READABLE_CODE",
  "request_id": "req_abc123"
}
```

### Standard Error Codes

| HTTP | Code | Description |
|------|------|-------------|
| 400 | `INVALID_REQUEST` | Request body/params invalid |
| 401 | `INVALID_API_KEY` | Missing or invalid API key |
| 401 | `KEY_EXPIRED` | API key has expired |
| 402 | `NO_SUBSCRIPTION` | No active API subscription |
| 403 | `DOMAIN_NOT_ALLOWED` | Origin domain not registered |
| 403 | `SCOPE_INSUFFICIENT` | Key lacks required scope |
| 404 | `NOT_FOUND` | Resource not found |
| 429 | `RATE_LIMITED` | Too many requests |
| 429 | `QUOTA_EXCEEDED` | Monthly quota exceeded |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `SERVICE_UNAVAILABLE` | Temporary outage |

### API Versioning Strategy

```
/api/v1/  ← Current stable (2026-02)
/api/v2/  ← Future (breaking changes)

# Version via header (alternative)
X-Ozzyl-Version: 2026-02

# Deprecation notice header
Sunset: Sat, 01 Jan 2028 00:00:00 GMT
Deprecation: true
Link: <https://docs.ozzyl.com/migration/v2>; rel="successor-version"
```

---

## Infrastructure & Ops

### Cloudflare Setup

```toml
# wrangler.toml additions for API platform

[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "your-rate-limit-kv-id"   # existing

[[kv_namespaces]]
binding = "API_CACHE"
id = "your-api-cache-kv-id"    # NEW: cache API responses

[[queues.consumers]]
queue = "webhook-retry"         # NEW: webhook retry queue
max_batch_size = 10
max_batch_timeout = 30

[[queues.producers]]
binding = "WEBHOOK_QUEUE"
queue = "webhook-retry"
```

### Monitoring & Alerting

```typescript
// Key metrics to monitor:
// 1. API error rate > 1% → alert
// 2. P95 latency > 500ms → alert
// 3. Webhook delivery failure rate > 5% → alert
// 4. Quota exceeded events → revenue opportunity alert
// 5. Invalid API key attempts spike → security alert

// Structured logs (existing pattern, extend for API):
const log = {
  ts:         new Date().toISOString(),
  level:      'info',
  msg:        'api_request',
  api_key_id: apiKeyId,
  store_id:   storeId,
  endpoint:   path,
  method,
  status:     res.status,
  duration_ms: responseMs,
  plan:        planSlug,
};
```

### CDN Setup for Widget/SDK

```
cdn.ozzyl.com/
├── widget/
│   ├── v1.js          ← Production (versioned, immutable)
│   ├── v1.min.js      ← Minified
│   └── latest.js      ← Always latest (never cache long)
└── sdk/
    └── v1/
        └── index.js   ← ESM bundle

# Cache headers:
# v1.js:     Cache-Control: public, max-age=31536000, immutable
# latest.js: Cache-Control: public, max-age=3600
```

### SLA & Uptime Targets

| Plan | Uptime SLA | Support Response | Incidents |
|------|-----------|-----------------|-----------|
| Free | No SLA | Community | status.ozzyl.com |
| Starter | ৯৯% | 24h email | Email notification |
| Pro | ৯৯.৫% | 4h email | Email + SMS |
| Agency | ৯৯.৯% | 1h dedicated | Dedicated + Slack |

---

## Coding Standards

### Critical Rules (মাথায় রাখতে হবে সবসময়)

```typescript
// 🔴 RULE 1: storeId always from API key context, NEVER from client
const storeId = c.get('storeId'); // ✅ middleware verified
// NOT: c.req.query('store_id')   // ❌ client can manipulate

// 🔴 RULE 2: All DB queries MUST include storeId filter
const data = await db.select().from(table)
  .where(eq(table.storeId, storeId)); // ✅ always

// 🔴 RULE 3: API keys stored as SHA-256 hash ONLY
// Plaintext shown ONCE at creation, never stored

// 🔴 RULE 4: Usage tracking is async (never blocks response)
c.executionCtx?.waitUntil(trackUsage(...));

// 🔴 RULE 5: Webhooks always HMAC-SHA256 signed

// 🔴 RULE 6: All inputs validated with Zod before processing

// 🔴 RULE 7: Error responses always include request_id for tracing

// 🔴 RULE 8: No console.log in production — use structured JSON logs
```

### File Naming Convention

```
server/api/v1/*.ts          → Hono route handlers (feature per file)
server/middleware/*.ts       → Middleware (single responsibility)
server/lib/*.ts             → Pure utility functions (no Hono context)
packages/js-sdk/src/*.ts    → SDK modules (feature per file)
packages/wp-plugin/**/*.php → WordPress plugin (PSR-4 style)
```

### Testing Requirements

```typescript
// Every API endpoint needs:
// 1. Unit test: happy path
// 2. Unit test: invalid API key → 401
// 3. Unit test: wrong scope → 403
// 4. Unit test: quota exceeded → 429
// 5. Unit test: storeId isolation (cannot access other store's data)

// Example test structure:
// apps/web/tests/api/v1/analytics.test.ts
// apps/web/tests/api/v1/recommendations.test.ts
// apps/web/tests/middleware/api-key-auth.test.ts
// apps/web/tests/lib/api-keys.test.ts
// apps/web/tests/lib/webhook-dispatcher.test.ts
```

---

## Summary: What to Build & In What Order

```
Priority 1 (Build first — unblocks everything):
  ✅ DB migrations (api_keys, api_usage, webhooks, api_plans, api_subscriptions)
  ✅ API key generation + hashing utility
  ✅ api-key-auth middleware
  ✅ usage-tracker middleware
  ✅ plan-guard middleware
  ✅ Mount /api/v1 in server/index.ts

Priority 2 (MVP feature — quickest value):
  ✅ GET /v1/analytics/overview
  ✅ GET /v1/analytics/products
  ✅ GET /v1/recommendations
  ✅ POST /v1/events/track
  ✅ Developer settings UI (key management)

Priority 3 (Retention features):
  ✅ Webhook system (register + dispatch)
  ✅ POST /v1/abandoned-cart/track
  ✅ GET  /v1/courier/rates

Priority 4 (Distribution):
  ✅ @ozzyl/sdk npm package
  ✅ Browser widget (cdn.ozzyl.com/widget/v1.js)
  ✅ WordPress plugin (WordPress.org)

Priority 5 (Scale):
  ✅ Shopify App Store
  ✅ Billing integration
  ✅ White label (Agency plan)
  ✅ GraphQL API
```

---

*Last Updated: 2026-02-24*
*Status: Planning → Implementation Ready*
*Next Step: Phase 1 — Database Migration*
