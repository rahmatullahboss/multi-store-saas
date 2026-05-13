## 2026-05-13 - Focus Visible for Hidden Radio Inputs
**Learning:** When using visually hidden native radio inputs inside custom labels (with `className="sr-only"`), keyboard focus states are invisible. Users relying on keyboard navigation have no idea which theme card is currently focused.
**Action:** Always add `has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-purple-500 has-[:focus-visible]:ring-offset-2` (or similar focus classes) to the parent `<label>` element that contains the `sr-only` input to make the focus state explicit and accessible.
