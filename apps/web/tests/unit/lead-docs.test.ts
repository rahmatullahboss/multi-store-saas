
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockContext } from '../setup';
// We need to import action AFTER mocking
import type { ActionFunctionArgs } from '@remix-run/cloudflare';

const mocks = vi.hoisted(() => {
    return {
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn(),
        insert: vi.fn().mockReturnThis(),
        values: vi.fn().mockResolvedValue({ success: true }),
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnValue([{ id: 1, storeId: 'store_123' }]),
        deleteDb: vi.fn().mockReturnThis(),
        getCustomerId: vi.fn().mockResolvedValue(1),
        getCustomerStoreId: vi.fn().mockResolvedValue('store_123'),
    };
});

// Mock dependencies
vi.mock('~/services/customer-auth.server', () => ({
    getCustomerId: mocks.getCustomerId,
    getCustomerStoreId: mocks.getCustomerStoreId,
}));

vi.mock('~/lib/db.server', () => ({
    createDb: vi.fn().mockReturnValue({
        select: mocks.select,
        from: mocks.from,
        where: mocks.where,
        limit: mocks.limit,
        insert: mocks.insert,
        values: mocks.values,
        delete: mocks.deleteDb,
    }),
}));

// Now import the action
import { action } from '../../app/routes/api.student-document';

describe('Lead Document API', () => {
    let mockContext: any;

    beforeEach(() => {
        vi.clearAllMocks(); // Clear history between tests
        
        mockContext = createMockContext();
        mockContext.cloudflare.env.R2 = {
            put: mocks.put,
            delete: mocks.delete,
        };
        mockContext.cloudflare.env.R2_PUBLIC_URL = 'https://r2.example.com';
        
        // Reset specific mock implementations if needed
        mocks.limit.mockReturnValue([{ id: 1, storeId: 'store_123' }]);
    });


    it('should preserve original filename in database', async () => {
        const mockFile = {
            name: 'Original_User_Filename.pdf',
            type: 'application/pdf',
            size: 1000,
            arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
        };
        
        const mockFormData = {
            get: vi.fn((key) => {
                if (key === 'file') return mockFile;
                if (key === 'documentType') return 'transcript';
                return null;
            }),
        };

        const request = {
            method: 'POST',
            formData: vi.fn().mockResolvedValue(mockFormData),
        } as unknown as Request;

        const response = await action({ request, context: mockContext, params: {} } as ActionFunctionArgs);
        const data = await response.json() as any;

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);

        // Verify R2 put was called
        expect(mocks.put).toHaveBeenCalled();
        const putCall = mocks.put.mock.calls[0];
        const key = putCall[0];
        // Ensure extension is preserved (pdf)
        expect(key).toMatch(/\.pdf$/);

        // Verify DB insert checks
        expect(mocks.insert).toHaveBeenCalled();
        expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({
            fileName: 'Original_User_Filename.pdf', // Verification of the fix
            fileKey: expect.any(String),
        }));
    });
});
