import { describe, it, expect, vi } from 'vitest';
import { recalculateCustomerSegment } from '../server/services/customer-segmentation';

// Mock DB Interface
const createMockDb = (orderStats: any, customerData: any) => {
  const getMock = vi.fn()
    .mockResolvedValueOnce(orderStats) // 1st call: Orders stats
    .mockResolvedValueOnce(customerData); // 2nd call: Customer profile

  const updateMock = vi.fn().mockReturnThis();
  const setMock = vi.fn().mockReturnThis();
  const whereMock = vi.fn().mockReturnThis();

  return {
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnValue({ get: getMock }), // handle .where().get()
    update: updateMock,
    set: setMock,
    // Helper to check update calls
    _updateMock: updateMock,
    _setMock: setMock
  } as any;
};

describe('Customer Segmentation Logic', () => {
  const storeId = 1;
  const customerId = 123;
  const now = new Date();
  const thirtyOneDaysAgo = new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000);
  const sixtyOneDaysAgo = new Date(now.getTime() - 61 * 24 * 60 * 60 * 1000);
  const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  it('should classify as VIP if total spent > 10,000', async () => {
    const mockDb = createMockDb(
      { totalSpent: 15000, orderCount: 2, lastOrderDate: tenDaysAgo },
      { id: customerId, createdAt: thirtyOneDaysAgo }
    );

    const segment = await recalculateCustomerSegment(mockDb, customerId, storeId);
    expect(segment).toBe('vip');
    expect(mockDb._setMock).toHaveBeenCalledWith(expect.objectContaining({ segment: 'vip' }));
  });

  it('should classify as VIP if order count > 5', async () => {
    const mockDb = createMockDb(
      { totalSpent: 500, orderCount: 6, lastOrderDate: tenDaysAgo },
      { id: customerId, createdAt: thirtyOneDaysAgo }
    );

    const segment = await recalculateCustomerSegment(mockDb, customerId, storeId);
    expect(segment).toBe('vip');
  });

  it('should classify as New if 0 orders and joined < 30 days ago', async () => {
    const mockDb = createMockDb(
      { totalSpent: 0, orderCount: 0, lastOrderDate: null },
      { id: customerId, createdAt: tenDaysAgo }
    );

    const segment = await recalculateCustomerSegment(mockDb, customerId, storeId);
    expect(segment).toBe('new');
  });

  it('should classify as Window Shopper if 0 orders and joined > 30 days ago', async () => {
    const mockDb = createMockDb(
      { totalSpent: 0, orderCount: 0, lastOrderDate: null },
      { id: customerId, createdAt: thirtyOneDaysAgo }
    );

    const segment = await recalculateCustomerSegment(mockDb, customerId, storeId);
    expect(segment).toBe('window_shopper');
  });

  it('should classify as Churn Risk if last order was > 60 days ago', async () => {
    const mockDb = createMockDb(
      { totalSpent: 500, orderCount: 3, lastOrderDate: sixtyOneDaysAgo },
      { id: customerId, createdAt: thirtyOneDaysAgo }
    );

    const segment = await recalculateCustomerSegment(mockDb, customerId, storeId);
    expect(segment).toBe('churn_risk');
  });

  it('should classify as Regular if active but not meeting other criteria', async () => {
    const mockDb = createMockDb(
      { totalSpent: 500, orderCount: 3, lastOrderDate: tenDaysAgo },
      { id: customerId, createdAt: thirtyOneDaysAgo }
    );

    const segment = await recalculateCustomerSegment(mockDb, customerId, storeId);
    expect(segment).toBe('regular');
  });
});
