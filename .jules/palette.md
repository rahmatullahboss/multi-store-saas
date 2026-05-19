## 2026-05-19 - Accessible FAQ Component Pattern
**Learning:** The `ShowcaseFAQ` component (and potentially other FAQ components) lacks basic accordion accessibility attributes (`aria-expanded`, `aria-controls`, `id`s) which makes it difficult for screen readers to navigate.
**Action:** Use `useId()` to generate unique IDs and add proper ARIA attributes to accordion buttons and content sections.
