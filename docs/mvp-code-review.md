এমভিপি-তে লক্ষ্য হবে: স্টোর তৈরি → প্রোডাক্ট যোগ → অর্ডার নেওয়া → পেমেন্ট/ডেলিভারি ম্যানেজ → বেসিক কাস্টমাইজ → আপনাকে মাল্টি-টেন্যান্টভাবে সেফ/স্কেলেবল রাখা। নিচে একটি প্র্যাক্টিকাল MVP checklist দিলাম।

1. টেন্যান্ট/স্টোর সেটআপ
   • ✅ সাইনআপ/লগইন (ইমেইল/ফোন + OTP থাকলে ভালো)
   • ✅ “Create Store” উইজার্ড (স্টোর নাম, ডোমেইন সাবডোমেইন, ক্যাটাগরি, লোকেশন)
   • ✅ সাবডোমেইন রাউটিং (store.yourdomain.com)
   • ✅ কাস্টম ডোমেইন কানেক্ট (ঐচ্ছিক, কিন্তু খুব strong)
   • ✅ টেন্যান্ট আইসোলেশন (প্রতি স্টোরের ডাটা আলাদা—সব কুয়েরিতে tenantId বাধ্যতামূলক)

2. স্টোরফ্রন্ট (কাস্টমারের সাইট)
   • ✅ হোম, কালেকশন/ক্যাটাগরি, প্রোডাক্ট ডিটেইল, সার্চ
   • ✅ কার্ট + চেকআউট
   • ✅ অর্ডার কনফার্মেশন পেজ
   • ✅ রেসপন্সিভ + বেসিক SEO (title/meta, clean URLs)
   • ✅ স্পিড: CDN/ক্যাশিং (Cloudflare edge থাকলে MVP-তে highlight)

3. প্রোডাক্ট & ক্যাটালগ ম্যানেজমেন্ট
   • ✅ প্রোডাক্ট CRUD (name, price, stock, SKU, description)
   • ✅ ভ্যারিয়েন্ট (size/color) — MVP-তে “সিম্পল ভ্যারিয়েন্ট” enough
   • ✅ ক্যাটাগরি/কালেকশন
   • ✅ ইমেজ আপলোড (CDN-backed)
   • ✅ স্টক ট্র্যাকিং (available qty)

4. অর্ডার ম্যানেজমেন্ট
   • ✅ অর্ডার লিস্ট + স্ট্যাটাস (Pending/Confirmed/Shipped/Delivered/Cancelled)
   • ✅ কাস্টমার ইনফো + অ্যাড্রেস
   • ✅ ইনভয়েস/অর্ডার প্রিন্ট (PDF optional)
   • ✅ কুপন/ডিসকাউন্ট (MVP-তে 1 টাইপ: % বা fixed)

5. পেমেন্ট (বাংলাদেশ ফোকাস)
   • ✅ COD (Must-have)
   • ✅ Online payment gateway ইন্টিগ্রেশন (কমপক্ষে ১টা)
   • ✅ পেমেন্ট স্ট্যাটাস ও ওয়েবহুক হ্যান্ডলিং
   • ✅ রিফান্ড/ক্যানসেল রুল (বেসিক)

6. শিপিং / ডেলিভারি
   • ✅ ডেলিভারি চার্জ রুল (ঢাকা/আউটসাইড বা জোন-বেসড simple)
   • ✅ কুরিয়ার ম্যানুয়াল এন্ট্রি (tracking number)
   • ✅ অর্ডার স্ট্যাটাস আপডেট নোটিফিকেশন (SMS/Email optional)

7. থিম/ডিজাইন (MVP লেভেলে)
   • ✅ 1–2টা রেডি থিম (Starter + Minimal)
   • ✅ ব্র্যান্ডিং সেটিংস: logo, color, banner, font (বেসিক)
   • ✅ হোমপেজ সেকশন টগল (hero, featured, categories, testimonials)
   • ✅ পেজ বিল্ডার না—MVP-তে দরকার নেই (পরের ধাপ)

8. অ্যাডমিন প্যানেল
   • ✅ ড্যাশবোর্ড (today orders, revenue, pending)
   • ✅ প্রোডাক্ট/অর্ডার/কাস্টমার/সেটিংস
   • ✅ রোলস: Owner + Staff (কমপক্ষে ২টা role)
   • ✅ অ্যাক্টিভিটি লগ (ঐচ্ছিক কিন্তু ভালো)

9. ইউজার/কাস্টমার ফিচার (স্টোরের কাস্টমার)
   • ✅ গেস্ট চেকআউট (Must-have)
   • ✅ কাস্টমার অ্যাকাউন্ট (optional MVP—না থাকলেও চলে)
   • ✅ অর্ডার ট্র্যাক পেজ (orderID + phone)

10. সাবস্ক্রিপশন/প্ল্যান এনফোর্সমেন্ট
    • ✅ প্ল্যান: Free vs Premium (feature flags)
    • ✅ Free plan limit: মাসে ৫০ অর্ডার (hard/soft limit)
    • ✅ বিলিং পেজ (invoice history)
    • ✅ আপগ্রেড ফ্লো (manual payment + verify হতে পারে MVP-তে)

11. সিকিউরিটি & কমপ্লায়েন্স (MVP হলেও must)
    • ✅ RBAC + টেন্যান্ট স্কোপ এনফোর্স
    • ✅ Rate limiting / bot protection (Cloudflare)
    • ✅ Input validation + basic audit logs
    • ✅ Backup strategy (daily snapshot)

12. অপারেশন/মনিটরিং
    • ✅ Error logging (Sentry/Equivalent)
    • ✅ Basic analytics (page views, orders)
    • ✅ Admin “support tools” (tenant lookup, disable store)

⸻

MVP Must-have (সবচেয়ে কমে যা লাগবেই) 1. Store create + subdomain routing 2. 1 থিম স্টোরফ্রন্ট + cart/checkout 3. Product CRUD + image + stock 4. Order flow + admin order management 5. COD + basic shipping charge 6. Plan limits (৫০ orders) + basic security/tenant isolation

Post-MVP (পরের রিলিজে রাখো)
• Multi-theme marketplace / page builder
• Marketing: abandoned cart, email campaigns
• Advanced promos: BOGO, tier discounts
• POS, inventory multi-warehouse
• App marketplace / integrations
• Full customer accounts + wishlist

---

## কোড-লেভেল MVP রিভিউ (Updated: 2026-02-12)

