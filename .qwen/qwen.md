# Qwen Code Guidelines - Multi Store SaaS

> **Project**: Ozzyl Multi-tenant E-commerce Platform  
> **Tech Stack**: Remix + Cloudflare Workers + D1 + Drizzle ORM  
> **Last Updated**: 2026-03-07

---

## 🎯 Quick Reference

### Development Commands

```bash
# Install dependencies
npm install

# Development (from apps/web/)
npm run dev:wrangler    # Use this for full Cloudflare environment

# Build & Deploy
npm run build
npm run deploy

# Database
npm run db:migrate:local   # Local migrations
npm run db:migrate:prod    # Production migrations

# Testing
npm run test          # Vitest unit tests
npm run e2e           # Playwright E2E tests
```

---

## 🏪 Store System Architecture

### Unified Settings System (CANONICAL)

**Single Source of Truth**: `stores.storefront_settings` (JSON column)

```typescript
{
  version: "v1",
  theme: {
    templateId: "nova-lux",  // Theme selector
    primary: "#4F46E5",
    accent: "#F59E0B",
    // ... colors
  },
  branding: { storeName, logo, favicon },
  business: { phone, email, address },
  social: { facebook, instagram, whatsapp },
  announcement: { enabled, text, link },
  heroBanner: { mode, slides: [] },
  shippingConfig: { insideDhaka, outsideDhaka, freeShippingAbove },
  trustBadges: { badges: [] },
  // ... more sections
}
```

**Key Files**:
- `apps/web/app/services/storefront-settings.schema.ts` - Zod schema
- `apps/web/app/services/unified-storefront-settings.server.ts` - CRUD operations
- `apps/web/app/templates/store-registry.ts` - Template definitions

### Multi-Tenancy (CRITICAL)

**EVERY query MUST filter by `store_id`**:

```typescript
// ✅ CORRECT
const products = await db
  .select()
  .from(products)
  .where(eq(products.storeId, currentStoreId));

// ❌ WRONG - Data leak!
const products = await db.select().from(products);
```

---

## ⚛️ React Component Patterns

### Component Props Interface

**ALWAYS define props interface**:

```typescript
interface MyComponentProps {
  product: Product;
  currency: string;
  storeName?: string;      // Optional with default
  logo?: string | null;
  categories?: string[];
  config?: any;            // Unified settings
  theme?: StoreTemplateTheme;
  isPreview?: boolean;
}

export function MyComponent({
  product,
  currency,
  storeName = 'Store',     // Default value
  logo,
  categories = [],         // Default empty array
  config,
  theme,
  isPreview = false,
}: MyComponentProps) {
  // Safe to use all props
}
```

### Using Unified Settings

```typescript
function Component({ config }) {
  // ✅ Safe access with optional chaining
  const primaryColor = config?.theme?.primary || '#000';
  const announcement = config?.announcement;
  const heroSlides = config?.heroBanner?.slides;
  
  // ❌ Will crash if config undefined
  const primaryColor = config.theme.primary;
}
```

### JSX Structure

**ALWAYS close all tags**:

```typescript
// ✅ CORRECT
return (
  <div className="outer">
    <Header />
    <div className="content">
      {children}
    </div>
    <Footer />
  </div>
);

// ❌ WRONG - Missing closing tags
return (
  <div className="outer">
    <Header />
    <div className="content">
      {children}
  </div>  // ← Error: outer div not closed
);
```

---

## 🗄️ Database Patterns

### Query Patterns

```typescript
// ✅ Always scope by storeId
const products = await db
  .select()
  .from(products)
  .where(eq(products.storeId, storeId));

// ✅ Use batch for multiple writes
await db.batch([
  db.insert(items).values(cartItems),
  db.update(inventory).set({ qty: sql`qty - 1` }),
]);

// ✅ Use transactions for critical operations
await db.transaction(async (tx) => {
  await tx.insert(orders).values(order);
  await tx.update(inventory).set({...});
});
```

### Schema Validation

```typescript
// ✅ Use Zod for validation
const ProductSchema = z.object({
  title: z.string().min(1),
  price: z.number().positive(),
  storeId: z.number(),
});

// ❌ Don't trust client data
const data = await request.json();  // Unvalidated!
```

---

## 🎨 Theme System

### Available Templates

