# Ozzyl E-commerce SaaS - Domain Skill

> **Domain**: Multi-tenant E-commerce SaaS (Shopify of Bangladesh)  
> **Stack**: Cloudflare Native (Remix + Hono + D1 + KV + R2 + Vectorize + Workers AI)

---

## 🎯 Overview

Ozzyl is a multi-tenant e-commerce SaaS platform that enables merchants to create and manage online stores. Think "Shopify for Bangladesh" - built entirely on Cloudflare's edge infrastructure for global performance.

### Key Differentiators
- **Edge-First**: All code runs on Cloudflare's 300+ global edge locations
- **Multi-Tenant**: Single codebase serves thousands of isolated stores
- **Local Payments**: bKash, Nagad integration for Bangladeshi market
- **AI-Powered**: Product recommendations, chat agents, content generation

---

## 📚 Key Concepts

| Term | Meaning |
|------|---------|
| **Store** | A merchant's online shop (tenant) |
| **Merchant** | Store owner/operator |
| **Customer** | End-user who buys from a store |
| **Product** | Item for sale with variants |
| **Variant** | Product option (size, color) |
| **Collection** | Group of products |
| **Order** | Customer purchase transaction |
| **Checkout** | Order creation flow |
| **Theme** | Store visual design |
| **Page Builder** | Visual page editor (GrapesJS) |

---

## 🗄️ Data Models

### Core Entities

