---
description: Comprehensive code review workflow for TypeScript, React, Remix, and Cloudflare stack
---

# Code Review Workflow

Quick, actionable checklist for reviewing code in the Multi Store SaaS platform.

## Step 1: Run Automated Checks

// turbo

```bash
npm run typecheck && npm run lint && npm run test
```

---

## Step 2: TypeScript Checklist

| ✅ Do                       | ❌ Don't                   |
| --------------------------- | -------------------------- |
| Explicit return types       | Use `any` type             |
| Use `?.` and `??` for nulls | Type assertions (`as Foo`) |
| Union types for states      | Implicit any in parameters |
| Zod validation              | Trust unvalidated data     |

---

## Step 3: React/Remix Checklist

| ✅ Do                      | ❌ Don't                    |
| -------------------------- | --------------------------- |
| Use `loader` for GET data  | useEffect for data fetching |
| Use `action` for mutations | Array index as key          |
| `defer()` for slow data    | Heavy logic in render       |
| `useFetcher` for non-nav   | Prop drilling               |

---

## Step 4: Cloudflare Security Checklist

### 🔴 CRITICAL: SQL Injection Prevention

```typescript
// ❌ NEVER: String concatenation
await env.DB.prepare(`SELECT * FROM x WHERE id = '${id}'`).all();

// ✅ ALWAYS: Prepared statements with bind()
await env.DB.prepare(`SELECT * FROM x WHERE id = ? AND store_id = ?`).bind(id, storeId).all();
```

| ✅ Do                       | ❌ Don't               |
| --------------------------- | ---------------------- |
| `.prepare().bind()`         | String concat in SQL   |
| Always filter by `store_id` | Query without store_id |
| Validate with Zod           | Trust client input     |
| Rate limit AI endpoints     | Unlimited AI calls     |

---

## Step 5: Performance Checklist

| ✅ Do                     | ❌ Don't          |
| ------------------------- | ----------------- |
| Batch DB operations       | N+1 queries       |
| Use indexes               | Full table scans  |
| Lazy load components      | Import everything |
| Sessions API after writes | Read stale data   |

---

## Step 6: Provide Feedback

| Prefix            | Meaning                  |
| ----------------- | ------------------------ |
| 🔴 **CRITICAL**   | Security/data - must fix |
| 🟠 **ISSUE**      | Bug - should fix         |
| 🟡 **SUGGESTION** | Improvement - consider   |
| 🟢 **NIT**        | Style - optional         |

---

## Quick Red Flags

- SQL with `${variable}` or `+` concatenation
- Missing `store_id` in queries
- `any` type usage
- useEffect for data fetching
- Array index as React key
- Secrets in code/prompts
