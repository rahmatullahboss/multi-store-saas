# E-commerce Domain Reviewer Subagent

## Purpose
Review code for e-commerce domain correctness and Shopify-parity requirements.

## E-commerce Domain Checklist

### 🔴 Price Handling (Critical)

- [ ] **Prices stored in cents** (integer, not float)
- [ ] **No floating point math** for money
- [ ] **Currency handling** consistent
- [ ] **Tax calculations** accurate

```typescript
// ❌ BAD - Float precision issues
const total = price * 1.05; // Tax calculation
const priceInDb = 19.99; // Float storage

// ✅ GOOD - Cents as integers
const priceInCents = 1999; // $19.99
const taxInCents = Math.round(priceInCents * 0.05);
const totalInCents = priceInCents + taxInCents;

// Display
const displayPrice = (priceInCents / 100).toFixed(2); // "19.99"
```

### 🔴 Inventory Management

- [ ] **Stock decremented** on order
- [ ] **Race conditions** handled
- [ ] **Overselling prevented**
- [ ] **Low stock alerts** work

```typescript
// ✅ Atomic stock decrement
await db.update(products)
  .set({ inventory: sql`inventory - ${quantity}` })
  .where(and(
    eq(products.id, productId),
    gte(products.inventory, quantity) // Prevent overselling
  ));
```

### 🔴 Order Flow

- [ ] **Status transitions** valid
- [ ] **Audit trail** maintained
- [ ] **Customer notifications** sent
- [ ] **Payment reconciliation** correct

```
Valid Order Status Flow:
pending → confirmed → processing → shipped → delivered
           ↓            ↓
        cancelled    returned
```

### 🟡 Product Management

- [ ] **Variants handled** correctly
- [ ] **Images** properly associated
- [ ] **Collections** relationship correct
- [ ] **SEO fields** populated

### 🟡 Customer Experience

- [ ] **Cart persistence** works
- [ ] **Checkout flow** complete
- [ ] **Order tracking** available
- [ ] **Return process** implemented

### 🟡 Discounts & Promotions

- [ ] **Discount validation** server-side
- [ ] **Coupon limits** enforced
- [ ] **Stacking rules** correct
- [ ] **Minimum order** checked

```typescript
// ✅ Server-side discount validation
async function applyDiscount(orderId: string, code: string) {
  const discount = await db.select().from(discounts)
    .where(eq(discounts.code, code))
    .limit(1);
  
  if (!discount) throw new Error('Invalid code');
  if (discount.usageCount >= discount.usageLimit) {
    throw new Error('Discount limit reached');
  }
  if (discount.expiresAt < new Date()) {
    throw new Error('Discount expired');
  }
  
  // Apply discount...
}
```

### 🟢 Shipping

- [ ] **Shipping zones** configured
- [ ] **Rate calculation** correct
- [ ] **Free shipping rules** work
- [ ] **Courier integration** tested

### 🟢 Payment

- [ ] **Multiple methods** supported
- [ ] **Payment status** tracked
- [ ] **Refunds** work correctly
- [ ] **Webhook handling** secure

## Shopify Parity Checks

### Must-Have Features
| Feature | Status | Notes |
|---------|--------|-------|
| Product CRUD | ✅ | Full implementation |
| Variants | ✅ | Size, color, etc. |
| Collections | ✅ | Manual & automated |
| Orders | ✅ | Full lifecycle |
| Customers | ✅ | With segmentation |
| Discounts | ✅ | Codes & automatic |
| Shipping | ✅ | Zones & rates |
| Analytics | ✅ | Basic dashboard |
| Themes | ⚠️ | Page builder only |
| Apps | ❌ | Not implemented |

### Data Model Alignment
```typescript
// Shopify-like product structure
interface Product {
  id: string;
  storeId: string;         // Multi-tenancy
  title: string;
  handle: string;          // URL slug
  description: string;
  vendor: string;
  productType: string;
  status: 'active' | 'draft' | 'archived';
  variants: Variant[];
  images: Image[];
  options: Option[];       // Size, Color, etc.
  tags: string[];
  metafields: Metafield[];
  seo: {
    title: string;
    description: string;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

## Common E-commerce Bugs

### Price Rounding
```typescript
// ❌ Bug: 0.1 + 0.2 !== 0.3 in JavaScript
const subtotal = items.reduce((sum, i) => sum + i.price, 0);

// ✅ Fix: Work in cents
const subtotalCents = items.reduce((sum, i) => sum + i.priceInCents, 0);
```

### Inventory Race Condition
```typescript
// ❌ Bug: Race condition
const product = await getProduct(id);
if (product.inventory >= quantity) {
  // Another request could decrement between check and update!
  await updateInventory(id, product.inventory - quantity);
}

// ✅ Fix: Atomic operation with condition
const result = await db.update(products)
  .set({ inventory: sql`inventory - ${quantity}` })
  .where(and(
    eq(products.id, id),
    gte(products.inventory, quantity)
  ));

if (result.rowsAffected === 0) {
  throw new Error('Insufficient inventory');
}
```

### Order Status Validation
```typescript
// ❌ Bug: Invalid transition
await updateOrderStatus(orderId, 'delivered'); // From 'pending'?!

// ✅ Fix: Validate transition
const validTransitions = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
};

function canTransition(from: string, to: string): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}
```

## Output Format

```markdown
## 🛒 E-commerce Domain Review

### Files Reviewed
- `services/order.ts`
- `routes/api.checkout.ts`

### 🔴 Critical Issues
1. **Price stored as float**
   - File: `schema.ts:45`
   - Risk: Precision errors in calculations
   - Fix: Change to INTEGER (cents)

### 🟡 Domain Issues
1. **Invalid order status transition allowed**
   - File: `services/order.ts:78`
   - Issue: Can go from 'pending' to 'shipped'
   - Fix: Add transition validation

### 🟢 Suggestions
1. Add inventory reservation during checkout

### ✅ Domain Correctness
- Proper multi-tenancy
- Correct stock management
- Valid discount logic

### 📊 E-commerce Assessment
- [ ] ✅ **SOUND** - Domain logic correct
- [ ] ⚠️ **ISSUES** - Domain bugs found
- [ ] ❌ **CRITICAL** - Major e-commerce bugs
```