### রিভিউ স্কোপ
- `apps/web/app/routes/api.create-order.ts`
- `apps/web/app/routes/api.track-cart.ts`
- `apps/web/app/routes/api.track-visit.ts`
- `apps/web/app/routes/o.$slug.tsx`
- `apps/web/app/routes/p.$slug.tsx`
- `apps/web/server/middleware/tenant.ts`
- `apps/web/app/routes/checkout.tsx`
- `apps/web/app/utils/plans.server.ts`
- `apps/web/server/middleware/rate-limit.ts`
- `apps/web/app/routes/app.settings.domain.tsx`

### ফিচার-ভিত্তিক স্ট্যাটাস (১-১২)
1. টেন্যান্ট/স্টোর সেটআপ: ✅ Implemented  
   Evidence: tenant middleware + subdomain/custom-domain resolution + onboarding/auth routes.
2. স্টোরফ্রন্ট: ✅ Implemented  
   Evidence: `store.home`, `products.$id`, `checkout`, `thank-you.$orderId`, category/search routes.
3. প্রোডাক্ট/ক্যাটালগ: ✅ Implemented  
   Evidence: product CRUD routes, variants, inventory, image upload flow.
4. অর্ডার ম্যানেজমেন্ট: ✅ Implemented  
   Evidence: `api.create-order`, admin order list/details routes, status pipeline.
5. পেমেন্ট: ✅ Implemented (MVP-level)  
   Evidence: COD + manual/online method fields + webhook dispatch pipeline.
6. শিপিং/ডেলিভারি: ✅ Implemented  
   Evidence: shipping settings, shipping resolver, courier API integration.
7. থিম/ডিজাইন: ✅ Implemented (MVP simple theme system)  
   Evidence: MVP template routes/settings and active theme docs/system.
8. অ্যাডমিন প্যানেল: ✅ Implemented  
   Evidence: dashboard + product/order/customer/settings + team management.
9. কাস্টমার ফিচার: ✅ Implemented (MVP scope)  
   Evidence: guest checkout, account routes, order visibility flows.
10. সাবস্ক্রিপশন/প্ল্যান: ✅ Implemented  
    Evidence: `checkUsageLimit` and billing/plan routes.
11. সিকিউরিটি/কমপ্লায়েন্স: ⚠️ Improved in this review  
    Notes: tenant context mismatch hardening + stricter payment input validation added.
12. অপারেশন/মনিটরিং: ✅ Implemented  
    Evidence: analytics tracking routes, admin operational views, Sentry integration points.

### এই রিভিউতে ফিক্স করা ইস্যু
1. **Cross-tenant order submission risk**  
   Fix: `api.create-order` এ request tenant context (`context.storeId`) আর payload `store_id` mismatch হলে `403` return করা হয়েছে.
2. **Weak payment method validation**  
   Fix: `payment_method` free-form string থেকে enum (`cod|bkash|nagad|stripe`) করা হয়েছে এবং normalization যুক্ত করা হয়েছে.
3. **Cross-tenant analytics/cart poisoning risk**  
   Fix: `api.track-cart` ও `api.track-visit` এ tenant context validation যুক্ত করা হয়েছে.
4. **Cross-tenant product data leak risk in public page routes**  
   Fix: `o.$slug` এবং `p.$slug` এ product query-তে `products.storeId` filter বাধ্যতামূলক করা হয়েছে.
5. **Resilience hardening (cart tracking)**  
   Fix: product images JSON parsing safe করা হয়েছে (invalid JSON এ fail-open without crash).

### ভেরিফিকেশন
- ✅ `vitest`: `tests/api/create-order.test.ts` (21/21 pass)
- ⚠️ `typecheck` currently fails for pre-existing unrelated issues in other files (unchanged by this review)
- ✅ Edited files pass eslint with no errors

### অফিসিয়াল বেস্ট-প্র্যাকটিস রেফারেন্স (Reviewed)
- OWASP API Security Top 10 (API1: Broken Object Level Authorization):  
  https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- React Router / Remix-style route actions and server-side handling:  
  https://reactrouter.com/home
- Cloudflare Workers KV docs (consistency + cache behavior):  
  https://developers.cloudflare.com/kv/
- Cloudflare D1 docs (parameterized queries / prepared statements):  
  https://developers.cloudflare.com/d1/worker-api/prepared-statements/

## রিভিউ লগ (Sequential)

### #1 টেন্যান্ট/স্টোর সেটআপ - Findings (2026-02-12)
1. `app.settings._index` action থেকে `customDomain` সরাসরি update করা যাচ্ছিল।  
   Risk: paid-plan/domain-verification flow bypass হয়ে যেতে পারত।
2. `register()` সার্ভিসে auto-generated subdomain normalization fallback যথেষ্ট strict ছিল না।

### #1 টেন্যান্ট/স্টোর সেটআপ - Fixes Applied
1. `apps/web/app/routes/app.settings._index.tsx`
   - Generic settings route থেকে custom domain mutation block করা হয়েছে।
   - এখন domain পরিবর্তন করতে হলে `app/settings/domain` flow ব্যবহার বাধ্যতামূলক।
2. `apps/web/app/services/auth.server.ts`
   - `register()` এ fallback subdomain generation hardened (invalid chars -> hyphen normalize).

### #2 স্টোরফ্রন্ট - Findings (2026-02-12)
1. `thank-you` route-এ order lookup tenant-scoped ছিল না।  
   Risk: cross-store order details exposure (customer phone/address leak).
2. Category slug generation ASCII-only ছিল, ফলে বাংলা/Unicode category link broken হচ্ছিল।

### #2 স্টোরফ্রন্ট - Fixes Applied
1. `apps/web/app/routes/thank-you.$orderId.tsx`
   - `resolveStore()` যুক্ত করা হয়েছে।
   - order fetch-এ `orders.storeId` filter বাধ্যতামূলক করা হয়েছে।
2. `apps/web/app/routes/categories.tsx`
   - Unicode-safe category slug generation (`encodeURIComponent`) যুক্ত করা হয়েছে।
3. `apps/web/app/routes/category.$slug.tsx`
   - slug decode + normalization যুক্ত করা হয়েছে।
   - category navigation slug একই Unicode-safe strategy-তে unified করা হয়েছে।

### #2 ডক্স ভেরিফিকেশন
- OWASP API1:2023 (Object-level auth বাধ্যতামূলক):  
  https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/
- MDN `encodeURIComponent` (URI component safe encoding):  
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent

### #3 প্রোডাক্ট & ক্যাটালগ ম্যানেজমেন্ট - Findings (2026-02-12)
1. `app.products._index` bulk actions-এ incoming `productIds` store-ownership verify করা হচ্ছিল না।  
   Risk: crafted request দিয়ে cross-tenant product publish/unpublish/delete attempt সম্ভব ছিল।
