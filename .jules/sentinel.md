## 2024-05-24 - Unsanitized HTML rendering in DC Store Product Page
**Vulnerability:** XSS vulnerability found in `apps/web/app/components/store-templates/dc-store/pages/ProductPage.tsx` where user-controlled `product.description` was directly injected into the DOM via `dangerouslySetInnerHTML`.
**Learning:** Some custom store templates were missing the standard `sanitizeHtml` wrapper for rich text fields, leading to potential Cross-Site Scripting (XSS) risks.
**Prevention:** Always ensure `dangerouslySetInnerHTML` receives content sanitized by the `~/utils/sanitize` utility, especially when rendering database fields like `description` or `content` in React components.
