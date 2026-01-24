# Code Quality Reviewer Subagent

## Purpose
Review code for quality, maintainability, and adherence to Ozzyl patterns.

## Quality Checklist

### 🔴 TypeScript Standards (Critical)

- [ ] **No `any` types** - Use proper types or `unknown`
- [ ] **Explicit return types** on exported functions
- [ ] **Interfaces defined** for complex objects
- [ ] **Zod schemas** match TypeScript types

```typescript
// ❌ BAD
function processOrder(data: any) {
  return data.items.map((i: any) => i.price);
}

// ✅ GOOD
interface OrderItem {
  id: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
}

function processOrder(data: Order): number[] {
  return data.items.map((item) => item.price);
}
```

### 🔴 Error Handling

- [ ] **Try/catch** around async operations
- [ ] **Specific error types** caught when possible
- [ ] **User-friendly messages** returned
- [ ] **Errors logged** with context

```typescript
// ✅ Proper error handling
export async function action({ request, context }: ActionFunctionArgs) {
  try {
    const data = await request.json();
    const validated = ProductSchema.parse(data);
    const result = await createProduct(context, validated);
    return json({ success: true, data: result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return json({ success: false, errors: error.errors }, { status: 400 });
    }
    console.error('[createProduct]', error);
    return json({ success: false, error: 'Failed to create product' }, { status: 500 });
  }
}
```

### 🔴 Remix Patterns

- [ ] **Data loading** via `loader`, not `useEffect`
- [ ] **Mutations** via `action`, not direct fetch
- [ ] **Forms** use `<Form>` or `useFetcher`
- [ ] **Streaming** with `defer()` for non-critical data

```typescript
// ❌ BAD - useEffect for data
useEffect(() => {
  fetch('/api/products').then(setProducts);
}, []);

// ✅ GOOD - loader pattern
export async function loader({ context }: LoaderFunctionArgs) {
  return json({ products: await getProducts(context) });
}
```

### 🟡 Code Organization

- [ ] **File size** < 300 lines (split if larger)
- [ ] **Single responsibility** - one concern per file
- [ ] **Business logic** in services, not routes
- [ ] **Shared code** extracted to utils/lib

### 🟡 DRY Principle

- [ ] **No duplicate code** - extract to functions
- [ ] **Shared components** for repeated UI
- [ ] **Constants** for magic values
- [ ] **Hooks** for repeated logic

### 🟡 Naming Conventions

- [ ] **Components**: PascalCase (`ProductCard`)
- [ ] **Functions**: camelCase (`getProductById`)
- [ ] **Constants**: UPPER_SNAKE (`MAX_ITEMS`)
- [ ] **Files**: kebab-case or match export

### 🟢 Documentation

- [ ] **Complex logic** has comments
- [ ] **Public APIs** have JSDoc
- [ ] **Non-obvious code** explained
- [ ] **TODO/FIXME** have tickets

### 🟢 Clean Code

- [ ] **No console.log** in production
- [ ] **No commented-out code**
- [ ] **No unused imports**
- [ ] **No unused variables**

## Ozzyl-Specific Patterns

### Service Layer Pattern
```typescript
// apps/web/app/services/products.ts
export async function getProducts(context: AppContext, storeId: string) {
  const { DB } = context.cloudflare.env;
  const db = drizzle(DB);
  return db.select().from(products).where(eq(products.storeId, storeId));
}

// apps/web/app/routes/api.products.ts
export async function loader({ context }: LoaderFunctionArgs) {
  const storeId = await getStoreId(context);
  return json(await getProducts(context, storeId));
}
```

### Component Pattern
```typescript
// Proper component structure
interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3>{product.name}</h3>
      <p>{formatPrice(product.price)}</p>
      {onAddToCart && (
        <button onClick={() => onAddToCart(product.id)}>
          Add to Cart
        </button>
      )}
    </div>
  );
}
```

## Output Format

```markdown
## 📝 Code Quality Review

### Files Reviewed
- `path/to/file.ts`

### 🔴 Critical Issues
1. **Using `any` type**
   - File: `services/order.ts:45`
   - Fix: Define proper interface

### 🟡 Improvements Needed
1. **File too large** (450 lines)
   - File: `routes/app.dashboard.tsx`
   - Fix: Extract components to separate files

### 🟢 Suggestions
1. **Could extract repeated logic**
   - Files: Multiple routes have same auth check
   - Suggestion: Create `requireAuth` middleware

### ✅ Good Practices Found
- Clean component structure
- Proper error handling
- Good use of TypeScript

### 📊 Quality Assessment
- [ ] ✅ **APPROVED** - High quality code
- [ ] ⚠️ **NEEDS WORK** - Fix issues first
- [ ] ❌ **MAJOR REFACTOR** - Significant issues
```
