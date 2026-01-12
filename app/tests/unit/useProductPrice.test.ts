import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProductPrice } from '../../hooks/useProductPrice';
import { useStoreConfig } from '../../contexts/StoreConfigContext';

// Mock the StoreConfigContext
vi.mock('../../contexts/StoreConfigContext', () => ({
  useStoreConfig: vi.fn(),
}));

describe('useProductPrice Hook', () => {
  const mockUseStoreConfig = useStoreConfig as unknown as ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Default config: no active flash sale
    mockUseStoreConfig.mockReturnValue({
      config: {
        flashSale: {
          isActive: false,
          discountPercentage: 0,
        },
      },
    });
    
    // Mock Date to ensure deterministic tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  test('returns original price when no discounts applied', () => {
    const product = { price: 1000, compareAtPrice: null };
    const { result } = renderHook(() => useProductPrice(product));

    expect(result.current.price).toBe(1000);
    expect(result.current.originalPrice).toBe(1000);
    expect(result.current.compareAtPrice).toBeNull();
    expect(result.current.discountPercentage).toBe(0);
    expect(result.current.isFlashSale).toBe(false);
    expect(result.current.isOnSale).toBe(false);
  });

  test('correctly identifies regular sale (compareAtPrice > price)', () => {
    const product = { price: 800, compareAtPrice: 1000 };
    const { result } = renderHook(() => useProductPrice(product));

    expect(result.current.price).toBe(800);
    expect(result.current.isOnSale).toBe(true);
    // Regular sale logic doesn't calculate discount percentage in the hook currently, 
    // it only does so for Flash Sales. This is expected based on current implementation.
    expect(result.current.isFlashSale).toBe(false);
  });

  describe('Flash Sale Logic', () => {
    test('applies percentage-based flash sale correctly', () => {
      mockUseStoreConfig.mockReturnValue({
        config: {
          flashSale: {
            isActive: true,
            discountPercentage: 20,
            discountType: 'percent',
            endTime: '2025-01-02T12:00:00Z', // Future date
          },
        },
      });

      const product = { price: 1000, compareAtPrice: null };
      const { result } = renderHook(() => useProductPrice(product));

      // 20% off 1000 = 800
      expect(result.current.price).toBe(800);
      expect(result.current.isFlashSale).toBe(true);
      expect(result.current.discountPercentage).toBe(20);
      // Logic says compareAt becomes the original price during flash sale
      expect(result.current.compareAtPrice).toBe(1000);
      expect(result.current.isOnSale).toBe(true);
    });

    test('applies fixed-amount flash sale correctly', () => {
      mockUseStoreConfig.mockReturnValue({
        config: {
          flashSale: {
            isActive: true,
            discountPercentage: 200, // Using the same field for amount based on type
            discountType: 'fixed',
            endTime: '2025-01-02T12:00:00Z',
          },
        },
      });

      const product = { price: 1000, compareAtPrice: null };
      const { result } = renderHook(() => useProductPrice(product));

      // 1000 - 200 = 800
      expect(result.current.price).toBe(800);
      expect(result.current.discountPercentage).toBe(20); // (200/1000)*100
    });

    test('does NOT apply flash sale if expired', () => {
      mockUseStoreConfig.mockReturnValue({
        config: {
          flashSale: {
            isActive: true,
            discountPercentage: 50,
            endTime: '2024-12-31T23:59:59Z', // Past date
          },
        },
      });

      const product = { price: 1000, compareAtPrice: null };
      const { result } = renderHook(() => useProductPrice(product));

      expect(result.current.price).toBe(1000);
      expect(result.current.isFlashSale).toBe(false);
    });

    test('does NOT apply flash sale if isActive is false', () => {
      mockUseStoreConfig.mockReturnValue({
        config: {
          flashSale: {
            isActive: false,
            discountPercentage: 50,
          },
        },
      });

      const { result } = renderHook(() => useProductPrice({ price: 1000, compareAtPrice: null }));
      expect(result.current.isFlashSale).toBe(false);
    });
    
    test('handles product already on sale + Flash Sale interaction', () => {
        // Product: Was 1000, Now 800 (Regular Sale)
        // Flash Sale: 25% OFF
        // Logic: 25% off the CURRENT price (800) -> 600
        // CompareAt should show 800 (the price it was just dropped from)
        
        mockUseStoreConfig.mockReturnValue({
            config: {
              flashSale: {
                isActive: true,
                discountPercentage: 25,
                discountType: 'percent'
              },
            },
        });
        
        const product = { price: 800, compareAtPrice: 1000 };
        const { result } = renderHook(() => useProductPrice(product));
        
        // 800 * 0.75 = 600
        expect(result.current.price).toBe(600);
        expect(result.current.originalPrice).toBe(800); 
        expect(result.current.compareAtPrice).toBe(800); // Strikethrough immediate price
        expect(result.current.isFlashSale).toBe(true);
    });
  });
  
  test('handles zero price gracefully', () => {
      mockUseStoreConfig.mockReturnValue({
        config: { flashSale: { isActive: true, discountPercentage: 10 } },
      });
      
      const { result } = renderHook(() => useProductPrice({ price: 0, compareAtPrice: null }));
      expect(result.current.price).toBe(0);
      expect(result.current.discountPercentage).toBe(10);
  });
});
