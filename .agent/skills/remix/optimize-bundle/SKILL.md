---
name: "optimize-bundle"
description: "Reduce Remix bundle size by code splitting and lazy loading"
when_to_use: "When bundle size > 200KB or Lighthouse score < 90"
allowed-tools:
  ["Read", "Write", "Bash(npm run build:*)", "Bash(npm run analyze)"]
---

# Bundle Optimization Process

## Step 1: Analyze

1. Run: `npm run build && npm run analyze` (Use script below if command missing)
2. Identify largest chunks
3. Focus on `node_modules` bloat (e.g., full lodash import)

## Step 2: Code Split

1. Use `React.lazy` for heavy components below the fold:

```tsx
const HeavyChart = React.lazy(() => import("~/components/HeavyChart"));
// ...
<Suspense fallback={<div>Loading...</div>}>
  <HeavyChart />
</Suspense>;
```

## Step 3: Treeshake

1. Replace `import * as _ from 'lodash'` with `import { pick } from 'lodash'`
2. Verify `sideEffects: false` in package.json for libraries

## Step 4: Optimize Images

1. Use Cloudflare Images or `<OptimizedImage />` component
2. Convert PNG/JPG to WebP/AVIF

## Target

Reduce main bundle to < 150KB
