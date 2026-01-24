# Durable Objects Architecture Strategy - Multi-Store SaaS

## 🎯 Strategic Vision

**Durable Object = Coordination Brain**  
**D1 Database = Source of Truth**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    OZZYL SaaS - DO Architecture                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Request ──► DO (Coordination) ──► D1 (Persistence)                   │
│                     │                                                   │
│                     ├── Lock / Sequence                                │
│                     ├── In-memory state                                │
│                     ├── Rate limiting                                  │
│                     └── Real-time sync                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ DO Usage Map (Tomar SaaS er jonno)

### ✅ Perfect DO Use Cases

| Use Case | DO ID Pattern | Priority | Status |
|----------|---------------|----------|--------|
| **Order Processing** | `order-processor-{storeId}` | 🔴 Critical | ✅ Implemented |
| **Cart System** | `cart-{sessionId}` | 🔴 Critical | 🔲 To Do |
| **Checkout Lock** | `checkout-{orderId}` | 🔴 Critical | 🔲 To Do |
| **Rate Limiter** | `ratelimit-{storeId}-{ip}` | 🟡 Important | 🔲 To Do |
| **Store Config Cache** | `store-{storeId}` | 🟡 Important | 🔲 To Do |
| **Live Editor State** | `editor-{pageId}` | 🟢 Nice-to-have | 🔲 To Do |

### ❌ NOT for Durable Objects

| Use Case | Use Instead | Reason |
|----------|-------------|--------|
| Product listing | D1 + KV Cache | Read-heavy, no coordination |
| Analytics | D1 + Cron | Batch processing |
| Image storage | R2 | Large files |
| Full-text search | Vectorize | Specialized |

---

## 1️⃣ Cart System DO (CRITICAL)

### Problem
```
Tab 1: Add item ──┐
Tab 2: Add item ──┼── Race condition! Double count!
Tab 3: Remove ────┘
```

### Solution
```
Tab 1 ──┐
Tab 2 ──┼──► CartDO (cart-{sessionId}) ──► Serialized execution
Tab 3 ──┘
```

### Design

```typescript
// workers/cart-processor/src/index.ts

class CartDO extends DurableObject {
  private items: Map<number, CartItem> = new Map();
  
  async fetch(request: Request) {
    const url = new URL(request.url);
    
    switch (url.pathname) {
      case '/add':
        return this.addItem(await request.json());
      case '/remove':
        return this.removeItem(await request.json());
      case '/update':
        return this.updateQuantity(await request.json());
      case '/get':
        return this.getCart();
      case '/clear':
        return this.clearCart();
    }
  }
  
  private async addItem(data: { productId: number; quantity: number }) {
    // ✅ No race condition - serialized!
    const existing = this.items.get(data.productId);
    
    if (existing) {
      existing.quantity += data.quantity;
    } else {
      this.items.set(data.productId, { 
        productId: data.productId, 
        quantity: data.quantity,
        addedAt: Date.now()
      });
    }
    
    // Persist to SQLite
    await this.saveToStorage();
    
    return Response.json({ 
      success: true, 
      cart: this.getCartArray(),
      total: this.getTotal()
    });
  }
  
  private async saveToStorage() {
    // SQLite persistence
    this.ctx.storage.sql.exec(
      'DELETE FROM cart_items'
    );
    for (const [productId, item] of this.items) {
      this.ctx.storage.sql.exec(
        'INSERT INTO cart_items (product_id, quantity, added_at) VALUES (?, ?, ?)',
        productId, item.quantity, item.addedAt
      );
    }
  }
}
```

### Benefits
- ✅ No double-add bug
- ✅ Real-time across tabs
- ✅ Survives refresh
- ✅ No Redis needed

---

## 2️⃣ Checkout Lock DO (CRITICAL)

### Problem
```
User clicks "Pay" twice ──► Two orders created! 💀
```

### Solution
```typescript
class CheckoutDO extends DurableObject {
  private locked = false;
  private orderId: string | null = null;
  
  async fetch(request: Request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/lock') {
      // ✅ Atomic lock - no race condition
      if (this.locked) {
        return Response.json({ 
          success: false, 
          error: 'Checkout already in progress',
          existingOrderId: this.orderId
        }, { status: 409 });
      }
      
      this.locked = true;
      this.orderId = await request.text();
      
      // Auto-unlock after 5 minutes (timeout)
      await this.ctx.storage.setAlarm(Date.now() + 5 * 60 * 1000);
      
      return Response.json({ success: true, locked: true });
    }
    
    if (url.pathname === '/unlock') {
      this.locked = false;
      this.orderId = null;
      return Response.json({ success: true });
    }
    
    if (url.pathname === '/status') {
      return Response.json({ locked: this.locked, orderId: this.orderId });
    }
  }
  
  async alarm() {
    // Auto-unlock on timeout
    this.locked = false;
    this.orderId = null;
  }
}
```

