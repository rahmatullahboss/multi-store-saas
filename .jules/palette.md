
## 2024-05-23 - Prevent Hover-Only Invisible Traps for Keyboard Users
**Learning:** Interactive elements that use `group-hover:opacity-100` (or similar hover-only reveals) create invisible traps for keyboard users. These elements receive keyboard focus when tabbed to, but remain completely invisible because the hover condition is not met, confusing users who cannot see where their focus has moved.
**Action:** Always pair `group-hover:opacity-100` on interactive elements (like buttons or links) with `focus-visible:opacity-100` (and ideally a focus ring like `focus-visible:ring-2`) so they become visible when they receive keyboard focus.
