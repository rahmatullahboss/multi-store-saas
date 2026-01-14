---
name: "create-ui-component"
description: "Create accessible, styled UI components with Tailwind v4"
when_to_use: "When user asks for a new UI component"
allowed-tools: ["Read", "Write", "Bash"]
---

# Component Creation Process

## Step 1: Scaffolding

1. Run `scripts/scaffold-component.sh ComponentName`
2. Ensure it uses `cn()` for class merging.

## Step 2: Accessibility (a11y)

1. Use semantic HTML (`<button>`, `<nav>`, `<aside>`)
2. Ensure interactive elements are keyboard accessible (Tab index)
3. Add `aria-label` or `aria-labelledby` where text is missing

## Step 3: Styling (Tailwind v4)

1. Use CSS variables defined in `@theme`
2. Support Dark Mode (`dark:bg-slate-900`)
3. Use mobile-first responsive classes (`w-full md:w-1/2`)

## Step 4: Interactivity

1. Forward refs: `forwardRef<HTMLButtonElement, Props>`
2. Typed props: `interface Props extends HTMLAttributes<HTMLButtonElement>`

## Output

Fully typed, accessible React component.
