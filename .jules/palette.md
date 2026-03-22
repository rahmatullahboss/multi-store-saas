## 2026-03-20 - Added ARIA labels and roles
**Learning:** In the SettingsPanel and AddSectionModal components, some custom inputs and icon-only buttons lacked standard accessibility labels and roles, specifically for custom switch controls and expand/collapse icons.
**Action:** Add role='switch', aria-checked, and context-specific aria-label attributes to ensure interactive elements are properly recognized by screen readers.
