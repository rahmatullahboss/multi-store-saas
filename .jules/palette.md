## 2024-04-23 - Notification Actions Keyboard Trap
**Learning:** Actions hidden behind hover states using `opacity-0 group-hover:opacity-100` are invisible traps for keyboard users navigating with Tab, as they gain focus but remain visually hidden unless explicitly handled.
**Action:** Always pair `opacity-0 group-hover:opacity-100` with `focus-visible:opacity-100` (or `focus-within:opacity-100` on parent) and clear visual focus rings (e.g. `focus-visible:ring-2`) to ensure nested interactive elements are visible when focused via keyboard.
