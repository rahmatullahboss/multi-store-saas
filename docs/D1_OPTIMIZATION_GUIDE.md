# কোড অপটিমাইজেশন গাইড: **D1 SQLite + Hono + Remix** (Edge-Native)

**ক্লাউডফ্লেয়ার ডেজ এনvironment এ সর্বোচ্চ পারফরম্যান্স**

> **⚠️ CRITICAL:** D1 SQLite পোস্টগ্রেসলের মতো নয়। এটি Edge-optimized, write-limited, এবং batch-operation-critical। এই গাইড পুরোটাই D1-স্পেসিফিক।

---

## **ফেজ ১: ডাটাবেস স্কিমা অপটিমাইজেশন (ডি১-স্পেসিফিক)**

### **১.১ একসাথে স্কিমা ডিজাইন**

D1 এ **write limits** আছে তাই migrations সিম্পল রাখুন:

```sql
-- db/schema.sql (একটাই ফাইল, সব টেবিল একসাথে)

-- স্টোর টেবিল
CREATE TABLE IF NOT EXISTS stores (
  id TEXT PRIMARY KEY,
  subdomain TEXT UNIQUE NOT NULL,
  domain TEXT UNIQUE,
  name TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  active_theme TEXT DEFAULT 'modern-v1',
  plan_tier TEXT DEFAULT 'free',
  is_active INTEGER DEFAULT 1,
  config TEXT, -- JSON string (D1 এ JSONB নেই)
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- স্টোর মেম্বার
CREATE TABLE IF NOT EXISTS store_members (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('owner', 'admin', 'staff')),
  created_at INTEGER DEFAULT (unixepoch())
);

-- প্রোডাক্ট টেবিল (AI-optimized indexing)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  compare_at_price REAL,
  inventory INTEGER DEFAULT 0,
  track_inventory INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK(status IN ('active', 'draft', 'archived')),
  seo TEXT, -- JSON string
  metadata TEXT, -- JSON string
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),

  -- D1 স্পেসিফিক: কম্পাউন্ড index
  UNIQUE(store_id, slug),
  INDEX idx_store_status (store_id, status),
  INDEX idx_store_created (store_id, created_at DESC)
);

-- অর্ডার টেবিল (partitioned thinking)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  order_number INTEGER NOT NULL,
  customer_id TEXT,
  subtotal REAL NOT NULL,
  tax REAL,
  shipping_cost REAL,
  total REAL NOT NULL,
  currency TEXT DEFAULT 'BDT',
  status TEXT CHECK(status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT,
  shipping_address TEXT, -- JSON string
  billing_address TEXT, -- JSON string
  line_items TEXT, -- JSON string
  created_at INTEGER DEFAULT (unixepoch()),

  INDEX idx_store_orders (store_id, created_at DESC),
  INDEX idx_order_status (store_id, status)
);

-- পেজ বিল্ডার
CREATE TABLE IF NOT EXISTS pages (
  id TEXT PRIMARY KEY,
  store_id TEXT NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  type TEXT DEFAULT 'custom',
  sections TEXT, -- JSON string (সব সেকশন)
  published INTEGER DEFAULT 0,
  seo TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  UNIQUE(store_id, slug),
  INDEX idx_store_pages (store_id, type)
);

-- ক্যাশ টেবিল (performance-critical)
CREATE TABLE IF NOT EXISTS cache_store (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  INDEX idx_expires (expires_at)
);
```

**ডি১ স্পেসিফিক টিপস:**

- `INTEGER DEFAULT (unixepoch())` ব্যবহার করুন (ডেটটাইম নয়)
- `JSONB` নেই, `TEXT` এ stringify করুন
- `ON DELETE CASCADE` দিয়ে রিলেশন ম্যানেজ করুন (সম্পূর্ণ ডিলিট এ ঝামেলা কমবে)
- প্রতি টেবিলে **সর্বনিম্ন ২টা index** রাখুন (store_id + created_at DESC)

---

### **১.২ Batch Operations (সবচাইতে গুরুত্বপূর্ণ)**

ডি১ এ প্রতি write অপারেশনে cost হয়। ব্যাচ করুন:

```typescript
// ❌ WRONG: লুপে আলাদা আলাদা write
for (const product of products) {
  await db.insert(products).values(product);
  // ১০০ প্রোডাক্ট = ১০০ টা API call!
}

// ✅ CORRECT: Single batch write
export async function batchInsertProducts(db: D1Database, products: Product[]) {
  const stmt = db.prepare(
    `INSERT INTO products (id, store_id, title, price, created_at) 
     VALUES (?, ?, ?, ?, ?)`
  );

  const batch = products.map((p) =>
    stmt.bind(p.id, p.storeId, p.title, p.price, Math.floor(Date.now() / 1000))
  );

  await db.batch(batch); // এক কল!
}
```

