---
description: Systematically fix failing tests in Ozzyl
---

# Fix Tests Workflow

## Prerequisites

- Reference `.agent/skills/webapp-testing/SKILL.md`
- Reference `.agent/skills/systematic-debugging/SKILL.md`

## ⚠️ Critical Rule

**NEVER edit tests to bypass failures. Fix the source code.**

Tests are the specification. If a test fails, the code is wrong (unless the test itself has a bug).

## Phase 1: Identify All Failures

```bash
cd apps/web
npm run test 2>&1 | tee test-output.txt
```

Review output and list all failures:
| Test File | Test Name | Error Type |
|-----------|-----------|------------|
| ... | ... | ... |

## Phase 2: Categorize by Error Type

| Priority | Error Type              | Fix Location     | Example         |
| -------- | ----------------------- | ---------------- | --------------- |
| 1        | Import/Module not found | Source imports   | Missing export  |
| 2        | Type errors             | Types/interfaces | Schema mismatch |
| 3        | Runtime errors          | Source logic     | Null reference  |
| 4        | Assertion failures      | Source or test   | Logic bug       |
| 5        | Timeout                 | Async handling   | Missing await   |

## Phase 3: Fix in Priority Order

### Priority 1: Import Errors

- Check file paths
- Verify exports exist
- Check circular dependencies

### Priority 2: Type Errors

- Update TypeScript interfaces
- Fix Zod schema mismatches
- Add missing fields

### Priority 3: Runtime Errors

- Add null checks
- Fix async/await issues
- Handle edge cases

### Priority 4: Assertion Failures

- Read the test carefully
- Understand expected behavior
- Fix source to match spec

### Priority 5: Timeouts

- Add proper `await`
- Increase timeout if needed (last resort)
- Check for infinite loops

## Phase 4: Verify Fix Individually

After each fix:

```bash
npm run test -- --grep "test name"
```

## Phase 5: Verify All Pass

```bash
cd apps/web
npm run test
npm run typecheck
npm run lint
```

## Phase 6: Final Verification

```bash
npm run test:all  # lint + typecheck + test
```

## Common Ozzyl Test Issues

### Multi-tenancy

```typescript
// ❌ Test fails - no storeId
await db.select().from(products);

// ✅ Fix - add storeId filter
await db.select().from(products).where(eq(products.storeId, testStoreId));
```

### Mock Context

```typescript
// Ensure test has proper Cloudflare context
const context = {
  cloudflare: {
    env: { DB: mockDb, KV: mockKv },
  },
};
```

### Async Actions

```typescript
// ❌ Missing await
const result = action({ request, context });

// ✅ Proper await
const result = await action({ request, context });
```
