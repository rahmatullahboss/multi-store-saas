
## 2024-06-03 - Hover-only interactive elements in product cards
**Learning:** Elements relying solely on `group-hover:opacity-100` (like quick actions or add-to-cart overlays) remain completely invisible to keyboard users navigating via Tab, causing severe accessibility traps.
**Action:** Pair `group-hover:opacity-100` with `focus-visible:opacity-100` for direct interactive elements, or `focus-within:opacity-100` for container elements, to ensure keyboard accessibility.
