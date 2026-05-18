## 2026-03-11 - [Optimize Analytics Dashboard DB Latency]
**Learning:** The dashboard previously ran 8 distinct database queries sequentially to gather data for the dashboard stats. Drizzle ORM array-based queries are independent and don't rely on previous DB data in this function. Using a `Promise.all` allows these to execute concurrently, fundamentally changing the performance profile from sum-latency to max-latency.
**Action:** Always identify sequential Drizzle SQL calls that do not rely on previous queries. By wrapping independent fetches in `Promise.all`, network round-trips to Cloudflare D1 are parallelized, minimizing performance bottleneck.

## 2026-03-12 - [Batch N+1 Drizzle ORM Queries]
**Learning:** While `Promise.all` is great for parallelizing independent queries, using `Promise.all` with a `.map()` to iterate over records and fetch child relations causes massive N+1 connection/network latency on Cloudflare D1.
**Action:** Always extract IDs from a parent array and use a single batch `inArray()` Drizzle DB fetch to gather relations. Group and process the results in-memory rather than relying on thousands of simultaneous asynchronous connections.## 2026-03-19 - [Combine Drizzle SQL lookups on same table]
**Learning:** When retrieving different attributes from the same record across different utility queries (e.g., pulling `planType` in one function and `monthlyVisitorCount` in another), sequential queries compound Cloudflare D1 latency.
**Action:** Always inspect sequential backend fetches to see if they target the exact same table and same `where` clause. If they do, combine them into a single Drizzle `select` to radically reduce database network latency.

## 2024-05-18 - Resolve N+1 queries in Drizzle with max() and group_by
**Learning:** Cloudflare D1/SQLite doesn't natively support complex joins with aggregates seamlessly. Naive `Promise.all` row mapping creates severe N+1 latency. However, you can leverage SQLite's behavior where `max(aggregate)` also returns the associated bare columns for that exact row. Also, `max(createdAt)` returns an integer epoch which needs to be manually rehydrated into a `Date` object in JS.
**Action:** Replace `Promise.all` row queries with a single `inArray()` query using `groupBy` and `max()`. Always map the Drizzle results back to the original objects in memory, and remember to `new Date(val)` for integer timestamp columns aggregated via `max()`.