**ইমপ্যাক্ট:** ১০০ প্রোডাক্ট ইম্পোর্ট **১৫ সেকেন্ড থেকে ১ সেকেন্ড**।

---

### **১.৩ পড়ার জন্য Read Replica জিনিস নেই তাই ক্যাশিং (মাস্ট)**

```typescript
// app/services/cache-layer.ts
import { getDB } from "~/db/client";

// Redis-like cache on top of D1
export class D1Cache {
  private db: D1Database;
  private defaultTTL = 300; // ৫ মিনিট

  constructor(db: D1Database) {
    this.db = db;
  }

  async get<T>(key: string): Promise<T | null> {
    const result = await this.db
      .prepare(`SELECT value, expires_at FROM cache_store WHERE key = ?`)
      .bind(key)
      .first();

    if (!result) return null;

    const expiresAt = result.expires_at as number;
    if (Date.now() > expiresAt * 1000) {
      await this.delete(key); // এক্সপায়ার্ড ডিলিট
      return null;
    }

    return JSON.parse(result.value as string);
  }

  async set(key: string, value: any, ttl = this.defaultTTL) {
    const expiresAt = Math.floor(Date.now() / 1000) + ttl;

    await this.db
      .prepare(
        `INSERT OR REPLACE INTO cache_store (key, value, expires_at) 
       VALUES (?, ?, ?)`
      )
      .bind(key, JSON.stringify(value), expiresAt)
      .run();
  }

  async delete(key: string) {
    await this.db
      .prepare(`DELETE FROM cache_store WHERE key = ?`)
      .bind(key)
      .run();
  }

  // প্যাটার্ন: হট ক্যাশ ক্লিয়ার
  async invalidatePattern(pattern: string) {
    await this.db
      .prepare(`DELETE FROM cache_store WHERE key LIKE ?`)
      .bind(`%${pattern}%`)
      .run();
  }
}

// গলোবাল ইন্সট্যান্স
export const cache = new D1Cache(getDB());
```

---

### **১.৪ Store Settings ক্যাশিং (সবচাইতে গুরুত্বপূর্ণ)**

```typescript
// app/services/store-config.ts
export async function getStoreConfig(storeId: string) {
  const cacheKey = `store:${storeId}:config`;

  // ১. ক্যাশ চেক
  const cached = await cache.get<StoreConfig>(cacheKey);
  if (cached) return cached;

  // ২. ডি১ থেকে নাও
  const config = await db
    .prepare(`SELECT config FROM stores WHERE id = ?`)
    .bind(storeId)
    .first();

  if (!config) throw new Error("Store not found");

  // ৩. ক্যাশ সেভ (৫ মিনিট)
  const parsedConfig = JSON.parse(config.config as string);
  await cache.set(cacheKey, parsedConfig, 300);

  return parsedConfig;
}

// কনফিগ আপডেট করলে ক্যাশ ইনভ্যালিডেট
export async function updateStoreConfig(
  storeId: string,
  newConfig: StoreConfig
) {
  await db
    .prepare(`UPDATE stores SET config = ?, updated_at = ? WHERE id = ?`)
    .bind(JSON.stringify(newConfig), Math.floor(Date.now() / 1000), storeId)
    .run();

  // ক্যাশ ডিলিট (ইনভ্যালিডেট)
  await cache.delete(`store:${storeId}:config`);

  // রিলেটেড ক্যাশেস ও ডিলিট
  await cache.invalidatePattern(`store:${storeId}:products:*`);
}
```

**ইমপ্যাক্ট:** সেটিংস API **৫০০ms থেকে ৫ms**। ডি১ রিকোয়েস্ট **৯০% কমবে**।

---

## **ফেজ ২: হোনো অ্যাপ্লিকেশন লেয়ার অপটিমাইজেশন**

### **২.১ কানেকশন রিউজ**

ডি১ এ কানেকশন পুলিং নেই, তবে রিকোয়েস্টে একই ডি১ ইন্সট্যান্স রিউজ করুন:

```typescript
// server/context.ts
import { createContext } from "hono";
import { getDB } from "~/db/client";

// হোনো কনটেক্সট এ ডি১ বাইন্ড করুন
export const appContext = createContext<{ db: D1Database }>();

// মিডলওয়্যার
app.use("*", async (c, next) => {
  c.set("db", getDB());
  await next();
});

// রাউটে ব্যবহার
app.get("/api/store/:id", async (c) => {
  const db = c.get("db"); // সব জায়গা থেকে একই ডি১
  const store = await db
    .prepare("SELECT * FROM stores WHERE id = ?")
    .bind(c.req.param("id"))
    .first();
  return c.json(store);
});
```

---

### **২.২ রেট লিমিটিং (ডি১-স্পেসিফিক)**

