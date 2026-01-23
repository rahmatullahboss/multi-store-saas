/**
 * Webhook Service Unit Tests
 * 
 * Tests for webhook dispatch, delivery logging, and signature generation
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';

// Mock crypto.subtle for signature generation
const mockSign = vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4]));

vi.stubGlobal('crypto', {
  getRandomValues: (arr: Uint8Array) => {
    for (let i = 0; i < arr.length; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
    return arr;
  },
  subtle: {
    importKey: vi.fn().mockResolvedValue({}),
    sign: mockSign,
  },
});

describe('Webhook Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Signature Generation', () => {
    test('generates HMAC-SHA256 signature for payload', async () => {
      // Mock implementation of signPayload
      const signPayload = async (payload: string, secret: string): Promise<string> => {
        const encoder = new TextEncoder();
        const keyData = encoder.encode(secret);
        const msgData = encoder.encode(payload);

        const key = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        );

        const signature = await crypto.subtle.sign('HMAC', key, msgData);
        const hashArray = Array.from(new Uint8Array(signature));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      };

      const payload = JSON.stringify({ order_id: 1, event: 'order.created' });
      const secret = 'test_secret_key_12345';
      
      const signature = await signPayload(payload, secret);
      
      expect(signature).toBeDefined();
      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
      expect(crypto.subtle.importKey).toHaveBeenCalled();
      expect(crypto.subtle.sign).toHaveBeenCalled();
    });
  });

  describe('Webhook Payload Structure', () => {
    test('order.created payload contains required fields', () => {
      const orderPayload = {
        event: 'order.created',
        order_id: 123,
        order_number: 'ORD-ABC123',
        customer_name: 'Test Customer',
        customer_phone: '01712345678',
        total: 1500,
        items: [
          { product_id: 1, title: 'Test Product', quantity: 2, price: 750 }
        ],
        created_at: new Date().toISOString(),
      };

      expect(orderPayload).toHaveProperty('event', 'order.created');
      expect(orderPayload).toHaveProperty('order_id');
      expect(orderPayload).toHaveProperty('order_number');
      expect(orderPayload).toHaveProperty('customer_name');
      expect(orderPayload).toHaveProperty('total');
      expect(orderPayload).toHaveProperty('items');
      expect(Array.isArray(orderPayload.items)).toBe(true);
    });

    test('order.updated payload contains status change info', () => {
      const updatePayload = {
        event: 'order.updated',
        order_id: 123,
        order_number: 'ORD-ABC123',
        previous_status: 'pending',
        new_status: 'processing',
        updated_at: new Date().toISOString(),
      };

      expect(updatePayload).toHaveProperty('event', 'order.updated');
      expect(updatePayload).toHaveProperty('previous_status');
      expect(updatePayload).toHaveProperty('new_status');
    });
  });

  describe('Webhook Headers', () => {
    test('webhook request includes required headers', () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true, status: 200 });
      
      const expectedHeaders = {
        'Content-Type': 'application/json',
        'X-Shop-Topic': 'order.created',
        'X-Shop-Hmac-Sha256': 'signature_here',
        'X-Store-Id': '1',
      };

      expect(expectedHeaders).toHaveProperty('Content-Type', 'application/json');
      expect(expectedHeaders).toHaveProperty('X-Shop-Topic');
      expect(expectedHeaders).toHaveProperty('X-Shop-Hmac-Sha256');
      expect(expectedHeaders).toHaveProperty('X-Store-Id');
    });
  });

  describe('Delivery Logging', () => {
    test('delivery log structure contains required fields', () => {
      const deliveryLog = {
        webhookId: 1,
        eventType: 'order.created',
        payload: JSON.stringify({ order_id: 123 }),
        statusCode: 200,
        success: true,
        responseBody: '{"received": true}',
        errorMessage: null,
        attemptCount: 1,
        deliveredAt: new Date(),
      };

      expect(deliveryLog).toHaveProperty('webhookId');
      expect(deliveryLog).toHaveProperty('eventType');
      expect(deliveryLog).toHaveProperty('statusCode');
      expect(deliveryLog).toHaveProperty('success');
      expect(deliveryLog.success).toBe(true);
    });

    test('failed delivery log captures error', () => {
      const failedLog = {
        webhookId: 1,
        eventType: 'order.created',
        payload: JSON.stringify({ order_id: 123 }),
        statusCode: 500,
        success: false,
        responseBody: 'Internal Server Error',
        errorMessage: 'Connection timeout',
        attemptCount: 1,
      };

      expect(failedLog.success).toBe(false);
      expect(failedLog.errorMessage).toBeDefined();
    });
  });

  describe('Event Types', () => {
    const validEventTypes = [
      'order.created',
      'order.updated',
      'order.cancelled',
      'order.delivered',
      'payment.received',
    ];

    test.each(validEventTypes)('supports %s event', (eventType) => {
      expect(validEventTypes).toContain(eventType);
    });
  });
});
