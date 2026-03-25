## 2024-03-25 - Unique IDs in Repeatable Components
**Learning:** In page builder components that can be rendered multiple times on the same page, static IDs cause accessibility collisions and break label `htmlFor` bindings.
**Action:** Always use React's `useId()` hook to dynamically generate unique `id` and `htmlFor` attributes for forms and inputs in components that might be duplicated.
