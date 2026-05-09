## 2025-03-12 - [Security Enhancement] Secure Order Number Generation
**Vulnerability:** The application was using `Math.random()` to generate the random portion of order IDs in `apps/web/server/api/routes/orders.ts` and `apps/web/app/routes/api.create-order.ts`. `Math.random()` is not cryptographically secure and predictable.
**Learning:** When using `crypto.getRandomValues()` to generate random strings, do not use `.substring(0, N)` on the resulting integer converted to base36. Smaller generated numbers produce shorter strings, leading to a strong statistical bias toward lower digits (like '1') at the start of the string.
**Prevention:** Always use `.slice(-N)` to extract the trailing characters from a random integer's base-N representation, and pad strings appropriately.

## 2025-03-21 - [HIGH] Fix XSS vulnerability in product previews
**Vulnerability:** The `product.description` field was being sliced using `slice(0, N)` and then rendered via `dangerouslySetInnerHTML` directly in the Eclipse and Luxe Boutique templates. If a user provided HTML with unclosed tags near the slice limit, or included malicious scripts, they would execute without sanitization.
**Learning:** When slicing user-generated HTML content (like product.description) for previews, always apply `sanitizeHtml` *after* slicing to prevent malformed, unclosed HTML tags from breaking the layout, and to clean malicious input.
**Prevention:** Avoid rendering raw `product.description` chunks without wrapping the final string in `sanitizeHtml`.
## 2025-03-24 - [HIGH] Fix XSS vulnerability in DC Store product previews
**Vulnerability:** The `product.description` field was rendered directly via `dangerouslySetInnerHTML` in the DC Store `ProductPage` template without any sanitization. This allowed any unclosed tags or malicious scripts inserted into the product description to be executed in the browser.
**Learning:** Similar to Eclipse and Luxe Boutique templates, product descriptions can be a source of XSS in custom templates. It is crucial to verify newly added templates or layouts for unsafe rendering of user input.
**Prevention:** All instances of `dangerouslySetInnerHTML` containing user-provided input, including `product.description`, must be strictly wrapped with the `sanitizeHtml` utility from `~/utils/sanitize`.
