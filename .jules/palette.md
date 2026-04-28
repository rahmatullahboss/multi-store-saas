## 2024-04-28 - [Fix invisible focus traps on hover-revealed buttons]
**Learning:** Elements hidden with `opacity-0` and revealed via `group-hover:opacity-100` create invisible keyboard focus traps. When a user tabs to the element, it receives focus but remains visually hidden, causing confusion and poor accessibility.
**Action:** Always pair `group-hover:opacity-100` with `focus-visible:opacity-100`, and ensure an explicit focus state is visible (e.g., `focus-visible:ring-2`, `focus-visible:outline-none`, `rounded`). Alternatively, apply `focus-within:opacity-100` on the parent group.
