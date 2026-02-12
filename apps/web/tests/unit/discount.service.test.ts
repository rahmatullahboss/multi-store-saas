import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateDiscount, getActiveFlashSale } from '../../server/services/discount.service';

// Mock DB interactions manually since we want to test pure logic with mocked data returns
const createTestDb = () => {
  const mockGet = vi.fn();
  const mockLimit = vi.fn(() => ({ get: mockGet }));
  const mockOrderBy = vi.fn(() => ({ limit: mockLimit }));
  const mockWhere = vi.fn(() => ({
      orderBy: mockOrderBy, // For complex queries
      get: mockGet, // For simple queries
  }));
  const mockFrom = vi.fn(() => ({ where: mockWhere, get: mockGet }));
  const mockSelect = vi.fn(() => ({ from: mockFrom }));

  return {
    select: mockSelect,
    mockGet, // Expose for test setup
    // Expose chain spies for assertions if needed
    mockFrom,
    mockWhere,
    mockOrderBy,
    mockLimit
  };
};

describe('Discount Service', () => {
  let db: any;

  beforeEach(() => {
    db = createTestDb();
    vi.clearAllMocks();
  });

  describe('validateDiscount', () => {
    it('should return error for invalid code', async () => {
      db.mockGet.mockResolvedValue(null);
      const result = await validateDiscount(db, 1, 'INVALID', 1000);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid discount code');
    });

    it('should calculate percentage discount correctly', async () => {
      db.mockGet.mockResolvedValue({
        id: 1,
        code: 'SAVE10',
        type: 'percentage',
        value: 10,
        isActive: true
      });

      const result = await validateDiscount(db, 1, 'SAVE10', 1000);
      expect(result.isValid).toBe(true);
      expect(result.discount?.amount).toBe(100); // 10% of 1000
    });

    it('should normalize code input before validating', async () => {
      db.mockGet.mockResolvedValue({
        id: 7,
        code: 'SAVE10',
        type: 'percentage',
        value: 10,
        isActive: true,
      });

      const result = await validateDiscount(db, 1, ' save10 ', 1000);
      expect(result.isValid).toBe(true);
      expect(result.discount?.code).toBe('SAVE10');
    });

    it('should cap percentage discount at maxDiscountAmount', async () => {
      db.mockGet.mockResolvedValue({
        id: 2,
        code: 'HUGE50',
        type: 'percentage',
        value: 50,
        maxDiscountAmount: 200, // Cap at 200
        isActive: true
      });

      const result = await validateDiscount(db, 1, 'HUGE50', 1000); // 50% = 500, but cap is 200
      expect(result.isValid).toBe(true);
      expect(result.discount?.amount).toBe(200);
    });

    it('should validate fixed amount discount', async () => {
      db.mockGet.mockResolvedValue({
        id: 3,
        code: 'FLAT100',
        type: 'fixed',
        value: 100,
        isActive: true
      });

      const result = await validateDiscount(db, 1, 'FLAT100', 500);
      expect(result.isValid).toBe(true);
      expect(result.discount?.amount).toBe(100);
    });

    it('should fail if minimum order amount not met', async () => {
      db.mockGet.mockResolvedValue({
        id: 4,
        code: 'MIN500',
        minOrderAmount: 500,
        isActive: true
      });

      const result = await validateDiscount(db, 1, 'MIN500', 400);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Minimum order amount 500 required');
    });

    it('should fail if usage limit reached', async () => {
        db.mockGet.mockResolvedValue({
          id: 5,
          code: 'LIMITED',
          maxUses: 100,
          usedCount: 100,
          isActive: true
        });
  
        const result = await validateDiscount(db, 1, 'LIMITED', 1000);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Discount usage limit reached');
      });

    it('should fail if expired', async () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        db.mockGet.mockResolvedValue({
          id: 6,
          code: 'EXPIRED',
          expiresAt: yesterday,
          isActive: true
        });
  
        const result = await validateDiscount(db, 1, 'EXPIRED', 1000);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe('Discount expired');
      });

    it('should enforce per-customer usage limit', async () => {
      db.mockGet
        .mockResolvedValueOnce({
          id: 8,
          code: 'ONCEONLY',
          type: 'percentage',
          value: 10,
          perCustomerLimit: 1,
          isActive: true,
        })
        .mockResolvedValueOnce({ count: 1 });

      const result = await validateDiscount(db, 1, 'ONCEONLY', 1000, '01700000000');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Per-customer usage limit reached');
    });
  });

  describe('getActiveFlashSale', () => {
      it('should return active flash sale', async () => {
          const sale = { id: 99, code: 'FLASH', value: 20 };
          db.mockGet.mockResolvedValue(sale);

          const result = await getActiveFlashSale(db, 1);
          expect(result).toEqual(sale);
          // Verify query chain logic
          expect(db.mockWhere).toHaveBeenCalled();
          expect(db.mockOrderBy).toHaveBeenCalled();
          expect(db.mockLimit).toHaveBeenCalled();
      });
  });
});
