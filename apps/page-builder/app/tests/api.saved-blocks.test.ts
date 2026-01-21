import { describe, it, expect, vi, beforeEach } from 'vitest';
import { loader, action } from '../routes/api.saved-blocks';

// Mock auth
vi.mock('~/services/auth.server', () => ({
  getAuthFromSession: vi.fn(async () => ({ id: 1, storeId: 123 }))
}));

const mockDb = {
  prepare: vi.fn(() => ({
    bind: vi.fn(() => ({
      all: vi.fn(async () => ({ results: [] })),
      first: vi.fn(async () => null),
      run: vi.fn(async () => ({}))
    }))
  }))
};

const mockContext = { cloudflare: { env: { DB: mockDb } } } as any;

describe('api.saved-blocks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns blocks list', async () => {
    const request = new Request('http://localhost/api/saved-blocks?pageId=1');
    const res = await loader({ request, context: mockContext } as any);
    const data = await res.json();

    expect(data.blocks).toEqual([]);
  });

  it('creates block successfully', async () => {
    const request = new Request('http://localhost/api/saved-blocks', {
      method: 'POST',
      body: JSON.stringify({ name: 'Hero Block', content: '{}' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await action({ request, context: mockContext } as any);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('increments usage count (PATCH)', async () => {
    const request = new Request('http://localhost/api/saved-blocks?id=block-1', {
      method: 'PATCH'
    });

    const res = await action({ request, context: mockContext } as any);
    expect(res.status).toBe(200);
  });

  it('deletes block by id', async () => {
    // mock existing block
    mockDb.prepare = vi.fn(() => ({
      bind: vi.fn(() => ({
        first: vi.fn(async () => ({ id: 'block-1' })),
        run: vi.fn(async () => ({}))
      }))
    }));

    const request = new Request('http://localhost/api/saved-blocks?id=block-1', { method: 'DELETE' });
    const res = await action({ request, context: mockContext } as any);
    expect(res.status).toBe(200);
  });

  it('rejects POST without name', async () => {
    const request = new Request('http://localhost/api/saved-blocks', {
      method: 'POST',
      body: JSON.stringify({ content: '{}' }),
      headers: { 'Content-Type': 'application/json' }
    });

    const res = await action({ request, context: mockContext } as any);
    expect(res.status).toBe(400);
  });

  it('rejects DELETE without id', async () => {
    const request = new Request('http://localhost/api/saved-blocks', { method: 'DELETE' });
    const res = await action({ request, context: mockContext } as any);
    expect(res.status).toBe(400);
  });
});
