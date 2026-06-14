## 2026-03-11 - [Optimize Analytics Dashboard DB Latency]
**Learning:** The dashboard previously ran 8 distinct database queries sequentially to gather data for the dashboard stats. Drizzle ORM array-based queries are independent and don't rely on previous DB data in this function. Using a `Promise.all` allows these to execute concurrently, fundamentally changing the performance profile from sum-latency to max-latency.
**Action:** Always identify sequential Drizzle SQL calls that do not rely on previous queries. By wrapping independent fetches in `Promise.all`, network round-trips to Cloudflare D1 are parallelized, minimizing performance bottleneck.

## 2026-03-12 - [Batch N+1 Drizzle ORM Queries]
**Learning:** While `Promise.all` is great for parallelizing independent queries, using `Promise.all` with a `.map()` to iterate over records and fetch child relations causes massive N+1 connection/network latency on Cloudflare D1.
**Action:** Always extract IDs from a parent array and use a single batch `inArray()` Drizzle DB fetch to gather relations. Group and process the results in-memory rather than relying on thousands of simultaneous asynchronous connections.## 2026-03-19 - [Combine Drizzle SQL lookups on same table]
**Learning:** When retrieving different attributes from the same record across different utility queries (e.g., pulling `planType` in one function and `monthlyVisitorCount` in another), sequential queries compound Cloudflare D1 latency.
**Action:** Always inspect sequential backend fetches to see if they target the exact same table and same `where` clause. If they do, combine them into a single Drizzle `select` to radically reduce database network latency.
## 2025-02-18 - Replacing Drizzle Promise.all() mapping with GROUP BY

**Learning:** When using Drizzle with SQLite/D1, mapping a list of objects and executing `Promise.all` row queries inside the map loop (like getting counts and `max()` aggregates) results in a naive N+1 latency bottleneck. Wait, Drizzle's `db.batch()` API seems like a solution but it crashes local testing with `better-sqlite3` because standard local test environments do not support `db.batch`. Plus, D1 has a hard 100 statement limit on `db.batch()`. Wait, D1 lacks easy support for complex query joins with aggregation out of the box through Drizzle without raw SQL.

**Action:** Fix Drizzle ORM N+1 performance issues in SQLite/D1 environments by extracting all foreign IDs into a single array (`map`), then performing one query using `inArray()` with `GROUP BY` and the required aggregate functions (`max()`, `count()`). Map the aggregated results into a JavaScript `Map` using the grouping ID, and then synchronously join the stats with the original list in memory.