2. `api.upload-image` route-এ authentication check ছিল না, এবং folder user-controlled ছিল।  
   Risk: unauthorized uploads + unscoped object key creation.
3. `api.delete-image` route-এ authenticated হলেও store-owned key scope enforce ছিল না।  
   Risk: অন্য store-এর object key delete attempt.

### #3 প্রোডাক্ট & ক্যাটালগ ম্যানেজমেন্ট - Fixes Applied
1. `apps/web/app/routes/app.products._index.tsx`
   - প্রথমে selected product list থেকে `ownedProductIds` resolve করা হয়েছে (`storeId` scoped)।
   - delete/publish/unpublish এবং related cleanup queries এখন `ownedProductIds`-এ সীমাবদ্ধ।
2. `apps/web/app/routes/api.upload-image.ts`
   - authenticated store check (`getStoreId`) যোগ করা হয়েছে।
   - folder whitelist (`products|logos|banners|temp`) enforced।
   - R2 key store-scoped করা হয়েছে: `stores/{storeId}/{folder}/...`.
3. `apps/web/app/routes/api.delete-image.ts`
   - delete key must start with `stores/{storeId}/` enforced।
   - cross-store key delete request হলে `403`.

### #3 ডক্স ভেরিফিকেশন
- OWASP API1:2023 (Object-level authorization):  
  https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/
- OWASP File Upload Cheat Sheet:  
  https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html

### #4 অর্ডার ম্যানেজমেন্ট - Findings (2026-02-12)
1. `app.orders._index` route-এ status update allow-list ছিল, কিন্তু lifecycle transition guard ছিল না।  
   Risk: invalid transitions (e.g., `pending -> delivered`) থেকে inventory/operations inconsistency।
2. `app.orders.$id` route-এ inventory restore/re-deduct এ product/variant update store ownership guard ছাড়া হচ্ছিল।  
   Risk: compromised `order_items` reference থাকলে cross-tenant inventory mutation সম্ভব।
3. `app.orders.$id` loader-এ order item product image fetch-এ `storeId` filter ছিল না।  
   Risk: cross-tenant product metadata read leakage (edge-case data integrity breach)।
4. `resources.order-invoice.$orderId` route-এ orderId validation weak ছিল (`Number(...)` implicit), এবং items fetch param-id direct use করছিল।  
   Risk: defensive validation gap; enterprise-grade strictness কম।
5. `app.settings.discounts` route-এ server-side coupon validation/uniqueness hardening ছিল না।  
   Risk: duplicate coupon ambiguity + invalid discount config (`percentage > 100`, invalid `maxUses`)।

### #4 অর্ডার ম্যানেজমেন্ট - Fixes Applied
1. `apps/web/app/routes/app.orders._index.tsx`
   - `isOrderStatus` + `assertOrderStatusTransition` enforced করা হয়েছে।
   - update-এর আগে current status fetch করে transition validate করা হচ্ছে।
2. `apps/web/app/routes/app.orders.$id.tsx`
   - inventory re-deduct/update-এ `products.storeId = currentStoreId` guard যোগ করা হয়েছে।
   - variant inventory update-এ `exists (...) join products` scoped check যোগ করা হয়েছে।
   - order item image fetch-এ product query store-scoped করা হয়েছে।
3. `apps/web/app/routes/resources.order-invoice.$orderId.tsx`
   - strict numeric `orderId` validation (`Number.isInteger && > 0`) যোগ হয়েছে।
   - items query scoped by resolved order id (`order.id`) করা হয়েছে।
4. `apps/web/app/routes/app.settings.discounts.tsx`
   - strict input validation: code pattern, type enum, numeric bounds, date validity।
   - duplicate code prevention (same store) for create/update।
   - invalid ID guard added for update/delete/toggle intents।

### #4 ডক্স ভেরিফিকেশন
- OWASP API Security Top 10 2023 (BOLA / object-level authorization):  
  https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/
- OWASP Input Validation Cheat Sheet:  
  https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
- Cloudflare D1 docs (SQL API + transactions note / batch guidance):  
  https://developers.cloudflare.com/d1/worker-api/d1-database/
- Cloudflare D1 prepared statements:  
  https://developers.cloudflare.com/d1/worker-api/prepared-statements/

### #5 পেমেন্ট (বাংলাদেশ ফোকাস) - Findings (2026-02-12)
1. `checkout` UI-তে `rocket` payment option ছিল, কিন্তু `api.create-order` schema-তে `rocket` allowed ছিল না।  
   Risk: valid merchant-configured payment flow backend validation-এ fail (false negative order rejection)।
2. `api.create-order`-এ non-COD payment এর জন্য server-side mandatory validation ছিল না (`transaction_id`, sender number)।  
   Risk: incomplete/fake payment metadata সহ order creation, reconciliation দুর্বল।
3. `api.create-order` `stripe` method accept করছিল, কিন্তু প্রকৃত Stripe checkout + webhook completion flow wired ছিল না।  
   Risk: unpaid order pending state-এ create হয়ে business ও reporting inconsistency।
4. `resources.invoice.$paymentId` route-এ strict numeric ID validation ছিল না।  
   Risk: defensive validation gap (enterprise hardening expectation mismatch)।

### #5 পেমেন্ট (বাংলাদেশ ফোকাস) - Fixes Applied
1. `apps/web/app/routes/api.create-order.ts`
   - payment method enum align করা হয়েছে: `cod|bkash|nagad|rocket|stripe`.
   - non-COD payment এ `transaction_id` + `manual_payment_details.senderNumber` mandatory করা হয়েছে।
   - sender phone format server-side BD regex দিয়ে validate করা হয়েছে।
   - `manual_payment_details.method` mismatch হলে request reject করা হয়।
   - store-level `manualPaymentConfig` অনুযায়ী method enabled না থাকলে request reject করা হয়।
   - `stripe` path বর্তমানে explicit block করা হয়েছে (`PAYMENT_METHOD_UNAVAILABLE`) যতক্ষণ পর্যন্ত full checkout+webhook flow enable না হয়।
   - order insert payment union-এ `rocket` include করা হয়েছে।
2. `packages/database/src/schema.ts`
   - `checkout_sessions.payment_method` type union-এ `rocket` যোগ করা হয়েছে (app-level type consistency)।
3. `apps/web/app/routes/resources.invoice.$paymentId.tsx`
   - `paymentId` strict numeric validation (`Number.isInteger && > 0`) যোগ করা হয়েছে।
   - query-তে validated `paymentId` variable use করা হয়েছে।

