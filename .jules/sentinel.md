## 2025-03-12 - [Security Enhancement] Secure Order Number Generation
**Vulnerability:** The application was using `Math.random()` to generate the random portion of order IDs in `apps/web/server/api/routes/orders.ts` and `apps/web/app/routes/api.create-order.ts`. `Math.random()` is not cryptographically secure and predictable.
**Learning:** When using `crypto.getRandomValues()` to generate random strings, do not use `.substring(0, N)` on the resulting integer converted to base36. Smaller generated numbers produce shorter strings, leading to a strong statistical bias toward lower digits (like '1') at the start of the string.
**Prevention:** Always use `.slice(-N)` to extract the trailing characters from a random integer's base-N representation, and pad strings appropriately.

## 2025-03-12 - [Security Enhancement] Predictable Math.random() in more places
**Vulnerability:** The codebase was still using `Math.random()` for order ID generation in `apps/web/app/routes/api.create-order.ts`, which is not cryptographically secure and could allow attackers to predict order numbers.
**Learning:** Security fixes must be comprehensively applied across the codebase. Even if one location (like the API routes) is secured using `crypto.getRandomValues()`, duplicate logic might exist elsewhere (like Remix action routes) that remain vulnerable. Always use global search to find all instances of a vulnerability pattern.
**Prevention:** Regularly scan for insecure patterns like `Math.random()` used in security-sensitive contexts (IDs, tokens, randomness) and ensure uniform application of the Web Crypto API across the entire repository.
