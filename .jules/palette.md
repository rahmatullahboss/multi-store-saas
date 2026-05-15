## 2024-05-15 - Hover-dependent Interactive Elements
**Learning:** Interactive elements relying on hover states (like `opacity-0 group-hover:opacity-100`) act as invisible traps for keyboard users and lack clear indication.
**Action:** Always pair `group-hover:opacity-100` with `focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2` to ensure proper keyboard accessibility and visual focus rings.
