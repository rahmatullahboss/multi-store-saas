## 2024-06-13 - Focus Styles on Interactive Elements
**Learning:** StoreLayout cart and mobile menu interactive icons relied purely on visual hover states lacking focus visibility and semantic description for screen readers.
**Action:** Pair direct interactive elements with explicit `focus-visible` ring utilities (`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`) and ensure standard `aria-label`s exist for keyboard navigation and screen readers across header navigations.
