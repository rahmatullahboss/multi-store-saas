
## 2023-10-25 - [Missing Keyboard Focus States for Hover-Revealed Elements]
**Learning:** Elements hidden with `opacity-0` and revealed via `group-hover:opacity-100` create invisible traps for keyboard users since the element receives focus but stays visually hidden.
**Action:** Always pair `opacity-0 group-hover:opacity-100` with `focus-visible:opacity-100` and explicit visual focus rings (e.g. `focus-visible:ring-2 focus-visible:outline-none`) or apply `focus-within:opacity-100` on the parent group, to ensure they become visible when navigated via keyboard.
