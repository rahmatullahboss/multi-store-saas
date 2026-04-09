## 2025-03-12 - [Security Enhancement] Secure Order Number Generation
**Vulnerability:** The application was using `Math.random()` to generate the random portion of order IDs in `apps/web/server/api/routes/orders.ts` and `apps/web/app/routes/api.create-order.ts`. `Math.random()` is not cryptographically secure and predictable.
**Learning:** When using `crypto.getRandomValues()` to generate random strings, do not use `.substring(0, N)` on the resulting integer converted to base36. Smaller generated numbers produce shorter strings, leading to a strong statistical bias toward lower digits (like '1') at the start of the string.
**Prevention:** Always use `.slice(-N)` to extract the trailing characters from a random integer's base-N representation, and pad strings appropriately.

## 2025-03-21 - [HIGH] Fix XSS vulnerability in product previews
**Vulnerability:** The `product.description` field was being sliced using `slice(0, N)` and then rendered via `dangerouslySetInnerHTML` directly in the Eclipse and Luxe Boutique templates. If a user provided HTML with unclosed tags near the slice limit, or included malicious scripts, they would execute without sanitization.
**Learning:** When slicing user-generated HTML content (like product.description) for previews, always apply `sanitizeHtml` *after* slicing to prevent malformed, unclosed HTML tags from breaking the layout, and to clean malicious input.
**Prevention:** Avoid rendering raw `product.description` chunks without wrapping the final string in `sanitizeHtml`.

## 2025-03-22 - [HIGH] Ensure sanitizeHtml follows truncation
**Vulnerability:** The `product.description` was being rendered without sanitization in the `dc-store` template. In other templates, truncating `product.description` (e.g., `slice(0, 300)`) before sanitizing can leave unclosed tags if a tag is split by the truncation.
**Learning:** When truncating user-generated HTML content, always apply `sanitizeHtml` *after* the truncation operation to ensure any broken tags at the boundary are properly handled and closed, preventing layout breakage and XSS.
**Prevention:** Always wrap the final, sliced string in `sanitizeHtml` before passing it to `dangerouslySetInnerHTML`.
