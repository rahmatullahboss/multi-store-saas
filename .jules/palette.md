
## 2024-05-18 - Prevent Keyboard Traps with Hover-Only Elements
**Learning:** Elements relying solely on `opacity-0` and `group-hover:opacity-100` become invisible traps for keyboard users navigating via Tab. They can receive focus but remain visually hidden, making the UI inaccessible.
**Action:** Explicitly pair hover reveals (`opacity-0 group-hover:opacity-100`) with `focus-visible:opacity-100` (along with standard focus ring utilities like `focus-visible:ring-2`) to ensure interactive elements are visibly revealed when receiving keyboard focus.
