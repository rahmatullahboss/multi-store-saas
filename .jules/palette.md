
## 2024-06-18 - Fix Invisible Hover Traps in Product Cards
**Learning:** Elements hidden behind `group-hover` utilities (like `opacity-0 group-hover:opacity-100`) create invisible traps for keyboard users navigating via Tab. They cannot see the element when it receives focus because the parent group isn't being hovered.
**Action:** Pair `opacity-0` and `group-hover:opacity-100` with `focus-within:opacity-100` on the wrapper, and explicitly apply `focus-visible:ring-2` to the inner interactive element to ensure proper visibility and clear focus rings during keyboard navigation.
