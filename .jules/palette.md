
## 2024-05-24 - [Fix Nested Element Keyboard Focus Visibility Trap]
**Learning:** Elements visually hidden with `opacity-0` and revealed using `group-hover:opacity-100` create a trap for keyboard users, as the nested interactive elements (buttons, links) are not visible when they receive focus via the keyboard.
**Action:** When hiding interactive child elements with `opacity-0` inside a parent container, always pair it with `focus-within:opacity-100` on the parent. This ensures that when any of the nested interactive elements receive keyboard focus, the entire group becomes visible, allowing the user to see what they are currently interacting with. Ensure nested interactive buttons also have explicit `focus-visible:ring-2` to clearly mark exactly which item has focus.
