# Lead System Theme Edit/Development Guide (BN)

Last Updated: 2026-02-12
Scope: `apps/web` এর Lead Generation mode (storefront theme-engine না)

## 1) এই গাইড কোন সিস্টেমের জন্য
এই গাইড শুধুমাত্র **LeadGen renderer pipeline** এর জন্য:
- Lead mode detect হয় `apps/web/app/routes/_index.tsx`
- Render হয় `apps/web/app/components/lead-gen/LeadGenRenderer.tsx`
- Theme defaults/config থাকে `apps/web/app/config/lead-gen-theme-settings.ts`
- Settings save/load হয় `apps/web/app/services/lead-gen-settings.server.ts`
- Admin settings UI: `apps/web/app/routes/app.settings.lead-gen.tsx`

Note:
`apps/web/app/themes/*` (ThemeBridge sections/templates) আলাদা storefront/theme-engine path। LeadGen theme edit করতে গেলে ভুল করে ওদিকে edit করলে UI mismatch হতে পারে।

## 2) LeadGen request flow
1. Store homepage request আসে `apps/web/app/routes/_index.tsx` এ।
2. `leadGenConfig.enabled === true` বা `homeEntry === 'lead_gen'` হলে LeadGen mode activate হয়।
3. Store-এর `themeId` নিয়ে `getLeadGenSettings()` call হয়।
4. `LeadGenRenderer` switch-case দিয়ে theme renderer choose হয়।
5. Lead form submit হয় `/api/submit-lead` route এ।

## 3) Core file map
- Lead mode loader/render: `apps/web/app/routes/_index.tsx`
- Lead renderer: `apps/web/app/components/lead-gen/LeadGenRenderer.tsx`
- Theme settings schema/default: `apps/web/app/config/lead-gen-theme-settings.ts`
- DB persistence service: `apps/web/app/services/lead-gen-settings.server.ts`
- Admin settings page: `apps/web/app/routes/app.settings.lead-gen.tsx`
- Lead submit API: `apps/web/app/routes/api.submit-lead.tsx`

## 4) Existing lead themes (current)
`apps/web/app/config/lead-gen-theme-settings.ts` এর `DEFAULT_LEAD_GEN_SETTINGS` + `getAvailableLeadGenThemes()` এ themes define করা আছে:
- `professional-services`
- `consulting-firm`
- `law-firm`
- `healthcare`
- `agency`

## 5) Theme edit করার safest workflow
### Step A: Theme select + defaults update
1. `DEFAULT_LEAD_GEN_SETTINGS[themeId]` update করো
   - `primaryColor`, `accentColor`
   - `heroHeading`, `heroDescription`, `ctaButtonText`
2. `getAvailableLeadGenThemes()` এ theme metadata (name/description/category/preview) ঠিক করো

### Step B: Renderer layout update
`apps/web/app/components/lead-gen/LeadGenRenderer.tsx` এ:
1. `switch (themeId)` check করো
2. targeted renderer function (যেমন `ConsultingFirmRenderer`) edit করো
3. block order, section IDs (`#services`, `#contact`) consistent রাখো
4. form submit action ভেঙো না (`LeadCaptureForm` unchanged রাখাই ভাল)

### Step C: Admin settings compatibility
`apps/web/app/routes/app.settings.lead-gen.tsx` ফর্ম fields যেন settings type-এর সাথে match করে:
- `storeName`, `logo`, `primaryColor`, `accentColor`
- `heroHeading`, `heroDescription`, `ctaButtonText`
- `showAnnouncement`, `showServices`, `showTestimonials`
- `phone`, `email`, `address`

## 6) নতুন LeadGen theme add করার guide
### 6.1 Config add
`apps/web/app/config/lead-gen-theme-settings.ts`:
1. `DEFAULT_LEAD_GEN_SETTINGS` এ নতুন key add করো (e.g. `education-consulting`)
2. `getAvailableLeadGenThemes()` return array-এ নতুন object add করো

### 6.2 Renderer add
`apps/web/app/components/lead-gen/LeadGenRenderer.tsx`:
1. নতুন function create: `EducationConsultingRenderer`
2. switch-case এ `case 'education-consulting'` add করো

### 6.3 Optional: theme-specific constants
Hardcoded copy avoid করতে renderer-এর ভিতরে constants রাখো:
- `metrics[]`
- `serviceCards[]`
- `testimonials[]`
- `ctaCopy`

## 7) কেন সব theme একই দেখায় (common bug)
কারণ সাধারণত fallback renderer reuse হয়:
- একাধিক theme renderer যদি `return <ProfessionalServicesRenderer {...props} />` করে
তাহলে শুধু color/text বদলায়, layout আলাদা হয় না।

Fix:
প্রতিটি theme-এর জন্য আলাদা renderer function বানাও, বা shared base + per-theme section composition model use করো।

## 8) Storefront theme-engine vs LeadGen পার্থক্য
### LeadGen path
- Single renderer file driven
- Fast iteration
- কম abstraction

### Storefront/theme-engine path
- `apps/web/app/themes/<theme>/sections/*.tsx`
- `theme.json`, `templates/*.json`, ThemeBridge registry
- এটি edit করলে LeadGen UI auto-update নাও হতে পারে

## 9) QA checklist (merge/deploy আগে)
1. Typecheck:
```bash
npm run --prefix apps/web typecheck
```
2. Build:
```bash
npm run --prefix apps/web build
```
3. Theme switch test:
- `/app/settings/lead-gen` থেকে theme change করে preview check
4. Form submit test:
- lead form submit হয়ে `/app/leads` এ entry আসে কিনা
5. Multi-tenant safety:
- অন্য store data leak হচ্ছে না

## 10) Deploy checklist
```bash
cd apps/web
npm run deploy:prod
npx wrangler versions list --env production | tail -n 20
```

## 11) Recommended commit strategy
এক commit = এক concern
- `feat: redesign consulting-firm leadgen renderer`
- `fix: leadgen header type safety`
- `docs: add leadgen theme development guide`

Mixed commit (renderer + unrelated storefront sections + admin styling) avoid করো।

## 12) Quick troubleshooting
### Problem: Theme UI change save হচ্ছে না
- `saveLeadGenSettings()` path check করো (`leadGenConfig` column update)

### Problem: wrong theme loaded
- `_index.tsx`-এ `leadGenConfig.themeId` parse হচ্ছে কিনা দেখো

### Problem: preview ঠিক, live wrong
- deploy version mismatch / cache issue check
- latest worker version verify করো

---

## Appendix: Fast start commands
```bash
# 1) typecheck only
npm run --prefix apps/web typecheck

# 2) local dev
npm run --prefix apps/web dev

# 3) deploy prod
npm run --prefix apps/web deploy:prod
```