### #5 ডক্স ভেরিফিকেশন
- Stripe official docs: fulfill Checkout with webhooks (client redirect alone is insufficient):  
  https://docs.stripe.com/payments/checkout/custom-success-page
- Stripe official docs: webhook signature verification (`Stripe-Signature` required):  
  https://docs.stripe.com/webhooks/signature
- OWASP Input Validation Cheat Sheet:  
  https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html
- OWASP API Security Top 10 (authz/data integrity context):  
  https://owasp.org/API-Security/editions/2023/en/0x11-t10/

### #6 Functional Stability (Storefront Theme Rendering) - Findings (2026-02-12)
1. `resolveStarterStoreTheme()` এ `configWithSecondary.secondaryColor` direct access ছিল।  
   Risk: `config` undefined হলে storefront render crash (`Cannot read properties of undefined (reading 'secondaryColor')`), product/cart page E2E fail।

### #6 Functional Stability - Fixes Applied
1. `apps/web/app/components/store-templates/starter-store/theme.ts`
   - `configWithSecondary?.secondaryColor` optional chaining যোগ করা হয়েছে।
   - `config` missing হলেও resolver এখন safe fallback color resolve করে।
2. `apps/web/app/components/store-templates/starter-store/theme.test.ts`
   - regression test যোগ করা হয়েছে:
   - `resolveStarterStoreTheme(undefined, undefined)` should not throw।
   - secondary color fallback expected behavior verify।

### #6 ডক্স ভেরিফিকেশন
- TypeScript 3.7 optional chaining (`?.`) official release notes:  
  https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html
- MDN optional chaining operator reference:  
  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining

### #1-#6 Functional Validation Snapshot (2026-02-12)
- ✅ Passed: `tests/api/auth.test.ts` (16), `tests/api/auth-hardening.test.ts` (4), `tests/api/create-order.test.ts` (21), `tests/unit/discount.service.test.ts` (10)
- ✅ Passed: `app/components/store-templates/starter-store/theme.test.ts` (2)
- ✅ Passed: Playwright `e2e/smoke.test.ts` (3/3, Chromium)
- Notes:
  - Local migration blockers resolved in this review stream:
  - `packages/database/src/migrations/0056_customer_email_optional.sql` customers table rebuild columns completed
  - `packages/database/src/migrations/0085_fix_page_revisions_fk.sql` FK target corrected (`users.id`)
  - E2E smoke test currently uses Remix `?_data` style calls for seed/order helper endpoints and emits single-fetch warning in dev logs; functionality passes, but endpoint call style should be modernized in a follow-up.

### #7 থিম/ডিজাইন (MVP Simple Theme System) - Findings (2026-02-12)
1. MVP theme allow-list দুই জায়গায় inconsistent ছিল।  
   Risk: UI-তে hidden theme IDs (`ghorer-bazar`, `tech-modern`) POST করে activate করা যাচ্ছিল।
2. `app.store.settings` action-এ server-side input normalization incomplete ছিল (store name length, logo/favicon URL scheme, color fallback path)।  
   Risk: invalid style/config values persist হয়ে storefront rendering consistency নষ্ট হতে পারত।
3. `saveMVPSettings()` update path-এ `themeId` column sync হচ্ছিল না (শুধু `settingsJson` update)।  
   Risk: database state drift (row-level `themeId` vs JSON `themeId` mismatch), future query/migration inconsistency।

### #7 থিম/ডিজাইন - Fixes Applied
1. `apps/web/app/config/mvp-theme-settings.ts`
   - `MVP_THEME_IDS` কে বর্তমান MVP active set-এ align করা হয়েছে: `starter-store`, `luxe-boutique`, `nova-lux`।
2. `apps/web/app/routes/app.store.settings.tsx`
   - server-side normalization যোগ করা হয়েছে:
   - `storeName` trim + max length guard
   - `announcementText` max length guard
   - `logo`/`favicon` এর জন্য http/https URL allow করা হয়েছে; invalid URL persist করা হচ্ছে না
   - visual settings `validateMVPSettings()` দিয়ে normalize/fallback করা হয়েছে।
3. `apps/web/app/services/mvp-settings.server.ts`
   - existing settings update-এর সময় `themeId` column-ও update করা হচ্ছে (state consistency)।
4. `apps/web/tests/unit/mvp-theme-settings.test.ts`
   - regression assertion যোগ: hidden themes invalid (`ghorer-bazar`, `tech-modern`)।

### #7 ডক্স ভেরিফিকেশন
- Shopify theme architecture & settings metadata (theme settings patterns / controlled options):  
  https://shopify.dev/docs/storefronts/themes/architecture/config/settings-schema-json
- MDN URL API (`URL()` parsing and protocol checks for input normalization):  
  https://developer.mozilla.org/en-US/docs/Web/API/URL
- OWASP Input Validation Cheat Sheet (server-side allow-list validation):  
  https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html

### #1-#7 Functional Validation Snapshot (2026-02-12)
- ✅ Passed: `tests/api/auth.test.ts` (16), `tests/api/auth-hardening.test.ts` (4), `tests/api/create-order.test.ts` (21), `tests/unit/discount.service.test.ts` (10)
- ✅ Passed: `tests/unit/mvp-theme-settings.test.ts` (3), `tests/unit/store-registry-active-themes.test.ts` (2)
- ✅ Passed: `app/components/store-templates/starter-store/theme.test.ts` (2)
- ✅ Passed: Playwright `e2e/smoke.test.ts` (3/3, Chromium)

### #8 অ্যাডমিন প্যানেল (Team/Admin Module) - Findings (2026-02-12)
1. `app.settings.team` invite action-এ role runtime allow-list enforce করা ছিল না।  
   Risk: crafted request দিয়ে unsupported/privileged role injection attempt।
2. Existing user invite flow-এ cross-store membership conflict block করা ছিল না।  
   Risk: অন্য store-এর existing accountকে নতুন store-এ attach করার state corruption।
3. `invite.$token` accept flow invite role সরাসরি `users.role`-এ set করছিল (viewer/admin mapping boundary ছাড়া)।  
   Risk: role/data integrity mismatch; privilege model drift।
4. `app.settings.team` permissions update query `users.id` only condition use করছিল।  
   Risk: defensive tenant-scope strictness কম (TOCTOU hardening gap)।

### #8 অ্যাডমিন প্যানেল - Fixes Applied
1. `apps/web/app/routes/app.settings.team.tsx`
   - invite role allow-list enforce করা হয়েছে: `admin|staff|viewer`.
   - existing user যদি অন্য store-এর member হয়, invite reject (`409 userBelongsToAnotherStore`)।
   - `admin` invite শুধুমাত্র owner (`merchant`) করতে পারবে।
   - `updatePermissions` query-তে `users.storeId = storeId` guard যোগ করা হয়েছে।
   - store lookup fail হলে explicit `404` return।
