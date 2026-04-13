## 2026-04-13 - Prevent module-level caching misses
**Learning:** When creating a caching abstraction (like `getCachedNumberFormat` for `Intl.NumberFormat`), ensure cache keys deterministically cover all permutations. `JSON.stringify({ locale, options })` is suitable only if property order in `options` literals is consistent across call sites.
**Action:** Use static literal options or deterministic key generation when serializing configuration objects for performance-critical caching.
