# Recharts SSR Hydration Error Fix Guide

## Problem: React Error #418 / #421 / #423

When using Recharts with Remix/Vite SSR, you may encounter these errors:
```
Error: Minified React error #418; visit https://reactjs.org/docs/error-decoder.html?invariant=418
```

### Error Meanings
- **#418**: Hydration mismatch - server HTML doesn't match client render
- **#421**: Invalid hook call (usually duplicate React)
- **#423**: Mismatched React versions

---

## Root Cause Analysis

The issue has **multiple layers**:

### 1. ResponsiveContainer SSR Issue
`ResponsiveContainer` from recharts cannot calculate dimensions on the server because it relies on browser APIs like `ResizeObserver`. This causes the server to render empty/different HTML than the client.

### 2. Duplicate React Instances (MAIN CAUSE)
If using Vite's `manualChunks` to split recharts into a separate bundle, **React can get duplicated** into that chunk. This causes two React instances to exist, breaking state sharing and hydration.

**How to verify:**
```bash
# Check the built recharts chunk for React imports
head -5 apps/web/build/client/assets/recharts-*.js

# If you see imports like this, React is duplicated:
# import{r as Yi,a as ye,R as pt}from"./recharts-XXX.js"
# (r = react, R = React, etc.)
```

---

## Solution: Multi-Layer Fix

### Layer 1: Prevent React Duplication in Chunks

In `vite.config.ts`, ensure React packages are NEVER split into separate chunks:

```typescript
rollupOptions: {
  output: {
    manualChunks(id) {
      // CRITICAL: Keep React in the main bundle - never split it!
      // This prevents duplicate React instances which cause Error #418
      if (id.includes('node_modules/react/') || 
          id.includes('node_modules/react-dom/') ||
          id.includes('node_modules/react-is/') ||
          id.includes('node_modules/scheduler/')) {
        return undefined; // Let Rollup handle naturally (stays in main bundle)
      }
      
      // Recharts - but NOT its React dependencies
      if (id.includes('recharts') && !id.includes('react')) {
        return 'recharts';
      }
      
      // D3 libraries (safe to chunk - no React)
      if (id.includes('d3-')) {
        return 'd3';
      }
      
      // Other chunks...
    },
  },
},
```

### Layer 2: Client-Only Dynamic Imports

Use dynamic `import()` inside `useEffect()` to ensure recharts is **never processed during SSR**:

```typescript
// ❌ WRONG - gets processed during SSR build
import { AreaChart } from 'recharts';

// ❌ WRONG - React.lazy still gets statically analyzed
const Chart = lazy(() => import('./ChartImpl'));

// ✅ CORRECT - dynamic import inside useEffect (client-only)
export function LazyAreaChart(props) {
  const [chartContent, setChartContent] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    import('recharts').then((recharts) => {
      const { AreaChart, Area, ResponsiveContainer } = recharts;
      setChartContent(
        <ResponsiveContainer initialDimension={{ width: 500, height: 300 }}>
          <AreaChart data={props.data}>
            <Area dataKey={props.dataKey} />
          </AreaChart>
        </ResponsiveContainer>
      );
    });
  }, [props]);

  if (!isHydrated || !chartContent) {
    return <div className="animate-pulse h-[300px]">Loading chart...</div>;
  }

  return chartContent;
}
```

### Layer 3: Use initialDimension for ResponsiveContainer

Per recharts docs, always provide `initialDimension` for SSR:

```jsx
<ResponsiveContainer 
  width="100%" 
  height={300} 
  initialDimension={{ width: 500, height: 300 }}
>
  <AreaChart data={data}>...</AreaChart>
</ResponsiveContainer>
```

This provides fallback dimensions during SSR, preventing layout shift.

### Layer 4: SSR External Configuration

In `vite.config.ts`, be careful with `ssr.external`:

```typescript
ssr: {
  // DON'T put recharts in external if using dynamic imports
  // Recharts needs to be bundled so dynamic import works
  external: [
    'grapesjs',  // These are truly client-only
    // 'recharts', // ← DON'T add this - let it be bundled
  ],
},
```

---

## Debugging Checklist

When you see hydration errors with recharts:

1. **Check for duplicate React**
   ```bash
   head -5 apps/web/build/client/assets/recharts-*.js
   # Should NOT import from react packages
   ```

2. **Verify chart components use dynamic imports**
   ```bash
   grep -rn "from 'recharts'" apps/web/app/
   # Should return ZERO results (no static imports)
   ```

3. **Check manualChunks config**
   - React packages should return `undefined`
   - Recharts should only match if NOT containing 'react'

4. **Clear all caches**
   - Browser cache (Ctrl+Shift+R)
   - Cloudflare cache (purge in dashboard)
   - Service Worker cache (unregister in DevTools)

---

## File Reference

| File | Purpose |
|------|---------|
| `vite.config.ts` | manualChunks configuration |
| `components/charts/LazyAreaChart.tsx` | Client-only AreaChart wrapper |
| `components/charts/LazyBarChart.tsx` | Client-only BarChart wrapper |
| `components/charts/ClientCharts.tsx` | Generic chart wrapper with render props |
| `components/charts/LazyCharts.tsx` | Re-exports for convenience |

---

## Related Resources

- [React Error Decoder](https://reactjs.org/docs/error-decoder.html?invariant=418)
- [Recharts ResponsiveContainer SSR Docs](https://github.com/recharts/recharts/blob/main/storybook/stories/API/ResponsiveContainer.mdx)
- [Remix Client-Only Components](https://v2.remix.run/docs/guides/migrating-react-router-app#client-only-components)
- [Vite Manual Chunks](https://vitejs.dev/guide/build.html#chunking-strategy)

---

## Summary

The key insight is that **React Error #418 with recharts is usually NOT about recharts itself** - it's about **duplicate React instances** caused by improper bundling. Always ensure:

1. React/ReactDOM/scheduler stay in the main bundle
2. Use dynamic imports inside useEffect for charts
3. Provide initialDimension to ResponsiveContainer
4. Clear all caches after deploying fixes