2. `apps/web/app/routes/invite.$token.tsx`
   - invite role normalization যোগ করা হয়েছে।
   - invite role → user role safe mapping:
   - `admin -> admin`
   - `staff/viewer -> staff` (users table role compatibility)
   - `viewer` invite-এর জন্য restricted permissions JSON set করা হয়েছে (least-privilege)।
   - existing `super_admin` account invite-link দিয়ে relink/role override block করা হয়েছে।

### #8 ডক্স ভেরিফিকেশন
- OWASP Authorization Cheat Sheet (least privilege, deny-by-default):  
  https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- OWASP Access Control Cheat Sheet (server-side enforcement):  
  https://cheatsheetseries.owasp.org/cheatsheets/Access_Control_Cheat_Sheet.html
- NIST RBAC standard reference (role assignment/constraints principles):  
  https://csrc.nist.gov/projects/role-based-access-control

### #1-#8 Functional Validation Snapshot (2026-02-12)
- ✅ Passed: `tests/api/auth.test.ts` (16), `tests/api/auth-hardening.test.ts` (4), `tests/api/create-order.test.ts` (21), `tests/unit/discount.service.test.ts` (10)
- ✅ Passed: `tests/unit/mvp-theme-settings.test.ts` (3), `tests/unit/store-registry-active-themes.test.ts` (2)
- ✅ Passed: `app/components/store-templates/starter-store/theme.test.ts` (2)
- ✅ Passed: Playwright `e2e/smoke.test.ts` (3/3, Chromium)

### #9 কাস্টমার ফিচার (Guest Checkout + Account + Order Tracking) - Findings (2026-02-12)
1. `account.orders` search UI (`q`) ছিল, কিন্তু loader/query-তে apply হচ্ছিল না।  
   Risk: functional mismatch (user search input ineffective)।
2. `account.orders` pagination links status preserve করলেও search query preserve করছিল না।  
   Risk: poor UX + incorrect filtered navigation।
3. `account.orders.$id`-এ `shippingAddress`/`pricingJson` unsafe `JSON.parse` ছিল।  
   Risk: malformed JSON হলে route crash (500), customer order details unavailable।
4. `account` layout login redirect requested pathname-এর search অংশ preserve করছিল না।  
   Risk: post-login return path drift (query-dependent UX break)।
5. `account` route-এ `AccountHeader`-এ nullable `user.name` সরাসরি pass হচ্ছিল (type safety issue)।  
   Risk: type/runtime inconsistency in customer account header rendering।

### #9 কাস্টমার ফিচার - Fixes Applied
1. `apps/web/app/services/customer-account.server.ts`
   - `getCustomerOrdersWithItems(...)`-এ optional `search` parameter যোগ।
   - order query-তে `orderNumber LIKE %q%` filter যুক্ত করা হয়েছে।
2. `apps/web/app/routes/account.orders.tsx`
   - page param strict sanitize (`integer && > 0`)।
   - loader-এ `q` read করে service query-তে pass করা হয়েছে।
   - pagination links এখন `q` + `status` preserve করে।
   - search form-এ `page=1` reset maintained।
3. `apps/web/app/routes/account.orders.$id.tsx`
   - strict positive integer `orderId` validation।
   - `shippingAddress` ও `pricingJson` safe-parse fallback যোগ করা হয়েছে।
4. `apps/web/app/routes/account.tsx`
   - login redirect-এ `pathname + search` preserve।
   - `AccountHeader`-এ `userName` fallback (`Customer`) যোগ।

### #9 ডক্স ভেরিফিকেশন
- React Router `<Form method=\"get\">` query-string behavior:  
  https://reactrouter.com/docs/en/v6/components/form
- React Router `useSearchParams` navigation behavior:  
  https://reactrouter.com/api/hooks/useSearchParams
- MDN `JSON.parse()` (`SyntaxError` handling expectation):  
  https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
- MDN `URLSearchParams` API (query param handling rules):  
  https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams

### #1-#9 Functional Validation Snapshot (2026-02-12)
- ✅ Passed: Playwright `e2e/smoke.test.ts` (3/3, Chromium)
- ✅ `typecheck`: no new errors from reviewed #9 files; remaining errors are pre-existing in unrelated template/shared files.

### #10 সাবস্ক্রিপশন/প্ল্যান এনফোর্সমেন্ট - Findings (2026-02-12)
1. `checkUsageLimit()` app routes-এ ছিল, কিন্তু কিছু Hono API create endpoint-এ enforce হচ্ছিল না।  
   Risk: UI guard bypass করে direct API call দিয়ে plan limit (order/product) exceed করা যেত।
2. একই business flow-এর multiple endpoint-এ inconsistent enforcement ছিল।  
   Risk: plan system predictable/defensible না হয়ে endpoint-dependent behaviour তৈরি হচ্ছিল (enterprise policy drift)।

### #10 সাবস্ক্রিপশন/প্ল্যান এনফোর্সমেন্ট - Fixes Applied
1. `apps/web/server/api/routes/orders.ts`
   - `POST /api/orders` এ `checkUsageLimit(..., 'order')` বাধ্যতামূলক করা হয়েছে।
   - limit exceeded হলে `402` + structured payload (`code`, `limit`, `current`) return।
2. `apps/web/server/api/orders.ts`
   - duplicate order-create API path-এও একই `checkUsageLimit(..., 'order')` enforcement যোগ করা হয়েছে।
3. `apps/web/server/api/products.ts`
   - `POST /api/products` এ `checkUsageLimit(..., 'product')` যোগ করা হয়েছে।
   - limit exceeded হলে `402` + structured payload return।

### #10 ডক্স ভেরিফিকেশন
- OWASP API5:2023 Broken Function Level Authorization (all business functions need consistent authorization/enforcement):  
  https://owasp.org/API-Security/editions/2023/en/0xa5-broken-function-level-authorization/
- OWASP Authorization Cheat Sheet (`Validate the Permissions on Every Request`, `Deny by Default`):  
  https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
- Stripe Subscriptions overview (server-side entitlement/provisioning checks, webhook-driven truth for paid access):  
  https://docs.stripe.com/billing/subscriptions/overview

### #1-#10 Functional Validation Snapshot (2026-02-12)
- ✅ Passed: Playwright `e2e/smoke.test.ts` (3/3, Chromium)
- ✅ Hono/API create paths now enforce plan checks at code-level (`order`, `product`) before write.
- ⚠️ `typecheck` এখনও pre-existing unrelated files-এ fail করছে; #10 touched files থেকে নতুন type error পাওয়া যায়নি।

