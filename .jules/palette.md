## 2025-05-09 - Keyboard Traps in Hover-Revealed Elements
**Learning:** Elements hidden with `opacity-0` and revealed via `group-hover:opacity-100` become invisible traps for keyboard users navigating with Tab, as the element receives focus but remains visually hidden.
**Action:** Always pair `group-hover:opacity-100` with `focus-visible:opacity-100` and clear visual focus rings (e.g., `focus-visible:ring-2 rounded outline-none`) to ensure keyboard users can see what they are interacting with. Also ensure icon-only buttons have an `aria-label`.
