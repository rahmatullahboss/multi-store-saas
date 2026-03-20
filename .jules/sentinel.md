## 2025-03-12 - [Security Enhancement] Secure Order Number Generation
**Vulnerability:** The application was using `Math.random()` to generate the random portion of order IDs in `apps/web/server/api/routes/orders.ts` and `apps/web/app/routes/api.create-order.ts`. `Math.random()` is not cryptographically secure and predictable.
**Learning:** When using `crypto.getRandomValues()` to generate random strings, do not use `.substring(0, N)` on the resulting integer converted to base36. Smaller generated numbers produce shorter strings, leading to a strong statistical bias toward lower digits (like '1') at the start of the string.
**Prevention:** Always use `.slice(-N)` to extract the trailing characters from a random integer's base-N representation, and pad strings appropriately.

## 2025-03-12 - [Security Enhancement] File Enumeration/IDOR Prevention in Uploads
**Vulnerability:** The application used `Math.random().toString(36).substring(2, 8)` to generate random suffixes for uploaded images in `apps/page-builder/app/routes/api.upload-image.ts`. This non-secure randomness makes file names predictable, theoretically allowing attackers to guess public URLs of recently uploaded, potentially private assets (IDOR risk/File Enumeration).
**Learning:** Security fixes involving random generation patterns (like avoiding `Math.random()` and using `.slice(-N)`) found in one area of the app (order IDs) should be proactively hunted for in other contexts, such as file uploads.
**Prevention:** Use `crypto.getRandomValues()` to generate random suffixes for all file uploads and ensure proper padding combined with `.slice(-N)` to maintain uniformly random string lengths.
