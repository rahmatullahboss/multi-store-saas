## 2025-03-12 - [Security Enhancement] Secure Order Number Generation
**Vulnerability:** The application was using `Math.random()` to generate the random portion of order IDs in `apps/web/server/api/routes/orders.ts` and `apps/web/app/routes/api.create-order.ts`. `Math.random()` is not cryptographically secure and predictable.
**Learning:** When using `crypto.getRandomValues()` to generate random strings, do not use `.substring(0, N)` on the resulting integer converted to base36. Smaller generated numbers produce shorter strings, leading to a strong statistical bias toward lower digits (like '1') at the start of the string.
**Prevention:** Always use `.slice(-N)` to extract the trailing characters from a random integer's base-N representation, and pad strings appropriately.
## 2026-03-21 - XSS via dangerouslySetInnerHTML without sanitizeHtml
**Vulnerability:** Direct injection of `product.description` into the DOM using `dangerouslySetInnerHTML` without sanitization in storefront templates.
**Learning:** Found in multiple templates (e.g., Eclipse, Luxe Boutique). While fixing this, I learned that truncating HTML strings with `.slice()` (even after sanitizing) is inherently dangerous because it can cut tags or attributes in half, leading to malformed DOM structures and broken page layouts.
**Prevention:** Always wrap user-controlled HTML with `sanitizeHtml` from `~/utils/sanitize` before injecting via `dangerouslySetInnerHTML`. When a truncated plain-text preview is needed, strip the HTML tags first before slicing to avoid malformed HTML issues.
