/**
 * load-tests/api-platform.js
 * k6 Load Test — Ozzyl API Platform
 *
 * Traffic distribution (mirrors real-world usage):
 *   70% GET /api/v1/products      (most common — catalog browsing)
 *   20% GET /api/v1/orders        (order management)
 *    5% GET /api/v1/analytics/summary
 *    5% GET /api/v1/store
 *
 * Load profile:
 *   30s  ramp-up  → 100 VUs
 *   5min sustained at 100 VUs
 *   30s  ramp-down → 0 VUs
 *
 * Thresholds:
 *   p95 response time < 500ms
 *   error rate < 1%
 *   rate limit (429) hits < 5%
 *
 * Usage:
 *   # Against local dev server
 *   k6 run load-tests/api-platform.js
 *
 *   # Against staging with env vars
 *   API_BASE_URL=https://staging.ozzyl.com \
 *   API_KEY=sk_live_your_key_here \
 *   k6 run load-tests/api-platform.js
 *
 *   # Smoke test (quick sanity check)
 *   k6 run --vus 1 --duration 30s load-tests/api-platform.js
 *
 *   # Stress test (push beyond limits)
 *   k6 run --vus 500 --duration 2m load-tests/api-platform.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ─── Custom Metrics ───────────────────────────────────────────────────────────

/** Count of requests that hit the rate limit (429) */
const rateLimitHits = new Counter('rate_limit_hits');

/** Rate of 429 responses vs total requests */
const rateLimitRate = new Rate('rate_limit_rate');

/** Rate of all non-2xx non-429 errors */
const errorRate = new Rate('error_rate');

/** Per-endpoint response time trends */
const productsDuration = new Trend('products_duration', true);
const ordersDuration    = new Trend('orders_duration',    true);
const analyticsDuration = new Trend('analytics_duration', true);
const storeDuration     = new Trend('store_duration',     true);

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL = __ENV.API_BASE_URL || 'http://localhost:8788';
const API_KEY  = __ENV.API_KEY      || 'sk_live_load_test_key_replace_me';

