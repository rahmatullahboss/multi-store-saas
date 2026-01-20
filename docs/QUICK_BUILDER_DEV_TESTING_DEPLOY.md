# QUICK_BUILDER_DEV_TESTING_DEPLOY.md

Ekta comprehensive guide for testing, debugging, deploying, aar code style enforcement for the Page Builder Worker at `apps/page-builder`.

---

## 1. Testing (100 lines)

### Unit Tests (Vitest)

Run unit tests from the main app root:

```bash
npm run test              # Run all tests once
npm run test:watch       # Watch mode for development
npm run test:ui          # UI-based test runner
npm run test:coverage    # Generate coverage report
```

**Expected Output:**
```
✓ app/tests/unit/... (X tests passed)
Coverage: 85%+
```

> **Tip**: Vitest uses jsdom environment (browser-like). Test files live in `app/tests/unit/`, `tests/`, and any `*.test.ts(x)` file in the codebase.

### E2E Tests (Playwright)

Run end-to-end tests:

```bash
npm run e2e                  # Run all E2E tests
npm run e2e:ui              # Playwright UI mode (interactive)
npm run e2e:headed          # Run tests with visible browser
npm run e2e:debug           # Debug mode (step through)
npm run e2e:report          # View HTML report
```

**Expected Output:**
```
6 passed (12.3s)
HTML Report: playwright-report/index.html
```

> **Tip**: E2E tests spin up a dev server automatically. See `playwright.config.ts` for browsers tested (Chromium, Firefox, WebKit, Mobile).

### Test File Locations

- **Unit Tests**: `app/tests/unit/`, `tests/`, any `*.test.ts(x)`
- **E2E Tests**: `e2e/*.spec.ts` (auth, checkout, dashboard, orders, products, settings)
- **Fixtures**: `e2e/fixtures/auth.fixture.ts` for reusable authentication

### Manual Testing Checklist

- [ ] Page builder loads without console errors
- [ ] Sections drag-and-drop smoothly
- [ ] JSON canvas storage persists on page reload
- [ ] Undo/redo history works (10+ actions)
- [ ] Publish creates KV cache entry
- [ ] D1 page_builder_pages record created
- [ ] Preview iframe renders published JSON correctly
- [ ] Session auth persists (check `SESSION_SECRET` match)
- [ ] R2 image uploads succeed with signed URLs
- [ ] No hydration mismatches in server-side render

---

## 2. Debugging Tips (80 lines)

### Console Logging in Workers

The page builder worker runs on Cloudflare Workers. Use `console.log()` for debugging:

```typescript
// In worker.ts or any server-side route
export default {
  async fetch(request, env) {
    console.log('Worker request:', request.url);
    console.log('ENV vars available:', Object.keys(env));
    // logs appear in wrangler tail
  }
};
```

### Wrangler Tail Command

Stream live logs from your Cloudflare Worker:

```bash
# From apps/page-builder:
wrangler tail --follow

# Expected: Real-time logs as requests hit the worker
[12:45:23] GET /builder/pages → 200 OK
[12:45:24] POST /api/publish → D1 INSERT
```

> **Tip**: Open in one terminal while testing; shows KV reads/writes, D1 queries, R2 uploads.

### Common Errors & Fixes

#### D1 Binding Errors
```
Error: D1_DATABASE is not defined
```
**Fix**: Check `wrangler.toml` bindings:
```toml
[[d1_databases]]
binding = "DB"
database_name = "multi-store-saas-db"
```
Restart: `npm run start` (page-builder) or `npm run dev:wrangler` (main).

#### R2 Upload Failures
```
Error: R2 is not defined / No such object
```
**Fix**: Verify R2 binding in `wrangler.toml`:
```toml
[[r2_buckets]]
binding = "R2"
bucket_name = "ozzyl-assets"
```
Check CORS: `r2-cors.json` must be applied to bucket.

