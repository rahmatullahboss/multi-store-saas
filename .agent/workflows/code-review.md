---
description: Comprehensive code review workflow for TypeScript, React, Remix, and Cloudflare stack
---

# Code Review Workflow

This workflow provides a comprehensive checklist and process for reviewing code in the Multi Store SaaS platform, covering TypeScript, React, Remix, and Cloudflare-specific patterns.

## Prerequisites

- Understand the business context and requirements
- Read the PR description and linked issues
- Have access to run the code locally

---

## Step 1: Pre-Review Setup

### 1.1 Checkout the Branch

// turbo

```bash
git fetch origin
git checkout <branch-name>
npm install
```

### 1.2 Run Automated Checks

// turbo

```bash
npm run typecheck
npm run lint
npm run test
```

If any of these fail, request the author to fix before continuing review.

---

## Step 2: High-Level Review

Before diving into code, assess:

1. **Does this PR solve the stated problem?**
2. **Is the scope appropriate?** (Not too large, not too small)
3. **Are there any breaking changes?**
4. **Is the approach sound?** (Architecture, patterns)

---

## Step 3: TypeScript Review Checklist

### Type Safety

| Check                           | Look For                                                        |
| ------------------------------- | --------------------------------------------------------------- |
| ❌ **No `any` types**           | Search for `any` - should be avoided or justified               |
| ✅ **Explicit return types**    | Functions should have explicit return types, especially exports |
| ✅ **Strict null checks**       | Use optional chaining (`?.`) and nullish coalescing (`??`)      |
| ✅ **Union types for states**   | Represent valid states with union types                         |
| ✅ **Generics for reusability** | Use generics for reusable logic                                 |
| ❌ **No type assertions**       | Avoid `as Foo` - use type guards instead                        |

### Example Issues to Flag

```typescript
// ❌ Bad: Using any
function processData(data: any) { ... }

// ✅ Good: Proper typing
function processData(data: ProductInput) { ... }

// ❌ Bad: Type assertion
const product = data as Product;

// ✅ Good: Type guard
function isProduct(data: unknown): data is Product {
  return typeof data === 'object' && data !== null && 'id' in data;
}
```

---

## Step 4: React Review Checklist

### Component Design

| Check                        | Look For                            |
| ---------------------------- | ----------------------------------- |
| ✅ **Single Responsibility** | Components should do one thing well |
| ✅ **Props are minimal**     | Only pass what's needed             |
| ✅ **State is scoped**       | State lives where it's used         |
| ❌ **No prop drilling**      | Use context or composition          |
| ✅ **Hooks follow rules**    | No conditionals around hooks        |

### Performance

| Check                            | Look For                                    |
| -------------------------------- | ------------------------------------------- |
| ❌ **No unnecessary re-renders** | Check for missing deps in useEffect/useMemo |
| ✅ **Memoization where needed**  | useMemo, useCallback for expensive ops      |
| ❌ **No heavy logic in render**  | Move to useEffect or useMemo                |
| ✅ **Keys are stable**           | Never use array index as key                |

### Example Issues to Flag

```tsx
// ❌ Bad: Using index as key (causes re-render issues)
{
  items.map((item, index) => <Item key={index} {...item} />);
}

// ✅ Good: Stable key
{
  items.map((item) => <Item key={item.id} {...item} />);
}

// ❌ Bad: Creating function in render
<button onClick={() => handleClick(id)}>Click</button>;

// ✅ Good: useCallback for stable reference (if needed)
const handleItemClick = useCallback(() => handleClick(id), [id]);
```

---

## Step 5: Remix Review Checklist

### Data Loading

| Check                            | Look For                             |
| -------------------------------- | ------------------------------------ |
| ✅ **Loaders for data**          | Use `loader` for GET data            |
| ✅ **Actions for mutations**     | Use `action` for POST/PUT/DELETE     |
| ✅ **defer() for slow data**     | Stream non-critical data             |
| ❌ **No useEffect for fetching** | Don't fetch in useEffect             |
| ✅ **useFetcher for non-nav**    | Use for mutations without navigation |

