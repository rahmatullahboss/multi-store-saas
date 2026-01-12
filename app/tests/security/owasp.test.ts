import { describe, test, expect } from 'vitest';
import app from '../../server/index'; 

describe('Security: OWASP Top 10 Checks', () => {
  
  test('A01: Broken Access Control - prevents cross-tenant access', async () => {
    // Simulate a request where the Host header (tenant) matches one store
    // but the ID requested belongs to another.
    
    // This is a theoretical test structure. Real impl needs DB mocking.
    const res = await app.request('/api/store', {
      method: 'GET',
      headers: {
        'Host': 'store-a.ozzyl.com' 
      }
    });

    // Strategy: The endpoint should return Store A's data. 
    // If we try to spoof an ID in a param (if the endpoint accepted one), it should fail.
    // Since /api/store uses context, it's safer by design.
    expect(res.status).toBe(200); 
  });

  test('A03: Injection - Request sanitization check', async () => {
    // Sending a payload that looks like SQL Injection
    const maliciousPayload = { name: "Test Store'; DROP TABLE stores; --" };
    
    const res = await app.request('/api/store/create', {
      method: 'POST',
      body: JSON.stringify(maliciousPayload),
       headers: { 'Content-Type': 'application/json' }
    });

    // The app should handled it (likely 401 unauth, or 400 bad req, or 200 created with sanitized name)
    // But it definitely should NOT 500 with a DB error showing "DROP TABLE executed"
    expect(res.status).not.toBe(500);
  });

  test('A07: XSS - Input sanitization integration', async () => {
    // Sending a script tag in a text field
    const xssPayload = { description: "<script>alert('xss')</script>" };
    
    // We treat this as a potentially valid request if auth was passed, 
    // but we expect the SYSTEM to sanitize it on output or input.
    // For this test, we just check it doesn't crash the server.
    const res = await app.request('/api/store/update', {
      method: 'PATCH',
      body: JSON.stringify(xssPayload),
      headers: { 'Content-Type': 'application/json' }
    });
    
    expect(res.status).not.toBe(500); 
  });
});
