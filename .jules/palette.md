## 2024-07-04 - Accessible Payment Method Selector
**Learning:** Clickable `div` elements used as selection menus break keyboard navigation and screen reader support, even if they look like buttons.
**Action:** Always use semantic `<button type="button">` with `role="radio"` and `aria-checked` inside a `role="radiogroup"` container for single-selection menus to ensure native keyboard accessibility and correct screen reader announcements.