### Usage
```typescript
// In checkout action
const checkoutDO = env.CHECKOUT_DO.get(
  env.CHECKOUT_DO.idFromName(`checkout-${cartId}`)
);

// Try to lock
const lockResult = await checkoutDO.fetch('/lock', {
  method: 'POST',
  body: orderId
}).then(r => r.json());

if (!lockResult.success) {
  return json({ error: 'Payment already processing' }, { status: 409 });
}

try {
  // Process payment...
  await processPayment();
} finally {
  // Always unlock
  await checkoutDO.fetch('/unlock', { method: 'POST' });
}
```

---

## 3️⃣ Rate Limiter DO (IMPORTANT)

### Problem
```
Spammer ──► 1000 requests/second ──► Server down 💀
```

### Solution
```typescript
class RateLimiterDO extends DurableObject {
  private requests: number[] = []; // timestamps
  
  async fetch(request: Request) {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const window = parseInt(url.searchParams.get('window') || '60000'); // 1 min
    
    const now = Date.now();
    
    // Clean old requests
    this.requests = this.requests.filter(t => now - t < window);
    
    if (this.requests.length >= limit) {
      return Response.json({ 
        allowed: false, 
        remaining: 0,
        resetAt: this.requests[0] + window
      }, { status: 429 });
    }
    
    this.requests.push(now);
    
    return Response.json({ 
      allowed: true, 
      remaining: limit - this.requests.length 
    });
  }
}
```

### Usage
```typescript
// Middleware
async function rateLimitMiddleware(request: Request, env: Env) {
  const ip = request.headers.get('CF-Connecting-IP');
  const storeId = getStoreId(request);
  
  const rateLimiter = env.RATE_LIMITER_DO.get(
    env.RATE_LIMITER_DO.idFromName(`ratelimit-${storeId}-${ip}`)
  );
  
  const result = await rateLimiter.fetch('/?limit=100&window=60000')
    .then(r => r.json());
  
  if (!result.allowed) {
    throw new Response('Too many requests', { status: 429 });
  }
}
```

---

## 4️⃣ Store Config Cache DO (IMPORTANT)

### Problem
```
Every request ──► DB query for store config ──► Slow! 🐢
```

### Solution
```typescript
class StoreConfigDO extends DurableObject {
  private config: StoreConfig | null = null;
  private lastFetch = 0;
  private TTL = 60 * 1000; // 1 minute cache
  
  async fetch(request: Request) {
    const url = new URL(request.url);
    
    if (url.pathname === '/get') {
      // Check cache
      if (this.config && Date.now() - this.lastFetch < this.TTL) {
        return Response.json({ config: this.config, cached: true });
      }
      
      // Fetch from D1
      const storeId = url.searchParams.get('storeId');
      this.config = await this.fetchFromDB(storeId);
      this.lastFetch = Date.now();
      
      return Response.json({ config: this.config, cached: false });
    }
    
    if (url.pathname === '/invalidate') {
      this.config = null;
      this.lastFetch = 0;
      return Response.json({ success: true });
    }
  }
}
```

### Benefits
- ✅ First request: DB
- ✅ Next 59 requests: Memory (instant!)
- ✅ No KV needed for hot data

---

## 5️⃣ Live Editor State DO (NICE-TO-HAVE)

### Problem
```
Refresh ──► All unsaved changes lost 💀
```

### Solution
```typescript
class EditorStateDO extends DurableObject {
  private sections: Section[] = [];
  private history: Section[][] = [];
  private historyIndex = 0;
  
  async fetch(request: Request) {
    const url = new URL(request.url);
    
    switch (url.pathname) {
      case '/update':
        return this.updateSection(await request.json());
      case '/undo':
        return this.undo();
      case '/redo':
        return this.redo();
      case '/get':
        return Response.json({ sections: this.sections });
      case '/save':
        return this.saveToDB();
    }
  }
  
  private async updateSection(data: { sectionId: string; props: any }) {
    // Save to history for undo
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push([...this.sections]);
    this.historyIndex = this.history.length - 1;
    
    // Update section
    const section = this.sections.find(s => s.id === data.sectionId);
    if (section) {
      section.props = { ...section.props, ...data.props };
    }
    
    // Auto-save to SQLite (draft)
    await this.ctx.storage.put('sections', this.sections);
    
    return Response.json({ success: true });
  }
  
  private undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.sections = [...this.history[this.historyIndex]];
    }
    return Response.json({ sections: this.sections });
  }
}
```

