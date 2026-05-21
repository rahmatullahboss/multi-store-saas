## 2024-05-21 - Group Hover Opacity Traps for Keyboard Users
**Learning:** Interactive elements relying on hover states (e.g., `opacity-0` revealed via `group-hover:opacity-100`) become invisible traps for keyboard users unless explicitly paired with focus styles.
**Action:** Always explicitly pair them with `focus-visible` classes (e.g., `focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-offset-2`) to ensure proper accessibility and distinct visual focus rings for keyboard navigation.