#### Session Errors
```
Error: session.get() undefined / SESSION_SECRET missing
```
**Fix**: Ensure `.env` has:
```
SESSION_SECRET=your-super-secret-key-min-32-chars
```
And it matches the main app's `SESSION_SECRET` for shared auth between builder + main app.

---

## 3. Deployment (80 lines)

### Local Development Server

Start the page builder worker locally with D1/R2/KV bindings:

```bash
cd apps/page-builder
npm install
npm run start

# Expected: Listening on http://localhost:8787
```

Alternatively, run Remix dev (for SSR development):
```bash
npm run dev        # Remix dev at http://localhost:3000
```

### Preview Deployment

Test a staging deployment before production:

```bash
cd apps/page-builder
npm run build
wrangler pages deploy ./build/client

# Or use the shortcut:
npm run deploy
```

**Expected Output:**
```
✓ Built successfully
✓ Deployed to https://[hash].pages.dev
```

Visit the preview URL to verify sections load, GrapesJS renders, and KV/D1 access works.

### Production Deployment

The page builder auto-deploys when you push to `main` branch (GitHub Actions). Manual production deploy:

```bash
cd apps/page-builder
npm run deploy

# Pushes to your production Worker URL (configured in wrangler.toml)
```

> **Warning**: Always test in preview first. Production changes are live immediately.

### Rollback via Cloudflare Dashboard

If production breaks:
1. Go to Cloudflare Dashboard → Workers & Pages → Page Builder
2. Click **Deployments** tab
3. Select the previous stable deployment
4. Click **Rollback**

Takes ~2 minutes to activate. No code push needed.

---

## 4. Code Style (40 lines)

### TypeScript Strict Mode

All code uses `strict: true` (see `tsconfig.json`). Enforce types:

```typescript
// ✓ Good
const pageId: string = req.query.pageId;
const published: boolean = await kv.getJSON('page:' + pageId);

// ✗ Bad
const pageId = req.query.pageId;  // any type
const published = await kv.get('page');  // unsafe
```

### Tailwind for Styling

Use Tailwind utility classes only (no inline styles):

```tsx
// ✓ Good
<div className="bg-white p-4 rounded-lg shadow-md">

// ✗ Bad
<div style={{ backgroundColor: 'white', padding: '16px' }}>
```

### Lucide React Icons

Import icons from `lucide-react`:

```tsx
import { Save, Trash2, Eye } from 'lucide-react';

<button className="flex items-center gap-2">
  <Save size={20} /> Save Changes
</button>
```

### OptimizedImage Component

Use `<OptimizedImage />` for all images (Cloudflare Image Optimization):

```tsx
// ✓ Good
import { OptimizedImage } from '~/components/OptimizedImage';
<OptimizedImage src={imageUrl} alt="..." width={200} height={200} />

// ✗ Bad
<img src={imageUrl} alt="..." />
```

### Server-Side Validation Always

Use Zod for all API inputs on the server:

```typescript
// ✓ Good
const schema = z.object({
  pageId: z.string().uuid(),
  sectionData: z.record(z.unknown()),
});
const validated = schema.parse(req.body);

// ✗ Bad
const { pageId, sectionData } = req.body;  // no validation
```

---

## Quick Command Reference

| Command | Purpose |
|---------|---------|
| `npm run test` | Unit tests |
| `npm run e2e` | End-to-end tests |
| `npm run dev:wrangler` | Local Pages dev with bindings |
| `npm run deploy` | Preview or production deploy |
| `wrangler tail` | Stream live logs |
| `npm run typecheck` | TypeScript errors |

---

## Resources

- **AGENTS.md**: Setup, env vars, deployment notes
- **PROJECT_RULES.md**: Multi-tenant scoping, server validation
- **GrapesJS Docs**: Section registry, canvas styles injection
- **Cloudflare D1/R2/KV**: Check wrangler.toml bindings

---

**Last Updated**: 2025  
**Environment**: Cloudflare Workers + Pages + D1 + R2 + KV  
**Framework**: Remix SSR + GrapesJS  
