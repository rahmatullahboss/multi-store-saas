/**
 * K6 Load Testing Script
 * 
 * This file is meant to be run with K6, NOT Node.js/Vitest.
 * Run with: k6 run app/tests/performance/api-load.test.ts
 * 
 * TypeScript types are provided inline to satisfy tsc.
 */

// K6 type declarations (inline for TypeScript compatibility)
declare const __ENV: Record<string, string | undefined>;

interface K6Response {
  status: number;
  body: string;
  headers: Record<string, string>;
}

interface K6Http {
  get(url: string): K6Response;
  post(url: string, body?: string, params?: object): K6Response;
}

interface K6Check {
  (response: K6Response, checks: Record<string, (r: K6Response) => boolean>): boolean;
}

// These would be imported from 'k6' and 'k6/http' when running with k6
declare const http: K6Http;
declare const check: K6Check;
declare function sleep(seconds: number): void;

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

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';

export default function () {
  // 1. Visit Homepage
  const resHome = http.get(`${BASE_URL}/`);
  
  check(resHome, {
    'homepage status is 200': (r: K6Response) => r.status === 200,
  });

  // 2. Visit a Product Page (simulated product-slug)
  const resProduct = http.get(`${BASE_URL}/products/test-product`);
  
  check(resProduct, {
    'product page status is 200': (r: K6Response) => r.status === 200,
  });

  sleep(1);
}
