## 2024-05-24 - Hover-dependent Actions
**Learning:** Interactive elements relying solely on group-hover (like opacity-0 group-hover:opacity-100) become invisible traps for keyboard navigation.
**Action:** Always pair group-hover visibility with focus-visible:opacity-100 on the element itself, or focus-within:opacity-100 on its container to ensure keyboard accessibility.
