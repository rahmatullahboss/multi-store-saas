# Ozzyl API Platform — Part 5: Business Model & Roadmap
> Source: API_PLATFORM_MASTER_PLAN.md v6.0 | Sections 12-13

## 12. Business Model & Pricing

### 4-Tier Pricing

| Plan | Price/month | API Calls/month | Webhooks | Domains | Support |
|------|-------------|-----------------|----------|---------|---------|
| **Free** | ৳0 | 1,000 | 1 | 1 | Community |
| **Starter** | ৳999 | 50,000 | 5 | 3 | Email |
| **Pro** | ৳2,999 | 200,000 | 20 | 10 | Priority |
| **Agency** | ৳9,999 | Unlimited | Unlimited | Unlimited | SLA 99.9% |

### Revenue Projection

```
Month 3:   50 Starter + 10 Pro + 2 Agency
          = ৳49,950 + ৳29,990 + ৳19,998
          = ~৳1 লক্ষ/মাস

Month 6:  150 Starter + 30 Pro + 8 Agency
          = ৳1.49L + ৳0.89L + ৳0.79L
          = ~৳3.2 লক্ষ/মাস

Month 12: 500 Starter + 100 Pro + 25 Agency
          = ৳4.99L + ৳2.99L + ৳2.49L
          = ~৳10.5 লক্ষ/মাস 🔥

Year 2:   2000+ customers → ৳30-50 লক্ষ/মাস potential
```

### Distribution Strategy

```
Channel 1: WordPress.org Plugin Directory
  → Free plugin, upsell in plugin settings
  → Target: 10,000+ active installs in Year 1

Channel 2: Shopify App Store
  → Free install, subscription in-app
  → Target: 500+ merchants in Year 1

Channel 3: Direct API (developers)
  → docs.ozzyl.com → sign up → API key
  → Target: 200+ developers in Year 1

Channel 4: Agency Partners
  → Reseller program (30% commission)
  → Target: 20+ agency partners
```

---

## 13. Phased Implementation Roadmap

### Phase 1 — Foundation (Week 1-4)
**Goal**: Core infrastructure ready, no user-facing features yet

```
Week 1: Database
  □ Migration: api_keys, api_usage, webhooks, webhook_deliveries tables
  □ Migration: api_plans, api_subscriptions tables
  □ Seed: default plans (free, starter, pro, agency)

Week 2: Auth Layer
  □ generateApiKey() — Web Crypto API based
  □ hashApiKey() — SHA-256
  □ apiKeyAuth middleware — Hono
  □ Usage tracker (KV-based)
  □ Rate limiter middleware

Week 3: Core API Routes
  □ GET /v1/analytics/summary
  □ GET /v1/analytics/events
  □ POST /v1/events (track)
  □ GET /v1/recommendations
  □ GET /v1/products (public catalog)

Week 4: Admin Dashboard
  □ app.settings.developer.tsx — API keys page
  □ Create/revoke/list API keys UI
  □ Usage meter UI (calls used/limit)
  □ Webhook endpoints management
```

### Phase 2 — SDK & Docs (Week 5-8)
**Goal**: Developers can integrate in < 30 minutes

```
Week 5: JavaScript SDK
  □ packages/ozzyl-sdk/ setup
  □ Core HTTP client
  □ Analytics, Events, Recommendations resources
  □ Typed errors
  □ npm publish @ozzyl/sdk

Week 6: Documentation Site
  □ docs.ozzyl.com (Next.js or Docusaurus)
  □ Quick Start (< 5 min setup)
  □ API Reference (auto-generated from OpenAPI)
  □ Code examples (JS, PHP, Python, cURL)

Week 7: Webhook System
  □ Outbound webhook dispatcher (Cloudflare Queues)
  □ Retry with exponential backoff
  □ HMAC signing
  □ Webhook logs in dashboard

Week 8: Testing & Polish
  □ Integration tests for all endpoints
  □ Rate limiting stress tests
  □ SDK unit tests (100% coverage)
  □ Security audit
```

### Phase 3 — WordPress Plugin (Week 9-12)
**Goal**: WordPress.org submission ready

```
Week 9-10: Plugin Development
  □ Plugin scaffold (WordPress coding standards)
  □ WooCommerce hooks (orders, cart, products)
  □ Settings page (API key input, feature toggles)
  □ Recommendations widget (shortcode + block)

Week 11: Analytics Integration
  □ Auto page view tracking
  □ WooCommerce conversion tracking
  □ Dashboard widget (mini analytics)

Week 12: Submission
  □ WordPress.org review submission
  □ Plugin banner/screenshots
  □ Bangla + English readme
  □ Support forum setup
```

### Phase 4 — Shopify App (Week 13-20)
**Goal**: Shopify App Store approved

```
Week 13-16: Shopify App Development
  □ Shopify Partner account setup
  □ OAuth app (Shopify Admin API)
  □ App Bridge 3.0 embedded UI
  □ Webhook subscriptions (Shopify → Ozzyl)

Week 17-18: Features
  □ Product recommendations block
  □ Analytics dashboard (embedded)
  □ Abandoned cart recovery (Ozzyl → Shopify)

Week 19-20: Submission
  □ Shopify App Review requirements
  □ App listing copy + screenshots
  □ Pricing setup in Partner Portal
```

### Phase 5 — Scale (Week 21-28)
**Goal**: Production-grade reliability

```
Week 21-22: Observability
  □ API error rate monitoring
  □ Latency percentiles (p50, p95, p99)
  □ Usage anomaly detection
  □ Customer health scores

Week 23-24: Advanced Features
  □ AI-powered insights (Workers AI)
  □ Semantic product search (Vectorize)
  □ Personalization engine
  □ A/B testing framework

Week 25-26: Enterprise Features
  □ Custom CNAME (api.yourstore.com → ozzyl)
  □ SSO for Agency customers
  □ Audit logs
  □ Data export (GDPR compliance)

Week 27-28: Launch
  □ Product Hunt launch
  □ BD tech community outreach
  □ Agency partner onboarding
  □ Press release
```

---

