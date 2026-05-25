## 2026-03-11 - [Optimize Analytics Dashboard DB Latency]
**Learning:** The dashboard previously ran 8 distinct database queries sequentially to gather data for the dashboard stats. Drizzle ORM array-based queries are independent and don't rely on previous DB data in this function. Using a `Promise.all` allows these to execute concurrently, fundamentally changing the performance profile from sum-latency to max-latency.
**Action:** Always identify sequential Drizzle SQL calls that do not rely on previous queries. By wrapping independent fetches in `Promise.all`, network round-trips to Cloudflare D1 are parallelized, minimizing performance bottleneck.

## 2026-03-12 - [Batch N+1 Drizzle ORM Queries]
**Learning:** While `Promise.all` is great for parallelizing independent queries, using `Promise.all` with a `.map()` to iterate over records and fetch child relations causes massive N+1 connection/network latency on Cloudflare D1.
**Action:** Always extract IDs from a parent array and use a single batch `inArray()` Drizzle DB fetch to gather relations. Group and process the results in-memory rather than relying on thousands of simultaneous asynchronous connections.## 2026-03-19 - [Combine Drizzle SQL lookups on same table]
**Learning:** When retrieving different attributes from the same record across different utility queries (e.g., pulling `planType` in one function and `monthlyVisitorCount` in another), sequential queries compound Cloudflare D1 latency.
**Action:** Always inspect sequential backend fetches to see if they target the exact same table and same `where` clause. If they do, combine them into a single Drizzle `select` to radically reduce database network latency.
## 2024-05-18 - Resolve N+1 latency in Drizzle ORM admin panels
**Learning:** Drizzle ORM inside Cloudflare D1 doesn't support complex joined aggregates out of the box. Running `.select().limit(1)` queries inside a `Promise.all` over mapped rows creates N+1 latency issues, sometimes reaching 100 queries for 50 rows.
**Action:** Replace `Promise.all` mapping with a single `inArray()` + `GROUP BY` query utilizing `sql<string>` correlated subqueries for getting latest single-row values, mapping them manually in javascript. When using `max()` over Drizzle's integer columns in `mode: 'timestamp'`, remember to rehydrate the numeric return value back to a `Date` object manually.
