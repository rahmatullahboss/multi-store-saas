## 2025-03-12 - [Security Enhancement] Secure Order Number Generation
**Vulnerability:** The application was using `Math.random()` to generate the random portion of order IDs in `apps/web/server/api/routes/orders.ts` and `apps/web/app/routes/api.create-order.ts`. `Math.random()` is not cryptographically secure and predictable.
**Learning:** When using `crypto.getRandomValues()` to generate random strings, do not use `.substring(0, N)` on the resulting integer converted to base36. Smaller generated numbers produce shorter strings, leading to a strong statistical bias toward lower digits (like '1') at the start of the string.
**Prevention:** Always use `.slice(-N)` to extract the trailing characters from a random integer's base-N representation, and pad strings appropriately.

## 2025-03-13 - [Security Enhancement] Broad Elimination of Math.random() for Secure IDs
**Vulnerability:** Several places in the codebase were using `Math.random()` to generate random IDs, such as `message_id` for SMS in `apps/web/server/api/v1/routes/sms-wc.ts`, order numbers in `apps/web/server/api/orders.ts`, and image upload keys in `apps/web/app/routes/api.upload-image.ts`. `Math.random()` is predictable and not cryptographically secure (CWE-330).
**Learning:** Even for non-sensitive random IDs (like upload keys or SMS correlation IDs), predictable generation can expose systems to ID guessing attacks or lead to collisions. Cloudflare Workers provides Web Crypto API (`crypto.getRandomValues()`), making it easy to generate secure random values uniformly across the application.
**Prevention:** Always use `crypto.getRandomValues()` (or other secure RNGs) instead of `Math.random()` when generating IDs, keys, or any value that requires uniqueness and unpredictability.
