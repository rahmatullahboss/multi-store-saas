## 2024-05-30 - Prevent XSS in Store Templates
**Vulnerability:** Raw HTML injection (XSS) via `dangerouslySetInnerHTML`
**Learning:** Store templates (like DC Store's ProductPage) were injecting `product.description` directly into the DOM using `dangerouslySetInnerHTML`. Since product descriptions are user-controlled input, this could allow malicious merchants or users to inject arbitrary JavaScript.
**Prevention:** Always sanitize user-controlled input (like product descriptions) using `sanitizeHtml` from `~/utils/sanitize` before rendering it via `dangerouslySetInnerHTML`. Be especially vigilant when creating or porting new store templates, as they often lack these security components.
