import { describe, it, expect, vi } from 'vitest';
import { v1Router } from '../../server/api/v1';

vi.mock('~/services/api.server', () => {
  const mockKey = {
    id: 1, storeId: 42, name: 'Test Key', keyPrefix: 'sk_live_test',
    scopes: ['fraud'],
    mode: 'live', planId: 2, expiresAt: null,
  };
  return {
    validateApiKey: vi.fn().mockResolvedValue(mockKey),
    authenticateApiKey: vi.fn().mockResolvedValue(mockKey),
  };
});

function makeEnv() {
  const kvData: Record<string, string> = {};
  return {
    DB: {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnValue({
          first: vi.fn().mockResolvedValue(null),
          run: vi.fn().mockResolvedValue({ success: true }),
        }),
      }),
    } as any,
    KV: {
      get: vi.fn(async (key: string, type?: string) => {
        const val = kvData[key];
        if (!val) return null;
        if (type === 'json') return JSON.parse(val);
        return val;
      }),
      put: vi.fn(async (key: string, value: string) => {
        kvData[key] = value;
      }),
      delete: vi.fn(async (key: string) => {
        delete kvData[key];
      }),
    } as any,
    API_KEY_SECRET: 'test-hmac-secret-32-bytes-minimum!!',
  };
}

describe('Fraud API OTP', () => {
  it('POST /api/v1/fraud/otp/send generates and stores a 4-digit OTP', async () => {
    const env = makeEnv();
    const res = await v1Router.request('/fraud/otp/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer sk_live_testkey123',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone: '01711223344' }),
    }, env);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.sent).toBe(true);
    expect(body.expires_in).toBe(600);

    // Check if OTP was stored in KV
    const kvCalls = env.KV.put.mock.calls;
    const otpEntry = kvCalls.find((call: any) => call[0].startsWith('otp:01711223344:42'));
    expect(otpEntry).toBeDefined();

    const storedData = JSON.parse(otpEntry[1]);
    expect(storedData.otp).toMatch(/^\d{4}$/);
    expect(storedData.attempts).toBe(0);
  });
});