ডি১ write limit ২৫ বিলিয়ন প্রতি মাসে। রেট লিমিট করে কস্ট বাঁচান:

```typescript
// server/middleware/rate-limit-d1.ts
import { Hono } from "hono";
import { redis } from "~/services/redis"; // অথবা D1-এই রেট লিমিট ট্র্যাক

const app = new Hono();

// Write অপারেশনের জন্য stricter limit
app.use("/api/*", async (c, next) => {
  const ip =
    c.req.header("CF-Connecting-IP") || c.req.header("x-forwarded-for");
  const key = `ratelimit:write:${ip}`;

  const current = await redis.incr(key);
  await redis.expire(key, 60); // ১ মিনিটে

  if (current > 100) {
    // ১ মিনিটে ১০০টার বেশি write না
    return c.json({ error: "Too many writes" }, 429);
  }

  await next();
});

// Read অপারেশন - রিলাক্সড
app.use("/api/store/*", async (c, next) => {
  const ip = c.req.header("CF-Connecting-IP");
  const key = `ratelimit:read:${ip}`;

  const current = await redis.get(key);
  if (parseInt(current || "0") > 1000) {
    return c.json({ error: "Too many requests" }, 429);
  }

  await redis.incr(key);
  await redis.expire(key, 60);

  await next();
});
```

---

### **২.৩ ব্যাচ API এন্ডপয়েন্ট**

```typescript
// app/routes/api/batch.ts
app.post("/api/batch", async (c) => {
  const { operations } = await c.req.json(); // [{ type: 'insert', table: 'products', data: {} }]

  const db = c.get("db");
  const batch = [];

  for (const op of operations) {
    const stmt = db
      .prepare(`INSERT INTO ${op.table} (id, store_id, data) VALUES (?, ?, ?)`)
      .bind(op.data.id, op.data.storeId, JSON.stringify(op.data));

    batch.push(stmt);
  }

  const results = await db.batch(batch);

  // ক্যাশ ইনভ্যালিডেট
  await cache.invalidatePattern(`store:${operations[0].data.storeId}:*`);

  return c.json({ success: true, results });
});
```

**ইউজেজ:** প্রোডাক্ট CSV ইম্পোর্ট এ ১০০টা প্রোডাক্ট এক API কলে।

---

## **ফেজ ৩: রিমিক্স ফ্রন্টএন্ড অপটিমাইজেশন**

### **৩.১ ডাটা ফেচিং অপটিমাইজেশন**

```typescript
// app/routes/store.$subdomain.tsx
export async function loader({ params, context }: LoaderArgs) {
  const db = context.db as D1Database;
  const cache = context.cache as D1Cache;

  // ১. স্টোর ক্যাশ চেক
  const cacheKey = `store:${params.subdomain}`;
  const cached = await cache.get(cacheKey);
  if (cached) return json(cached);

  // ২. সিঙ্গেল D1 কোয়েরি (JOIN নেই, দ্রুত)
  const result = await db
    .prepare(
      `
    SELECT s.*, 
           (SELECT COUNT(*) FROM products p WHERE p.store_id = s.id) as product_count
    FROM stores s
    WHERE s.subdomain = ?
  `
    )
    .bind(params.subdomain)
    .first();

  if (!result) throw new Response("Store not found", { status: 404 });

  // ৩. ক্যাশ সেভ (১ ঘণ্টা)
  await cache.set(cacheKey, result, 3600);

  return json(result);
}
```

### **৩.২ স্টেট ম্যানেজমেন্ট (Zustand দিয়ে রিডাক্স বাদ)**

```typescript
// app/stores/useStoreConfig.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface StoreConfigState {
  config: StoreConfig | null;
  loaded: boolean;
  load: (storeId: string) => Promise<void>;
  update: (config: Partial<StoreConfig>) => void;
}

export const useStoreConfig = create<StoreConfigState>()(
  devtools(
    persist(
      (set, get) => ({
        config: null,
        loaded: false,

        load: async (storeId: string) => {
          // ক্যাশ থেকে নাও
          const cached = localStorage.getItem(`config:${storeId}`);
          if (cached) {
            set({ config: JSON.parse(cached), loaded: true });
          }

          // ফ্রেশ ডেটা নাও (ব্যাকগ্রাউন্ড)
          const fresh = await fetch(`/api/store/${storeId}/config`).then((r) =>
            r.json()
          );
          set({ config: fresh, loaded: true });
          localStorage.setItem(`config:${storeId}`, JSON.stringify(fresh));
        },

        update: (updates) => {
          set((state) => ({
            config: { ...state.config, ...updates },
          }));
        },
      }),
      {
        name: "store-config-storage",
      }
    )
  )
);
```

**ইমপ্যাক্ট:** স্টেট আপডেট **৩০০ms থেকে ১০ms**। কোনো context রি-রেন্ডার নেই।

---

