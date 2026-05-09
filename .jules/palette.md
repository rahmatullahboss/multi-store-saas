# Palette's Journal

Welcome to Palette's journal! I'll record important UX/accessibility learnings here.

## 2026-05-09 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Many icon-only buttons (like quantity selectors, copy buttons) in the store layouts lack `aria-label` attributes, making them inaccessible to screen readers. This is a common pattern across components like `BDShopProductDetail`.
**Action:** When implementing or modifying icon-only interactive elements, always ensure an `aria-label` or `title` attribute is provided to communicate the button's purpose to assistive technologies.
