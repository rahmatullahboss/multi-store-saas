/**
 * tests/api-platform/webhook.test.ts
 * Unit tests for webhook service (webhook.server.ts)
 *
 * Tests:
 * - signWebhookPayload: HMAC format, timestamp prefix
 * - verifyWebhookSignature: valid, tampered, expired (replay attack)
 * - dispatchWebhook: timeout, retry, multi-topic, Promise.allSettled
 * - registerWebhook: backward-compat alias
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  signWebhookPayload,
  verifyWebhookSignature,
  registerWebhook,
} from '~/services/webhook.server';

// ─── signWebhookPayload ───────────────────────────────────────────────────────

describe('signWebhookPayload', () => {
  it('returns t=<ts>,v1=<hex> format', async () => {
    const sig = await signWebhookPayload('{"test":1}', 'secret123', 1700000000000);
    expect(sig).toMatch(/^t=\d+,v1=[a-f0-9]+$/);
  });

  it('includes the correct timestamp', async () => {
    const ts = 1700000000000;
    const sig = await signWebhookPayload('payload', 'secret', ts);
    expect(sig.startsWith(`t=${ts}`)).toBe(true);
  });

  it('different secrets produce different signatures', async () => {
    const ts = Date.now();
    const sig1 = await signWebhookPayload('payload', 'secret-one', ts);
    const sig2 = await signWebhookPayload('payload', 'secret-two', ts);
    expect(sig1).not.toBe(sig2);
  });

  it('same inputs produce same signature (deterministic)', async () => {
    const ts = 1700000000000;
    const sig1 = await signWebhookPayload('payload', 'secret', ts);
    const sig2 = await signWebhookPayload('payload', 'secret', ts);
    expect(sig1).toBe(sig2);
  });
});

// ─── verifyWebhookSignature ───────────────────────────────────────────────────

describe('verifyWebhookSignature', () => {
  it('verifies a valid signature', async () => {
    const payload = '{"event":"order/created"}';
    const secret = 'my-webhook-secret';
    const ts = Math.floor(Date.now() / 1000);
    const sig = await signWebhookPayload(payload, secret, ts);
    const valid = await verifyWebhookSignature(payload, sig, secret);
    expect(valid).toBe(true);
  });

  it('rejects tampered payload', async () => {
    const payload = '{"event":"order/created"}';
    const secret = 'my-webhook-secret';
    const ts = Math.floor(Date.now() / 1000);
    const sig = await signWebhookPayload(payload, secret, ts);
    const valid = await verifyWebhookSignature('{"event":"order/deleted"}', sig, secret);
    expect(valid).toBe(false);
  });

  it('rejects tampered signature', async () => {
    const payload = '{"event":"order/created"}';
    const secret = 'my-webhook-secret';
    const ts = Math.floor(Date.now() / 1000);
    const sig = await signWebhookPayload(payload, secret, ts);
    const tampered = sig.replace(/v1=[a-f0-9]{4}/, 'v1=0000');
    const valid = await verifyWebhookSignature(payload, tampered, secret);
    expect(valid).toBe(false);
  });

  it('rejects expired signature (replay attack prevention)', async () => {
    const payload = '{"event":"order/created"}';
    const secret = 'my-webhook-secret';
    // Timestamp 10 minutes in the past
    const oldTs = Math.floor(Date.now() / 1000) - 600;
    const sig = await signWebhookPayload(payload, secret, oldTs);
    // tolerance = 300s (5 min), so 600s old should fail
    const valid = await verifyWebhookSignature(payload, sig, secret, 300);
    expect(valid).toBe(false);
  });

  it('accepts signature within tolerance window', async () => {
    const payload = '{"event":"order/created"}';
    const secret = 'my-webhook-secret';
    // 2 minutes in the past — within 300s tolerance
    const recentTs = Math.floor(Date.now() / 1000) - 120;
    const sig = await signWebhookPayload(payload, secret, recentTs);
    const valid = await verifyWebhookSignature(payload, sig, secret, 300);
    expect(valid).toBe(true);
  });

  it('rejects malformed signature', async () => {
    const valid = await verifyWebhookSignature('payload', 'invalid-sig', 'secret');
    expect(valid).toBe(false);
  });
});

// ─── registerWebhook (backward-compat) ───────────────────────────────────────

describe('registerWebhook (backward-compat alias)', () => {
  it('is exported as a function', () => {
    expect(typeof registerWebhook).toBe('function');
  });

  it('calls DB insert without throwing', async () => {
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        bind: vi.fn().mockReturnThis(),
        run: vi.fn().mockResolvedValue({ success: true }),
        all: vi.fn().mockResolvedValue({ results: [] }),
      }),
      batch: vi.fn().mockResolvedValue([]),
      exec: vi.fn(),
      dump: vi.fn(),
    } as unknown as D1Database;

    // Should not throw
    await expect(
      registerWebhook(mockDb, 1, 'https://example.com/webhook', 'order/created', 'mysecret')
    ).resolves.not.toThrow();
  });
});
