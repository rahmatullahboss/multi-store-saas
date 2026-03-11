import { describe, it, expect } from 'vitest';
import {
  parseShippingConfig,
  calculateShipping,
  getShippingEstimate,
  DEFAULT_SHIPPING_CONFIG,
} from '~/utils/shipping';

describe('shipping utility functions', () => {
  describe('parseShippingConfig', () => {
    it('should parse valid JSON shipping config', () => {
      const configStr = JSON.stringify({
        insideDhaka: 50,
        outsideDhaka: 100,
        freeShippingAbove: 1000,
        enabled: true,
      });
      const result = parseShippingConfig(configStr);
      expect(result).toEqual({
        insideDhaka: 50,
        outsideDhaka: 100,
        freeShippingAbove: 1000,
        enabled: true,
      });
    });

    it('should handle missing or invalid values by falling back to defaults', () => {
      const configStr = JSON.stringify({
        insideDhaka: 50,
        // missing outsideDhaka
      });
      const result = parseShippingConfig(configStr);
      expect(result.insideDhaka).toBe(50);
      expect(result.outsideDhaka).toBe(DEFAULT_SHIPPING_CONFIG.outsideDhaka);
      expect(result.enabled).toBe(true);
    });

    it('should return default config on invalid JSON', () => {
      expect(parseShippingConfig('invalid-json')).toEqual(DEFAULT_SHIPPING_CONFIG);
    });

    it('should return default config on null or undefined', () => {
      expect(parseShippingConfig(null)).toEqual(DEFAULT_SHIPPING_CONFIG);
      expect(parseShippingConfig(undefined)).toEqual(DEFAULT_SHIPPING_CONFIG);
    });
  });

  describe('calculateShipping', () => {
    const config = {
      insideDhaka: 60,
      outsideDhaka: 120,
      freeShippingAbove: 2000,
      enabled: true,
    };

    it('should calculate shipping for inside Dhaka', () => {
      const result = calculateShipping(config, 'dhaka', 1000);
      expect(result).toEqual({ cost: 60, isFree: false, label: 'ঢাকার ভেতরে' });
    });

    it('should calculate shipping for outside Dhaka', () => {
      const result = calculateShipping(config, 'sylhet', 1000);
      expect(result).toEqual({ cost: 120, isFree: false, label: 'ঢাকার বাইরে' });
    });

    it('should apply free shipping above threshold', () => {
      const result = calculateShipping(config, 'chittagong', 2500);
      expect(result).toEqual({ cost: 0, isFree: true, label: 'ফ্রি ডেলিভারি (৳2000+ অর্ডারে)' });
    });

    it('should return zero cost when shipping is disabled', () => {
      const disabledConfig = { ...config, enabled: false };
      const result = calculateShipping(disabledConfig, 'dhaka', 500);
      expect(result).toEqual({ cost: 0, isFree: true, label: 'ফ্রি ডেলিভারি' });
    });

    it('should not apply free shipping if threshold is 0', () => {
      const noFreeConfig = { ...config, freeShippingAbove: 0 };
      const result = calculateShipping(noFreeConfig, 'dhaka', 5000);
      expect(result).toEqual({ cost: 60, isFree: false, label: 'ঢাকার ভেতরে' });
    });
  });

  describe('getShippingEstimate', () => {
    it('should return inside Dhaka estimate for Dhaka', () => {
      const result = getShippingEstimate('dhaka');
      expect(result).toBe('২৪ ঘণ্টার মধ্যে ডেলিভারি');
    });

    it('should return outside Dhaka estimate for other divisions', () => {
      const result = getShippingEstimate('khulna');
      expect(result).toBe('২-৩ কার্যদিবসে ডেলিভারি');
    });

    it('should return outside Dhaka estimate for unknown division', () => {
      const result = getShippingEstimate('unknown-division');
      expect(result).toBe('২-৩ কার্যদিবসে ডেলিভারি');
    });
  });
});
