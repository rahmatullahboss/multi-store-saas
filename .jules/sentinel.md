## 2025-03-12 - [Security Enhancement] Secure Order Number Generation
**Vulnerability:** The application was using `Math.random()` to generate the random portion of order IDs in `apps/web/server/api/routes/orders.ts` and `apps/web/app/routes/api.create-order.ts`. `Math.random()` is not cryptographically secure and predictable.
**Learning:** When using `crypto.getRandomValues()` to generate random strings, do not use `.substring(0, N)` on the resulting integer converted to base36. Smaller generated numbers produce shorter strings, leading to a strong statistical bias toward lower digits (like '1') at the start of the string.
**Prevention:** Always use `.slice(-N)` to extract the trailing characters from a random integer's base-N representation, and pad strings appropriately.
## 2024-05-24 - [Fix XSS via dangerouslySetInnerHTML]
**Vulnerability:** Several React components (`ProductPage.tsx` in `eclipse` and `luxe-boutique` templates, and `ProductDescriptionSection.tsx`) rendered raw user-controlled content (`product.description` and `content`) using `dangerouslySetInnerHTML` without proper sanitization.
**Learning:** Even within seemingly safe contexts like product descriptions or section content, user input can contain malicious scripts. Using `dangerouslySetInnerHTML` directly with unsanitized data exposes the application to Cross-Site Scripting (XSS) attacks.
**Prevention:** Always wrap user-controlled content with a reliable HTML sanitizer, such as the utility `sanitizeHtml` from `~/utils/sanitize`, before passing it to `dangerouslySetInnerHTML`.
