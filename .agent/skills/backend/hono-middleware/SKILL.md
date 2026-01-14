---
name: "hono-middleware"
description: "Create secure Hono middleware for auth, rate limiting, logging"
when_to_use: "When adding new API routes that need protection"
allowed-tools: ["Read", "Write", "Bash(npm run dev:*)"]
---

# Hono Middleware Creation Process

## Step 1: Auth Middleware

1. Check `Authorization` header
2. Verify token (JWT or Database session)
3. Set user in context: `c.set('user', user)`

## Step 2: Rate Limit

1. Use `CF-Connecting-IP` header
2. Use KV or Durable Object for counters
3. Return `429` if limit exceeded

## Step 3: Logging

```typescript
app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  console.log(`${c.req.method} ${c.req.path} - ${Date.now() - start}ms`);
});
```

## Step 4: Testing

1. Use `curl` to verify headers
2. Check edge cases (missing headers, expired tokens)
