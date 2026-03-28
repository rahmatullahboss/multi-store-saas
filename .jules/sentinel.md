## 2025-03-12 - [Security Enhancement] Secure Order Number Generation
**Vulnerability:** The application was using `Math.random()` to generate the random portion of order IDs in `apps/web/server/api/routes/orders.ts` and `apps/web/app/routes/api.create-order.ts`. `Math.random()` is not cryptographically secure and predictable.
**Learning:** When using `crypto.getRandomValues()` to generate random strings, do not use `.substring(0, N)` on the resulting integer converted to base36. Smaller generated numbers produce shorter strings, leading to a strong statistical bias toward lower digits (like '1') at the start of the string.
**Prevention:** Always use `.slice(-N)` to extract the trailing characters from a random integer's base-N representation, and pad strings appropriately.

## 2025-03-21 - [HIGH] Fix XSS vulnerability in product previews
**Vulnerability:** The `product.description` field was being sliced using `slice(0, N)` and then rendered via `dangerouslySetInnerHTML` directly in the Eclipse and Luxe Boutique templates. If a user provided HTML with unclosed tags near the slice limit, or included malicious scripts, they would execute without sanitization.
**Learning:** When slicing user-generated HTML content (like product.description) for previews, always apply `sanitizeHtml` *after* slicing to prevent malformed, unclosed HTML tags from breaking the layout, and to clean malicious input.
**Prevention:** Avoid rendering raw `product.description` chunks without wrapping the final string in `sanitizeHtml`.

## 2025-03-24 - [HIGH] Fix XSS vulnerability in DC Store template product previews
**Vulnerability:** The `product.description` field was being rendered via `dangerouslySetInnerHTML` directly in the DC Store template (`apps/web/app/components/store-templates/dc-store/pages/ProductPage.tsx`) without sanitization, posing an XSS risk.
**Learning:** When porting or creating new store templates (like DC Store), they often lack security components and re-introduce raw DOM injections. It's crucial to ensure every `dangerouslySetInnerHTML` usage is audited, especially for user-controlled input.
**Prevention:** Always sanitize user-controlled input (e.g., `product.description`) using `sanitizeHtml` from `~/utils/sanitize` before rendering it via `dangerouslySetInnerHTML`.
