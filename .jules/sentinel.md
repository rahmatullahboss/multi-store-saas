## 2024-XX-XX - [Missing Sanitization in Product Descriptions]
**Vulnerability:** Found multiple instances where `dangerouslySetInnerHTML` is used to render `product.description` without any HTML sanitization in product template files under `apps/web/app/components/store-templates/`.
**Learning:** This exposes the application to Cross-Site Scripting (XSS) vulnerabilities if an attacker or malicious merchant enters malicious scripts within a product's description.
**Prevention:** Always use the provided `sanitizeHtml` function from `apps/web/app/utils/sanitize.ts` when rendering user-generated content like `product.description` through `dangerouslySetInnerHTML`.
