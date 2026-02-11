/**
 * Staging smoke test without curl.
 *
 * Usage:
 *   npm --workspace apps/web run smoke:staging
 *
 * Optional:
 *   MAIN_APP_URL=https://... npm --workspace apps/web run smoke:staging
 */

const BASE =
  process.env.MAIN_APP_URL?.replace(/\/+$/, '') ||
  'https://multi-store-saas-staging.rahmatullahzisan.workers.dev';

function headerSubset(headers, names) {
  const out = {};
  for (const n of names) {
    const v = headers.get(n);
    if (v) out[n] = v;
  }
  return out;
}

async function getText(path) {
  const url = `${BASE}${path}`;
  const res = await fetch(url, { redirect: 'manual' });
  const text = await res.text();
  return { url, res, text };
}

function fail(msg) {
  console.error(`SMOKE_FAIL: ${msg}`);
  process.exitCode = 1;
}

function ok(msg) {
  console.log(`SMOKE_OK: ${msg}`);
}

const interestingHeaders = ['content-type', 'location', 'x-request-id', 'x-d1-bookmark', 'cf-ray'];

// 1) Health
{
  const { url, res, text } = await getText('/api/health');
  if (res.status !== 200) fail(`/api/health status ${res.status} (${url})`);
  const headers = headerSubset(res.headers, interestingHeaders);
  if (!headers['x-request-id']) fail(`/api/health missing x-request-id (${url})`);
  ok(`/api/health 200 (${headers['cf-ray'] ?? 'no-cf-ray'})`);
  console.log('  headers:', headers);
  console.log('  body:', text.slice(0, 200).replace(/\s+/g, ' ').trim());
}

// 2) Home
let firstProductId = null;
{
  const { url, res, text } = await getText('/');
  if (res.status !== 200) fail(`/ status ${res.status} (${url})`);
  const headers = headerSubset(res.headers, interestingHeaders);
  if (!headers['x-request-id']) fail(`/ missing x-request-id (${url})`);
  ok(`/ 200`);

  // Try to discover a product link to avoid hard-coding /products/1.
  const m = text.match(/\/products\/(\d+)\b/);
  if (m) firstProductId = m[1];
}

// 3) Product page (best-effort)
{
  const pid = firstProductId ?? '1';
  const { url, res } = await getText(`/products/${pid}`);
  if (res.status !== 200) fail(`/products/${pid} status ${res.status} (${url})`);
  const headers = headerSubset(res.headers, interestingHeaders);
  if (!headers['x-request-id']) fail(`/products/${pid} missing x-request-id (${url})`);
  ok(`/products/${pid} 200`);
}

// 4) Cart + checkout
for (const p of ['/cart', '/checkout']) {
  const { url, res } = await getText(p);
  if (res.status !== 200) fail(`${p} status ${res.status} (${url})`);
  const headers = headerSubset(res.headers, interestingHeaders);
  if (!headers['x-request-id']) fail(`${p} missing x-request-id (${url})`);
  ok(`${p} 200`);
}

if (process.exitCode) {
  console.error(`\nSmoke test failed for ${BASE}`);
} else {
  console.log(`\nSmoke test passed for ${BASE}`);
}

