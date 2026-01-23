import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 20 },  // Stay at 20 users
    { duration: '30s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
  },
};

const BASE_URL = 'http://localhost:8788'; // Change this to your staging/prod URL

export default function () {
  // 1. Visit Homepage
  const res = http.get(BASE_URL);
  check(res, { 'homepage status was 200': (r) => r.status === 200 });

  sleep(1);

  // 2. Visit a Product (Simulated)
  // We don't know exact product URLs without crawling, but we can try a likely path
  // or just hit the dashboard login for load testing auth pages
  const resLogin = http.get(`${BASE_URL}/login`);
  check(resLogin, { 'login page status was 200': (r) => r.status === 200 });

  sleep(1);
}
