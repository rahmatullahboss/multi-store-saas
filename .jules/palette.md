
## 2025-05-24 - Paired Hover and Focus-Within States for Hidden Elements
**Learning:** Interactive elements hidden by `opacity-0 group-hover:opacity-100` become invisible traps for keyboard users navigating via Tab.
**Action:** Always pair `group-hover:opacity-100` with `focus-within:opacity-100` on the container, and ensure the interactive element itself has `focus-visible:ring-2` for a distinct visual focus indicator.
