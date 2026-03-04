
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockContext } from '../setup';
import type { ActionFunctionArgs } from '@remix-run/cloudflare';

const mocks = vi.hoisted(() => {
    return {
        update: vi.fn(),
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        getCustomerId: vi.fn().mockResolvedValue(1),
        // Mock getStoreId to return 123
        getStoreId: vi.fn().mockResolvedValue(123),
        getUserId: vi.fn().mockResolvedValue(1),
        requireTenant: vi.fn().mockResolvedValue({ storeId: 123 }),
    };
});

vi.mock('~/lib/tenant-guard.server', () => ({
    requireTenant: mocks.requireTenant,
}));

vi.mock('~/services/auth.server', () => ({
    getUserId: mocks.getUserId,
    getStoreId: mocks.getStoreId,
}));

vi.mock('drizzle-orm/d1', () => ({
    drizzle: vi.fn().mockReturnValue({
        update: mocks.update.mockReturnThis(),
        set: mocks.set,
        where: mocks.where,
    }),
}));

// Import action after mocking
import { action } from '../../app/routes/app.leads.kanban';

describe('Lead Kanban API', () => {
    let mockContext: any;

    beforeEach(() => {
        vi.clearAllMocks();
        mockContext = createMockContext();
        // Reset mocks default behavior
        mocks.update.mockReturnThis();
    });

    it('should update lead status successfully', async () => {
        const formData = new FormData();
        formData.append('intent', 'update_status');
        formData.append('leadId', '101');
        formData.append('status', 'contacted');

        const request = new Request('http://localhost/app/leads/kanban', {
            method: 'POST',
            body: formData,
        });

        const response = await action({ request, context: mockContext, params: {} } as ActionFunctionArgs);
        const data = await response.json() as any;

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);

        expect(mocks.update).toHaveBeenCalled();
        expect(mocks.set).toHaveBeenCalledWith(expect.objectContaining({
            status: 'contacted',
            updatedAt: expect.any(Date),
        }));
    });

    it('should fail with invalid parameters', async () => {
        // Missing leadId
        const formData = new FormData();
        formData.append('intent', 'update_status');
        formData.append('status', 'contacted');

        const request = new Request('http://localhost/app/leads/kanban', {
            method: 'POST',
            body: formData,
        });

        const response = await action({ request, context: mockContext, params: {} } as ActionFunctionArgs);
        const data = await response.json() as any;

        expect(response.status).toBe(400); // Bad Request
        expect(data.error).toBeDefined();
    });
});
