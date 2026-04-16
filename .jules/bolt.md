## 2026-03-11 - [Optimize Analytics Dashboard DB Latency]
**Learning:** The dashboard previously ran 8 distinct database queries sequentially to gather data for the dashboard stats. Drizzle ORM array-based queries are independent and don't rely on previous DB data in this function. Using a `Promise.all` allows these to execute concurrently, fundamentally changing the performance profile from sum-latency to max-latency.
**Action:** Always identify sequential Drizzle SQL calls that do not rely on previous queries. By wrapping independent fetches in `Promise.all`, network round-trips to Cloudflare D1 are parallelized, minimizing performance bottleneck.

## 2026-03-12 - [Batch N+1 Drizzle ORM Queries]
**Learning:** While `Promise.all` is great for parallelizing independent queries, using `Promise.all` with a `.map()` to iterate over records and fetch child relations causes massive N+1 connection/network latency on Cloudflare D1.
**Action:** Always extract IDs from a parent array and use a single batch `inArray()` Drizzle DB fetch to gather relations. Group and process the results in-memory rather than relying on thousands of simultaneous asynchronous connections.## 2026-03-19 - [Combine Drizzle SQL lookups on same table]
**Learning:** When retrieving different attributes from the same record across different utility queries (e.g., pulling `planType` in one function and `monthlyVisitorCount` in another), sequential queries compound Cloudflare D1 latency.
**Action:** Always inspect sequential backend fetches to see if they target the exact same table and same `where` clause. If they do, combine them into a single Drizzle `select` to radically reduce database network latency.

## 2026-04-16 - [Aggregate SQLite queries with MAX()]
**Learning:** Cloudflare D1/SQLite doesn't easily support complex joins with counts via Drizzle ORM, which frequently leads developers to write N+1 mapping loops using `Promise.all()` to gather relation aggregates (like the latest message or total child rows per parent).
**Action:** When trying to fetch child relations including a `count()` and the "latest" column values, replace `Promise.all()` maps with a single bulk lookup. Group by the parent ID using `groupBy` and `inArray()`. You can utilize SQLite's native behavior with `max(createdAt)`—which allows returning the corresponding bare columns (like `lastMessage: visitorMessages.content`) from the row that matches the maximum without complicated subqueries.
