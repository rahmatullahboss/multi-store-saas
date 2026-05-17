## 2026-05-17 - Accessible FAQ Toggles
**Learning:** The FAQ accordion components across store templates (e.g., Showcase) lack semantic ARIA relationships between toggle buttons and their content regions.
**Action:** When building or modifying accordions, always use `useId()` to generate unique IDs, linking the toggle (`aria-expanded`, `aria-controls`) to the content container (`role="region"`, `aria-labelledby`).
