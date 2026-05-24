## 2026-03-11 - [Optimize Analytics Dashboard DB Latency]
**Learning:** The dashboard previously ran 8 distinct database queries sequentially to gather data for the dashboard stats. Drizzle ORM array-based queries are independent and don't rely on previous DB data in this function. Using a `Promise.all` allows these to execute concurrently, fundamentally changing the performance profile from sum-latency to max-latency.
**Action:** Always identify sequential Drizzle SQL calls that do not rely on previous queries. By wrapping independent fetches in `Promise.all`, network round-trips to Cloudflare D1 are parallelized, minimizing performance bottleneck.

## 2026-03-12 - [Batch N+1 Drizzle ORM Queries]
**Learning:** While `Promise.all` is great for parallelizing independent queries, using `Promise.all` with a `.map()` to iterate over records and fetch child relations causes massive N+1 connection/network latency on Cloudflare D1.
**Action:** Always extract IDs from a parent array and use a single batch `inArray()` Drizzle DB fetch to gather relations. Group and process the results in-memory rather than relying on thousands of simultaneous asynchronous connections.## 2026-03-19 - [Combine Drizzle SQL lookups on same table]
**Learning:** When retrieving different attributes from the same record across different utility queries (e.g., pulling `planType` in one function and `monthlyVisitorCount` in another), sequential queries compound Cloudflare D1 latency.
**Action:** Always inspect sequential backend fetches to see if they target the exact same table and same `where` clause. If they do, combine them into a single Drizzle `select` to radically reduce database network latency.
## 2024-05-24 - Efficient Related Record Fetching with D1
**Learning:** When using Drizzle ORM with Cloudflare D1, querying related aggregates per item using `Promise.all(list.map(...))` creates severe N+1 HTTP request latency. Cloudflare D1 supports `db.batch()` which allows sending an array of Drizzle select queries in a single HTTP request roundtrip, completely bypassing the N+1 network overhead while retaining ORM typing.
**Action:** Use `db.batch(queries as any)` with `.flatMap()` whenever resolving related item aggregates (like counts or latest related row) instead of `Promise.all()` for D1 databases.
## 2024-05-24 - Avoiding D1 Batch Limits with `inArray`
**Learning:** While `db.batch()` solves N+1 latency in D1, it has a strict 100-statement hard limit. If a mapping generates more statements (e.g., fetching 2 queries per item for 50 items = exactly 100 limit, leaving no room for scale), it will crash the application and also fail in local better-sqlite3 environments since standard SQLite lacks batch support.
**Action:** Instead of `db.batch()`, use `inArray()` with `GROUP BY` and SQL aggregate functions (`max()`, `count()`) to fetch relational data for all items in a single query, then manually map the aggregated results back to the items in memory.
