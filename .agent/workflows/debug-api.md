---
description: Debug API issues systematically in Ozzyl
---

# Debug API Workflow

## Prerequisites

- Review `.agent/skills/systematic-debugging/SKILL.md`
- Review `.agent/skills/hono/SKILL.md`

## Phase 1: Reproduce the Issue

- [ ] Get exact error message
- [ ] Get request details (method, URL, body, headers)
- [ ] Check browser Network tab or logs
- [ ] Identify the route file

## Phase 2: Trace the Request

### Route Location

```
API routes: apps/web/app/routes/api.*.ts
App routes: apps/web/app/routes/app.*.tsx
Server API: apps/web/server/api/*.ts
```

### Check Order

1. Route exists and exports correct function (loader/action)
2. Middleware not blocking (auth, rate limit)
3. Request parsing correct
4. Validation passing
5. Database query correct
6. Response formatting correct

## Phase 3: Debug by HTTP Status Code

### 400 Bad Request

- [ ] Check Zod validation schema
- [ ] Log incoming request body
- [ ] Verify required fields sent
- [ ] Check content-type header

```typescript
// Debug validation
console.log('Request body:', await request.json());
const result = Schema.safeParse(data);
if (!result.success) {
  console.log('Validation errors:', result.error.errors);
}
```

### 401 Unauthorized

- [ ] Check session/cookie exists
- [ ] Verify `requireAuth()` or similar
- [ ] Check token expiry
- [ ] Verify user exists in DB

### 403 Forbidden

- [ ] Check user has permission
- [ ] Verify store ownership
- [ ] Check role-based access

### 404 Not Found

- [ ] Route file exists
- [ ] Route exports loader/action
- [ ] Resource ID exists in DB
- [ ] Multi-tenancy: Check storeId match

### 500 Internal Server Error

- [ ] Check Cloudflare logs: `wrangler tail`
- [ ] Add try/catch to isolate
- [ ] Check DB connection
- [ ] Verify env bindings exist

```typescript
// Debug 500 errors
export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const { DB } = context.cloudflare.env;
    if (!DB) throw new Error('DB binding missing');
    // ... rest of code
  } catch (error) {
    console.error('API Error:', error);
    return json({ error: error.message }, { status: 500 });
  }
}
```

## Phase 4: Common Ozzyl API Issues

### D1 Connection

```typescript
// Check binding exists
const { DB } = context.cloudflare.env;
console.log('DB binding:', !!DB);
```

### Multi-tenancy Leak

```typescript
// ❌ DANGEROUS - returns all data
const products = await db.select().from(productsTable);

// ✅ SAFE - scoped to store
const products = await db
  .select()
  .from(productsTable)
  .where(eq(productsTable.storeId, currentStoreId));
```

### Missing Auth

```typescript
// Always verify user in protected routes
const user = await getUser(request, context);
if (!user) {
  return redirect('/auth/login');
}
```

## Phase 5: Fix and Verify

- [ ] Implement fix
- [ ] Test manually in browser/Postman
- [ ] Write unit test for the bug
- [ ] Run full test suite

```bash
cd apps/web
npm run test
npm run e2e -- --grep "api"
```

## Debug Commands

```bash
# Watch Cloudflare logs
wrangler tail

# Local dev with bindings
npm run dev:wrangler

# Check D1 data
wrangler d1 execute multi-store-saas-db --local --command "SELECT * FROM stores LIMIT 5"
```
