# Launch Plan (Production Go‑Live) — 2026-02-07

> লক্ষ্য: **real-money transactions** চালু করার আগে “production-grade” গেট/চেকলিস্ট ক্লিয়ার করা।  
> নোট: আপনার সিদ্ধান্ত অনুযায়ী **online payment (Stripe/SSLCommerz)** এখন নয়; আপাতত **Cash on Delivery (COD)** + ভবিষ্যতে **bKash**।  
> এই ডকটি “কি বাকি” + “কিভাবে করবো” + “কিভাবে ভেরিফাই করবো” — এই তিনটা জিনিসকে এক জায়গায় এনে দেয়।

## 0) Current State (Already Done / Shipping)

বিস্তারিত “Done” লিস্ট ও ফাইল রেফারেন্স: `docs/LAUNCH_READINESS_2026-02-04.md`

হাই-লেভেল সারাংশ:
- Floating WhatsApp/Call buttons (settings-driven, all pages)
- Product details tabs: fake/demo নয়, **real data only** (metafields + policy fallback)
- Blank homepage prevention for stores with products
- Checkout duplicate/retry guard (initial hardening)
- Admin CSRF hard gate (Origin/Referer same-origin guard)
- Order status state machine (admin transitions)
- DB integrity: `store_users` shim migration
- D1 migrations workflow unified (single migrations dir + `wrangler d1 migrations apply`)

## 1) Non‑Negotiable Production Gates (P0)

এগুলো ক্লিয়ার না হলে **production go‑live** করা উচিত না — কারণ এগুলো টাকা/স্টক/ডাটা লস/হ্যাকিং রিস্ক কমায়।

### 1.1 Database Safety & Migration Adoption (P0)

**সমস্যা কেন হয়:** আগে যদি production DB “execute SQL” দিয়ে তৈরি হয়ে থাকে, `wrangler d1 migrations apply` চালালে Wrangler মনে করতে পারে **সব migration unapplied**, ফলে পুরনো migration আবার রান করার চেষ্টা করতে পারে (বড় রিস্ক)।

**Fact (verified):** Wrangler migration state রাখে `d1_migrations` নামে একটি টেবিলে।
- লোকাল DB-তে টেবিলটি দেখা গেছে: `CREATE TABLE d1_migrations (...)` (wrangler local inspection)

**Plan (Safe Adoption Strategy):**
1. **Production DB backup/restore path নিশ্চিত করা**
   - Wrangler docs অনুযায়ী `d1 migrations apply` চালালে **automatic backup** নেয়। (Cloudflare Workers docs)
   - অতিরিক্তভাবে, `wrangler d1 export` ব্যবহার করে schema/data dump নেওয়া (CLI supported)।
2. **Staging DB বানানো (prod clone via export/import)**
   - Wrangler CLI (v4) এ আলাদা “fork/copy” কমান্ড নেই; তাই safest approach:
     - prod DB export (`wrangler d1 export --remote`)
     - staging DB create করে সেই SQL staging-এ execute (`wrangler d1 execute --remote --file`)
   - উদ্দেশ্য: production data সহ **ঝুঁকি ছাড়া** migration adopt/verify করা।
3. **Staging-এ migration adoption rehearsal**
   - staging-এ `wrangler d1 migrations apply <db> --remote` চালানোর আগে:
     - `wrangler d1 migrations list <db> --remote` দিয়ে “কতগুলো/কি কি” pending দেখুন
     - যদি “খুব বেশি/সব” pending দেখায়, তাহলে বুঝতে হবে staging DB-তে `d1_migrations` baseline নেই বা mismatch আছে।
4. **Baseline (Stamp) সিদ্ধান্ত**
   - Ideal: DB শুরু থেকেই migrations apply দিয়ে চালানো।
   - Reality: পুরনো DB হলে, baseline করতে হতে পারে:
     - `d1_migrations` টেবিলে পুরনো migration ফাইলগুলোর নাম insert করে “already applied” হিসেবে mark করা (খুব সতর্কভাবে)।
     - তারপর থেকে শুধু নতুন migration apply হবে।

**Verification Checklist:**
- staging storefront + admin critical flows কাজ করছে
- staging-এ নতুন migration apply করলে schema drift হচ্ছে না
- `d1_migrations` এ expected rows আছে এবং নতুন migration নাম append হয়

**Deliverable (created):**
- `docs/DB_BASELINE_ADOPTION_RUNBOOK.md` (স্টেপ-বাই-স্টেপ কমান্ড + রিস্ক নোট)
- `docs/STAGING_WORKFLOW.md` (স্টেজিং-first রিলিজ প্রসেস)

### 1.2 Checkout → Order Correctness (COD-first) (P0)

COD হলেও অর্ডার/স্টক ঠিক না থাকলে production-এ বড় সমস্যা হবে।

