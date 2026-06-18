## 2024-06-18 - Added accessible menu states to NotificationBell
**Learning:** Dropdowns missing `aria-expanded` and `aria-controls` states are common in custom components. Screen readers cannot properly interact with or announce the purpose of notification toggles if they only use `aria-label`.
**Action:** Always pair dropdown trigger buttons with `aria-haspopup="menu"`, `aria-expanded={isOpen}`, and an `aria-controls` ID that matches the ID of the expanded dropdown container `div` holding `role="menu"`.
