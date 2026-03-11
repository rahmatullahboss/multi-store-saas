import { describe, it, expect, vi, beforeEach } from 'vitest';
import { action } from '~/routes/app.ab-tests.new.tsx';
import { requireTenant } from '~/lib/tenant-guard.server';
import { drizzle } from 'drizzle-orm/d1';
import { abTests, abTestVariants } from '@db/schema';

vi.mock('~/lib/tenant-guard.server', () => ({
  requireTenant: vi.fn(),
}));

vi.mock('drizzle-orm/d1', () => ({
  drizzle: vi.fn(),
}));

describe('New AB Test Action', () => {
  it('batches variant inserts', async () => {
    const mockStoreId = 1;
    const mockTestId = 123;

    vi.mocked(requireTenant).mockResolvedValue({
      storeId: mockStoreId,
      userId: 1,
    } as any);

    const mockInsertAbTest = {
      values: vi.fn().mockReturnThis(),
      returning: vi.fn().mockResolvedValue([{ id: mockTestId }]),
    };

    const mockInsertAbTestVariants = {
      values: vi.fn().mockResolvedValue({ success: true }),
    };

    const mockDb = {
      insert: vi.fn((table) => {
        if (table === abTests) return mockInsertAbTest;
        if (table === abTestVariants) return mockInsertAbTestVariants;
        return {};
      }),
    };

    vi.mocked(drizzle).mockReturnValue(mockDb as any);

    const formData = new FormData();
    formData.append('name', 'Test AB Test');
    formData.append('variantName', 'Variant A');
    formData.append('variantWeight', '50');
    formData.append('variantConfig', 'configA');
    formData.append('variantName', 'Variant B');
    formData.append('variantWeight', '50');
    formData.append('variantConfig', 'configB');

    const request = new Request('http://localhost/app/ab-tests/new', {
      method: 'POST',
      body: formData,
    });

    const context = {
      cloudflare: {
        env: {
          DB: {},
        },
      },
    } as any;

    await action({ request, context });

    expect(mockDb.insert).toHaveBeenCalledWith(abTestVariants);
    expect(mockInsertAbTestVariants.values).toHaveBeenCalledWith([
      {
        testId: mockTestId,
        name: 'Variant A',
        trafficWeight: 50,
        landingConfig: 'configA',
      },
      {
        testId: mockTestId,
        name: 'Variant B',
        trafficWeight: 50,
        landingConfig: 'configB',
      },
    ]);
    // Ensure it was called once (batched) and not twice (N+1)
    expect(mockInsertAbTestVariants.values).toHaveBeenCalledTimes(1);
  });
});
