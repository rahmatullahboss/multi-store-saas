## 2024-05-14 - Centralized Intl.NumberFormat Caching
**Learning:** Instantiating `Intl.NumberFormat` repeatedly inside React render paths, loops, and frequently called utility functions like `formatPrice` causes a massive performance bottleneck.
**Action:** Always use the centralized `getCachedNumberFormat` utility from `~/utils/number-format-cache` when formatting numbers or prices to reuse formatters based on a memoized stringified key.
