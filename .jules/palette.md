## 2024-06-22 - Add Focus Indicators to Interactive Custom Elements
**Learning:** Custom interactive elements like toggles, pills, and dropdown selectors often lack default keyboard focus indicators, making keyboard navigation difficult for users. The lack of visual feedback traps screen reader or keyboard users.
**Action:** Always apply explicit focus visibility utilities (e.g., `focus-visible:ring-2 focus-visible:ring-offset-2 outline-none`) to custom `button` variants (toggles, pills, dropdown items) to ensure accessible keyboard navigation.
