## 2024-07-01 - Fix keyboard accessibility on hover-revealed interactive elements
**Learning:** Interactive elements relying purely on `group-hover` (like delete/dismiss buttons) become invisible traps for keyboard users because they cannot be seen when tabbing.
**Action:** Use pure CSS by combining `group-hover` with `group-focus-within` on the container, and explicitly pair the interactive elements with `focus-visible` utilities (e.g., `focus-visible:opacity-100 focus-visible:ring-2`) to ensure proper visibility and accessibility during keyboard navigation.
