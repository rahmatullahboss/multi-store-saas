## 2025-03-12 - [Security Enhancement] Secure Order Number Generation
**Vulnerability:** The application was using `Math.random()` to generate the random portion of order IDs in `apps/web/server/api/routes/orders.ts` and `apps/web/app/routes/api.create-order.ts`. `Math.random()` is not cryptographically secure and predictable.
**Learning:** When using `crypto.getRandomValues()` to generate random strings, do not use `.substring(0, N)` on the resulting integer converted to base36. Smaller generated numbers produce shorter strings, leading to a strong statistical bias toward lower digits (like '1') at the start of the string.
**Prevention:** Always use `.slice(-N)` to extract the trailing characters from a random integer's base-N representation, and pad strings appropriately.

## 2025-03-21 - [HIGH] Fix XSS vulnerability in product previews
**Vulnerability:** The `product.description` field was being sliced using `slice(0, N)` and then rendered via `dangerouslySetInnerHTML` directly in the Eclipse and Luxe Boutique templates. If a user provided HTML with unclosed tags near the slice limit, or included malicious scripts, they would execute without sanitization.
**Learning:** When slicing user-generated HTML content (like product.description) for previews, always apply `sanitizeHtml` *after* slicing to prevent malformed, unclosed HTML tags from breaking the layout, and to clean malicious input.
**Prevention:** Avoid rendering raw `product.description` chunks without wrapping the final string in `sanitizeHtml`.
## 2024-06-07 - Fix XSS Vulnerability in DC Store Template
**Vulnerability:** The `dc-store` product page template (`apps/web/app/components/store-templates/dc-store/pages/ProductPage.tsx`) used `dangerouslySetInnerHTML` to render `product.description` directly, creating a Cross-Site Scripting (XSS) vulnerability.
**Learning:** Even internal or semi-trusted data (like a product description) can be manipulated in e-commerce platforms. Raw output via `dangerouslySetInnerHTML` should always be avoided unless strictly necessary, and inputs should be sanitized.
**Prevention:** Always use the `sanitizeHtml` utility from `~/utils/sanitize` when rendering user-controlled content via `dangerouslySetInnerHTML`. Ensure a fallback (e.g., `|| ''`) is provided to avoid runtime errors on undefined values.