### #11 সিকিউরিটি & কমপ্লায়েন্স - Findings (2026-02-12)
1. Global error handler production-এ raw `err.message` return করছিল।  
   Risk: internal implementation/database errors client-এ leak হতে পারে (information disclosure)।
2. Rate-limit key defaultভাবে effectively IP-centric ছিল (tenant scope ছাড়া)।  
   Risk: একই NAT/IP শেয়ার করা multi-tenant traffic-এ এক store-এর spike অন্য store-কে collateral throttle করতে পারে।

### #11 সিকিউরিটি & কমপ্লায়েন্স - Fixes Applied
1. `apps/web/server/index.ts`
   - `app.onError` production response sanitize করা হয়েছে:
   - production: generic `Internal Server Error`
   - non-production: detailed message + stack allowed
2. `apps/web/server/middleware/rate-limit.ts`
   - tenant-aware keying যোগ করা হয়েছে (`host + ip`)।
   - default key এখন: `${tenantHost}:${clientIp}`।
   - ফলে rate-limit isolation multi-tenant context-এ আরও predictable/defensible।

### #11 ডক্স ভেরিফিকেশন
- OWASP Error Handling Cheat Sheet (generic external errors, detailed internal logs):  
  https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html
- Cloudflare Rate Limiting best practices (`counting characteristics` include tenant/account identifiers, not only IP):  
  https://developers.cloudflare.com/waf/rate-limiting-rules/best-practices/
- OWASP Authorization Cheat Sheet (deny-by-default + per-request enforcement consistency):  
  https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html

### #11 Backup Strategy Verification (Codebase/Runbook)
- Daily backup/restore runbook already documented and versioned:
  - `docs/MAINTENANCE_SECURITY.md`
  - `docs/D1_TIME_TRAVEL_RESTORE_DRILL_2026-02-08.md`
  - `docs/PRODUCTION_READINESS_CHECKLIST_2026-02-07.md`
- Production export commands exist:
  - `apps/web/package.json` (`db:export:prod`, `db:export:prod:schema`)

### #1-#11 Functional Validation Snapshot (2026-02-12)
- ✅ Passed: Playwright `e2e/smoke.test.ts` (3/3, Chromium)
- ✅ New hardening changes applied without smoke regression.
- ⚠️ `typecheck` এখনও pre-existing unrelated files-এ fail করছে; #11 touched files থেকে নতুন type error পাওয়া যায়নি।

### #12 অপারেশন/মনিটরিং - Findings (2026-02-12)
1. `admin.analytics`-এ plan usage (`max_orders`) হিসাব total lifetime orders দিয়ে হচ্ছিল।  
   Risk: monthly limit monitoring false-positive/over-reported (ops সিদ্ধান্তে ভুল)।
2. `admin.health`-এ 24h metrics raw SQL timestamp comparison fragile ছিল, এবং `fatal` level filter UI/query path-এ consistent ছিল না।  
   Risk: health dashboard accuracy কমে যাওয়া + critical logs filter mismatch।
3. `admin.health` logs query-তে empty filter array হলেও unconditional `and(...filters)` path ছিল।  
   Risk: query composition edge-case fragility (defensive robustness কম)।

### #12 অপারেশন/মনিটরিং - Fixes Applied
1. `apps/web/app/routes/admin.analytics.tsx`
   - monthly order stats আলাদা query করা হয়েছে (`createdAt >= monthStart`)।
   - `orderUsage` এখন monthly orders vs plan monthly limit দিয়ে calculate হচ্ছে।
   - analytics payload-এ `monthlyOrders` যোগ করা হয়েছে (ops observability clarity)।
2. `apps/web/app/routes/admin.health.tsx`
   - 24h metrics query Drizzle টাইপড query-তে convert করা হয়েছে (`gte(systemLogs.createdAt, oneDayAgo)`)।
   - search input trim + length cap করা হয়েছে।
   - log level allow-list যোগ হয়েছে (`all|info|warn|error|fatal`)।
   - UI filter buttons-এ `fatal` include করা হয়েছে।
   - logs query-তে `filters.length > 0 ? and(...filters) : undefined` guard যোগ হয়েছে।

### #12 ডক্স ভেরিফিকেশন
- Cloudflare health checks / uptime monitoring patterns (Worker health endpoint monitoring):  
  https://developers.cloudflare.com/health-checks/
- Sentry alerting & issue monitoring (error monitoring workflow):  
  https://docs.sentry.io/product/alerts/
- Drizzle ORM query operators (`and`, conditional filter composition best practices):  
  https://orm.drizzle.team/docs/operators

### #1-#12 Functional Validation Snapshot (2026-02-12)
- ✅ Passed: Playwright `e2e/smoke.test.ts` (3/3, Chromium)
- ✅ Monitoring accuracy fixes applied (`monthly order usage`, `fatal-aware health filtering`, `typed 24h metrics query`) without smoke regression।
- ⚠️ `typecheck` এখনও pre-existing unrelated files-এ fail করছে; #12 touched files থেকে নতুন type error পাওয়া যায়নি।

### #13 সিকিউরিটি & কমপ্লায়েন্স (Deep Hardening Pass) - Findings (2026-02-12)
1. CSRF origin guard শুধু `/app/*`-এ apply ছিল; `/admin/*` mutation routes guard-এর বাইরে ছিল।  
   Risk: authenticated super-admin session target করে cross-site form submission সম্ভব (admin action CSRF surface)।
2. `verifyPassword()`-এ verbose debug logs (hash length/flow) ছিল এবং hash compare early-break pattern follow করছিল।  
   Risk: sensitive auth internals অতিরিক্ত log exposure + avoidable timing side-channel risk।
3. `checkLoginAnomalies()`-এ raw SQL timestamp compare path fragile ছিল (`created_at` unit mismatch risk) এবং query pattern typed guard ছাড়া ছিল।  
   Risk: brute-force anomaly detection false negative/unstable হতে পারে।

### #13 সিকিউরিটি & কমপ্লায়েন্স - Fixes Applied
1. `apps/web/server/index.ts`
   - `csrfOriginGuard()` `/admin/*` path-এও apply করা হয়েছে (admin mutations এখন same-origin verify enforced)।
2. `apps/web/app/services/auth.server.ts`
   - `verifyPassword()` থেকে debug-heavy logs remove করা হয়েছে।
   - hash comparison constant-time style (`xor accumulate`) করা হয়েছে; early-break compare বাদ।