/** Headers sent with every request */
const HEADERS = {
  Authorization: `Bearer ${API_KEY}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

// ─── k6 Options ───────────────────────────────────────────────────────────────

export const options = {
  // Load profile: ramp → sustain → ramp down
  stages: [
    { duration: '30s', target: 100 }, // Ramp up to 100 VUs
    { duration: '5m',  target: 100 }, // Sustain at 100 VUs
    { duration: '30s', target: 0   }, // Ramp down to 0
  ],

  // Acceptance thresholds — test fails if any are breached
  thresholds: {
    // Overall p95 latency must be under 500ms
    http_req_duration: ['p(95)<500'],

    // Per-endpoint latency budgets
    products_duration: ['p(95)<400'],
    orders_duration:   ['p(95)<400'],
    analytics_duration:['p(95)<600'], // analytics can be slightly slower
    store_duration:    ['p(95)<300'], // store info is a simple lookup

    // Error rate < 1% (excludes 429s — those are expected under load)
    error_rate: ['rate<0.01'],

    // Rate limit hits < 5% of all requests
    rate_limit_rate: ['rate<0.05'],

    // HTTP failures (connection errors, timeouts) < 0.5%
    http_req_failed: ['rate<0.005'],
  },

  // Graceful stop — allow in-flight requests to complete
  gracefulStop: '5s',

  // Tags applied to all metrics
  tags: {
    testName: 'ozzyl-api-platform',
    environment: __ENV.ENVIRONMENT || 'local',
  },
};

// ─── Scenario Weights ─────────────────────────────────────────────────────────

/**
 * Weighted random scenario selector.
 * Returns a scenario key based on real-world traffic distribution.
 *
 * Distribution: products=70%, orders=20%, analytics=5%, store=5%
 */
function pickScenario() {
  const r = Math.random() * 100;
  if (r < 70) return 'products';
  if (r < 90) return 'orders';
  if (r < 95) return 'analytics';
  return 'store';
}

// ─── Request Helpers ──────────────────────────────────────────────────────────

function recordMetrics(res, durationTrend, scenario) {
  const is429 = res.status === 429;
  const isError = res.status >= 400 && res.status !== 429;

  if (is429) {
    rateLimitHits.add(1);
    rateLimitRate.add(1);
  } else {
    rateLimitRate.add(0);
  }

  errorRate.add(isError ? 1 : 0);
  durationTrend.add(res.timings.duration);
}

// ─── Scenarios ────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/products
 * Exercises: list pagination, sort params, cursor pagination
 */
function scenarioProducts() {
  group('GET /api/v1/products', () => {
    // 1. First page — default params
    const res1 = http.get(`${BASE_URL}/api/v1/products`, { headers: HEADERS });
    check(res1, {
      'products: status 200 or 429': (r) => r.status === 200 || r.status === 429,
      'products: has data array':     (r) => r.status !== 200 || (JSON.parse(r.body).data !== undefined),
      'products: has pagination':     (r) => r.status !== 200 || (JSON.parse(r.body).pagination !== undefined),
      'products: success flag true':  (r) => r.status !== 200 || (JSON.parse(r.body).success === true),
    });
    recordMetrics(res1, productsDuration, 'products');

    // 2. Second page — with limit and sort
    if (res1.status === 200) {
      const body = JSON.parse(res1.body);
      const cursor = body.pagination && body.pagination.next_cursor;

      if (cursor) {
        const res2 = http.get(
          `${BASE_URL}/api/v1/products?limit=10&cursor=${cursor}&sort=price_asc`,
          { headers: HEADERS }
        );
        check(res2, {
          'products page2: 200 or 429': (r) => r.status === 200 || r.status === 429,
        });
        recordMetrics(res2, productsDuration, 'products_page2');
        sleep(0.1);
      }
    }

    // 3. Filter by published
    const res3 = http.get(
      `${BASE_URL}/api/v1/products?published=true&sort=created_desc&limit=5`,
      { headers: HEADERS }
    );
    check(res3, {
      'products filtered: 200 or 429': (r) => r.status === 200 || r.status === 429,
    });
    recordMetrics(res3, productsDuration, 'products_filtered');
  });
}

/**
 * GET /api/v1/products/:id
 * Exercises: single product lookup
 */
function scenarioProductDetail() {
  group('GET /api/v1/products/:id', () => {
    // Use a realistic product ID (1-1000 range)
    const id = Math.floor(Math.random() * 100) + 1;
    const res = http.get(`${BASE_URL}/api/v1/products/${id}`, { headers: HEADERS });
    check(res, {
      'product detail: 200, 404, or 429': (r) => [200, 404, 429].includes(r.status),
    });
    recordMetrics(res, productsDuration, 'products_detail');
  });
}

/**
 * GET /api/v1/orders
 * Exercises: order list with status filter, cursor pagination
 */
function scenarioOrders() {
  group('GET /api/v1/orders', () => {
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    // 1. Filtered order list
    const res1 = http.get(
      `${BASE_URL}/api/v1/orders?status=${status}&limit=20`,
      { headers: HEADERS }
    );
    check(res1, {
      'orders: status 200 or 429':   (r) => r.status === 200 || r.status === 429,
      'orders: has data array':       (r) => r.status !== 200 || Array.isArray(JSON.parse(r.body).data),
      'orders: success flag true':    (r) => r.status !== 200 || JSON.parse(r.body).success === true,
    });
    recordMetrics(res1, ordersDuration, 'orders');

    // 2. Second page if cursor available
    if (res1.status === 200) {
      const body = JSON.parse(res1.body);
      const cursor = body.pagination && body.pagination.next_cursor;
      if (cursor) {
        const res2 = http.get(
          `${BASE_URL}/api/v1/orders?cursor=${cursor}`,
          { headers: HEADERS }
        );
        check(res2, {
          'orders page2: 200 or 429': (r) => r.status === 200 || r.status === 429,
        });
        recordMetrics(res2, ordersDuration, 'orders_page2');
      }
    }
  });
}

/**
 * GET /api/v1/analytics/summary
 * Exercises: analytics aggregation with period filters
 */
function scenarioAnalytics() {
  group('GET /api/v1/analytics/summary', () => {
    const periods = ['today', '7d', '30d', '90d'];
    const period = periods[Math.floor(Math.random() * periods.length)];

    const res = http.get(
      `${BASE_URL}/api/v1/analytics/summary?period=${period}`,
      { headers: HEADERS }
    );
    check(res, {
      'analytics: 200 or 429':       (r) => r.status === 200 || r.status === 429,
      'analytics: has orders data':   (r) => r.status !== 200 || JSON.parse(r.body).data.orders !== undefined,
      'analytics: has products data': (r) => r.status !== 200 || JSON.parse(r.body).data.products !== undefined,
      'analytics: period matches':    (r) => r.status !== 200 || JSON.parse(r.body).data.period === period,
    });
    recordMetrics(res, analyticsDuration, 'analytics');
  });
}

/**
 * GET /api/v1/store
 * Exercises: store info lookup (simple, should be very fast)
 */
function scenarioStore() {
  group('GET /api/v1/store', () => {
    const res = http.get(`${BASE_URL}/api/v1/store`, { headers: HEADERS });
    check(res, {
      'store: 200 or 429':           (r) => r.status === 200 || r.status === 429,
      'store: has store name':        (r) => r.status !== 200 || JSON.parse(r.body).data.name !== undefined,
      'store: has subdomain':         (r) => r.status !== 200 || JSON.parse(r.body).data.subdomain !== undefined,
    });
    recordMetrics(res, storeDuration, 'store');
  });
}

/**
 * GET /api/v1/ping
 * Connectivity / auth smoke check
 */
function scenarioPing() {
  group('GET /api/v1/ping', () => {
    const res = http.get(`${BASE_URL}/api/v1/ping`, { headers: HEADERS });
    check(res, {
      'ping: 200 or 429':    (r) => r.status === 200 || r.status === 429,
      'ping: message=pong':  (r) => r.status !== 200 || JSON.parse(r.body).message === 'pong',
    });
    recordMetrics(res, storeDuration, 'ping');
  });
}

// ─── Setup (runs once before test) ────────────────────────────────────────────

export function setup() {
  // Verify the API is reachable before the full load test begins
  const res = http.get(`${BASE_URL}/api/v1/ping`, { headers: HEADERS });
  if (res.status === 401) {
    console.error(`[Setup] Auth failed — check API_KEY env var. Got: ${res.status}`);
    console.error(`[Setup] Response: ${res.body}`);
  } else if (res.status >= 500) {
    console.error(`[Setup] Server error during setup: ${res.status}`);
    console.error(`[Setup] Response: ${res.body}`);
  } else {
    console.log(`[Setup] Connected to ${BASE_URL}. Status: ${res.status}`);
  }

  return { baseUrl: BASE_URL };
}

// ─── Default function (runs per VU iteration) ─────────────────────────────────

export default function () {
  const scenario = pickScenario();

  switch (scenario) {
    case 'products':
      // 70% — mix of list + detail
      if (Math.random() < 0.8) {
        scenarioProducts();
      } else {
        scenarioProductDetail();
      }
      break;

    case 'orders':
      // 20%
      scenarioOrders();
      break;

    case 'analytics':
      // 5%
      scenarioAnalytics();
      break;

    case 'store':
      // 5%
      scenarioStore();
      break;
  }

  // Realistic think time: 0.5s–2s between requests
  sleep(Math.random() * 1.5 + 0.5);
}

// ─── Teardown (runs once after test) ──────────────────────────────────────────

export function teardown(data) {
  console.log(`[Teardown] Load test complete. Base URL: ${data.baseUrl}`);
  console.log('[Teardown] Check k6 summary above for threshold results.');
}

// ─── Custom Summary ───────────────────────────────────────────────────────────

/**
 * handleSummary — Outputs a markdown report to stdout.
 * To save: k6 run load-tests/api-platform.js --summary-export=report.json
 */
export function handleSummary(data) {
  const p95 = (metric) => {
    const m = data.metrics[metric];
    if (!m) return 'N/A';
    const p = m.values['p(95)'];
    return p !== undefined ? `${p.toFixed(1)}ms` : 'N/A';
  };

  const rate = (metric) => {
    const m = data.metrics[metric];
    if (!m) return 'N/A';
    const r = m.values['rate'];
    return r !== undefined ? `${(r * 100).toFixed(2)}%` : 'N/A';
  };

  const count = (metric) => {
    const m = data.metrics[metric];
    if (!m) return 'N/A';
    return m.values['count'] !== undefined ? m.values['count'] : 'N/A';
  };

  const summary = `
# Ozzyl API Platform — Load Test Report

## Configuration
- **Base URL**: ${BASE_URL}
- **Virtual Users**: 100 (peak)
- **Duration**: 6 min (30s ramp + 5m sustain + 30s ramp-down)
- **Timestamp**: ${new Date().toISOString()}

## Latency (p95)
| Endpoint              | p95 Latency | Threshold |
|-----------------------|-------------|-----------|
| All requests          | ${p95('http_req_duration')} | < 500ms |
| GET /products         | ${p95('products_duration')} | < 400ms |
| GET /orders           | ${p95('orders_duration')} | < 400ms |
| GET /analytics/summary| ${p95('analytics_duration')} | < 600ms |
| GET /store            | ${p95('store_duration')} | < 300ms |

## Error Rates
| Metric              | Value | Threshold |
|---------------------|-------|-----------|
| Error rate          | ${rate('error_rate')} | < 1% |
| Rate limit rate     | ${rate('rate_limit_rate')} | < 5% |
| HTTP failures       | ${rate('http_req_failed')} | < 0.5% |

## Volume
| Metric              | Count |
|---------------------|-------|
| Total requests      | ${count('http_reqs')} |
| Rate limit hits     | ${count('rate_limit_hits')} |

## Threshold Results
${Object.entries(data.metrics)
  .filter(([, m]) => m.thresholds)
  .map(([name, m]) => {
    const passed = Object.values(m.thresholds).every(t => !t.ok === false);
    return `- ${passed ? '✅' : '❌'} \`${name}\``;
  })
  .join('\n')}
`;

  return {
    stdout: summary,
  };
}
