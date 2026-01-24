import { describe, it, expect, vi, beforeEach } from 'vitest';
import { awardPoints, checkAndUpgradeTier } from '../../server/services/loyalty';
import { sendSMS } from '../../app/services/messaging.server';
import { customers, loyaltyTransactions } from '@db/schema';

// Mock Fetch for Messaging
global.fetch = vi.fn();

describe('Phase 14: Loyalty & Messaging', () => {
// Mock DB setup manually because createMockDb doesn't support our specific query patterns
const createTestDb = () => {
  const mockValues = vi.fn();
  const mockWhere = vi.fn().mockReturnValue({ success: true });
  const mockSet = vi.fn(() => ({ where: mockWhere }));
  const mockGet = vi.fn();

  return {
    mockValues,
    mockSet,
    mockWhere,
    mockGet,
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          get: mockGet,
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: mockValues,
    })),
    update: vi.fn(() => ({
      set: mockSet,
    })),
    delete: vi.fn(() => ({
      where: vi.fn(),
    })),
    query: {
      stores: {
        findFirst: vi.fn(),
      },
      agents: {
        findFirst: vi.fn(),
      },
    },
    transaction: async (cb: any) => cb(createTestDb()), // This needs careful handling if we want to spy on the inner db
  };
};

describe('Phase 14: Loyalty & Messaging', () => {
  let db: any;

  beforeEach(() => {
    db = createTestDb();
    vi.clearAllMocks();
  });

  describe('Loyalty Service', () => {
    it('should award points and create transaction', async () => {
      const storeId = 1;
      const customerId = 101;
      const points = 50;

      // For transaction, we need to pass our mock db into the callback.
      // But the recursive mock in createTestDb() creates a NEW db instance.
      // So db.mockValues won't be observing the calls inside transaction.
      // Fix: modify db.transaction to call back with THIS db instance (or a shared state mock).
      db.transaction = async (cb: any) => cb(db);

      // Mock DB Config & Data
      db.query.stores.findFirst.mockResolvedValue({
        loyaltyConfig: JSON.stringify({
            pointsRate: 1,
            tiers: { bronze: 0, silver: 500, gold: 1000, platinum: 5000 }
        })
      });

      // Chain: select().from().where().get()
      // Because we refactored createTestDb to return shared mocks, we can just spy on mockGet.
      db.mockGet.mockResolvedValueOnce({ totalSpent: 600, loyaltyTier: 'bronze' });

      await awardPoints(db, storeId, customerId, points, 'purchase', 'ORDER-123', 'Test Points');

      // Verify Insert
      expect(db.insert).toHaveBeenCalledWith(loyaltyTransactions);
      expect(db.mockValues).toHaveBeenCalledWith(expect.objectContaining({
        storeId,
        customerId,
        points,
        type: 'purchase',
        referenceId: 'ORDER-123'
      }));

      // Verify Customer Update
      expect(db.update).toHaveBeenCalledWith(customers);
    });

    it('should upgrade tier if spending threshold reached', async () => {
      const storeId = 1;
      const customerId = 102;

      // Config & Data
      // db.select...get() is shared mockGet now
      
      // 1. Customer Fetch
      db.mockGet.mockResolvedValueOnce({ totalSpent: 1500, loyaltyTier: 'silver' });
      // 2. Config Mock (if fetched via select, but getLoyaltyConfig uses query.stores? No it uses select)
      // Let's verify getLoyaltyConfig implementation. It uses `db.select...from(stores)...get()`.
      // So we need another mockGet result.
      db.mockGet.mockResolvedValueOnce({ 
        loyaltyConfig: JSON.stringify({ tiers: { bronze: 0, silver: 100, gold: 1000 } }) 
      });

      await checkAndUpgradeTier(db, storeId, customerId);

      // Should update to GOLD
      expect(db.update).toHaveBeenCalledWith(customers);
      expect(db.mockSet).toHaveBeenCalledWith(expect.objectContaining({
        loyaltyTier: 'gold'
      }));
    });
  });

  describe('Messaging Service', () => {
    it('should use store config for SSL Wireless', async () => {
      const storeId = 1;
      const payload = { to: '8801700000000', message: 'Test SMS', storeId };
      const env = { SMS_PROVIDER: 'ssl_wireless' } as any;

      db.query.stores.findFirst.mockResolvedValue({
        marketingConfig: JSON.stringify({
          sslWireless: { apiToken: 'DB_TOKEN', sid: 'DB_SID', domain: 'https://db.com' }
        })
      });

      await sendSMS(db, env, payload);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://db.com'),
        expect.objectContaining({
          body: expect.stringContaining('DB_TOKEN')
        })
      );
    });

    it('should fallback to ENV if store config missing', async () => {
        const storeId = 2;
        const payload = { to: '8801700000000', message: 'Test SMS', storeId };
        const env = { 
            SMS_PROVIDER: 'ssl_wireless',
            SSL_SMS_API_TOKEN: 'ENV_TOKEN',
            SSL_SMS_SID: 'ENV_SID',
            SSL_SMS_DOMAIN: 'https://env.com'
        } as any;
  
        db.query.stores.findFirst.mockResolvedValue(null);
  
        await sendSMS(db, env, payload);
  
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('https://env.com'),
          expect.objectContaining({
            body: expect.stringContaining('ENV_TOKEN')
          })
        );
      });
  });
});
});