3. `apps/web/app/services/security.server.ts`
   - login anomaly counters typed Drizzle query-তে migrate করা হয়েছে।
   - `gte(systemLogs.createdAt, tenMinutesAgo)` ব্যবহার করা হয়েছে (timestamp-mode safe comparison)।
   - nullable `context` safe matching (`COALESCE`) যোগ করা হয়েছে।

### #13 ডক্স ভেরিফিকেশন
- OWASP CSRF Prevention Cheat Sheet (Origin/Referer validation + defense-in-depth guidance):  
  https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- OWASP HTTP Headers Cheat Sheet (security headers/CORS hardening context):  
  https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
- NIST SP 800-63B (latest, verifier-side secret handling and online attack throttling principles):  
  https://pages.nist.gov/800-63-4/sp800-63b.html

### #1-#13 Functional Validation Snapshot (2026-02-12)
- ✅ Passed: Playwright `e2e/smoke.test.ts` (3/3, Chromium)
- ✅ CSRF coverage expanded to admin mutation surface without smoke regression।
- ✅ Auth verification hardening applied (log minimization + constant-time style compare)।
- ⚠️ `typecheck` এখনও pre-existing unrelated files-এ fail করছে; #13 touched files থেকে নতুন type error পাওয়া যায়নি।

### #14 AI/ML Integration - Findings (2026-02-12)
1. `api.ai.action`-এ featured product context lookup `products.id` দিয়ে হচ্ছিল, কিন্তু `storeId` ownership filter ছিল না।  
   Risk: crafted product ID দিয়ে অন্য store-এর product context AI prompt-এ টেনে আনা সম্ভব (cross-tenant data exposure)।
2. Omnichannel `agent-chat` endpoint-এ incoming `agentId`/`conversationId` ownership strictভাবে verify হচ্ছিল না।  
   Risk: cross-tenant/cross-agent conversation probing বা message injection attempt।
3. `api.ai-orchestrator` switch-এ unsupported channel path explicit default branch ছাড়া ছিল।  
   Risk: undefined control flow (defensive API behavior দুর্বল)।
4. `api.ai.action` error response-এ internal `details` সব environment-এ return হচ্ছিল।  
   Risk: backend internals leak (AI provider/schema/runtime errors)।

### #14 AI/ML Integration - Fixes Applied
1. `apps/web/app/routes/api.ai.action.ts`
   - featured product query store-scoped করা হয়েছে: `products.id + products.storeId`।
   - production error response-এ internal `details` suppress করা হয়েছে।
2. `apps/web/app/services/agent-chat.server.ts`
   - strict payload validation (`message`, `agentId`, `conversationId`) যোগ করা হয়েছে।
   - agent ownership check: `agentId` must belong to current `storeId`।
   - conversation ownership check: `conversationId` must belong to the same `agentId`।
3. `apps/web/app/services/agent.server.ts`
   - `processMessage()` শুরুতেই conversation-agent binding validate করা হয়েছে।
4. `apps/web/app/routes/api.ai-orchestrator.ts`
   - explicit `default` branch যোগ করা হয়েছে (`Unsupported channel` -> `400`)।

### #14 ডক্স ভেরিফিকেশন
- OWASP API1:2023 Broken Object Level Authorization (ID-based object access must enforce ownership):  
  https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/
- OWASP API3:2023 Broken Object Property Level Authorization (sensitive object properties/data exposure):  
  https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/
- Cloudflare Vectorize metadata filtering (tenant-scoped vector retrieval patterns via metadata filters):  
  https://developers.cloudflare.com/vectorize/reference/metadata-filtering/

### #1-#14 Functional Validation Snapshot (2026-02-12)
- ✅ Passed: Playwright `e2e/smoke.test.ts` (3/3, Chromium)
- ✅ AI path hardening applied without smoke regression।
- ⚠️ `typecheck` এখনও pre-existing unrelated files-এ fail করছে; #14 touched files থেকে নতুন type error পাওয়া যায়নি।

### #15 Troubleshooting & Debugging Readiness - Findings (2026-02-12)
1. `debug-env` route production-safe ছিল না এবং environment key inventory expose করছিল।  
   Risk: deployment/config reconnaissance সহজ হয়ে যাওয়া; troubleshooting endpoint abuse surface।
2. suspicious request tracker logs-এ full client IP লেখা হচ্ছিল।  
   Risk: unnecessary PII logging for debug telemetry।

### #15 Troubleshooting & Debugging Readiness - Fixes Applied
1. `apps/web/app/routes/debug-env.tsx`
   - production-এ route hard-disabled করা হয়েছে (`404`)।
   - staging-এ super-admin auth mandatory করা হয়েছে (`requireSuperAdmin`)।
   - output sanitize করা হয়েছে: raw key তালিকা/length expose বাদ, শুধু safe boolean diagnostics রাখা হয়েছে।
2. `apps/web/server/lib/debug/request-tracker.ts`
   - suspicious event log-এ IP masking যোগ করা হয়েছে (`a.b.x.x` / partial IPv6)।
   - troubleshooting signal রেখে PII exposure কমানো হয়েছে।

### #15 ডক্স ভেরিফিকেশন
- OWASP Logging Cheat Sheet (PII minimization + avoid sensitive data in logs):  
  https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
- Cloudflare Workers secrets/env bindings best practices (do not expose bindings/secrets to clients):  
  https://developers.cloudflare.com/workers/configuration/secrets/
- Sentry environments best practices (staging-only diagnostics flow):  
  https://docs.sentry.io/platforms/javascript/guides/remix/configuration/environments/

### #1-#15 Functional Validation Snapshot (2026-02-12)
- ✅ Passed: Playwright `e2e/smoke.test.ts` (3/3, Chromium)
- ✅ Troubleshooting endpoints are now environment-gated and safer for production operation।
- ⚠️ `typecheck` এখনও pre-existing unrelated files-এ fail করছে; #15 touched files থেকে নতুন type error পাওয়া যায়নি।

### #16 Deployment & Ops - Findings (2026-02-12)
1. `apps/web/workers/deploy-all.sh` এ `set -e` থাকা অবস্থায় loop-এর ভেতর non-zero return হলে script early-exit করছিল; ফলে full deployment summary deterministic না।  
   Risk: partial deployment হয়ে গেলেও remaining workers-এর status এক run-এ পাওয়া যায় না (incident triage slow)।
2. `apps/web/workers/verify-deployment.sh` এ counter increment pattern (`((PASSED++))`) `set -e` context-এ brittle ছিল, এবং global `wrangler` dependency assume করছিল।  
   Risk: verification script environment-dependent behaviour (CI/dev machine drift), false failure বা premature stop।