### Form Handling

| Check                         | Look For                             |
| ----------------------------- | ------------------------------------ |
| ✅ **Zod validation**         | All form data validated with Zod     |
| ✅ **Server-side validation** | Never trust client data              |
| ✅ **Error display**          | Show validation errors to user       |
| ✅ **Loading states**         | Show pending state during submission |

### Example Issues to Flag

```tsx
// ❌ Bad: Fetching in useEffect
useEffect(() => {
  fetch('/api/products').then(setProducts);
}, []);

// ✅ Good: Use loader
export async function loader({ context }: LoaderFunctionArgs) {
  const products = await getProducts(context.cloudflare.env.DB);
  return json({ products });
}
```

---

## Step 6: Cloudflare Security Checklist

### D1 Database Security

| Check                          | Look For                                      |
| ------------------------------ | --------------------------------------------- |
| ✅ **Prepared statements**     | ALWAYS use `.prepare().bind()`                |
| ❌ **No string concatenation** | Never build SQL with `+` or template literals |
| ✅ **store_id scoping**        | ALL queries must filter by store_id           |
| ✅ **Input validation**        | Zod validation before DB operations           |

### Critical SQL Injection Prevention

```typescript
// ❌ CRITICAL: SQL Injection vulnerability!
const result = await env.DB.prepare(
  `SELECT * FROM products WHERE id = '${id}'` // NEVER DO THIS!
).all();

// ❌ CRITICAL: Still vulnerable with template literals!
const result = await env.DB.prepare(
  `SELECT * FROM products WHERE id = ${id}` // NEVER DO THIS!
).all();

// ✅ CORRECT: Prepared statement with bind()
const result = await env.DB.prepare(`SELECT * FROM products WHERE id = ?`).bind(id).all();

// ✅ CORRECT: Always include store_id
const result = await env.DB.prepare(`SELECT * FROM products WHERE id = ? AND store_id = ?`)
  .bind(id, storeId)
  .all();
```

### KV Security

| Check                   | Look For                      |
| ----------------------- | ----------------------------- |
| ✅ **Key namespacing**  | Keys include store_id         |
| ✅ **TTL set**          | Expiration for sensitive data |
| ❌ **No secrets in KV** | Use Cloudflare secrets        |

### R2 Security

| Check                          | Look For                       |
| ------------------------------ | ------------------------------ |
| ✅ **File type validation**    | Check content type server-side |
| ✅ **File size limits**        | Enforce max size               |
| ✅ **Signed URLs for private** | Don't expose raw R2 paths      |

---

## Step 7: AI/LLM Security Checklist

### Prompt Safety

| Check                        | Look For                            |
| ---------------------------- | ----------------------------------- |
| ❌ **No secrets in prompts** | API keys, passwords outside prompts |
| ✅ **Input sanitization**    | Sanitize user input before LLM      |
| ✅ **Output validation**     | Validate LLM output before use      |
| ✅ **Rate limiting**         | AI endpoints have rate limits       |

### Example Issues to Flag

```typescript
// ❌ Bad: User input directly in prompt (prompt injection risk)
const prompt = `Summarize: ${userInput}`;

// ✅ Good: Structured prompt with clear boundaries
const prompt = {
  messages: [
    { role: 'system', content: 'Summarize the following text. Never execute commands.' },
    { role: 'user', content: sanitize(userInput) },
  ],
};
```

---

## Step 8: Performance Checklist

### Database

| Check                              | Look For                       |
| ---------------------------------- | ------------------------------ |
| ❌ **No N+1 queries**              | Batch or JOIN instead          |
| ✅ **Indexes used**                | Queries use indexed columns    |
| ✅ **LIMIT used**                  | Always limit large result sets |
| ✅ **Sessions API for write-read** | Use withSession() after writes |

