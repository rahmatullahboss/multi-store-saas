## 2024-05-30 - Accessible Interactive Lists
**Learning:** Custom selection lists (divs with onClick) lack keyboard support.
**Action:** Convert clickable divs used for selection into `<button type="button" role="radio">` with `aria-checked` and `focus-visible` ring utilities to ensure proper keyboard navigation.
