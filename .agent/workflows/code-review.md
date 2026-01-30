---
description: Comprehensive code review workflow for TypeScript, React, Remix, and Cloudflare stack
---

# Code Review Workflow

This workflow provides a comprehensive checklist and process for reviewing code in the Multi Store SaaS platform, covering TypeScript, React, Remix, and Cloudflare-specific patterns.

## Prerequisites

- Understand the business context
- Read the PR description
- Have access to run code locally

---

## Step 1: Pre-Review Setup

### 1.1 Checkout Branch

// turbo

```bash
git fetch origin && git checkout <branch-name> && npm install
```

### 1.2 Automated Checks

// turbo

```bash
npm run typecheck && npm run lint && npm run test
```

Request fixes for any failures before proceeding.

---

---

## Step 2: Manual Code Review Strategy

### 2.1 Identify & Load Skills

Before reviewing line-by-line, the agent MUST identify the technology stack used in the changed files and load specific "Antigravity Skills" (frontend or backend) to guide the review.

| Changed Code Type      | Relevant Skills to Check                                             |
| :--------------------- | :------------------------------------------------------------------- |
| **Backend / API**      | `hono`, `wrangler`, `database-design`                                |
| **Frontend / UI**      | `web-design-guidelines`, `tailwind-design-system`, `frontend-design` |
| **Database / Drizzle** | `database-design`, `wrangler`                                        |
| **Testing**            | `webapp-testing`, `systematic-debugging`                             |
| **Workflows / CI**     | `c4-architecture`, `micro-saas-launcher`                             |

**Action:** Read the relevant SKILL.md files to refresh on project-specific patterns (like "Use Hono Zod Validator" or "Use Remix Loaders").

### 2.2 Compare with Similar Code

Check existing codebases or patterns to ensure consistency.

- **Grepping**: Search for similar implementations in the codebase to see if the new code matches existing patterns.
- **Consistency**: Ensure variable naming, folder structure, and architecture align with the rest of the project.

---

## Step 3: High-Level Assessment

1. **Problem Solving**: Does it solve the issue described?
2. **Scope**: is the PR focused?
3. **Architecture**: Is the approach sound?
4. **Breaking Changes**: Are they flagged?

---

## Step 4: TypeScript Review

### Type Safety Checklist

| ✅ Do                                | ❌ Don't                   |
| ------------------------------------ | -------------------------- |
| **Explicit return types** on exports | Use `any` type             |
| **Strict null checks**               | Type assertions (`as Foo`) |
| **Union types** for states           | Implicit any               |
| **Generics** for reusable logic      | Duplicate types            |
| **Zod schemas** for implementation   | Trust `unknown` data       |

### Code Examples

```typescript
// ❌ Bad: Avoiding types with any
function process(data: any) { ... }

// ✅ Good: Typed input
function process(data: ProductInput) { ... }

// ❌ Bad: Type assertion masking errors
const product = response as Product;

// ✅ Good: Type guard or Zod parse
if (!isProduct(response)) throw new Error('Invalid');
// OR
const product = productSchema.parse(response);
```

---

## Step 5: React Component Review

### Component Checklist

| ✅ Do                     | ❌ Don't                        |
| ------------------------- | ------------------------------- |
| **Single Responsibility** | Mega-components                 |
| **Minimal Props**         | Prop drilling (use Composition) |
| **Scoped State**          | Global state for local UI       |
| **Hooks Rules**           | Conditional hooks               |
| **Stable Keys**           | Array index as key              |

### Performance Checklist

| ✅ Do                     | ❌ Don't                   |
| ------------------------- | -------------------------- |
| **Memoize** expensive ops | Premature optimization     |
| **Stable callbacks**      | Inline functions in render |
| **Virtualize** long lists | Render 1000+ nodes         |
| **Lazy load** heavy parts | Huge initial bundles       |

### Code Examples

```tsx
// ❌ Bad: Index as key causing re-render bugs
{
  items.map((item, i) => <Item key={i} {...item} />);
}

// ✅ Good: Stable unique ID
{
  items.map((item) => <Item key={item.id} {...item} />);
}

// ❌ Bad: Heavy calculation in render
const sorted = expensiveSort(items);

// ✅ Good: Memoized calculation
const sorted = useMemo(() => expensiveSort(items), [items]);
```

---

## Step 6: Remix & Data Loading

### Pattern Checklist

| ✅ Do                        | ❌ Don't             |
| ---------------------------- | -------------------- |
| **Loaders** for GET data     | `useEffect` fetching |
| **Actions** for mutations    | Client-side `fetch`  |
| **`defer()`** for slow data  | Blocking UI          |
| **`useFetcher`** for non-nav | Full page reloads    |
| **Resource Routes** for APIs | Inline API handlers  |

### Code Examples

