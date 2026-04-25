
## 2024-04-26 - Invisible Interactive Elements
**Learning:** Hiding interactive elements (like action buttons) using `opacity-0 group-hover:opacity-100` makes them completely invisible to keyboard users who navigate via Tab. They might tab onto a hidden button but have no visual indication of focus or what the button is.
**Action:** Always pair `group-hover:opacity-100` on hidden elements with either `focus-within:opacity-100` on the parent group container, or `focus-visible:opacity-100 focus-visible:ring-2` directly on the interactive elements to ensure they become visible and clearly outlined when focused via keyboard.