1. `starter-store` - Basic modern template
2. `nova-lux` - Dark luxury theme
3. `luxe-boutique` - Fashion boutique
4. `dc-store` - Golden gradient
5. `daraz` - Marketplace style
6. `ozzyl-premium` - Premium design
7. + 10 more templates

### Template Structure

```typescript
// apps/web/app/templates/store-registry.ts
export const STORE_TEMPLATES: StoreTemplateDefinition[] = [
  {
    id: 'nova-lux',
    name: 'Nova Lux',
    component: NovaLuxTemplate,      // Main layout
    Header: NovaLuxHeader,
    Footer: NovaLuxFooter,
    ProductPage: NovaLuxProductPage,
    CartPage: SharedCartPage,
    CheckoutPage: SharedCheckoutPage,
    theme: NOVALUX_THEME,
  },
];
```

---

## ⚠️ Common Errors & Fixes

### 1. `X is not defined`

**Cause**: Using variable not in scope

**Fix**:
```typescript
// ❌ WRONG
accentColor={unifiedSettings.theme.accent}  // unifiedSettings not defined

// ✅ CORRECT
accentColor={config?.theme?.accent}  // Use config prop
```

### 2. Missing Props

**Cause**: Component needs props but they're not defined

**Fix**:
```typescript
// ✅ Define in interface
interface Props {
  storeName?: string;
  logo?: string | null;
}

// ✅ Destructure in component
function Component({ storeName, logo }: Props) {
  return <Header storeName={storeName} logo={logo} />;
}
```

### 3. Invalid Datetime

**Cause**: Zod `.datetime()` too strict

**Fix**:
```typescript
// ❌ Too strict
updatedAt: z.string().datetime()

// ✅ Optional with default
updatedAt: z.string().optional().default(() => new Date().toISOString())
```

### 4. JSX Structure Errors

**Cause**: Unclosed tags

**Fix**: Count opening and closing tags, ensure they match

---

## 🔐 Security Rules

1. **ALWAYS filter by store_id** - Prevents data leaks
2. **Validate all inputs** - Use Zod schemas
3. **Never trust client data** - Server-side validation only
4. **Use parameterized queries** - No SQL injection
5. **Check authentication** - `requireUserId()` for protected routes

---

## 📝 Code Style

### TypeScript

```typescript
// ✅ Explicit types
function add(a: number, b: number): number {
  return a + b;
}

// ✅ No any (use unknown if needed)
function process(data: unknown) {
  if (typeof data === 'object') {
    // Type guard
  }
}

// ✅ Early returns
function getUser(id: number) {
  if (!id) return null;
  // ... logic
}
```

### React

```typescript
// ✅ Functional components
export function Component({ prop }: Props) {
  return <div>{prop}</div>;
}

// ✅ Typed hooks
const [count, setCount] = useState<number>(0);

// ✅ Memoization for expensive calcs
const total = useMemo(() => {
  return items.reduce((sum, item) => sum + item.price, 0);
}, [items]);
```

---

## 🧪 Testing

### Unit Tests (Vitest)

```typescript
import { describe, it, expect } from 'vitest';

describe('function', () => {
  it('should work', () => {
    expect(result).toBe(expected);
  });
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('checkout flow', async ({ page }) => {
  await page.goto('/products/1');
  await page.click('button:has-text("Add to Cart")');
  await page.goto('/cart');
  await expect(page).toHaveURL('/cart');
});
```

---

## 📚 Documentation Files

- **STORE_SYSTEM_DOCUMENTATION.md** - Complete store system docs
- **CLAUDE.md** - Project overview and commands
- **AGENTS.md** - Agent guidelines
- **AI_ARCHITECTURE_SPEC.md** - AI layer spec

---

## 🆘 Troubleshooting Checklist

Before deploying:

- [ ] All props defined in interface?
- [ ] All JSX tags closed?
- [ ] Optional chaining for nested objects?
- [ ] Default values for optional props?
- [ ] TypeScript compiles without errors?
- [ ] Tested locally with `npm run dev:wrangler`?

If error occurs:

1. Read full error message
2. Check line number in stack trace
3. Verify variable is in scope
4. Check prop definitions
5. Validate JSX structure

---

**Remember**: Test locally before deploying! Use `npm run dev:wrangler` for full Cloudflare environment simulation.
