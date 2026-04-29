
## 2024-05-20 - Invisible Focus Trap in Notifications
**Learning:** Found a recurring pattern where interactive elements use `opacity-0 group-hover:opacity-100` to show actions only on hover, making them invisible and inaccessible traps for keyboard users (e.g. the Notification X button).
**Action:** Pair `opacity-0 group-hover:opacity-100` with explicit `focus-visible:opacity-100` and clear visual focus rings (e.g., `focus-visible:ring-2`) to ensure keyboard navigators can see the elements they've focused on, and always add `aria-label`s to icon-only buttons.
