---
description: QA/Debug/Fix workflow - catch bugs, write regression tests, and fix
---

# QA/Debug/Fix Workflow (Remix + Hono + D1)

// turbo-all

## 0) Context & Recent Work Check

```bash
git status
git log -n 20 --oneline
git diff --stat
```

- Review `.agent/skills/systematic-debugging/SKILL.md`

**Rule:** Identify which feature was touched (builder reorder? template? checkout?).

---

## 1) Clean Install + Baseline Gates

```bash
npm ci
npm run lint
npm run typecheck
```

If anything fails:

1. Fix smallest errors first (lint/type)
2. Re-run Step 1

---

## 2) Local D1 Migrations

```bash
npm run db:migrate:local
```

**Rule:** Migration fail হলে migration ঠিক করো। Manually DB edit করো না।

---

## 3) Run Unit/Integration Tests

```bash
npm run test
```

If tests fail:

1. Read fail log
2. Trace root cause
3. **Write regression test FIRST** (`it("fixes: ...")`)
4. Then fix the code

---

## 4) Run Dev Server (for UI bugs)

```bash
npm run dev
```

Reproduce bug manually, then add Playwright E2E test.

---

## 5) Run E2E Tests

```bash
npm run e2e
```

---

## 6) Final Verification (Before PR)

```bash
npm run test:all
```

**Must be all green before marking done.**

---

## Debug/Fix Rules (Non-negotiable)

### Regression Test Policy

Bug fix করার **আগে বা সাথে সাথে** 1টা regression test যোগ করতে হবে।

**Test Placement:**

- Pure logic (reorder, pricing calc): `tests/unit/*.test.ts`
- D1 queries + constraints: `tests/integration/*.test.ts`
- UI flows (builder drag/drop, checkout): `e2e/*.spec.ts`

### Common Regression Targets

- Section reorder → duplicate `sort_order` হচ্ছে কিনা
- Toggle enable/disable → refresh পরে persist হচ্ছে কিনা
- Publish snapshot → published table এ ঠিকমতো copy হচ্ছে কিনা
- Checkout totals → server-side calc ঠিক কিনা
- Hostname → shop resolve ঠিক কিনা (multi-tenant)

---

## Bug Catch → Fix Loop

1. **Reproduce** - test fail বা manual steps দিয়ে
2. **Minimize** - smallest failing scenario isolate
3. **Write regression test** - `it("fixes: ...")` নামে
4. **Fix implementation** - schema/validation/pipeline adjust
5. **Run full suite** - `npm run test:all` (must pass)
6. **Explain** - bug cause + fix summary + test added
