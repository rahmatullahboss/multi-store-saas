## 2024-06-25 - [Accessibility improvements to payment methods]
**Learning:** In interactive lists used as single-selection menus (like checkout payment methods), custom `<div>` based approaches cause keyboard accessibility and screen reader issues. A radio group pattern works best here.
**Action:** Always use semantic `<button>` elements with `role="radio"`, `aria-checked`, and a parent with `role="radiogroup"` instead of clickable `div`s to preserve native keyboard navigation and proper accessibility structure. Apply explicit `focus-visible` styles on buttons for visible focus states.
