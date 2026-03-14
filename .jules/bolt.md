## 2026-03-11 - [Optimize Analytics Dashboard DB Latency]
**Learning:** The dashboard previously ran 8 distinct database queries sequentially to gather data for the dashboard stats. Drizzle ORM array-based queries are independent and don't rely on previous DB data in this function. Using a `Promise.all` allows these to execute concurrently, fundamentally changing the performance profile from sum-latency to max-latency.
**Action:** Always identify sequential Drizzle SQL calls that do not rely on previous queries. By wrapping independent fetches in `Promise.all`, network round-trips to Cloudflare D1 are parallelized, minimizing performance bottleneck.

## 2026-03-12 - [Batch N+1 Drizzle ORM Queries]
**Learning:** While `Promise.all` is great for parallelizing independent queries, using `Promise.all` with a `.map()` to iterate over records and fetch child relations causes massive N+1 connection/network latency on Cloudflare D1.
**Action:** Always extract IDs from a parent array and use a single batch `inArray()` Drizzle DB fetch to gather relations. Group and process the results in-memory rather than relying on thousands of simultaneous asynchronous connections.