### **৩.৩ কম্পোনেন্ট মেমোইজেশন (অ্যাগ্রেসিভ)**

```typescript
// themes/modern-v2/blocks/ProductCard.tsx
import { memo } from "react";

interface ProductCardProps {
  product: Product;
  theme: ThemeTokens;
}

// শুধুমাত্র product.id বা theme পরিবর্তন হলে রি-রেন্ডার
export const ProductCard = memo(
  function ProductCard({ product, theme }: ProductCardProps) {
    const { finalPrice } = useProductPrice(product);

    return (
      <div style={{ borderRadius: theme.borderRadius.md }}>
        {/* heavy rendering */}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // কাস্টম কম্প্যার ফাংশন
    return (
      prevProps.product.id === nextProps.product.id &&
      prevProps.theme.colors.primary === nextProps.theme.colors.primary
    );
  }
);
```

---

## **ফেজ ৪: AI ইন্টিগ্রেশন অপটিমাইজেশন**

### **৪.১ AI কমান্ড ক্যাশিং**

```typescript
// app/services/ai-command-cache.ts
export class AICommandCache {
  private db: D1Database;

  async getCachedResponse(command: string, context: AIContext) {
    const cacheKey = `ai:${hash(command + JSON.stringify(context))}`;

    // D1 ক্যাশ চেক
    const cached = await this.db
      .prepare(`SELECT response FROM ai_cache WHERE key = ? AND expires_at > ?`)
      .bind(cacheKey, Math.floor(Date.now() / 1000))
      .first();

    if (cached) return JSON.parse(cached.response as string);

    return null;
  }

  async cacheResponse(command: string, context: AIContext, response: any) {
    const cacheKey = `ai:${hash(command + JSON.stringify(context))}`;

    await this.db
      .prepare(
        `INSERT OR REPLACE INTO ai_cache (key, response, expires_at) VALUES (?, ?, ?)`
      )
      .bind(
        cacheKey,
        JSON.stringify(response),
        Math.floor(Date.now() / 1000) + 3600 // ১ ঘণ্টা
      )
      .run();
  }
}
```

### **৪.২ স্মল মডেল ফর রুটিন কমান্ড (কস্ট কমানো)**

```typescript
// 80% কমান্ড সিম্পল, ছোট মডেল (Llama 2) ব্যবহার করুন
export async function generateAction(command: string, complexity: number) {
  if (complexity < 0.3) {
    // সিম্পল: "background red" -> ছোট মডেল
    return await llama2.generate(command);
  } else {
    // কমপ্লেক্স: "create marketing campaign" -> GPT-4
    return await gpt4.generate(command);
  }
}
```

---

## **ফেজ ৫: মনিটরিং ও ডিবাগিং (ডি১-স্পেসিফিক)**

### **৫.১ ডি১ অ্যানালিটিকস**

```typescript
// app/middleware/d1-analytics.ts
app.use("*", async (c, next) => {
  const start = Date.now();
  const queries: any[] = [];

  // ডি১ কোয়েরি ইন্টারসেপ্ট
  const originalPrepare = c.env.DB.prepare.bind(c.env.DB);
  c.env.DB.prepare = (...args) => {
    const stmt = originalPrepare(...args);
    const originalRun = stmt.run.bind(stmt);
    stmt.run = async (...runArgs) => {
      const queryStart = Date.now();
      const result = await originalRun(...runArgs);
      queries.push({
        sql: args[0],
        duration: Date.now() - queryStart,
        success: !result.error,
      });
      return result;
    };
    return stmt;
  };

  await next();

  const duration = Date.now() - start;

  // স্লো কোয়েরি অ্যালার্ট
  if (duration > 1000) {
    await logSlowQuery({
      path: c.req.path,
      duration,
      queries,
    });
  }

  // হেডারে ডিবাগ ইনফো
  c.res.headers.set("X-DB-Queries", queries.length.toString());
  c.res.headers.set("X-DB-Duration", duration.toString());
});
```

---

## **সংক্ষিপ্ত: D1-স্পেসিফিক চেকলিস্ট**

### **প্রতিটি API রাউটে:**

- [ ] **Read** এ `cache.get()` আগে
- [ ] **Write** এ `batch()` ব্যবহার
- [ ] প্রতি রিকোয়েস্টে ডি১ কোয়েরি **৫টার বেশি না**
- [ ] Write অপারেশন **১০০টার বেশি না** (batch limit)
- [ ] `unixepoch()` ব্যবহার করুন (ডেটটাইম নয়)
- [ ] Index সব টেবিলে **অন্তত ২টি**

### **মাসিক মনিটর:**

- [ ] D1 ড্যাশবোর্ড চেক (কুয়েরি count, errors)
- [ ] স্লো কোয়েরি identify করুন
- [ ] Cache hit rate > 80% নিশ্চিত করুন
