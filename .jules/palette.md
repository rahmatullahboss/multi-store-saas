
## 2024-05-11 - Custom Radio Inputs Keyboard Accessibility
**Learning:** Custom designed form elements (like the theme selectors and checkout mode settings) that use visually hidden native inputs (`className="sr-only"`) lose their default focus outlines, making them invisible traps for keyboard users navigating with Tab.
**Action:** Always ensure the parent wrapper (e.g., `<label>`) utilizes structural pseudo-classes like `has-[:focus-visible]:ring-2` to surface the keyboard focus state visually when the hidden input receives focus.
