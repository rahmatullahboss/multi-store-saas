## 2024-04-04 - Native D1 Batch Type Safety in Drizzle ORM
**Learning:** When using `db.batch()` to replace `Promise.all()` in Drizzle ORM with Cloudflare D1, it natively supports preserving type safety. Using an `any` cast bypasses type checking for all returned array destructured variables, risking regressions and crashes if a non-compatible database driver is accidentally passed.
**Action:** Never cast `db` to `any` when using `.batch()`. Rely on the native `db.batch([...queries])` method to maintain strict type definitions for the destructured return tuple.