---

## 📊 DO vs DB Responsibility Split

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Responsibility Matrix                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   DURABLE OBJECTS (Coordination)         D1 DATABASE (Persistence)     │
│   ─────────────────────────────          ─────────────────────────     │
│   ✅ Cart state                          ✅ Products                    │
│   ✅ Checkout locks                      ✅ Orders (final)              │
│   ✅ Rate limiting                       ✅ Customers                   │
│   ✅ Session state                       ✅ Store config (source)       │
│   ✅ Editor draft                        ✅ Published pages             │
│   ✅ Real-time counters                  ✅ Analytics (aggregated)      │
│   ✅ Workflow orchestration              ✅ Audit logs                  │
│                                                                         │
│   Pattern:                                                              │
│   DO handles "in-flight" state ──► DB stores "final" state             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Anti-Patterns (Ki korle bipod!)

### ❌ 1. DO ke Fat banano
```typescript
// ❌ WRONG - Too much in one DO
class SuperDO {
  handleCart() {}
  handleCheckout() {}
  handleAnalytics() {}
  handleEverything() {} // 💀
}

// ✅ RIGHT - One DO = One responsibility
class CartDO { handleCart() {} }
class CheckoutDO { handleCheckout() {} }
```

### ❌ 2. Long blocking operations
```typescript
// ❌ WRONG - Blocks other requests
async fetch(request) {
  await heavyComputation(); // 30 seconds 💀
  await externalAPICall();  // Network delay 💀
}

// ✅ RIGHT - Quick response, background processing
async fetch(request) {
  this.ctx.waitUntil(heavyComputation()); // Non-blocking
  return Response.json({ queued: true });
}
```

### ❌ 3. Too many DOs per request
```typescript
// ❌ WRONG - 10 DO calls per request
for (const item of cart) {
  await inventoryDO.check(item); // 10 network hops 💀
}

// ✅ RIGHT - Batch in one DO
await inventoryDO.checkBatch(cart); // 1 network hop
```

### ❌ 4. Using DO as database
```typescript
// ❌ WRONG - Storing all orders in DO
class OrdersDO {
  orders: Order[] = []; // Will grow forever 💀
}

// ✅ RIGHT - DO coordinates, DB stores
class OrderDO {
  async createOrder(data) {
    await this.lock();
    await db.insert(orders).values(data); // DB stores
    await this.unlock();
  }
}
```

---

## 🚀 Implementation Roadmap

### Phase 1: Foundation (DONE ✅)
- [x] Order Processor DO
- [x] Email/Webhook task queue
- [x] FREE tier optimization

### Phase 2: Critical Features (NEXT)
- [ ] Cart DO
- [ ] Checkout Lock DO
- [ ] Integration with create-order API

### Phase 3: Performance
- [ ] Rate Limiter DO
- [ ] Store Config Cache DO

### Phase 4: Advanced
- [ ] Live Editor State DO
- [ ] Real-time inventory DO

---

## 💰 Cost Estimation (All DOs Combined)

| DO Type | Instances | Requests/day | Cost |
|---------|-----------|--------------|------|
| Order Processor | Per store | ~1K | FREE |
| Cart | Per session | ~10K | FREE |
| Checkout | Per order | ~500 | FREE |
| Rate Limiter | Per IP | ~50K | FREE |
| Store Config | Per store | ~100K | FREE |
| **TOTAL** | - | ~160K | **FREE** ✅ |

FREE tier limit: 1M requests/day  
**Capacity: ~6x headroom!**

---

## 🎯 Summary

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   Durable Objects = Shopify-level reliability                          │
│                                                                         │
│   ✅ No race conditions                                                │
│   ✅ No distributed locks needed                                       │
│   ✅ No Redis dependency                                               │
│   ✅ FREE tier compatible                                              │
│   ✅ Edge-native (low latency)                                         │
│                                                                         │
│   Pattern: DO (coordinate) ──► D1 (persist) ──► KV (cache)            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

**Next Step:** Bolo ki implement korte chai - Cart DO, Checkout Lock, or Rate Limiter?
