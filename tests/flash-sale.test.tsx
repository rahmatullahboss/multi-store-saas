import { renderHook, act } from '@testing-library/react';
import { useProductPrice } from '../app/hooks/useProductPrice';
import { StoreConfigProvider } from '../app/contexts/StoreConfigContext';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

// Mock Data
const mockProduct = {
  id: 'p1',
  title: 'Test Product',
  price: 100,
  compareAtPrice: 150,
  currency: 'USD',
  reviews: 10,
  rating: 4.5,
  description: 'Desc',
  vendor: 'Vendor',
  images: ['img1.jpg'],
};

const mockConfigEnabled = {
  primaryColor: '#000000',
  accentColor: '#ffffff',
  flashSale: {
    isActive: true,
    discountPercentage: 20, // 20% off
    endTime: '2026-12-31T23:59:59Z',
    text: 'Flash Sale!',
    backgroundColor: '#000',
    textColor: '#fff',
  },
  trustBadges: { showPaymentIcons: true, showGuaranteeSeals: true },
  marketingPopup: { isActive: false },
};

const mockConfigDisabled = {
  ...mockConfigEnabled,
  flashSale: { ...mockConfigEnabled.flashSale, isActive: false },
};

describe('Flash Sale Logic (useProductPrice)', () => {
  it('should return regular price when flash sale is disabled', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <StoreConfigProvider config={mockConfigDisabled}>
        {children}
      </StoreConfigProvider>
    );

    const { result } = renderHook(() => useProductPrice(mockProduct), { wrapper });

    expect(result.current.price).toBe(100);
    expect(result.current.originalPrice).toBe(100); 
    expect(result.current.compareAtPrice).toBe(150);
    expect(result.current.discountPercentage).toBe(33); // (150-100)/150 * 100 = 33.33 -> 33
    expect(result.current.isOnSale).toBe(true);
  });

  it('should apply flash sale discount when enabled', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <StoreConfigProvider config={mockConfigEnabled}>
        {children}
      </StoreConfigProvider>
    );

    const { result } = renderHook(() => useProductPrice(mockProduct), { wrapper });

    // 20% off $100 = $80
    expect(result.current.price).toBe(80);
    // 20% off $100 = $80
    expect(result.current.price).toBe(80); 
    expect(result.current.originalPrice).toBe(100); // Base selling price
    // compareAtPrice should be the base price (100) to show the immediate discount
    expect(result.current.compareAtPrice).toBe(100); 
    expect(result.current.discountPercentage).toBe(20);
    expect(result.current.isOnSale).toBe(true);
    expect(result.current.isFlashSale).toBe(true);
  });
});
