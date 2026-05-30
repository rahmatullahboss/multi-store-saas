## 2024-05-29 - Accessible Icon-only Navigation
**Learning:** Icon-only buttons without `aria-label`s fail screen readers and keyboard users lack focus awareness without `focus-visible`.
**Action:** Pair `aria-label` with `focus-visible:ring-2` on `button` and `Link` elements encapsulating icons for all store templates.
