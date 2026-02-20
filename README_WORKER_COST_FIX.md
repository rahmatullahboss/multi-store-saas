# Cloudflare Worker Cost Reduction Applied

**Issue:** The Web worker was experiencing millions of billed invocations. 
**Cause:** In `apps/web/wrangler.toml`, the `[assets]` configuration had `run_worker_first = true`. This meant every single static asset load (images, CSS, JS, fonts) across the site invoked the worker script before serving the file, leading to 50+ invocations per page load.
**Fix:** Changed `run_worker_first = false`. Cloudflare will now serve static build assets directly from the edge cache for free, bypassing the worker entirely. 