```tsx
// ❌ Bad: Client-side fetching waterfall
function Product() {
  const [data, setData] = useState(null);
  useEffect(() => {
    fetch('/api').then(setData);
  }, []);
  if (!data) return <Spinner />;
}

// ✅ Good: Server-side loading
export async function loader({ context }: LoaderFunctionArgs) {
  return json(await getData(context));
}
function Product() {
  const data = useLoaderData<typeof loader>();
  return <View data={data} />;
}
```

---

## Step 7: Cloudflare Security

### 🔴 CRITICAL: D1 SQL Injection

```typescript
// ❌ NEVER: String concatenation
const query = `SELECT * FROM users WHERE id = '${id}'`;
await env.DB.prepare(query).run();

// ❌ NEVER: Template literals
await env.DB.prepare(`SELECT * FROM users WHERE id = ${id}`).run();

// ✅ ALWAYS: Prepared statements
await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).run();

// ✅ ALWAYS: Scope by store_id
await env.DB.prepare('SELECT * FROM products WHERE id = ? AND store_id = ?')
  .bind(id, storeId)
  .run();
```

### Security Checklist

| Check                | Requirement                              |
| -------------------- | ---------------------------------------- |
| **Input Validation** | Validate ALL inputs with Zod             |
| **SQL Injection**    | Use `.bind()` for ALL user inputs        |
| **Multi-tenancy**    | ALWAYS filter by `store_id`              |
| **R2 Uploads**       | Validate file type & size server-side    |
| **Secrets**          | Use `env` bindings, never commit secrets |
| **Rate Limiting**    | Protect AI & heavy endpoints             |

---

## Step 8: AI & LLM Best Practices

### Safety & Performance

| Check             | Requirement                             |
| ----------------- | --------------------------------------- |
| **Sanitization**  | Sanitize user input before prompting    |
| **System Prompt** | Hardcode constraints (don't trust user) |
| **Validation**    | Parse & validate LLM JSON output        |
| **Caching**       | Cache equivalent prompts in KV          |
| **Streaming**     | Stream long responses for UX            |

### Code Examples

```typescript
// ❌ Bad: Direct injection
const prompt = `Translate this: ${userInput}`;

// ✅ Good: Structured prompt
const response = await env.AI.run('@cf/meta/llama-3', {
  messages: [
    { role: 'system', content: 'You are a translator. Only output JSON.' },
    { role: 'user', content: sanitize(userInput) },
  ],
});
```

---

## Step 9: Accessibility (a11y)

| Check             | Look For                       |
| ----------------- | ------------------------------ |
| **Semantic HTML** | `<button>` vs `<div onClick>`  |
| **Alt Text**      | Meaningful alt for images      |
| **Labels**        | Form inputs have labels        |
| **Keyboard**      | Interactive elements focusable |
| **Contrast**      | Colors are readable            |

---

## Step 10: Documentation & Testing

| Check          | Look For                            |
| -------------- | ----------------------------------- |
| **Tests**      | Unit tests for logic, E2E for flows |
| **Edge Cases** | Null, empty, error states tested    |
| **Comments**   | "Why" explained, not just "What"    |
| **README**     | Updated if setup changed            |

---

## Step 11: Providing Feedback

### Feedback Guidelines

1. **Be Constructive**: Suggest solutions, don't just criticize.
2. **Explain Why**: Link to docs or explain the valid reason.
3. **Distinguish**: Separate blocking issues from nitpicks.

### Standard Prefixes

| Prefix            | Meaning                                | Action         |
| ----------------- | -------------------------------------- | -------------- |
| 🔴 **CRITICAL**   | Security/Data loss risk                | **Must Fix**   |
| 🟠 **ISSUE**      | Functional bug / Spec deviation        | **Should Fix** |
| 🟡 **SUGGESTION** | Refactor / Performance / Best Practice | **Consider**   |
| 🟢 **NIT**        | Formatting / Naming / Typo             | **Optional**   |
| 💬 **QUESTION**   | Need clarification                     | **Reply**      |
| 👍 **PRAISE**     | Clever solution / Great code           | **No Action**  |

---

## Step 12: Final Verification

### Pre-Merge Checklist

- [ ] automated checks passed (`npm run check`)
- [ ] critical security issues resolved
- [ ] functionality verified locally
- [ ] tests added/updated
- [ ] code style guidelines followed

### Merge Strategy

// turbo

```bash
git merge <branch> --no-ff
```

---

## Quick Reference: Red Flags

| Category     | Flag                                        |
| ------------ | ------------------------------------------- |
| **Security** | SQL string concatenation                    |
| **Security** | Missing `store_id` filter                   |
| **Security** | Secrets in source code                      |
| **Platform** | Node.js APIs (fs, child_process) in Workers |
| **React**    | `useEffect` data fetching                   |
| **Types**    | `any` usage without comment                 |
| **Perf**     | N+1 queries in loops                        |