```
┌─────────────────────────────────────────────────────────┐
│                        PLATFORM                          │
├─────────────────────────────────────────────────────────┤
│  ┌─────────┐    ┌─────────┐    ┌─────────────────────┐  │
│  │  Users  │───▶│  Stores │───▶│ Products/Orders/... │  │
│  │ (Admins)│    │(Tenants)│    │   (Store-scoped)    │  │
│  └─────────┘    └─────────┘    └─────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Store (Tenant)
```typescript
interface Store {
  id: string;           // UUID
  name: string;         // "My Awesome Store"
  slug: string;         // "my-awesome-store" (subdomain)
  domain: string | null;// Custom domain "mystore.com"
  ownerId: string;      // User who owns this store
  status: 'active' | 'suspended' | 'trial';
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  settings: StoreSettings; // JSON blob
  createdAt: Date;
  updatedAt: Date;
}
```

### Product
```typescript
interface Product {
  id: string;
  storeId: string;      // 🔴 CRITICAL: Multi-tenancy key
  name: string;
  slug: string;         // URL-friendly
  description: string;
  price: number;        // In CENTS (integer)
  compareAtPrice: number | null; // Original price for sale display
  inventory: number;    // Stock count
  sku: string | null;
  status: 'active' | 'draft' | 'archived';
  images: string[];     // R2 URLs
  categoryId: string | null;
  tags: string[];
  seoTitle: string | null;
  seoDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### Order
```typescript
interface Order {
  id: string;
  storeId: string;      // 🔴 CRITICAL
  orderNumber: string;  // Human-readable "ORD-1234"
  customerId: string | null;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod: string; // 'bkash' | 'nagad' | 'cod' | 'card'
  subtotal: number;     // Cents
  discount: number;     // Cents
  shipping: number;     // Cents
  tax: number;          // Cents
  total: number;        // Cents
  items: OrderItem[];   // JSON
  shippingAddress: Address;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

type OrderStatus = 
  | 'pending'      // Just created
  | 'confirmed'    // Payment verified
  | 'processing'   // Being prepared
  | 'shipped'      // On the way
  | 'delivered'    // Completed
  | 'cancelled'    // Cancelled
  | 'returned';    // Returned
```

### Customer
```typescript
interface Customer {
  id: string;
  storeId: string;      // 🔴 CRITICAL
  email: string | null;
  phone: string;        // Primary identifier in BD
  name: string;
  totalOrders: number;
  totalSpent: number;   // Cents
  tags: string[];
  segment: string | null; // 'vip' | 'at-risk' | etc.
  createdAt: Date;
  lastOrderAt: Date | null;
}
```

---

## 🔄 Business Workflows

### Order Lifecycle
```
Customer                    Merchant                    System
    │                          │                          │
    │──── Add to Cart ─────────┼──────────────────────────│
    │                          │                          │
    │──── Checkout ────────────┼──────────────────────────│
    │                          │                          │
    │──── Pay (bKash/COD) ─────┼──────────────────────────│
    │                          │         ┌────────────────│
    │                          │◀────────│ Order Created  │
    │                          │         │ (status:pending)│
    │                          │         └────────────────│
    │                          │                          │
    │                          │──── Confirm Order ───────│
    │                          │         ┌────────────────│
    │◀─────── SMS/Email ───────┼─────────│ Notification   │
    │                          │         └────────────────│
    │                          │                          │
    │                          │──── Ship Order ──────────│
    │◀─────── Tracking ────────┼──────────────────────────│
    │                          │                          │
    │──── Receive ─────────────┼──────────────────────────│
    │                          │         ┌────────────────│
    │                          │◀────────│ Mark Delivered │
    │                          │         └────────────────│
```

### Payment Flow (bKash)
```
1. Customer selects bKash at checkout
2. System creates payment intent
3. Redirect to bKash gateway
4. Customer completes payment
5. bKash webhook → /api/webhooks/bkash
6. Verify signature & update order
7. Send confirmation to customer
```

### Inventory Flow
```typescript
// On order creation
async function reserveInventory(items: CartItem[]) {
  for (const item of items) {
    const result = await db.update(products)
      .set({ inventory: sql`inventory - ${item.quantity}` })
      .where(and(
        eq(products.id, item.productId),
        gte(products.inventory, item.quantity)
      ));
    
    if (result.rowsAffected === 0) {
      throw new Error(`Insufficient stock for ${item.productId}`);
    }
  }
}

// On order cancellation
async function releaseInventory(items: OrderItem[]) {
  for (const item of items) {
    await db.update(products)
      .set({ inventory: sql`inventory + ${item.quantity}` })
      .where(eq(products.id, item.productId));
  }
}
```

---

## 🏗️ Module Reference

| Module | Purpose | Key Files |
|--------|---------|-----------|
| **Auth** | User authentication & sessions | `routes/auth.*`, `lib/auth.ts` |
| **Products** | Product CRUD & variants | `routes/app.products.*`, `services/products.ts` |
| **Orders** | Order management | `routes/app.orders.*`, `services/orders.ts` |
| **Customers** | Customer management & segments | `routes/app.customers.*` |
| **Checkout** | Cart & checkout flow | `routes/checkout.*`, `routes/cart.*` |
| **Analytics** | Dashboard & reports | `routes/app.analytics.*` |
| **Page Builder** | Visual page editor | `apps/page-builder/` |
| **Marketing** | Campaigns & discounts | `routes/app.campaigns.*` |
| **Settings** | Store configuration | `routes/app.settings.*` |
| **AI Agent** | AI chat assistant | `routes/app.agent.*` |
| **API** | External API endpoints | `routes/api.*`, `server/api/` |

---

## 💰 Price Handling Rules

### Storage
- All prices stored in **cents** (integer)
- BDT 199.50 → stored as `19950`
- Never use floats for money

### Display
```typescript
function formatPrice(cents: number, currency = 'BDT'): string {
  return `৳${(cents / 100).toFixed(2)}`;
}

// Or with Intl
function formatPriceBD(cents: number): string {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
  }).format(cents / 100);
}
```

### Calculations
```typescript
// Always work in cents
const subtotal = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
const discount = Math.round(subtotal * 0.10); // 10% discount
const shipping = 6000; // ৳60.00
const total = subtotal - discount + shipping;
```

---

## 🔐 Multi-Tenancy Rules

### The Golden Rule
```typescript
// 🔴 EVERY database query MUST include storeId filter

// ❌ NEVER DO THIS
const products = await db.select().from(productsTable);

// ✅ ALWAYS DO THIS
const products = await db
  .select()
  .from(productsTable)
  .where(eq(productsTable.storeId, currentStoreId));
```

### Getting Current Store
```typescript
// In Remix loader/action
export async function loader({ request, context }: LoaderFunctionArgs) {
  const user = await requireAuth(request, context);
  const store = await getCurrentStore(context, user.id);
  
  if (!store) {
    return redirect('/onboarding');
  }
  
  // Now use store.id in all queries
  const products = await getProducts(context, store.id);
  return json({ products });
}
```

### Store Resolution for Storefronts
```typescript
// For customer-facing pages (store.home.tsx)
export async function loader({ request, context }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  
  // Resolve store from subdomain or custom domain
  const store = await resolveStoreFromHost(context, url.host);
  
  if (!store) {
    throw new Response('Store not found', { status: 404 });
  }
  
  return json({ store });
}
```

---

## 🛠️ Common Patterns

### Service Layer
```typescript
// apps/web/app/services/products.ts
export async function createProduct(
  context: AppContext,
  storeId: string,
  data: CreateProductInput
): Promise<Product> {
  const { DB } = context.cloudflare.env;
  const db = drizzle(DB);
  
  const validated = CreateProductSchema.parse(data);
  
  const [product] = await db.insert(productsTable)
    .values({
      ...validated,
      storeId,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();
  
  return product;
}
```

### Route Handler
```typescript
// apps/web/app/routes/api.products.ts
export async function action({ request, context }: ActionFunctionArgs) {
  const user = await requireAuth(request, context);
  const store = await requireStore(context, user.id);
  
  const formData = await request.formData();
  const intent = formData.get('intent');
  
  switch (intent) {
    case 'create':
      const data = Object.fromEntries(formData);
      const product = await createProduct(context, store.id, data);
      return json({ success: true, product });
    
    case 'delete':
      const productId = formData.get('productId') as string;
      await deleteProduct(context, store.id, productId);
      return json({ success: true });
    
    default:
      return json({ error: 'Invalid intent' }, { status: 400 });
  }
}
```

### React Component
```typescript
// apps/web/app/components/ProductCard.tsx
interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const fetcher = useFetcher();
  const isAdding = fetcher.state === 'submitting';
  
  return (
    <div className="rounded-lg border p-4 hover:shadow-md transition">
      <img 
        src={product.images[0]} 
        alt={product.name}
        className="w-full h-48 object-cover rounded"
      />
      <h3 className="mt-2 font-semibold">{product.name}</h3>
      <p className="text-lg font-bold text-primary">
        {formatPrice(product.price)}
      </p>
      {onAddToCart && (
        <button
          onClick={() => onAddToCart(product.id)}
          disabled={isAdding || product.inventory === 0}
          className="mt-2 w-full btn btn-primary"
        >
          {product.inventory === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      )}
    </div>
  );
}
```

---

## 🔗 API Patterns

### REST Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/products` | List products |
| POST | `/api/products` | Create product |
| GET | `/api/products/:id` | Get product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |
| GET | `/api/orders` | List orders |
| POST | `/api/create-order` | Create order |
| POST | `/api/cart` | Manage cart |

### Response Format
```typescript
// Success
{
  "success": true,
  "data": { ... }
}

// Error
{
  "success": false,
  "error": "Human-readable message",
  "errors": [...] // Validation errors
}
```

---

## 📊 Key Metrics

| Metric | Query | Purpose |
|--------|-------|---------|
| Total Sales | SUM(orders.total) | Revenue tracking |
| Order Count | COUNT(orders) | Volume |
| AOV | AVG(orders.total) | Average order value |
| Conversion | Orders / Visits | Checkout efficiency |
| Top Products | GROUP BY product_id | Best sellers |

---

## 🚨 Common Gotchas

1. **Forgetting storeId** - Always filter by tenant
2. **Float prices** - Use cents (integers)
3. **Missing await** - All DB calls are async
4. **Direct fetch** - Use Remix loader/action instead
5. **Hardcoded URLs** - Use env vars for domains
6. **Missing validation** - Always use Zod
7. **Inventory race** - Use atomic updates

---

## 📚 Related Documentation

- Architecture: `docs/ARCHITECTURE.md`
- API Reference: `docs/API_REFERENCE.md`
- Cloudflare Setup: `docs/CLOUDFLARE_SAAS_SETUP.md`
- Page Builder: `docs/genie-builder/`
- Shopify Parity: `docs/shopify-parity/`
