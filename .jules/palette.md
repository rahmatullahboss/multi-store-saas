
## 2024-05-03 - Ensure elements with hover opacity remain visible to keyboard users
**Learning:** Elements hidden with `opacity-0` and revealed via `group-hover:opacity-100` create invisible traps for keyboard users. They can receive focus but cannot be seen.
**Action:** Always explicitly pair `opacity-0 group-hover:opacity-100` with `focus-visible:opacity-100` and explicit focus rings (e.g., `focus-visible:ring-2`) to guarantee visibility and focus indication for keyboard navigation.
