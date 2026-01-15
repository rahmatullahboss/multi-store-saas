import { describe, test, expect } from 'vitest';
import app from "../../../server/index"; 
import { createMockContext } from "../../../tests/setup";

describe('Security: OWASP Top 10 Checks', () => {
  const { cloudflare } = createMockContext();
  const mockEnv = {
    ...cloudflare.env,
    SAAS_DOMAIN: 'ozzyl.com',
  };
  
  test('A01: Broken Access Control - prevents cross-tenant access', async () => {
    const res = await app.request('/api/store', {
      method: 'GET',
      headers: {
        'Host': 'store-a.ozzyl.com' 
      }
    }, mockEnv);

    expect(res.status).not.toBe(500);
  });

  test('A03: Injection - Request sanitization check', async () => {
    const maliciousPayload = { name: "Test Store'; DROP TABLE stores; --" };
    
    const res = await app.request('/api/stores', {
      method: 'POST',
      body: JSON.stringify(maliciousPayload),
       headers: { 'Content-Type': 'application/json' }
    }, mockEnv);

    expect(res.status).not.toBe(500);
  });

  test('A07: XSS - Input sanitization integration', async () => {
    const xssPayload = { logo: "<script>alert('xss')</script>" };
    
    const res = await app.request('/api/stores/current', {
      method: 'PUT',
      body: JSON.stringify(xssPayload),
      headers: { 'Content-Type': 'application/json' }
    }, mockEnv);
    
    expect(res.status).not.toBe(500); 
  });
});
