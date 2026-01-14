# Accessibility (a11y) Checklist

## Interactive Elements

- [ ] **Keyboard Navigable**: Can you tab to it? Can you activate it with `Enter` or `Space`?
- [ ] **Focus Styles**: Is there a visible ring or outline when focused?
- [ ] **Semantic HTML**: Are you using `<button>`, `<a>`, `<input>` instead of `<div>` with click handlers?
- [ ] **Labels**: Do all inputs have associated `<label>` or `aria-label`?

## Visuals

- [ ] **Color Contrast**: Text vs Background ratio must be at least 4.5:1 (AA standard).
- [ ] **No Color Dependency**: Don't use color alone to convey meaning (e.g., error states should have icons or text, not just red borders).

## Structure

- [ ] **Headings**: `h1` -> `h2` -> `h3` order is preserved. No skipping levels.
- [ ] **Landmarks**: Use `<main>`, `<nav>`, `<aside>`, `<footer>` for page structure.

## Images & Media

- [ ] **Alt Text**: All meaningful images have `alt` descriptions. Decorative images have `alt=""`.