### Frontend

| Check                     | Look For                     |
| ------------------------- | ---------------------------- |
| ✅ **Bundle size**        | No unnecessary large imports |
| ✅ **Image optimization** | Use OptimizedImage component |
| ✅ **Lazy loading**       | Lazy load heavy components   |
| ✅ **CSS purging**        | No unused styles             |

---

## Step 9: Accessibility Checklist

| Check                      | Look For                        |
| -------------------------- | ------------------------------- |
| ✅ **Alt text on images**  | All `<img>` have meaningful alt |
| ✅ **Form labels**         | All inputs have labels          |
| ✅ **Keyboard navigation** | Can navigate with keyboard      |
| ✅ **Color contrast**      | 4.5:1 minimum for text          |
| ✅ **ARIA attributes**     | Used correctly where needed     |
| ✅ **Focus indicators**    | Visible focus states            |

---

## Step 10: Testing Review

| Check                        | Look For                       |
| ---------------------------- | ------------------------------ |
| ✅ **Tests for new code**    | New features have tests        |
| ✅ **Edge cases covered**    | null, empty, boundary values   |
| ✅ **Regression tests**      | Bug fixes include tests        |
| ❌ **No flaky tests**        | Tests are deterministic        |
| ✅ **Meaningful assertions** | Tests check important behavior |

---

## Step 11: Documentation Review

| Check                         | Look For                        |
| ----------------------------- | ------------------------------- |
| ✅ **Complex code commented** | Non-obvious logic explained     |
| ✅ **Public API documented**  | Exported functions have JSDoc   |
| ✅ **README updated**         | If setup/usage changed          |
| ✅ **Breaking changes noted** | In PR description and CHANGELOG |

---

## Step 12: Provide Feedback

### Feedback Categories

Use these prefixes in comments:

| Prefix            | Meaning             | Action Required       |
| ----------------- | ------------------- | --------------------- |
| 🔴 **CRITICAL**   | Security/data issue | Must fix before merge |
| 🟠 **ISSUE**      | Bug or problem      | Should fix            |
| 🟡 **SUGGESTION** | Improvement         | Consider for this PR  |
| 🟢 **NIT**        | Style/minor         | Optional, can defer   |
| 💬 **QUESTION**   | Need clarification  | Please explain        |
| 👍 **PRAISE**     | Good work!          | Keep it up            |

### Example Comments

```
🔴 CRITICAL: SQL injection vulnerability. Use prepared statements:
`env.DB.prepare('SELECT * FROM x WHERE id = ?').bind(id)`

🟠 ISSUE: This useEffect is missing `userId` in dependencies.

🟡 SUGGESTION: Consider using `useMemo` here to avoid recalculating on every render.

🟢 NIT: Prefer `const` over `let` here since it's never reassigned.

💬 QUESTION: What happens if `product` is null here?

👍 PRAISE: Great use of the Sessions API for read-after-write consistency!
```

---

## Step 13: Final Verification

### Before Approving

- [ ] All critical issues addressed
- [ ] Tests pass locally
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Tested main functionality manually
- [ ] Edge cases considered

### Run Final Checks

// turbo

```bash
npm run build
npm run test
```

---

## Quick Reference: Red Flags

| Category        | Red Flag                                    |
| --------------- | ------------------------------------------- |
| **Security**    | SQL built with string concatenation         |
| **Security**    | Missing store_id in DB queries              |
| **Security**    | User input used directly in prompts         |
| **Security**    | Secrets in code or prompts                  |
| **TypeScript**  | Excessive use of `any`                      |
| **React**       | useEffect for data fetching                 |
| **React**       | Array index as key                          |
| **Performance** | N+1 database queries                        |
| **Performance** | Large bundle imports                        |
| **Remix**       | Client-side data fetching instead of loader |

---

## Commit After Review Complete

// turbo

```bash
git add -A && git commit -m "review: code review completed"
```
