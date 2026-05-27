## 2025-01-20 - Use Semantic Buttons for Accessible Focus
**Learning:** In interactive lists where users select options (like a payment method selector), using clickable `div`s with `onClick` completely breaks native keyboard navigation for users relying on Tab/Enter keys.
**Action:** Always replace clickable `div`s with semantic `<button type="button">` elements. Apply `w-full text-left` to maintain the existing layout, and `focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-offset-1` to provide clear, accessible focus rings.
