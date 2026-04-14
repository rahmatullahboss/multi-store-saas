## 2025-04-14 - Add ARIA Labels to Toolbar Buttons
**Learning:** Found multiple icon-only buttons in the page builder toolbar (e.g. desktop/tablet/mobile view switchers, undo/redo, clear canvas, etc.) lacking `aria-label` attributes. Without ARIA labels, these buttons are inaccessible to screen reader users.
**Action:** Add descriptive `aria-label` attributes to all icon-only interactive elements in the UI to ensure keyboard accessibility.
