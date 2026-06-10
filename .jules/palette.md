
## 2025-06-11 - Semantic Buttons for Selection Menus
**Learning:** Found a pattern where clickable `div` elements were being used for an interactive selection list (payment methods), breaking native keyboard focus and activation without proper ARIA states.
**Action:** Always replace interactive list items/cards with semantic `<button type="button">` elements, utilizing `w-full text-left` to preserve structure alongside explicit `focus-visible` ring utilities to ensure keyboard users can safely navigate.