3. Main app deployment defaults (`apps/web/package.json` + `apps/web/wrangler.toml`) explicit production path enforce করছিল না, এবং runtime compatibility date project standard-এর সাথে drift ছিল।  
   Risk: release flow inconsistency + runtime baseline mismatch।
4. `run_worker_first` config value implementation intent-এর সাথে inconsistent ছিল।  
   Risk: asset/API routing behavior documentation vs runtime configuration mismatch (ops debugging complexity)।

### #16 Deployment & Ops - Fixes Applied
1. `apps/web/workers/deploy-all.sh`
   - `set -euo pipefail` করা হয়েছে।
   - worker loop-এ failure handle করে run continue করা হয়েছে, যাতে full summary (`DEPLOYED/FAILED/SKIPPED`) always produce হয়।
2. `apps/web/workers/verify-deployment.sh`
   - `set -euo pipefail` + `${1:-}` argument guard যোগ করা হয়েছে।
   - counter increments safe pattern (`+=1`) এ fix করা হয়েছে।
   - global CLI dependency বাদ দিয়ে workspace-pinned `wrangler` (`npx --prefix apps/web wrangler`) ব্যবহার করা হয়েছে।
   - `run_worker_first = true` explicit verification যোগ করা হয়েছে।
   - deployment next-step output production-safe command এ align করা হয়েছে।
3. `apps/web/wrangler.toml`
   - `compatibility_date` → `2025-04-14` (project runtime standard alignment)।
   - `run_worker_first = true` করা হয়েছে এবং behavior comment আপডেট করা হয়েছে।
4. `apps/web/package.json`
   - `deploy` script এখন explicit production deploy path (`deploy:prod`) follow করে।

### #16 ডক্স ভেরিফিকেশন
- Cloudflare Workers static assets `run_worker_first` semantics (worker-first vs asset-first routing):  
  https://developers.cloudflare.com/workers/static-assets/routing/run-worker-first/
- Cloudflare Workers compatibility dates (runtime behavior pinning and upgrade model):  
  https://developers.cloudflare.com/workers/configuration/compatibility-dates/
- Cloudflare Workers versions + rollback guidance (deployment safety/rollback operation):  
  https://developers.cloudflare.com/workers/configuration/versions-and-deployments/rollbacks/
- Wrangler environments (`--env`) for explicit environment-targeted deployments:  
  https://developers.cloudflare.com/workers/wrangler/environments/

### #16 Functional Validation Snapshot (2026-02-12)
- ✅ Passed: `bash apps/web/workers/verify-deployment.sh --quick`
- ✅ Passed: `bash apps/web/workers/verify-deployment.sh` (22 passed, 0 warnings, 0 errors)
- ✅ Passed: `bash -n apps/web/workers/deploy-all.sh`
- ✅ Passed: `bash -n apps/web/workers/verify-deployment.sh`

### #17 API Reference - Findings (2026-02-12)
1. `docs/API_REFERENCE.md` বাস্তব implementation থেকে drift করেছিল (deprecated/absent endpoints listed, old tenant domain examples, request schema mismatch)।  
   Risk: API consumers wrong contract follow করলে integration break/ops confusion তৈরি হয়।
2. API key auth flow-তে `401/403` responses এ `WWW-Authenticate` challenge header consistent ছিল না।  
   Risk: standards-compliant API clients/token middleware proper auth fallback করতে পারে না।
3. কিছু API route query parsing weak ছিল (`page/limit` negative/invalid values, free-form status), এবং product JSON fields parse-এ unsafe `JSON.parse` ছিল।  
   Risk: runtime errors + unpredictable API behavior under malformed input।
4. write-only endpoint method contract explicit ছিল না (`api.create-order` GET info response দিত)।  
   Risk: API contract ambiguity (read vs write surface)।

### #17 API Reference - Fixes Applied
1. `docs/API_REFERENCE.md`
   - সম্পূর্ণ current-code aligned করা হয়েছে:
   - active endpoints, request/response behavior, auth modes (session vs API key), tenant domain examples (`*.ozzyl.com`)।
   - unavailable legacy gateway endpoint paths (`/api/bkash/*`, `/api/nagad/*`, `/api/stripe/*`) explicit note করা হয়েছে।
2. `apps/web/app/services/api.server.ts`
   - API key auth errors now include standards-aligned `WWW-Authenticate: Bearer ...` headers for `401`/`403` cases।
3. `apps/web/app/routes/api.v1.orders.ts`
   - `limit` strict validation (`1..100`)।
   - `status` allow-list validation যোগ করা হয়েছে।
4. `apps/web/app/routes/api.v1.products.ts`
   - `page`/`limit` strict validation যোগ করা হয়েছে।
   - `images`/`tags` safe JSON array parse করা হয়েছে (malformed DB payload crash এড়াতে)।
5. `apps/web/app/routes/api.upload-image.ts`
   - non-POST responses এ `405` + `Allow: POST` যোগ করা হয়েছে।
6. `apps/web/app/routes/api.create-order.ts`
   - `GET` loader এখন `405` + `Allow: POST` return করে (write-only contract hardening)।

### #17 ডক্স ভেরিফিকেশন
- RFC 9110 (HTTP Semantics): `405` হলে `Allow` header required  
  https://datatracker.ietf.org/doc/html/rfc9110
- RFC 6750 (Bearer token usage): protected resource responses and `WWW-Authenticate` challenge behavior  
  https://datatracker.ietf.org/doc/html/rfc6750
- MDN `405 Method Not Allowed` (practical semantics aligned with RFC 9110)  
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/405
- MDN `Allow` header reference  
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Allow
- OpenAPI specification (current version line for machine-readable API contracts)  
  https://spec.openapis.org/oas/latest.html

### #17 Functional Validation Snapshot (2026-02-12)
- ✅ Passed: `npx eslint app/services/api.server.ts app/routes/api.v1.orders.ts app/routes/api.v1.products.ts app/routes/api.upload-image.ts app/routes/api.create-order.ts`
- ✅ Passed: Playwright `e2e/smoke.test.ts` (3/3, Chromium)
- ⚠️ E2E run-এ পূর্ববর্তী environment/migration-related warnings ছিল, but #17 touched files-এ regression পাওয়া যায়নি।
- ✅ Added machine-readable API contract: `docs/openapi.yaml`
- ✅ Added contract test: `apps/web/tests/unit/api-contract.test.ts` (OpenAPI path/security/operationId checks + `405 Allow: POST` behavior checks)
- ✅ Passed: `npx vitest run tests/unit/api-contract.test.ts` (4/4)
