# Lead Generation MVP Implementation Plan (Final)

Last Updated: 2026-02-12  
Status: Ready for Implementation (MVP Scope)

## 1) Objective

এই MVP-এর লক্ষ্য:
- Merchant যেন খুব দ্রুত একটি simple lead-gen page publish করতে পারে
- Visitor form submit করলে lead dashboard-এ আসে
- Merchant দ্রুত কল/WhatsApp follow-up করতে পারে

## 2) MVP Principles (Strict)

- কম database change
- existing route/component reuse
- no heavy builder rewrite
- no complex CRM features in phase 1
- multi-tenant safety first (`store_id` mandatory everywhere)

## 3) Final Architecture Decision

### 3.1 Same App, Mode Switch (No separate app)
- Existing app shell/reuse থাকবে
- Lead-gen store এর জন্য existing fields ব্যবহার:
  - `stores.storeEnabled = false`
  - `stores.homeEntry = page:{pageId}`
- এতে নতুন `store_type` migration phase 1-এ লাগছে না

### 3.2 Form Config কোথায় থাকবে
- New `lead_forms` table phase 1-এ না
- form config existing page config-এ থাকবে:
  - GrapesJS page: `landing_pages.page_config`
  - Builder page: section props

### 3.3 New table (only one)
- `lead_submissions` table add হবে (core data)

## 4) Data Model (MVP)

```sql
-- packages/database/src/migrations/XXXX_lead_submissions.sql
CREATE TABLE IF NOT EXISTS lead_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  store_id INTEGER NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  page_slug TEXT NOT NULL,

  name TEXT,
  phone TEXT,
  email TEXT,
  message TEXT,
  form_data TEXT, -- JSON string (for extra custom fields)

  source_url TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  ip_address TEXT,
  user_agent TEXT,

  status TEXT NOT NULL DEFAULT 'new', -- new|contacted|converted|spam
  notes TEXT,

  created_at INTEGER DEFAULT (strftime('%s','now')),
  updated_at INTEGER DEFAULT (strftime('%s','now'))
);

CREATE INDEX IF NOT EXISTS lead_submissions_store_idx
  ON lead_submissions(store_id);
CREATE INDEX IF NOT EXISTS lead_submissions_status_idx
  ON lead_submissions(store_id, status);
CREATE INDEX IF NOT EXISTS lead_submissions_created_idx
  ON lead_submissions(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS lead_submissions_phone_idx
  ON lead_submissions(store_id, phone);
```

## 5) API Plan

### 5.1 Public submit API
- Route: `/api/lead-capture` (new)
- Method: `POST` only
- Input: `page_slug`, `name?`, `phone?`, `email?`, `message?`, `custom_fields?`, `website(honeypot)`
- Rules:
  - at least one of `name|phone|email` required
  - honeypot filled হলে silent success (store না)
  - rate limit (IP + page)
  - duplicate guard (same phone within 5 min)
  - store resolve হবে tenant middleware/context দিয়ে

### 5.2 Auth dashboard APIs
- Route: `/app/leads` loader/action (single route first)
- Features:
  - list by store
  - status filter
  - search (name/phone/email)
  - status update
  - notes update

## 6) UI Plan

### 6.1 Public Form (Phase 1)
- Reusable component: `LeadCaptureForm`
- Supported fields (MVP): name, phone, email, message
- Optional extra fields via JSON config (max 3)
- Mobile-first responsive (single-column)
- Submit states: idle/loading/success/error

### 6.2 Merchant Dashboard (Phase 1)
- New page: `/app/leads`
- Table/cards:
  - New
  - Contacted
  - Converted
  - Spam
- Lead row actions:
  - call (`tel:`)
  - WhatsApp deep link (`wa.me`)
  - status change
  - notes save

### 6.3 Onboarding / Setup (Minimal)
- Existing onboarding flow-এ একটি simple toggle যোগ:
  - `E-commerce`
  - `Lead Gen`
- `Lead Gen` সিলেক্ট করলে:
  - products step skip
  - quick page তৈরি
  - default form attach

## 7) Quick Builder / Existing Flow Compatibility

- Existing `quick-builder` থাকবে as-is
- New lead form submit endpoint reusable হবে:
  - `/p/:slug` builder pages
  - GrapesJS custom pages
- কোনো breaking change না এনে incremental integration

## 8) Notifications (MVP-level)

Phase 1:
- In-app count badge on `/app/leads`
- Lead detail থেকে one-click WhatsApp follow-up

Phase 2:
- Merchant email notification
- Automatic WhatsApp API push

## 9) Security Checklist (Mandatory)

- tenant-safe query: সবসময় `store_id`
- zod validation for public input
- honeypot field
- rate limit
- duplicate submission guard
- log suspicious IP spikes

## 10) File-Level Implementation Map

- `packages/database/src/schema.ts`
  - `leadSubmissions` table + relations add
- `packages/database/src/migrations/*_lead_submissions.sql`
  - migration
- `apps/web/app/routes/api.lead-capture.ts`
  - public lead submit
- `apps/web/app/routes/app.leads.tsx`
  - dashboard list + update actions
- `apps/web/app/components/lead-capture/LeadCaptureForm.tsx`
  - form component
- `apps/web/app/routes/p.$slug.tsx`
  - form render + submit endpoint hookup
- `apps/web/app/routes/onboarding.tsx` (or existing onboarding step file)
  - ecommerce/lead-gen toggle (minimal)

## 11) Delivery Timeline (MVP)

Day 1:
- DB schema + migration
- base `api.lead-capture`

Day 2:
- public form component + `/p/:slug` integration
- validation/rate-limit/honeypot

Day 3:
- `/app/leads` list + search + filter
- status update + notes

Day 4:
- onboarding minimal toggle
- sidebar/menu visibility tuning
- tenant/security test

Day 5:
- bug fix + polish + launch checklist

## 12) Launch Checklist

- migration applied (local + prod)
- public form submit success tested
- spam/rate-limit tested
- lead appears in correct store dashboard
- cross-tenant isolation tested
- mobile UI tested (Android/iOS viewport)

## 13) Out of Scope (Not in MVP)

- full drag-drop form builder
- lead scoring AI
- CRM pipeline/kanban
- advanced automation rules
- multi-step forms
- file upload fields

---

## Final MVP Summary

এই plan অনুযায়ী minimum change এ live করা যাবে:
1. **একটা table add** (`lead_submissions`)
2. **একটা public API add** (`/api/lead-capture`)
3. **একটা dashboard page add** (`/app/leads`)
4. **existing page system reuse** করে lead form চালু

এটাই fastest low-risk path for MVP launch.
