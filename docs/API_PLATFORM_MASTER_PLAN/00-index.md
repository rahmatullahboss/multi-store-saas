# Ozzyl API Platform — Master Plan Index
> **Version**: 6.0 | **Status**: Implementation-Ready | **Date**: 2026-02-24
> **Total Issues Fixed**: 51 across 4 Adversarial Review rounds
> **Source**: `docs/API_PLATFORM_MASTER_PLAN.md` (2,986 lines)

---

## 📂 Sharded Documents

| File | Sections | Lines | Contents |
|------|----------|-------|----------|
| [01-foundation.md](./01-foundation.md) | 1–3 | 312 | Executive Summary, System Architecture, Database Schema |
| [02-auth-security.md](./02-auth-security.md) | 4–6 | 542 | API Key System, Rate Limiting, Usage Tracker, Security Architecture |
| [03-api-routes-webhooks.md](./03-api-routes-webhooks.md) | 7–8 | 347 | Public API Routes, Webhook System |
| [04-sdk-integrations.md](./04-sdk-integrations.md) | 9–12 | 517 | JavaScript SDK, Embeddable Widget, WordPress Plugin |
| [05-business-roadmap.md](./05-business-roadmap.md) | 12–13 | 187 | Business Model & Pricing, Phased Implementation Roadmap |
| [06-advanced-features.md](./06-advanced-features.md) | 14–17 | 548 | AI Recommendations, Shopify App, Developer Experience, Usage Tracking |
| [07-devops-testing-compliance.md](./07-devops-testing-compliance.md) | 18–22 + ✅ | 495 | Infrastructure, Pre-Implementation Checklist, OpenAPI, Testing, GDPR, Coding Standards |

---

## 🗺️ Quick Navigation

### By Phase (Implementation Order)

| Phase | Files to Read | Focus |
|-------|--------------|-------|
| **Phase 1** (Weeks 1–4) | `01`, `02` | DB schema + API Key auth |
| **Phase 2** (Weeks 5–8) | `03` | Public API routes + Webhooks |
| **Phase 3** (Weeks 9–14) | `04` | SDK + Widget + WordPress plugin |
| **Phase 4** (Weeks 15–20) | `05`, `06` | Shopify App + AI features |
| **Phase 5** (Weeks 21–28) | `07` | Testing, DevOps, GDPR, Launch |

### By Role

| Role | Start Here |
|------|-----------|
| **Backend Developer** | `02-auth-security` → `03-api-routes-webhooks` |
| **Frontend Developer** | `04-sdk-integrations` |
| **DevOps** | `07-devops-testing-compliance` |
| **Product Manager** | `01-foundation` → `05-business-roadmap` |
| **Security Reviewer** | `02-auth-security` → `07-devops-testing-compliance` |

---

## ⚡ Critical Rules (Non-Negotiable)

1. **Every DB query MUST be scoped by `store_id`** — no exceptions
2. **Rate limiting via Workers RL API** — not KV (race condition free)
3. **API keys hashed with SHA-256** — never store plaintext
4. **Webhook secrets encrypted with AES-GCM** — never store plaintext
5. **HMAC-SHA256 webhook signing** — Stripe-compatible
6. **All inputs validated with Zod** — no raw user data
7. **`requireScopes()` on every route** — scope-based access control
8. **Non-blocking usage tracking** — `ctx.waitUntil()` pattern

---

## 🔗 Related Files

- **Full Source**: [`../API_PLATFORM_MASTER_PLAN.md`](../API_PLATFORM_MASTER_PLAN.md)
- **Project AGENTS**: [`../../AGENTS.md`](../../AGENTS.md)
- **DB Migrations**: [`../../apps/web/migrations/`](../../apps/web/migrations/)
- **Server API**: [`../../apps/web/server/api/`](../../apps/web/server/api/)
