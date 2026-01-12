import http from 'k6/http';
import { check, sleep } from 'k6';

// K6 Configuration
export const options = {
  stages: [
    { duration: '30s', target: 50 }, // Ramp to 50 users
    { duration: '1m',  target: 100 }, // Stay at 100
    { duration: '30s', target: 0 },   // Scale down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must be < 500ms
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173'; // Can be overridden via environment var

export default function () {
  // 1. Visit Homepage
  const resHome = http.get(`${BASE_URL}/`);
  
  check(resHome, {
    'homepage status is 200': (r) => r.status === 200,
  });

  // 2. Visit a Product Page (simulated product-slug)
  const resProduct = http.get(`${BASE_URL}/products/test-product`);
  
  check(resProduct, {
    'product page status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
