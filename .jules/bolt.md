## 2024-05-24 - Intl.NumberFormat Instantiation
**Learning:** Instantiating `Intl.NumberFormat` inside React components, especially in mapping loops or render paths, is a significant performance bottleneck.
**Action:** Centralize caching for `Intl.NumberFormat` at the module level using a `Map` keyed by locale and formatting options. Use `useMemo` in React components to wrap these formatter utilities.

## 2024-05-24 - Intl.NumberFormat Instantiation (Cache Implementations)
**Learning:** Instantiating `Intl.NumberFormat` inside React components, especially in mapping loops or render paths, is a significant performance bottleneck.
**Action:** Centralize caching for `Intl.NumberFormat` at the module level using a `Map` keyed by locale and formatting options. Use `useMemo` in React components to wrap these formatter utilities. Ensure imports for these caches are kept at the top of the utility files to maintain project structure and linter compliance.
