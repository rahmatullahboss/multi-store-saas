## 2024-04-10 - Keyboard Navigation Trap with Opacity Hide
**Learning:** Elements hidden with `opacity-0` and revealed on hover (e.g., `group-hover:opacity-100`) become invisible traps for keyboard users unless explicitly paired with `focus-visible:opacity-100` and clear visual focus rings.
**Action:** When using opacity-based hide/reveal patterns for action buttons, always pair hover classes with `focus-visible:opacity-100` and focus rings (e.g., `focus-visible:ring-2`) to ensure the element is visible when tabbed to.
