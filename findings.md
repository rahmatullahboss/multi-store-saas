# Findings: DO Architecture Implementation

## Relevant Code

### Existing Order Processor DO
- Location: `apps/web/workers/order-processor/`
- Pattern: Separate worker with wrangler.toml
- Uses SQLite for persistence (FREE tier compatible)
- Class extends `DurableObject<Env>` from `cloudflare:workers`
- Uses `this.ctx.storage.sql` for SQLite operations
- Has lazy initialization pattern
- Uses alarms for background processing

### Main App Configuration
- Location: `apps/web/wrangler.toml`
- Uses service binding: `ORDER_PROCESSOR_SERVICE` → `order-processor`
- D1 database: `multi-store-saas-db` (ID: bf882d16-d67a-4007-b503-33646bd693af)
- Has KV namespaces: `AI_RATE_LIMIT`, `STORE_CACHE`

### Worker Structure Pattern
```
apps/web/workers/{worker-name}/
├── src/index.ts      # DO class + worker entry point
├── wrangler.toml     # DO bindings + migrations
├── package.json      # Dependencies
└── tsconfig.json     # TypeScript config
```

## Documentation

### DO Architecture Strategy
- **Cart DO**: `cart-{sessionId}` - Race-condition free cart management
- **Checkout Lock DO**: `checkout-{orderId}` - Atomic lock with 5-min timeout
- **Rate Limiter DO**: `ratelimit-{storeId}-{ip}` - Sliding window algorithm
- **Store Config Cache DO**: `store-{storeId}` - 1-minute TTL cache
- **Live Editor State DO**: `editor-{pageId}` - Undo/redo with history

### DO Best Practices (from order-processor)
- One DO = One responsibility
- Quick response, background processing with `ctx.waitUntil()`
- Batch operations to minimize network hops
- DO coordinates, DB stores final state
- Lazy initialization (don't create tables until needed)
- Use alarm debouncing to prevent redundant alarms
- Single composite index for common queries

## Decisions
- [x] Decision 1: Use separate worker directories for each DO (following order-processor pattern)
- [x] Decision 2: Use SQLite persistence for Cart and Editor State
- [x] Decision 3: In-memory only for Rate Limiter and Store Config (ephemeral)
- [x] Decision 4: Use service bindings in main app to access DO workers
- [x] Decision 5: Follow same migration pattern with `new_sqlite_classes`
