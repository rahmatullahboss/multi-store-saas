# Launch Readiness - 2026-02-04

> Updated: **February 4, 2026**  
> Scope: MVP storefront/settings hardening + launch preparation

## ✅ এই sprint-এ যা করা হয়েছে

### 1) Product tabs (real data, no demo fallback)
- `Specifications` এবং `Shipping & Returns` tabs এখন product-level data থেকে আসবে।
- Product create/edit form-এ নতুন optional fields যোগ করা হয়েছে:
  - `material`, `weight`, `dimensions`, `origin`, `warranty`
  - `shippingInfo`, `returnPolicy`
- এসব data metafields-এ save/read হচ্ছে।

Changed files:
- `apps/web/app/lib/product-details.server.ts`
- `apps/web/app/routes/app.products.new.tsx`
- `apps/web/app/routes/app.products.$id.tsx`
- `apps/web/app/routes/products.$id.tsx`

### 2) Settings reliability hardening (enterprise baseline - phase 1)
- SEO settings route-এ input validation (Zod) + normalization + activity audit log।
- Payment settings route-এ input validation (Zod) + BD phone format validation + activity audit log।

Changed files:
- `apps/web/app/routes/app.settings.seo.tsx`
- `apps/web/app/routes/app.settings.payment.tsx`

### 3) Settings wiring fix (previous deploy batch)
- Courier settings save/test flow থেকে `courierSettings` sync fix।
- SEO save থেকে landing/store meta sync fix।
- Landing settings page থেকে non-working toggle UI clean-up।

### 4) Settings hardening phase 2 (implemented)
- `shipping`, `courier`, `domain`, `navigation`, `webhooks` routes-এ server-side hardening করা হয়েছে:
  - Zod-based input validation / action guard
  - Activity audit log enrichment (`section`, `intent`, key flags)
  - Safer tenant-scoped operations (`shipping` update/delete now store-scoped)

Changed files:
- `apps/web/app/routes/app.settings.shipping.tsx`
- `apps/web/app/routes/app.settings.courier.tsx`
- `apps/web/app/routes/app.settings.domain.tsx`
- `apps/web/app/routes/app.settings.navigation.tsx`
- `apps/web/app/routes/app.settings.webhooks.tsx`

### 5) Storefront performance pass 1 (implemented)
- Root-level duplicate Google Fonts request source remove করা হয়েছে:
  - `root.tsx` থেকে global Google font stylesheet/preload remove
  - `tailwind.css` থেকে Google Fonts `@import` remove
- LCP hero image optimization for active templates:
  - `starter-store` already optimized ছিল (kept)
  - `nova-lux` hero-এ Unsplash optimization + `srcset` + `sizes` + `fetchpriority="high"` + eager loading add
  - `FullStoreTemplate` hero-এ একই optimization add

Changed files:
- `apps/web/app/root.tsx`
- `apps/web/app/styles/tailwind.css`
- `apps/web/app/components/store-templates/nova-lux/index.tsx`
- `apps/web/app/components/templates/FullStoreTemplate.tsx`

### 6) Storefront performance pass 2 (implemented)
- Image delivery pipeline hardened for MVP templates using Cloudflare edge resize path:
  - `api.proxy-image` route now supports `w`, `h`, `q` and applies CF image transforms.
  - New shared helpers added to generate proxy image URL + responsive `srcset`.
- Applied responsive product image delivery (`srcset`, `sizes`, lazy decode) in active MVP templates:
  - `starter-store`, `nova-lux`, `nova-lux-ultra`, `tech-modern`, `luxe-boutique`, `FullStoreTemplate`.
- Hero image fallback optimization improved for non-Unsplash origins via proxy resize path.

Changed files:
- `apps/web/app/routes/api.proxy-image.ts`
- `apps/web/app/utils/imageOptimization.ts`
- `apps/web/app/components/templates/FullStoreTemplate.tsx`
- `apps/web/app/components/store-templates/starter-store/index.tsx`
- `apps/web/app/components/store-templates/starter-store/sections/ProductCard.tsx`
- `apps/web/app/components/store-templates/nova-lux/index.tsx`
- `apps/web/app/components/store-templates/nova-lux-ultra/index.tsx`
- `apps/web/app/components/store-templates/tech-modern/index.tsx`
- `apps/web/app/components/store-templates/luxe-boutique/index.tsx`

### 7) Settings audit (MVP reliability)
- Settings save + storefront wiring status documented in:
  - `docs/MVP_SETTINGS_AUDIT_2026-02-04.md`

## 🚀 Latest deployed versions
- `42c622cb-467e-4886-aed1-f5a5824cc42a` (latest)
- `b26ab9ee-5d1d-40d1-a81b-74785627bdd5`
- `6496e79f-689c-4ebc-8c25-d4e82ff23e99`
- `de7f9bca-967d-45aa-808a-57cf0ed89fdc`
- `c5c8c81a-0ba0-4678-828f-f412aed9821b`

## 🟡 কী কী বাকি (high priority)

### A) Settings hardening phase 2 follow-up
- Cross-route error payload standardization (`code`, `message`, `fieldErrors`)।
- Unit tests for settings action validation and tenant-scope guards।
- Console/info log cleanup in domain settings route to pass strict lint policy।

### B) Storefront performance + Core Web Vitals
- Render-blocking CSS reduce/split (critical CSS strategy) — এখনও pending।
- Font self-hosting/subset migration (template-level) — pending।
- Re-run Lighthouse/PWV after deploy and set hard budgets per template (desktop/mobile) — pending।

### C) Observability & incident readiness
- Worker trace/logpush with version tag enabled করা।
- settings update failures-এর জন্য alerting baseline।
- error budget style dashboards (5xx rate, p95 latency, checkout failures)।

### D) Go-live operational readiness
- Backup/restore runbook (D1 + R2) rehearsal।
- Payment webhook replay/idempotency smoke test।
- Domain onboarding SOP + merchant support FAQ finalization।

## ✅ Launch করার আগে must-do checklist

1. **Critical path QA**
   - Signup → theme select → product add → checkout → order create → courier dispatch।
2. **Payment QA**
   - COD + manual bKash/Nagad payment instruction flow verify।
3. **Settings QA**
   - SEO, Shipping, Payment, Courier, Domain save → storefront effect verify।
4. **Performance gate**
   - Homepage + product page Lighthouse/PWV baseline capture and pass threshold set।
5. **Security gate**
   - tenant isolation spot-check (store_id filters), secret/config audit, WAF rules active।
6. **Ops gate**
   - rollback-tested deployment run এবং on-call playbook ready।

## Proposed immediate next execution order

1. Performance fixes (LCP + render-blocking)  
2. End-to-end launch QA runbook execution  
3. Ops/observability readiness  
4. Production launch window + rollback guard
