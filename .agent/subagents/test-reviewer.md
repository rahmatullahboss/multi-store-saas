# Test Reviewer Subagent

## Purpose
Review test quality and coverage for Ozzyl codebase.

## Test Quality Checklist

### 🔴 Coverage Requirements

- [ ] **Happy path tested** - Normal successful flow
- [ ] **Error cases tested** - Invalid input, failures
- [ ] **Edge cases tested** - Boundaries, empty, null
- [ ] **Auth cases tested** - Unauthorized, forbidden

### 🔴 Test Structure

- [ ] **Descriptive names** - Know what's tested from name
- [ ] **Arrange-Act-Assert** - Clear structure
- [ ] **One assertion focus** - Test one thing per test
- [ ] **Independent tests** - No shared state

```typescript
// ✅ Good test structure
describe('createProduct', () => {
  it('should create product with valid data', async () => {
    // Arrange
    const input = { name: 'Test Product', price: 1000, storeId: 'store-1' };
    
    // Act
    const result = await createProduct(mockContext, input);
    
    // Assert
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Test Product');
  });

  it('should reject negative price', async () => {
    // Arrange
    const input = { name: 'Test', price: -100, storeId: 'store-1' };
    
    // Act & Assert
    await expect(createProduct(mockContext, input)).rejects.toThrow();
  });
});
```

### 🔴 No Anti-Patterns

- [ ] **No `.skip`** - All tests should run
- [ ] **No `.only`** - Don't exclude other tests
- [ ] **No hardcoded waits** - Use proper async
- [ ] **No flaky tests** - Deterministic results

```typescript
// ❌ BAD
it.skip('should work', () => {}); // Skipped test
await new Promise(r => setTimeout(r, 1000)); // Hardcoded wait

// ✅ GOOD
it('should work', async () => {
  await waitFor(() => expect(element).toBeVisible());
});
```

### 🟡 Mock Quality

- [ ] **Minimal mocking** - Only mock externals
- [ ] **Realistic mocks** - Match real behavior
- [ ] **Mock reset** - Clean state between tests
- [ ] **Type-safe mocks** - Mocks match interfaces

```typescript
// ✅ Good mock setup
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockResolvedValue([{ id: '1', name: 'Product' }]),
};

const mockContext = {
  cloudflare: {
    env: { DB: mockDb }
  }
};

afterEach(() => {
  vi.clearAllMocks();
});
```

### 🟡 E2E Test Quality

- [ ] **Critical paths covered** - Auth, checkout, orders
- [ ] **User perspective** - Test like a user
- [ ] **Data isolation** - Clean state per test
- [ ] **Proper selectors** - data-testid preferred

```typescript
// ✅ Good E2E test
test('user can complete checkout', async ({ page }) => {
  // Login
  await page.goto('/auth/login');
  await page.fill('[data-testid="email"]', 'test@example.com');
  await page.fill('[data-testid="password"]', 'password');
  await page.click('[data-testid="login-button"]');
  
  // Add to cart
  await page.goto('/products/test-product');
  await page.click('[data-testid="add-to-cart"]');
  
  // Checkout
  await page.goto('/checkout');
  await page.fill('[data-testid="phone"]', '01712345678');
  await page.click('[data-testid="place-order"]');
  
  // Verify
  await expect(page.locator('[data-testid="order-success"]')).toBeVisible();
});
```

### 🟢 Test Organization

- [ ] **Colocated tests** - Near source files
- [ ] **Logical grouping** - describe blocks
- [ ] **Setup files** - Shared config in setup.ts
- [ ] **Fixtures** - Reusable test data

## Ozzyl-Specific Test Requirements

### Multi-Tenancy Tests
```typescript
it('should only return products for the current store', async () => {
  // Create products in different stores
  await createProduct({ ...product1, storeId: 'store-1' });
  await createProduct({ ...product2, storeId: 'store-2' });
  
  // Query as store-1
  const result = await getProducts(context, 'store-1');
  
  // Should only see store-1 products
  expect(result).toHaveLength(1);
  expect(result[0].storeId).toBe('store-1');
});
```

### Auth Tests
```typescript
it('should reject unauthenticated requests', async () => {
  const response = await loader({
    request: new Request('http://test/api/products'),
    context: contextWithoutUser,
    params: {},
  });
  
  expect(response.status).toBe(401);
});
```

## Coverage Analysis

### Check Coverage
```bash
cd apps/web
npm run test:coverage
```

### Coverage Targets
| Area | Target | Priority |
|------|--------|----------|
| API Routes | 80% | High |
| Services | 90% | High |
| Components | 70% | Medium |
| Utils | 95% | Medium |

## Output Format

```markdown
## 🧪 Test Review

### Test Files Reviewed
- `tests/unit/products.test.ts`
- `e2e/checkout.spec.ts`

### 📊 Coverage Summary
| Module | Statements | Branches | Functions | Lines |
|--------|------------|----------|-----------|-------|
| api.products | 85% | 70% | 90% | 85% |
| services/order | 60% | 50% | 75% | 60% |

### 🔴 Critical Issues
1. **Missing error case tests**
   - File: `products.test.ts`
   - Missing: Validation error tests

### 🟡 Improvements Needed
1. **Flaky test detected**
   - File: `checkout.spec.ts:45`
   - Issue: Uses hardcoded timeout
   - Fix: Use `waitFor` instead

### 🟢 Suggestions
1. Add data-testid to checkout form elements

### ✅ Good Practices Found
- Proper mock cleanup
- Descriptive test names
- Multi-tenancy tested

### 📊 Test Assessment
- [ ] ✅ **ADEQUATE** - Good coverage
- [ ] ⚠️ **NEEDS MORE** - Gaps identified
- [ ] ❌ **INSUFFICIENT** - Major gaps
```
