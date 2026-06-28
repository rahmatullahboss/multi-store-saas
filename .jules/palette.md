## 2025-02-28 - Icon-Only Button ARIA Labels in Eclipse Template
**Learning:** E-commerce templates often use icon-only buttons for critical actions like 'Add to Cart', 'Wishlist', and quantity controls. Without `aria-label` attributes, these are completely opaque to screen reader users, breaking core flows.
**Action:** Always ensure any `<button>` containing only an SVG or icon component explicitly sets an `aria-label` describing the action, handling dynamic states (e.g., `isLiked ? "Remove" : "Add"`) as needed.