**What must be true (invariants):**
- একাধিকবার সাবমিট/রিট্রাই হলেও ডুপ্লিকেট অর্ডার না হয় (idempotency)
- স্টক নেগেটিভে না যায়
- অর্ডার স্টেটগুলো consistent থাকে (created → confirmed → shipped → delivered / canceled)

**Plan:**
1. Checkout API-তে idempotency key বাধ্যতামূলক করা (client-generated + stored)
2. Inventory reservation window (short TTL) বা atomic decrement approach enforce
3. Order number uniqueness per store (unique index)
4. Admin update flows state machine দিয়ে validate (already present; expand coverage)

**Verification:**
- E2E test matrix (same cart, same idempotency key → same order)
- 0 stock product cart → order creation blocked
- concurrent order attempts → only one success

### 1.3 Security Gates (P0)

**Money + PII + multi-tenant** হলে বেসিক security gaps চলবে না।

**Plan:**
1. **Multi-tenancy enforcement audit**
   - every DB query must be `store_id` scoped (or equivalent store binding)
   - add “store scope helper” wrappers and ban raw unscoped selects
2. **Admin mutation protection**
   - current Origin/Referer guard আছে; ensure it covers all POST/PUT/PATCH/DELETE endpoints (admin + API)
   - add explicit allowlist for admin hostnames
3. **Rate limiting**
   - login, otp/email verify, checkout, order create, image proxy endpoints
4. **Upload/Proxy hardening**
   - R2 upload only for authenticated merchants
   - image proxy SSRF protections already started; add strict allowlist + size/timeouts
5. **WAF rules scope**
   - tie into `docs/CLOUDFLARE_WAF_RULES_SCOPE_MATRIX.md`

**Verification:**
- security smoke tests (unauth requests blocked)
- cross-store access attempt returns 404/403
- admin POST without Origin/Referer fails in prod mode

### 1.4 Observability & Ops (P0)

**Production-grade মানে**: সমস্যা হলে আপনি ২ মিনিটে বুঝবেন “কি ভেঙেছে”, এবং ১০ মিনিটে mitigate করতে পারবেন।

**Plan:**
1. Error tracking (Sentry or CF logs based) — P0 for real money
2. Structured logs (request_id, store_id, user_id, order_id)
3. Audit trails for admin actions (who changed price/stock/order status)
4. Runbooks:
   - incident response
   - rollback strategy (deploy rollback + DB rollback story)
   - backups/restore rehearsal

**Verification:**
- force a controlled failure in staging → alert triggers + log traceability

## 2) “Should Have” Before Launch (P1)

### 2.1 Performance Baseline (P1)

আপনি Lighthouse report-এ দেখেছেন:
- render-blocking CSS/fonts
- image delivery size issues (hero + product thumbs)

**Constraint:** Cloudflare Images paid service নেবেন না।

**Plan:**
1. Fonts: self-host or `preconnect` + `display=swap` + subset
2. CSS: split critical CSS or reduce root CSS payload
3. Images:
   - upload pipeline: browser-side compress → WebP (merchant flow)
   - storefront: responsive `srcset` + correct sizes
   - LCP hero: `fetchpriority="high"` + avoid lazy-load

**Verification:**
- track LCP, TTFB, CLS for 5 templates
- test on low-end android + slow 4G profile

### 2.2 Storefront UX Edge Cases (P1)

Examples:
- empty category/product states
- out-of-stock badges
- cart persistence across reload
- localized currency formatting (BDT)

## 3) Post‑Launch (P2)

### 3.1 Payments (Deferred by you)
- COD stable হলে bKash add
- then card gateways (SSLCommerz/Stripe)
- webhook signature verification + idempotency + reconciliation

### 3.2 Fraud/Abuse protections
- bot protection, velocity rules, suspicious order flags

## 4) Execution Plan (Suggested Order)

1. **DB Baseline Adoption Runbook** (staging rehearsal first)
2. **Checkout/Order invariants** (unit + e2e + indexes)
3. **Security audit pass** (multi-tenant + csrf + rate limit + uploads)
4. **Observability + runbooks** (alerts + rollback drill)
5. **Performance baseline** (fonts + images + LCP)
6. **Go-live dry run** (staging → prod steps)

## 5) Go‑Live Checklist (Day‑0)

- [ ] Staging is green on full smoke suite
- [ ] DB backup/export completed
- [ ] New deploy done + smoke test on production domain
- [ ] Order create (COD) verified end-to-end
- [ ] Admin order management verified
- [ ] Logs + error tracking verified
- [ ] Rollback plan tested (deploy rollback at least)

## 6) Open Decisions (Need Your Input)

এগুলো আপনি approve করলে আমরা next coding phase শুরু করবো:
1. Staging strategy: prod clone via `time-travel` vs separate clean staging DB
2. COD flow details: order confirmation SMS/email immediate vs later
3. Data retention: customer PII retention duration (minimum viable policy)
