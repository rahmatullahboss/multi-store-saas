## 2024-05-24 - Focus States for Visually Hidden Radio Inputs
**Learning:** When using custom designed form elements, standard visually hidden native inputs (e.g. `className="sr-only"`) receive keyboard focus, but this focus state is often not visually communicated to the user, creating a poor experience for keyboard-only navigation.
**Action:** Always ensure that custom wrappers or parent elements containing visually hidden inputs utilize structural pseudo-classes like `has-[:focus-visible]` to surface the focus state visually (e.g., adding `has-[:focus-visible]:ring-2`).
